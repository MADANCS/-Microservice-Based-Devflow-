package com.devflow.auth.api.controller;

import com.devflow.auth.api.dto.TeamDTOs;
import com.devflow.auth.application.TeamService;
import com.devflow.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/team/members")
@RequiredArgsConstructor
@Tag(name = "Team Management", description = "Endpoints for managing team members")
public class TeamController {

    private final TeamService teamService;

    @GetMapping
    @Operation(summary = "Get all team members or search members by query")
    public ResponseEntity<ApiResponse<List<TeamDTOs.MemberResponse>>> getAllMembers(
            @RequestParam(value = "search", required = false) String search) {
        return ResponseEntity.ok(ApiResponse.ok(teamService.getAllMembers(search)));
    }

    @PostMapping
    @Operation(summary = "Add a new team member")
    public ResponseEntity<ApiResponse<TeamDTOs.MemberResponse>> createMember(
            @Valid @RequestBody TeamDTOs.CreateMemberRequest request) {
        TeamDTOs.MemberResponse member = teamService.createMember(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(member));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update team member details, role, or assignments")
    public ResponseEntity<ApiResponse<TeamDTOs.MemberResponse>> updateMember(
            @PathVariable String id,
            @RequestBody TeamDTOs.UpdateMemberRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(teamService.updateMember(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a team member")
    public ResponseEntity<ApiResponse<Void>> deleteMember(@PathVariable String id) {
        teamService.deleteMember(id);
        return ResponseEntity.ok(ApiResponse.deleted());
    }
}
