package com.devflow.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Base exception for all DevFlow business logic errors.
 */
public class DevFlowException extends RuntimeException {

    private final HttpStatus status;
    private final String errorCode;

    public DevFlowException(String message, HttpStatus status, String errorCode) {
        super(message);
        this.status = status;
        this.errorCode = errorCode;
    }

    public DevFlowException(String message, HttpStatus status) {
        this(message, status, status.name());
    }

    public HttpStatus getStatus() { return status; }
    public String getErrorCode() { return errorCode; }

    // ── Convenience factory methods ──────────────────────────

    public static DevFlowException notFound(String resource, Object id) {
        return new DevFlowException(resource + " not found with id: " + id,
                HttpStatus.NOT_FOUND, "RESOURCE_NOT_FOUND");
    }

    public static DevFlowException forbidden(String action) {
        return new DevFlowException("You are not authorized to " + action,
                HttpStatus.FORBIDDEN, "FORBIDDEN");
    }

    public static DevFlowException conflict(String message) {
        return new DevFlowException(message, HttpStatus.CONFLICT, "CONFLICT");
    }

    public static DevFlowException badRequest(String message) {
        return new DevFlowException(message, HttpStatus.BAD_REQUEST, "BAD_REQUEST");
    }

    public static DevFlowException serviceUnavailable(String service) {
        return new DevFlowException(service + " is currently unavailable",
                HttpStatus.SERVICE_UNAVAILABLE, "SERVICE_UNAVAILABLE");
    }
}
