package com.chilensis.diccionario.service;

import com.chilensis.diccionario.entity.Termino;
import com.chilensis.diccionario.repository.TerminoRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DiccionarioServiceTest {

    @Mock
    private TerminoRepository terminoRepository;

    @InjectMocks
    private DiccionarioService diccionarioService;

    @Test
    void buscarTermino_LimpiaPalabraYBusca() {
        Termino terminoMock = new Termino();
        when(terminoRepository.findByPalabraIgnoreCase("cachai")).thenReturn(Optional.of(terminoMock));

        Optional<Termino> resultado = diccionarioService.buscarTermino("  cachai  ");

        assertTrue(resultado.isPresent());
        verify(terminoRepository).findByPalabraIgnoreCase("cachai");
    }

    @Test
    void buscarMultiples_ConvierteAMinusculas() {
        List<String> palabras = List.of("Bacan", "FOME");
        List<Termino> terminosMock = List.of(new Termino(), new Termino());
        
        when(terminoRepository.findByPalabrasIn(List.of("bacan", "fome"))).thenReturn(terminosMock);

        List<Termino> resultado = diccionarioService.buscarMultiples(palabras);

        assertEquals(2, resultado.size());
        verify(terminoRepository).findByPalabrasIn(List.of("bacan", "fome"));
    }

    @Test
    void listarTerminos_PaginacionExitosa() {
        Page<Termino> pageMock = new PageImpl<>(List.of(new Termino()));
        when(terminoRepository.findAll(any(PageRequest.class))).thenReturn(pageMock);

        Page<Termino> resultado = diccionarioService.listarTerminos(0, 10);

        assertEquals(1, resultado.getContent().size());
        verify(terminoRepository).findAll(PageRequest.of(0, 10));
    }
}