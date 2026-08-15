#!/bin/sh
echo "=========================================================="
echo "🚀 Starting DevFlow Core Microservices Platform..."
echo "=========================================================="

# Start core backend microservices in background with optimized RAM limits for Render
[ -f /app/apps/auth-service.jar ] && java -Xmx64m -jar /app/apps/auth-service.jar > /tmp/auth.log 2>&1 &
[ -f /app/apps/project-service.jar ] && java -Xmx64m -jar /app/apps/project-service.jar > /tmp/project.log 2>&1 &
[ -f /app/apps/task-service.jar ] && java -Xmx64m -jar /app/apps/task-service.jar > /tmp/task.log 2>&1 &
[ -f /app/apps/ai-engine.jar ] && java -Xmx64m -jar /app/apps/ai-engine.jar > /tmp/ai.log 2>&1 &

echo "Waiting for core microservices to initialize..."
sleep 5

echo "Starting DevFlow API Gateway ingress on port ${PORT:-9080}..."
exec java -Xmx128m -jar /app/apps/api-gateway.jar
