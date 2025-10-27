// Entidad completa que viene del backend
export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  descripcion?: string;
  imagenUrl?: string;
  categoria?: string;
  activo: boolean;
  fechaCreacion: string;
  fechaModificacion: string;
}

// DTO para crear producto (sin id ni fechas que genera la DB)
export interface CreateProductoDto {
  nombre: string;
  precio: number;
  stock: number;
  descripcion?: string;
  imagenUrl?: string;
  categoria?: string;
  activo?: boolean;
}

// DTO para actualizar producto (todos los campos opcionales)
export interface UpdateProductoDto {
  nombre?: string;
  precio?: number;
  stock?: number;
  descripcion?: string;
  imagenUrl?: string;
  categoria?: string;
  activo?: boolean;
}
