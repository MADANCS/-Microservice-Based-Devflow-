package com.devflow.project.domain.repository;

import com.devflow.project.domain.model.Sprint;
import com.devflow.project.domain.model.SprintStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SprintRepository extends JpaRepository<Sprint, UUID> {

    List<Sprint> findByProjectIdOrderByCreatedAtDesc(UUID projectId);

    Optional<Sprint> findByProjectIdAndStatus(UUID projectId, SprintStatus status);

    @Query("SELECT AVG(s.velocityFactor) FROM Sprint s WHERE s.project.id = :projectId AND s.status = 'COMPLETED'")
    Optional<Double> findAverageVelocity(UUID projectId);

    @Query("SELECT s FROM Sprint s WHERE s.project.id = :projectId AND s.status = 'COMPLETED' ORDER BY s.completedAt DESC")
    List<Sprint> findLastCompletedSprints(UUID projectId, org.springframework.data.domain.Pageable pageable);
}
