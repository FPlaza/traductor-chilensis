package com.chilensis.diccionario.service;

import com.chilensis.diccionario.entity.Termino;
import com.chilensis.diccionario.repository.TerminoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DiccionarioService {

    private final TerminoRepository terminoRepository;

    @Transactional(readOnly = true)
    public Optional<Termino> buscarTermino(String palabra) {
        return terminoRepository.findByPalabraIgnoreCase(palabra.trim());
    }

    @Transactional(readOnly = true)
    public List<Termino> buscarMultiples(List<String> palabras) {
        List<String> palabrasLower = palabras.stream()
            .map(String::toLowerCase)
            .collect(Collectors.toList());
        return terminoRepository.findByPalabrasIn(palabrasLower);
    }

    @Transactional(readOnly = true)
    public Page<Termino> listarTerminos(int page, int limit) {
        return terminoRepository.findAll(PageRequest.of(page, limit));
    }

    @Transactional(readOnly = true)
    public List<Termino> buscarPorTexto(String query) {
        return terminoRepository.buscarPorTexto(query);
    }

    @Transactional
    public Termino crearTermino(Termino termino) {
        return terminoRepository.save(termino);
    }
}
