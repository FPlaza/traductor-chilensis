package com.chilensis.diccionario.controller;

import com.chilensis.diccionario.entity.Termino;
import com.chilensis.diccionario.service.DiccionarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DiccionarioController {

    private final DiccionarioService diccionarioService;

    @GetMapping("/termino/{palabra}")
    public ResponseEntity<?> buscarTermino(@PathVariable String palabra) {
        Optional<Termino> termino = diccionarioService.buscarTermino(palabra);
        if (termino.isPresent()) {
            return ResponseEntity.ok(Map.of("encontrado", true, "termino", termino.get()));
        }
        return ResponseEntity.ok(Map.of("encontrado", false));
    }

    @PostMapping("/terminos/buscar")
    public ResponseEntity<List<Termino>> buscarMultiples(@RequestBody Map<String, List<String>> body) {
        List<String> palabras = body.get("palabras");
        return ResponseEntity.ok(diccionarioService.buscarMultiples(palabras));
    }

    @GetMapping("/terminos")
    public ResponseEntity<?> listarTerminos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int limit) {
        Page<Termino> resultado = diccionarioService.listarTerminos(page, limit);
        return ResponseEntity.ok(Map.of(
            "terminos", resultado.getContent(),
            "total", resultado.getTotalElements()
        ));
    }

    @GetMapping("/terminos/buscar")
    public ResponseEntity<List<Termino>> buscarPorTexto(@RequestParam String q) {
        return ResponseEntity.ok(diccionarioService.buscarPorTexto(q));
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of("status", "ok", "service", "diccionario"));
    }
}