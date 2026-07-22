package com.devflow.task.application.command;

import com.devflow.common.event.DomainEvent;
import com.devflow.common.event.KafkaTopics;
import com.devflow.common.exception.DevFlowException;
import com.devflow.task.domain.model.*;
import com.devflow.task.domain.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * CQRS Write Side — handles all task mutation commands.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TaskCommandHandler {

    private final TaskRepository taskRepository;
    private final java.util.Optional<KafkaTemplate<String, DomainEvent>> kafkaTemplate;

    public Task handle(TaskCommands.CreateTask cmd) {
        // ── Key generation (H2 + PostgreSQL compatible) ─────────────────
        // SPLIT_PART() is PostgreSQL-only and crashes H2. We fetch all task
        // keys and extract the max sequence number in Java instead.
        int seq = computeNextSequence(cmd.getProjectId(), cmd.getProjectKey());
        String taskKey = cmd.getProjectKey() + "-" + seq;

        Task task = Task.builder()
                .key(taskKey)
                .title(cmd.getTitle())
                .description(cmd.getDescription())
                .type(cmd.getType() != null ? cmd.getType() : TaskType.STORY)
                .priority(cmd.getPriority() != null ? cmd.getPriority() : TaskPriority.MEDIUM)
                .projectId(cmd.getProjectId())
                .sprintId(cmd.getSprintId())
                .epicId(cmd.getEpicId())
                .assigneeId(cmd.getAssigneeId())
                .reporterId(cmd.getReporterId())
                .storyPoints(cmd.getStoryPoints())
                .dueDate(cmd.getDueDate())
                .estimatedHours(cmd.getEstimatedHours())
                .parentTaskId(cmd.getParentTaskId())
                .build();

        task = taskRepository.save(task);
        publishEvent(KafkaTopics.TASK_CREATED, task, "TASK_CREATED",
                Map.of("key", taskKey, "title", task.getTitle(),
                        "projectId", cmd.getProjectId().toString()));
        log.info("Task created: {} [{}]", taskKey, task.getId());
        return task;
    }

    public Task handle(TaskCommands.UpdateTask cmd) {
        Task task = findTask(cmd.getTaskId());
        if (cmd.getTitle()          != null) task.setTitle(cmd.getTitle());
        if (cmd.getDescription()    != null) task.setDescription(cmd.getDescription());
        if (cmd.getPriority()       != null) task.setPriority(cmd.getPriority());
        if (cmd.getAssigneeId()     != null) task.assign(cmd.getAssigneeId());
        if (cmd.getSprintId()       != null) task.setSprintId(cmd.getSprintId());
        if (cmd.getStoryPoints()    != null) task.setStoryPoints(cmd.getStoryPoints());
        if (cmd.getDueDate()        != null) task.setDueDate(cmd.getDueDate());
        if (cmd.getEstimatedHours() != null) task.setEstimatedHours(cmd.getEstimatedHours());

        task = taskRepository.save(task);
        publishEvent(KafkaTopics.TASK_UPDATED, task, "TASK_UPDATED",
                Map.of("actorId", cmd.getActorId().toString()));
        return task;
    }

    public Task handle(TaskCommands.ChangeStatus cmd) {
        Task task = findTask(cmd.getTaskId());
        TaskStatus newStatus = TaskStatus.valueOf(cmd.getNewStatus());
        task.transition(newStatus, cmd.getActorId());
        task = taskRepository.save(task);
        publishEvent(KafkaTopics.TASK_STATUS_CHANGED, task, "TASK_STATUS_CHANGED",
                Map.of("newStatus", newStatus.name(), "actorId", cmd.getActorId().toString()));
        return task;
    }

    public Task handle(TaskCommands.AssignTask cmd) {
        Task task = findTask(cmd.getTaskId());
        task.assign(cmd.getAssigneeId());
        task = taskRepository.save(task);
        publishEvent(KafkaTopics.TASK_ASSIGNED, task, "TASK_ASSIGNED",
                Map.of("assigneeId", cmd.getAssigneeId().toString(),
                        "actorId", cmd.getActorId().toString()));
        return task;
    }

    public TaskComment handle(TaskCommands.AddComment cmd) {
        Task task = findTask(cmd.getTaskId());
        TaskComment comment = TaskComment.builder()
                .task(task)
                .authorId(cmd.getAuthorId())
                .content(cmd.getContent())
                .build();
        task.getComments().add(comment);
        taskRepository.save(task);
        publishEvent(KafkaTopics.TASK_COMMENTED, task, "TASK_COMMENTED",
                Map.of("authorId", cmd.getAuthorId().toString(),
                        "commentLength", String.valueOf(cmd.getContent().length())));
        return comment;
    }

    public TimeLog handle(TaskCommands.LogTime cmd) {
        Task task = findTask(cmd.getTaskId());
        task.logTime(cmd.getHours());
        TimeLog timeLog = TimeLog.builder()
                .task(task)
                .userId(cmd.getUserId())
                .hours(cmd.getHours())
                .description(cmd.getDescription())
                .logDate(cmd.getLogDate() != null ? cmd.getLogDate() : java.time.LocalDate.now())
                .build();
        task.getTimeLogs().add(timeLog);
        taskRepository.save(task);
        publishEvent(KafkaTopics.TIME_LOGGED, task, "TIME_LOGGED",
                Map.of("hours", String.valueOf(cmd.getHours()),
                        "userId", cmd.getUserId().toString()));
        return timeLog;
    }

    public void handle(TaskCommands.DeleteTask cmd) {
        Task task = findTask(cmd.getTaskId());
        taskRepository.delete(task);
        publishEvent(KafkaTopics.TASK_DELETED, task, "TASK_DELETED",
                Map.of("actorId", cmd.getActorId().toString()));
    }

    // ── Helpers ──────────────────────────────────────────────

    private Task findTask(UUID id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> DevFlowException.notFound("Task", id));
    }

    /**
     * Compute next sequence number for a project key.
     * Parses existing keys in Java — avoids SPLIT_PART which is PostgreSQL-only.
     * Falls back to count+1 if no parseable keys exist yet.
     */
    private int computeNextSequence(UUID projectId, String projectKey) {
        List<String> keys = taskRepository.findKeysByProjectId(projectId);
        String prefix = projectKey + "-";
        int max = keys.stream()
                .filter(k -> k != null && k.startsWith(prefix))
                .mapToInt(k -> {
                    try { return Integer.parseInt(k.substring(prefix.length())); }
                    catch (NumberFormatException e) { return 0; }
                })
                .max()
                .orElse(0);
        // If no parseable sequence found, fall back to total count to avoid collision
        if (max == 0 && !keys.isEmpty()) {
            max = (int) taskRepository.countByProjectId(projectId);
        }
        return max + 1;
    }

    /**
     * Publish a domain event to Kafka.
     * Wrapped in try-catch so that Kafka being unavailable (e.g. local dev without
     * Docker) does NOT roll back the database transaction — data is still saved.
     */
    private void publishEvent(String topic, Task task, String type, Map<String, Object> extra) {
        try {
            DomainEvent event = DomainEvent.builder()
                    .eventType(type)
                    .aggregateId(task.getId().toString())
                    .aggregateType("TASK")
                    .userId(task.getReporterId().toString())
                    .payload(Map.of(
                            "taskId", task.getId().toString(),
                            "key", task.getKey(),
                            "projectId", task.getProjectId().toString(),
                            "extra", extra))
                    .build();
            kafkaTemplate.ifPresent(kt -> kt.send(topic, task.getId().toString(), event));
        } catch (Exception e) {
            // Kafka unavailable in local dev — log warning, do NOT propagate
            log.warn("Kafka event publish failed (topic={}, type={}) — data was saved: {}",
                    topic, type, e.getMessage());
        }
    }
}
