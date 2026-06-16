package service

import (
	"fmt"
	"log"
	"strings"

	grpcclient "github.com/fplaza/traductor-chilensis/traductor/internal/grpc"
	"github.com/fplaza/traductor-chilensis/traductor/internal/model"
	"github.com/fplaza/traductor-chilensis/traductor/internal/repository"
)

type TraductorService struct {
	repo             *repository.TraduccionRepository
	diccionarioClient *grpcclient.DiccionarioClient
}

func NewTraductorService(
	repo *repository.TraduccionRepository,
	diccionarioClient *grpcclient.DiccionarioClient,
) *TraductorService {
	return &TraductorService{
		repo:             repo,
		diccionarioClient: diccionarioClient,
	}
}

// Traducir recibe un texto con modismos chilenos y los traduce a español neutro
func (s *TraductorService) Traducir(req model.TraducirRequest) (*model.TraducirResponse, error) {
	if req.Region == "" {
		req.Region = "Centro"
	}

	// Tokenizar el texto
	palabras := tokenizar(req.Texto)

	// Buscar todas las palabras en el diccionario vía gRPC
	resp, err := s.diccionarioClient.BuscarMultiples(palabras)
	if err != nil {
		log.Printf("⚠️ Error consultando diccionario: %v", err)
		// Si el diccionario falla, retornamos el texto original
		return &model.TraducirResponse{
			TextoOriginal:    req.Texto,
			TextoTraducido:   req.Texto,
			Region:           req.Region,
			PalabrasDetectadas: []string{},
		}, nil
	}

	// Construir mapa de traducciones
	mapaTraduccion := make(map[string]string)
	palabrasDetectadas := []string{}

	for _, termino := range resp.Terminos {
		mapaTraduccion[strings.ToLower(termino.Palabra)] = termino.Traduccion
		palabrasDetectadas = append(palabrasDetectadas, termino.Palabra)
	}

	// Reemplazar modismos en el texto
	textoTraducido := traducirTexto(req.Texto, mapaTraduccion)

	// Guardar en base de datos
	traduccion := &model.Traduccion{
		TextoOriginal:    req.Texto,
		TextoTraducido:   textoTraducido,
		Region:           req.Region,
		PalabrasDetectadas: palabrasDetectadas,
	}

	if err := s.repo.Guardar(traduccion); err != nil {
		log.Printf("⚠️ Error guardando traducción: %v", err)
	}

	return &model.TraducirResponse{
		TextoOriginal:    req.Texto,
		TextoTraducido:   textoTraducido,
		Region:           req.Region,
		PalabrasDetectadas: palabrasDetectadas,
	}, nil
}

func (s *TraductorService) ObtenerHistorial(limit int) (*model.HistorialResponse, error) {
	traducciones, total, err := s.repo.ObtenerHistorial(limit)
	if err != nil {
		return nil, fmt.Errorf("error obteniendo historial: %w", err)
	}
	return &model.HistorialResponse{
		Traducciones: traducciones,
		Total:        total,
	}, nil
}

// tokenizar divide el texto en palabras individuales (en minúsculas y sin puntuación)
func tokenizar(texto string) []string {
	texto = strings.ToLower(texto)
	// Remover puntuación básica
	replacer := strings.NewReplacer(".", "", ",", "", "!", "", "?", "", ";", "", ":", "", "\"", "", "'", "")
	texto = replacer.Replace(texto)

	palabras := strings.Fields(texto)
	seen := make(map[string]bool)
	unique := []string{}
	for _, p := range palabras {
		if !seen[p] {
			seen[p] = true
			unique = append(unique, p)
		}
	}
	return unique
}

// traducirTexto reemplaza los modismos encontrados en el texto original
func traducirTexto(texto string, mapaTraduccion map[string]string) string {
	palabras := strings.Fields(texto)
	resultado := make([]string, len(palabras))

	for i, palabra := range palabras {
		// Limpiar puntuación para buscar
		clave := strings.ToLower(strings.Trim(palabra, ".,!?;:\"'"))

		if traduccion, ok := mapaTraduccion[clave]; ok {
			// Preservar puntuación original
			sufijo := ""
			if len(palabra) > 0 {
				ultimo := string(palabra[len(palabra)-1])
				if strings.ContainsAny(ultimo, ".,!?;:") {
					sufijo = ultimo
				}
			}
			// Tomar solo la primera opción de traducción si hay múltiples
			primeraTraduccion := strings.Split(traduccion, "/")[0]
			primeraTraduccion = strings.TrimSpace(primeraTraduccion)
			resultado[i] = fmt.Sprintf("[%s]%s", primeraTraduccion, sufijo)
		} else {
			resultado[i] = palabra
		}
	}

	return strings.Join(resultado, " ")
}
