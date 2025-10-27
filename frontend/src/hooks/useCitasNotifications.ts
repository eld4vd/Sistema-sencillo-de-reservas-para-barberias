import { useEffect, useRef } from "react";
import { useNotifications } from "./useNotifications";
import type { Cita } from "../models/Cita";

const DASHBOARD_INIT_KEY = "sunsetz_dashboard_init_timestamp";

// Hook para detectar cambios en citas y notificar automáticamente
// Compara el array actual de citas con el anterior para detectar nuevas, canceladas o completadas
// Solo notifica citas creadas DESPUÉS de que el admin abrió el dashboard (evita spam en primera carga)
export const useCitasNotifications = (citas: Cita[]) => {
  const { addNotification } = useNotifications();
  
  // Almacena el estado anterior de citas para comparación
  const previousCitasRef = useRef<Cita[]>([]);
  
  // Flag para ignorar notificaciones en la primera carga
  const isFirstLoadRef = useRef(true);
  
  // Timestamp de cuando el admin abrió el dashboard por primera vez
  const initTimestampRef = useRef<number>(0);

  // Inicializar o recuperar timestamp del dashboard
  useEffect(() => {
    const storedTimestamp = localStorage.getItem(DASHBOARD_INIT_KEY);
    if (storedTimestamp) {
      // Sesión existente - recuperar timestamp
      initTimestampRef.current = parseInt(storedTimestamp, 10);
    } else {
      // Primera vez - guardar timestamp actual
      const now = Date.now();
      initTimestampRef.current = now;
      localStorage.setItem(DASHBOARD_INIT_KEY, now.toString());
    }
  }, []);

  // Detectar cambios en el array de citas
  useEffect(() => {
    // Skip primera carga para evitar notificaciones de citas existentes
    if (isFirstLoadRef.current) {
      previousCitasRef.current = citas;
      isFirstLoadRef.current = false;
      return;
    }

    // Crear Set de IDs anteriores para búsqueda O(1)
    const previousIds = new Set(previousCitasRef.current.map((c) => c.id));
    
    // Detectar nuevas citas (no existían antes Y fueron creadas después de abrir dashboard)
    const newCitas = citas.filter((c) => {
      const isNew = !previousIds.has(c.id);
      const createdAfterInit =
        new Date(c.fechaCreacion).getTime() > initTimestampRef.current;
      return isNew && createdAfterInit;
    });

    // Detectar citas que cambiaron a estado "Cancelada"
    const cancelledCitas = citas.filter((c) => {
      const previous = previousCitasRef.current.find((prev) => prev.id === c.id);
      return previous && previous.estado !== "Cancelada" && c.estado === "Cancelada";
    });

    // Detectar citas que cambiaron a estado "Completada"
    const completedCitas = citas.filter((c) => {
      const previous = previousCitasRef.current.find((prev) => prev.id === c.id);
      return previous && previous.estado !== "Completada" && c.estado === "Completada";
    });

    // Notificar nuevas citas con formato de fecha legible
    newCitas.forEach((cita) => {
      const fecha = new Date(cita.fechaHora).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
      addNotification({
        type: "nueva_cita",
        message: `Nueva reserva: ${cita.clienteNombre} - ${fecha}`,
        citaId: cita.id,
      });
    });

    // Notificar citas canceladas
    cancelledCitas.forEach((cita) => {
      addNotification({
        type: "cita_cancelada",
        message: `Reserva cancelada: ${cita.clienteNombre}`,
        citaId: cita.id,
      });
    });

    // Notificar citas completadas
    completedCitas.forEach((cita) => {
      addNotification({
        type: "cita_completada",
        message: `Reserva completada: ${cita.clienteNombre}`,
        citaId: cita.id,
      });
    });

    // Actualizar snapshot para la próxima comparación
    previousCitasRef.current = citas;
  }, [citas, addNotification]);
};
