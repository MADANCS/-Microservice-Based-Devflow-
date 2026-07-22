package com.devflow.project.application;

import com.devflow.common.event.DomainEvent;
import com.devflow.common.event.KafkaTopics;
import com.devflow.common.exception.DevFlowException;
import com.devflow.project.api.dto.ProjectDTOs;
import com.devflow.project.api.dto.ProjectSettingsDTOs;
import com.devflow.project.domain.model.*;
import com.devflow.project.domain.repository.ProjectRepository;
import com.devflow.project.domain.repository.SprintRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Project Service — manages projects, sprints, and members.
 * 6 APIs: createProject · getProject · updateProject · deleteProject · addMember · createSprint
 */
@Service
@Slf4j
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final SprintRepository  sprintRepository;

    @Autowired(required = false)
    private KafkaTemplate<String, DomainEvent> kafkaTemplate;

    public ProjectService(ProjectRepository projectRepository, SprintRepository sprintRepository) {
        this.projectRepository = projectRepository;
        this.sprintRepository = sprintRepository;
    }

    // ── Create Project ────────────────────────────────────
    public ProjectDTOs.ProjectResponse createProject(ProjectDTOs.CreateProjectRequest req, UUID ownerId) {
        if (projectRepository.existsByKey(req.getKey())) {
            throw DevFlowException.conflict("Project key '" + req.getKey() + "' is already taken");
        }

        Project project = Project.builder()
                .name(req.getName())
                .key(req.getKey().toUpperCase())
                .description(req.getDescription())
                .visibility(ProjectVisibility.valueOf(req.getVisibility()))
                .ownerId(ownerId)
                .startDate(req.getStartDate() != null ? req.getStartDate().atStartOfDay() : null)
                .targetEndDate(req.getTargetEndDate() != null ? req.getTargetEndDate().atStartOfDay() : null)
                .build();

        // Owner is always a member too
        project.addMember(ownerId, MemberRole.OWNER);
        project = projectRepository.save(project);

        publishEvent(KafkaTopics.PROJECT_CREATED, project.getId().toString(), "PROJECT_CREATED", project.getId(), ownerId,
                Map.of("name", project.getName(), "key", project.getKey()));

        log.info("Project created: {} [{}] by {}", project.getName(), project.getKey(), ownerId);
        return toProjectResponse(project);
    }

    // ── Get Project ───────────────────────────────────────
    @Transactional(readOnly = true)
    public ProjectDTOs.ProjectResponse getProject(UUID projectId, UUID requesterId) {
        Project project = findAndValidateAccess(projectId, requesterId);
        return toProjectResponse(project);
    }

    // ── Get My Projects ───────────────────────────────────
    @Transactional(readOnly = true)
    public Page<ProjectDTOs.ProjectResponse> getMyProjects(UUID userId, Pageable pageable) {
        return projectRepository.findByOwnerIdOrMembersUserId(userId, userId, pageable)
                .map(this::toProjectResponse);
    }

    // ── Update Project ────────────────────────────────────
    public ProjectDTOs.ProjectResponse updateProject(UUID projectId, ProjectDTOs.UpdateProjectRequest req, UUID requesterId) {
        Project project = findAndValidateOwnerOrManager(projectId, requesterId);

        if (req.getName()        != null) project.setName(req.getName());
        if (req.getDescription() != null) project.setDescription(req.getDescription());
        if (req.getVisibility()  != null) project.setVisibility(ProjectVisibility.valueOf(req.getVisibility()));
        if (req.getStatus()      != null) project.setStatus(ProjectStatus.valueOf(req.getStatus()));
        if (req.getTargetEndDate() != null) project.setTargetEndDate(req.getTargetEndDate().atStartOfDay());

        project = projectRepository.save(project);
        publishEvent(KafkaTopics.PROJECT_UPDATED, project.getId().toString(), "PROJECT_UPDATED", project.getId(), requesterId,
                Map.of("name", project.getName()));
        return toProjectResponse(project);
    }

    // ── Delete Project ────────────────────────────────────
    public void deleteProject(UUID projectId, UUID requesterId) {
        Project project = findAndValidateOwner(projectId, requesterId);
        projectRepository.delete(project);
        publishEvent(KafkaTopics.PROJECT_DELETED, projectId.toString(), "PROJECT_DELETED", projectId, requesterId, Map.of());
        log.info("Project {} deleted by {}", projectId, requesterId);
    }

    // ── Add Member ────────────────────────────────────────
    public ProjectDTOs.MemberResponse addMember(UUID projectId, ProjectDTOs.AddMemberRequest req, UUID requesterId) {
        Project project = findAndValidateOwnerOrManager(projectId, requesterId);
        UUID newMemberId = req.getUserId();

        boolean alreadyMember = project.getMembers().stream()
                .anyMatch(m -> m.getUserId().equals(newMemberId));
        if (alreadyMember) {
            throw DevFlowException.conflict("User is already a member of this project");
        }

        project.addMember(newMemberId, MemberRole.valueOf(req.getRole()));
        projectRepository.save(project);

        publishEvent(KafkaTopics.MEMBER_ADDED, projectId.toString(), "MEMBER_ADDED", projectId, requesterId,
                Map.of("newMemberId", newMemberId.toString(), "role", req.getRole()));

        ProjectDTOs.MemberResponse resp = new ProjectDTOs.MemberResponse();
        resp.setUserId(newMemberId.toString());
        resp.setRole(req.getRole());
        resp.setJoinedAt(java.time.LocalDateTime.now().toString());
        return resp;
    }

    // ── Create Sprint ─────────────────────────────────────
    public ProjectDTOs.SprintResponse createSprint(UUID projectId, ProjectDTOs.CreateSprintRequest req, UUID requesterId) {
        Project project = findAndValidateOwnerOrManager(projectId, requesterId);

        // Only one active sprint at a time
        sprintRepository.findByProjectIdAndStatus(projectId, SprintStatus.ACTIVE)
                .ifPresent(s -> { throw DevFlowException.conflict("A sprint is already active in this project"); });

        Sprint sprint = Sprint.builder()
                .project(project)
                .name(req.getName())
                .goal(req.getGoal())
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .build();

        sprint = sprintRepository.save(sprint);
        publishEvent(KafkaTopics.SPRINT_STARTED, sprint.getId().toString(), "SPRINT_CREATED", projectId, requesterId,
                Map.of("sprintId", sprint.getId().toString(), "name", sprint.getName()));

        return toSprintResponse(sprint);
    }

    // ── Start Sprint ──────────────────────────────────────
    public ProjectDTOs.SprintResponse startSprint(UUID projectId, UUID sprintId, UUID requesterId) {
        findAndValidateOwnerOrManager(projectId, requesterId);
        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> DevFlowException.notFound("Sprint", sprintId));

        if (sprint.getStatus() != SprintStatus.PLANNED) {
            throw DevFlowException.badRequest("Only PLANNED sprints can be started");
        }
        sprint.start();
        sprint = sprintRepository.save(sprint);
        publishEvent(KafkaTopics.SPRINT_STARTED, sprintId.toString(), "SPRINT_STARTED", projectId, requesterId,
                Map.of("sprintId", sprintId.toString()));
        return toSprintResponse(sprint);
    }

    // ── Project Settings ──────────────────────────────────
    public ProjectSettingsDTOs.SettingsResponse getProjectSettings(UUID projectId, UUID requesterId) {
        Project p = findAndValidateAccess(projectId, requesterId);
        ProjectSettingsDTOs.SettingsResponse resp = new ProjectSettingsDTOs.SettingsResponse();
        resp.setProjectId(p.getId().toString());
        resp.setVisibility(p.getVisibility().name());
        resp.setDefaultPriority("MEDIUM");
        resp.setDefaultStatus("TODO");
        resp.setWipLimit(10);
        resp.setArchived(false);
        resp.setAllowMemberInvites(true);
        return resp;
    }

    public ProjectSettingsDTOs.SettingsResponse updateProjectSettings(UUID projectId, ProjectSettingsDTOs.UpdateSettingsRequest req, UUID requesterId) {
        Project p = findAndValidateOwnerOrManager(projectId, requesterId);
        if (req.getVisibility() != null) {
            try {
                p.setVisibility(ProjectVisibility.valueOf(req.getVisibility().toUpperCase()));
                projectRepository.save(p);
            } catch (Exception ignored) {}
        }
        ProjectSettingsDTOs.SettingsResponse resp = new ProjectSettingsDTOs.SettingsResponse();
        resp.setProjectId(p.getId().toString());
        resp.setVisibility(p.getVisibility().name());
        resp.setDefaultPriority(req.getDefaultPriority() != null ? req.getDefaultPriority() : "MEDIUM");
        resp.setDefaultStatus(req.getDefaultStatus() != null ? req.getDefaultStatus() : "TODO");
        resp.setWipLimit(req.getWipLimit() != null ? req.getWipLimit() : 10);
        resp.setArchived(req.getArchived() != null ? req.getArchived() : false);
        resp.setAllowMemberInvites(req.getAllowMemberInvites() != null ? req.getAllowMemberInvites() : true);
        return resp;
    }

    // ── Helpers ───────────────────────────────────────────

    private Project findAndValidateAccess(UUID projectId, UUID userId) {
        Project p = projectRepository.findById(projectId)
                .orElseThrow(() -> DevFlowException.notFound("Project", projectId));
        boolean hasAccess = p.getOwnerId().equals(userId)
                || p.getVisibility() == ProjectVisibility.PUBLIC
                || p.getMembers().stream().anyMatch(m -> m.getUserId().equals(userId));
        if (!hasAccess) throw DevFlowException.forbidden("access this project");
        return p;
    }

    private Project findAndValidateOwner(UUID projectId, UUID userId) {
        Project p = projectRepository.findById(projectId)
                .orElseThrow(() -> DevFlowException.notFound("Project", projectId));
        if (!p.getOwnerId().equals(userId)) throw DevFlowException.forbidden("delete this project");
        return p;
    }

    private Project findAndValidateOwnerOrManager(UUID projectId, UUID userId) {
        Project p = projectRepository.findById(projectId)
                .orElseThrow(() -> DevFlowException.notFound("Project", projectId));
        boolean canManage = p.getOwnerId().equals(userId)
                || p.getMembers().stream().anyMatch(m -> m.getUserId().equals(userId)
                   && (m.getRole() == MemberRole.OWNER || m.getRole() == MemberRole.PROJECT_MANAGER));
        if (!canManage) throw DevFlowException.forbidden("manage this project");
        return p;
    }

    private void publishEvent(String topic, String key, String type, UUID aggId, UUID userId, Map<String, Object> payload) {
        try {
            DomainEvent event = DomainEvent.builder()
                    .eventType(type).aggregateId(aggId.toString()).aggregateType("PROJECT")
                    .userId(userId.toString()).payload(payload).build();
            if (kafkaTemplate != null) {
                kafkaTemplate.send(topic, key, event);
            } else {
                log.debug("[DEV-MODE] Kafka not available — skipping event publish (topic={}, type={})", topic, type);
            }
        } catch (Exception e) {
            // Kafka unavailable in local dev — log warning, do NOT propagate.
            // Data has already been persisted; events can be replayed later.
            log.warn("Kafka event publish failed (topic={}, type={}) — data was saved: {}",
                    topic, type, e.getMessage());
        }
    }

    private ProjectDTOs.ProjectResponse toProjectResponse(Project p) {
        ProjectDTOs.ProjectResponse r = new ProjectDTOs.ProjectResponse();
        r.setId(p.getId().toString());
        r.setName(p.getName());
        r.setKey(p.getKey());
        r.setDescription(p.getDescription());
        r.setStatus(p.getStatus().name());
        r.setVisibility(p.getVisibility().name());
        r.setOwnerId(p.getOwnerId().toString());
        r.setCreatedAt(p.getCreatedAt().toString());
        r.setMemberCount(p.getMembers().size());
        if (p.getStartDate()     != null) r.setStartDate(p.getStartDate().toString());
        if (p.getTargetEndDate() != null) r.setTargetEndDate(p.getTargetEndDate().toString());
        return r;
    }

    private ProjectDTOs.SprintResponse toSprintResponse(Sprint s) {
        ProjectDTOs.SprintResponse r = new ProjectDTOs.SprintResponse();
        r.setId(s.getId().toString());
        r.setName(s.getName());
        r.setGoal(s.getGoal());
        r.setStatus(s.getStatus().name());
        r.setPlannedPoints(s.getPlannedPoints());
        r.setCompletedPoints(s.getCompletedPoints());
        r.setVelocityFactor(s.getVelocityFactor());
        r.setRemainingDays(s.getRemainingDays());
        if (s.getStartDate() != null) r.setStartDate(s.getStartDate().toString());
        if (s.getEndDate()   != null) r.setEndDate(s.getEndDate().toString());
        return r;
    }
}
