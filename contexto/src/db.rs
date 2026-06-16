use sqlx::PgPool;
use tracing::info;

pub async fn run_migrations(pool: &PgPool) {
    info!("Ejecutando migraciones...");

    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS regiones (
            id SERIAL PRIMARY KEY,
            nombre VARCHAR(50) NOT NULL UNIQUE,
            descripcion TEXT
        )
        "#,
    )
    .execute(pool)
    .await
    .expect("Error creando tabla regiones");

    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS variaciones_regionales (
            id SERIAL PRIMARY KEY,
            termino_original VARCHAR(100) NOT NULL,
            variacion VARCHAR(100) NOT NULL,
            region_id INT REFERENCES regiones(id),
            notas TEXT,
            created_at TIMESTAMP DEFAULT NOW()
        )
        "#,
    )
    .execute(pool)
    .await
    .expect("Error creando tabla variaciones_regionales");

    // Insertar datos semilla si no existen
    let count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM regiones")
        .fetch_one(pool)
        .await
        .unwrap_or((0,));

    if count.0 == 0 {
        sqlx::query(
            r#"
            INSERT INTO regiones (nombre, descripcion) VALUES
                ('Norte', 'Regiones de Arica, Tarapacá, Antofagasta, Atacama'),
                ('Centro', 'Regiones de Coquimbo, Valparaíso, Metropolitana, O''Higgins'),
                ('Sur', 'Regiones de Maule, Biobío, La Araucanía, Los Lagos y más')
            "#,
        )
        .execute(pool)
        .await
        .expect("Error insertando regiones");

        sqlx::query(
            r#"
            INSERT INTO variaciones_regionales (termino_original, variacion, region_id, notas) VALUES
                ('bacán', 'bacán', 1, 'Uso estándar en el norte'),
                ('bacán', 'bacán', 2, 'Uso más frecuente en el centro'),
                ('bacán', 'la raja', 3, 'En el sur se prefiere la raja'),
                ('carrete', 'carrete', 1, 'Término estándar'),
                ('carrete', 'carrete', 2, 'Término estándar'),
                ('carrete', 'joda', 3, 'En el sur también se dice joda')
            "#,
        )
        .execute(pool)
        .await
        .expect("Error insertando variaciones");

        info!("✅ Datos semilla insertados");
    }

    info!("✅ Migraciones completadas");
}
