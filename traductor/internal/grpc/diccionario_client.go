package grpcclient

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	pb "github.com/fplaza/traductor-chilensis/traductor/proto"
)

type DiccionarioClient struct {
	baseURL    string
	httpClient *http.Client
}

func NewDiccionarioClient(address string) (*DiccionarioClient, error) {
	return &DiccionarioClient{
		baseURL: "http://" + address,
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}, nil
}

func (c *DiccionarioClient) Close() {}

func (c *DiccionarioClient) BuscarMultiples(palabras []string) (*pb.BuscarMultiplesResponse, error) {
	body, _ := json.Marshal(map[string][]string{"palabras": palabras})
	resp, err := c.httpClient.Post(
		fmt.Sprintf("%s/api/terminos/buscar", c.baseURL),
		"application/json",
		bytes.NewBuffer(body),
	)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var terminos []*pb.Termino
	if err := json.NewDecoder(resp.Body).Decode(&terminos); err != nil {
		return nil, err
	}
	return &pb.BuscarMultiplesResponse{Terminos: terminos}, nil
}

func (c *DiccionarioClient) BuscarTermino(palabra string) (*pb.BuscarTerminoResponse, error) {
	resp, err := c.httpClient.Get(fmt.Sprintf("%s/api/termino/%s", c.baseURL, palabra))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var result struct {
		Encontrado bool        `json:"encontrado"`
		Termino    *pb.Termino `json:"termino"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}
	return &pb.BuscarTerminoResponse{Encontrado: result.Encontrado, Termino: result.Termino}, nil
}