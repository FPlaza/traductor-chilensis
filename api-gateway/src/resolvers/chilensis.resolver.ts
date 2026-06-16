import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { MicroserviciosService } from '../services/microservicios.service';

@Resolver()
export class ChilensisResolver {
  constructor(private readonly msService: MicroserviciosService) {}

  // ---- Queries: Traductor ----
  @Query('historial')
  async historial(@Args('limit', { nullable: true }) limit?: number) {
    return this.msService.obtenerHistorial(limit);
  }

  // ---- Queries: Sugerencias ----
  @Query('sugerencias')
  async sugerencias(@Args('estado', { nullable: true }) estado?: string) {
    return this.msService.listarSugerencias(estado);
  }

  @Query('sugerencia')
  async sugerencia(@Args('id', { type: () => Int }) id: number) {
    return this.msService.obtenerSugerencia(id);
  }

  // ---- Queries: Contexto ----
  @Query('regiones')
  async regiones() {
    return this.msService.listarRegiones();
  }

  @Query('variacionesRegionales')
  async variacionesRegionales(@Args('termino') termino: string) {
    return this.msService.obtenerVariaciones(termino);
  }

  // ---- Queries: Health ----
  @Query('health')
  async health() {
    return this.msService.checkHealth();
  }

  // ---- Mutations: Traducir ----
  @Mutation('traducir')
  async traducir(
    @Args('texto') texto: string,
    @Args('region', { nullable: true }) region?: string,
  ) {
    return this.msService.traducir(texto, region);
  }

  // ---- Mutations: Sugerencias ----
  @Mutation('crearSugerencia')
  async crearSugerencia(@Args('input') input: any) {
    return this.msService.crearSugerencia(input);
  }

  @Mutation('actualizarEstadoSugerencia')
  async actualizarEstadoSugerencia(
    @Args('id', { type: () => Int }) id: number,
    @Args('estado') estado: string,
  ) {
    return this.msService.actualizarEstadoSugerencia(id, estado);
  }
}
