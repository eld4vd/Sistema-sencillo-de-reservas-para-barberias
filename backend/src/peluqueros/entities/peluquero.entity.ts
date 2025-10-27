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

@Entity('peluqueros')
export class Peluquero {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  nombre: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  fotoUrl?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  especialidad?: string | null;

  @Column({ type: 'time', nullable: true })
  horarioInicio?: string | null; // HH:MM:SS

  @Column({ type: 'time', nullable: true })
  horarioFin?: string | null; // HH:MM:SS

  @Column({ type: 'varchar', length: 50, nullable: true })
  diasLibres?: string | null; // 'Domingo,Lunes'

  @CreateDateColumn()
  fechaCreacion: Date;

  @UpdateDateColumn()
  fechaModificacion: Date;

  @DeleteDateColumn({ select: false })
  fechaEliminacion: Date;

  // un peluquero puede tener muchos servicios ( apuntado a tabla intermedia)
  @OneToMany(
    () => PeluquerosServicio,
    (peluquerosServicio) => peluquerosServicio.peluquero,
  )
  peluquerosServicios: PeluquerosServicio[];

  // un peluquero puede tener muchas citas
  @OneToMany(() => Cita, (cita) => cita.peluquero)
  citas: Cita[];
}
