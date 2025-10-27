import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// Hook para acceder al contexto de autenticación
// Proporciona estado del usuario (isAuthenticated, user, admin) y métodos (login, logout, refresh)
// Lanza error si se usa fuera del AuthProvider para detectar errores de configuración temprano
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return ctx;
};
