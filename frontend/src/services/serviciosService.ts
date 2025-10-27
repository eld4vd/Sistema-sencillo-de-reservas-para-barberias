import type { Servicio, CreateServicioDto, UpdateServicioDto } from '../models/Servicio';
import { apiClient } from './api';

const BASE_PATH = '/servicios';

export const serviciosService = {
  // Obtiene la lista completa de todos los servicios disponibles
  list() {
    return apiClient.get<Servicio[]>(BASE_PATH);
  },

  // Obtiene un servicio específico por su ID
  getById(id: number) {
    return apiClient.get<Servicio>(`${BASE_PATH}/${id}`);
  },

  // Crea un nuevo servicio con nombre, precio y duración
  create(payload: CreateServicioDto, csrfToken: string) {
    return apiClient.post<Servicio>(BASE_PATH, payload, { csrfToken });
  },

  // Actualiza parcialmente un servicio existente por su ID
  update(id: number, payload: UpdateServicioDto, csrfToken: string) {
    return apiClient.patch<Servicio>(`${BASE_PATH}/${id}`, payload, { csrfToken });
  },

  // Elimina (soft delete) un servicio por su ID
  remove(id: number, csrfToken: string) {
    return apiClient.delete<void>(`${BASE_PATH}/${id}`, { csrfToken });
  },
};
