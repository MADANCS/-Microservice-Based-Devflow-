-- V1__init_project_schema.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE projects (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name             VARCHAR(200) NOT NULL,
    project_key      VARCHAR(10)  NOT NULL UNIQUE,
    description      TEXT,
    avatar_url       VARCHAR(512),
    status           VARCHAR(30)  NOT NULL DEFAULT 'ACTIVE',
    visibility       VARCHAR(20)  NOT NULL DEFAULT 'PRIVATE',
    owner_id         UUID         NOT NULL,
    start_date       TIMESTAMP,
    target_end_date  TIMESTAMP,
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE project_members (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id  UUID        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id     UUID        NOT NULL,
    role        VARCHAR(30) NOT NULL DEFAULT 'DEVELOPER',
    joined_at   TIMESTAMP   NOT NULL DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

CREATE TABLE sprints (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id       UUID         NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name             VARCHAR(100) NOT NULL,
    goal             VARCHAR(500),
    status           VARCHAR(20)  NOT NULL DEFAULT 'PLANNED',
    start_date       DATE,
    end_date         DATE,
    planned_points   INT          NOT NULL DEFAULT 0,
    completed_points INT          NOT NULL DEFAULT 0,
    velocity_factor  DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    started_at       TIMESTAMP,
    completed_at     TIMESTAMP
);

CREATE TABLE epics (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id  UUID         NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title       VARCHAR(200) NOT NULL,
    description TEXT,
    color       VARCHAR(20)  DEFAULT '#6366F1',
    status      VARCHAR(20)  NOT NULL DEFAULT 'OPEN',
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_owner     ON projects(owner_id);
CREATE INDEX idx_projects_status    ON projects(status);
CREATE INDEX idx_sprints_project    ON sprints(project_id);
CREATE INDEX idx_sprints_status     ON sprints(status);
CREATE INDEX idx_members_project    ON project_members(project_id);
CREATE INDEX idx_members_user       ON project_members(user_id);
