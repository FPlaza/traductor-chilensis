package main

import (
	"log"
	"os"

	"github.com/fplaza/traductor-chilensis/traductor/internal/handler"
	grpcclient "github.com/fplaza/traductor-chilensis/traductor/internal/grpc"
	"github.com/fplaza/traductor-chilensis/traductor/internal/model"
	"github.com/fplaza/traductor-chilensis/traductor/internal/repository"
	"github.com/fplaza/traductor-chilensis/traductor/internal/service"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	dbURL := getEnv("DATABASE_URL", "postgres://admin:admin_password@postgres:5432/db_traductor")
	diccionarioAddr := getEnv("DICCIONARIO_ADDR", "diccionario:8081")
	port := getEnv("PORT", "8080")

	db, err := gorm.Open(postgres.Open(dbURL), &gorm.Config{})
	if err != nil {
		log.Fatalf("Error conectando a PostgreSQL: %v", err)
	}
	log.Println("Conectado a PostgreSQL")

	if err := db.AutoMigrate(&model.Traduccion{}); err != nil {
		log.Fatalf("Error migrando schema: %v", err)
	}

	diccionarioClient, err := grpcclient.NewDiccionarioClient(diccionarioAddr)
	if err != nil {
		log.Fatalf("Error conectando a Diccionario: %v", err)
	}

	repo := repository.NewTraduccionRepository(db)
	svc := service.NewTraductorService(repo, diccionarioClient)
	h := handler.NewTraductorHandler(svc)

	r := gin.Default()
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	h.RegisterRoutes(r)
	log.Printf("Traductor corriendo en puerto %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Error iniciando servidor: %v", err)
	}
}

func getEnv(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}