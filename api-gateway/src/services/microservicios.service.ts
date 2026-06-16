import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class MicroserviciosService {
  private readonly logger = new Logger(MicroserviciosService.name);
  private readonly traductorClient: AxiosInstance;
  private readonly sugerenciasClient: AxiosInstance;
  private readonly contextoClient: AxiosInstance;

  constructor() {
    this.traductorClient = axios.create({
      baseURL: process.env.TRADUCTOR_URL || 'http://traductor:8080',
      timeout: 10000,
    });
    this.sugerenciasClient = axios.create({
      baseURL: process.env.SUGERENCIAS_URL || 'http://sugerencias:3001',
      timeout: 10000,
    });
    this.contextoClient = axios.create({
      baseURL: process.env.CONTEXTO_URL || 'http://contexto:8082',
      timeout: 10000,
    });
  }

  async traducir(texto: string, region?: string) {
    const { data } = await this.traductorClient.post('/api/traducir', {
      texto,
      region: region || 'Centro',
    });
    return {
      textoOriginal: data.texto_original,
      textoTraducido: data.texto_traducido,
      region: data.region,
      palabrasDetectadas: data.palabras_detectadas || [],
    };
  }

  async obtenerHistorial(limit = 20) {
    const { data } = await this.traductorClient.get(`/api/historial?limit=${limit}`);
    return {
      traducciones: (data.traducciones || []).map((t: any) => ({
        id: t.id,
        textoOriginal: t.texto_original,
        textoTraducido: t.texto_traducido,
        region: t.region,
        palabrasDetectadas: t.palabras_detectadas || [],
        createdAt: t.created_at,
      })),
      total: data.total || 0,
    };
  }

  async listarSugerencias(estado?: string) {
    const url = estado ? `/api/sugerencias?estado=${estado}` : '/api/sugerencias';
    const { data } = await this.sugerenciasClient.get(url);
    return data;
  }

  async obtenerSugerencia(id: number) {
    const { data } = await this.sugerenciasClient.get(`/api/sugerencias/${id}`);
    return data;
  }

  async crearSugerencia(input: any) {
    // Mapear campos GraphQL (camelCase) a los que espera NestJS
    const payload = {
      palabra: input.palabra,
      traduccionPropuesta: input.traduccionPropuesta,
      descripcion: input.descripcion,
      ejemploUso: input.ejemploUso,
      region: input.region,
      usuarioEmail: input.usuarioEmail,
    };
    const { data } = await this.sugerenciasClient.post('/api/sugerencias', payload);
    return data;
  }

  async actualizarEstadoSugerencia(id: number, estado: string) {
    const { data } = await this.sugerenciasClient.patch(
      `/api/sugerencias/${id}/estado`,
      { estado },
    );
    return data;
  }

  async listarRegiones() {
    const { data } = await this.contextoClient.get('/api/regiones');
    return data;
  }

  async obtenerVariaciones(termino: string) {
    const { data } = await this.contextoClient.get(
      `/api/variaciones/${encodeURIComponent(termino)}`,
    );
    return data;
  }

  async checkHealth() {
    const check = async (client: AxiosInstance, path: string) => {
      try {
        await client.get(path);
        return 'ok';
      } catch {
        return 'down';
      }
    };
    const [traductor, sugerencias, contexto] = await Promise.all([
      check(this.traductorClient, '/api/health'),
      check(this.sugerenciasClient, '/api/sugerencias/health'),
      check(this.contextoClient, '/api/health'),
    ]);
    return { gateway: 'ok', traductor, diccionario: 'via-grpc', contexto, sugerencias };
  }
}