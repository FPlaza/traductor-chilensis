package handler

import (
    "bytes"
    "net/http"
    "net/http/httptest"
    "testing"

    "github.com/gin-gonic/gin"
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