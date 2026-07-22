package com.devflow.ai.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.UUID;

public class AiDTOs {

    @Data
    public static class StandupRequest {
        @NotNull
        private UUID sprintId;
        @NotNull
        private UUID userId;
        private List<String> recentTaskUpdates;
    }

    @Data
    public static class RiskAnalysisRequest {
        @NotNull
        private UUID projectId;
        @NotNull
        private UUID sprintId;
        private List<String> sprintTasks;
    }
    
    @Data
    public static class SprintPlanningRequest {
        @NotNull
        private UUID projectId;
        private int historicalVelocity;
        private List<String> backlogTasks;
    }

    @Data
    public static class AiResponse {
        private String content;
        private String modelUsed;
    }
}
