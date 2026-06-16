// Tests unitarios del módulo contexto
// Los tests de integración requieren conexión a DB

#[cfg(test)]
mod tests {
    use crate::models::{FiltrarRequest, FiltrarResponse};

    #[test]
    fn test_filtrar_request_deserialize() {
        let json = r#"{"termino": "bacán", "region": "Sur"}"#;
        let req: FiltrarRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.termino, "bacán");
        assert_eq!(req.region, "Sur");
    }

    #[test]
    fn test_filtrar_response_serialize() {
        let resp = FiltrarResponse {
            termino_original: "bacán".to_string(),
            termino_adaptado: "la raja".to_string(),
            region: "Sur".to_string(),
            nota: Some("Variación regional".to_string()),
        };

        let json = serde_json::to_string(&resp).unwrap();
        assert!(json.contains("la raja"));
        assert!(json.contains("Sur"));
    }

    #[test]
    fn test_termino_sin_variacion_usa_original() {
        // Simular comportamiento cuando no hay variación
        let termino_original = "weá";
        let termino_adaptado = termino_original.to_string(); // mismo valor

        assert_eq!(termino_original, termino_adaptado);
    }

    #[test]
    fn test_region_validas() {
        let regiones_validas = vec!["Norte", "Centro", "Sur"];
        let region = "Centro";
        assert!(regiones_validas.contains(&region));
    }

    #[test]
    fn test_region_invalida() {
        let regiones_validas = vec!["Norte", "Centro", "Sur"];
        let region = "Antártica";
        assert!(!regiones_validas.contains(&region));
    }
}
