use actix_web::{web, HttpResponse, Responder};
use sqlx::PgPool;
use tracing::error;

use crate::models::{FiltrarRequest, FiltrarResponse, VariacionItem, VariacionesResponse};

pub async fn health() -> impl Responder {
    HttpResponse::Ok().json(serde_json::json!({
        "status": "ok",
        "service": "contexto"
    }))
}

pub async fn listar_regiones(pool: web::Data<PgPool>) -> impl Responder {
    let result = sqlx::query_as::<_, (i32, String, Option<String>)>(
        "SELECT id, nombre, descripcion FROM regiones ORDER BY id"
    )
    .fetch_all(pool.get_ref())
    .await;

    match result {
        Ok(regiones) => {
            let data: Vec<serde_json::Value> = regiones
                .iter()
                .map(|r| {
                    serde_json::json!({
                        "id": r.0,
                        "nombre": r.1,
                        "descripcion": r.2
                    })
                })
                .collect();
            HttpResponse::Ok().json(data)
        }
        Err(e) => {
            error!("Error listando regiones: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Error obteniendo regiones"
            }))
        }
    }
}

pub async fn filtrar_por_region(
    pool: web::Data<PgPool>,
    body: web::Json<FiltrarRequest>,
) -> impl Responder {
    let result = sqlx::query_as::<_, (String, Option<String>)>(
        r#"
        SELECT vr.variacion, vr.notas
        FROM variaciones_regionales vr
        JOIN regiones r ON vr.region_id = r.id
        WHERE LOWER(vr.termino_original) = LOWER($1)
          AND LOWER(r.nombre) = LOWER($2)
        LIMIT 1
        "#
    )
    .bind(&body.termino)
    .bind(&body.region)
    .fetch_optional(pool.get_ref())
    .await;

    match result {
        Ok(Some(row)) => {
            let response = FiltrarResponse {
                termino_original: body.termino.clone(),
                termino_adaptado: row.0,
                region: body.region.clone(),
                nota: row.1,
            };
            HttpResponse::Ok().json(response)
        }
        Ok(None) => {
            let response = FiltrarResponse {
                termino_original: body.termino.clone(),
                termino_adaptado: body.termino.clone(),
                region: body.region.clone(),
                nota: Some("Sin variación regional específica".to_string()),
            };
            HttpResponse::Ok().json(response)
        }
        Err(e) => {
            error!("Error filtrando por región: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Error filtrando término"
            }))
        }
    }
}

pub async fn obtener_variaciones(
    pool: web::Data<PgPool>,
    termino: web::Path<String>,
) -> impl Responder {
    let result = sqlx::query_as::<_, (String, String, Option<String>)>(
        r#"
        SELECT r.nombre as region_nombre, vr.variacion, vr.notas
        FROM variaciones_regionales vr
        JOIN regiones r ON vr.region_id = r.id
        WHERE LOWER(vr.termino_original) = LOWER($1)
        ORDER BY r.id
        "#
    )
    .bind(termino.as_str())
    .fetch_all(pool.get_ref())
    .await;

    match result {
        Ok(rows) => {
            let variaciones: Vec<VariacionItem> = rows
                .iter()
                .map(|r| VariacionItem {
                    region: r.0.clone(),
                    variacion: r.1.clone(),
                    notas: r.2.clone(),
                })
                .collect();

            let response = VariacionesResponse {
                termino: termino.to_string(),
                variaciones,
            };
            HttpResponse::Ok().json(response)
        }
        Err(e) => {
            error!("Error obteniendo variaciones: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Error obteniendo variaciones"
            }))
        }
    }
}