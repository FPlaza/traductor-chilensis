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

  describe('traducir', () => {
    it('debe llamar al servicio con texto y región', async () => {
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

    it('debe usar Centro como región por defecto', async () => {
      mockMsService.traducir.mockResolvedValue({});
      await resolver.traducir('texto cualquiera');
      expect(mockMsService.traducir).toHaveBeenCalledWith('texto cualquiera', undefined);
    });
  });

  describe('historial', () => {
    it('debe retornar el historial con límite', async () => {
      const expected = { traducciones: [], total: 0 };
      mockMsService.obtenerHistorial.mockResolvedValue(expected);

      const resultado = await resolver.historial(10);
      expect(resultado).toEqual(expected);
      expect(mockMsService.obtenerHistorial).toHaveBeenCalledWith(10);
    });
  });

  describe('sugerencias', () => {
    it('debe listar sugerencias sin filtro', async () => {
      mockMsService.listarSugerencias.mockResolvedValue([]);
      await resolver.sugerencias();
      expect(mockMsService.listarSugerencias).toHaveBeenCalledWith(undefined);
    });

    it('debe listar sugerencias filtradas por estado', async () => {
      mockMsService.listarSugerencias.mockResolvedValue([]);
      await resolver.sugerencias('pendiente');
      expect(mockMsService.listarSugerencias).toHaveBeenCalledWith('pendiente');
    });
  });

  describe('crearSugerencia', () => {
    it('debe crear una sugerencia', async () => {
      const input = { palabra: 'filete', traduccionPropuesta: 'excelente' };
      const expected = { id: 1, ...input, estado: 'pendiente' };
      mockMsService.crearSugerencia.mockResolvedValue(expected);

      const resultado = await resolver.crearSugerencia(input);
      expect(resultado).toEqual(expected);
    });
  });

  describe('health', () => {
    it('debe retornar estado de todos los servicios', async () => {
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
    });
  });
});
