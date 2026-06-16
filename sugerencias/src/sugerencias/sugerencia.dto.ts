import { IsString, IsEmail, IsOptional, IsEnum, MinLength, MaxLength } from 'class-validator';
import { EstadoSugerencia } from './sugerencia.entity';

export class CrearSugerenciaDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  palabra: string;

  @IsString()
  @MinLength(3)
  @MaxLength(255)
  traduccionPropuesta: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @IsOptional()
  ejemploUso?: string;

  @IsString()
  @IsOptional()
  region?: string;

  @IsEmail()
  @IsOptional()
  usuarioEmail?: string;
}

export class ActualizarEstadoDto {
  @IsEnum(EstadoSugerencia)
  estado: EstadoSugerencia;
}
