package com.chilensis.diccionario.controller;

import com.chilensis.diccionario.entity.Termino;
import com.chilensis.diccionario.service.DiccionarioService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(DiccionarioController.class)
class DiccionarioControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DiccionarioService diccionarioService;

    @Test
    void health_RetornaOk() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ok"))
                .andExpect(jsonPath("$.service").value("diccionario"));
    }

    @Test
    void buscarTermino_Existe_RetornaTermino() throws Exception {
        Termino termino = new Termino();
        when(diccionarioService.buscarTermino("bacan")).thenReturn(Optional.of(termino));

        mockMvc.perform(get("/api/termino/bacan"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.encontrado").value(true));
    }

    @Test
    void buscarTermino_NoExiste_RetornaFalse() throws Exception {
        when(diccionarioService.buscarTermino("asdf")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/termino/asdf"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.encontrado").value(false));
    }

    @Test
    void buscarMultiples_RetornaLista() throws Exception {
        when(diccionarioService.buscarMultiples(List.of("bacan"))).thenReturn(List.of(new Termino()));

        String jsonBody = "{\"palabras\": [\"bacan\"]}";

        mockMvc.perform(post("/api/terminos/buscar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void listarTerminos_RetornaPaginado() throws Exception {
        when(diccionarioService.listarTerminos(anyInt(), anyInt()))
                .thenReturn(new PageImpl<>(List.of(new Termino())));

        mockMvc.perform(get("/api/terminos?page=0&limit=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.terminos").isArray())
                .andExpect(jsonPath("$.total").isNumber());
    }
}