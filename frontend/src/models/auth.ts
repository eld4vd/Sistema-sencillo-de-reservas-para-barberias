// src/models/auth.ts
import type { Admin } from './Admin';

// DTO para login
export interface LoginRequest {
  email: string;
  password: string;
}

// Usuario simplificado que devuelve el login
export interface AuthUser {
  id: number;
  nombre: string;
  email: string;
}

// Respuesta del endpoint POST /auth/login (tokens vienen en httpOnly cookies)
export interface LoginResponse {
  success: boolean;
  user: AuthUser;
}

// Payload del JWT decodificado
export interface JwtPayload {
  sub: number;
  iat?: number;
  exp?: number;
}

// Respuesta del endpoint GET /auth/me
export interface ProfileResponse {
  user: Admin;
}

// Respuesta del endpoint GET /auth/csrf
export interface CsrfResponse {
  csrfToken: string;
}

// Respuesta del endpoint POST /auth/refresh
export interface RefreshResponse {
  success: boolean;
}

// Respuesta del endpoint POST /auth/logout
export interface LogoutResponse {
  success: boolean;
}

// Estado de autenticación global (Context/Redux/Zustand)
export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  admin: Admin | null;
  isLoading: boolean;
  error: string | null;
  csrfToken: string | null;
}

// Errores de autenticación del backend
export interface AuthError {
  message: string;
  statusCode: number;
  error?: string;
}