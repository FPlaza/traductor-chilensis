import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sugerencia } from './sugerencias/sugerencia.entity';
import { SugerenciasModule } from './sugerencias/sugerencias.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL || 'postgres://admin:admin_password@postgres:5432/db_sugerencias',
      entities: [Sugerencia],
      synchronize: true,
    }),
    SugerenciasModule,
  ],
})
export class AppModule {}