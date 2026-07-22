package com.devflow.auth.api.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

public class AuthDTOs {

    // ── Request DTOs ─────────────────────────────────

    @Data
    public static class RegisterRequest {
        @NotBlank @Email
        private String email;

        @NotBlank @Size(min = 3, max = 50)
        @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username can only contain letters, numbers, and underscores")
        private String username;

        @NotBlank @Size(min = 8, max = 100)
        private String password;

        @NotBlank @Size(max = 100)
        private String fullName;

        private String timezone;

        private String role;
    }

    @Data
    public static class LoginRequest {
        @NotBlank @Email
        private String email;

        @NotBlank
        private String password;

        private String mfaCode;  // optional; required only if MFA enabled
    }

    @Data
    public static class RefreshTokenRequest {
        @NotBlank
        private String refreshToken;
    }

    @Data
    public static class ChangePasswordRequest {
        @NotBlank
        private String currentPassword;

        @NotBlank @Size(min = 8)
        private String newPassword;
    }

    @Data
    public static class ForgotPasswordRequest {
        @NotBlank @Email
        private String email;
    }

    @Data
    public static class ResetPasswordRequest {
        @NotBlank
        private String token;

        @NotBlank @Size(min = 8)
        private String newPassword;
    }

    @Data
    public static class EnableMfaRequest {
        @NotBlank @Size(min = 6, max = 6)
        private String totpCode;
    }

    // ── Response DTOs ────────────────────────────────

    @Data
    public static class AuthResponse {
        private String accessToken;
        private String refreshToken;
        private long expiresIn;
        private UserResponse user;
        private boolean mfaRequired;

        public static AuthResponse mfaChallenge(String userId) {
            AuthResponse r = new AuthResponse();
            r.mfaRequired = true;
            return r;
        }
    }

    @Data
    public static class UserResponse {
        private String id;
        private String email;
        private String username;
        private String fullName;
        private String avatarUrl;
        private String role;
        private String status;
        private boolean mfaEnabled;
        private String createdAt;
        private String lastLoginAt;
    }

    @Data
    public static class MfaSetupResponse {
        private String secret;
        private String qrCodeUrl;
        private String[] backupCodes;
    }
}
