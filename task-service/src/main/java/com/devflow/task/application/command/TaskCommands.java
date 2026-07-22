package com.devflow.task.application.command;

import com.devflow.task.domain.model.TaskPriority;
import com.devflow.task.domain.model.TaskType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * CQRS Command objects — immutable intent records for write side.
 */
public final class TaskCommands {

    @Data @Builder
    public static class CreateTask {
        private String title;
        private String description;
        private TaskType type;
        private TaskPriority priority;
        private UUID projectId;
        private UUID sprintId;
        private UUID epicId;
        private UUID assigneeId;
        private UUID reporterId;
        private int storyPoints;
        private LocalDateTime dueDate;
        private double estimatedHours;
        private UUID parentTaskId;
        private String projectKey;    // needed to generate task key e.g. "DEVF-42"
    }

    @Data @Builder
    public static class UpdateTask {
        private UUID taskId;
        private UUID actorId;
        private String title;
        private String description;
        private TaskPriority priority;
        private UUID assigneeId;
        private UUID sprintId;
        private Integer storyPoints;
        private LocalDateTime dueDate;
        private Double estimatedHours;
    }

    @Data @Builder
    public static class ChangeStatus {
        private UUID taskId;
        private UUID actorId;
        private String newStatus;
    }

    @Data @Builder
    public static class AssignTask {
        private UUID taskId;
        private UUID assigneeId;
        private UUID actorId;
    }

    @Data @Builder
    public static class AddComment {
        private UUID taskId;
        private UUID authorId;
        private String content;
    }

    @Data @Builder
    public static class LogTime {
        private UUID taskId;
        private UUID userId;
        private double hours;
        private String description;
        private java.time.LocalDate logDate;
    }

    @Data @Builder
    public static class MoveTask {
        private UUID taskId;
        private int newPosition;
        private UUID actorId;
    }

    @Data @Builder
    public static class DeleteTask {
        private UUID taskId;
        private UUID actorId;
    }
}
