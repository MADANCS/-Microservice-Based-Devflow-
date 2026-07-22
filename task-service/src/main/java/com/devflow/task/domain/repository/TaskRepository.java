package com.devflow.task.domain.repository;

import com.devflow.task.domain.model.Task;
import com.devflow.task.domain.model.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TaskRepository extends JpaRepository<Task, UUID>, JpaSpecificationExecutor<Task> {

    Page<Task> findByProjectId(UUID projectId, Pageable pageable);

    List<Task> findBySprintIdOrderByPosition(UUID sprintId);

    List<Task> findByProjectIdAndStatus(UUID projectId, TaskStatus status);

    List<Task> findByAssigneeIdAndStatus(UUID assigneeId, TaskStatus status);

    Optional<Task> findByKey(String key);

    /**
     * Fetch all task keys for a project (e.g. "DEVF-1", "DEVF-3").
     * Max sequence is derived in Java to avoid SPLIT_PART which is
     * PostgreSQL-only and throws errors on H2 (used in local dev).
     */
    @Query("SELECT t.key FROM Task t WHERE t.projectId = :projectId")
    List<String> findKeysByProjectId(UUID projectId);

    /** Total task count for a project — used for sequence fallback. */
    long countByProjectId(UUID projectId);

    @Modifying
    @Query("UPDATE Task t SET t.position = :position WHERE t.id = :taskId")
    void updatePosition(UUID taskId, int position);

    @Query("SELECT t FROM Task t WHERE t.sprintId = :sprintId AND t.status <> 'DONE' AND t.status <> 'CANCELLED'")
    List<Task> findIncompleteBySprint(UUID sprintId);

    @Query("""
        SELECT SUM(t.storyPoints) FROM Task t
        WHERE t.sprintId = :sprintId AND t.status = 'DONE'
        """)
    Optional<Integer> sumCompletedPointsBySprint(UUID sprintId);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.projectId = :projectId AND t.status = :status")
    long countByProjectAndStatus(UUID projectId, TaskStatus status);
}
