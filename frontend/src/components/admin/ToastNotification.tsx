import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { FaTimes } from "react-icons/fa";
import { useNotifications } from "../../hooks/useNotifications";

// rendering-hoist-jsx: hoist static maps outside component
const TOAST_STYLES: Record<string, string> = {
  nueva_cita: "bg-green-50 border-green-200 text-green-900",
  cita_cancelada: "bg-red-50 border-red-200 text-red-900",
  cita_completada: "bg-blue-50 border-blue-200 text-blue-900",
};
const DEFAULT_TOAST_STYLE = "bg-gray-50 border-gray-200 text-gray-900";

const TOAST_ICONS: Record<string, string> = {
  nueva_cita: "🎉",
  cita_cancelada: "❌",
  cita_completada: "✅",
};
const DEFAULT_TOAST_ICON = "ℹ️";

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

  // rerender-memo: stable handler ref
  const handleClose = useCallback((notificationId: string) => {
    setVisibleToasts((prev) => prev.filter((id) => id !== notificationId));
  }, []);

  // js-set-map-lookups: use Set for O(1) lookup instead of .includes() O(n)
  const visibleSet = useMemo(() => new Set(visibleToasts), [visibleToasts]);

  const visibleNotifications = useMemo(
    () => notifications.filter((n) => visibleSet.has(n.id)),
    [notifications, visibleSet]
  );

  if (visibleNotifications.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {visibleNotifications.map((notification) => (
        <div
          key={notification.id}
          className={`pointer-events-auto animate-slide-in-right rounded-lg border-2 px-4 py-3 shadow-lg ${TOAST_STYLES[notification.type] ?? DEFAULT_TOAST_STYLE}`}
          style={{
            animation: "slideInRight 0.3s ease-out",
          }}
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">{TOAST_ICONS[notification.type] ?? DEFAULT_TOAST_ICON}</span>
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
