package com.devflow.project.domain.repository;

import com.devflow.project.domain.model.Project;
import com.devflow.project.domain.model.ProjectStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID> {

    Page<Project> findByOwnerIdOrMembersUserId(UUID ownerId, UUID memberId, Pageable pageable);

    Optional<Project> findByKey(String key);

    boolean existsByKey(String key);

    @Query("""
        SELECT p FROM Project p
        WHERE (p.ownerId = :userId OR EXISTS (
            SELECT m FROM ProjectMember m WHERE m.project = p AND m.userId = :userId
        ))
        AND p.status = :status
        """)
    Page<Project> findAccessibleByStatus(UUID userId, ProjectStatus status, Pageable pageable);

    @Query("""
        SELECT COUNT(p) FROM Project p
        WHERE p.ownerId = :userId OR EXISTS (
            SELECT m FROM ProjectMember m WHERE m.project = p AND m.userId = :userId
        )
        """)
    long countAccessibleByUser(UUID userId);
}
