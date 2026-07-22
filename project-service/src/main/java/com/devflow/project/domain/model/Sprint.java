package com.devflow.project.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Sprint entity — belongs to a Project.
 * Tracks velocity, story points planned/completed.
 */
@Entity
@Table(name = "sprints", indexes = {
    @Index(name = "idx_sprints_project", columnList = "project_id"),
    @Index(name = "idx_sprints_status",  columnList = "status")
})
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class Sprint {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String goal;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private SprintStatus status = SprintStatus.PLANNED;

    private LocalDate startDate;
    private LocalDate endDate;

    @Builder.Default
    private int plannedPoints = 0;

    @Builder.Default
    private int completedPoints = 0;

    @Builder.Default
    private double velocityFactor = 1.0;  // AI uses this for future planning

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime startedAt;
    private LocalDateTime completedAt;

    public void start() {
        this.status = SprintStatus.ACTIVE;
        this.startedAt = LocalDateTime.now();
    }

    public void complete(int actualPoints) {
        this.status = SprintStatus.COMPLETED;
        this.completedPoints = actualPoints;
        this.completedAt = LocalDateTime.now();
        if (plannedPoints > 0) {
            this.velocityFactor = (double) actualPoints / plannedPoints;
        }
    }

    public int getRemainingDays() {
        if (endDate == null) return 0;
        return (int) java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), endDate);
    }
}
