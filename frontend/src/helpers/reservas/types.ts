// TYPES - Tipos TypeScript y constantes para reservas.
// Agrupa errores de formulario, estados gestionables, status del clipboard y metadatos visuales.
// Usado en pages/Dashboard/Reservas.tsx.

import type { EstadoCita } from "../../models/Cita";
import type { IconType } from "react-icons";
import {
  FaCheckCircle,
  FaClock,
  FaRegCalendarCheck,
  FaTimesCircle,
} from "react-icons/fa";

// Errores del modal de detalle de cita.
export type DetailErrors = { general?: string };

// Estados de cita que permiten acciones manuales.
export type EstadoGestionable = Extract<EstadoCita, "Pagada" | "Completada">;

// Estados del botón de copiar factura.
export type CopyStatus = "idle" | "copied" | "error";

// Datos mínimos del peluquero para renderizar el calendario semanal.
export type SchedulePeluquero = {
  id: number;
  nombre: string;
  fotoUrl?: string | null;
  especialidad?: string | null;
};

// Metadatos visuales para cada estado de cita.
export const statusMeta: Record<EstadoCita, { classes: string; Icon: IconType }> = {
  Pendiente: {
    classes: "border-[#B8935E]/40 bg-[#B8935E]/12 text-[#B8935E]",
    Icon: FaClock,
  },
  Pagada: {
    classes: "border-emerald-400/35 bg-emerald-500/12 text-emerald-300",
    Icon: FaRegCalendarCheck,
  },
  Completada: {
    classes: "border-sky-400/35 bg-sky-500/12 text-sky-300",
    Icon: FaCheckCircle,
  },
  Cancelada: {
    classes: "border-red-400/35 bg-red-500/12 text-red-300",
    Icon: FaTimesCircle,
  },
};
