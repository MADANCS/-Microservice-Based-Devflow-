package com.devflow.ai.api.controller;

import com.devflow.ai.api.dto.AiDTOs;
import com.devflow.ai.application.service.AiService;
import com.devflow.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
@Tag(name = "AI Engine", description = "AI-powered automation features")
public class AiController {

    private final AiService aiService;

    @PostMapping("/standup")
    @Operation(summary = "Generate a daily standup update based on recent activity")
    public ResponseEntity<ApiResponse<AiDTOs.AiResponse>> generateStandup(
            @Valid @RequestBody AiDTOs.StandupRequest request,
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(ApiResponse.ok(aiService.generateStandup(request)));
    }

    @PostMapping("/risk-analysis")
    @Operation(summary = "Analyze sprint tasks for potential risks")
    public ResponseEntity<ApiResponse<AiDTOs.AiResponse>> analyzeRisk(
            @Valid @RequestBody AiDTOs.RiskAnalysisRequest request,
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(ApiResponse.ok(aiService.analyzeRisk(request)));
    }
    
    @PostMapping("/sprint-plan")
    @Operation(summary = "Suggest a sprint plan based on historical velocity")
    public ResponseEntity<ApiResponse<AiDTOs.AiResponse>> planSprint(
            @Valid @RequestBody AiDTOs.SprintPlanningRequest request,
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(ApiResponse.ok(aiService.planSprint(request)));
    }
}
