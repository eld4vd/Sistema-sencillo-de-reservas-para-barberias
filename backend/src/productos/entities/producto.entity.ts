import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('productos')
export class Producto {
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

  @Column({ type: 'int', nullable: false, default: 0 })
  stock: number;

  @Column({ type: 'text', nullable: true })
  descripcion?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  imagenUrl?: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  categoria?: string | null;

  @Column({ type: 'boolean', default: true, nullable: false })
  activo: boolean;

  @CreateDateColumn()
  fechaCreacion: Date;

  @UpdateDateColumn()
  fechaModificacion: Date;

  @DeleteDateColumn({ select: false })
  fechaEliminacion: Date;
}
