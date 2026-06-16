import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { SUGERENCIAS_QUERY, CREAR_SUGERENCIA_MUTATION } from '../graphql/queries';

interface SugerenciaForm {
  palabra: string;
  traduccionPropuesta: string;
  descripcion: string;
  region: string;
  usuarioEmail: string;
}

const formVacio: SugerenciaForm = {
  palabra: '',
  traduccionPropuesta: '',
  descripcion: '',
  region: '',
  usuarioEmail: '',
};

export function Sugerencias() {
  const [form, setForm] = useState<SugerenciaForm>(formVacio);
  const [enviado, setEnviado] = useState(false);

  const { data, loading: loadingLista, refetch } = useQuery(SUGERENCIAS_QUERY, {
    variables: { estado: 'pendiente' },
  });

  const [crearSugerencia, { loading: loadingCrear }] = useMutation(CREAR_SUGERENCIA_MUTATION);

  const handleSubmit = async () => {
    if (!form.palabra.trim() || !form.traduccionPropuesta.trim()) return;
    try {
      await crearSugerencia({
        variables: { input: form },
      });
      setForm(formVacio);
      setEnviado(true);
      refetch();
      setTimeout(() => setEnviado(false), 3000);
    } catch (e) {
      console.error('Error creando sugerencia:', e);
    }
  };

  const handleChange = (field: keyof SugerenciaForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="sugerencias-container">
      <h2>💡 Sugerir Modismo</h2>
      <p className="subtitle">¿Conoces un modismo chileno que no está en el diccionario?</p>

      <div className="form-card">
        <div className="form-row">
          <div className="form-group">
            <label>Modismo / Palabra *</label>
            <input
              type="text"
              value={form.palabra}
              onChange={(e) => handleChange('palabra', e.target.value)}
              placeholder="Ej: filete"
            />
          </div>
          <div className="form-group">
            <label>Traducción propuesta *</label>
            <input
              type="text"
              value={form.traduccionPropuesta}
              onChange={(e) => handleChange('traduccionPropuesta', e.target.value)}
              placeholder="Ej: excelente / muy bueno"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Descripción (opcional)</label>
          <textarea
            rows={2}
            value={form.descripcion}
            onChange={(e) => handleChange('descripcion', e.target.value)}
            placeholder="Contexto o explicación adicional..."
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Región (opcional)</label>
            <select
              value={form.region}
              onChange={(e) => handleChange('region', e.target.value)}
            >
              <option value="">Sin especificar</option>
              <option value="Norte">Norte</option>
              <option value="Centro">Centro</option>
              <option value="Sur">Sur</option>
            </select>
          </div>
          <div className="form-group">
            <label>Email (opcional)</label>
            <input
              type="email"
              value={form.usuarioEmail}
              onChange={(e) => handleChange('usuarioEmail', e.target.value)}
              placeholder="tu@email.com"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loadingCrear || !form.palabra || !form.traduccionPropuesta}
          className="btn-primary"
        >
          {loadingCrear ? 'Enviando...' : '📨 Enviar sugerencia'}
        </button>

        {enviado && (
          <div className="success-box">
            ✅ ¡Sugerencia enviada! Gracias por contribuir al diccionario.
          </div>
        )}
      </div>

      <div className="sugerencias-lista">
        <h3>Sugerencias recientes</h3>
        {loadingLista ? (
          <p>Cargando...</p>
        ) : (
          <div className="lista">
            {data?.sugerencias?.length === 0 && (
              <p className="empty">No hay sugerencias pendientes aún.</p>
            )}
            {data?.sugerencias?.map((s: any) => (
              <div key={s.id} className="sugerencia-card">
                <div className="sugerencia-header">
                  <strong>{s.palabra}</strong>
                  <span className={`badge badge-${s.estado}`}>{s.estado}</span>
                </div>
                <p>{s.traduccionPropuesta}</p>
                {s.region && <span className="region-tag">📍 {s.region}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
