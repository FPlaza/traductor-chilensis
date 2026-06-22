import { Test, TestingModule } from '@nestjs/testing';
import { ChilensisResolver } from './chilensis.resolver';
import { MicroserviciosService } from '../services/microservicios.service';

const mockMsService = {
  traducir: jest.fn(),
  obtenerHistorial: jest.fn(),
  listarSugerencias: jest.fn(),
  obtenerSugerencia: jest.fn(),
  crearSugerencia: jest.fn(),
  actualizarEstadoSugerencia: jest.fn(),
  listarRegiones: jest.fn(),
  obtenerVariaciones: jest.fn(),
  checkHealth: jest.fn(),
};

describe('ChilensisResolver', () => {
  let resolver: ChilensisResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChilensisResolver,
        { provide: MicroserviciosService, useValue: mockMsService },
      ],
    }).compile();

    resolver = module.get<ChilensisResolver>(ChilensisResolver);
    jest.clearAllMocks();
  });

  it('debería ser definido', () => {
    expect(resolver).toBeDefined();
  });

  // ---- MUTATIONS: Traducir ----
  describe('traducir (Mutation)', () => {
    it('debe traducir un texto con región especificada', async () => {
      const expected = {
        textoOriginal: 'Oye huevón',
        textoTraducido: 'Oye [amigo]',
        region: 'Centro',
        palabrasDetectadas: ['huevón'],
      };
      mockMsService.traducir.mockResolvedValue(expected);

      const resultado = await resolver.traducir('Oye huevón', 'Centro');

      expect(resultado).toEqual(expected);
      expect(mockMsService.traducir).toHaveBeenCalledWith('Oye huevón', 'Centro');
    });

    it('debe usar región por defecto cuando no se especifica', async () => {
      const expected = {
        textoOriginal: 'texto cualquiera',
        textoTraducido: 'texto traducido',
        region: 'Centro',
      };
      mockMsService.traducir.mockResolvedValue(expected);

      await resolver.traducir('texto cualquiera');

      expect(mockMsService.traducir).toHaveBeenCalledWith('texto cualquiera', undefined);
    });

    it('debe manejar errores al traducir', async () => {
      mockMsService.traducir.mockRejectedValue(new Error('Error de traducción'));

      await expect(resolver.traducir('texto')).rejects.toThrow('Error de traducción');
    });
  });

  // ---- MUTATIONS: Sugerencias ----
  describe('crearSugerencia (Mutation)', () => {
    it('debe crear una sugerencia con todos los campos', async () => {
      const input = {
        palabra: 'filete',
        traduccionPropuesta: 'excelente',
        descripcion: 'Excelente persona',
        ejemploUso: 'Ese tipo es un filete',
        region: 'Centro',
        usuarioEmail: 'user@example.com',
      };
      const expected = { id: 1, ...input, estado: 'pendiente' };
      mockMsService.crearSugerencia.mockResolvedValue(expected);

      const resultado = await resolver.crearSugerencia(input);

      expect(resultado).toEqual(expected);
      expect(mockMsService.crearSugerencia).toHaveBeenCalledWith(input);
    });

    it('debe manejar errores al crear sugerencia', async () => {
      const input = { palabra: 'test' };
      mockMsService.crearSugerencia.mockRejectedValue(
        new Error('Validation failed'),
      );

      await expect(resolver.crearSugerencia(input)).rejects.toThrow(
        'Validation failed',
      );
    });
  });

  describe('actualizarEstadoSugerencia (Mutation)', () => {
    it('debe actualizar el estado de una sugerencia a aprobada', async () => {
      const expected = {
        id: 1,
        palabra: 'filete',
        estado: 'aprobada',
      };
      mockMsService.actualizarEstadoSugerencia.mockResolvedValue(expected);

      const resultado = await resolver.actualizarEstadoSugerencia(1, 'aprobada');

      expect(resultado).toEqual(expected);
      expect(mockMsService.actualizarEstadoSugerencia).toHaveBeenCalledWith(
        1,
        'aprobada',
      );
    });

    it('debe actualizar el estado de una sugerencia a rechazada', async () => {
      const expected = {
        id: 1,
        palabra: 'filete',
        estado: 'rechazada',
      };
      mockMsService.actualizarEstadoSugerencia.mockResolvedValue(expected);

      const resultado = await resolver.actualizarEstadoSugerencia(1, 'rechazada');

      expect(resultado).toEqual(expected);
      expect(mockMsService.actualizarEstadoSugerencia).toHaveBeenCalledWith(
        1,
        'rechazada',
      );
    });

    it('debe manejar errores al actualizar estado', async () => {
      mockMsService.actualizarEstadoSugerencia.mockRejectedValue(
        new Error('Sugerencia no encontrada'),
      );

      await expect(resolver.actualizarEstadoSugerencia(999, 'aprobada')).rejects.toThrow(
        'Sugerencia no encontrada',
      );
    });
  });

  // ---- QUERIES: Traductor ----
  describe('historial (Query)', () => {
    it('debe retornar el historial con límite especificado', async () => {
      const expected = {
        traducciones: [
          {
            id: 1,
            textoOriginal: 'Oye',
            textoTraducido: 'Hey',
            region: 'Centro',
            palabrasDetectadas: [],
            createdAt: '2024-01-01',
          },
        ],
        total: 1,
      };
      mockMsService.obtenerHistorial.mockResolvedValue(expected);

      const resultado = await resolver.historial(10);

      expect(resultado).toEqual(expected);
      expect(mockMsService.obtenerHistorial).toHaveBeenCalledWith(10);
    });

    it('debe retornar historial con límite por defecto', async () => {
      const expected = { traducciones: [], total: 0 };
      mockMsService.obtenerHistorial.mockResolvedValue(expected);

      const resultado = await resolver.historial();

      expect(resultado).toEqual(expected);
      expect(mockMsService.obtenerHistorial).toHaveBeenCalledWith(undefined);
    });

    it('debe manejar errores al obtener historial', async () => {
      mockMsService.obtenerHistorial.mockRejectedValue(new Error('Database error'));

      await expect(resolver.historial(10)).rejects.toThrow('Database error');
    });
  });

  // ---- QUERIES: Sugerencias ----
  describe('sugerencias (Query)', () => {
    it('debe listar todas las sugerencias sin filtro', async () => {
      const expected = [
        { id: 1, palabra: 'filete', estado: 'pendiente' },
        { id: 2, palabra: 'cachetero', estado: 'aprobada' },
      ];
      mockMsService.listarSugerencias.mockResolvedValue(expected);

      const resultado = await resolver.sugerencias();

      expect(resultado).toEqual(expected);
      expect(mockMsService.listarSugerencias).toHaveBeenCalledWith(undefined);
    });

    it('debe listar sugerencias filtradas por estado pendiente', async () => {
      const expected = [{ id: 1, palabra: 'filete', estado: 'pendiente' }];
      mockMsService.listarSugerencias.mockResolvedValue(expected);

      const resultado = await resolver.sugerencias('pendiente');

      expect(resultado).toEqual(expected);
      expect(mockMsService.listarSugerencias).toHaveBeenCalledWith('pendiente');
    });

    it('debe listar sugerencias filtradas por estado aprobada', async () => {
      const expected = [{ id: 2, palabra: 'cachetero', estado: 'aprobada' }];
      mockMsService.listarSugerencias.mockResolvedValue(expected);

      const resultado = await resolver.sugerencias('aprobada');

      expect(resultado).toEqual(expected);
      expect(mockMsService.listarSugerencias).toHaveBeenCalledWith('aprobada');
    });
  });

  describe('sugerencia (Query)', () => {
    it('debe obtener una sugerencia por ID', async () => {
      const expected = {
        id: 1,
        palabra: 'filete',
        traduccionPropuesta: 'excelente',
        estado: 'pendiente',
      };
      mockMsService.obtenerSugerencia.mockResolvedValue(expected);

      const resultado = await resolver.sugerencia(1);

      expect(resultado).toEqual(expected);
      expect(mockMsService.obtenerSugerencia).toHaveBeenCalledWith(1);
    });

    it('debe manejar sugerencia no encontrada', async () => {
      mockMsService.obtenerSugerencia.mockRejectedValue(
        new Error('Sugerencia no encontrada'),
      );

      await expect(resolver.sugerencia(999)).rejects.toThrow(
        'Sugerencia no encontrada',
      );
    });
  });

  // ---- QUERIES: Contexto ----
  describe('regiones (Query)', () => {
    it('debe retornar lista de regiones', async () => {
      const expected = [
        { id: 1, nombre: 'Centro' },
        { id: 2, nombre: 'Sur' },
        { id: 3, nombre: 'Norte' },
      ];
      mockMsService.listarRegiones.mockResolvedValue(expected);

      const resultado = await resolver.regiones();

      expect(resultado).toEqual(expected);
      expect(mockMsService.listarRegiones).toHaveBeenCalled();
    });

    it('debe manejar errores al listar regiones', async () => {
      mockMsService.listarRegiones.mockRejectedValue(new Error('Database error'));

      await expect(resolver.regiones()).rejects.toThrow('Database error');
    });
  });

  describe('variacionesRegionales (Query)', () => {
    it('debe obtener variaciones regionales de un término', async () => {
      const expected = [
        { region: 'Centro', variacion: 'filete' },
        { region: 'Sur', variacion: 'bacán' },
      ];
      mockMsService.obtenerVariaciones.mockResolvedValue(expected);

      const resultado = await resolver.variacionesRegionales('excelente');

      expect(resultado).toEqual(expected);
      expect(mockMsService.obtenerVariaciones).toHaveBeenCalledWith('excelente');
    });

    it('debe manejar términos con caracteres especiales', async () => {
      mockMsService.obtenerVariaciones.mockResolvedValue([]);

      await resolver.variacionesRegionales('término con espacios');

      expect(mockMsService.obtenerVariaciones).toHaveBeenCalledWith(
        'término con espacios',
      );
    });
  });

  // ---- QUERIES: Health ----
  describe('health (Query)', () => {
    it('debe retornar estado de todos los servicios como ok', async () => {
      const expected = {
        gateway: 'ok',
        traductor: 'ok',
        diccionario: 'via-grpc',
        contexto: 'ok',
        sugerencias: 'ok',
      };
      mockMsService.checkHealth.mockResolvedValue(expected);

      const resultado = await resolver.health();

      expect(resultado.gateway).toBe('ok');
      expect(resultado.traductor).toBe('ok');
      expect(resultado.diccionario).toBe('via-grpc');
      expect(resultado.contexto).toBe('ok');
      expect(resultado.sugerencias).toBe('ok');
      expect(mockMsService.checkHealth).toHaveBeenCalled();
    });

    it('debe retornar estado con servicios caídos', async () => {
      const expected = {
        gateway: 'ok',
        traductor: 'down',
        diccionario: 'via-grpc',
        contexto: 'down',
        sugerencias: 'ok',
      };
      mockMsService.checkHealth.mockResolvedValue(expected);

      const resultado = await resolver.health();

      expect(resultado.traductor).toBe('down');
      expect(resultado.contexto).toBe('down');
    });

    it('debe manejar errores al verificar salud', async () => {
      mockMsService.checkHealth.mockRejectedValue(new Error('Health check failed'));

      await expect(resolver.health()).rejects.toThrow('Health check failed');
    });
  });
});
