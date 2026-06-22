import { Test, TestingModule } from '@nestjs/testing';
import { MicroserviciosService } from './microservicios.service';
import axios from 'axios';

jest.mock('axios');

describe('MicroserviciosService', () => {
  let service: MicroserviciosService;
  const mockedAxios = axios as jest.Mocked<typeof axios>;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockedAxios.create.mockImplementation((config) => ({
      post: jest.fn(),
      get: jest.fn(),
      patch: jest.fn(),
    }) as any);

    const module: TestingModule = await Test.createTestingModule({
      providers: [MicroserviciosService],
    }).compile();

    service = module.get<MicroserviciosService>(MicroserviciosService);
  });

  describe('traducir', () => {
    it('debe traducir un texto con región', async () => {
      const mockResponse = {
        data: {
          texto_original: 'Oye huevón',
          texto_traducido: 'Oye [amigo]',
          region: 'Centro',
          palabras_detectadas: ['huevón'],
        },
      };

      jest.spyOn(service['traductorClient'], 'post').mockResolvedValueOnce(mockResponse);

      const resultado = await service.traducir('Oye huevón', 'Centro');

      expect(resultado).toEqual({
        textoOriginal: 'Oye huevón',
        textoTraducido: 'Oye [amigo]',
        region: 'Centro',
        palabrasDetectadas: ['huevón'],
      });
      expect(service['traductorClient'].post).toHaveBeenCalledWith('/api/traducir', {
        texto: 'Oye huevón',
        region: 'Centro',
      });
    });

    it('debe usar Centro como región por defecto', async () => {
      const mockResponse = {
        data: {
          texto_original: 'texto',
          texto_traducido: 'texto traducido',
          region: 'Centro',
          palabras_detectadas: [],
        },
      };

      jest.spyOn(service['traductorClient'], 'post').mockResolvedValueOnce(mockResponse);

      await service.traducir('texto');

      expect(service['traductorClient'].post).toHaveBeenCalledWith('/api/traducir', {
        texto: 'texto',
        region: 'Centro',
      });
    });

    it('debe manejar errores de conexión', async () => {
      jest
        .spyOn(service['traductorClient'], 'post')
        .mockRejectedValueOnce(new Error('Network error'));

      await expect(service.traducir('texto')).rejects.toThrow('Network error');
    });
  });

  describe('obtenerHistorial', () => {
    it('debe obtener el historial con límite', async () => {
      const mockResponse = {
        data: {
          traducciones: [
            {
              id: 1,
              texto_original: 'texto1',
              texto_traducido: 'traducción1',
              region: 'Centro',
              palabras_detectadas: [],
              created_at: '2024-01-01',
            },
          ],
          total: 1,
        },
      };

      jest.spyOn(service['traductorClient'], 'get').mockResolvedValueOnce(mockResponse);

      const resultado = await service.obtenerHistorial(20);

      expect(resultado).toEqual({
        traducciones: [
          {
            id: 1,
            textoOriginal: 'texto1',
            textoTraducido: 'traducción1',
            region: 'Centro',
            palabrasDetectadas: [],
            createdAt: '2024-01-01',
          },
        ],
        total: 1,
      });
      expect(service['traductorClient'].get).toHaveBeenCalledWith('/api/historial?limit=20');
    });

    it('debe usar límite de 20 por defecto', async () => {
      jest.spyOn(service['traductorClient'], 'get').mockResolvedValueOnce({
        data: { traducciones: [], total: 0 },
      });

      await service.obtenerHistorial();

      expect(service['traductorClient'].get).toHaveBeenCalledWith('/api/historial?limit=20');
    });

    it('debe manejar respuestas sin traducciones', async () => {
      jest.spyOn(service['traductorClient'], 'get').mockResolvedValueOnce({
        data: {},
      });

      const resultado = await service.obtenerHistorial();

      expect(resultado).toEqual({
        traducciones: [],
        total: 0,
      });
    });
  });

  describe('listarSugerencias', () => {
    it('debe listar sugerencias sin filtro', async () => {
      const mockResponse = {
        data: [{ id: 1, palabra: 'filete', estado: 'pendiente' }],
      };

      jest.spyOn(service['sugerenciasClient'], 'get').mockResolvedValueOnce(mockResponse);

      const resultado = await service.listarSugerencias();

      expect(resultado).toEqual([{ id: 1, palabra: 'filete', estado: 'pendiente' }]);
      expect(service['sugerenciasClient'].get).toHaveBeenCalledWith('/api/sugerencias');
    });

    it('debe listar sugerencias filtradas por estado', async () => {
      const mockResponse = {
        data: [{ id: 1, palabra: 'filete', estado: 'aprobada' }],
      };

      jest.spyOn(service['sugerenciasClient'], 'get').mockResolvedValueOnce(mockResponse);

      const resultado = await service.listarSugerencias('aprobada');

      expect(resultado).toEqual([{ id: 1, palabra: 'filete', estado: 'aprobada' }]);
      expect(service['sugerenciasClient'].get).toHaveBeenCalledWith('/api/sugerencias?estado=aprobada');
    });
  });

  describe('obtenerSugerencia', () => {
    it('debe obtener una sugerencia por ID', async () => {
      const mockResponse = {
        data: { id: 1, palabra: 'filete', estado: 'pendiente' },
      };

      jest.spyOn(service['sugerenciasClient'], 'get').mockResolvedValueOnce(mockResponse);

      const resultado = await service.obtenerSugerencia(1);

      expect(resultado).toEqual({ id: 1, palabra: 'filete', estado: 'pendiente' });
      expect(service['sugerenciasClient'].get).toHaveBeenCalledWith('/api/sugerencias/1');
    });

    it('debe manejar sugerencia no encontrada', async () => {
      jest
        .spyOn(service['sugerenciasClient'], 'get')
        .mockRejectedValueOnce(new Error('404 Not Found'));

      await expect(service.obtenerSugerencia(999)).rejects.toThrow('404 Not Found');
    });
  });

  describe('crearSugerencia', () => {
    it('debe crear una sugerencia correctamente', async () => {
      const input = {
        palabra: 'filete',
        traduccionPropuesta: 'excelente',
        descripcion: 'Excelente persona',
        ejemploUso: 'Ese tipo es un filete',
        region: 'Centro',
        usuarioEmail: 'usuario@example.com',
      };

      const mockResponse = {
        data: { id: 1, ...input, estado: 'pendiente' },
      };

      jest.spyOn(service['sugerenciasClient'], 'post').mockResolvedValueOnce(mockResponse);

      const resultado = await service.crearSugerencia(input);

      expect(resultado).toEqual({ id: 1, ...input, estado: 'pendiente' });
      expect(service['sugerenciasClient'].post).toHaveBeenCalledWith('/api/sugerencias', input);
    });

    it('debe manejar errores al crear sugerencia', async () => {
      const input = {
        palabra: 'filete',
        traduccionPropuesta: 'excelente',
      };

      jest
        .spyOn(service['sugerenciasClient'], 'post')
        .mockRejectedValueOnce(new Error('Validation error'));

      await expect(service.crearSugerencia(input)).rejects.toThrow('Validation error');
    });
  });

  describe('actualizarEstadoSugerencia', () => {
    it('debe actualizar el estado de una sugerencia', async () => {
      const mockResponse = {
        data: { id: 1, palabra: 'filete', estado: 'aprobada' },
      };

      jest.spyOn(service['sugerenciasClient'], 'patch').mockResolvedValueOnce(mockResponse);

      const resultado = await service.actualizarEstadoSugerencia(1, 'aprobada');

      expect(resultado).toEqual({ id: 1, palabra: 'filete', estado: 'aprobada' });
      expect(service['sugerenciasClient'].patch).toHaveBeenCalledWith(
        '/api/sugerencias/1/estado',
        { estado: 'aprobada' },
      );
    });

    it('debe manejar cambios de estado inválidos', async () => {
      jest
        .spyOn(service['sugerenciasClient'], 'patch')
        .mockRejectedValueOnce(new Error('Invalid state'));

      await expect(service.actualizarEstadoSugerencia(1, 'invalid')).rejects.toThrow(
        'Invalid state',
      );
    });
  });

  describe('listarRegiones', () => {
    it('debe listar todas las regiones', async () => {
      const mockResponse = {
        data: [
          { id: 1, nombre: 'Centro' },
          { id: 2, nombre: 'Sur' },
        ],
      };

      jest.spyOn(service['contextoClient'], 'get').mockResolvedValueOnce(mockResponse);

      const resultado = await service.listarRegiones();

      expect(resultado).toEqual([
        { id: 1, nombre: 'Centro' },
        { id: 2, nombre: 'Sur' },
      ]);
      expect(service['contextoClient'].get).toHaveBeenCalledWith('/api/regiones');
    });
  });

  describe('obtenerVariaciones', () => {
    it('debe obtener variaciones regionales de un término', async () => {
      const mockResponse = {
        data: [
          { region: 'Centro', variacion: 'filete' },
          { region: 'Sur', variacion: 'filete' },
        ],
      };

      jest.spyOn(service['contextoClient'], 'get').mockResolvedValueOnce(mockResponse);

      const resultado = await service.obtenerVariaciones('excelente');

      expect(resultado).toEqual([
        { region: 'Centro', variacion: 'filete' },
        { region: 'Sur', variacion: 'filete' },
      ]);
      expect(service['contextoClient'].get).toHaveBeenCalledWith('/api/variaciones/excelente');
    });

    it('debe codificar caracteres especiales en la URL', async () => {
      jest.spyOn(service['contextoClient'], 'get').mockResolvedValueOnce({
        data: [],
      });

      await service.obtenerVariaciones('término con espacios');

      expect(service['contextoClient'].get).toHaveBeenCalledWith(
        '/api/variaciones/t%C3%A9rmino%20con%20espacios',
      );
    });
  });

  describe('checkHealth', () => {
    it('debe verificar la salud de todos los servicios', async () => {
      const getSpyTraductor = jest
        .spyOn(service['traductorClient'], 'get')
        .mockResolvedValueOnce({ data: {} });
      const getSpySugerencias = jest
        .spyOn(service['sugerenciasClient'], 'get')
        .mockResolvedValueOnce({ data: {} });
      const getSpyContexto = jest
        .spyOn(service['contextoClient'], 'get')
        .mockResolvedValueOnce({ data: {} });

      const resultado = await service.checkHealth();

      expect(resultado).toEqual({
        gateway: 'ok',
        traductor: 'ok',
        diccionario: 'via-grpc',
        contexto: 'ok',
        sugerencias: 'ok',
      });
      expect(getSpyTraductor).toHaveBeenCalledWith('/api/health');
      expect(getSpySugerencias).toHaveBeenCalledWith('/api/sugerencias/health');
      expect(getSpyContexto).toHaveBeenCalledWith('/api/health');
    });

    it('debe marcar servicios como down cuando fallan', async () => {
      jest
        .spyOn(service['traductorClient'], 'get')
        .mockRejectedValueOnce(new Error('Connection timeout'));
      jest
        .spyOn(service['sugerenciasClient'], 'get')
        .mockResolvedValueOnce({ data: {} });
      jest
        .spyOn(service['contextoClient'], 'get')
        .mockRejectedValueOnce(new Error('Service unavailable'));

      const resultado = await service.checkHealth();

      expect(resultado).toEqual({
        gateway: 'ok',
        traductor: 'down',
        diccionario: 'via-grpc',
        contexto: 'down',
        sugerencias: 'ok',
      });
    });

    it('debe manejar múltiples fallos de servicios', async () => {
      jest
        .spyOn(service['traductorClient'], 'get')
        .mockRejectedValueOnce(new Error('Error'));
      jest
        .spyOn(service['sugerenciasClient'], 'get')
        .mockRejectedValueOnce(new Error('Error'));
      jest
        .spyOn(service['contextoClient'], 'get')
        .mockRejectedValueOnce(new Error('Error'));

      const resultado = await service.checkHealth();

      expect(resultado).toEqual({
        gateway: 'ok',
        traductor: 'down',
        diccionario: 'via-grpc',
        contexto: 'down',
        sugerencias: 'down',
      });
    });
  });
});
