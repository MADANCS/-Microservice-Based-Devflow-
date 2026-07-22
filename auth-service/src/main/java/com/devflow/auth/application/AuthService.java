package com.devflow.auth.application;

import com.devflow.auth.api.dto.AuthDTOs;
import com.devflow.auth.api.mapper.UserMapper;
import com.devflow.auth.domain.model.Role;
import com.devflow.auth.domain.model.User;
import com.devflow.auth.domain.model.UserStatus;
import com.devflow.auth.domain.repository.UserRepository;
import com.devflow.auth.infrastructure.kafka.AuthEventPublisher;
import com.devflow.auth.infrastructure.redis.RefreshTokenStore;
import com.devflow.common.exception.DevFlowException;
import com.devflow.common.security.JwtTokenProvider;
import dev.samstevens.totp.code.CodeVerifier;
import dev.samstevens.totp.secret.SecretGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

/**
 * Core authentication application service.
 * Handles: register · login · refresh · logout · MFA · password reset
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenStore refreshTokenStore;
    private final AuthEventPublisher eventPublisher;
    private final UserMapper userMapper;
    private final SecretGenerator totpSecretGenerator;
    private final CodeVerifier totpCodeVerifier;

    // ── Register ─────────────────────────────────────────────
    public AuthDTOs.UserResponse register(AuthDTOs.RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw DevFlowException.conflict("Email already registered: " + req.getEmail());
        }
        if (userRepository.existsByUsername(req.getUsername())) {
            throw DevFlowException.conflict("Username already taken: " + req.getUsername());
        }

        Role userRole = Role.MEMBER;
        if (req.getRole() != null) {
            try {
                userRole = Role.valueOf(req.getRole().toUpperCase());
            } catch (IllegalArgumentException e) {
                userRole = Role.MEMBER;
            }
        }

        User user = User.builder()
                .email(req.getEmail().toLowerCase())
                .username(req.getUsername())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .fullName(req.getFullName())
                .timezone(req.getTimezone())
                .role(userRole)
                .status(UserStatus.ACTIVE)   // skip email verify for now; production adds it
                .build();

        user = userRepository.save(user);
        log.info("New user registered: {}", user.getEmail());

        eventPublisher.publishUserRegistered(user);
        return userMapper.toUserResponse(user);
    }

    // ── Login ────────────────────────────────────────────────
    public AuthDTOs.AuthResponse login(AuthDTOs.LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail().toLowerCase())
                .orElseThrow(() -> DevFlowException.badRequest("Invalid email or password"));

        if (!user.isAccountNonLocked()) {
            throw DevFlowException.badRequest("Account is temporarily locked. Try again later.");
        }

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            user.recordFailedLogin();
            userRepository.save(user);
            throw DevFlowException.badRequest("Invalid email or password");
        }

        // MFA check
        if (user.isMfaEnabled()) {
            if (req.getMfaCode() == null || req.getMfaCode().isBlank()) {
                return AuthDTOs.AuthResponse.mfaChallenge(user.getId().toString());
            }
            if (!totpCodeVerifier.isValidCode(user.getMfaSecret(), req.getMfaCode())) {
                throw DevFlowException.badRequest("Invalid MFA code");
            }
        }

        user.recordSuccessfulLogin();
        userRepository.save(user);

        String accessToken  = jwtTokenProvider.generateAccessToken(
                user.getId().toString(), user.getEmail(), user.getRole().name(), Map.of());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId().toString());

        refreshTokenStore.save(user.getId().toString(), refreshToken);
        eventPublisher.publishUserLogin(user);

        AuthDTOs.AuthResponse response = new AuthDTOs.AuthResponse();
        response.setAccessToken(accessToken);
        response.setRefreshToken(refreshToken);
        response.setExpiresIn(3600);
        response.setUser(userMapper.toUserResponse(user));
        return response;
    }

    // ── Refresh Token ─────────────────────────────────────────
    public AuthDTOs.AuthResponse refresh(AuthDTOs.RefreshTokenRequest req) {
        if (!jwtTokenProvider.isTokenValid(req.getRefreshToken())) {
            throw DevFlowException.badRequest("Refresh token is expired or invalid");
        }

        String userId = jwtTokenProvider.extractUserId(req.getRefreshToken());

        if (!refreshTokenStore.isValid(userId, req.getRefreshToken())) {
            throw DevFlowException.badRequest("Refresh token has been revoked");
        }

        User user = userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> DevFlowException.notFound("User", userId));

        String newAccessToken  = jwtTokenProvider.generateAccessToken(
                userId, user.getEmail(), user.getRole().name(), Map.of());
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(userId);

        refreshTokenStore.rotate(userId, newRefreshToken);

        AuthDTOs.AuthResponse response = new AuthDTOs.AuthResponse();
        response.setAccessToken(newAccessToken);
        response.setRefreshToken(newRefreshToken);
        response.setExpiresIn(3600);
        response.setUser(userMapper.toUserResponse(user));
        return response;
    }

    // ── Logout ───────────────────────────────────────────────
    public void logout(String userId, String accessToken) {
        refreshTokenStore.revoke(userId);
        long ttl = jwtTokenProvider.getExpirationMillis(accessToken) - System.currentTimeMillis();
        if (ttl > 0) {
            refreshTokenStore.blacklistToken(accessToken, ttl);
        }
        log.info("User {} logged out", userId);
    }

    // ── MFA Setup ────────────────────────────────────────────
    public AuthDTOs.MfaSetupResponse setupMfa(String userId) {
        User user = findUser(userId);
        String secret = totpSecretGenerator.generate();
        user.setMfaSecret(secret);
        userRepository.save(user);

        String qrUrl = "otpauth://totp/DevFlow:" + user.getEmail()
                + "?secret=" + secret + "&issuer=DevFlow";

        AuthDTOs.MfaSetupResponse resp = new AuthDTOs.MfaSetupResponse();
        resp.setSecret(secret);
        resp.setQrCodeUrl(qrUrl);
        resp.setBackupCodes(generateBackupCodes());
        return resp;
    }

    public void enableMfa(String userId, String totpCode) {
        User user = findUser(userId);
        if (user.getMfaSecret() == null) {
            throw DevFlowException.badRequest("Call /mfa/setup first to get a secret");
        }
        if (!totpCodeVerifier.isValidCode(user.getMfaSecret(), totpCode)) {
            throw DevFlowException.badRequest("Invalid TOTP code");
        }
        user.setMfaEnabled(true);
        userRepository.save(user);
        log.info("MFA enabled for user {}", userId);
    }

    // ── Change Password ───────────────────────────────────────
    public void changePassword(String userId, AuthDTOs.ChangePasswordRequest req) {
        User user = findUser(userId);
        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPasswordHash())) {
            throw DevFlowException.badRequest("Current password is incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
        refreshTokenStore.revoke(userId);  // revoke all sessions on password change
        log.info("Password changed for user {}", userId);
    }

    // ── Helpers ───────────────────────────────────────────────
    private User findUser(String userId) {
        return userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> DevFlowException.notFound("User", userId));
    }

    private String[] generateBackupCodes() {
        String[] codes = new String[8];
        for (int i = 0; i < 8; i++) {
            codes[i] = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }
        return codes;
    }
}
