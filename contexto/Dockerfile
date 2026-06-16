FROM rust:latest AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y protobuf-compiler && rm -rf /var/lib/apt/lists/*
# El proto se copia desde el docker-compose que usa context: .
COPY proto/ /proto/
COPY contexto/ .
RUN cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y libssl3 ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=builder /app/target/release/contexto .
EXPOSE 8082 50052
CMD ["./contexto"]