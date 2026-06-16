import { useQuery } from '@apollo/client';
import { HEALTH_QUERY } from '../graphql/queries';

export function HealthCheck() {
  const { data, loading, refetch } = useQuery(HEALTH_QUERY, {
    pollInterval: 30000, // re-chequear cada 30 segundos
  });

  const servicios = data?.health
    ? [
        { nombre: 'API Gateway', estado: data.health.gateway, icon: '🌐' },
        { nombre: 'Traductor (Go)', estado: data.health.traductor, icon: '🔵' },
        { nombre: 'Diccionario (Java)', estado: data.health.diccionario, icon: '📚' },
        { nombre: 'Contexto (Rust)', estado: data.health.contexto, icon: '🦀' },
        { nombre: 'Sugerencias (NestJS)', estado: data.health.sugerencias, icon: '💡' },
      ]
    : [];

  return (
    <div className="health-container">
      <div className="health-header">
        <h2>🔍 Estado de Servicios</h2>
        <button onClick={() => refetch()} className="btn-secondary">
          🔄 Actualizar
        </button>
      </div>

      {loading ? (
        <p>Verificando servicios...</p>
      ) : (
        <div className="health-grid">
          {servicios.map((s) => (
            <div
              key={s.nombre}
              className={`health-card ${s.estado === 'ok' || s.estado === 'via-grpc' ? 'ok' : 'down'}`}
            >
              <span className="health-icon">{s.icon}</span>
              <div className="health-info">
                <strong>{s.nombre}</strong>
                <span className={`status-badge ${s.estado === 'ok' || s.estado === 'via-grpc' ? 'ok' : 'down'}`}>
                  {s.estado === 'ok' ? '✅ Activo' : s.estado === 'via-grpc' ? '🔗 gRPC' : '❌ Caído'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
