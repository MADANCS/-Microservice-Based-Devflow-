FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/project-service-*.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java","-XX:+UseContainerSupport","-XX:MaxRAMPercentage=75.0","-jar","app.jar"]
