import type { PeluquerosServicio, AttachServicioDto } from '../models/Peluquero-Servicio';
import { ApiError, apiClient } from './api';

const BASE_PATH = '/peluqueros-servicios';

export const peluqueroServicioService = {
  // Obtiene todas las relaciones entre peluqueros y servicios
  list() {
    return apiClient.get<PeluquerosServicio[]>(BASE_PATH);
  },

  // Asocia un servicio a un peluquero (many-to-many)
  attach(payload: AttachServicioDto, csrfToken: string) {
    return apiClient.post<PeluquerosServicio>(BASE_PATH, payload, { csrfToken });
  },

  // Desasocia un servicio de un peluquero eliminando la relación
  async detach(peluqueroId: number, servicioId: number, csrfToken: string) {
    try {
      await apiClient.delete<void>(`${BASE_PATH}/${peluqueroId}/${servicioId}`, {
        csrfToken,
      });
      return true;
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        // La relación ya no existe; consideramos la operación exitosa para mantener idempotencia.
        return false;
      }
      throw error;
    }
  },
};
