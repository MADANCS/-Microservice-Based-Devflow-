package com.devflow.task.application.query;

import com.devflow.common.exception.DevFlowException;
import com.devflow.task.api.dto.TaskDTOs;
import com.devflow.task.domain.model.*;
import com.devflow.task.domain.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * CQRS Read Side — optimized read model projections.
 * Separated from write side to allow independent scaling.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class TaskQueryHandler {

    private final TaskRepository taskRepository;

    public TaskDTOs.TaskResponse handle(TaskQueries.GetTask query) {
        Task task = taskRepository.findById(query.getTaskId())
                .orElseThrow(() -> DevFlowException.notFound("Task", query.getTaskId()));
        return toResponse(task);
    }

    /** Returns Kanban board — tasks grouped by status column. */
    public TaskDTOs.BoardResponse handle(TaskQueries.GetBoardTasks query) {
        List<Task> tasks = query.getSprintId() != null
                ? taskRepository.findBySprintIdOrderByPosition(query.getSprintId())
                : taskRepository.findByProjectId(query.getProjectId(), PageRequest.of(0, 500)).getContent();

        Map<TaskStatus, List<TaskDTOs.TaskSummary>> columns = tasks.stream()
                .collect(Collectors.groupingBy(
                        Task::getStatus,
                        LinkedHashMap::new,
                        Collectors.mapping(this::toSummary, Collectors.toList())
                ));

        TaskDTOs.BoardResponse board = new TaskDTOs.BoardResponse();
        board.setTodo(columns.getOrDefault(TaskStatus.TODO, List.of()));
        board.setInProgress(columns.getOrDefault(TaskStatus.IN_PROGRESS, List.of()));
        board.setInReview(columns.getOrDefault(TaskStatus.IN_REVIEW, List.of()));
        board.setDone(columns.getOrDefault(TaskStatus.DONE, List.of()));
        board.setTotalTasks(tasks.size());
        return board;
    }

    public Page<TaskDTOs.TaskSummary> handle(TaskQueries.SearchTasks query) {
        Specification<Task> spec = buildSpec(query);
        return taskRepository.findAll(spec, PageRequest.of(query.getPage(), query.getSize()))
                .map(this::toSummary);
    }

    // ── Projections ───────────────────────────────────────────
    public TaskDTOs.TaskResponse toResponse(Task t) {
        TaskDTOs.TaskResponse r = new TaskDTOs.TaskResponse();
        r.setId(t.getId().toString());
        r.setKey(t.getKey());
        r.setTitle(t.getTitle());
        r.setDescription(t.getDescription());
        r.setStatus(t.getStatus().name());
        r.setPriority(t.getPriority().name());
        r.setType(t.getType().name());
        r.setProjectId(t.getProjectId().toString());
        r.setStoryPoints(t.getStoryPoints());
        r.setEstimatedHours(t.getEstimatedHours());
        r.setLoggedHours(t.getLoggedHours());
        r.setCreatedAt(t.getCreatedAt().toString());
        r.setUpdatedAt(t.getUpdatedAt().toString());
        if (t.getAssigneeId()   != null) r.setAssigneeId(t.getAssigneeId().toString());
        if (t.getSprintId()     != null) r.setSprintId(t.getSprintId().toString());
        if (t.getDueDate()      != null) r.setDueDate(t.getDueDate().toString());
        if (t.getResolvedAt()   != null) r.setResolvedAt(t.getResolvedAt().toString());
        r.setCommentCount(t.getComments().size());
        return r;
    }

    public TaskDTOs.TaskSummary toSummary(Task t) {
        TaskDTOs.TaskSummary s = new TaskDTOs.TaskSummary();
        s.setId(t.getId().toString());
        s.setKey(t.getKey());
        s.setTitle(t.getTitle());
        s.setStatus(t.getStatus().name());
        s.setPriority(t.getPriority().name());
        s.setType(t.getType().name());
        s.setStoryPoints(t.getStoryPoints());
        s.setPosition(t.getPosition());
        if (t.getAssigneeId() != null) s.setAssigneeId(t.getAssigneeId().toString());
        if (t.getDueDate()    != null) s.setDueDate(t.getDueDate().toString());
        return s;
    }

    private Specification<Task> buildSpec(TaskQueries.SearchTasks q) {
        return (root, cq, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            if (q.getProjectId() != null)
                predicates.add(cb.equal(root.get("projectId"), q.getProjectId()));
            if (q.getKeyword() != null && !q.getKeyword().isBlank())
                predicates.add(cb.like(cb.lower(root.get("title")), "%" + q.getKeyword().toLowerCase() + "%"));
            if (q.getStatus() != null)
                predicates.add(cb.equal(root.get("status"), TaskStatus.valueOf(q.getStatus())));
            if (q.getPriority() != null)
                predicates.add(cb.equal(root.get("priority"), TaskPriority.valueOf(q.getPriority())));
            if (q.getAssigneeId() != null)
                predicates.add(cb.equal(root.get("assigneeId"), q.getAssigneeId()));
            if (q.getSprintId() != null)
                predicates.add(cb.equal(root.get("sprintId"), q.getSprintId()));
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }
}
