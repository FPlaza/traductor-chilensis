use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, PartialEq, Eq, sqlx::FromRow)]
pub struct Region {
    pub id: i32,
    pub nombre: String,
    pub descripcion: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct VariacionRegional {
    pub id: i32,
    pub termino_original: String,
    pub variacion: String,
    pub region_nombre: Option<String>,
    pub notas: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, PartialEq, Eq)]
pub struct FiltrarRequest {
    pub termino: String,
    pub region: String,
}

#[derive(Debug, Serialize)]
pub struct FiltrarResponse {
    pub termino_original: String,
    pub termino_adaptado: String,
    pub region: String,
    pub nota: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct VariacionesResponse {
    pub termino: String,
    pub variaciones: Vec<VariacionItem>,
}

#[derive(Debug, Serialize)]
pub struct VariacionItem {
    pub region: String,
    pub variacion: String,
    pub notas: Option<String>,
}
