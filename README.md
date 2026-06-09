# Proyecto: Traductor Chilensis

## Requisitos Previos
1. Tener el repositorio clonado.
2. Tener **Docker Desktop** abierto.

---

## Paso 1: Descargar las imágenes base
Descargar las imágenes de cada lenguaje una por una. Abrir terminal en la raíz del proyecto y ejecutar:

```bash
docker pull node:22-alpine
docker pull node:20-alpine
docker pull rust:latest
docker pull maven:3.9-eclipse-temurin-17
docker pull golang:1.21-alpine
docker pull postgres:15-alpine
```


## Paso 2: Construir los microservicios
Construir cada microservicio uno por uno. En la terminal, ejecutar:

```bash
docker-compose build api-gateway
docker-compose build frontend
docker-compose build sugerencias
docker-compose build traductor
docker-compose build diccionario
docker-compose build contexto
```

## Paso 3: Levantar arquitectura
Luego de haber construido todo, se debe levantar el docker. En la terminal, ejecutar:

```bash
docker-compose up -d
```

*Verificar que estén los contenedores ejecutándose en Docker.

---

## Puertos y uso

* Frontend: http://localhost:5173
* API Gateway: http://localhost:4000

Una vez construidos los contenedores, se podrán gestionar directamente desde Docker Desktop, no siendo necesario ejecutar los comandos cada vez.

### Instalación de librerías utilizando Docker
Para no instalar todos los lenguajes en nuestro equipo, se puede acceder a la terminal del contenedor ejecutando:

Frontend (React/Vite):
```bash
docker-compose exec frontend sh
```

API Gateway (NestJS):
```bash
docker-compose exec api-gateway sh
```

Sugerencias (NestJS):
```bash
docker-compose exec sugerencias sh
```

Traductor (Go):
```bash
docker-compose run --rm traductor sh
```

Contexto (Rust):
```bash
docker-compose run --rm contexto bash
```


Diccionario (Java):
```bash
docker-compose run --rm diccionario bash
```

Una vez dentro, puedes ejecutar los comandos nativos de ese entorno (ej: npm install axios, go get, cargo add, etc).

Para salir, simplemente escribir 'exit'.