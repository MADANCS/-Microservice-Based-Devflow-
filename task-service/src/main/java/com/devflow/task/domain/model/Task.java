package com.devflow.task.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Task aggregate root — the core entity for CQRS write model.
 * Task ID format: {PROJECT_KEY}-{sequence} e.g. "DEVF-42"
 */
@Entity
@Table(name = "tasks", indexes = {
    @Index(name = "idx_tasks_project",  columnList = "project_id"),
    @Index(name = "idx_tasks_assignee", columnList = "assignee_id"),
    @Index(name = "idx_tasks_sprint",   columnList = "sprint_id"),
    @Index(name = "idx_tasks_status",   columnList = "status"),
    @Index(name = "idx_tasks_key",      columnList = "task_key", unique = true)
})
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "task_key", nullable = false, unique = true, length = 20)
    private String key;              // e.g. "DEVF-42"

    @Column(nullable = false, length = 500)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TaskStatus status = TaskStatus.TODO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TaskPriority priority = TaskPriority.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TaskType type = TaskType.STORY;

    @Column(nullable = false)
    private UUID projectId;

    private UUID sprintId;
    private UUID epicId;
    private UUID assigneeId;

    @Column(nullable = false)
    private UUID reporterId;

    @Builder.Default
    private int storyPoints = 0;

    @Builder.Default
    private int position = 0;       // Kanban board ordering

    private LocalDateTime dueDate;

    @Column(name = "estimated_hours")
    @Builder.Default
    private double estimatedHours = 0.0;

    @Column(name = "logged_hours")
    @Builder.Default
    private double loggedHours = 0.0;

    // Self-referential parent for sub-tasks
    @Column(name = "parent_task_id")
    private UUID parentTaskId;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    private LocalDateTime resolvedAt;

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<TaskComment> comments = new ArrayList<>();

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<TimeLog> timeLogs = new ArrayList<>();

    @PreUpdate
    void onUpdate() { this.updatedAt = LocalDateTime.now(); }

    // ── Domain behavior ──────────────────────────────────
    public void transition(TaskStatus newStatus, UUID actorId) {
        validateStatusTransition(this.status, newStatus);
        this.status = newStatus;
        if (newStatus == TaskStatus.DONE || newStatus == TaskStatus.CANCELLED) {
            this.resolvedAt = LocalDateTime.now();
        }
    }

    public void assign(UUID assigneeId) {
        this.assigneeId = assigneeId;
    }

    public void logTime(double hours) {
        if (hours <= 0) throw new IllegalArgumentException("Hours must be positive");
        this.loggedHours += hours;
    }

    public void moveTo(int newPosition) {
        this.position = newPosition;
    }

    private void validateStatusTransition(TaskStatus from, TaskStatus to) {
        // CANCELLED is the only true terminal state — no transitions allowed out.
        // All other transitions (including skipping columns on a Kanban board,
        // e.g. TODO → DONE) are permitted so drag-and-drop works correctly.
        if (from == TaskStatus.CANCELLED) {
            throw new IllegalStateException(
                    "Cannot transition out of CANCELLED status. Task must be re-opened first.");
        }
        // Prevent no-op self-transitions
        if (from == to) {
            throw new IllegalStateException("Task is already in status: " + to);
        }
    }
}
