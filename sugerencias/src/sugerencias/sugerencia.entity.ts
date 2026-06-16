import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum EstadoSugerencia {
  PENDIENTE = 'pendiente',
  APROBADA = 'aprobada',
  RECHAZADA = 'rechazada',
}

@Entity('sugerencias')
export class Sugerencia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  palabra: string;

  @Column({ name: 'traduccion_propuesta', length: 255 })
  traduccionPropuesta: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ name: 'ejemplo_uso', type: 'text', nullable: true })
  ejemploUso: string;

  @Column({ length: 50, nullable: true })
  region: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: EstadoSugerencia.PENDIENTE,
  })
  estado: EstadoSugerencia;

  @Column({ name: 'usuario_email', length: 100, nullable: true })
  usuarioEmail: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
