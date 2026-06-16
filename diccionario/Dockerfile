FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app

# Instalar Gradle 8.5 directamente
RUN apt-get update && apt-get install -y wget unzip && \
    wget -q https://services.gradle.org/distributions/gradle-8.5-bin.zip && \
    unzip -q gradle-8.5-bin.zip -d /opt && \
    rm gradle-8.5-bin.zip

ENV PATH="/opt/gradle-8.5/bin:$PATH"

COPY . .
# Eliminar el servidor gRPC que ya no se usa
RUN rm -f src/main/java/com/chilensis/diccionario/grpc/DiccionarioGrpcServer.java
RUN chmod +x gradlew
RUN gradle build -x test --no-daemon

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]