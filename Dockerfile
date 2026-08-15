# Multi-stage Docker build for DevFlow Platform Backend & Microservices
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Copy parent pom and all module directories so Maven parent pom validation succeeds
COPY pom.xml .
COPY common-lib common-lib
COPY api-gateway api-gateway
COPY auth-service auth-service
COPY project-service project-service
COPY task-service task-service
COPY ai-engine ai-engine
COPY notification-service notification-service
COPY analytics-service analytics-service
COPY integration-service integration-service
COPY realtime-service realtime-service

# Build and package core microservice JARs (-pl targets active services, -am includes common-lib)
RUN mvn clean package -pl api-gateway,auth-service,project-service,task-service,ai-engine -am -DskipTests=true --batch-mode

# Runtime container stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN mkdir -p /app/apps

# Copy compiled microservice artifacts
COPY --from=builder /app/api-gateway/target/api-gateway-*.jar /app/apps/api-gateway.jar
COPY --from=builder /app/auth-service/target/auth-service-*.jar /app/apps/auth-service.jar
COPY --from=builder /app/project-service/target/project-service-*.jar /app/apps/project-service.jar
COPY --from=builder /app/task-service/target/task-service-*.jar /app/apps/task-service.jar
COPY --from=builder /app/ai-engine/target/ai-engine-*.jar /app/apps/ai-engine.jar

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENV PORT=9080
EXPOSE 9080

ENTRYPOINT ["/app/entrypoint.sh"]
