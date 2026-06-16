package handler

import (
	"net/http"
	"strconv"

	"github.com/fplaza/traductor-chilensis/traductor/internal/model"
	"github.com/fplaza/traductor-chilensis/traductor/internal/service"
	"github.com/gin-gonic/gin"
)

type TraductorHandler struct {
	service *service.TraductorService
}

func NewTraductorHandler(svc *service.TraductorService) *TraductorHandler {
	return &TraductorHandler{service: svc}
}

func (h *TraductorHandler) RegisterRoutes(r *gin.Engine) {
	api := r.Group("/api")
	{
		api.POST("/traducir", h.Traducir)
		api.GET("/historial", h.ObtenerHistorial)
		api.GET("/health", h.Health)
	}
}

// Traducir godoc
// @Summary Traduce un texto con modismos chilenos
// @Param request body model.TraducirRequest true "Texto a traducir"
// @Success 200 {object} model.TraducirResponse
func (h *TraductorHandler) Traducir(c *gin.Context) {
	var req model.TraducirRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "El campo 'texto' es requerido",
		})
		return
	}

	resp, err := h.service.Traducir(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, resp)
}

func (h *TraductorHandler) ObtenerHistorial(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "20")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 20
	}

	historial, err := h.service.ObtenerHistorial(limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, historial)
}

func (h *TraductorHandler) Health(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":  "ok",
		"service": "traductor",
	})
}
