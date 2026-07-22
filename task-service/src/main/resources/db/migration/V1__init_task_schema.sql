-- V1__init_task_schema.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE tasks (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_key         VARCHAR(20)  NOT NULL UNIQUE,
    title            VARCHAR(500) NOT NULL,
    description      TEXT,
    status           VARCHAR(20)  NOT NULL DEFAULT 'TODO',
    priority         VARCHAR(20)  NOT NULL DEFAULT 'MEDIUM',
    type             VARCHAR(20)  NOT NULL DEFAULT 'STORY',
    project_id       UUID         NOT NULL,
    sprint_id        UUID,
    epic_id          UUID,
    assignee_id      UUID,
    reporter_id      UUID         NOT NULL,
    story_points     INT          NOT NULL DEFAULT 0,
    position         INT          NOT NULL DEFAULT 0,
    due_date         TIMESTAMP,
    estimated_hours  DOUBLE PRECISION NOT NULL DEFAULT 0,
    logged_hours     DOUBLE PRECISION NOT NULL DEFAULT 0,
    parent_task_id   UUID,
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    resolved_at      TIMESTAMP
);

CREATE TABLE task_comments (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id     UUID    NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    author_id   UUID    NOT NULL,
    content     TEXT    NOT NULL,
    edited      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    edited_at   TIMESTAMP
);

CREATE TABLE time_logs (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id     UUID             NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id     UUID             NOT NULL,
    hours       DOUBLE PRECISION NOT NULL,
    description VARCHAR(500),
    log_date    DATE             NOT NULL DEFAULT CURRENT_DATE,
    created_at  TIMESTAMP        NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_project   ON tasks(project_id);
CREATE INDEX idx_tasks_sprint    ON tasks(sprint_id);
CREATE INDEX idx_tasks_assignee  ON tasks(assignee_id);
CREATE INDEX idx_tasks_status    ON tasks(status);
CREATE INDEX idx_tasks_priority  ON tasks(priority);
CREATE INDEX idx_tasks_key       ON tasks(task_key);
CREATE INDEX idx_comments_task   ON task_comments(task_id);
CREATE INDEX idx_time_logs_task  ON time_logs(task_id);
CREATE INDEX idx_time_logs_user  ON time_logs(user_id);
