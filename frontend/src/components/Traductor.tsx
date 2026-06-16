import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { TRADUCIR_MUTATION, REGIONES_QUERY } from '../graphql/queries';

interface TraduccionResult {
  textoOriginal: string;
  textoTraducido: string;
  region: string;
  palabrasDetectadas: string[];
}

export function Traductor() {
  const [texto, setTexto] = useState('');
  const [region, setRegion] = useState('Centro');
  const [resultado, setResultado] = useState<TraduccionResult | null>(null);

  const { data: regionesData } = useQuery(REGIONES_QUERY);
  const [traducir, { loading, error }] = useMutation(TRADUCIR_MUTATION);

  const handleTraducir = async () => {
    if (!texto.trim()) return;
    try {
      const { data } = await traducir({ variables: { texto, region } });
      setResultado(data.traducir);
    } catch (e) {
      console.error('Error traduciendo:', e);
    }
  };

  return (
    <div className="traductor-container">
      <h2>🇨🇱 Traducir Chilensis</h2>
      <p className="subtitle">Escribe una frase con modismos chilenos</p>

      <div className="form-group">
        <label htmlFor="region">Región:</label>
        <select
          id="region"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
        >
          {regionesData?.regiones?.map((r: { id: number; nombre: string }) => (
            <option key={r.id} value={r.nombre}>{r.nombre}</option>
          )) ?? (
            <>
              <option value="Norte">Norte</option>
              <option value="Centro">Centro</option>
              <option value="Sur">Sur</option>
            </>
          )}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="texto">Texto a traducir:</label>
        <textarea
          id="texto"
          rows={4}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Ej: Oye huevón, ¿cachái lo que te digo? Eso estuvo bacán al tiro."
        />
      </div>

      <button
        onClick={handleTraducir}
        disabled={loading || !texto.trim()}
        className="btn-primary"
      >
        {loading ? 'Traduciendo...' : '🔄 Traducir'}
      </button>

      {error && (
        <div className="error-box">
          ❌ Error al traducir. Verifica que los servicios estén activos.
        </div>
      )}

      {resultado && (
        <div className="resultado-box">
          <h3>Resultado</h3>
          <div className="texto-row">
            <div className="texto-col">
              <label>Original:</label>
              <p className="texto-original">{resultado.textoOriginal}</p>
            </div>
            <div className="texto-col">
              <label>Traducido:</label>
              <p className="texto-traducido">{resultado.textoTraducido}</p>
            </div>
          </div>
          {resultado.palabrasDetectadas.length > 0 && (
            <div className="palabras-detectadas">
              <label>Modismos detectados:</label>
              <div className="tags">
                {resultado.palabrasDetectadas.map((p) => (
                  <span key={p} className="tag">{p}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
