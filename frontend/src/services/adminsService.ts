import type { Admin, CreateAdminDto, UpdateAdminDto } from '../models/Admin';
import { apiClient } from './api';

const ADMIN_BASE = '/admins';

export const adminsService = {
  // Obtiene la lista completa de todos los administradores
  list() {
    return apiClient.get<Admin[]>(ADMIN_BASE);
  },

  // Obtiene un administrador específico por su ID
  getById(id: number) {
    return apiClient.get<Admin>(`${ADMIN_BASE}/${id}`);
  },

  // Crea un nuevo administrador con email, password y nombre
  create(payload: CreateAdminDto, csrfToken: string) {
    return apiClient.post<Admin>(ADMIN_BASE, payload, { csrfToken });
  },

  // Actualiza parcialmente un administrador existente por su ID
  update(id: number, payload: UpdateAdminDto, csrfToken: string) {
    return apiClient.patch<Admin>(`${ADMIN_BASE}/${id}`, payload, { csrfToken });
  },

  // Elimina (soft delete) un administrador por su ID
  remove(id: number, csrfToken: string) {
    return apiClient.delete<void>(`${ADMIN_BASE}/${id}`, { csrfToken });
  },
};
