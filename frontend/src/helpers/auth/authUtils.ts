// AUTH UTILS - Utilidades de autenticación.
// mapAdminToAuthUser convierte Admin del backend a AuthUser del contexto.
// getCsrfTokenFromCookie obtiene el token CSRF expuesto por el backend.
// Usado en context/AuthContext.tsx y servicios que requieren CSRF.

import type { Admin } from '../../models/Admin';
import type { AuthUser } from '../../models/auth';

const DEFAULT_CSRF_COOKIE_NAME = import.meta.env.VITE_CSRF_COOKIE_NAME ?? 'csrf_token';

// Cache en memoria para evitar re-parsear cookies constantemente
let cachedCsrfToken: string | null = null;
let lastCookieString = '';

// Convierte el Admin completo en el objeto AuthUser que mantiene el contexto.
// Extrae solo los campos esenciales para reducir la superficie del estado público.
export const mapAdminToAuthUser = (admin: Admin): AuthUser => ({
  id: admin.id,
  nombre: admin.nombre,
  email: admin.email,
});

// Lee la cookie de CSRF con cache en memoria para mejorar performance.
export const getCsrfTokenFromCookie = (cookieName = DEFAULT_CSRF_COOKIE_NAME): string | null => {
  // SSR safety check
  if (typeof document === 'undefined') return null;

  const currentCookies = document.cookie;

  // Si las cookies no han cambiado, retornar cache
  if (currentCookies === lastCookieString && cachedCsrfToken !== null) {
    return cachedCsrfToken;
  }

  // Actualizar tracking de cookies
  lastCookieString = currentCookies;

  // Usar regex para búsqueda más robusta
  const regex = new RegExp(`(?:^|;)\\s*${cookieName}\\s*=\\s*([^;]+)`);
  const match = currentCookies.match(regex);

  if (match && match[1]) {
    try {
      cachedCsrfToken = decodeURIComponent(match[1].trim());
      return cachedCsrfToken;
    } catch (error) {
      // Si falla el decode (caracteres inválidos), retornar sin decodificar
      cachedCsrfToken = match[1].trim();
      return cachedCsrfToken;
    }
  }

  cachedCsrfToken = null;
  return null;
};

// Invalida el cache del CSRF token. Útil después de logout o cambios de sesión.
export const clearCsrfTokenCache = (): void => {
  cachedCsrfToken = null;
  lastCookieString = '';
};
