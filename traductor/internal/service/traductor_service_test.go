package service

import (
	"strings"
	"testing"
)

// Test de tokenización
func TestTokenizar(t *testing.T) {
	tests := []struct {
		input    string
		expected []string
	}{
		{
			input:    "Oye huevón, ¿cachái lo que pasó?",
			expected: []string{"oye", "huevón", "cachái", "lo", "que", "pasó"},
		},
		{
			input:    "al tiro bacán",
			expected: []string{"al", "tiro", "bacán"},
		},
		{
			input:    "bacán bacán bacán",
			expected: []string{"bacán"}, // únicos
		},
	}

	for _, tt := range tests {
		t.Run(tt.input, func(t *testing.T) {
			resultado := tokenizar(tt.input)
			if len(resultado) != len(tt.expected) {
				t.Errorf("esperaba %d palabras, obtuvo %d: %v", len(tt.expected), len(resultado), resultado)
			}
		})
	}
}

// Test de traducción de texto
func TestTraducirTexto(t *testing.T) {
	mapa := map[string]string{
		"bacán":  "genial / excelente",
		"fome":   "aburrido / sin gracia",
		"cachar": "entender",
	}

	tests := []struct {
		input    string
		contains string
	}{
		{
			input:    "Eso estuvo bacán",
			contains: "genial",
		},
		{
			input:    "Qué película más fome",
			contains: "aburrido",
		},
		{
			input:    "El gato es bonito",
			contains: "El gato es bonito", // sin modismos, no cambia
		},
	}

	for _, tt := range tests {
		t.Run(tt.input, func(t *testing.T) {
			resultado := traducirTexto(tt.input, mapa)
			if !strings.Contains(resultado, tt.contains) {
				t.Errorf("esperaba que '%s' contenga '%s', obtuvo: '%s'",
					tt.input, tt.contains, resultado)
			}
		})
	}
}

// Test de tokenización con texto vacío
func TestTokenizarTextoVacio(t *testing.T) {
	resultado := tokenizar("")
	if len(resultado) != 0 {
		t.Errorf("esperaba lista vacía, obtuvo: %v", resultado)
	}
}

// Test traducción preserva palabras no-modismos
func TestTraducirTextoPreservaPalabras(t *testing.T) {
	mapa := map[string]string{
		"bacán": "genial",
	}
	input := "La película estuvo bacán, la verdad"
	resultado := traducirTexto(input, mapa)

	if !strings.Contains(resultado, "película") {
		t.Error("debería preservar 'película'")
	}
	if !strings.Contains(resultado, "genial") {
		t.Error("debería traducir 'bacán' a 'genial'")
	}
}

// Test tokenizar elimina puntuación
func TestTokenizarEliminaPuntuacion(t *testing.T) {
	resultado := tokenizar("bacán, fome.")
	for _, p := range resultado {
		if strings.ContainsAny(p, ".,!?;:") {
			t.Errorf("la palabra '%s' contiene puntuación", p)
		}
	}
}
