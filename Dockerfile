# Multi-stage Docker build for DevFlow Platform Backend & Ingress Gateway
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Copy parent pom and module sources
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

# Build and package executable JARs
RUN mvn clean package -DskipTests=true --batch-mode

# Runtime container stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy compiled API Gateway artifact
COPY --from=builder /app/api-gateway/target/api-gateway-*.jar app.jar

ENV PORT=9080
EXPOSE 9080

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
