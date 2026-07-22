package com.devflow.project.api.controller;

import com.devflow.common.dto.ApiResponse;
import com.devflow.project.api.dto.ProjectDTOs;
import com.devflow.project.application.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Project REST Controller — 6 APIs:
 * POST   /api/v1/projects
 * GET    /api/v1/projects/{id}
 * GET    /api/v1/projects
 * PUT    /api/v1/projects/{id}
 * DELETE /api/v1/projects/{id}
 * POST   /api/v1/projects/{id}/members
 */
@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
@Tag(name = "Projects", description = "Project management endpoints")
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    @Operation(summary = "Create a new project")
    public ResponseEntity<ApiResponse<ProjectDTOs.ProjectResponse>> createProject(
            @Valid @RequestBody ProjectDTOs.CreateProjectRequest request,
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(projectService.createProject(request, UUID.fromString(userId))));
    }

    @GetMapping
    @Operation(summary = "List all projects accessible to the current user")
    public ResponseEntity<ApiResponse<Page<ProjectDTOs.ProjectResponse>>> getMyProjects(
            @RequestHeader("X-User-Id") String userId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(projectService.getMyProjects(UUID.fromString(userId), pageable)));
    }

    @GetMapping("/{projectId}")
    @Operation(summary = "Get project by ID")
    public ResponseEntity<ApiResponse<ProjectDTOs.ProjectResponse>> getProject(
            @PathVariable UUID projectId,
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(ApiResponse.ok(projectService.getProject(projectId, UUID.fromString(userId))));
    }

    @PutMapping("/{projectId}")
    @Operation(summary = "Update project details")
    public ResponseEntity<ApiResponse<ProjectDTOs.ProjectResponse>> updateProject(
            @PathVariable UUID projectId,
            @Valid @RequestBody ProjectDTOs.UpdateProjectRequest request,
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(ApiResponse.ok(projectService.updateProject(projectId, request, UUID.fromString(userId))));
    }

    @DeleteMapping("/{projectId}")
    @Operation(summary = "Delete a project (owner only)")
    public ResponseEntity<ApiResponse<Void>> deleteProject(
            @PathVariable UUID projectId,
            @RequestHeader("X-User-Id") String userId) {
        projectService.deleteProject(projectId, UUID.fromString(userId));
        return ResponseEntity.ok(ApiResponse.deleted());
    }

    @PostMapping("/{projectId}/members")
    @Operation(summary = "Add a member to the project")
    public ResponseEntity<ApiResponse<ProjectDTOs.MemberResponse>> addMember(
            @PathVariable UUID projectId,
            @Valid @RequestBody ProjectDTOs.AddMemberRequest request,
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(projectService.addMember(projectId, request, UUID.fromString(userId))));
    }

    @GetMapping("/{projectId}/settings")
    @Operation(summary = "Get project settings")
    public ResponseEntity<ApiResponse<com.devflow.project.api.dto.ProjectSettingsDTOs.SettingsResponse>> getSettings(
            @PathVariable UUID projectId,
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(ApiResponse.ok(projectService.getProjectSettings(projectId, UUID.fromString(userId))));
    }

    @PutMapping("/{projectId}/settings")
    @Operation(summary = "Update project settings")
    public ResponseEntity<ApiResponse<com.devflow.project.api.dto.ProjectSettingsDTOs.SettingsResponse>> updateSettings(
            @PathVariable UUID projectId,
            @RequestBody com.devflow.project.api.dto.ProjectSettingsDTOs.UpdateSettingsRequest request,
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(ApiResponse.ok(projectService.updateProjectSettings(projectId, request, UUID.fromString(userId))));
    }
}
