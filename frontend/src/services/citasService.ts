import type { Cita, CreateCitaDto, UpdateCitaDto } from '../models/Cita';
import { apiClient } from './api';

const BASE_PATH = '/citas';

export const citasService = {
  // Obtiene la lista completa de todas las citas
  list() {
    return apiClient.get<Cita[]>(BASE_PATH);
  },

  // Obtiene una cita específica por su ID
  getById(id: number) {
    return apiClient.get<Cita>(`${BASE_PATH}/${id}`);
  },

  // Crea una nueva cita con los datos proporcionados
  create(payload: CreateCitaDto, csrfToken: string) {
    return apiClient.post<Cita>(BASE_PATH, payload, { csrfToken });
  },

  // Actualiza parcialmente una cita existente por su ID
  update(id: number, payload: UpdateCitaDto, csrfToken: string) {
    return apiClient.patch<Cita>(`${BASE_PATH}/${id}`, payload, { csrfToken });
  },

  // Elimina (soft delete) una cita por su ID
  remove(id: number, csrfToken: string) {
    return apiClient.delete<void>(`${BASE_PATH}/${id}`, { csrfToken });
  },
};
