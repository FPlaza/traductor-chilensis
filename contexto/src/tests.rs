// Tests unitarios del módulo contexto
// Los tests de integración requieren conexión a DB

#[cfg(test)]
mod tests {
    use crate::models::{FiltrarRequest, FiltrarResponse, Region, VariacionItem, VariacionesResponse, VariacionRegional};

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
        assert!(json.contains("Variación regional"));
    }

    #[test]
    fn test_variaciones_response_serialize() {
        let variacion = VariacionItem {
            region: "Norte".to_string(),
            variacion: "bacán".to_string(),
            notas: Some("Uso común".to_string()),
        };

        let response = VariacionesResponse {
            termino: "bacán".to_string(),
            variaciones: vec![variacion],
        };

        let json = serde_json::to_string(&response).unwrap();
        assert!(json.contains("bacán"));
        assert!(json.contains("Uso común"));
    }

    #[test]
    fn test_region_serialization() {
        let region = Region {
            id: 1,
            nombre: "Centro".to_string(),
            descripcion: Some("Región central".to_string()),
        };

        let value = serde_json::to_value(&region).unwrap();
        assert_eq!(value["nombre"], "Centro");
        assert_eq!(value["descripcion"], "Región central");
    }

    #[test]
    fn test_variacion_regional_serialization() {
        let variacion = VariacionRegional {
            id: 5,
            termino_original: "carrete".to_string(),
            variacion: "joda".to_string(),
            region_nombre: Some("Sur".to_string()),
            notas: None,
        };

        let value = serde_json::to_value(&variacion).unwrap();
        assert_eq!(value["termino_original"], "carrete");
        assert_eq!(value["variacion"], "joda");
        assert_eq!(value["region_nombre"], "Sur");
    }

    #[test]
    fn test_filtrar_response_default_note() {
        let response = FiltrarResponse {
            termino_original: "weá".to_string(),
            termino_adaptado: "weá".to_string(),
            region: "Sur".to_string(),
            nota: Some("Sin variación regional específica".to_string()),
        };

        let json = serde_json::to_string(&response).unwrap();
        assert!(json.contains("Sin variación regional específica"));
    }

    #[test]
    fn test_request_and_response_roundtrip() {
        let request = FiltrarRequest {
            termino: "bacán".to_string(),
            region: "Centro".to_string(),
        };

        let json = serde_json::to_string(&request).unwrap();
        let deserialized: FiltrarRequest = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized, request);
    }
}
