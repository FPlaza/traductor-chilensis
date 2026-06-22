package handler

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/fplaza/traductor-chilensis/traductor/internal/model"
	"github.com/fplaza/traductor-chilensis/traductor/internal/repository"
	"github.com/fplaza/traductor-chilensis/traductor/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

func TestHealth(t *testing.T) {
	gin.SetMode(gin.TestMode)

	h := NewTraductorHandler(nil)

	r := gin.Default()
	h.RegisterRoutes(r)

	req, _ := http.NewRequest(http.MethodGet, "/api/health", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Esperaba código %d, obtuve %d", http.StatusOK, w.Code)
	}
}

func TestTraducir_BadRequest(t *testing.T) {
	gin.SetMode(gin.TestMode)
	h := NewTraductorHandler(nil)
	r := gin.Default()
	h.RegisterRoutes(r)

	cuerpoJSON := bytes.NewBuffer([]byte(`{json_invalido}`))
	req, _ := http.NewRequest(http.MethodPost, "/api/traducir", cuerpoJSON)
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Esperaba código %d, obtuve %d", http.StatusBadRequest, w.Code)
	}
}

func TestObtenerHistorial_Exito(t *testing.T) {
	gin.SetMode(gin.TestMode)

	db, _ := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	db.AutoMigrate(&model.Traduccion{})
	repo := repository.NewTraduccionRepository(db)
	
	svc := service.NewTraductorService(repo, nil)
	h := NewTraductorHandler(svc)

	r := gin.Default()
	h.RegisterRoutes(r)

	req, _ := http.NewRequest(http.MethodGet, "/api/historial?limit=5", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Esperaba código %d, obtuve %d", http.StatusOK, w.Code)
	}
}

func TestObtenerHistorial_LimiteInvalido(t *testing.T) {
	gin.SetMode(gin.TestMode)

	db, _ := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	db.AutoMigrate(&model.Traduccion{})
	repo := repository.NewTraduccionRepository(db)
	svc := service.NewTraductorService(repo, nil)
	
	h := NewTraductorHandler(svc)
	r := gin.Default()
	h.RegisterRoutes(r)

	req, _ := http.NewRequest(http.MethodGet, "/api/historial?limit=abc", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Esperaba código %d, obtuve %d", http.StatusOK, w.Code)
	}
}