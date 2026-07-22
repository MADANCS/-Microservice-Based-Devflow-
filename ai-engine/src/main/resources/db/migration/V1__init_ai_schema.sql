-- V1__init_ai_schema.sql
-- For future AI history logging. Empty for now to let Flyway run successfully.

CREATE TABLE ai_insights_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID,
    sprint_id UUID,
    insight_type VARCHAR(50),
    content TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
