// FORMATTERS - Formateo de fechas, tiempo y moneda para reservas.
// Centraliza los Intl formatter usados en dashboard y helpers (es-ES/es-BO).

// Formateador para fechas cortas: "lun 06 ene".
export const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  weekday: "short",
  day: "2-digit",
  month: "short",
});

// Formateador para horas: "14:30".
export const timeFormatter = new Intl.DateTimeFormat("es-ES", {
  hour: "2-digit",
  minute: "2-digit",
});

// Formateador para fecha completa con hora: "lunes 06 enero 14:30".
export const fullDateFormatter = new Intl.DateTimeFormat("es-ES", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

// Formateador de moneda boliviana: "Bs 150.00".
export const currencyFormatter = new Intl.NumberFormat("es-BO", {
  style: "currency",
  currency: "BOB",
  maximumFractionDigits: 2,
});

// Formateador completo con año: "lunes 06 enero 2025".
export const fullDateWithYearFormatter = new Intl.DateTimeFormat("es-ES", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
});

// Formateador para rangos semanales: "06 ene".
export const weekRangeFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
});

// Formateador para nombre de día de la semana: "lun".
export const weekDayFormatter = new Intl.DateTimeFormat("es-ES", {
  weekday: "short",
});

// Formateador para número de día: "06".
export const dayNumberFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
});

// Formatea una fecha ISO a formato corto en español.
export const formatDate = (iso: string): string => {
  try {
    return dateFormatter.format(new Date(iso));
  } catch {
    return iso;
  }
};

// Devuelve solo la hora formateada desde una fecha ISO.
export const formatTime = (iso: string): string => {
  try {
    return timeFormatter.format(new Date(iso));
  } catch {
    return "";
  }
};

// Formatea una fecha ISO a valor completo con día, fecha y hora.
export const formatFullDate = (iso: string): string => {
  try {
    return fullDateFormatter.format(new Date(iso));
  } catch {
    return iso;
  }
};

// Calcula el tiempo relativo usando minutos, horas o días.
export const formatRelativeTime = (iso: string): string => {
  const targetMs = new Date(iso).getTime();
  if (Number.isNaN(targetMs)) return "";
  const diffMinutes = Math.round((targetMs - Date.now()) / 60000);

  if (diffMinutes === 0) return "Ahora";

  const absoluteMinutes = Math.abs(diffMinutes);
  if (absoluteMinutes < 60) {
    return diffMinutes > 0 ? `En ${absoluteMinutes} min` : `Hace ${absoluteMinutes} min`;
  }

  const diffHours = Math.round(absoluteMinutes / 60);
  if (diffHours < 48) {
    return diffMinutes > 0 ? `En ${diffHours} h` : `Hace ${diffHours} h`;
  }

  const diffDays = Math.round(diffHours / 24);
  return diffMinutes > 0 ? `En ${diffDays} d` : `Hace ${diffDays} d`;
};
