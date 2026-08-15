#!/bin/sh
echo "=========================================================="
echo "🚀 Starting DevFlow Full Microservices Platform..."
echo "=========================================================="

# Start backend microservices in background with tuned memory limits
java -Xmx96m -jar /app/apps/auth-service.jar > /tmp/auth.log 2>&1 &
java -Xmx96m -jar /app/apps/project-service.jar > /tmp/project.log 2>&1 &
java -Xmx96m -jar /app/apps/task-service.jar > /tmp/task.log 2>&1 &
java -Xmx96m -jar /app/apps/ai-engine.jar > /tmp/ai.log 2>&1 &
java -Xmx96m -jar /app/apps/notification-service.jar > /tmp/notif.log 2>&1 &
java -Xmx96m -jar /app/apps/analytics-service.jar > /tmp/analytics.log 2>&1 &
java -Xmx96m -jar /app/apps/integration-service.jar > /tmp/integration.log 2>&1 &
java -Xmx96m -jar /app/apps/realtime-service.jar > /tmp/realtime.log 2>&1 &

echo "Waiting for core microservices to initialize..."
sleep 8

echo "Starting DevFlow API Gateway ingress on port ${PORT:-9080}..."
exec java -Xmx128m -jar /app/apps/api-gateway.jar
