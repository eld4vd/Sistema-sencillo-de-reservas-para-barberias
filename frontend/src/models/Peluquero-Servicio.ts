// src/models/PeluquerosServicio.ts
import type { Peluquero } from './Peluquero';
import type { Servicio } from './Servicio';

// Entidad completa que viene del backend (relación many-to-many)
export interface PeluquerosServicio {
  peluquero_id: number;
  servicio_id: number;
  peluquero: Peluquero | { id: number };
  servicio: Servicio | { id: number };
  fechaCreacion: string;
  fechaModificacion: string;
  fechaEliminacion: string | null;
}

// DTO para asociar un servicio a un peluquero
export interface AttachServicioDto {
  peluqueroId: number;
  servicioId: number;
}