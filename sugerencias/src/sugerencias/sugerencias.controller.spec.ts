import { Test, TestingModule } from '@nestjs/testing';
import { SugerenciasController } from './sugerencias.controller';
import { SugerenciasService } from './sugerencias.service';
import { EstadoSugerencia } from './sugerencia.entity';

const mockService = () => ({
  crear: jest.fn(),
  listar: jest.fn(),
  obtenerPorId: jest.fn(),
  actualizarEstado: jest.fn(),
  contarPorEstado: jest.fn(),
});

describe('SugerenciasController', () => {
  let controller: SugerenciasController;
  let service: ReturnType<typeof mockService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SugerenciasController],
      providers: [
        { provide: SugerenciasService, useFactory: mockService },
      ],
    }).compile();

    controller = module.get<SugerenciasController>(SugerenciasController);
    service = module.get<SugerenciasService>(SugerenciasService) as any;
  });

  it('should return health status', () => {
    expect(controller.health()).toEqual({ status: 'ok', service: 'sugerencias' });
  });

  it('should return stats from service', async () => {
    service.contarPorEstado.mockResolvedValue({ pendiente: 4 });
    await expect(controller.stats()).resolves.toEqual({ pendiente: 4 });
    expect(service.contarPorEstado).toHaveBeenCalled();
  });

  it('should create a suggestion with the provided body', async () => {
    const body = {
      palabra: 'filete',
      traduccionPropuesta: 'muy bueno',
      descripcion: 'Prueba',
      ejemploUso: 'Está filete',
      region: 'Centro',
      usuarioEmail: 'test@mail.com',
    };

    service.crear.mockResolvedValue({ id: 1, ...body, estado: EstadoSugerencia.PENDIENTE });

    await expect(controller.crear(body)).resolves.toEqual(
      expect.objectContaining({ id: 1, palabra: 'filete' }),
    );
    expect(service.crear).toHaveBeenCalledWith(body);
  });

  it('should list suggestions without state filter', async () => {
    service.listar.mockResolvedValue([]);
    await expect(controller.listar()).resolves.toEqual([]);
    expect(service.listar).toHaveBeenCalledWith(undefined);
  });

  it('should return an error for invalid id', async () => {
    expect(await controller.obtener('invalid')).toEqual({ error: 'ID inválido' });
  });

  it('should obtain suggestion by numeric id', async () => {
    service.obtenerPorId.mockResolvedValue({ id: 2, palabra: 'bacán' });
    await expect(controller.obtener('2')).resolves.toEqual({ id: 2, palabra: 'bacán' });
    expect(service.obtenerPorId).toHaveBeenCalledWith(2);
  });

  it('should update suggestion state', async () => {
    const result = { id: 3, estado: EstadoSugerencia.APROBADA };
    service.actualizarEstado.mockResolvedValue(result as any);
    await expect(
      controller.actualizarEstado('3', { estado: EstadoSugerencia.APROBADA }),
    ).resolves.toEqual(result);
    expect(service.actualizarEstado).toHaveBeenCalledWith(3, { estado: EstadoSugerencia.APROBADA });
  });
});
