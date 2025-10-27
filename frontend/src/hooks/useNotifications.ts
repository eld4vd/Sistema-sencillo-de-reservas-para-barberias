import { useContext } from "react";
import { NotificationsContext } from "../context/NotificationsContext";

// Hook para acceder al sistema de notificaciones
// Permite agregar/remover/limpiar notificaciones en tiempo real
// Usado en componentes que necesitan mostrar alertas al usuario
export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications debe usarse dentro de NotificationsProvider");
  }
  return context;
};
