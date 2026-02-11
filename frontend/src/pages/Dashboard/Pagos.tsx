import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaWallet,
  FaExclamationTriangle,
  FaChartLine,  
  FaSearch,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
} from "react-icons/fa";
import type { Pago, EstadoPago } from "../../models/Pago";
import type { Cita } from "../../models/Cita";
import { pagosService } from "../../services/pagosService";
import { getErrorMessage } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import {
  currencyFormatter,
  formatDate,
  formatTime,
  formatRelativeTime,
} from "../../helpers/reservas";
import { logger } from "../../helpers/logging";

type EstadoFiltro = EstadoPago | "Todos";
type PeriodoFiltro = "hoy" | "semana" | "mes" | "todo";

interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

interface FiltersState {
  estado: EstadoFiltro;
  periodo: PeriodoFiltro;
  search: string;
}

interface StatsData {
  totalMonto: number;
  completados: number;
  pendientes: number;
  fallidos: number;
  ticketPromedio: number;
}

const PAGE_SIZES = [10, 25, 50, 100];
const DEFAULT_PAGE_SIZE = 25;

const ESTADO_CONFIG: Record<
  EstadoPago,
  { label: string; icon: typeof FaCheckCircle; color: string }
> = {
  Completado: {
    label: "Completado",
    icon: FaCheckCircle,
    color: "text-emerald-400",
  },
  Pendiente: { label: "Pendiente", icon: FaClock, color: "text-amber-400" },
  Fallido: { label: "Fallido", icon: FaTimesCircle, color: "text-red-400" },
};

const isFullCita = (cita: Pago["cita"]): cita is Cita =>
  Boolean(cita) && typeof cita === "object" && "clienteNombre" in cita;

const getClienteInfo = (pago: Pago): { nombre: string; email: string } => {
  if (isFullCita(pago.cita)) {
    return {
      nombre: pago.cita.clienteNombre,
      email: pago.cita.clienteEmail,
    };
  }
  return {
    nombre: `Reserva #${pago.cita?.id ?? pago.id}`,
    email: "—",
  };
};

const getServicioNombre = (pago: Pago): string => {
  if (!isFullCita(pago.cita)) return "—";
  const servicio = pago.cita.servicio;
  if (!servicio || typeof servicio !== "object") return "—";
  if ("nombre" in servicio && typeof servicio.nombre === "string") {
    return servicio.nombre;
  }
  return `Servicio #${servicio.id}`;
};

// Funciones helper eliminadas - ahora la lógica está en el backend

