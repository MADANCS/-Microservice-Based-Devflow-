package com.devflow.common.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * Base Kafka event envelope shared by all DevFlow microservices.
 * All domain events extend this or use it as a wrapper.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DomainEvent {

    @Builder.Default
    private String eventId = UUID.randomUUID().toString();

    private String eventType;          // e.g. "TASK_CREATED", "SPRINT_STARTED"
    private String aggregateId;        // entity UUID
    private String aggregateType;      // e.g. "TASK", "PROJECT"
    private String userId;             // actor
    private String tenantId;           // workspace/org
    private Object payload;            // serialized domain payload

    @Builder.Default
    private Instant occurredAt = Instant.now();

    private Map<String, String> metadata;  // traceId, correlationId, etc.
}
