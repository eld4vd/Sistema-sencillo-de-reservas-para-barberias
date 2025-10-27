// src/models/Pago.ts
import type { Cita } from './Cita';

export type EstadoPago = 'Pendiente' | 'Completado' | 'Fallido';

// Entidad completa que viene del backend
export interface Pago {
  id: number;
  monto: number;
  metodoPago: string | null;
  estado: EstadoPago;
  transaccionId: string | null;
  fechaPago: string | null;
  fechaCreacion: string;
  fechaModificacion: string;
  fechaEliminacion: string | null;
  cita: Cita | { id: number };
}

// DTO para crear un nuevo pago
export interface CreatePagoDto {
  monto: number;
  metodoPago?: string | null;
  transaccionId?: string | null;
  estado?: EstadoPago;
  citaId: number;
}

// DTO para actualizar un pago existente
export type UpdatePagoDto = Partial<CreatePagoDto>;