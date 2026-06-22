use actix_cors::Cors;
use actix_web::{middleware, web, App, HttpServer};
use sqlx::PgPool;
use std::env;
use tracing::info;

mod db;
mod grpc_server;
mod handlers;
mod models;
mod tests;

#[tokio::main]
async fn main() -> std::io::Result<()> {
    // Inicializar logging
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::from_default_env()
                .add_directive("contexto=debug".parse().unwrap()),
        )
        .init();

    dotenv::dotenv().ok();

    let database_url = env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgres://admin:admin_password@postgres:5432/db_contexto".to_string());

    let grpc_port = env::var("GRPC_PORT").unwrap_or_else(|_| "50052".to_string());
    let http_port = env::var("PORT").unwrap_or_else(|_| "8082".to_string());

    // Conectar a PostgreSQL con SQLx
    let pool = PgPool::connect(&database_url)
        .await
        .expect("❌ Error conectando a PostgreSQL");

    info!("✅ Conectado a PostgreSQL");

    // Ejecutar migraciones
    db::run_migrations(&pool).await;

    let pool_clone = pool.clone();
    let grpc_port_clone = grpc_port.clone();

    // Iniciar servidor gRPC en un hilo separado
    tokio::spawn(async move {
        grpc_server::start_grpc_server(pool_clone, &grpc_port_clone).await;
    });

    info!("🚀 Contexto HTTP corriendo en puerto {}", http_port);

    // Iniciar servidor HTTP con Actix-web
    let pool_data = web::Data::new(pool);

    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header();

        App::new()
            .app_data(pool_data.clone())
            .wrap(cors)
            .wrap(middleware::Logger::default())
            .service(
                web::scope("/api")
                    .route("/regiones", web::get().to(handlers::listar_regiones))
                    .route("/filtrar", web::post().to(handlers::filtrar_por_region))
                    .route("/variaciones/{termino}", web::get().to(handlers::obtener_variaciones))
                    .route("/health", web::get().to(handlers::health)),
            )
    })
    .bind(format!("0.0.0.0:{}", http_port))?
    .run()
    .await
}
