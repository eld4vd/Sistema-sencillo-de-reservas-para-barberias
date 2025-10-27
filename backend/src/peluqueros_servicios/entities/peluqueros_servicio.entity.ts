import {
  Entity,
  ManyToOne,
  PrimaryColumn,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Peluquero } from 'src/peluqueros/entities/peluquero.entity';
import { Servicio } from 'src/servicios/entities/servicio.entity';

@Entity('peluqueros_servicios')
export class PeluquerosServicio {
  // 🔑 Clave compuesta -> columnas simples
  @PrimaryColumn({ type: 'int', name: 'peluquero_id' })
  peluquero_id: number;

  @PrimaryColumn({ type: 'int', name: 'servicio_id' })
  servicio_id: number;

  // 🔗 Relación con Peluquero
  @ManyToOne(() => Peluquero, (peluquero) => peluquero.peluquerosServicios, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'peluquero_id' })
  peluquero: Peluquero;

  // 🔗 Relación con Servicio
  @ManyToOne(() => Servicio, (servicio) => servicio.peluquerosServicios, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'servicio_id' })
  servicio: Servicio;

  @CreateDateColumn()
  fechaCreacion: Date;

  @UpdateDateColumn()
  fechaModificacion: Date;

  @DeleteDateColumn({ select: false })
  fechaEliminacion: Date;
}
