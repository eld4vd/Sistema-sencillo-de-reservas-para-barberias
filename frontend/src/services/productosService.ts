import { apiClient } from "./api";
import type { Producto, CreateProductoDto, UpdateProductoDto } from "../models/Producto";

export const productosService = {
  // Listar todos los productos (admin)
  list: async (): Promise<Producto[]> => {
    return apiClient.get<Producto[]>("/productos");
  },

  // Listar productos activos (público)
  listActive: async (): Promise<Producto[]> => {
    return apiClient.get<Producto[]>("/productos/activos");
  },

  // Obtener un producto por ID
  getById: async (id: number): Promise<Producto> => {
    return apiClient.get<Producto>(`/productos/${id}`);
  },

  // Crear producto
  create: async (data: CreateProductoDto, csrfToken: string): Promise<Producto> => {
    return apiClient.post<Producto>("/productos", data, {
      csrfToken,
    });
  },

  // Actualizar producto
  update: async (id: number, data: UpdateProductoDto, csrfToken: string): Promise<Producto> => {
    return apiClient.patch<Producto>(`/productos/${id}`, data, {
      csrfToken,
    });
  },

  // Eliminar producto
  delete: async (id: number, csrfToken: string): Promise<void> => {
    await apiClient.delete(`/productos/${id}`, {
      csrfToken,
    });
  },

  // Actualizar stock
  updateStock: async (id: number, quantity: number, csrfToken: string): Promise<Producto> => {
    return apiClient.patch<Producto>(`/productos/${id}/stock`, { quantity }, {
      csrfToken,
    });
  },
};
