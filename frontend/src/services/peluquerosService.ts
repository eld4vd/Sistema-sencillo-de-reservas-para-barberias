import type { Peluquero, CreatePeluqueroDto, UpdatePeluqueroDto } from '../models/Peluquero';
import { apiClient } from './api';

const BASE_PATH = '/peluqueros';

export const peluquerosService = {
  // Obtiene la lista completa de todos los peluqueros
  list() {
    return apiClient.get<Peluquero[]>(BASE_PATH);
  },

  // Obtiene un peluquero específico por su ID
  getById(id: number) {
    return apiClient.get<Peluquero>(`${BASE_PATH}/${id}`);
  },

  // Crea un nuevo peluquero con sus datos y horarios
  create(payload: CreatePeluqueroDto, csrfToken: string) {
    return apiClient.post<Peluquero>(BASE_PATH, payload, { csrfToken });
  },

  // Actualiza parcialmente un peluquero existente por su ID
  update(id: number, payload: UpdatePeluqueroDto, csrfToken: string) {
    return apiClient.patch<Peluquero>(`${BASE_PATH}/${id}`, payload, { csrfToken });
  },

  // Elimina (soft delete) un peluquero por su ID
  remove(id: number, csrfToken: string) {
    return apiClient.delete<void>(`${BASE_PATH}/${id}`, { csrfToken });
  },
};
