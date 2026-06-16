import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sugerencia, EstadoSugerencia } from './sugerencia.entity';
import { CrearSugerenciaDto, ActualizarEstadoDto } from './sugerencia.dto';

@Injectable()
export class SugerenciasService {
  constructor(
    @InjectRepository(Sugerencia)
    private readonly sugerenciaRepository: Repository<Sugerencia>,
  ) {}

  async crear(dto: CrearSugerenciaDto): Promise<Sugerencia> {
    const sugerencia = this.sugerenciaRepository.create({
      palabra: dto.palabra,
      traduccionPropuesta: dto.traduccionPropuesta,
      descripcion: dto.descripcion,
      ejemploUso: dto.ejemploUso,
      region: dto.region,
      usuarioEmail: dto.usuarioEmail,
      estado: EstadoSugerencia.PENDIENTE,
    });
    return this.sugerenciaRepository.save(sugerencia);
  }

  async listar(estado?: EstadoSugerencia): Promise<Sugerencia[]> {
    const where = estado ? { estado } : {};
    return this.sugerenciaRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async obtenerPorId(id: number): Promise<Sugerencia> {
    const sugerencia = await this.sugerenciaRepository.findOne({ where: { id } });
    if (!sugerencia) {
      throw new NotFoundException(`Sugerencia #${id} no encontrada`);
    }
    return sugerencia;
  }

  async actualizarEstado(id: number, dto: ActualizarEstadoDto): Promise<Sugerencia> {
    const sugerencia = await this.obtenerPorId(id);
    sugerencia.estado = dto.estado;
    return this.sugerenciaRepository.save(sugerencia);
  }

  async contarPorEstado(): Promise<Record<string, number>> {
    const resultados = await this.sugerenciaRepository
      .createQueryBuilder('s')
      .select('s.estado', 'estado')
      .addSelect('COUNT(*)', 'total')
      .groupBy('s.estado')
      .getRawMany();

    return resultados.reduce((acc, r) => {
      acc[r.estado] = parseInt(r.total);
      return acc;
    }, {});
  }
}
