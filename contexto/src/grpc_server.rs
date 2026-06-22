use sqlx::PgPool;
use tonic::{transport::Server, Request, Response, Status};
use tracing::info;

pub mod chilensis {
    tonic::include_proto!("chilensis");
}

use chilensis::contexto_service_server::{ContextoService, ContextoServiceServer};
use chilensis::{
    FiltrarRegionRequest, FiltrarRegionResponse,
    VariacionesRequest, VariacionesResponse, VariacionRegional,
};

pub struct ContextoGrpcServer {
    pool: PgPool,
}

impl ContextoGrpcServer {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[tonic::async_trait]
impl ContextoService for ContextoGrpcServer {
    async fn filtrar_por_region(
        &self,
        request: Request<FiltrarRegionRequest>,
    ) -> Result<Response<FiltrarRegionResponse>, Status> {
        let req = request.into_inner();
        info!("gRPC FiltrarPorRegion: {} en {}", req.termino, req.region);

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
        .bind(&req.termino)
        .bind(&req.region)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| Status::internal(format!("Error de base de datos: {}", e)))?;

        let response = match result {
            Some(row) => FiltrarRegionResponse {
                termino_adaptado: row.0,
                region: req.region,
                nota: row.1.unwrap_or_default(),
            },
            None => FiltrarRegionResponse {
                termino_adaptado: req.termino,
                region: req.region,
                nota: "Sin variación regional específica".to_string(),
            },
        };

        Ok(Response::new(response))
    }

    async fn obtener_variaciones(
        &self,
        request: Request<VariacionesRequest>,
    ) -> Result<Response<VariacionesResponse>, Status> {
        let req = request.into_inner();
        info!("gRPC ObtenerVariaciones: {}", req.termino);

        let rows = sqlx::query_as::<_, (String, String, Option<String>)>(
            r#"
            SELECT r.nombre as region_nombre, vr.variacion, vr.notas
            FROM variaciones_regionales vr
            JOIN regiones r ON vr.region_id = r.id
            WHERE LOWER(vr.termino_original) = LOWER($1)
            ORDER BY r.id
            "#
        )
        .bind(&req.termino)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| Status::internal(format!("Error de base de datos: {}", e)))?;

        let variaciones: Vec<VariacionRegional> = rows
            .iter()
            .map(|r| VariacionRegional {
                region: r.0.clone(),
                variacion: r.1.clone(),
                notas: r.2.clone().unwrap_or_default(),
            })
            .collect();

        Ok(Response::new(VariacionesResponse { variaciones }))
    }
}

pub async fn start_grpc_server(pool: PgPool, port: &str) {
    let addr = format!("0.0.0.0:{}", port).parse().expect("Dirección gRPC inválida");
    let server = ContextoGrpcServer::new(pool);

    info!("🚀 Contexto gRPC corriendo en puerto {}", port);

    Server::builder()
        .add_service(ContextoServiceServer::new(server))
        .serve(addr)
        .await
        .expect("Error iniciando servidor gRPC");
}

#[cfg(test)]
mod tests {
    use super::*;
    use sqlx::postgres::PgPoolOptions;
    use std::env;

    // Helper para conectar a la DB real de tu docker-compose
    async fn get_test_pool() -> PgPool {
        let db_url = env::var("DATABASE_URL")
            .unwrap_or_else(|_| "postgres://postgres:postgres@db_contexto:5432/db_contexto".to_string());
        PgPoolOptions::new().connect(&db_url).await.expect("DB debe estar corriendo")
    }

    #[tokio::test]
    async fn test_grpc_filtrar_por_region_encontrado() {
        let pool = get_test_pool().await;
        let server = ContextoGrpcServer::new(pool);

        let req = Request::new(FiltrarRegionRequest {
            termino: "bacán".to_string(),
            region: "Sur".to_string(),
        });

        let resp = server.filtrar_por_region(req).await.expect("Debería retornar Ok");
        let inner = resp.into_inner();
        
        // Según tus datos semilla, "bacán" en el "Sur" es "la raja"
        assert_eq!(inner.termino_adaptado, "la raja");
        assert_eq!(inner.region, "Sur");
    }

    #[tokio::test]
    async fn test_grpc_filtrar_por_region_no_encontrado() {
        let pool = get_test_pool().await;
        let server = ContextoGrpcServer::new(pool);

        let req = Request::new(FiltrarRegionRequest {
            termino: "palabra_rara".to_string(),
            region: "Norte".to_string(),
        });

        let resp = server.filtrar_por_region(req).await.expect("Debería retornar Ok");
        let inner = resp.into_inner();
        
        // Al no existir, devuelve el mismo término y la nota por defecto
        assert_eq!(inner.termino_adaptado, "palabra_rara");
        assert_eq!(inner.nota, "Sin variación regional específica");
    }

    #[tokio::test]
    async fn test_grpc_obtener_variaciones() {
        let pool = get_test_pool().await;
        let server = ContextoGrpcServer::new(pool);

        let req = Request::new(VariacionesRequest {
            termino: "carrete".to_string(),
        });

        let resp = server.obtener_variaciones(req).await.expect("Debería retornar Ok");
        let inner = resp.into_inner();
        
        // "carrete" tiene datos semilla, así que la lista no debería estar vacía
        assert!(!inner.variaciones.is_empty());
    }

    #[tokio::test]
    async fn test_grpc_db_error() {
        // Simulamos un error de DB con credenciales falsas
        let fake_pool = PgPoolOptions::new()
            .connect_lazy("postgres://fake:fake@localhost:1/fake")
            .unwrap();
        
        let server = ContextoGrpcServer::new(fake_pool);
        
        let req = Request::new(FiltrarRegionRequest {
            termino: "bacán".to_string(),
            region: "Centro".to_string(),
        });

        // Al usar una DB que no existe, debería fallar y devolver un Status
        let err = server.filtrar_por_region(req).await.unwrap_err();
        assert_eq!(err.code(), tonic::Code::Internal);
    }
}