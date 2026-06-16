package com.chilensis.diccionario.repository;

import com.chilensis.diccionario.entity.Termino;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TerminoRepository extends JpaRepository<Termino, Integer> {

    Optional<Termino> findByPalabraIgnoreCase(String palabra);

    @Query("SELECT t FROM Termino t WHERE LOWER(t.palabra) IN :palabras")
    List<Termino> findByPalabrasIn(@Param("palabras") List<String> palabras);

    Page<Termino> findAll(Pageable pageable);

    @Query("SELECT t FROM Termino t WHERE LOWER(t.palabra) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(t.traduccion) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Termino> buscarPorTexto(@Param("query") String query);
}
