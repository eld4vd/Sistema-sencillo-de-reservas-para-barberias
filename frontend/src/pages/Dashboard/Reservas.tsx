import {
  Suspense,
  lazy,
  type ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion } from "framer-motion";
import { jsPDF } from "jspdf";
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaEye,
  FaFileInvoiceDollar,
  FaRegCalendarCheck,
  FaSearch,
  FaSyncAlt,
  FaTimesCircle,
  FaUser,
} from "react-icons/fa";
import type { Cita } from "../../models/Cita";
import { Link } from "react-router-dom";
import { citasService } from "../../services/citasService";
import { fetchCsrfToken, getErrorMessage } from "../../services/api";
import AdminModal from "../../components/admin/ui/AdminModal";
import { useCitasNotifications } from "../../hooks/useCitasNotifications";
import {
  // Formatters
  fullDateFormatter,
  currencyFormatter,
  formatDate,
  formatTime,
  formatFullDate,
  formatRelativeTime,
  addDays,
  startOfDay,
  toDateInputValue,
  // Cita utils
  isFullPago,
  getPeluqueroNombre,
  getServicioNombre,
  getServicioPrecio,
  getServicioDuracion,
  buildInvoiceNumber,
  generateInvoiceText,
  // Types
  type DetailErrors,
  type EstadoGestionable,
  type CopyStatus,
  statusMeta,
} from "../../helpers/reservas";

const LazyHorarioEscolar = lazy(() =>
  import("../../components/admin/HorarioEscolar")
);

// Filtro simplificado: solo mostramos las citas activas (Pagada)
// Las completadas y canceladas tienen su propia página dedicada

