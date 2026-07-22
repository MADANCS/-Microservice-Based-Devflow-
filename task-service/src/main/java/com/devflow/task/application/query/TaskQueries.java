package com.devflow.task.application.query;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

/**
 * CQRS Query objects — parameters for read side.
 */
public final class TaskQueries {

    @Data @Builder
    public static class GetTask {
        private UUID taskId;
        private UUID requesterId;
    }

    @Data @Builder
    public static class GetBoardTasks {
        private UUID projectId;
        private UUID sprintId;     // null = backlog
        private UUID requesterId;
    }

    @Data @Builder
    public static class GetTasksByAssignee {
        private UUID assigneeId;
        private String status;     // null = all
    }

    @Data @Builder
    public static class SearchTasks {
        private UUID projectId;
        private String keyword;
        private String status;
        private String priority;
        private UUID assigneeId;
        private UUID sprintId;
        private int page;
        private int size;
    }
}
