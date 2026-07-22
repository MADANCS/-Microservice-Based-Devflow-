FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/task-service-*.jar app.jar
EXPOSE 8083
ENTRYPOINT ["java","-XX:+UseContainerSupport","-XX:MaxRAMPercentage=75.0","-jar","app.jar"]
