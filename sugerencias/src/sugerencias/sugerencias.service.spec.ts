import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SugerenciasService } from './sugerencias.service';
import { Sugerencia, EstadoSugerencia } from './sugerencia.entity';
import { NotFoundException } from '@nestjs/common';

const mockRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  createQueryBuilder: jest.fn(),
});

describe('SugerenciasService', () => {
  let service: SugerenciasService;
  let repo: jest.Mocked<Repository<Sugerencia>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SugerenciasService,
        { provide: getRepositoryToken(Sugerencia), useFactory: mockRepository },
      ],
    }).compile();

    service = module.get<SugerenciasService>(SugerenciasService);
    repo = module.get(getRepositoryToken(Sugerencia));
  });

  describe('crear', () => {
    it('debe crear una sugerencia con estado pendiente', async () => {
      const dto = { palabra: 'filete', traduccionPropuesta: 'excelente' };
      const sugerencia = { id: 1, ...dto, estado: EstadoSugerencia.PENDIENTE };

      repo.create.mockReturnValue(sugerencia as any);
      repo.save.mockResolvedValue(sugerencia as any);

      const resultado = await service.crear(dto as any);

      expect(resultado.estado).toBe(EstadoSugerencia.PENDIENTE);
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ estado: EstadoSugerencia.PENDIENTE }),
      );
    });
  });

  describe('listar', () => {
    it('debe listar todas las sugerencias sin filtro', async () => {
      const sugerencias = [
        { id: 1, palabra: 'filete', estado: EstadoSugerencia.PENDIENTE },
        { id: 2, palabra: 'al peo', estado: EstadoSugerencia.APROBADA },
      ];
      repo.find.mockResolvedValue(sugerencias as any);

      const resultado = await service.listar();
      expect(resultado).toHaveLength(2);
      expect(repo.find).toHaveBeenCalledWith({ where: {}, order: { createdAt: 'DESC' } });
    });

    it('debe filtrar por estado', async () => {
      repo.find.mockResolvedValue([]);
      await service.listar(EstadoSugerencia.PENDIENTE);
      expect(repo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { estado: EstadoSugerencia.PENDIENTE } }),
      );
    });
  });

  describe('obtenerPorId', () => {
    it('debe retornar la sugerencia si existe', async () => {
      const sugerencia = { id: 1, palabra: 'bacán' };
      repo.findOne.mockResolvedValue(sugerencia as any);

      const resultado = await service.obtenerPorId(1);
      expect(resultado).toEqual(sugerencia);
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.obtenerPorId(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('actualizarEstado', () => {
    it('debe actualizar el estado correctamente', async () => {
      const sugerencia = { id: 1, estado: EstadoSugerencia.PENDIENTE };
      repo.findOne.mockResolvedValue(sugerencia as any);
      repo.save.mockResolvedValue({ ...sugerencia, estado: EstadoSugerencia.APROBADA } as any);

      const resultado = await service.actualizarEstado(1, { estado: EstadoSugerencia.APROBADA });
      expect(resultado.estado).toBe(EstadoSugerencia.APROBADA);
    });
  });
});
