import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Peluquero } from 'src/peluqueros/entities/peluquero.entity';
import { Servicio } from 'src/servicios/entities/servicio.entity';
import { Pago } from 'src/pagos/entities/pago.entity';

export type EstadoCita = 'Pendiente' | 'Pagada' | 'Completada' | 'Cancelada';

@Index('uq_cita_peluquero_fecha_hora', ['peluquero', 'fechaHora'], {
  unique: true,
})
@Entity('citas')
export class Cita {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column({ type: 'timestamp', nullable: false })
  fechaHora: Date;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  clienteNombre: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  clienteEmail: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  clienteTelefono?: string | null;

  @Column({
    type: 'enum',
    enum: [ 'Pagada', 'Completada', 'Cancelada'],
    default: 'Pagada',
  })
  estado: EstadoCita;

  @Column({ type: 'text', nullable: true })
  notas?: string | null;

  @CreateDateColumn()
  fechaCreacion: Date;

  @UpdateDateColumn()
  fechaModificacion: Date;

  @DeleteDateColumn({ select: false, nullable: true })
  fechaEliminacion?: Date | null;

  @ManyToOne(() => Peluquero, (peluquero) => peluquero.citas, { eager: false })
  @JoinColumn({ name: 'peluquero_id' })
  peluquero: Peluquero;

  @ManyToOne(() => Servicio, (servicio) => servicio.citas, { eager: false })
  @JoinColumn({ name: 'servicio_id' })
  servicio: Servicio;

  @OneToOne(() => Pago, (pago) => pago.cita, { eager: false })
  pago?: Pago;
}
