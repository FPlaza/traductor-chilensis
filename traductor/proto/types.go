package proto

// Termino representa un término del diccionario
type Termino struct {
	ID         int32  `json:"id"`
	Palabra    string `json:"palabra"`
	Traduccion string `json:"traduccion"`
	Descripcion string `json:"descripcion"`
	EjemploUso string `json:"ejemplo_uso"`
}

type BuscarTerminoResponse struct {
	Encontrado bool     `json:"encontrado"`
	Termino    *Termino `json:"termino"`
}

type BuscarMultiplesResponse struct {
	Terminos []*Termino `json:"terminos"`
}

type ListarTerminosResponse struct {
	Terminos []*Termino `json:"terminos"`
	Total    int32      `json:"total"`
}