FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/ai-engine-*.jar app.jar
EXPOSE 8084
ENTRYPOINT ["java","-XX:+UseContainerSupport","-XX:MaxRAMPercentage=75.0","-jar","app.jar"]
