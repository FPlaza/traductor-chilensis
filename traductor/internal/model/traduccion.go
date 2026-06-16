package model

import (
	"time"

	"gorm.io/gorm"
)

type Traduccion struct {
	ID                uint           `gorm:"primarykey" json:"id"`
	TextoOriginal     string         `gorm:"column:texto_original;not null" json:"texto_original"`
	TextoTraducido    string         `gorm:"column:texto_traducido;not null" json:"texto_traducido"`
	Region            string         `gorm:"column:region;default:Centro" json:"region"`
	PalabrasDetectadas []string      `gorm:"column:palabras_detectadas;serializer:json" json:"palabras_detectadas"`
	CreatedAt         time.Time      `json:"created_at"`
	DeletedAt         gorm.DeletedAt `gorm:"index" json:"-"`
}

func (Traduccion) TableName() string {
	return "traducciones"
}

// DTOs
type TraducirRequest struct {
	Texto  string `json:"texto" binding:"required"`
	Region string `json:"region"`
}

type TraducirResponse struct {
	TextoOriginal     string   `json:"texto_original"`
	TextoTraducido    string   `json:"texto_traducido"`
	Region            string   `json:"region"`
	PalabrasDetectadas []string `json:"palabras_detectadas"`
}

type HistorialResponse struct {
	Traducciones []Traduccion `json:"traducciones"`
	Total        int64        `json:"total"`
}
