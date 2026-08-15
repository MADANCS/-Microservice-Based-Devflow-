package com.devflow.gateway.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
public class FallbackController {

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> root() {
        return ResponseEntity.ok(Map.of(
                "service", "DevFlow API Gateway",
                "status", "UP",
                "platform", "Spring Boot 3.3 · Java 21",
                "actuatorHealth", "/actuator/health",
                "timestamp", LocalDateTime.now().toString()
        ));
    }

    @RequestMapping("/fallback")
    public ResponseEntity<Map<String, Object>> fallback() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of(
                "status", 503,
                "error", "SERVICE_UNAVAILABLE",
                "message", "The service is temporarily unavailable. Please try again later.",
                "timestamp", LocalDateTime.now().toString()
        ));
    }
}
