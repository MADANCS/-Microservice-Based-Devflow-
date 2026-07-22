package com.devflow.project.api.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public class ProjectDTOs {

    // ── Request DTOs ─────────────────────────────────────

    @Data
    public static class CreateProjectRequest {
        @NotBlank @Size(min = 2, max = 200)
        private String name;

        @NotBlank @Size(min = 2, max = 10)
        @Pattern(regexp = "^[A-Z0-9]+$", message = "Key must be uppercase letters and numbers")
        private String key;

        @Size(max = 2000)
        private String description;

        private String visibility = "PRIVATE";
        private LocalDate startDate;
        private LocalDate targetEndDate;
    }

    @Data
    public static class UpdateProjectRequest {
        @Size(min = 2, max = 200)
        private String name;

        @Size(max = 2000)
        private String description;

        private String visibility;
        private String status;
        private LocalDate targetEndDate;
    }

    @Data
    public static class AddMemberRequest {
        @NotNull
        private UUID userId;

        @NotBlank
        private String role;
    }

    @Data
    public static class CreateSprintRequest {
        @NotBlank @Size(min = 1, max = 100)
        private String name;

        @Size(max = 500)
        private String goal;

        @NotNull
        private LocalDate startDate;

        @NotNull
        private LocalDate endDate;
    }

    @Data
    public static class CompleteSprintRequest {
        @NotNull
        private UUID moveIncompleteToSprintId;  // null = backlog
    }

    // ── Response DTOs ─────────────────────────────────────

    @Data
    public static class ProjectResponse {
        private String id;
        private String name;
        private String key;
        private String description;
        private String avatarUrl;
        private String status;
        private String visibility;
        private String ownerId;
        private String startDate;
        private String targetEndDate;
        private String createdAt;
        private int memberCount;
        private int activeSprints;
        private SprintResponse activeSprint;
    }

    @Data
    public static class SprintResponse {
        private String id;
        private String name;
        private String goal;
        private String status;
        private String startDate;
        private String endDate;
        private int plannedPoints;
        private int completedPoints;
        private int remainingDays;
        private double velocityFactor;
    }

    @Data
    public static class MemberResponse {
        private String userId;
        private String role;
        private String joinedAt;
    }

    @Data
    public static class ProjectSummaryResponse {
        private String id;
        private String name;
        private String key;
        private String status;
        private int memberCount;
    }
}