const PagosDashboard = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<FiltersState>({
    estado: "Todos",
    periodo: "todo", // Cambiar a "todo" para mostrar todos los pagos por defecto
    search: "",
  });

  // Debounce de la búsqueda para evitar solicitudes en cada pulsación
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(filters.search), 350);
    return () => clearTimeout(id);
  }, [filters.search]);

  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    totalItems: 0,
    totalPages: 0,
  });

  const [stats, setStats] = useState<StatsData>({
    totalMonto: 0,
    completados: 0,
    pendientes: 0,
    fallidos: 0,
    ticketPromedio: 0,
  });

  const [selectedPago, setSelectedPago] = useState<Pago | null>(null);

  // Efecto para cargar datos cuando cambian los filtros o paginación
  useEffect(() => {
    // No cargar si aún está autenticando o no está autenticado
    if (authLoading || !isAuthenticated) return;

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await pagosService.list({
          page: pagination.currentPage,
          limit: pagination.pageSize,
          search: debouncedSearch || undefined,
          estado: filters.estado !== "Todos" ? filters.estado : undefined,
          periodo: filters.periodo,
        });

        logger.debug("[Pagos] respuesta backend", response);

        setPagos(response.data);
        setPagination((prev) => ({
          ...prev,
          totalItems: response.meta.total,
          totalPages: response.meta.totalPages,
        }));
        setStats(response.stats);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [
    authLoading,
    isAuthenticated,
    pagination.currentPage,
    pagination.pageSize,
    filters.estado,
    filters.periodo,
    debouncedSearch,
  ]);

  const handleFilterChange = useCallback(
    <K extends keyof FiltersState>(key: K, value: FiltersState[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
    },
    []
  );

  const handlePageChange = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPagination((prev) => ({
      ...prev,
      pageSize: size,
      currentPage: 1,
    }));
  }, []);

  const handleViewDetail = useCallback((pago: Pago) => {
    setSelectedPago(pago);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedPago(null);
  }, []);

  if (authLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <p className="text-sm uppercase tracking-[0.28em] text-gray-700">
            Inicializando sesión…
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.28em] text-gray-700">
            Sesión no válida. Por favor, inicia sesión nuevamente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Gestión de Pagos
            </h2>
            <p className="mt-1 text-sm text-gray-700">
              Monitorea transacciones, concilia pagos y gestiona el flujo de
              caja
            </p>
          </div>
        </div>

        {error ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-red-500/40 bg-red-500/10 px-5 py-4 text-sm text-red-200"
          >
            {error}
          </motion.div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.28em] text-gray-600">
                Ingresos Totales
              </span>
              <FaWallet aria-hidden="true" className="text-blue-600" />
            </div>
            <p className="mt-3 text-3xl font-semibold tabular-nums text-gray-900">
              {currencyFormatter.format(stats.totalMonto)}
            </p>
            <p className="mt-2 text-xs text-gray-600">
              {stats.completados} pagos completados
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.28em] text-gray-600">
                Ticket Promedio
              </span>
              <FaChartLine aria-hidden="true" className="text-emerald-400" />
            </div>
            <p className="mt-3 text-3xl font-semibold tabular-nums text-gray-900">
              {currencyFormatter.format(stats.ticketPromedio)}
            </p>
            <p className="mt-2 text-xs text-gray-600">
              Por transacción exitosa
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.28em] text-gray-600">
                Pendientes
              </span>
              <FaClock aria-hidden="true" className="text-amber-400" />
            </div>
            <p className="mt-3 text-3xl font-semibold tabular-nums text-gray-900">
              {stats.pendientes.toString().padStart(2, "0")}
            </p>
            <p className="mt-2 text-xs text-gray-600">Por confirmar</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.28em] text-gray-600">
                Alertas
              </span>
              <FaExclamationTriangle aria-hidden="true" className="text-red-400" />
            </div>
            <p className="mt-3 text-3xl font-semibold tabular-nums text-gray-900">
              {stats.fallidos.toString().padStart(2, "0")}
            </p>
            <p className="mt-2 text-xs text-gray-600">Pagos fallidos</p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-gray-700">
              <FaFilter aria-hidden="true" />
              <span>Filtros activos</span>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative">
                <FaSearch aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-600" />
                <input
                  type="search"
                  aria-label="Buscar pagos"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  placeholder="Buscar por cliente, ID, transacción…"
                  className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-4 text-sm text-gray-900 placeholder:text-gray-600 focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 sm:w-64"
                />
              </div>

              <select
                aria-label="Filtrar por período"
                value={filters.periodo}
                onChange={(e) =>
                  handleFilterChange("periodo", e.target.value as PeriodoFiltro)
                }
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
              >
                <option value="hoy">Hoy</option>
                <option value="semana">Última semana</option>
                <option value="mes">Último mes</option>
                <option value="todo">Todo</option>
              </select>

              <select
                aria-label="Filtrar por estado"
                value={filters.estado}
                onChange={(e) =>
                  handleFilterChange("estado", e.target.value as EstadoFiltro)
                }
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
              >
                <option value="Todos">Todos los estados</option>
                <option value="Completado">Completados</option>
                <option value="Pendiente">Pendientes</option>
                <option value="Fallido">Fallidos</option>
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Mostrando{" "}
              <span className="font-semibold tabular-nums text-gray-900">
                {pagos.length}
              </span>{" "}
              de{" "}
              <span className="font-semibold tabular-nums text-gray-900">
                {pagination.totalItems}
              </span>{" "}
              registros
            </p>
            <select
              aria-label="Registros por página"
              value={pagination.pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size} por página
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200 text-left text-[10px] uppercase tracking-[0.24em] text-gray-600">
                  <th className="pb-3 font-medium">ID</th>
                  <th className="pb-3 font-medium">Cliente</th>
                  <th className="pb-3 font-medium">Servicio</th>
                  <th className="pb-3 font-medium">Monto</th>
                  <th className="pb-3 font-medium">Método</th>
                  <th className="pb-3 font-medium">Estado</th>
                  <th className="pb-3 font-medium">Fecha</th>
                  <th className="pb-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#151515]">
                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-12 text-center text-sm text-gray-600"
                    >
                      Cargando pagos…
                    </td>
                  </tr>
                ) : pagos.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-12 text-center text-sm text-gray-600"
                    >
                      No se encontraron pagos con los filtros aplicados
                    </td>
                  </tr>
                ) : (
                  pagos.map((pago) => {
                    const cliente = getClienteInfo(pago);
                    const servicio = getServicioNombre(pago);
                    const fecha = pago.fechaPago ?? pago.fechaCreacion;
                    const estadoConfig = ESTADO_CONFIG[pago.estado];
                    const Icon = estadoConfig.icon;

                    return (
                      <tr key={pago.id} className="group hover:bg-gray-50">
                        <td className="py-4 text-sm tabular-nums text-gray-700">
                          #{pago.id.toString().padStart(4, "0")}
                        </td>
                        <td className="py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">
                              {cliente.nombre}
                            </span>
                            <span className="text-xs text-gray-600">
                              {cliente.email}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 text-sm text-gray-600">
                          {servicio}
                        </td>
                        <td className="py-4">
                          <span className="text-base font-semibold tabular-nums text-gray-900">
                            {currencyFormatter.format(pago.monto)}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs uppercase tracking-wider text-gray-600">
                            {pago.metodoPago ?? "N/A"}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <Icon aria-hidden="true" className={`text-sm ${estadoConfig.color}`} />
                            <span className={`text-sm ${estadoConfig.color}`}>
                              {estadoConfig.label}
                            </span>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex flex-col text-xs text-gray-700">
                            <span>{formatDate(fecha)}</span>
                            <span className="text-gray-600">
                              {formatTime(fecha)}
                            </span>
                          </div>
                        </td>
                        <td className="py-4">
                          <button
                            type="button"
                            onClick={() => handleViewDetail(pago)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 transition hover:border-blue-500 hover:text-blue-600"
                          >
                            <FaEye aria-hidden="true" />
                            Ver
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 ? (
            <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
              <button
                type="button"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 transition hover:border-blue-500 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-600"
              >
                <FaChevronLeft aria-hidden="true" />
                Anterior
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .flatMap((page, _i, allPages) => {
                    const current = pagination.currentPage;
                    if (
                      page !== 1 &&
                      page !== pagination.totalPages &&
                      (page < current - 1 || page > current + 1)
                    ) return [];

                    const prevVisible = allPages.slice(0, allPages.indexOf(page)).reverse()
                      .find(p => p === 1 || p === pagination.totalPages || (p >= current - 1 && p <= current + 1));
                    const showEllipsis = prevVisible !== undefined && page - prevVisible > 1;

                    return [
                      <div key={page} className="flex items-center gap-2">
                        {showEllipsis ? (
                          <span className="text-gray-900/30">…</span>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => handlePageChange(page)}
                          className={`h-9 w-9 rounded-lg border text-sm tabular-nums transition ${
                            page === pagination.currentPage
                              ? "border-blue-500 bg-blue-50 text-blue-600"
                              : "border-gray-200 bg-white text-gray-600 hover:border-blue-500 hover:text-blue-600"
                          }`}
                        >
                          {page}
                        </button>
                      </div>,
                    ];
                  })}
              </div>

              <button
                type="button"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 transition hover:border-blue-500 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-600"
              >
                Siguiente
                <FaChevronRight aria-hidden="true" />
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <AnimatePresence>
        {selectedPago ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={handleCloseDetail}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="pagos-detail-title"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl overflow-y-auto overscroll-contain rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl"
            >
              <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
                <h3 id="pagos-detail-title" className="text-2xl font-semibold tabular-nums text-gray-900">
                  Detalle del Pago #
                  {selectedPago.id.toString().padStart(4, "0")}
                </h3>
                <button
                  type="button"
                  aria-label="Cerrar detalle"
                  onClick={handleCloseDetail}
                  className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                >
                  ✕
                </button>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="mb-1 text-xs uppercase tracking-[0.24em] text-gray-600">
                    Cliente
                  </p>
                  <p className="text-base font-medium text-gray-900">
                    {getClienteInfo(selectedPago).nombre}
                  </p>
                  <p className="text-sm text-gray-700">
                    {getClienteInfo(selectedPago).email}
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-xs uppercase tracking-[0.24em] text-gray-600">
                    Servicio
                  </p>
                  <p className="text-base font-medium text-gray-900">
                    {getServicioNombre(selectedPago)}
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-xs uppercase tracking-[0.24em] text-gray-600">
                    Monto
                  </p>
                  <p className="text-2xl font-semibold tabular-nums text-gray-900">
                    {currencyFormatter.format(selectedPago.monto)}
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-xs uppercase tracking-[0.24em] text-gray-600">
                    Método de Pago
                  </p>
                  <p className="text-base text-gray-900">
                    {selectedPago.metodoPago ?? "No especificado"}
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-xs uppercase tracking-[0.24em] text-gray-600">
                    Estado
                  </p>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const DetailIcon = ESTADO_CONFIG[selectedPago.estado].icon;
                      return (
                        <DetailIcon
                          aria-hidden="true"
                          className={`text-lg ${ESTADO_CONFIG[selectedPago.estado].color}`}
                        />
                      );
                    })()}
                    <span
                      className={`text-base ${ESTADO_CONFIG[selectedPago.estado].color}`}
                    >
                      {ESTADO_CONFIG[selectedPago.estado].label}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="mb-1 text-xs uppercase tracking-[0.24em] text-gray-600">
                    ID de Transacción
                  </p>
                  <p className="text-base font-mono text-gray-900">
                    {selectedPago.transaccionId ?? "N/A"}
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-xs uppercase tracking-[0.24em] text-gray-600">
                    Fecha de Pago
                  </p>
                  <p className="text-base text-gray-900">
                    {selectedPago.fechaPago
                      ? `${formatDate(selectedPago.fechaPago)} ${formatTime(
                          selectedPago.fechaPago
                        )}`
                      : "Pendiente"}
                  </p>
                  {selectedPago.fechaPago ? (
                    <p className="text-xs text-blue-600">
                      {formatRelativeTime(selectedPago.fechaPago)}
                    </p>
                  ) : null}
                </div>

                <div>
                  <p className="mb-1 text-xs uppercase tracking-[0.24em] text-gray-600">
                    Fecha de Creación
                  </p>
                  <p className="text-base text-gray-900">
                    {formatDate(selectedPago.fechaCreacion)}{" "}
                    {formatTime(selectedPago.fechaCreacion)}
                  </p>
                  <p className="text-xs text-gray-600">
                    {formatRelativeTime(selectedPago.fechaCreacion)}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
};

export default PagosDashboard;