const ReservasDashboard = () => {
  const [reservas, setReservas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Cita | null>(null);
  const [statusDraft, setStatusDraft] = useState<EstadoGestionable>("Pagada");
  const [notesDraft, setNotesDraft] = useState("");
  const [detailErrors, setDetailErrors] = useState<DetailErrors>({});
  const [detailMutation, setDetailMutation] = useState<"idle" | "loading">(
    "idle"
  );
  const [flashMessage, setFlashMessage] = useState<string | null>(null);
  const [invoiceTarget, setInvoiceTarget] = useState<Cita | null>(null);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);
  const [invoiceMutation, setInvoiceMutation] = useState<"idle" | "loading">(
    "idle"
  );
  const [invoiceCopyStatus, setInvoiceCopyStatus] =
    useState<CopyStatus>("idle");
  const [invoicePdfStatus, setInvoicePdfStatus] = useState<
    "idle" | "generating" | "success" | "error"
  >("idle");
  const [invoiceGenerated, setInvoiceGenerated] = useState(false);
  const copyResetTimeout = useRef<number | null>(null);
  const [quickUpdateId, setQuickUpdateId] = useState<number | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Cita | null>(null);
  const [cancelMutation, setCancelMutation] = useState<"idle" | "loading">(
    "idle"
  );
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [scheduleSelectedDate, setScheduleSelectedDate] = useState(() =>
    startOfDay(new Date())
  );

  const scheduleDateInputValue = useMemo(
    () => toDateInputValue(scheduleSelectedDate),
    [scheduleSelectedDate]
  );

  const scheduleDateMin = useMemo(
    () => toDateInputValue(startOfDay(addDays(new Date(), -90))),
    []
  );

  const scheduleDateMax = useMemo(
    () => toDateInputValue(startOfDay(addDays(new Date(), 180))),
    []
  );

  const { scheduleWeekStart, scheduleWeekEnd } = useMemo(() => {
    const day = scheduleSelectedDate.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const start = startOfDay(addDays(scheduleSelectedDate, diff));
    const end = addDays(start, 7);
    return { scheduleWeekStart: start, scheduleWeekEnd: end };
  }, [scheduleSelectedDate]);

  // Ref para evitar múltiples peticiones simultáneas
  const isLoadingRef = useRef(false);
  const lastLoadTimeRef = useRef(0);
  const hasLoadedRef = useRef(false);

  // Hook para detectar nuevas citas y mostrar notificaciones
  useCitasNotifications(reservas);

  const loadData = useCallback(async (options?: { force?: boolean }) => {
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
    if (!hasLoadedRef.current) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    setError(null);
    
    try {
      const response = await citasService.list();
      setReservas(response);
      hasLoadedRef.current = true;
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
      isLoadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    loadData({ force: true });

    // Polling inteligente: actualiza cada 30 segundos solo si la página está visible
    const intervalId = setInterval(() => {
      if (document.visibilityState === "visible") {
        loadData();
      }
    }, 30000); // 30 segundos

    // Listener para actualizar cuando el usuario regresa a la pestaña
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Esperar 500ms antes de cargar para evitar duplicados con el interval
        setTimeout(() => {
          loadData();
        }, 500);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadData]);


  useEffect(() => {
    if (!selected) return;
    setStatusDraft(selected.estado === "Completada" ? "Completada" : "Pagada");
    setNotesDraft(selected.notas ?? "");
    setDetailErrors({});
  }, [selected]);

  useEffect(() => {
    if (!flashMessage) return;
    const timeout = window.setTimeout(() => setFlashMessage(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [flashMessage]);

  useEffect(
    () => () => {
      if (copyResetTimeout.current) {
        window.clearTimeout(copyResetTimeout.current);
      }
    },
    []
  );

  const handleScheduleClose = useCallback(() => {
    setIsScheduleOpen(false);
  }, []);

  const handleScheduleDateChange = useCallback(
    (date: Date) => {
      const normalized = startOfDay(date);
      if (normalized.getTime() === scheduleSelectedDate.getTime()) return;
      setScheduleSelectedDate(normalized);
    },
    [scheduleSelectedDate]
  );

  const handleScheduleDateInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      if (!value) return;
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) return;
      const normalized = startOfDay(parsed);
      if (normalized.getTime() === scheduleSelectedDate.getTime()) return;
      setScheduleSelectedDate(normalized);
    },
    [scheduleSelectedDate]
  );

  const scheduleReservas = useMemo(() => {
    if (!isScheduleOpen) return [] as Cita[];
    return reservas.filter((cita) => {
      const citaDate = new Date(cita.fechaHora);
      return (
        citaDate >= scheduleWeekStart &&
        citaDate < scheduleWeekEnd
      );
    });
  }, [isScheduleOpen, reservas, scheduleWeekEnd, scheduleWeekStart]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const matchesTerm = (value: string | null | undefined) => {
      if (!term) return true;
      if (!value) return false;
      return value.toLowerCase().includes(term);
    };

    // Solo mostramos citas activas (Pagada), excluyendo completadas y canceladas
    const filteredByEstado = reservas.filter((cita) => {
      return cita.estado === "Pagada";
    });

    return filteredByEstado.filter(
      (cita) =>
        matchesTerm(cita.clienteNombre) ||
        matchesTerm(cita.clienteEmail) ||
        matchesTerm(cita.clienteTelefono ?? undefined) ||
        matchesTerm(getPeluqueroNombre(cita.peluquero)) ||
        matchesTerm(getServicioNombre(cita.servicio))
    );
  }, [reservas, search]);

  const filteredSorted = useMemo(() => {
    const now = Date.now();
    return [...filtered].sort((a, b) => {
      const aTime = new Date(a.fechaHora).getTime();
      const bTime = new Date(b.fechaHora).getTime();
      const aValid = !Number.isNaN(aTime);
      const bValid = !Number.isNaN(bTime);

      if (!aValid && !bValid) return 0;
      if (!aValid) return 1;
      if (!bValid) return -1;

      const aUpcoming = aTime >= now;
      const bUpcoming = bTime >= now;

      if (aUpcoming && !bUpcoming) return -1;
      if (!aUpcoming && bUpcoming) return 1;

      if (aUpcoming && bUpcoming) {
        return aTime - bTime;
      }

      // Both are past; show the most recent past first
      return bTime - aTime;
    });
  }, [filtered]);

  const totalReservas = reservas.length;
  const reservasPagadas = reservas.filter(
    (item) => item.estado === "Pagada"
  ).length;
  const reservasCompletadas = reservas.filter(
    (item) => item.estado === "Completada"
  ).length;
  const reservasCanceladas = reservas.filter(
    (item) => item.estado === "Cancelada"
  ).length;
  const proximasReservas = reservas.filter((item) => {
    const timestamp = new Date(item.fechaHora).getTime();
    return (
      !Number.isNaN(timestamp) &&
      timestamp >= Date.now() &&
      item.estado !== "Cancelada"
    );
  }).length;

  const projectedRevenue = reservas.reduce((acc, cita) => {
    const price = getServicioPrecio(cita.servicio);
    if (!price) return acc;
    if (cita.estado === "Cancelada") return acc;
    return acc + price;
  }, 0);

  const nextReservation = useMemo(() => {
    const upcoming = reservas
      .filter((item) => {
        const timestamp = new Date(item.fechaHora).getTime();
        return (
          !Number.isNaN(timestamp) &&
          timestamp >= Date.now() &&
          item.estado !== "Cancelada"
        );
      })
      .sort(
        (a, b) =>
          new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime()
      );
    return upcoming[0] ?? null;
  }, [reservas]);

  const invoiceIssuedAt = useMemo(
    () => (invoiceTarget ? new Date() : null),
    [invoiceTarget]
  );
  const invoiceNumber = useMemo(() => {
    if (!invoiceTarget || !invoiceIssuedAt) return "";
    return buildInvoiceNumber(invoiceTarget.id, invoiceIssuedAt);
  }, [invoiceTarget, invoiceIssuedAt]);
  const invoiceTotal = useMemo(() => {
    if (!invoiceTarget) return 0;
    return getServicioPrecio(invoiceTarget.servicio) ?? 0;
  }, [invoiceTarget]);
  const invoicePaymentDetails = useMemo(() => {
    if (!invoiceTarget) {
      return {
        metodo: "QR inmediato",
        referencia: "—",
        estado: "Confirmado",
        fecha: null as string | null,
      };
    }

    if (!invoiceTarget.pago) {
      return {
        metodo: "QR inmediato",
        referencia: "—",
        estado: "Confirmado",
        fecha: null as string | null,
      };
    }

    if (isFullPago(invoiceTarget.pago)) {
      return {
        metodo: invoiceTarget.pago.metodoPago ?? "QR inmediato",
        referencia: invoiceTarget.pago.transaccionId ?? "—",
        estado:
          invoiceTarget.pago.estado === "Completado"
            ? "Confirmado"
            : invoiceTarget.pago.estado,
        fecha: invoiceTarget.pago.fechaPago,
      };
    }

    return {
      metodo: `Pago #${invoiceTarget.pago.id}`,
      referencia: "—",
      estado: "Registrado",
      fecha: null as string | null,
    };
  }, [invoiceTarget]);

  const closeModal = () => {
    setSelected(null);
    setDetailErrors({});
    setStatusDraft("Pagada");
    setNotesDraft("");
    setDetailMutation("idle");
  };

  const closeInvoiceModal = () => {
    if (copyResetTimeout.current) {
      window.clearTimeout(copyResetTimeout.current);
      copyResetTimeout.current = null;
    }
    setInvoiceTarget(null);
    setInvoiceError(null);
    setInvoiceMutation("idle");
    setInvoiceCopyStatus("idle");
    setInvoicePdfStatus("idle");
    setInvoiceGenerated(false);
  };

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected) return;

    setDetailMutation("loading");
    try {
      const { csrfToken } = await fetchCsrfToken();
      await citasService.update(
        selected.id,
        {
          estado: statusDraft,
          notas: notesDraft.trim() ? notesDraft.trim() : null,
        },
        csrfToken
      );
  await loadData({ force: true });
      setFlashMessage("Reserva actualizada correctamente");
      closeModal();
    } catch (err) {
      setDetailErrors({ general: getErrorMessage(err) });
      setDetailMutation("idle");
    }
  };

  const handleInvoiceFinalize = async () => {
    if (!invoiceTarget) return;
    if (!invoiceGenerated) {
      setInvoiceError("Genera primero la factura en PDF antes de finalizar.");
      return;
    }
    const clienteNombre = invoiceTarget.clienteNombre;
    setInvoiceMutation("loading");
    setInvoiceError(null);
    try {
      const { csrfToken } = await fetchCsrfToken();
      await citasService.update(
        invoiceTarget.id,
        { estado: "Completada" },
        csrfToken
      );
  await loadData({ force: true });
      setFlashMessage(`Factura generada para ${clienteNombre}`);
      closeInvoiceModal();
    } catch (err) {
      setInvoiceError(getErrorMessage(err));
      setInvoiceMutation("idle");
    }
  };

  const openInvoiceModal = (cita: Cita) => {
    const refreshed = reservas.find((item) => item.id === cita.id);
    setInvoiceTarget(refreshed ?? cita);
    setInvoiceError(null);
    setInvoiceMutation("idle");
    setInvoiceCopyStatus("idle");
    setInvoicePdfStatus("idle");
    setInvoiceGenerated(false);
  };

  const handleInvoiceGeneratePdf = () => {
    if (!invoiceTarget || !invoiceIssuedAt) return;
    if (invoicePdfStatus === "generating") return;
    if (typeof window === "undefined") {
      setInvoicePdfStatus("error");
      return;
    }

    setInvoicePdfStatus("generating");

    try {
      const doc = new jsPDF({ unit: "pt" });
      const marginLeft = 48;
      let cursorY = 72;

      doc.setFontSize(22);
      doc.text("Sunsetz Studio", marginLeft, cursorY);
      doc.setFontSize(12);
      cursorY += 20;
      doc.text("Experiencias premium de barbería", marginLeft, cursorY);

      cursorY += 28;
      doc.setFontSize(14);
      doc.text(`Factura ${invoiceNumber}`, marginLeft, cursorY);
      cursorY += 18;
      doc.setFontSize(11);
      doc.text(
        `Emitida: ${fullDateFormatter.format(invoiceIssuedAt)}`,
        marginLeft,
        cursorY
      );

      cursorY += 28;
      const content = generateInvoiceText(
        invoiceTarget,
        invoiceNumber,
        invoiceIssuedAt,
        invoiceTotal
      ).split("\n");
      doc.setFontSize(10);
      content.forEach((line) => {
        cursorY += 14;
        doc.text(line || " ", marginLeft, cursorY);
      });

      cursorY += 28;
      doc.setFontSize(12);
      doc.text(
        `Total: ${currencyFormatter.format(invoiceTotal)}`,
        marginLeft,
        cursorY
      );

      cursorY += 40;
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text(
        "Documento generado automáticamente por el panel Sunsetz Studio",
        marginLeft,
        cursorY
      );

      doc.save(`Factura-${invoiceNumber}.pdf`);

      setInvoicePdfStatus("success");
      setInvoiceGenerated(true);
    } catch (err) {
      console.error("Error al generar la factura PDF", err);
      setInvoicePdfStatus("error");
      setInvoiceGenerated(false);
    }
  };

  const handleQuickComplete = async (cita: Cita) => {
    if (quickUpdateId === cita.id) return;
    setQuickUpdateId(cita.id);
    try {
      const { csrfToken } = await fetchCsrfToken();
      await citasService.update(cita.id, { estado: "Completada" }, csrfToken);
      setReservas((prev) =>
        prev.map((item) =>
          item.id === cita.id ? { ...item, estado: "Completada" } : item
        )
      );
      openInvoiceModal({ ...cita, estado: "Completada" } as Cita);
      setFlashMessage(
        `Reserva de ${cita.clienteNombre} marcada como completada`
      );
    } catch (err) {
      setFlashMessage(getErrorMessage(err));
    } finally {
      setQuickUpdateId(null);
    }
  };

  const openCancelModal = (cita: Cita) => {
    setCancelTarget(cita);
    setCancelMutation("idle");
  };

  const closeCancelModal = () => {
    setCancelTarget(null);
    setCancelMutation("idle");
  };

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    setCancelMutation("loading");
    try {
      const { csrfToken } = await fetchCsrfToken();
      await citasService.update(
        cancelTarget.id,
        { estado: "Cancelada" },
        csrfToken
      );
      setReservas((prev) =>
        prev.map((item) =>
          item.id === cancelTarget.id ? { ...item, estado: "Cancelada" } : item
        )
      );
      setFlashMessage(`Reserva de ${cancelTarget.clienteNombre} cancelada`);
      closeCancelModal();
    } catch (err) {
      setFlashMessage(getErrorMessage(err));
      setCancelMutation("idle");
    }
  };

  const handleInvoiceCopy = async () => {
    if (!invoiceTarget || !invoiceIssuedAt) return;
    if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
      setInvoiceCopyStatus("error");
      return;
    }

    const resumen = generateInvoiceText(
      invoiceTarget,
      invoiceNumber,
      invoiceIssuedAt,
      invoiceTotal
    );

    try {
      if (copyResetTimeout.current) {
        window.clearTimeout(copyResetTimeout.current);
      }
      await navigator.clipboard.writeText(resumen);
      setInvoiceCopyStatus("copied");
      copyResetTimeout.current = window.setTimeout(() => {
        setInvoiceCopyStatus("idle");
        copyResetTimeout.current = null;
      }, 2200);
    } catch {
      setInvoiceCopyStatus("error");
      copyResetTimeout.current = window.setTimeout(() => {
        setInvoiceCopyStatus("idle");
        copyResetTimeout.current = null;
      }, 2200);
    }
  };

  const now = Date.now();

  return (
    <div className="space-y-6">
      {flashMessage ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm font-medium text-blue-700 shadow-sm"
        >
          {flashMessage}
        </motion.div>
      ) : null}

      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Gestión de Reservas
            </h2>
            <p className="mt-1 text-sm text-gray-700">
              Supervisa las citas que los clientes crean sin autenticarse,
              controla estados y entrega seguimiento concierge.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => loadData({ force: true })}
              disabled={loading || refreshing}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs uppercase tracking-[0.24em] text-gray-700 transition hover:border-blue-500 hover:text-blue-600 disabled:opacity-60"
              title="Actualizar reservas"
            >
              <FaSyncAlt className={loading || refreshing ? "animate-spin" : ""} />{" "}
              {loading
                ? "Cargando…"
                : refreshing
                ? "Actualizando…"
                : "Actualizar"}
            </button>
            <button
              type="button"
              onClick={() => setIsScheduleOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-xs uppercase tracking-[0.24em] text-blue-600 transition hover:border-blue-500 hover:bg-blue-50"
            >
             Horario semanal
            </button>
            <Link
              to="/admin/reservas/completadas"
              className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-xs uppercase tracking-[0.24em] text-blue-600 transition hover:border-blue-500 hover:bg-blue-50"
            >
              Ver contabilizadas
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-2xl border border-gray-300 bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.28em] text-gray-500">
                Total registros
              </span>
              <FaCalendarAlt className="text-blue-600" />
            </div>
            <p
              className="mt-3 text-3xl font-semibold text-gray-900"
            >
              {totalReservas.toString().padStart(2, "0")}
            </p>
            <p className="mt-2 text-xs text-gray-700">
              Acumulado histórico
            </p>
          </div>
          <div className="rounded-2xl border border-gray-300 bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.28em] text-gray-500">
                Pagadas
              </span>
              <FaFileInvoiceDollar className="text-amber-400" />
            </div>
            <p
              className="mt-3 text-3xl font-semibold text-gray-900"
            >
              {reservasPagadas.toString().padStart(2, "0")}
            </p>
            <p className="mt-2 text-xs text-gray-700">
              Listas para facturar ({proximasReservas} próximas)
            </p>
          </div>
          <div className="rounded-2xl border border-gray-300 bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.28em] text-gray-500">
                Completadas
              </span>
              <FaCheckCircle className="text-emerald-400" />
            </div>
            <p
              className="mt-3 text-3xl font-semibold text-gray-900"
            >
              {reservasCompletadas.toString().padStart(2, "0")}
            </p>
            <p className="mt-2 text-xs text-gray-700">
              Experiencias finalizadas
            </p>
          </div>
          <div className="rounded-2xl border border-gray-300 bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.28em] text-gray-500">
                Canceladas
              </span>
              <FaTimesCircle className="text-red-400" />
            </div>
            <p
              className="mt-3 text-3xl font-semibold text-gray-900"
            >
              {reservasCanceladas.toString().padStart(2, "0")}
            </p>
            <p className="mt-2 text-xs text-gray-700">
              Para revisar con cliente
            </p>
          </div>
          <div className="rounded-2xl border border-gray-300 bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.28em] text-gray-500">
                Proyección
              </span>
              <FaRegCalendarCheck className="text-blue-600" />
            </div>
            <p
              className="mt-3 text-3xl font-semibold text-gray-900"
            >
              {currencyFormatter.format(projectedRevenue)}
            </p>
            <p className="mt-2 text-xs text-gray-700">
              Basado en reservas vigentes
            </p>
          </div>
        </div>

        {nextReservation ? (
          <div className="rounded-2xl border border-gray-300 bg-gray-50 p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-gray-500">
                  Próxima cita confirmada
                </p>
                <h3 className="mt-2 text-xl font-semibold text-gray-900">
                  {nextReservation.clienteNombre}
                </h3>
                <p className="text-xs text-gray-700">
                  {getServicioNombre(nextReservation.servicio)} con{" "}
                  {getPeluqueroNombre(nextReservation.peluquero)}
                </p>
              </div>
              <div className="flex flex-col items-end gap-3 text-right md:flex-row md:items-center md:text-left">
                <div className="flex items-center gap-3 rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-blue-600">
                  <FaClock />
                  <div className="text-xs uppercase tracking-[0.24em]">
                    {formatDate(nextReservation.fechaHora)} ·{" "}
                    {formatTime(nextReservation.fechaHora)}
                  </div>
                </div>
                <div className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs uppercase tracking-[0.28em] text-gray-700">
                  {formatRelativeTime(nextReservation.fechaHora)}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="rounded-2xl border border-gray-300 bg-gray-50 p-5">
          <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-2">
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-semibold text-gray-900">{filteredSorted.length}</span> reservas activas
                <span className="ml-2 text-xs text-gray-700">
                  (Completadas y canceladas en página dedicada)
                </span>
              </p>
            </div>
            <div className="relative w-full max-w-xs">
              <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-700" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por cliente, servicio o barbero"
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-4 text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-300 text-left text-[10px] uppercase tracking-[0.24em] text-gray-500">
                  <th className="pb-3 font-medium">Cliente</th>
                  <th className="pb-3 font-medium">Servicio</th>
                  <th className="pb-3 font-medium">Barbero</th>
                  <th className="pb-3 font-medium">Fecha</th>
                  <th className="pb-3 font-medium">Estado</th>
                  <th className="pb-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-sm text-gray-500"
                    >
                      Cargando reservas…
                    </td>
                  </tr>
                ) : filteredSorted.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-sm text-gray-500"
                    >
                      No se encontraron reservas activas que coincidan con la búsqueda
                    </td>
                  </tr>
                ) : (
                  filteredSorted.map((cita) => {
                    const meta = statusMeta[cita.estado];
                    const StatusIcon = meta.Icon;
                    const citaTimestamp = new Date(cita.fechaHora).getTime();
                    const isValidTimestamp = !Number.isNaN(citaTimestamp);
                    const isExpired = isValidTimestamp && citaTimestamp < now;
                    return (
                      <tr
                        key={cita.id}
                        className={`border-b border-gray-200 transition-colors hover:shadow-sm ${
                          isExpired
                            ? "bg-red-50/70 hover:bg-red-100"
                            : "hover:bg-blue-50/30"
                        }`}
                      >
                        <td className="py-4">
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-blue-600">
                              <FaUser />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {cita.clienteNombre}
                              </p>
                              <p className="text-xs text-gray-700">
                                {cita.clienteEmail}
                              </p>
                              {cita.notas ? (
                                <span className="mt-1 inline-flex items-center rounded-full border border-blue-300 bg-blue-50 px-2 py-0.5 text-[10px] uppercase tracking-[0.3em] text-blue-600">
                                  Notas
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-gray-600">
                          <div className="flex flex-col">
                            <span>{getServicioNombre(cita.servicio)}</span>
                            {(() => {
                              const precio = getServicioPrecio(cita.servicio);
                              const duracion = getServicioDuracion(
                                cita.servicio
                              );
                              if (!precio && !duracion) return null;
                              return (
                                <span className="text-xs text-gray-700">
                                  {precio
                                    ? currencyFormatter.format(precio)
                                    : null}
                                  {precio && duracion ? " • " : null}
                                  {duracion ? `${duracion} min` : null}
                                </span>
                              );
                            })()}
                          </div>
                        </td>
                        <td className="py-4 text-gray-600">
                          {getPeluqueroNombre(cita.peluquero)}
                        </td>
                        <td className="py-4 text-gray-600">
                          <div className="flex flex-col gap-1">
                            <span className="font-medium text-gray-900">
                              {formatDate(cita.fechaHora)}
                            </span>
                            <span className="text-xs text-gray-700">
                              {formatTime(cita.fechaHora)}
                            </span>
                            <span
                              className={`text-xs uppercase tracking-[0.28em] ${
                                isExpired ? "text-red-600" : "text-blue-700"
                              }`}
                            >
                              {isExpired
                                ? `Expirada · ${formatRelativeTime(cita.fechaHora)}`
                                : formatRelativeTime(cita.fechaHora)}
                            </span>
                          </div>
                        </td>
                        <td className="py-4">
                          <span
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs uppercase tracking-[0.28em] ${meta.classes}`}
                          >
                            <StatusIcon className="text-sm" />
                            {cita.estado}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex flex-wrap justify-end gap-2">
                            {cita.estado === "Pagada" ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleQuickComplete(cita)}
                                  disabled={quickUpdateId === cita.id}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:border-emerald-400 hover:bg-emerald-100 disabled:opacity-60"
                                >
                                  <FaCheckCircle />
                                  {quickUpdateId === cita.id
                                    ? "Marcando…"
                                    : "Completar"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openCancelModal(cita)}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:border-red-400 hover:bg-red-100"
                                >
                                  <FaTimesCircle />
                                  Cancelar
                                </button>
                              </>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => setSelected(cita)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 transition hover:border-blue-500 hover:text-blue-600"
                            >
                              <FaEye /> Detalle
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : refreshing ? (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs uppercase tracking-[0.28em] text-blue-700">
              Actualizando datos…
            </div>
          ) : null}
        </div>
      </div>
      <AdminModal
        open={Boolean(selected)}
        onClose={closeModal}
        title="Detalle de reserva"
        size="lg"
        footer={
          <>
            <button
              type="button"
              onClick={closeModal}
              className="rounded-full border border-gray-300 px-4 py-2 text-xs uppercase tracking-[0.28em] text-gray-700 transition hover:border-blue-400 hover:text-blue-600"
            >
              Cerrar
            </button>
            <button
              type="submit"
              form="reserva-detail-form"
              disabled={
                detailMutation === "loading" || selected?.estado === "Cancelada"
              }
              className="rounded-full bg-blue-600 px-6 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {selected?.estado === "Cancelada"
                ? "No editable"
                : detailMutation === "loading"
                ? "Guardando…"
                : "Actualizar"}
            </button>
          </>
        }
      >
        {selected ? (
          <form
            id="reserva-detail-form"
            onSubmit={handleUpdate}
            className="space-y-6 text-sm"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-gray-300 bg-gray-50 p-4">
                <p className="text-xs uppercase tracking-[0.32em] text-blue-600">
                  Datos del cliente
                </p>
                <p className="mt-3 text-lg font-semibold text-gray-900">
                  {selected.clienteNombre}
                </p>
                <p className="text-xs text-gray-700">
                  {selected.clienteEmail}
                </p>
                {selected.clienteTelefono ? (
                  <p className="mt-2 text-xs text-gray-700">
                    {selected.clienteTelefono}
                  </p>
                ) : null}
              </div>
              <div className="rounded-2xl border border-gray-300 bg-gray-50 p-4">
                <p className="text-xs uppercase tracking-[0.32em] text-blue-600">
                  Servicio reservado
                </p>
                <p className="mt-3 text-lg font-semibold text-gray-900">
                  {getServicioNombre(selected.servicio)}
                </p>
                <p className="text-xs text-gray-700">
                  {getPeluqueroNombre(selected.peluquero)}
                </p>
                {(() => {
                  const precio = getServicioPrecio(selected.servicio);
                  const duracion = getServicioDuracion(selected.servicio);
                  if (!precio && !duracion) return null;
                  return (
                    <p className="mt-2 text-xs text-gray-700">
                      {precio ? currencyFormatter.format(precio) : null}
                      {precio && duracion ? " • " : null}
                      {duracion ? `${duracion} min estimados` : null}
                    </p>
                  );
                })()}
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-gray-300 bg-gray-50 p-4">
                <p className="text-xs uppercase tracking-[0.32em] text-blue-600">
                  Fecha y hora
                </p>
                <p className="mt-3 text-base font-semibold text-gray-900">
                  {formatFullDate(selected.fechaHora)}
                </p>
                <p className="text-xs uppercase tracking-[0.32em] text-blue-700">
                  {formatRelativeTime(selected.fechaHora)}
                </p>
              </div>
              <div className="rounded-2xl border border-gray-300 bg-gray-50 p-4">
                <p className="text-xs uppercase tracking-[0.32em] text-blue-600">
                  Estado actual
                </p>
                {(() => {
                  const meta = statusMeta[selected.estado];
                  const StatusIcon = meta.Icon;
                  return (
                    <span
                      className={`mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs uppercase tracking-[0.28em] ${meta.classes}`}
                    >
                      <StatusIcon className="text-sm" />
                      {selected.estado}
                    </span>
                  );
                })()}
                <p className="mt-2 text-[11px] text-gray-600">
                  Registrada el {formatDate(selected.fechaCreacion)} · Última
                  actualización {formatRelativeTime(selected.fechaModificacion)}
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-xs uppercase tracking-[0.28em] text-gray-700">
                  Actualizar estado
                </span>
                <select
                  value={statusDraft}
                  onChange={(event) =>
                    setStatusDraft(event.target.value as EstadoGestionable)
                  }
                  className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={selected?.estado === "Cancelada"}
                >
                  {(["Pagada", "Completada"] as EstadoGestionable[]).map(
                    (estado) => (
                      <option key={estado} value={estado}>
                        {estado}
                      </option>
                    )
                  )}
                </select>
                {selected?.estado === "Cancelada" ? (
                  <p className="pt-2 text-xs text-red-600">
                    Esta reserva fue cancelada y solo se conserva para
                    auditoría.
                  </p>
                ) : null}
              </label>
              <div className="rounded-2xl border border-gray-300 bg-gray-50 p-4 text-xs text-gray-700">
                <p className="uppercase tracking-[0.3em] text-gray-600">
                  Radar operativo
                </p>
                <ul className="mt-3 space-y-2">
                  <li>Reservas pagadas: {reservasPagadas}</li>
                  <li>Próximas 48h: {proximasReservas}</li>
                  <li>Completadas: {reservasCompletadas}</li>
                  <li>Canceladas: {reservasCanceladas}</li>
                </ul>
              </div>
            </div>

            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.28em] text-gray-700">
                Notas / instrucciones
              </span>
              <textarea
                value={notesDraft}
                onChange={(event) => setNotesDraft(event.target.value)}
                placeholder="Agrega instrucciones internas, preferencias del cliente o seguimiento post-servicio"
                className="min-h-[120px] rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
              />
            </label>

            {detailErrors.general ? (
              <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                {detailErrors.general}
              </div>
            ) : null}
          </form>
        ) : null}
      </AdminModal>

      <AdminModal
        open={Boolean(invoiceTarget)}
        onClose={closeInvoiceModal}
        title="Generar factura"
        size="lg"
        footer={
          <>
            <button
              type="button"
              onClick={closeInvoiceModal}
              className="rounded-full border border-gray-300 px-4 py-2 text-xs uppercase tracking-[0.28em] text-gray-700 transition hover:border-blue-400 hover:text-blue-600"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={
                invoiceGenerated
                  ? handleInvoiceFinalize
                  : handleInvoiceGeneratePdf
              }
              disabled={
                invoiceMutation === "loading" ||
                invoicePdfStatus === "generating" ||
                !invoiceTarget
              }
              className="rounded-full bg-blue-600 px-6 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {invoiceGenerated
                ? invoiceMutation === "loading"
                  ? "Finalizando…"
                  : "Finalizar cita"
                : invoicePdfStatus === "generating"
                ? "Generando PDF…"
                : "Generar factura (PDF)"}
            </button>
          </>
        }
      >
        {invoiceTarget && invoiceIssuedAt ? (
          <div className="space-y-6 text-sm">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-gray-300 bg-gray-50 p-4 text-gray-600">
                <p className="text-xs uppercase tracking-[0.32em] text-blue-600">
                  Detalle de factura
                </p>
                <p className="mt-3 text-lg font-semibold text-gray-900">
                  Factura #{invoiceNumber}
                </p>
                <p className="text-xs text-gray-700">
                  Emitida {fullDateFormatter.format(invoiceIssuedAt)}
                </p>
                <p className="mt-2 text-xs text-gray-700">
                  Servicio programado {formatFullDate(invoiceTarget.fechaHora)}
                </p>
              </div>
              <div className="rounded-2xl border border-gray-300 bg-gray-50 p-4 text-gray-600">
                <p className="text-xs uppercase tracking-[0.32em] text-blue-600">
                  Pago recibido
                </p>
                <p className="mt-3 text-lg font-semibold text-gray-900">
                  {invoicePaymentDetails.metodo}
                </p>
                <p className="text-xs text-gray-700">
                  Estado: {invoicePaymentDetails.estado}
                </p>
                <p className="text-xs text-gray-700">
                  Referencia: {invoicePaymentDetails.referencia}
                </p>
                {invoicePaymentDetails.fecha ? (
                  <p className="mt-2 text-xs text-gray-700">
                    Confirmado el {formatFullDate(invoicePaymentDetails.fecha)}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-gray-300 bg-gray-50 p-4 text-gray-600">
                <p className="text-xs uppercase tracking-[0.32em] text-blue-600">
                  Cliente
                </p>
                <p className="mt-3 text-lg font-semibold text-gray-900">
                  {invoiceTarget.clienteNombre}
                </p>
                <p className="text-xs text-gray-700">
                  {invoiceTarget.clienteEmail}
                </p>
                <p className="text-xs text-gray-700">
                  {invoiceTarget.clienteTelefono
                    ? invoiceTarget.clienteTelefono
                    : "Sin teléfono registrado"}
                </p>
              </div>
              <div className="rounded-2xl border border-gray-300 bg-gray-50 p-4 text-gray-600">
                <p className="text-xs uppercase tracking-[0.32em] text-blue-600">
                  Servicio
                </p>
                <p className="mt-3 text-lg font-semibold text-gray-900">
                  {getServicioNombre(invoiceTarget.servicio)}
                </p>
                <p className="text-xs text-gray-700">
                  Barbero: {getPeluqueroNombre(invoiceTarget.peluquero)}
                </p>
                {(() => {
                  const precio = getServicioPrecio(invoiceTarget.servicio);
                  const duracion = getServicioDuracion(invoiceTarget.servicio);
                  if (!precio && !duracion) return null;
                  return (
                    <p className="mt-2 text-xs text-gray-700">
                      {precio ? currencyFormatter.format(precio) : null}
                      {precio && duracion ? " • " : null}
                      {duracion ? `${duracion} min estimados` : null}
                    </p>
                  );
                })()}
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-300 bg-gray-50">
              <table className="min-w-full divide-y divide-gray-200 text-sm text-gray-700">
                <thead className="uppercase tracking-[0.24em] text-gray-600 text-[11px]">
                  <tr>
                    <th className="px-5 py-3 text-left">Concepto</th>
                    <th className="px-5 py-3 text-center">Cantidad</th>
                    <th className="px-5 py-3 text-right">Precio unitario</th>
                    <th className="px-5 py-3 text-right">Importe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-5 py-4">
                      {getServicioNombre(invoiceTarget.servicio)}
                      <div className="text-xs text-gray-700">
                        Reserva #{invoiceTarget.id}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">1</td>
                    <td className="px-5 py-4 text-right">
                      {invoiceTotal
                        ? currencyFormatter.format(invoiceTotal)
                        : "—"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {invoiceTotal
                        ? currencyFormatter.format(invoiceTotal)
                        : "—"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleInvoiceCopy}
                  className="inline-flex items-center gap-2 rounded-full border border-blue-300 px-4 py-2 text-xs uppercase tracking-[0.32em] text-blue-600 transition hover:border-blue-500 hover:bg-blue-50"
                >
                  Copiar datos
                </button>
                {invoiceCopyStatus === "copied" ? (
                  <span className="text-xs uppercase tracking-[0.32em] text-emerald-600">
                    Copiado
                  </span>
                ) : null}
                {invoiceCopyStatus === "error" ? (
                  <span className="text-xs uppercase tracking-[0.32em] text-red-700">
                    No se pudo copiar
                  </span>
                ) : null}
                {invoicePdfStatus === "success" ? (
                  <span className="text-xs uppercase tracking-[0.32em] text-emerald-600">
                    PDF generado
                  </span>
                ) : null}
                {invoicePdfStatus === "error" ? (
                  <span className="text-xs uppercase tracking-[0.32em] text-red-700">
                    PDF no disponible
                  </span>
                ) : null}
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.32em] text-gray-500">
                  Total a facturar
                </p>
                <p
                  className="mt-2 text-3xl font-semibold text-gray-900"
                >
                  {currencyFormatter.format(invoiceTotal)}
                </p>
              </div>
            </div>

            {invoiceTarget.notas ? (
              <div className="rounded-2xl border border-blue-300 bg-blue-50 p-4 text-gray-700">
                <p className="text-xs uppercase tracking-[0.32em] text-blue-600">
                  Notas internas
                </p>
                <p className="mt-2 text-sm">{invoiceTarget.notas}</p>
              </div>
            ) : null}

            {invoiceError ? (
              <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                {invoiceError}
              </div>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-gray-700">
            Selecciona una reserva pagada para generar su factura.
          </p>
        )}
      </AdminModal>

      <AdminModal
        open={isScheduleOpen}
        onClose={handleScheduleClose}
        title="Horario semanal"
        size="full"
        footer={
          <button
            type="button"
            onClick={handleScheduleClose}
            className="rounded-full border border-gray-300 px-5 py-2 text-xs uppercase tracking-[0.28em] text-gray-600 transition hover:border-blue-400 hover:text-blue-600"
          >
            Cerrar
          </button>
        }
      >
        <div className="flex h-full flex-col">
          <Suspense
            fallback={
              <div className="flex flex-1 items-center justify-center text-sm text-gray-700">
                Cargando horario semanal…
              </div>
            }
          >
            <LazyHorarioEscolar
              reservas={scheduleReservas}
              selectedDate={scheduleSelectedDate}
              onDateChange={handleScheduleDateChange}
              dateInputValue={scheduleDateInputValue}
              dateInputMin={scheduleDateMin}
              dateInputMax={scheduleDateMax}
              onDateInputChange={handleScheduleDateInputChange}
            />
          </Suspense>
        </div>
      </AdminModal>

      <AdminModal
        open={Boolean(cancelTarget)}
        onClose={closeCancelModal}
        title="Confirmar cancelación"
        size="md"
        footer={
          <>
            <button
              type="button"
              onClick={closeCancelModal}
              disabled={cancelMutation === "loading"}
              className="rounded-full border border-gray-300 px-4 py-2 text-xs uppercase tracking-[0.28em] text-gray-700 transition hover:border-blue-400 hover:text-blue-600 disabled:opacity-60"
            >
              No, mantener
            </button>
            <button
              type="button"
              onClick={handleConfirmCancel}
              disabled={cancelMutation === "loading"}
              className="rounded-full bg-red-500 px-6 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-white shadow-[0_16px_40px_rgba(239,68,68,0.35)] transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cancelMutation === "loading"
                ? "Cancelando…"
                : "Sí, cancelar cita"}
            </button>
          </>
        }
      >
        {cancelTarget ? (
          <div className="space-y-5 text-sm">
            <div className="rounded-2xl border border-red-300 bg-red-50 p-5 text-center">
              <FaTimesCircle className="mx-auto text-5xl text-red-400" />
              <p className="mt-4 text-base font-semibold text-gray-900">
                ¿Estás seguro de cancelar esta reserva?
              </p>
              <p className="mt-2 text-xs text-gray-700">
                Esta acción marcará la cita como cancelada en el sistema.
              </p>
            </div>

            <div className="space-y-3 rounded-2xl border border-gray-300 bg-gray-50 p-4 text-gray-700">
              <div className="flex items-start justify-between">
                <span className="text-xs uppercase tracking-[0.32em] text-gray-500">
                  Cliente
                </span>
                <span className="font-semibold text-gray-900">
                  {cancelTarget.clienteNombre}
                </span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-xs uppercase tracking-[0.32em] text-gray-500">
                  Servicio
                </span>
                <span className="text-gray-900">
                  {getServicioNombre(cancelTarget.servicio)}
                </span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-xs uppercase tracking-[0.32em] text-gray-500">
                  Barbero
                </span>
                <span className="text-gray-900">
                  {getPeluqueroNombre(cancelTarget.peluquero)}
                </span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-xs uppercase tracking-[0.32em] text-gray-500">
                  Fecha
                </span>
                <span className="text-gray-900">
                  {formatDate(cancelTarget.fechaHora)} ·{" "}
                  {formatTime(cancelTarget.fechaHora)}
                </span>
              </div>
              {(() => {
                const precio = getServicioPrecio(cancelTarget.servicio);
                if (!precio) return null;
                return (
                  <div className="flex items-start justify-between border-t border-gray-300 pt-3">
                    <span className="text-xs uppercase tracking-[0.32em] text-gray-500">
                      Monto
                    </span>
                    <span className="font-semibold text-red-700">
                      {currencyFormatter.format(precio)}
                    </span>
                  </div>
                );
              })()}
            </div>

            <div className="rounded-2xl border border-blue-300 bg-blue-50 p-4 text-xs text-gray-700">
              <p className="font-semibold text-blue-600">
                💡 Nota importante:
              </p>
              <p className="mt-2">
                La cita cancelada se conservará en el sistema para auditoría y
                aparecerá en la sección de "Reservas Canceladas" del panel de
                contabilización.
              </p>
            </div>
          </div>
        ) : null}
      </AdminModal>
    </div>
  );
};

export default ReservasDashboard;
