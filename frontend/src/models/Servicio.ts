import type { PeluquerosServicio } from './Peluquero-Servicio';
import type { Cita } from './Cita';

// Entidad completa que viene del backend
export interface Servicio {
  id: number;
  nombre: string;
  precio: number;
  duracion: number; // En minutos
  descripcion?: string | null;
  activo: boolean;
  fechaCreacion?: string;
  fechaModificacion?: string;
  fechaEliminacion?: string | null;
  peluquerosServicios?: PeluquerosServicio[];
  citas?: Cita[];
}

// DTO para crear servicio (sin id ni fechas que genera la DB, ni relaciones)
export interface CreateServicioDto {
  nombre: string;
  precio: number;
  duracion: number;
  descripcion?: string | null;
  activo?: boolean;
  peluqueroIds?: number[];
}

// DTO para actualizar servicio (todos los campos opcionales)
export interface UpdateServicioDto {
  nombre?: string;
  precio?: number;
  duracion?: number;
  descripcion?: string | null;
  activo?: boolean;
  peluqueroIds?: number[];
}