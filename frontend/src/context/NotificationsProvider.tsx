import { useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { NotificationsContext, type Notification } from "./NotificationsContext";

interface NotificationsProviderProps {
  children: ReactNode;
}

const PROCESSED_STORAGE_KEY = "sunsetz_notifications_processed";

export const NotificationsProvider = ({ children }: NotificationsProviderProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Set de claves procesadas para evitar duplicados entre recargas
  const processedKeysRef = useRef<Set<string>>(new Set());

  // Restaurar notificaciones procesadas desde localStorage al iniciar
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      const stored = window.localStorage.getItem(PROCESSED_STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          processedKeysRef.current = new Set(parsed.filter((item) => typeof item === "string"));
        }
      }
    } catch (err) {
      console.warn("No se pudieron restaurar las notificaciones procesadas", err);
    }
  }, []);

  // Persistir claves procesadas en localStorage
  const persistProcessedKeys = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      const serialized = JSON.stringify(Array.from(processedKeysRef.current));
      window.localStorage.setItem(PROCESSED_STORAGE_KEY, serialized);
    } catch (err) {
      console.warn("No se pudieron persistir las notificaciones procesadas", err);
    }
  }, []);

  // Limpiar notificaciones antiguas (más de 24 horas) cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      setNotifications((prev) => prev.filter((n) => n.timestamp > oneDayAgo));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const addNotification = useCallback(
    (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
      const newNotification: Notification = {
        ...notification,
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        timestamp: Date.now(),
        read: false,
      };

      // Clave única para deduplicación (type + citaId o message)
      const dedupeKey = newNotification.citaId
        ? `${newNotification.type}-${newNotification.citaId}`
        : `${newNotification.type}-${newNotification.message}`;

      let added = false;
      setNotifications((prev) => {
        // Evitar duplicados por contenido o clave procesada
        const alreadyExists = prev.some(
          (existing) =>
            existing.type === newNotification.type &&
            existing.citaId === newNotification.citaId &&
            existing.message === newNotification.message
        );

        if (alreadyExists || processedKeysRef.current.has(dedupeKey)) {
          return prev;
        }

        added = true;
        return [newNotification, ...prev];
      });

      if (!added) {
        return;
      }

      // Marcar como procesada y persistir
      processedKeysRef.current.add(dedupeKey);
      persistProcessedKeys();

      // Mostrar notificación del navegador si está permitido
      if ("Notification" in window && Notification.permission === "granted") {
        const browserNotif = new Notification("Sunsetz Studio", {
          body: notification.message,
          icon: "/vite.svg",
          badge: "/vite.svg",
          tag: newNotification.id,
        });

        // Auto-cerrar después de 5 segundos
        setTimeout(() => browserNotif.close(), 5000);
      }
    },
    [persistProcessedKeys]
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};
