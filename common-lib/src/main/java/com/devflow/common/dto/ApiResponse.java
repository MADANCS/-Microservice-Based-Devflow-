package com.devflow.common.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

/**
 * Generic paginated API response wrapper.
 */
@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private boolean success;
    private String message;
    private T data;
    private PageMeta page;

    public static <T> ApiResponse<T> ok(T data) {
        return ApiResponse.<T>builder().success(true).data(data).build();
    }

    public static <T> ApiResponse<T> ok(String message, T data) {
        return ApiResponse.<T>builder().success(true).message(message).data(data).build();
    }

    public static <T> ApiResponse<T> created(T data) {
        return ApiResponse.<T>builder().success(true).message("Created successfully").data(data).build();
    }

    public static ApiResponse<Void> deleted() {
        return ApiResponse.<Void>builder().success(true).message("Deleted successfully").build();
    }

    @Data
    @Builder
    public static class PageMeta {
        private long totalElements;
        private int totalPages;
        private int page;
        private int size;
        private boolean hasNext;
        private boolean hasPrevious;
    }
}
