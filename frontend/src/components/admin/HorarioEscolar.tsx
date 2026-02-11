import { useMemo } from "react";
import { FaClock, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import type { Cita } from "../../models/Cita";
import {
  timeFormatter,
  currencyFormatter,
  weekDayFormatter,
  dayNumberFormatter,
  toDateInputValue,
  startOfDay,
  addDays,
  isSameDay,
  capitalize,
  getServicioNombre,
  getPeluqueroNombre,
  getServicioPrecio,
  getServicioDuracion,
  computeCitaEndDate,
  statusMeta,
} from "../../helpers/reservas";

interface HorarioEscolarProps {
  reservas: Cita[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  dateInputValue: string;
  dateInputMin: string;
  dateInputMax: string;
  onDateInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const HorarioEscolar: React.FC<HorarioEscolarProps> = ({
  reservas,
  selectedDate,
  onDateChange,
  dateInputValue,
  dateInputMin,
  dateInputMax,
  onDateInputChange,
}) => {
  const today = useMemo(() => startOfDay(new Date()), []);

  const weekStartDate = useMemo(() => {
    const day = selectedDate.getDay();
    const diff = day === 0 ? -6 : 1 - day; // Lunes = 0
    return startOfDay(addDays(selectedDate, diff));
  }, [selectedDate]);

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(weekStartDate, index)),
    [weekStartDate]
  );

  const weekEndDate = useMemo(() => addDays(weekStartDate, 7), [weekStartDate]);

  const weeklyReservas = useMemo(() => {
    const startTime = weekStartDate.getTime();
    const endTime = weekEndDate.getTime();
    return reservas.filter((cita) => {
      const citaTime = new Date(cita.fechaHora).getTime();
      return citaTime >= startTime && citaTime < endTime;
    });
  }, [reservas, weekEndDate, weekStartDate]);

  const weekRangeLabel = useMemo(() => {
    if (weekDays.length === 0) return "";
    const first = weekDays[0];
    const last = weekDays[weekDays.length - 1];
    const fmt = new Intl.DateTimeFormat("es", { day: "numeric", month: "short" });
    return `${capitalize(fmt.format(first))} – ${capitalize(fmt.format(last))}`;
  }, [weekDays]);

  const reservasPorDiaHora = useMemo(() => {
    const map = new Map<string, Cita[]>();

    weeklyReservas.forEach((cita) => {
      const inicio = new Date(cita.fechaHora);
      const dayKey = toDateInputValue(startOfDay(inicio));
      const hourKey = inicio.getHours();
      const mapKey = `${dayKey}-${hourKey}`;
      const list = map.get(mapKey);
      if (list) {
        list.push(cita);
      } else {
        map.set(mapKey, [cita]);
      }
    });

    map.forEach((lista) =>
      lista.sort(
        (a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime()
      )
    );

    return map;
  }, [weeklyReservas]);

  const scheduleHours = useMemo(
    () => Array.from({ length: 13 }, (_, index) => 8 + index), // 8:00 - 20:00
    []
  );

  return (
    <div className="flex h-full flex-col overflow-hidden text-xs">
      <header className="shrink-0 rounded-b-3xl border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm">
        <div className="flex flex-col items-center gap-3 md:flex-row md:justify-between">
          <div className="text-center md:text-left">
            <p className="text-[10px] uppercase tracking-[0.32em] text-blue-600">
              Horario semanal
            </p>
            <h3 className="text-xl font-semibold text-gray-900">
              {weekRangeLabel}
            </h3>
            <p className="text-[11px] text-gray-500">Lunes a domingo • 8:00 – 20:00</p>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => onDateChange(addDays(selectedDate, -7))}
              className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-3 py-1.5 text-[10px] uppercase tracking-[0.24em] text-gray-700 transition hover:border-blue-500 hover:text-blue-600"
              title="Semana anterior"
            >
              <FaChevronLeft /> Semana
            </button>
            <button
              type="button"
              onClick={() => onDateChange(startOfDay(new Date()))}
              className="rounded-full border border-blue-300 bg-blue-50 px-3 py-1.5 text-[10px] uppercase tracking-[0.24em] text-blue-600 transition hover:border-blue-500 hover:bg-blue-100"
            >
              Ir a hoy
            </button>
            <button
              type="button"
              onClick={() => onDateChange(addDays(selectedDate, 7))}
              className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-3 py-1.5 text-[10px] uppercase tracking-[0.24em] text-gray-700 transition hover:border-blue-500 hover:text-blue-600"
              title="Semana siguiente"
            >
              Semana <FaChevronRight />
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-col items-center gap-2 md:flex-row md:justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onDateChange(addDays(selectedDate, -1))}
              className="rounded-full border border-gray-300 p-2 text-gray-600 transition hover:border-blue-500 hover:text-blue-600"
              title="Día anterior"
            >
              <FaChevronLeft />
            </button>

                <input
                  type="date"
                  value={dateInputValue}
                  min={dateInputMin}
                  max={dateInputMax}
                  onChange={onDateInputChange}
                  className="w-36 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-[11px] text-gray-900 focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
                />

            <button
              type="button"
              onClick={() => onDateChange(addDays(selectedDate, 1))}
              className="rounded-full border border-gray-300 p-2 text-gray-600 transition hover:border-blue-500 hover:text-blue-600"
              title="Día siguiente"
            >
              <FaChevronRight />
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-2 text-[10px] uppercase tracking-[0.24em] text-gray-600">
                <span className="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-blue-600">
              {weeklyReservas.length.toString().padStart(2, "0")} citas en la semana
            </span>
                <span className="rounded-full border border-gray-300 bg-gray-100 px-3 py-1">
              Vista optimizada por barbero/servicio
            </span>
          </div>
        </div>

            <div className="mt-2 flex justify-center gap-3 text-[9px] text-gray-600">
          <span className="inline-flex items-center gap-1">
            <span className="h-3 w-3 rounded border border-emerald-400/50 bg-emerald-500/20" /> Pagada
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-3 w-3 rounded border border-sky-400/50 bg-sky-500/20" /> Completada
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-3 w-3 rounded border border-red-400/50 bg-red-500/20" /> Cancelada
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-3 w-3 rounded border border-dashed border-gray-300 bg-gray-50" /> Libre
          </span>
        </div>
      </header>

      <div className="mt-3 flex-1 overflow-hidden rounded-2xl border border-gray-300 bg-gray-50">
        <div className="h-full overflow-auto">
          <table className="min-w-full border-collapse text-[11px]">
          <thead>
            <tr className="border-b border-gray-300 bg-gray-100">
              <th className="sticky left-0 z-20 border-r border-gray-300 bg-gray-100 px-3 py-3 text-left text-[10px] uppercase tracking-[0.28em] text-blue-600">
                <FaClock className="mx-auto text-sm" />
              </th>
              {weekDays.map((day) => {
                const key = toDateInputValue(day);
                const isToday = isSameDay(day, today);

                return (
                  <th
                    key={key}
                    className={`min-w-[110px] border-r border-gray-300 px-2 py-2 text-center ${
                      isToday ? "bg-blue-50" : "bg-gray-100"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <p
                        className={`text-[11px] font-semibold uppercase tracking-wider ${
                          isToday ? "text-blue-600" : "text-gray-700"
                        }`}
                      >
                        {capitalize(weekDayFormatter.format(day))} - {dayNumberFormatter.format(day)}
                      </p>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {scheduleHours.map((hour) => {
              const slotTime = `${hour.toString().padStart(2, "0")}:00`;

              return (
                <tr
                  key={hour}
                  className="border-b border-gray-300"
                >
                  {/* Columna de hora */}
                  <td className="sticky left-0 z-10 border-r border-gray-300 bg-gray-100 px-3 py-3 text-center">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-600">{slotTime}</span>
                  </td>

                  {/* Columnas de días */}
                  {weekDays.map((day) => {
                    const dayKey = toDateInputValue(startOfDay(day));
                    const key = `${dayKey}-${hour}`;
                    const citasEnSlot = reservasPorDiaHora.get(key) ?? [];
                    const isToday = isSameDay(day, today);

                    return (
                      <td
                        key={key}
                        className={`relative border-r border-gray-300 p-1.5 align-top ${
                          isToday ? "bg-blue-50/50" : ""
                        }`}
                      >
                        {citasEnSlot.length === 0 ? (
                          <div className="flex h-12 items-center justify-center text-[9px] uppercase tracking-wider text-gray-400">
                            —
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {citasEnSlot.map((cita) => {
                              const meta = statusMeta[cita.estado];
                              const StatusIcon = meta.Icon;
                              const citaStart = new Date(cita.fechaHora);
                              const citaEnd = computeCitaEndDate(cita);

                              // Colores según estado - TEMA CLARO
                              let borderColor = "border-blue-300";
                              let bgColor = "bg-blue-50";

                              if (cita.estado === "Completada") {
                                borderColor = "border-sky-300";
                                bgColor = "bg-sky-50";
                              } else if (cita.estado === "Cancelada") {
                                borderColor = "border-red-300";
                                bgColor = "bg-red-50";
                              } else if (cita.estado === "Pagada") {
                                borderColor = "border-emerald-300";
                                bgColor = "bg-emerald-50";
                              }

                              return (
                                <div
                                  key={cita.id}
                                  className={`group relative cursor-pointer rounded border ${borderColor} ${bgColor} px-2 py-1.5`}
                                  title={`${cita.clienteNombre} - ${getServicioNombre(
                                    cita.servicio
                                  )} - ${getPeluqueroNombre(cita.peluquero)}`}
                                >
                                  {/* Solo nombre del barbero */}
                                  <p className="truncate text-[11px] font-medium text-gray-900">
                                    {getPeluqueroNombre(cita.peluquero)}
                                  </p>

                                  {/* Hover tooltip con toda la info */}
                                  <div className="absolute left-0 top-full z-30 mt-1 hidden w-64 rounded-lg border border-gray-300 bg-white p-3 shadow-xl group-hover:block">
                                    <div className="space-y-2 text-xs">
                                      <div>
                                        <p className="text-[10px] uppercase tracking-wider text-blue-600">
                                          Cliente
                                        </p>
                                        <p className="mt-1 font-semibold text-gray-900">
                                          {cita.clienteNombre}
                                        </p>
                                        <p className="text-[10px] text-gray-600">
                                          {cita.clienteEmail}
                                        </p>
                                        {cita.clienteTelefono && (
                                          <p className="text-[10px] text-gray-600">
                                            📞 {cita.clienteTelefono}
                                          </p>
                                        )}
                                      </div>
                                      <div className="border-t border-gray-200 pt-2">
                                        <p className="text-[10px] uppercase tracking-wider text-blue-600">
                                          Servicio
                                        </p>
                                        <p className="mt-1 text-gray-900">
                                          {getServicioNombre(cita.servicio)}
                                        </p>
                                        {(() => {
                                          const precio = getServicioPrecio(
                                            cita.servicio
                                          );
                                          const duracion = getServicioDuracion(
                                            cita.servicio
                                          );
                                          return (
                                            <p className="text-[10px] text-gray-600">
                                              {precio &&
                                                currencyFormatter.format(precio)}
                                              {precio && duracion && " • "}
                                              {duracion && `${duracion} min`}
                                            </p>
                                          );
                                        })()}
                                      </div>
                                      <div className="border-t border-gray-200 pt-2">
                                        <p className="text-[10px] uppercase tracking-wider text-blue-600">
                                          Barbero
                                        </p>
                                        <p className="mt-1 text-gray-900">
                                          {getPeluqueroNombre(cita.peluquero)}
                                        </p>
                                      </div>
                                      <div className="border-t border-gray-200 pt-2">
                                        <p className="text-[10px] uppercase tracking-wider text-blue-600">
                                          Horario
                                        </p>
                                        <p className="mt-1 text-gray-900">
                                          {timeFormatter.format(citaStart)} – {timeFormatter.format(citaEnd)}
                                        </p>
                                      </div>
                                      <div className="border-t border-gray-200 pt-2">
                                        <p className="text-[10px] uppercase tracking-wider text-blue-600">
                                          Estado
                                        </p>
                                        <span
                                          className={`mt-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] uppercase ${meta.classes}`}
                                        >
                                          <StatusIcon />
                                          {cita.estado}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

export default HorarioEscolar;
