// src/models/Admin.ts

// Entidad completa que viene del backend
export interface Admin {
  id: number;
  nombre: string;
  email: string;
  fechaCreacion: string; // Date del backend se serializa como string en JSON
  fechaModificacion: string; // Date del backend se serializa como string en JSON
  fechaEliminacion: string | null; // DeleteDateColumn puede ser null
}

// DTO para crear un nuevo administrador
export interface CreateAdminDto {
  nombre: string;
  email: string;
  password: string;
}

// DTO para actualizar un administrador existente
export interface UpdateAdminDto extends Partial<Omit<CreateAdminDto, 'password'>> {
  password?: string;
}