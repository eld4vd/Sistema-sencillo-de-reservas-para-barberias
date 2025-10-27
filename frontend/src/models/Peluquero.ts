import type { PeluquerosServicio } from './Peluquero-Servicio';
import type { Cita } from './Cita';

// Entidad completa que viene del backend
export interface Peluquero {
  id: number;
  nombre: string;
  fotoUrl?: string | null;
  especialidad?: string | null;
  horarioInicio?: string | null; // Formato HH:MM:SS
  horarioFin?: string | null; // Formato HH:MM:SS
  diasLibres?: string | null; // Ej: 'Domingo,Lunes'
  fechaCreacion?: string;
  fechaModificacion?: string;
  fechaEliminacion?: string | null;
  peluquerosServicios?: PeluquerosServicio[];
  citas?: Cita[];
}

// DTO para crear peluquero (sin id ni fechas que genera la DB)
export interface CreatePeluqueroDto {
  nombre: string;
  fotoUrl?: string | null;
  especialidad?: string | null;
  horarioInicio?: string | null;
  horarioFin?: string | null;
  diasLibres?: string | null;
}

// DTO para actualizar peluquero (todos los campos opcionales)
export interface UpdatePeluqueroDto {
  nombre?: string;
  fotoUrl?: string | null;
  especialidad?: string | null;
  horarioInicio?: string | null;
  horarioFin?: string | null;
  diasLibres?: string | null;
}