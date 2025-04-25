# ----------------------------------------
# 🛠 Stage 1: Build Frontend
# ----------------------------------------
    FROM node:18-slim AS frontend-builder

    WORKDIR /app
    COPY src/main/frontend/package*.json ./
    RUN npm cache clean --force && npm install
    COPY src/main/frontend ./
    RUN npm run build
    
    # ----------------------------------------
    # 🔨 Stage 2: Build Backend
    # ----------------------------------------
    FROM maven:3.8.5-openjdk-11 AS backend-builder
    
    WORKDIR /app
    COPY pom.xml .
    COPY src ./src
    # 👇 Aquí copiamos el frontend ya builded al static/ del Spring Boot
    COPY --from=frontend-builder /app/dist/ ./src/main/resources/static/
    RUN mvn clean package -DskipTests
    
    # ----------------------------------------
    # 🚀 Stage 3: Run App
    # ----------------------------------------
    FROM openjdk:22-jdk-slim
    
    WORKDIR /app
    COPY --from=backend-builder /app/target/*.jar MyTodoList.jar
    EXPOSE 8080
    ENTRYPOINT ["java", "-jar", "MyTodoList.jar"]
    