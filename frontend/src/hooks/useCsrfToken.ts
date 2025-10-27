import { useEffect } from 'react';
import { useAuth } from './useAuth';

// Hook para garantizar que el token CSRF esté disponible
// Refresca automáticamente el token si no existe al montar el componente
// Útil en formularios que requieren CSRF token antes de enviar datos
export const useCsrfToken = () => {
  const { csrfToken, refreshCsrfToken } = useAuth();

  // Obtener token si no está presente al inicializar
  useEffect(() => {
    if (!csrfToken) {
      void refreshCsrfToken();
    }
  }, [csrfToken, refreshCsrfToken]);

  return csrfToken;
};
