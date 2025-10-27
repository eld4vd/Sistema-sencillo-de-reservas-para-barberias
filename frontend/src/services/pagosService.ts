import type { Pago, CreatePagoDto, UpdatePagoDto, EstadoPago } from '../models/Pago';
import { apiClient } from './api';

const BASE_PATH = '/pagos';

export interface PagosQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  estado?: EstadoPago;
  periodo?: 'hoy' | 'semana' | 'mes' | 'todo';
}

export interface PagosResponse {
  data: Pago[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  stats: {
    totalMonto: number;
    completados: number;
    pendientes: number;
    fallidos: number;
    ticketPromedio: number;
  };
}

export const pagosService = {
  // Obtiene pagos paginados con filtros
  list(params?: PagosQueryParams) {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.estado) queryParams.append('estado', params.estado);
    if (params?.periodo) queryParams.append('periodo', params.periodo);

    const url = queryParams.toString() ? `${BASE_PATH}?${queryParams}` : BASE_PATH;
    return apiClient.get<PagosResponse>(url);
  },

  // Obtiene un pago específico por su ID
  getById(id: number) {
    return apiClient.get<Pago>(`${BASE_PATH}/${id}`);
  },

  // Crea un nuevo pago asociado a una cita
  create(payload: CreatePagoDto, csrfToken: string) {
    return apiClient.post<Pago>(BASE_PATH, payload, { csrfToken });
  },

  // Actualiza parcialmente un pago existente por su ID
  update(id: number, payload: UpdatePagoDto, csrfToken: string) {
    return apiClient.patch<Pago>(`${BASE_PATH}/${id}`, payload, { csrfToken });
  },

  // Elimina (soft delete) un pago por su ID
  remove(id: number, csrfToken: string) {
    return apiClient.delete<void>(`${BASE_PATH}/${id}`, { csrfToken });
  },
};
