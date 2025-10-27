// DATE UTILS - Helpers de fecha para el módulo de reservas.
// Funciones puras para cálculos de calendario, navegación semanal y validaciones.
// Usado en pages/Dashboard/Reservas.tsx y componentes que manejan rangos de fecha.

// Máximo de días hacia adelante o atrás permitidos al buscar fechas (1 año).
export const DATE_SEARCH_MAX_OFFSET_DAYS = 365;

// Duración default de una cita cuando el servicio no define una propia.
export const DEFAULT_CITA_DURATION_MINUTES = 60;

// Convierte la fecha en valor compatible con input[type="date"].
export const toDateInputValue = (date: Date): string => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

// Parsea YYYY-MM-DD a year/month/day (month cero indexado).
export const parseDateInput = (value: string | null | undefined): { year: number; month: number; day: number } | null => {
  if (!value) return null;
  const [yearStr, monthStr, dayStr] = value.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr) - 1;
  const day = Number(dayStr);
  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
    return null;
  }
  return { year, month, day };
};

// Normaliza una fecha al inicio del día (00:00).
export const startOfDay = (date: Date): Date => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

// Devuelve una nueva fecha sumando o restando días.
export const addDays = (date: Date, amount: number): Date => {
  const clone = new Date(date);
  clone.setDate(clone.getDate() + amount);
  return clone;
};

// Calcula el lunes de la semana de la fecha dada.
export const startOfWeek = (date: Date): Date => {
  const normalized = startOfDay(date);
  const day = normalized.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(normalized, diff);
};

// Indica si dos fechas caen en el mismo día, ignorando la hora.
export const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

// Capitaliza la primera letra de un string.
export const capitalize = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1);
