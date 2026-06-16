import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sugerencia } from './sugerencia.entity';
import { SugerenciasService } from './sugerencias.service';
import { SugerenciasController } from './sugerencias.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Sugerencia])],
  controllers: [SugerenciasController],
  providers: [SugerenciasService],
  exports: [SugerenciasService],
})
export class SugerenciasModule {}