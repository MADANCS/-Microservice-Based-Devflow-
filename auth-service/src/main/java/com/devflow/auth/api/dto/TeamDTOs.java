package com.devflow.auth.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

public class TeamDTOs {

    @Data
    public static class CreateMemberRequest {
        @NotBlank
        private String name;

        @NotBlank @Email
        private String email;

        @NotBlank
        private String role; // OWNER, ADMIN, DEVELOPER, DESIGNER, VIEWER

        private String status; // ONLINE, AWAY, OFFLINE

        private List<String> skills;
        private List<String> projectsAssigned;
        private List<String> tasksAssigned;
    }

    @Data
    public static class UpdateMemberRequest {
        private String name;
        private String role;
        private String status;
        private List<String> skills;
        private List<String> projectsAssigned;
        private List<String> tasksAssigned;
    }

    @Data
    public static class MemberResponse {
        private String id;
        private String name;
        private String email;
        private String role;
        private String status;
        private String avatar;
        private String avatarGradient;
        private String joinedDate;
        private List<String> skills;
        private List<String> projectsAssigned;
        private List<String> tasksAssigned;
    }
}
