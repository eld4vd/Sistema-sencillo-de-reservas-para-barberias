// CITA UTILS - Lógica de negocio para citas
// Type guards: verifican si una relación viene poblada del backend.
// Getters: extraen datos de relaciones sin importar si traen el objeto completo o solo el id.
// Cálculos: operaciones de negocio (fecha fin, facturación).
// Usado en: pages/Dashboard/Reservas.tsx.

import type { Cita } from "../../models/Cita";
import type { Peluquero } from "../../models/Peluquero";
import type { Servicio } from "../../models/Servicio";
import type { Pago } from "../../models/Pago";
import { DEFAULT_CITA_DURATION_MINUTES } from "./dateUtils";
import { currencyFormatter, fullDateFormatter } from "./formatters";

// ============ TYPE GUARDS ============
// Verifican si una relación viene con todos los datos o solo el ID

// Relación de peluquero poblada cuando trae nombre en lugar de solo el id.
export const isFullPeluquero = (peluquero: Cita["peluquero"]): peluquero is Peluquero =>
  Boolean(peluquero) && typeof peluquero === "object" && "nombre" in peluquero;

// Relación de servicio poblada cuando expone el nombre.
export const isFullServicio = (servicio: Cita["servicio"]): servicio is Servicio =>
  Boolean(servicio) && typeof servicio === "object" && "nombre" in servicio;

// Relación de pago poblada cuando incluye estado.
export const isFullPago = (pago: Cita["pago"]): pago is Pago =>
  Boolean(pago) && typeof pago === "object" && "estado" in pago;

// ============ GETTERS ============
// Extraen datos considerando si la relación está poblada o no

// Nombre del peluquero o un fallback legible para tableros.
export const getPeluqueroNombre = (peluquero: Cita["peluquero"]): string => {
  if (!peluquero) return "Sin asignar";
  if (isFullPeluquero(peluquero) && peluquero.nombre) {
    return peluquero.nombre;
  }
  return `Barbero #${peluquero.id}`;
};

// Nombre del servicio o fallback neutral cuando la relación no se pobló.
export const getServicioNombre = (servicio: Cita["servicio"]): string => {
  if (!servicio) return "—";
  if (isFullServicio(servicio) && servicio.nombre) {
    return servicio.nombre;
  }
  return `Servicio #${servicio.id}`;
};

// Precio del servicio para totales y pantallas de detalle.
export const getServicioPrecio = (servicio: Cita["servicio"]): number | null => {
  if (!servicio) return null;
  if (isFullServicio(servicio) && typeof servicio.precio === "number") {
    return servicio.precio;
  }
  return null;
};

// Duración del servicio en minutos para cálculos de agenda.
export const getServicioDuracion = (servicio: Cita["servicio"]): number | null => {
  if (!servicio) return null;
  if (isFullServicio(servicio) && typeof servicio.duracion === "number") {
    return servicio.duracion;
  }
  return null;
};

// ============ CÁLCULOS ============
// Operaciones de negocio: fechas, facturación

// Hora de fin: suma la duración del servicio o el default cuando no existe.
export const computeCitaEndDate = (cita: Cita): Date => {
  const start = new Date(cita.fechaHora);
  const duration = getServicioDuracion(cita.servicio) ?? DEFAULT_CITA_DURATION_MINUTES;
  return new Date(start.getTime() + duration * 60000);
};

// Genera número de factura SUN-YYYYMMDD-XXXX para reportes locales.
export const buildInvoiceNumber = (citaId: number, issuedAt: Date): string => {
  const year = issuedAt.getFullYear();
  const month = String(issuedAt.getMonth() + 1).padStart(2, "0");
  const day = String(issuedAt.getDate()).padStart(2, "0");
  return `SUN-${year}${month}${day}-${citaId.toString().padStart(4, "0")}`;
};

// Texto plano de la factura con datos clave del servicio y el pago.
export const generateInvoiceText = (cita: Cita, invoiceNumber: string, issuedAt: Date, total: number): string => {
  const servicioNombre = getServicioNombre(cita.servicio);
  const peluqueroNombre = getPeluqueroNombre(cita.peluquero);
  const fechaServicio = fullDateFormatter.format(new Date(cita.fechaHora));
  const telefono = cita.clienteTelefono ?? "—";
  const metodoPago = isFullPago(cita.pago)
    ? cita.pago.metodoPago ?? "QR inmediato"
    : cita.pago && typeof cita.pago === "object" && "id" in cita.pago
      ? `Pago #${cita.pago.id}`
      : "QR inmediato";
  const referenciaPago = isFullPago(cita.pago) && cita.pago.transaccionId ? cita.pago.transaccionId : "—";
  const totalFormateado = currencyFormatter.format(total);

  const secciones = [
    `Factura ${invoiceNumber}`,
    `Emitida: ${fullDateFormatter.format(issuedAt)}`,
    "",
    `Cliente: ${cita.clienteNombre}`,
    `Email: ${cita.clienteEmail}`,
    `Teléfono: ${telefono}`,
    "",
    `Servicio: ${servicioNombre}`,
    `Profesional: ${peluqueroNombre}`,
    `Fecha del servicio: ${fechaServicio}`,
    "",
    `Método de pago: ${metodoPago}`,
    `Referencia de pago: ${referenciaPago}`,
    "",
    `Total: ${totalFormateado}`,
  ];

  if (cita.notas) {
    secciones.push("", `Notas: ${cita.notas}`);
  }

  return secciones.join("\n");
};
