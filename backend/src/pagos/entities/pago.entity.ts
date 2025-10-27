import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Cita } from 'src/citas/entities/cita.entity';

export type EstadoPago = 'Pendiente' | 'Completado' | 'Fallido';

@Entity('pagos')
export class Pago {
  @PrimaryGeneratedColumn('identity')
  id: number;

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
  monto: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  metodoPago?: string | null;

  @Column({
    type: 'enum',
    enum: ['Pendiente', 'Completado', 'Fallido'],
    default: 'Pendiente',
  })
  estado: EstadoPago;

  @Column({ type: 'varchar', length: 255, nullable: true })
  transaccionId?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  fechaPago?: Date | null;

  @CreateDateColumn()
  fechaCreacion: Date;

  @UpdateDateColumn()
  fechaModificacion: Date;

  @DeleteDateColumn({ select: false })
  fechaEliminacion: Date;

  // Una cita puede tener un pago asociado (ondelete nos dice si borra la cita el campo pago se pone a null)
  @OneToOne(() => Cita, (cita) => cita.pago)
  @JoinColumn({ name: 'cita_id' }) // no se declara con @Column por que aqui ya lo estamos haciendo por que tenemos instalado la libreria naming-strategies
  cita: Cita;
}
