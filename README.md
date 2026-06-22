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
 REST REST REST gRPC
   ↓    ↓    ↓    ↓
Diccio Tradu Sugere Conte
(Java) (Go) (NestJS)(Rust)
   ↓    ↓    ↓    ↓
  DB   DB   DB   DB
 (PG) (PG) (PG) (PG)
```

### Protocolos de comunicación
- **gRPC** → Contexto (Rust) expone gRPC en puerto 50052
- **REST/HTTP** → Comunicación entre microservicios
- **GraphQL** → Frontend ↔ API Gateway

---

## 🛠️ Tecnologías

| Servicio | Lenguaje | Puerto | DB |
|---|---|---|---|
| frontend | TypeScript/React | 5173 | - |
| api-gateway | TypeScript/NestJS | 3000 | - |
| traductor | Go + Gin + GORM | 8080 | db_traductor |
| diccionario | Java + Spring Boot | 8081 | db_diccionario |
| contexto | Rust + Actix-web | 8082/50052 | db_contexto |
| sugerencias | TypeScript/NestJS | 3001 | db_sugerencias |

---

## 🚀 Opción 1 — Docker Compose (desarrollo local)

```bash
# 1. Instalar dependencias Node (primera vez)
cd sugerencias && npm install && cd ..
cd api-gateway && npm install && cd ..
cd frontend && npm install && cd ..

# 2. Construir imágenes
docker-compose build

# 3. Levantar todo
docker-compose up -d

# 4. Ver logs
docker-compose logs -f
```

**URLs:**
- Frontend: http://localhost:5173
- GraphQL Playground: http://localhost:4000/graphql
- NATS Monitoring: http://localhost:8222

---

## ☸️ Opción 2 — Kubernetes con Minikube

### Pre-requisitos
```bash
brew install kubectl
brew install minikube
```

### Pasos

```bash
# 1. Iniciar minikube con Docker
minikube start --driver=docker --memory=4096 --cpus=4

# 2. Apuntar Docker al contexto de minikube
eval $(minikube docker-env)

# 3. Construir imágenes DENTRO de minikube
docker-compose build

# 4. Aplicar namespace, postgres y nats
kubectl apply -f k8s/00-namespace.yaml
kubectl apply -f k8s/01-postgres.yaml
kubectl apply -f k8s/02-nats.yaml

# 5. Crear ConfigMap del init.sql (OBLIGATORIO antes de que postgres arranque)
kubectl create configmap postgres-init-sql \
  --from-file=init.sql=db/init.sql \
  -n chilensis

# 6. Aplicar microservicios
kubectl apply -f k8s/03-microservicios.yaml

# 7. Quitar readinessProbe del api-gateway y diccionario (evita que queden en 0/1)
kubectl patch deployment api-gateway -n chilensis --type=json \
  -p='[{"op":"remove","path":"/spec/template/spec/containers/0/readinessProbe"}]'
kubectl patch deployment diccionario -n chilensis --type=json \
  -p='[{"op":"remove","path":"/spec/template/spec/containers/0/readinessProbe"}]'

# 8. Verificar que todos los pods estén Running (puede tomar 2-3 minutos)
kubectl get pods -n chilensis

# 9. Abrir el api-gateway en una terminal y anotar el puerto
# Terminal 1
minikube service api-gateway-service -n chilensis
# Ejemplo: http://127.0.0.1:51807  → puerto es 51807

# 10. Rebuilder el frontend con ese puerto (reemplazar PUERTO con el real)
# Terminal 2
eval $(minikube docker-env)
docker build --no-cache \
  --build-arg VITE_GRAPHQL_URL=http://127.0.0.1:PUERTO/graphql \
  -t traductor-chilensis-frontend:latest \
  ./frontend
kubectl rollout restart deployment/frontend -n chilensis

# 11. Abrir el frontend
minikube service frontend-service -n chilensis
```

### Comandos útiles
```bash
# Ver estado de todos los pods
kubectl get pods -n chilensis

# Ver logs de un servicio
kubectl logs deployment/traductor -n chilensis
kubectl logs deployment/diccionario -n chilensis

# Reiniciar un deployment
kubectl rollout restart deployment/traductor -n chilensis

# Ver todos los recursos
kubectl get all -n chilensis

# Detener minikube
minikube stop

# Volver al Docker normal
eval $(minikube docker-env -u)

# Limpiar todo y empezar de cero
minikube delete
```

---

## 🧪 Ejecutar Tests

```bash
# Go (Traductor)
docker run --rm -v "%cd%/traductor:/app" -v go-cache:/go/pkg/mod -w /app golang:1.25 bash -c "go mod tidy && go test ./... -v -cover"

# Java (Diccionario)
docker run --rm -v "%cd%/diccionario:/app" -v gradle-cache:/home/gradle/.gradle -w /app gradle:8.5-jdk17 gradle test

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
  traducir(texto: "Oye weon, cachai? Eso estuvo bacan al tiro", region: "Centro") {
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

- [x] ≥ 3 microservicios dockerizados (4 + gateway + frontend)
- [x] ≥ 2 protocolos distintos (gRPC en Contexto + REST + GraphQL)
- [x] Backend bajo cluster K8s (manifiestos en `/k8s`)
- [x] API Gateway con GraphQL
- [x] ≥ 60% cobertura de tests en cada servicio
- [x] Cada servicio con su propia DB
- [x] ≥ 3 lenguajes distintos (TypeScript, Go, Java, Rust)
- [x] ORM en todos los servicios (TypeORM, GORM, Hibernate, SQLx)