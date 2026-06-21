# 🇨🇱 Traductor Chilensis — Proyecto Microservicios

Sistema distribuido para traducir modismos chilenos a español neutro, con variaciones regionales (Norte, Centro, Sur).

---

## 🏗️ Arquitectura

```
Frontend (React/Vite)
        ↓ GraphQL
   API Gateway (NestJS)
   ┌────┬────┬────┐
   ↓    ↓    ↓    ↓
 gRPC REST REST  REST
   ↓    ↓    ↓    ↓
Diccio Tradu Conte Sugere
(Java) (Go)  (Rust)(NestJS)
   ↓    ↓    ↓    ↓
  DB   DB   DB   DB
 (PG) (PG) (PG) (PG)
```

### Protocolos de comunicación
- **gRPC** → API Gateway ↔ Diccionario (Java), Traductor ↔ Contexto (Rust)
- **REST/HTTP** → API Gateway ↔ Traductor, Sugerencias, Contexto
- **GraphQL** → Frontend ↔ API Gateway

---

## 🛠️ Tecnologías

| Servicio | Lenguaje | Puerto | DB |
|---|---|---|---|
| frontend | TypeScript/React | 5173 | - |
| api-gateway | TypeScript/NestJS | 4000 | - |
| traductor | Go + Gin + GORM | 8080 | db_traductor |
| diccionario | Java + Spring Boot | 8081/50051 | db_diccionario |
| contexto | Rust + Actix-web | 8082/50052 | db_contexto |
| sugerencias | TypeScript/NestJS | 3001 | db_sugerencias |

---

## 🚀 Cómo correr el proyecto

### Con Docker Compose (desarrollo)

```bash
# 1. Descargar imágenes base
docker pull node:22-alpine
docker pull node:20-alpine
docker pull rust:latest
docker pull maven:3.9-eclipse-temurin-17
docker pull golang:1.21-alpine
docker pull postgres:15-alpine
docker pull nats:latest

# 2. Construir todos los servicios
docker-compose build

# 3. Levantar
docker-compose up -d

# 4. Ver logs
docker-compose logs -f
```

**URLs disponibles:**
- Frontend: http://localhost:5173
- GraphQL Playground: http://localhost:4000/graphql
- NATS Monitoring: http://localhost:8222

---

### Con Kubernetes (producción)

```bash
# Pre-requisitos: minikube o kind instalado

# 1. Iniciar minikube
minikube start

# 2. Construir imágenes dentro de minikube
eval $(minikube docker-env)
docker-compose build

# 3. Aplicar manifiestos
kubectl apply -f k8s/00-namespace.yaml
kubectl apply -f k8s/01-postgres.yaml
kubectl apply -f k8s/02-nats.yaml
kubectl apply -f k8s/03-microservicios.yaml

# 4. Verificar pods
kubectl get pods -n chilensis

# 5. Acceder a los servicios
minikube service api-gateway-service -n chilensis
minikube service frontend-service -n chilensis
```

---

## 🧪 Ejecutar Tests

```bash
# Go (Traductor)
docker run --rm -v "%cd%/traductor:/app" -v go-cache:/go/pkg/mod -w /app golang:1.25 bash -c "go mod tidy && go test ./... -v -cover"

# Java (Diccionario)
docker-compose exec diccionario ./gradlew test

# Rust (Contexto)
docker-compose exec contexto cargo test

# NestJS (Sugerencias)
docker-compose exec sugerencias npm test -- --coverage

# NestJS (API Gateway)
docker-compose exec api-gateway npm test -- --coverage
```

---

## 📊 Ejemplo de uso GraphQL

```graphql
# Traducir una frase
mutation {
  traducir(texto: "Oye huevón, ¿cachái? Eso estuvo bacán al tiro", region: "Centro") {
    textoOriginal
    textoTraducido
    palabrasDetectadas
  }
}

# Proponer un modismo nuevo
mutation {
  crearSugerencia(input: {
    palabra: "filete"
    traduccionPropuesta: "excelente / muy bueno"
    region: "Centro"
  }) {
    id
    estado
  }
}

# Ver historial de traducciones
query {
  historial(limit: 10) {
    traducciones {
      textoOriginal
      textoTraducido
      createdAt
    }
    total
  }
}
```

---

## ✅ Checklist de requisitos

- [x] ≥ 3 microservicios dockerizados (tenemos 4 + gateway + frontend)
- [x] ≥ 2 protocolos distintos (gRPC + REST, con GraphQL al cliente)
- [x] Backend bajo cluster K8s (manifiestos en `/k8s`)
- [x] API Gateway con GraphQL
- [x] ≥ 60% cobertura de tests en cada servicio
- [x] Cada servicio con su propia DB (db_traductor, db_diccionario, db_contexto, db_sugerencias)
- [x] ≥ 3 lenguajes distintos (TypeScript, Go, Java, Rust)
- [x] ORM en todos los servicios (TypeORM, GORM, Hibernate, SQLx)
