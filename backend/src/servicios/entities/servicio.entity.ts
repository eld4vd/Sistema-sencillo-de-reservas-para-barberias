import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PeluquerosServicio } from 'src/peluqueros_servicios/entities/peluqueros_servicio.entity';
import { Cita } from 'src/citas/entities/cita.entity';

@Entity('servicios')
export class Servicio {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  nombre: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    transformer: {
      to: (value: number | null) => value,
      from: (value: string | null) => (value !== null ? Number(value) : null),
    },
  })
  precio: number;

  @Column({ type: 'int', nullable: false })
  duracion: number; // en minutos

  @Column({ type: 'text', nullable: true })
  descripcion?: string | null;

  @Column({ type: 'boolean', default: true, nullable: false })
  activo: boolean;

  @CreateDateColumn()
  fechaCreacion: Date;

  @UpdateDateColumn()
  fechaModificacion: Date;

  @DeleteDateColumn({ select: false })
  fechaEliminacion: Date;

  // un servicio puede ser ofrecido por muchos peluqueros (apuntando a tabla intermedia)
  @OneToMany(
    () => PeluquerosServicio,
    (peluquerosServicio) => peluquerosServicio.servicio,
  )
  peluquerosServicios: PeluquerosServicio[];

  // un servicio puede tener muchas citas
  @OneToMany(() => Cita, (cita) => cita.servicio)
  citas: Cita[];
}
