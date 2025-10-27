import { useEffect, useState } from "react";
import { FaBell } from "react-icons/fa";

/**
 * Componente que solicita permiso para notificaciones del navegador
 * Solo se muestra si el navegador soporta notificaciones y aún no se han otorgado permisos
 */
const NotificationPermissionRequest = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Verificar si el navegador soporta notificaciones
    if ("Notification" in window && Notification.permission === "default") {
      // Esperar 3 segundos antes de mostrar el banner (para no ser intrusivo)
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, []);

  const requestPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setShowBanner(false);
      }
    }
  };

  const dismiss = () => {
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40 max-w-md rounded-lg border-2 border-blue-200 bg-blue-50 p-4 shadow-lg">
      <div className="flex items-start gap-3">
        <FaBell className="mt-1 h-5 w-5 flex-shrink-0 text-blue-600" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-blue-900">
            Habilita las notificaciones
          </h4>
          <p className="mt-1 text-xs text-blue-800">
            Recibe alertas cuando lleguen nuevas reservas, incluso en otras pestañas.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={requestPermission}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
            >
              Habilitar
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="rounded-md border border-blue-300 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
            >
              Más tarde
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPermissionRequest;
