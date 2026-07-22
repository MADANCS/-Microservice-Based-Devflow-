package com.devflow.project.domain.model;

import jakarta.persistence.Embeddable;
import lombok.*;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectSettings {

    @Builder.Default
    private String visibility = "PRIVATE"; // PUBLIC, PRIVATE, INTERNAL

    @Builder.Default
    private String defaultPriority = "MEDIUM"; // LOW, MEDIUM, HIGH, CRITICAL

    @Builder.Default
    private String defaultStatus = "TODO"; // TODO, IN_PROGRESS

    @Builder.Default
    private Integer wipLimit = 10;

    @Builder.Default
    private Boolean archived = false;

    @Builder.Default
    private Boolean allowMemberInvites = true;
}
