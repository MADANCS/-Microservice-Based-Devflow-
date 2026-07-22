package com.devflow.project.api.dto;

import lombok.Data;

public class ProjectSettingsDTOs {

    @Data
    public static class UpdateSettingsRequest {
        private String visibility;
        private String defaultPriority;
        private String defaultStatus;
        private Integer wipLimit;
        private Boolean archived;
        private Boolean allowMemberInvites;
    }

    @Data
    public static class SettingsResponse {
        private String projectId;
        private String visibility;
        private String defaultPriority;
        private String defaultStatus;
        private Integer wipLimit;
        private Boolean archived;
        private Boolean allowMemberInvites;
    }
}
