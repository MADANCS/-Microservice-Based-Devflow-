package com.devflow.common.event;

/**
 * All Kafka topic names used across DevFlow microservices.
 * Single source of truth — avoids magic strings.
 */
public final class KafkaTopics {
    private KafkaTopics() {}

    // ── Auth ──────────────────────────────────────────
    public static final String USER_REGISTERED       = "devflow.auth.user-registered";
    public static final String USER_LOGIN            = "devflow.auth.user-login";
    public static final String PASSWORD_RESET        = "devflow.auth.password-reset";

    // ── Project ───────────────────────────────────────
    public static final String PROJECT_CREATED       = "devflow.project.created";
    public static final String PROJECT_UPDATED       = "devflow.project.updated";
    public static final String PROJECT_DELETED       = "devflow.project.deleted";
    public static final String SPRINT_STARTED        = "devflow.project.sprint-started";
    public static final String SPRINT_COMPLETED      = "devflow.project.sprint-completed";
    public static final String MEMBER_ADDED          = "devflow.project.member-added";
    public static final String MEMBER_REMOVED        = "devflow.project.member-removed";

    // ── Task ──────────────────────────────────────────
    public static final String TASK_CREATED          = "devflow.task.created";
    public static final String TASK_UPDATED          = "devflow.task.updated";
    public static final String TASK_STATUS_CHANGED   = "devflow.task.status-changed";
    public static final String TASK_ASSIGNED         = "devflow.task.assigned";
    public static final String TASK_COMMENTED        = "devflow.task.commented";
    public static final String TASK_DELETED          = "devflow.task.deleted";
    public static final String TIME_LOGGED           = "devflow.task.time-logged";

    // ── AI Engine ─────────────────────────────────────
    public static final String AI_STANDUP_GENERATED  = "devflow.ai.standup-generated";
    public static final String AI_RISK_DETECTED      = "devflow.ai.risk-detected";
    public static final String AI_SPRINT_PLANNED     = "devflow.ai.sprint-planned";
    public static final String AI_INSIGHT_READY      = "devflow.ai.insight-ready";

    // ── Notifications ─────────────────────────────────
    public static final String NOTIFICATION_SEND     = "devflow.notification.send";
    public static final String EMAIL_SEND            = "devflow.notification.email";
    public static final String SLACK_SEND            = "devflow.notification.slack";
    public static final String PUSH_SEND             = "devflow.notification.push";

    // ── Analytics ─────────────────────────────────────
    public static final String ANALYTICS_EVENT       = "devflow.analytics.event";
    public static final String METRICS_FLUSH         = "devflow.analytics.metrics-flush";

    // ── Integration ───────────────────────────────────
    public static final String GITHUB_PR_OPENED      = "devflow.integration.github.pr-opened";
    public static final String GITHUB_PR_MERGED      = "devflow.integration.github.pr-merged";
    public static final String GITHUB_COMMIT_PUSHED  = "devflow.integration.github.commit-pushed";

    // ── Real-time ─────────────────────────────────────
    public static final String REALTIME_BROADCAST    = "devflow.realtime.broadcast";
    public static final String PRESENCE_UPDATE       = "devflow.realtime.presence";
}
