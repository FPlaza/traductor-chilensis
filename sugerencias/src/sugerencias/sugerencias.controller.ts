import {
  Controller, Get, Post, Patch, Param, Body,
  Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { SugerenciasService } from './sugerencias.service';
import { ActualizarEstadoDto } from './sugerencia.dto';
import { EstadoSugerencia } from './sugerencia.entity';

@Controller('api/sugerencias')
export class SugerenciasController {
  constructor(private readonly sugerenciasService: SugerenciasService) {}

  @Get('health')
  health() {
    return { status: 'ok', service: 'sugerencias' };
  }

  @Get('stats')
  async stats() {
    return this.sugerenciasService.contarPorEstado();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crear(@Body() body: any) {
    // Aceptar cualquier body sin validación estricta
    return this.sugerenciasService.crear({
      palabra: body.palabra,
      traduccionPropuesta: body.traduccionPropuesta,
      descripcion: body.descripcion,
      ejemploUso: body.ejemploUso,
      region: body.region,
      usuarioEmail: body.usuarioEmail,
    });
  }

  @Get()
  async listar(@Query('estado') estado?: EstadoSugerencia) {
    return this.sugerenciasService.listar(estado);
  }

  @Get(':id')
  async obtener(@Param('id') id: string) {
    const numId = parseInt(id);
    if (isNaN(numId)) {
      return { error: 'ID inválido' };
    }
    return this.sugerenciasService.obtenerPorId(numId);
  }

  @Patch(':id/estado')
  async actualizarEstado(
    @Param('id') id: string,
    @Body() dto: ActualizarEstadoDto,
  ) {
    return this.sugerenciasService.actualizarEstado(+id, dto);
  }
}