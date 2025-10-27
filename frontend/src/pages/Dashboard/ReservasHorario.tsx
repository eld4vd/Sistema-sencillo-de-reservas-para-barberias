import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaCalendarAlt, FaSyncAlt } from "react-icons/fa";
import type { Cita } from "../../models/Cita";
import HorarioEscolar from "../../components/admin/HorarioEscolar";
import { citasService } from "../../services/citasService";
import { getErrorMessage } from "../../services/api";
import {
  DATE_SEARCH_MAX_OFFSET_DAYS,
  toDateInputValue,
  parseDateInput,
  startOfDay,
  addDays,
} from "../../helpers/reservas";

const DashboardReservasHorario = () => {
  const [reservas, setReservas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(() => startOfDay(new Date()));
  const [sortBy, setSortBy] = useState<"fechaHora" | "fechaCreacion">("fechaHora");

  // Refs para evitar múltiples peticiones simultáneas
  const isLoadingRef = useRef(false);
  const lastLoadTimeRef = useRef(0);

  const loadReservas = useCallback(
    async (options?: { initial?: boolean; force?: boolean }) => {
      const initial = options?.initial ?? false;
      const force = options?.force ?? false;
      // Evitar peticiones duplicadas si ya hay una en curso
      if (isLoadingRef.current) {
        return;
      }

      // Throttle: Evitar peticiones si la última fue hace menos de 2 segundos
      const now = Date.now();
      if (!force && now - lastLoadTimeRef.current < 2000) {
        return;
      }

      isLoadingRef.current = true;
      lastLoadTimeRef.current = now;

      try {
        if (initial) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }
        setError(null);
        const response = await citasService.list();
        if (sortBy === "fechaCreacion") {
          const sorted = [...response].sort(
            (a, b) =>
              new Date(b.fechaCreacion).getTime() -
              new Date(a.fechaCreacion).getTime()
          );
          setReservas(sorted);
        } else {
          setReservas(response);
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        if (initial) {
          setLoading(false);
        } else {
          setRefreshing(false);
        }
        isLoadingRef.current = false;
      }
    },
    [sortBy]
  );

  useEffect(() => {
    loadReservas({ initial: true, force: true });
    const intervalId = window.setInterval(() => {
      loadReservas();
    }, 60000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [loadReservas]);

  useEffect(() => {
    loadReservas({ force: true });
  }, [loadReservas, sortBy]);

  const handleManualRefresh = () => {
    loadReservas();
  };

  const dateInputValue = useMemo(
    () => toDateInputValue(selectedDate),
    [selectedDate]
  );

  const dateInputMax = useMemo(
    () => toDateInputValue(addDays(new Date(), DATE_SEARCH_MAX_OFFSET_DAYS)),
    []
  );

  const dateInputMin = useMemo(
    () => toDateInputValue(addDays(new Date(), -DATE_SEARCH_MAX_OFFSET_DAYS)),
    []
  );

  const handleDateInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const parsed = parseDateInput(event.target.value);
      if (parsed) {
        setSelectedDate(startOfDay(new Date(parsed.year, parsed.month, parsed.day)));
      } else {
        setSelectedDate(startOfDay(new Date()));
      }
    },
    []
  );

  const totalReservas = reservas.length;
  const reservasFuturas = useMemo(
    () =>
      reservas.filter((cita) => {
        const timestamp = new Date(cita.fechaHora).getTime();
        return !Number.isNaN(timestamp) && timestamp >= Date.now() && cita.estado !== "Cancelada";
      }).length,
    [reservas]
  );

  const reservasCanceladas = useMemo(
    () => reservas.filter((cita) => cita.estado === "Cancelada").length,
    [reservas]
  );

  return (
    <div className="space-y-6">
      <div className="space-y-5 rounded-3xl border border-[#2A2A2A] bg-[#161616]/85 p-6 shadow-[0_20px_55px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#B8935E]/40 bg-[#B8935E]/10 px-4 py-1 text-xs uppercase tracking-[0.32em] text-[#B8935E]">
              <FaCalendarAlt className="text-[#B8935E]" /> Horario integral de reservas
            </div>
            <h2 className="text-3xl font-bold text-[#FAF8F3]">
              Vista semanal inteligente
            </h2>
            <p className="text-sm text-[#FAF8F3]/65">
              Supervisa la ocupación de todos los barberos en un solo vistazo, navega entre semanas y
              detecta espacios disponibles para acciones proactivas con clientes premium.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex flex-col text-[10px] uppercase tracking-[0.32em] text-[#B8935E]/70">
              Ordenar
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "fechaHora" | "fechaCreacion")}
                className="mt-1 rounded-lg border border-[#2A2A2A] bg-[#0F0F0F] px-3 py-2 text-sm text-[#FAF8F3] focus:border-[#B8935E]/40 focus:outline-none"
              >
                <option value="fechaHora">Por fecha de cita</option>
                <option value="fechaCreacion">Más recientes</option>
              </select>
            </label>
            <button
              type="button"
              onClick={() => setSelectedDate(startOfDay(new Date()))}
              className="rounded-full border border-[#2A2A2A] px-4 py-2 text-xs uppercase tracking-[0.28em] text-[#FAF8F3]/70 transition hover:border-[#B8935E]/40 hover:text-[#B8935E]"
            >
              Ir a hoy
            </button>
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={loading || refreshing}
              className="inline-flex items-center gap-2 rounded-full border border-[#2A2A2A] px-4 py-2 text-xs uppercase tracking-[0.28em] text-[#FAF8F3]/70 transition hover:border-[#B8935E]/40 hover:text-[#B8935E] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FaSyncAlt className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Actualizando…" : "Actualizar"}
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-[#2A2A2A] bg-[#0F0F0F]/80 p-4 text-sm text-[#FAF8F3]/75">
            <p className="text-[10px] uppercase tracking-[0.32em] text-[#B8935E]/70">Reservas registradas</p>
            <p className="mt-2 text-3xl font-semibold text-[#FAF8F3]">
              {totalReservas.toString().padStart(2, "0")}
            </p>
            <p className="mt-2 text-xs text-[#FAF8F3]/45">Histórico disponible para planificación.</p>
          </div>
          <div className="rounded-2xl border border-[#2A2A2A] bg-[#0F0F0F]/80 p-4 text-sm text-[#FAF8F3]/75">
            <p className="text-[10px] uppercase tracking-[0.32em] text-[#B8935E]/70">Próximas</p>
            <p className="mt-2 text-3xl font-semibold text-[#FAF8F3]">
              {reservasFuturas.toString().padStart(2, "0")}
            </p>
            <p className="mt-2 text-xs text-[#FAF8F3]/45">Citas vigentes con posibilidad de concierge activo.</p>
          </div>
          <div className="rounded-2xl border border-[#2A2A2A] bg-[#0F0F0F]/80 p-4 text-sm text-[#FAF8F3]/75">
            <p className="text-[10px] uppercase tracking-[0.32em] text-[#B8935E]/70">Canceladas</p>
            <p className="mt-2 text-3xl font-semibold text-[#FAF8F3]">
              {reservasCanceladas.toString().padStart(2, "0")}
            </p>
            <p className="mt-2 text-xs text-[#FAF8F3]/45">Útiles para liberar espacios estratégicos.</p>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <div className="relative h-[78vh] rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A]/60 p-1">
          <HorarioEscolar
            reservas={reservas}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            dateInputValue={dateInputValue}
            dateInputMin={dateInputMin}
            dateInputMax={dateInputMax}
            onDateInputChange={handleDateInputChange}
          />
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-[#0A0A0A]/70 text-sm text-[#FAF8F3]/60">
              <FaCalendarAlt className="mb-3 animate-pulse text-3xl text-[#B8935E]" />
              Cargando disponibilidad semanal…
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default DashboardReservasHorario;
