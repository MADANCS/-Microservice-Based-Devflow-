-- V1__init_auth_schema.sql
-- DevFlow Auth Service — Initial Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email                 VARCHAR(100) NOT NULL UNIQUE,
    username              VARCHAR(50)  NOT NULL UNIQUE,
    password_hash         VARCHAR(255) NOT NULL,
    full_name             VARCHAR(100) NOT NULL,
    avatar_url            VARCHAR(512),
    timezone              VARCHAR(50)  DEFAULT 'UTC',
    role                  VARCHAR(30)  NOT NULL DEFAULT 'MEMBER',
    status                VARCHAR(30)  NOT NULL DEFAULT 'PENDING_VERIFICATION',
    mfa_enabled           BOOLEAN      NOT NULL DEFAULT FALSE,
    mfa_secret            VARCHAR(255),
    oauth_provider        VARCHAR(30),
    oauth_provider_id     VARCHAR(255),
    created_at            TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMP    NOT NULL DEFAULT NOW(),
    last_login_at         TIMESTAMP,
    failed_login_attempts INT          NOT NULL DEFAULT 0,
    locked_until          TIMESTAMP
);

CREATE INDEX idx_users_email    ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_status   ON users(status);

-- Seed: default admin user (password: Admin@devflow2026)
INSERT INTO users (id, email, username, password_hash, full_name, role, status)
VALUES (
    uuid_generate_v4(),
    'admin@devflow.io',
    'admin',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq6aVKe',
    'DevFlow Admin',
    'ADMIN',
    'ACTIVE'
);
