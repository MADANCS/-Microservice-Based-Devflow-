package com.devflow.task.api.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class TaskDTOs {

    // ── Request DTOs ────────────────────────────────────

    @Data
    public static class CreateTaskRequest {
        @NotBlank @Size(max = 500)
        private String title;
        private String description;
        private String type     = "STORY";
        private String priority = "MEDIUM";
        private UUID   sprintId;
        private UUID   epicId;
        private UUID   assigneeId;
        @Min(0) @Max(100)
        private int    storyPoints;
        private LocalDateTime dueDate;
        private double estimatedHours;
        private UUID   parentTaskId;
    }

    @Data
    public static class UpdateTaskRequest {
        @Size(max = 500)
        private String title;
        private String description;
        private String priority;
        private UUID   assigneeId;
        private UUID   sprintId;
        private Integer storyPoints;
        private LocalDateTime dueDate;
        private Double estimatedHours;
    }

    @Data
    public static class ChangeStatusRequest {
        @NotBlank
        private String status;
    }

    @Data
    public static class AddCommentRequest {
        @NotBlank @Size(min = 1, max = 5000)
        private String content;
    }

    @Data
    public static class LogTimeRequest {
        @Positive
        private double hours;
        @Size(max = 500)
        private String description;
        private java.time.LocalDate logDate;
    }

    // ── Response DTOs ────────────────────────────────────

    @Data
    public static class TaskResponse {
        private String id;
        private String key;
        private String title;
        private String description;
        private String status;
        private String priority;
        private String type;
        private String projectId;
        private String sprintId;
        private String assigneeId;
        private int    storyPoints;
        private double estimatedHours;
        private double loggedHours;
        private String dueDate;
        private String createdAt;
        private String updatedAt;
        private String resolvedAt;
        private int    commentCount;
    }

    @Data
    public static class TaskSummary {
        private String id;
        private String key;
        private String title;
        private String status;
        private String priority;
        private String type;
        private String assigneeId;
        private int    storyPoints;
        private int    position;
        private String dueDate;
    }

    @Data
    public static class BoardResponse {
        private List<TaskSummary> todo;
        private List<TaskSummary> inProgress;
        private List<TaskSummary> inReview;
        private List<TaskSummary> done;
        private int totalTasks;
    }

    @Data
    public static class CommentResponse {
        private String id;
        private String authorId;
        private String content;
        private boolean edited;
        private String createdAt;
    }

    @Data
    public static class TimeLogResponse {
        private String id;
        private String userId;
        private double hours;
        private String description;
        private String logDate;
    }
}
