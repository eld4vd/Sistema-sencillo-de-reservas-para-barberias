import { createContext } from "react";
import type { ReactNode } from "react";
import type { AuthState, LoginRequest, AuthUser } from "../models/auth";

// Opciones para recargar el perfil del usuario
export interface LoadProfileOptions {
  retryOnUnauthorized?: boolean; // Intentar refresh si falla con 401
  silent?: boolean; // No mostrar loading durante la recarga
}

// Opciones para refrescar la sesión
export interface RefreshSessionOptions {
  silent?: boolean; // No mostrar loading ni actualizar state innecesariamente
}

// Contexto de autenticación - contiene estado + métodos para login/logout/refresh
export interface AuthContextValue extends AuthState {
  login: (credentials: LoginRequest) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshSession: (options?: RefreshSessionOptions) => Promise<{ success: boolean }>;
  refreshCsrfToken: () => Promise<string | null>;
  reloadProfile: (options?: LoadProfileOptions) => Promise<AuthUser | null>;
  setError: (message: string | null) => void;
}

export interface AuthProviderProps {
  children: ReactNode;
}

// Estado inicial - usuario no autenticado y cargando
export const initialAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  admin: null,
  isLoading: true,
  error: null,
  csrfToken: null,
};

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);
