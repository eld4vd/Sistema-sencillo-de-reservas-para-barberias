import type {
  AuthUser,
  CsrfResponse,
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  ProfileResponse,
  RefreshResponse,
} from '../models/auth';
import type { Admin } from '../models/Admin';
import { mapAdminToAuthUser } from '../helpers';
import { apiClient } from './api';

const AUTH_BASE = '/auth';

// Obtiene el token CSRF desde el servidor para operaciones de mutación
const getCsrf = (): Promise<CsrfResponse> => {
  return apiClient.get<CsrfResponse>(`${AUTH_BASE}/csrf`);
};

// Inicia sesión con email y password, establece cookies HTTP-only
const login = (credentials: LoginRequest, csrfToken: string): Promise<LoginResponse> => {
  return apiClient.post<LoginResponse>(`${AUTH_BASE}/login`, credentials, {
    csrfToken,
  });
};

// Obtiene el perfil del usuario autenticado actual
const me = (): Promise<ProfileResponse> => {
  return apiClient.get<ProfileResponse>(`${AUTH_BASE}/me`);
};

// Refresca el access token usando el refresh token almacenado en cookies
const refresh = (csrfToken: string): Promise<RefreshResponse> => {
  return apiClient.post<RefreshResponse>(`${AUTH_BASE}/refresh`, undefined, {
    csrfToken,
  });
};

// Cierra la sesión del usuario y limpia las cookies de autenticación
const logout = (csrfToken: string): Promise<LogoutResponse> => {
  return apiClient.post<LogoutResponse>(`${AUTH_BASE}/logout`, undefined, {
    csrfToken,
  });
};

// Refresca la sesión y obtiene el perfil actualizado del usuario
const syncSession = async (csrfToken: string): Promise<{ user: AuthUser; admin: Admin }> => {
  const refreshResponse = await refresh(csrfToken);
  if (!refreshResponse.success) {
    throw new Error('No fue posible refrescar la sesión');
  }
  const profile = await me();
  const admin = profile.user;
  return { user: mapAdminToAuthUser(admin), admin };
};

export const authService = {
  getCsrf,
  login,
  me,
  refresh,
  logout,
  syncSession,
};
