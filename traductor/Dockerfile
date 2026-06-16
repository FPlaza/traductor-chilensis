FROM golang:1.23-alpine AS builder
WORKDIR /app
COPY . .
ENV GOFLAGS="-mod=mod"
ENV GONOSUMDB="*"
ENV GONOSUMCHECK="*"
ENV GOTELEMETRY=off
RUN go build -o traductor ./cmd/main.go

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/traductor .
EXPOSE 8080
CMD ["./traductor"]