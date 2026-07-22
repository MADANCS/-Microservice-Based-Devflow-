package com.devflow.project.api.controller;

import com.devflow.common.dto.ApiResponse;
import com.devflow.project.api.dto.ProjectDTOs;
import com.devflow.project.application.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Sprint Controller — 3 APIs:
 * POST  /api/v1/projects/{id}/sprints        — create sprint
 * POST  /api/v1/projects/{id}/sprints/{sid}/start    — start sprint
 * POST  /api/v1/projects/{id}/sprints/{sid}/complete — complete sprint
 */
@RestController
@RequestMapping("/api/v1/projects/{projectId}/sprints")
@RequiredArgsConstructor
@Tag(name = "Sprints", description = "Sprint lifecycle management")
public class SprintController {

    private final ProjectService projectService;

    @PostMapping
    @Operation(summary = "Create a new sprint in a project")
    public ResponseEntity<ApiResponse<ProjectDTOs.SprintResponse>> createSprint(
            @PathVariable UUID projectId,
            @Valid @RequestBody ProjectDTOs.CreateSprintRequest request,
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(projectService.createSprint(projectId, request, UUID.fromString(userId))));
    }

    @PostMapping("/{sprintId}/start")
    @Operation(summary = "Start a planned sprint")
    public ResponseEntity<ApiResponse<ProjectDTOs.SprintResponse>> startSprint(
            @PathVariable UUID projectId,
            @PathVariable UUID sprintId,
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(ApiResponse.ok(projectService.startSprint(projectId, sprintId, UUID.fromString(userId))));
    }
}
