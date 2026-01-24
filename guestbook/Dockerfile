# Use Maven with JDK 21 to build the application
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy the pom.xml and source code
COPY pom.xml .
COPY src ./src

# Package the application
RUN mvn clean package -DskipTests

# Use a slim JRE for the final image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy the fat JAR from the build stage
COPY --from=build /app/target/guestbook-1.0-SNAPSHOT.jar app.jar

# Expose the default port
EXPOSE 8080

# Run the application
CMD ["java", "-jar", "app.jar"]
