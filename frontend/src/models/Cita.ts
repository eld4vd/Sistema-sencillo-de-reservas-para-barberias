// src/models/Cita.ts
import type { Peluquero } from './Peluquero';
import type { Servicio } from './Servicio';
import type { Pago } from './Pago';

export type EstadoCita = 'Pendiente' | 'Pagada' | 'Completada' | 'Cancelada';

// Entidad completa que viene del backend
export interface Cita {
  id: number;
  fechaHora: string; // timestamp se serializa como string ISO 8601
  clienteNombre: string;
  clienteEmail: string;
  clienteTelefono: string | null; // nullable en backend
  estado: EstadoCita;
  notas: string | null; // nullable en backend
  fechaCreacion: string; // CreateDateColumn siempre está presente
  fechaModificacion: string; // UpdateDateColumn siempre está presente
  fechaEliminacion: string | null; // DeleteDateColumn puede ser null
  peluquero: Peluquero | { id: number }; // ManyToOne siempre debe estar
  servicio: Servicio | { id: number }; // ManyToOne siempre debe estar
  pago?: Pago | { id: number }; // OneToOne es opcional
}

// DTO para crear una nueva cita
// Envía solo los campos necesarios al backend, excluyendo campos autogenerados
export interface CreateCitaDto {
  fechaHora: string; // ISO 8601 string (ej: "2025-01-15T10:30:00")
  clienteNombre: string;
  clienteEmail: string;
  clienteTelefono?: string | null;
  notas?: string | null;
  servicioId: number; // ID del servicio, no el objeto completo
  peluqueroId: number; // ID del peluquero, no el objeto completo
}

// DTO para actualizar una cita existente
// Todos los campos son opcionales (Partial), permite actualizaciones parciales
export interface UpdateCitaDto extends Partial<CreateCitaDto> {
  estado?: EstadoCita; // 'Pagada' | 'Completada' | 'Cancelada' (Pendiente legacy)
  pagoId?: number | null; // Asociar un pago existente
}