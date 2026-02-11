import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { jsPDF } from "jspdf";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaFileInvoiceDollar,
  FaSearch,
  FaSyncAlt,
  FaTimesCircle,
  FaUsers,
  FaWallet,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import AdminModal from "../../components/admin/ui/AdminModal";
import type { Cita } from "../../models/Cita";
import type { Peluquero } from "../../models/Peluquero";
import type { Servicio } from "../../models/Servicio";
import type { Pago } from "../../models/Pago";
import { citasService } from "../../services/citasService";
import { getErrorMessage } from "../../services/api";

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  weekday: "short",
  day: "2-digit",
  month: "short",
});

const groupLabelFormatter = new Intl.DateTimeFormat("es-ES", {
  weekday: "long",
  day: "2-digit",
  month: "long",
});

const timeFormatter = new Intl.DateTimeFormat("es-ES", {
  hour: "2-digit",
  minute: "2-digit",
});

const fullDateFormatter = new Intl.DateTimeFormat("es-ES", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

const currencyFormatter = new Intl.NumberFormat("es-BO", {
  style: "currency",
  currency: "BOB",
  maximumFractionDigits: 2,
});

type CopyStatus = "idle" | "copied" | "error";

type GroupedCitas = {
  dateKey: string;
  label: string;
  citas: Cita[];
};



const isFullPeluquero = (peluquero: Cita["peluquero"]): peluquero is Peluquero =>
  Boolean(peluquero) && typeof peluquero === "object" && "nombre" in peluquero;

const isFullServicio = (servicio: Cita["servicio"]): servicio is Servicio =>
  Boolean(servicio) && typeof servicio === "object" && "nombre" in servicio;

const isFullPago = (pago: Cita["pago"]): pago is Pago =>
  Boolean(pago) && typeof pago === "object" && "estado" in pago;

const getPeluqueroId = (peluquero: Cita["peluquero"]): number | null => {
  if (!peluquero || typeof peluquero !== "object") return null;
  return "id" in peluquero && typeof peluquero.id === "number" ? peluquero.id : null;
};

const getServicioId = (servicio: Cita["servicio"]): number | null => {
  if (!servicio || typeof servicio !== "object") return null;
  return "id" in servicio && typeof servicio.id === "number" ? servicio.id : null;
};

const getPeluqueroNombre = (peluquero: Cita["peluquero"]): string => {
  if (!peluquero) return "Sin asignar";
  if (isFullPeluquero(peluquero) && peluquero.nombre) {
    return peluquero.nombre;
  }
  return `Barbero #${peluquero.id}`;
};

const getServicioNombre = (servicio: Cita["servicio"]): string => {
  if (!servicio) return "—";
  if (isFullServicio(servicio) && servicio.nombre) {
    return servicio.nombre;
  }
  return `Servicio #${servicio.id}`;
};

const getServicioPrecio = (servicio: Cita["servicio"]): number | null => {
  if (!servicio) return null;
  if (isFullServicio(servicio) && typeof servicio.precio === "number") {
    return servicio.precio;
  }
  return null;
};

const getServicioDuracion = (servicio: Cita["servicio"]): number | null => {
  if (!servicio) return null;
  if (isFullServicio(servicio) && typeof servicio.duracion === "number") {
    return servicio.duracion;
  }
  return null;
};

const formatDate = (iso: string): string => {
  try {
    return dateFormatter.format(new Date(iso));
  } catch {
    return iso;
  }
};

const formatTime = (iso: string): string => {
  try {
    return timeFormatter.format(new Date(iso));
  } catch {
    return "";
  }
};

const buildInvoiceNumber = (citaId: number, issuedAt: Date): string => {
  const year = issuedAt.getFullYear();
  const month = String(issuedAt.getMonth() + 1).padStart(2, "0");
  const day = String(issuedAt.getDate()).padStart(2, "0");
  return `SUN-${year}${month}${day}-${citaId.toString().padStart(4, "0")}`;
};

const generateInvoiceText = (cita: Cita, invoiceNumber: string, issuedAt: Date, total: number): string => {
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

const ReservasCompletadasDashboard = () => {
  const [reservas, setReservas] = useState<Cita[]>([]);
  const [canceladas, setCanceladas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"fechaHora" | "fechaCreacion">("fechaCreacion");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [barberFilter, setBarberFilter] = useState("todos");
  const [serviceFilter, setServiceFilter] = useState("todos");
  const [invoiceTarget, setInvoiceTarget] = useState<Cita | null>(null);
  const [invoiceCopyStatus, setInvoiceCopyStatus] = useState<CopyStatus>("idle");
  const [invoicePdfStatus, setInvoicePdfStatus] = useState<"idle" | "generating" | "success" | "error">("idle");
  
  const copyResetTimeout = useRef<number | null>(null);
  // Refs para evitar múltiples peticiones simultáneas
  const isLoadingRef = useRef(false);
  const lastLoadTimeRef = useRef(0);

  const loadData = useCallback(
    async (mode: "initial" | "refresh" = "initial") => {
      // Evitar peticiones duplicadas si ya hay una en curso
      if (isLoadingRef.current) {
        return;
      }

      // Throttle: Evitar peticiones si la última fue hace menos de 2 segundos
      const now = Date.now();
      if (now - lastLoadTimeRef.current < 2000) {
        return;
      }

      isLoadingRef.current = true;
      lastLoadTimeRef.current = now;

      if (mode === "initial") {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);
      
      try {
        const response = await citasService.list();
        const completadas: Cita[] = [];
        const canceladasData: Cita[] = [];
        for (const cita of response) {
          if (cita.estado === "Completada") completadas.push(cita);
          else if (cita.estado === "Cancelada") canceladasData.push(cita);
        }
        
        setReservas(completadas);
        setCanceladas(canceladasData);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        if (mode === "initial") {
          setLoading(false);
        } else {
          setRefreshing(false);
        }
        isLoadingRef.current = false;
      }
    },
    [],
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derived sorted state — no extra renders from useEffect + setState
  const sortFn = useCallback(
    (a: Cita, b: Cita) =>
      sortBy === "fechaCreacion"
        ? new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
        : new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime(),
    [sortBy],
  );
  const sortedReservas = useMemo(() => [...reservas].sort(sortFn), [reservas, sortFn]);
  const sortedCanceladas = useMemo(() => [...canceladas].sort(sortFn), [canceladas, sortFn]);

  useEffect(
    () => () => {
      if (copyResetTimeout.current) {
        window.clearTimeout(copyResetTimeout.current);
      }
    },
    [],
  );

  // Combined: single pass to extract both barber and service filter options
  const { barberOptions, serviceOptions } = useMemo(() => {
    const barberMap = new Map<number, string>();
    const serviceMap = new Map<number, string>();
    for (const cita of reservas) {
      const bId = getPeluqueroId(cita.peluquero);
      if (bId && !barberMap.has(bId)) barberMap.set(bId, getPeluqueroNombre(cita.peluquero));
      const sId = getServicioId(cita.servicio);
      if (sId && !serviceMap.has(sId)) serviceMap.set(sId, getServicioNombre(cita.servicio));
    }
    return {
      barberOptions: Array.from(barberMap.entries())
        .map(([id, nombre]) => ({ id, nombre }))
        .sort((a, b) => a.nombre.localeCompare(b.nombre, "es")),
      serviceOptions: Array.from(serviceMap.entries())
        .map(([id, nombre]) => ({ id, nombre }))
        .sort((a, b) => a.nombre.localeCompare(b.nombre, "es")),
    };
  }, [reservas]);

  const applyFilters = (citasList: Cita[]) => {
    const term = search.trim().toLowerCase();
    const fromTimestamp = fromDate ? new Date(`${fromDate}T00:00:00`).getTime() : null;
    const toTimestamp = toDate ? new Date(`${toDate}T23:59:59`).getTime() : null;

    return citasList.filter((cita) => {
      const citaDate = new Date(cita.fechaHora);
      const citaTime = citaDate.getTime();
      if (Number.isNaN(citaTime)) return false;

      if (fromTimestamp && citaTime < fromTimestamp) return false;
      if (toTimestamp && citaTime > toTimestamp) return false;

      if (barberFilter !== "todos") {
        const id = getPeluqueroId(cita.peluquero);
        if (!id || String(id) !== barberFilter) return false;
      }

      if (serviceFilter !== "todos") {
        const id = getServicioId(cita.servicio);
        if (!id || String(id) !== serviceFilter) return false;
      }

      if (!term) return true;

      const matches = [
        cita.clienteNombre,
        cita.clienteEmail,
        cita.clienteTelefono ?? "",
        getPeluqueroNombre(cita.peluquero),
        getServicioNombre(cita.servicio),
        cita.notas ?? "",
      ];

      return matches.some((value) => value.toLowerCase().includes(term));
    });
  };

  const filtered = useMemo(() => applyFilters(sortedReservas), [sortedReservas, search, fromDate, toDate, barberFilter, serviceFilter]);

  const filteredCanceladas = useMemo(() => applyFilters(sortedCanceladas), [sortedCanceladas, search, fromDate, toDate, barberFilter, serviceFilter]);

  const groupCitasByDate = (citasList: Cita[]): GroupedCitas[] => {
    const map = new Map<string, GroupedCitas>();
    citasList.forEach((cita) => {
      const date = new Date(cita.fechaHora);
      if (Number.isNaN(date.getTime())) return;
      const key = date.toISOString().slice(0, 10);
      const labelRaw = groupLabelFormatter.format(date);
      const label = labelRaw.charAt(0).toUpperCase() + labelRaw.slice(1);
      const current = map.get(key);
      if (current) {
        current.citas.push(cita);
      } else {
        map.set(key, { dateKey: key, label, citas: [cita] });
      }
    });
    const result = Array.from(map.values());
    result.forEach((group) => {
      group.citas.sort((a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime());
    });
    return result.sort((a, b) => (a.dateKey < b.dateKey ? 1 : a.dateKey > b.dateKey ? -1 : 0));
  };

  const grouped = useMemo<GroupedCitas[]>(() => groupCitasByDate(filtered), [filtered]);

  const groupedCanceladas = useMemo<GroupedCitas[]>(() => groupCitasByDate(filteredCanceladas), [filteredCanceladas]);

  // Consolidated: single pass for totalMonto, uniqueClientes, barberBreakdown
  const completadasStats = useMemo(() => {
    let totalMonto = 0;
    const clienteSet = new Set<string>();
    const barberMap = new Map<number, { nombre: string; count: number; total: number }>();
    for (const cita of filtered) {
      const precio = getServicioPrecio(cita.servicio) ?? 0;
      totalMonto += precio;
      clienteSet.add(`${cita.clienteEmail}-${cita.clienteNombre}`);
      const id = getPeluqueroId(cita.peluquero);
      if (id) {
        const current = barberMap.get(id);
        if (current) {
          current.count += 1;
          current.total += precio;
        } else {
          barberMap.set(id, { nombre: getPeluqueroNombre(cita.peluquero), count: 1, total: precio });
        }
      }
    }
    return {
      totalMonto,
      uniqueClientes: clienteSet.size,
      barberBreakdown: Array.from(barberMap.values()).sort((a, b) => b.count - a.count),
    };
  }, [filtered]);

  const totalReservas = filtered.length;
  const ticketPromedio = totalReservas > 0 ? completadasStats.totalMonto / totalReservas : 0;
  const topBarber = completadasStats.barberBreakdown[0];

  // Consolidated: single pass for canceladas stats
  const canceladasStats = useMemo(() => {
    let montoPerdido = 0;
    const clienteSet = new Set<string>();
    for (const cita of filteredCanceladas) {
      montoPerdido += getServicioPrecio(cita.servicio) ?? 0;
      clienteSet.add(`${cita.clienteEmail}-${cita.clienteNombre}`);
    }
    return { montoPerdido, uniqueClientes: clienteSet.size };
  }, [filteredCanceladas]);

  const totalCanceladas = filteredCanceladas.length;

  const openInvoiceModal = useCallback((cita: Cita) => {
    setInvoiceTarget(cita);
    setInvoiceCopyStatus("idle");
    setInvoicePdfStatus("idle");
  }, []);

  const closeInvoiceModal = useCallback(() => {
    setInvoiceTarget(null);
    setInvoiceCopyStatus("idle");
    setInvoicePdfStatus("idle");
    if (copyResetTimeout.current) {
      window.clearTimeout(copyResetTimeout.current);
      copyResetTimeout.current = null;
    }
  }, []);

  const invoiceIssuedAt = useMemo(() => (invoiceTarget ? new Date() : null), [invoiceTarget]);

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
      return { metodo: "—", referencia: "—", estado: "—", fecha: null as string | null };
    }
    if (!invoiceTarget.pago) {
      return { metodo: "QR inmediato", referencia: "—", estado: "Confirmado", fecha: null as string | null };
    }
    if (isFullPago(invoiceTarget.pago)) {
      return {
        metodo: invoiceTarget.pago.metodoPago ?? "QR inmediato",
        referencia: invoiceTarget.pago.transaccionId ?? "—",
        estado: invoiceTarget.pago.estado === "Completado" ? "Confirmado" : invoiceTarget.pago.estado,
        fecha: invoiceTarget.pago.fechaPago,
      };
    }
    return { metodo: `Pago #${invoiceTarget.pago.id}`, referencia: "—", estado: "Registrado", fecha: null as string | null };
  }, [invoiceTarget]);

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
      doc.text(`Emitida: ${fullDateFormatter.format(invoiceIssuedAt)}`, marginLeft, cursorY);

      cursorY += 28;
      const content = generateInvoiceText(invoiceTarget, invoiceNumber, invoiceIssuedAt, invoiceTotal).split("\n");
      doc.setFontSize(10);
      content.forEach((line) => {
        cursorY += 14;
        doc.text(line || " ", marginLeft, cursorY);
      });

      cursorY += 28;
      doc.setFontSize(12);
      doc.text(`Total: ${currencyFormatter.format(invoiceTotal)}`, marginLeft, cursorY);

      cursorY += 40;
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text("Documento generado automáticamente por el panel Sunsetz Studio", marginLeft, cursorY);

      doc.save(`Factura-${invoiceNumber}.pdf`);

      setInvoicePdfStatus("success");
    } catch (err) {
      console.error("Error al generar la factura PDF", err);
      setInvoicePdfStatus("error");
    }
  };

  const handleInvoiceCopy = async () => {
    if (!invoiceTarget || !invoiceIssuedAt) return;
    if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
      setInvoiceCopyStatus("error");
      return;
    }

    const resumen = generateInvoiceText(invoiceTarget, invoiceNumber, invoiceIssuedAt, invoiceTotal);

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

  const handleRefresh = useCallback(() => {
    if (refreshing) return;
    loadData("refresh");
  }, [refreshing, loadData]);

  const handleResetFilters = useCallback(() => {
    setSearch("");
    setFromDate("");
    setToDate("");
    setBarberFilter("todos");
    setServiceFilter("todos");
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-blue-600/70">Reservas contabilizadas</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Archivo financiero de experiencias Sunsetz
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-700">
            Visualiza las citas ya atendidas, filtra por profesional o rango de fechas y obtén insights inmediatos para el
            cierre contable.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/reservas"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-xs uppercase tracking-[0.28em] text-gray-600 transition hover:border-blue-500/50 hover:text-blue-600"
          >
            <FaArrowLeft aria-hidden="true" /> Volver a reservas activas
          </Link>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-xs uppercase tracking-[0.28em] text-gray-600 transition hover:border-blue-500/50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FaSyncAlt aria-hidden="true" className={refreshing ? "animate-spin" : undefined} /> {refreshing ? "Actualizando…" : "Actualizar"}
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-gray-300 bg-white p-5 text-gray-900"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] uppercase tracking-[0.32em] text-gray-600">Registros filtrados</p>
              <p className="mt-2 text-4xl font-semibold tabular-nums">
                {totalReservas}
              </p>
              <p className="mt-2 text-xs text-gray-700">en {grouped.length} días operativos</p>
            </div>
            <FaCheckCircle aria-hidden="true" className="text-2xl text-emerald-400" />
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-gray-300 bg-white p-5 text-gray-900"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] uppercase tracking-[0.32em] text-gray-600">Ingresos estimados</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums">
                {currencyFormatter.format(completadasStats.totalMonto)}
              </p>
              <p className="mt-2 text-xs text-gray-700">
                Ticket promedio {currencyFormatter.format(ticketPromedio || 0)}
              </p>
            </div>
            <FaWallet aria-hidden="true" className="text-2xl text-blue-600" />
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-gray-300 bg-white p-5 text-gray-900"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] uppercase tracking-[0.32em] text-gray-600">Clientes únicos</p>
              <p className="mt-2 text-4xl font-semibold tabular-nums">
                {completadasStats.uniqueClientes}
              </p>
              <p className="mt-2 text-xs text-gray-700">
                Fidelización medida por email
              </p>
            </div>
            <FaUsers aria-hidden="true" className="text-2xl text-amber-400" />
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-gray-300 bg-white p-5 text-gray-900"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] uppercase tracking-[0.32em] text-gray-600">Barbero destacado</p>
              <p className="mt-2 text-2xl font-semibold">
                {topBarber ? topBarber.nombre : "Sin datos"}
              </p>
              <p className="mt-2 text-xs text-gray-700">
                {topBarber ? `${topBarber.count} servicios · ${currencyFormatter.format(topBarber.total)}` : "Filtra para ver líderes"}
              </p>
            </div>
            <FaFileInvoiceDollar aria-hidden="true" className="text-2xl text-blue-600" />
          </div>
        </motion.div>
      </div>

      <div className="rounded-2xl border border-gray-300 bg-gray-100/85 p-6 shadow-[0_24px_55px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <FaSearch aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs text-gray-700" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Busca por cliente, servicio, barbero o notas"
                className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
              />
            </div>
            <label className="flex flex-col text-xs uppercase tracking-[0.24em] text-gray-700">
              Ordenar
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "fechaHora" | "fechaCreacion")}
                className="mt-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
              >
                <option value="fechaCreacion">Más recientes</option>
                <option value="fechaHora">Próximas citas</option>
              </select>
            </label>
            <label className="flex flex-col text-xs uppercase tracking-[0.24em] text-gray-700">
              Desde
              <input
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
                className="mt-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
              />
            </label>
            <label className="flex flex-col text-xs uppercase tracking-[0.24em] text-gray-700">
              Hasta
              <input
                type="date"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
                className="mt-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
              />
            </label>
            <label className="flex flex-col text-xs uppercase tracking-[0.24em] text-gray-700">
              Barbero
              <select
                value={barberFilter}
                onChange={(event) => setBarberFilter(event.target.value)}
                className="mt-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
              >
                <option value="todos">Todos</option>
                {barberOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col text-xs uppercase tracking-[0.24em] text-gray-700">
              Servicio
              <select
                value={serviceFilter}
                onChange={(event) => setServiceFilter(event.target.value)}
                className="mt-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
              >
                <option value="todos">Todos</option>
                {serviceOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.nombre}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-xs uppercase tracking-[0.28em] text-gray-700 transition hover:border-blue-500/50 hover:text-blue-600"
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {loading ? (
            <p className="rounded-2xl border border-gray-300 bg-white px-4 py-6 text-center text-sm text-gray-500">
              Consultando historial de reservas…
            </p>
          ) : error ? (
            <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-4 text-sm text-red-700">
              {error}
            </div>
          ) : grouped.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-6 text-center text-sm text-gray-700">
              Ajusta los filtros para ver reservas contabilizadas.
            </p>
          ) : (
            grouped.map((group) => (
              <div key={group.dateKey} className="space-y-4 rounded-2xl border border-gray-300 bg-gray-50 p-5">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div className="inline-flex items-center gap-2 text-sm text-blue-600">
                    <FaCheckCircle aria-hidden="true" className="text-[#7FD1AE]" /> {group.label}
                  </div>
                  <div className="text-xs uppercase tracking-[0.28em] text-gray-600">
                    {group.citas.length === 1 ? "1 reserva" : `${group.citas.length} reservas`}
                  </div>
                </div>

                <div className="space-y-3">
                  {group.citas.map((cita) => {
                    const amount = getServicioPrecio(cita.servicio);
                    const duracion = getServicioDuracion(cita.servicio);
                    return (
                      <div
                        key={cita.id}
                        className="flex flex-col gap-4 rounded-2xl border border-gray-300 bg-white px-4 py-4 text-sm text-gray-900 transition-all hover:border-blue-400 hover:shadow-md md:flex-row md:items-center md:justify-between"
                      >
                        <div className="space-y-1">
                          <p className="text-base font-semibold text-gray-900">{cita.clienteNombre}</p>
                          <p className="text-xs text-gray-700">
                            {getServicioNombre(cita.servicio)} · {formatTime(cita.fechaHora)} · {getPeluqueroNombre(cita.peluquero)}
                          </p>
                          <p className="text-xs text-gray-700">Creada {formatDate(cita.fechaCreacion)} · #{cita.id}</p>
                        </div>
                        <div className="flex flex-col-reverse gap-3 md:flex-row md:items-center md:gap-4">
                          <div className="text-right text-xs text-gray-700">
                            {duracion ? <p>{duracion} min estimados</p> : null}
                            <p className="text-sm font-semibold text-gray-900">
                              {amount ? currencyFormatter.format(amount) : "Sin monto"}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => openInvoiceModal(cita)}
                            className="inline-flex items-center gap-2 rounded-lg border border-blue-300 px-4 py-2 text-xs uppercase tracking-[0.28em] text-blue-600 transition hover:border-blue-500 hover:bg-blue-50"
                          >
                            <FaFileInvoiceDollar aria-hidden="true" /> Generar factura
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sección de Canceladas */}
      <div className="mx-auto max-w-7xl rounded-2xl border border-gray-300 bg-white p-8 shadow-lg">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Reservas Canceladas</h2>
            <p className="text-sm text-gray-500">Historial de citas canceladas</p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-gray-700">
            <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-2">
              <span className="font-semibold tabular-nums text-red-700">{totalCanceladas}</span> canceladas
            </div>
            <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-2">
              <span className="font-semibold tabular-nums text-red-700">{currencyFormatter.format(canceladasStats.montoPerdido)}</span> perdidos
            </div>
            <div className="rounded-lg border border-gray-300 bg-white px-4 py-2">
              <span className="font-semibold tabular-nums text-gray-900">{canceladasStats.uniqueClientes}</span> clientes
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {loading ? (
            <p className="rounded-2xl border border-gray-300 bg-white px-4 py-6 text-center text-sm text-gray-500">
              Consultando historial de cancelaciones…
            </p>
          ) : error ? (
            <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-4 text-sm text-red-700">
              {error}
            </div>
          ) : groupedCanceladas.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-6 text-center text-sm text-gray-700">
              No hay cancelaciones en este período.
            </p>
          ) : (
            groupedCanceladas.map((group) => (
              <div key={group.dateKey} className="space-y-4 rounded-2xl border border-red-200 bg-gray-50 p-5">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div className="inline-flex items-center gap-2 text-sm text-red-600">
                    <FaTimesCircle aria-hidden="true" className="text-red-600" /> {group.label}
                  </div>
                  <div className="text-xs uppercase tracking-[0.28em] text-gray-600">
                    {group.citas.length === 1 ? "1 cancelación" : `${group.citas.length} cancelaciones`}
                  </div>
                </div>

                <div className="space-y-3">
                  {group.citas.map((cita) => {
                    const amount = getServicioPrecio(cita.servicio);
                    const duracion = getServicioDuracion(cita.servicio);
                    return (
                      <div
                        key={cita.id}
                        className="flex flex-col gap-4 rounded-2xl border border-red-200 bg-white px-4 py-4 text-sm text-gray-900 transition-all hover:border-red-400 hover:shadow-md md:flex-row md:items-center md:justify-between"
                      >
                        <div className="space-y-1">
                          <p className="text-base font-semibold text-gray-900">{cita.clienteNombre}</p>
                          <p className="text-xs text-gray-700">
                            {getServicioNombre(cita.servicio)} · {formatTime(cita.fechaHora)} · {getPeluqueroNombre(cita.peluquero)}
                          </p>
                          <p className="text-xs text-gray-700">Creada {formatDate(cita.fechaCreacion)} · #{cita.id}</p>
                          {cita.notas ? (
                            <p className="mt-1 text-xs italic text-red-700/60">Nota: {cita.notas}</p>
                          ) : null}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="text-right text-xs text-gray-700">
                            {duracion ? <p>{duracion} min perdidos</p> : null}
                            <p className="text-sm font-semibold text-red-700">
                              {amount ? currencyFormatter.format(amount) : "Sin monto"}
                            </p>
                          </div>
                          <span className="rounded-lg border border-red-300 bg-red-50 px-3 py-1 text-xs uppercase tracking-[0.28em] text-red-600">
                            Cancelada
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <AdminModal open={Boolean(invoiceTarget)} onClose={closeInvoiceModal} title="Detalle de factura" size="lg">
        {invoiceTarget && invoiceIssuedAt ? (
          <div className="space-y-6 text-sm">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-gray-300 bg-white p-4 text-gray-600">
                <p className="text-xs uppercase tracking-[0.32em] text-blue-600/75">Información de emisión</p>
                <p className="mt-3 text-lg font-semibold text-gray-900">Factura #{invoiceNumber}</p>
                <p className="text-xs text-gray-700">Emitida {fullDateFormatter.format(invoiceIssuedAt)}</p>
                <p className="mt-2 text-xs text-gray-700">Servicio brindado {fullDateFormatter.format(new Date(invoiceTarget.fechaHora))}</p>
              </div>
              <div className="rounded-2xl border border-gray-300 bg-white p-4 text-gray-600">
                <p className="text-xs uppercase tracking-[0.32em] text-blue-600/75">Pago registrado</p>
                <p className="mt-3 text-lg font-semibold text-gray-900">{invoicePaymentDetails.metodo}</p>
                <p className="text-xs text-gray-700">Estado: {invoicePaymentDetails.estado}</p>
                <p className="text-xs text-gray-700">Referencia: {invoicePaymentDetails.referencia}</p>
                {invoicePaymentDetails.fecha ? (
                  <p className="mt-2 text-xs text-gray-700">
                    Confirmado el {fullDateFormatter.format(new Date(invoicePaymentDetails.fecha))}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-gray-300 bg-white p-4 text-gray-600">
                <p className="text-xs uppercase tracking-[0.32em] text-blue-600/75">Cliente</p>
                <p className="mt-3 text-lg font-semibold text-gray-900">{invoiceTarget.clienteNombre}</p>
                <p className="text-xs text-gray-700">{invoiceTarget.clienteEmail}</p>
                <p className="text-xs text-gray-700">
                  {invoiceTarget.clienteTelefono ? invoiceTarget.clienteTelefono : "Sin teléfono registrado"}
                </p>
              </div>
              <div className="rounded-2xl border border-gray-300 bg-white p-4 text-gray-600">
                <p className="text-xs uppercase tracking-[0.32em] text-blue-600/75">Servicio</p>
                <p className="mt-3 text-lg font-semibold text-gray-900">{getServicioNombre(invoiceTarget.servicio)}</p>
                <p className="text-xs text-gray-700">Barbero: {getPeluqueroNombre(invoiceTarget.peluquero)}</p>
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

            <div className="overflow-hidden rounded-2xl border border-gray-300 bg-white">
              <table className="min-w-full divide-y divide-[#1F1F1F] text-sm text-gray-900">
                <thead className="text-[11px] uppercase tracking-[0.24em] text-gray-600">
                  <tr>
                    <th className="px-5 py-3 text-left">Concepto</th>
                    <th className="px-5 py-3 text-center">Cantidad</th>
                    <th className="px-5 py-3 text-right">Precio unitario</th>
                    <th className="px-5 py-3 text-right">Importe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#151515]">
                  <tr>
                    <td className="px-5 py-4">
                      {getServicioNombre(invoiceTarget.servicio)}
                      <div className="text-xs text-gray-700">Reserva #{invoiceTarget.id}</div>
                    </td>
                    <td className="px-5 py-4 text-center">1</td>
                    <td className="px-5 py-4 text-right">
                      {invoiceTotal ? currencyFormatter.format(invoiceTotal) : "—"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {invoiceTotal ? currencyFormatter.format(invoiceTotal) : "—"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleInvoiceGeneratePdf}
                  disabled={invoicePdfStatus === "generating"}
                  className="inline-flex items-center gap-2 rounded-lg border border-blue-300 px-4 py-2 text-xs uppercase tracking-[0.32em] text-blue-600 transition hover:border-blue-500 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {invoicePdfStatus === "generating" ? "Generando PDF…" : "Generar factura (PDF)"}
                </button>
                {invoicePdfStatus === "success" ? (
                  <span className="text-xs uppercase tracking-[0.32em] text-emerald-300">PDF generado</span>
                ) : null}
                {invoicePdfStatus === "error" ? (
                  <span className="text-xs uppercase tracking-[0.32em] text-red-700">PDF no disponible</span>
                ) : null}
                <button
                  type="button"
                  onClick={handleInvoiceCopy}
                  className="inline-flex items-center gap-2 rounded-lg border border-blue-300 px-4 py-2 text-xs uppercase tracking-[0.32em] text-blue-600 transition hover:border-blue-500 hover:bg-blue-50"
                >
                  Copiar datos
                </button>
                {invoiceCopyStatus === "copied" ? (
                  <span className="text-xs uppercase tracking-[0.32em] text-emerald-300">Copiado</span>
                ) : null}
                {invoiceCopyStatus === "error" ? (
                  <span className="text-xs uppercase tracking-[0.32em] text-red-700">No disponible</span>
                ) : null}
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.32em] text-gray-500">Total facturado</p>
                <p className="mt-2 text-3xl font-semibold tabular-nums text-gray-900">
                  {currencyFormatter.format(invoiceTotal)}
                </p>
              </div>
            </div>

            {invoiceTarget.notas ? (
              <div className="rounded-2xl border border-blue-300 bg-blue-600/5 p-4 text-gray-900">
                <p className="text-xs uppercase tracking-[0.32em] text-blue-600/75">Notas internas</p>
                <p className="mt-2 text-sm">{invoiceTarget.notas}</p>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-gray-700">Selecciona una reserva contabilizada para ver su factura.</p>
        )}
      </AdminModal>
    </div>
  );
};

export default ReservasCompletadasDashboard;
