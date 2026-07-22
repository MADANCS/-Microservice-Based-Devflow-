package com.devflow.auth.infrastructure.kafka;

import com.devflow.auth.domain.model.User;
import com.devflow.common.event.DomainEvent;
import com.devflow.common.event.KafkaTopics;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Publishes auth domain events to Kafka.
 * KafkaTemplate is optional — when Kafka is not available (local dev without Docker),
 * events are logged at DEBUG level and skipped gracefully.
 */
@Component
@Slf4j
public class AuthEventPublisher {

    @Autowired(required = false)
    private KafkaTemplate<String, DomainEvent> kafkaTemplate;

    public void publishUserRegistered(User user) {
        if (kafkaTemplate == null) {
            log.debug("[DEV-MODE] Kafka not available — skipping USER_REGISTERED event for {}", user.getEmail());
            return;
        }
        DomainEvent event = DomainEvent.builder()
                .eventType("USER_REGISTERED")
                .aggregateId(user.getId().toString())
                .aggregateType("USER")
                .userId(user.getId().toString())
                .payload(Map.of(
                        "email",    user.getEmail(),
                        "username", user.getUsername(),
                        "fullName", user.getFullName(),
                        "role",     user.getRole().name()
                ))
                .build();

        kafkaTemplate.send(KafkaTopics.USER_REGISTERED, user.getId().toString(), event)
                .whenComplete((r, ex) -> {
                    if (ex != null) log.error("Failed to publish USER_REGISTERED event", ex);
                    else log.debug("Published USER_REGISTERED for {}", user.getEmail());
                });
    }

    public void publishUserLogin(User user) {
        if (kafkaTemplate == null) {
            log.debug("[DEV-MODE] Kafka not available — skipping USER_LOGIN event for {}", user.getEmail());
            return;
        }
        DomainEvent event = DomainEvent.builder()
                .eventType("USER_LOGIN")
                .aggregateId(user.getId().toString())
                .aggregateType("USER")
                .userId(user.getId().toString())
                .payload(Map.of("email", user.getEmail(), "lastLoginAt", user.getLastLoginAt().toString()))
                .build();

        kafkaTemplate.send(KafkaTopics.USER_LOGIN, user.getId().toString(), event);
    }
}
