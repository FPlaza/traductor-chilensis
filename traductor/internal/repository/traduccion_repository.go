package repository

import (
	"github.com/fplaza/traductor-chilensis/traductor/internal/model"
	"gorm.io/gorm"
)

type TraduccionRepository struct {
	db *gorm.DB
}

func NewTraduccionRepository(db *gorm.DB) *TraduccionRepository {
	return &TraduccionRepository{db: db}
}

func (r *TraduccionRepository) Guardar(t *model.Traduccion) error {
	return r.db.Create(t).Error
}

func (r *TraduccionRepository) ObtenerHistorial(limit int) ([]model.Traduccion, int64, error) {
	var traducciones []model.Traduccion
	var total int64

	r.db.Model(&model.Traduccion{}).Count(&total)
	result := r.db.Order("created_at DESC").Limit(limit).Find(&traducciones)

	return traducciones, total, result.Error
}
