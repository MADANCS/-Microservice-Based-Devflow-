package com.devflow.auth.api.controller;

import com.devflow.auth.api.dto.AuthDTOs;
import com.devflow.auth.application.AuthService;
import com.devflow.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for authentication — 6 API endpoints.
 * POST /api/v1/auth/register
 * POST /api/v1/auth/login
 * POST /api/v1/auth/refresh
 * POST /api/v1/auth/logout
 * POST /api/v1/auth/mfa/setup
 * POST /api/v1/auth/mfa/enable
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "JWT auth, OAuth2, and MFA endpoints")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    public ResponseEntity<ApiResponse<AuthDTOs.UserResponse>> register(
            @Valid @RequestBody AuthDTOs.RegisterRequest request) {
        AuthDTOs.UserResponse user = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(user));
    }

    @PostMapping("/login")
    @Operation(summary = "Login with email/password (+ optional MFA code)")
    public ResponseEntity<ApiResponse<AuthDTOs.AuthResponse>> login(
            @Valid @RequestBody AuthDTOs.LoginRequest request) {
        AuthDTOs.AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token using a valid refresh token")
    public ResponseEntity<ApiResponse<AuthDTOs.AuthResponse>> refresh(
            @Valid @RequestBody AuthDTOs.RefreshTokenRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(authService.refresh(request)));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout and revoke all tokens")
    public ResponseEntity<ApiResponse<Void>> logout(
            @RequestHeader("Authorization") String authHeader,
            @RequestHeader("X-User-Id") String userId) {
        String token = authHeader.substring(7);
        authService.logout(userId, token);
        return ResponseEntity.ok(ApiResponse.deleted());
    }

    @PostMapping("/mfa/setup")
    @Operation(summary = "Initialize MFA — returns TOTP secret and QR code URL")
    public ResponseEntity<ApiResponse<AuthDTOs.MfaSetupResponse>> setupMfa(
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(ApiResponse.ok(authService.setupMfa(userId)));
    }

    @PostMapping("/mfa/enable")
    @Operation(summary = "Confirm and enable MFA by verifying the TOTP code")
    public ResponseEntity<ApiResponse<Void>> enableMfa(
            @RequestHeader("X-User-Id") String userId,
            @Valid @RequestBody AuthDTOs.EnableMfaRequest request) {
        authService.enableMfa(userId, request.getTotpCode());
        return ResponseEntity.ok(ApiResponse.ok("MFA enabled successfully", null));
    }

    @PostMapping("/password/change")
    @Operation(summary = "Change password for authenticated user")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @RequestHeader("X-User-Id") String userId,
            @Valid @RequestBody AuthDTOs.ChangePasswordRequest request) {
        authService.changePassword(userId, request);
        return ResponseEntity.ok(ApiResponse.ok("Password changed successfully", null));
    }
}
