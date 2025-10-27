import { useEffect, useState, useRef } from "react";
import { FaTimes } from "react-icons/fa";
import { useNotifications } from "../../hooks/useNotifications";

const ToastNotification = () => {
  const { notifications } = useNotifications();
  const [visibleToasts, setVisibleToasts] = useState<string[]>([]);
  const shownNotificationsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Mostrar solo la última notificación no leída que no se haya mostrado antes
    const lastUnread = notifications.find((n) => !n.read && !shownNotificationsRef.current.has(n.id));
    
    if (lastUnread) {
      // Marcar como mostrada
      shownNotificationsRef.current.add(lastUnread.id);
      setVisibleToasts([lastUnread.id]);

      // Auto-ocultar después de 5 segundos
      const timer = setTimeout(() => {
        setVisibleToasts((prev) => prev.filter((id) => id !== lastUnread.id));
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notifications]);

  const handleClose = (notificationId: string) => {
    setVisibleToasts((prev) => prev.filter((id) => id !== notificationId));
  };

  const getToastStyles = (type: string) => {
    switch (type) {
      case "nueva_cita":
        return "bg-green-50 border-green-200 text-green-900";
      case "cita_cancelada":
        return "bg-red-50 border-red-200 text-red-900";
      case "cita_completada":
        return "bg-blue-50 border-blue-200 text-blue-900";
      default:
        return "bg-gray-50 border-gray-200 text-gray-900";
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "nueva_cita":
        return "🎉";
      case "cita_cancelada":
        return "❌";
      case "cita_completada":
        return "✅";
      default:
        return "ℹ️";
    }
  };

  const visibleNotifications = notifications.filter((n) =>
    visibleToasts.includes(n.id)
  );

  if (visibleNotifications.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {visibleNotifications.map((notification) => (
        <div
          key={notification.id}
          className={`pointer-events-auto animate-slide-in-right rounded-lg border-2 px-4 py-3 shadow-lg ${getToastStyles(
            notification.type
          )}`}
          style={{
            animation: "slideInRight 0.3s ease-out",
          }}
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">{getIcon(notification.type)}</span>
            <div className="flex-1">
              <p className="text-sm font-semibold">{notification.message}</p>
            </div>
            <button
              type="button"
              onClick={() => handleClose(notification.id)}
              className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Cerrar notificación"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ToastNotification;
