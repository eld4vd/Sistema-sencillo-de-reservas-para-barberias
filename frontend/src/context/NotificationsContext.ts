import { createContext } from "react";

// Estructura de una notificación individual
export interface Notification {
  id: string;
  type: "nueva_cita" | "cita_cancelada" | "cita_completada" | "info";
  message: string;
  timestamp: number;
  citaId?: number; // Referencia a la cita relacionada (si aplica)
  read: boolean;
}

// Contexto de notificaciones - gestiona alertas en tiempo real del dashboard
export interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

export const NotificationsContext = createContext<NotificationsContextType | null>(null);
