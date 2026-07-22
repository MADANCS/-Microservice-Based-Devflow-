package com.devflow.task.api.controller;

import com.devflow.common.dto.ApiResponse;
import com.devflow.task.api.dto.TaskDTOs;
import com.devflow.task.application.command.TaskCommandHandler;
import com.devflow.task.application.command.TaskCommands;
import com.devflow.task.application.query.TaskQueryHandler;
import com.devflow.task.application.query.TaskQueries;
import com.devflow.task.domain.model.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Task REST Controller — 7 APIs:
 * POST   /api/v1/tasks
 * GET    /api/v1/tasks/{id}
 * PUT    /api/v1/tasks/{id}
 * DELETE /api/v1/tasks/{id}
 * PATCH  /api/v1/tasks/{id}/status
 * POST   /api/v1/tasks/{id}/comments
 * POST   /api/v1/tasks/{id}/time-logs
 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Tasks", description = "Task management with CQRS pattern")
public class TaskController {

    private final TaskCommandHandler commandHandler;
    private final TaskQueryHandler   queryHandler;

    // ── Commands (Write) ─────────────────────────────────────

    @PostMapping("/projects/{projectId}/tasks")
    @Operation(summary = "Create a task in a project")
    public ResponseEntity<ApiResponse<TaskDTOs.TaskResponse>> createTask(
            @PathVariable UUID projectId,
            @RequestParam String projectKey,
            @Valid @RequestBody TaskDTOs.CreateTaskRequest req,
            @RequestHeader("X-User-Id") String userId) {

        Task task = commandHandler.handle(TaskCommands.CreateTask.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .type(req.getType() != null ? TaskType.valueOf(req.getType()) : TaskType.STORY)
                .priority(req.getPriority() != null ? TaskPriority.valueOf(req.getPriority()) : TaskPriority.MEDIUM)
                .projectId(projectId)
                .sprintId(req.getSprintId())
                .epicId(req.getEpicId())
                .assigneeId(req.getAssigneeId())
                .reporterId(UUID.fromString(userId))
                .storyPoints(req.getStoryPoints())
                .dueDate(req.getDueDate())
                .estimatedHours(req.getEstimatedHours())
                .parentTaskId(req.getParentTaskId())
                .projectKey(projectKey)
                .build());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(queryHandler.toResponse(task)));
    }

    @GetMapping("/tasks/{taskId}")
    @Operation(summary = "Get task details by ID")
    public ResponseEntity<ApiResponse<TaskDTOs.TaskResponse>> getTask(
            @PathVariable UUID taskId,
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(ApiResponse.ok(
                queryHandler.handle(TaskQueries.GetTask.builder()
                        .taskId(taskId)
                        .requesterId(UUID.fromString(userId))
                        .build())));
    }

    @GetMapping("/boards")
    @Operation(summary = "Get Kanban board — tasks grouped by status column")
    public ResponseEntity<ApiResponse<TaskDTOs.BoardResponse>> getBoard(
            @RequestParam UUID projectId,
            @RequestParam(required = false) UUID sprintId,
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(ApiResponse.ok(
                queryHandler.handle(TaskQueries.GetBoardTasks.builder()
                        .projectId(projectId)
                        .sprintId(sprintId)
                        .requesterId(UUID.fromString(userId))
                        .build())));
    }

    @GetMapping("/tasks")
    @Operation(summary = "Search and filter tasks")
    public ResponseEntity<ApiResponse<Page<TaskDTOs.TaskSummary>>> searchTasks(
            @RequestParam(required = false) UUID projectId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) UUID assigneeId,
            @RequestParam(required = false) UUID sprintId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                queryHandler.handle(TaskQueries.SearchTasks.builder()
                        .projectId(projectId).keyword(keyword).status(status)
                        .priority(priority).assigneeId(assigneeId).sprintId(sprintId)
                        .page(page).size(size).build())));
    }

    @PutMapping("/tasks/{taskId}")
    @Operation(summary = "Update task details")
    public ResponseEntity<ApiResponse<TaskDTOs.TaskResponse>> updateTask(
            @PathVariable UUID taskId,
            @Valid @RequestBody TaskDTOs.UpdateTaskRequest req,
            @RequestHeader("X-User-Id") String userId) {
        Task task = commandHandler.handle(TaskCommands.UpdateTask.builder()
                .taskId(taskId)
                .actorId(UUID.fromString(userId))
                .title(req.getTitle())
                .description(req.getDescription())
                .priority(req.getPriority() != null ? TaskPriority.valueOf(req.getPriority()) : null)
                .assigneeId(req.getAssigneeId())
                .sprintId(req.getSprintId())
                .storyPoints(req.getStoryPoints())
                .dueDate(req.getDueDate())
                .estimatedHours(req.getEstimatedHours())
                .build());
        return ResponseEntity.ok(ApiResponse.ok(queryHandler.toResponse(task)));
    }

    @PatchMapping("/tasks/{taskId}/status")
    @Operation(summary = "Transition task to a new status")
    public ResponseEntity<ApiResponse<TaskDTOs.TaskResponse>> changeStatus(
            @PathVariable UUID taskId,
            @Valid @RequestBody TaskDTOs.ChangeStatusRequest req,
            @RequestHeader("X-User-Id") String userId) {
        Task task = commandHandler.handle(TaskCommands.ChangeStatus.builder()
                .taskId(taskId)
                .actorId(UUID.fromString(userId))
                .newStatus(req.getStatus())
                .build());
        return ResponseEntity.ok(ApiResponse.ok(queryHandler.toResponse(task)));
    }

    @PostMapping("/tasks/{taskId}/comments")
    @Operation(summary = "Add a comment to a task")
    public ResponseEntity<ApiResponse<TaskDTOs.CommentResponse>> addComment(
            @PathVariable UUID taskId,
            @Valid @RequestBody TaskDTOs.AddCommentRequest req,
            @RequestHeader("X-User-Id") String userId) {
        TaskComment comment = commandHandler.handle(TaskCommands.AddComment.builder()
                .taskId(taskId)
                .authorId(UUID.fromString(userId))
                .content(req.getContent())
                .build());
        TaskDTOs.CommentResponse resp = new TaskDTOs.CommentResponse();
        resp.setId(comment.getId().toString());
        resp.setAuthorId(comment.getAuthorId().toString());
        resp.setContent(comment.getContent());
        resp.setCreatedAt(comment.getCreatedAt().toString());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(resp));
    }

    @PostMapping("/tasks/{taskId}/time-logs")
    @Operation(summary = "Log time spent on a task")
    public ResponseEntity<ApiResponse<TaskDTOs.TimeLogResponse>> logTime(
            @PathVariable UUID taskId,
            @Valid @RequestBody TaskDTOs.LogTimeRequest req,
            @RequestHeader("X-User-Id") String userId) {
        TimeLog tl = commandHandler.handle(TaskCommands.LogTime.builder()
                .taskId(taskId)
                .userId(UUID.fromString(userId))
                .hours(req.getHours())
                .description(req.getDescription())
                .logDate(req.getLogDate())
                .build());
        TaskDTOs.TimeLogResponse resp = new TaskDTOs.TimeLogResponse();
        resp.setId(tl.getId().toString());
        resp.setUserId(tl.getUserId().toString());
        resp.setHours(tl.getHours());
        resp.setDescription(tl.getDescription());
        resp.setLogDate(tl.getLogDate().toString());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(resp));
    }

    @DeleteMapping("/tasks/{taskId}")
    @Operation(summary = "Delete a task")
    public ResponseEntity<ApiResponse<Void>> deleteTask(
            @PathVariable UUID taskId,
            @RequestHeader("X-User-Id") String userId) {
        commandHandler.handle(TaskCommands.DeleteTask.builder()
                .taskId(taskId)
                .actorId(UUID.fromString(userId))
                .build());
        return ResponseEntity.ok(ApiResponse.deleted());
    }
}
