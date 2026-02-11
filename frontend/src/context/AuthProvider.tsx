import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { AuthState } from "../models/auth";
import { authService } from "../services/authService";
import { ApiError, getErrorMessage } from "../services/api";
import { mapAdminToAuthUser, getCsrfTokenFromCookie, clearCsrfTokenCache } from "../helpers";
import { authLogger } from "../helpers/logging";
import { preloadAdminArea } from "../helpers/perf/prefetch";
import { AuthContext, initialAuthState } from "./AuthContext";
import type { AuthContextValue, AuthProviderProps } from "./AuthContext";

// Provider de autenticación - maneja sesión, CSRF tokens y estado del usuario
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [state, setState] = useState<AuthState>(initialAuthState);
  
  // Ref para mantener token CSRF sincronizado entre estado y memoria
  const csrfTokenRef = useRef<string | null>(null);

  const setAuthState = useCallback(
    (updater: (prev: AuthState) => AuthState) => {
      setState(updater);
    },
    []
  );

  // Actualiza el token CSRF tanto en ref como en estado
  const setCsrfToken = useCallback(
    (token: string | null) => {
      csrfTokenRef.current = token;
      setAuthState((prev) => ({ ...prev, csrfToken: token }));
    },
    [setAuthState]
  );

  // Obtiene token CSRF fresco del servidor o fallback desde cookie
  const refreshCsrfToken = useCallback(async () => {
    try {
      const response = await authService.getCsrf();
      const csrfToken = response?.csrfToken ?? getCsrfTokenFromCookie();
      if (!csrfToken) {
        throw new Error("No se pudo obtener el token CSRF del servidor.");
      }
      setCsrfToken(csrfToken);
      return csrfToken;
    } catch (error) {
      const token = getCsrfTokenFromCookie();
      if (token) {
        setCsrfToken(token);
        return token;
      }
      setAuthState((prev) => ({ ...prev, error: getErrorMessage(error) }));
      return null;
    }
  }, [setAuthState, setCsrfToken]);

  // Sincroniza el token CSRF desde la cookie al estado
  const syncCsrfFromCookie = useCallback(() => {
    const latestToken = getCsrfTokenFromCookie();
    if (latestToken) {
      setCsrfToken(latestToken);
    }
  }, [setCsrfToken]);

  // Garantiza que haya un token CSRF válido antes de operaciones mutativas
  const ensureCsrfToken = useCallback(async () => {
    const cookieToken = getCsrfTokenFromCookie();
    if (cookieToken) {
      setCsrfToken(cookieToken);
      return cookieToken;
    }
    if (csrfTokenRef.current) {
      return csrfTokenRef.current;
    }
    return refreshCsrfToken();
  }, [refreshCsrfToken, setCsrfToken]);

  // Carga el perfil del usuario autenticado desde el servidor
  // Opcionalmente reintenta con refresh si falla con 401
  const loadProfile = useCallback<AuthContextValue["reloadProfile"]>(
    async ({ retryOnUnauthorized = false, silent = false } = {}) => {
      if (!silent) {
        setAuthState((prev) => ({ ...prev, isLoading: true }));
      }
      try {
        const profile = await authService.me();
        const admin = profile.user;
        const user = mapAdminToAuthUser(admin);
        setAuthState((prev) => ({
          ...prev,
          admin,
          user,
          isAuthenticated: true,
          error: null,
          isLoading: false,
        }));
        return user;
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          if (retryOnUnauthorized) {
            try {
              const token = await ensureCsrfToken();
              if (!token) {
                throw new Error("No se pudo obtener el token CSRF.");
              }
              const refreshResult = await authService.refresh(token);
              if (!refreshResult.success) {
                throw new Error("No fue posible refrescar la sesión.");
              }
              const profile = await authService.me();
              const admin = profile.user;
              const user = mapAdminToAuthUser(admin);
              setAuthState((prev) => ({
                ...prev,
                admin,
                user,
                isAuthenticated: true,
                error: null,
                isLoading: false,
              }));
              return user;
            } catch (refreshError) {
              setAuthState((prev) => ({
                ...prev,
                admin: null,
                user: null,
                isAuthenticated: false,
                error: getErrorMessage(refreshError),
                isLoading: false,
              }));
              return null;
            }
          }

          setAuthState((prev) => ({
            ...prev,
            admin: null,
            user: null,
            isAuthenticated: false,
            error: null,
            isLoading: false,
          }));
          return null;
        }

        setAuthState((prev) => ({
          ...prev,
          error: getErrorMessage(error),
          isLoading: false,
        }));
        throw error;
      }
    },
    [ensureCsrfToken, setAuthState]
  );

  const login = useCallback<AuthContextValue["login"]>(
    async (credentials) => {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const token = await ensureCsrfToken();
        if (!token) {
          throw new Error("No se pudo obtener el token CSRF.");
        }

  const loginResponse = await authService.login(credentials, token);
        syncCsrfFromCookie();

        try {
          const user = await loadProfile({
            retryOnUnauthorized: true,
            silent: true,
          });
          if (user) {
            // Calentar chunks de admin tras iniciar sesión con éxito
            preloadAdminArea();
            return user;
          }
        } catch {
          // Si falla, usar datos del login como fallback
        }

        const fallbackUser = loginResponse.user ?? null;
        if (!fallbackUser) {
          throw new Error("No se pudo obtener la información del usuario.");
        }

        setAuthState((prev) => ({
          ...prev,
          user: fallbackUser,
          admin: null,
          isAuthenticated: true,
          error: null,
          isLoading: false,
        }));
        // Calentar chunks de admin para navegación posterior
        preloadAdminArea();

        return fallbackUser;
      } catch (error) {
        const message = getErrorMessage(error);
        setAuthState((prev) => ({
          ...prev,
          admin: null,
          user: null,
          isAuthenticated: false,
          error: message,
          isLoading: false,
        }));
        throw error;
      }
    },
    [ensureCsrfToken, loadProfile, setAuthState, syncCsrfFromCookie]
  );

  const logout = useCallback<AuthContextValue["logout"]>(async () => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));
    try {
      const token = await ensureCsrfToken();
      if (token) {
        await authService.logout(token);
      }
    } catch (error) {
      setAuthState((prev) => ({ ...prev, error: getErrorMessage(error) }));
    } finally {
      // Limpiar cache de CSRF token al cerrar sesión
      clearCsrfTokenCache();
      setAuthState((prev) => ({
        ...prev,
        admin: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      }));
    }
  }, [ensureCsrfToken, setAuthState]);

  const refreshSession = useCallback<AuthContextValue["refreshSession"]>(
    async ({ silent = true } = {}) => {
      // Solo mostrar loading si no es silencioso (evita re-renders innecesarios)
      if (!silent) {
        setAuthState((prev) => ({ ...prev, isLoading: true }));
      }
      try {
        const token = await ensureCsrfToken();
        if (!token) {
          throw new Error("No se pudo obtener el token CSRF.");
        }
        const response = await authService.refresh(token);
        if (!response.success) {
          throw new Error("No fue posible refrescar la sesión.");
        }
        syncCsrfFromCookie();
        
        // Solo recargar perfil si no es silencioso
        if (!silent) {
          const refreshedUser = await loadProfile({
            retryOnUnauthorized: true,
            silent: true,
          });
          if (!refreshedUser) {
            throw new Error(
              "No fue posible obtener el perfil tras refrescar."
            );
          }
        }
        
        return response;
      } catch (error) {
        setAuthState((prev) => ({
          ...prev,
          admin: null,
          user: null,
          isAuthenticated: false,
          error: getErrorMessage(error),
          isLoading: false,
        }));
        throw error;
      }
    },
    [ensureCsrfToken, loadProfile, setAuthState, syncCsrfFromCookie]
  );

  const setError = useCallback<AuthContextValue["setError"]>(
    (message) => {
      setAuthState((prev) => ({ ...prev, error: message }));
    },
    [setAuthState]
  );

  // Preparación inicial
  useEffect(() => {
    const prepare = async () => {
      try {
        const token = await refreshCsrfToken();
        if (!token) {
          setAuthState((prev) => ({ ...prev, isLoading: false }));
          return;
        }

        const user = await loadProfile({ retryOnUnauthorized: true });
        if (!user) {
          setAuthState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          error: getErrorMessage(error),
        }));
      }
    };

    void prepare();
  }, [loadProfile, refreshCsrfToken, setAuthState]);

  // Auto-refresh proactivo del access token cada 12 minutos
  // Esto previene que expire (expira a los 15 minutos)
  useEffect(() => {
    if (!state.isAuthenticated) {
      return;
    }

    // Refresh cada 12 minutos (antes de que expire a los 15)
    const REFRESH_INTERVAL = 12 * 60 * 1000; // 12 minutos

    const intervalId = setInterval(async () => {
      // Ejecutar refresh silencioso para evitar re-renders innecesarios
      if (state.isAuthenticated) {
        try {
          await refreshSession({ silent: true });
          authLogger.log('Token renovado automáticamente (silencioso)');
        } catch (error) {
          authLogger.error('Error al renovar token:', error);
          // Si falla el refresh, el usuario verá el error en la próxima request
        }
      }
    }, REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [state.isAuthenticated, refreshSession]);

  // Refresh adicional cuando la pestaña vuelve a ser visible (después de estar en background)
  useEffect(() => {
    if (!state.isAuthenticated) {
      return;
    }

    let lastRefreshTime = Date.now();

    const handleVisibilityChange = async () => {
      // Si la pestaña vuelve a estar visible después de más de 14 minutos, hacer refresh
      const timeSinceLastRefresh = Date.now() - lastRefreshTime;
      const FOURTEEN_MINUTES = 14 * 60 * 1000;

      if (document.visibilityState === 'visible' && timeSinceLastRefresh > FOURTEEN_MINUTES && state.isAuthenticated) {
        try {
          await refreshSession({ silent: true });
          lastRefreshTime = Date.now();
          authLogger.log('Token renovado tras volver a la pestaña (silencioso)');
        } catch (error) {
          authLogger.error('Error al renovar token tras visibilidad:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [state.isAuthenticated, refreshSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      logout,
      refreshSession,
      refreshCsrfToken,
      reloadProfile: loadProfile,
      setError,
    }),
    [
      state,
      login,
      logout,
      refreshSession,
      refreshCsrfToken,
      loadProfile,
      setError,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
