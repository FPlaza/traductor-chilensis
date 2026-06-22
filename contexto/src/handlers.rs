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

#[cfg(test)]
mod tests {
    use super::*;
    use actix_web::{test, web, App};
    use sqlx::postgres::PgPoolOptions;
    use std::env;

    // Helper para conectar a la DB real de tu docker-compose
    async fn get_test_pool() -> sqlx::PgPool {
        let db_url = env::var("DATABASE_URL")
            .unwrap_or_else(|_| "postgres://postgres:postgres@db_contexto:5432/db_contexto".to_string());
        PgPoolOptions::new().connect(&db_url).await.expect("DB debe estar corriendo")
    }

    #[actix_web::test]
    async fn test_health_ok() {
        let app = test::init_service(App::new().route("/health", web::get().to(health))).await;
        let req = test::TestRequest::get().uri("/health").to_request();
        let resp = test::call_service(&app, req).await;
        
        assert!(resp.status().is_success());
    }

    #[actix_web::test]
    async fn test_listar_regiones_ok() {
        let pool = get_test_pool().await;
        let app = test::init_service(
            App::new()
                .app_data(web::Data::new(pool))
                .route("/regiones", web::get().to(listar_regiones))
        ).await;
        
        let req = test::TestRequest::get().uri("/regiones").to_request();
        let resp = test::call_service(&app, req).await;
        
        assert!(resp.status().is_success());
    }

    #[actix_web::test]
    async fn test_filtrar_por_region_ok() {
        let pool = get_test_pool().await;
        let app = test::init_service(
            App::new()
                .app_data(web::Data::new(pool))
                .route("/filtrar", web::post().to(filtrar_por_region))
        ).await;
        
        let req = test::TestRequest::post()
            .uri("/filtrar")
            .set_json(FiltrarRequest {
                termino: "bacán".to_string(),
                region: "Centro".to_string(),
            })
            .to_request();
            
        let resp = test::call_service(&app, req).await;
        assert!(resp.status().is_success());
    }

    // Este test forzará un error 500 conectándose a una DB falsa, 
    // lo que cubrirá todas tus líneas "Err(e)" en el código.
    #[actix_web::test]
    async fn test_handlers_db_error_force() {
        let fake_pool = PgPoolOptions::new()
            .connect_lazy("postgres://fake:fake@localhost:1/fake")
            .unwrap();
            
        let app = test::init_service(
            App::new()
                .app_data(web::Data::new(fake_pool))
                .route("/regiones", web::get().to(listar_regiones))
        ).await;
        
        let req = test::TestRequest::get().uri("/regiones").to_request();
        let resp = test::call_service(&app, req).await;
        
        assert_eq!(resp.status(), 500); // Valida el InternalServerError
    }
}