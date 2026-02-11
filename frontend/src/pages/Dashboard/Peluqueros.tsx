import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FaClock, FaCut, FaEdit, FaPlus, FaSearch, FaTrash, FaUserTie } from "react-icons/fa";
import type { Peluquero, CreatePeluqueroDto } from "../../models/Peluquero";
import type { Servicio } from "../../models/Servicio";
import type { PeluquerosServicio } from "../../models/Peluquero-Servicio";
import { peluquerosService } from "../../services/peluquerosService";
import { serviciosService } from "../../services/serviciosService";
import { peluqueroServicioService } from "../../services/peluqueroServicioService";
import { fetchCsrfToken, getErrorMessage } from "../../services/api";
import AdminModal from "../../components/admin/ui/AdminModal";

type ModalMode = "create" | "edit" | "delete" | null;

type PeluqueroFormState = {
  nombre: string;
  especialidad: string;
  horarioInicio: string;
  horarioFin: string;
  diasLibres: string[];
  fotoUrl: string;
  servicioIds: number[];
};

type FormErrors = Partial<Record<keyof PeluqueroFormState | "general", string>>;

const defaultFormState: PeluqueroFormState = {
  nombre: "",
  especialidad: "",
  horarioInicio: "09:00",
  horarioFin: "20:00",
  diasLibres: [],
  fotoUrl: "",
  servicioIds: [],
};

const weekDays = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const PeluquerosDashboard = () => {
  const [peluqueros, setPeluqueros] = useState<Peluquero[]>([]);
  const [peluqueroServicios, setPeluqueroServicios] = useState<PeluquerosServicio[]>([]);
  const [serviciosCatalogo, setServiciosCatalogo] = useState<Servicio[]>([]);
  const [serviciosError, setServiciosError] = useState<string | null>(null);
  const [serviciosLoading, setServiciosLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selected, setSelected] = useState<Peluquero | null>(null);
  const [form, setForm] = useState<PeluqueroFormState>(defaultFormState);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [mutationState, setMutationState] = useState<"idle" | "loading">("idle");
  const [flashMessage, setFlashMessage] = useState<string | null>(null);
  const [originalServicios, setOriginalServicios] = useState<number[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [barberosResponse, relacionesResponse] = await Promise.all([
        peluquerosService.list(),
        peluqueroServicioService.list(),
      ]);
      const sorted = [...barberosResponse].sort((a, b) => a.nombre.localeCompare(b.nombre));
      setPeluqueros(sorted);
      setPeluqueroServicios(relacionesResponse);
    } catch (err) {
      setError(getErrorMessage(err));
      setPeluqueroServicios([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const fetchServiciosCatalogo = async () => {
      setServiciosLoading(true);
      setServiciosError(null);
      try {
        const response = await serviciosService.list();
        const sorted = [...response].sort((a, b) => a.nombre.localeCompare(b.nombre));
        setServiciosCatalogo(sorted);
      } catch (err) {
        setServiciosError(getErrorMessage(err));
        setServiciosCatalogo([]);
      } finally {
        setServiciosLoading(false);
      }
    };

    fetchServiciosCatalogo();
  }, []);

  const servicioMap = useMemo(() => {
    const map = new Map<number, Servicio>();
    serviciosCatalogo.forEach((servicio) => {
      map.set(servicio.id, servicio);
    });
    return map;
  }, [serviciosCatalogo]);

  const servicioIdsPorPeluquero = useMemo(() => {
    const map = new Map<number, number[]>();
    peluqueroServicios.forEach((relacion) => {
      const actual = map.get(relacion.peluquero_id) ?? [];
      if (!actual.includes(relacion.servicio_id)) {
        actual.push(relacion.servicio_id);
        map.set(relacion.peluquero_id, actual);
      }
    });
    return map;
  }, [peluqueroServicios]);

  const filtered = useMemo(() => {
    if (!search.trim()) return peluqueros;
    const term = search.trim().toLowerCase();
    return peluqueros.filter((peluquero) => {
      const values: string[] = [
        peluquero.nombre ?? "",
        peluquero.especialidad ?? "",
        peluquero.diasLibres ?? "",
        `${peluquero.horarioInicio ?? ""} ${peluquero.horarioFin ?? ""}`,
      ];

      const serviciosIds = servicioIdsPorPeluquero.get(peluquero.id) ?? [];
      serviciosIds.forEach((servicioId) => {
        const servicio = servicioMap.get(servicioId);
        if (servicio?.nombre) {
          values.push(servicio.nombre);
        }
      });

      return values
        .filter((value) => value && value.trim().length > 0)
        .some((value) => value.toLowerCase().includes(term));
    });
  }, [peluqueros, search, servicioIdsPorPeluquero, servicioMap]);

  const openModal = useCallback((mode: ModalMode, peluquero?: Peluquero) => {
    setModalMode(mode);
    setSelected(peluquero ?? null);
    setFormErrors({});
    if (mode === "create") {
      setForm({ ...defaultFormState });
      setOriginalServicios([]);
    }
    if (mode === "edit" && peluquero) {
      const serviciosVinculados = [...(servicioIdsPorPeluquero.get(peluquero.id) ?? [])];
      setForm({
        nombre: peluquero.nombre ?? "",
        especialidad: peluquero.especialidad ?? "",
        horarioInicio: peluquero.horarioInicio?.slice(0, 5) ?? "09:00",
        horarioFin: peluquero.horarioFin?.slice(0, 5) ?? "20:00",
        diasLibres: peluquero.diasLibres?.split(",").map((value) => value.trim()).filter(Boolean) ?? [],
        fotoUrl: peluquero.fotoUrl ?? "",
        servicioIds: serviciosVinculados,
      });
      setOriginalServicios(serviciosVinculados);
    }
  }, [servicioIdsPorPeluquero]);

  const closeModal = useCallback(() => {
    setModalMode(null);
    setSelected(null);
    setForm({ ...defaultFormState });
    setFormErrors({});
    setMutationState("idle");
    setOriginalServicios([]);
  }, []);

  const handleChange = useCallback(<K extends keyof PeluqueroFormState>(key: K, value: PeluqueroFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      delete next.general;
      return next;
    });
  }, []);

  const toggleDay = useCallback((day: string) => {
    setForm((prev) => ({
      ...prev,
      diasLibres: prev.diasLibres.includes(day)
        ? prev.diasLibres.filter((value) => value !== day)
        : [...prev.diasLibres, day],
    }));
  }, []);

  const toggleServicio = useCallback((servicioId: number) => {
    setForm((prev) => {
      const exists = prev.servicioIds.includes(servicioId);
      return {
        ...prev,
        servicioIds: exists
          ? prev.servicioIds.filter((value) => value !== servicioId)
          : [...prev.servicioIds, servicioId],
      };
    });
    setFormErrors((prev) => {
      const next = { ...prev };
      delete next.servicioIds;
      delete next.general;
      return next;
    });
  }, []);

  const validate = (): FormErrors => {
    const errors: FormErrors = {};
    if (!form.nombre.trim()) errors.nombre = "Nombre del barbero requerido";
    if (form.horarioInicio && form.horarioFin && form.horarioFin <= form.horarioInicio) {
      errors.horarioFin = "El horario de salida debe ser mayor";
    }
    return errors;
  };

  const toPayload = (data: PeluqueroFormState): CreatePeluqueroDto => ({
    nombre: data.nombre.trim(),
    especialidad: data.especialidad.trim() || null,
    horarioInicio: data.horarioInicio || null,
    horarioFin: data.horarioFin || null,
    diasLibres: data.diasLibres.length > 0 ? data.diasLibres.join(",") : null,
    fotoUrl: data.fotoUrl.trim() || null,
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (!modalMode) return;

    setMutationState("loading");

    try {
      const { csrfToken } = await fetchCsrfToken();
      const payload = toPayload(form);
      const selectedServiciosIds = [...form.servicioIds];

      if (modalMode === "create") {
        const nuevo = await peluquerosService.create(payload, csrfToken);
        if (selectedServiciosIds.length > 0) {
          await Promise.all(
            selectedServiciosIds.map((servicioId) =>
              peluqueroServicioService.attach(
                {
                  peluqueroId: nuevo.id,
                  servicioId,
                },
                csrfToken,
              ),
            ),
          );
        }
        setFlashMessage("Barbero registrado correctamente");
      }

      if (modalMode === "edit" && selected) {
        await peluquerosService.update(selected.id, payload, csrfToken);
        const toAdd = selectedServiciosIds.filter((id) => !originalServicios.includes(id));
        const toRemove = originalServicios.filter((id) => !selectedServiciosIds.includes(id));

        if (toAdd.length > 0) {
          await Promise.all(
            toAdd.map((servicioId) =>
              peluqueroServicioService.attach(
                {
                  peluqueroId: selected.id,
                  servicioId,
                },
                csrfToken,
              ),
            ),
          );
        }

        if (toRemove.length > 0) {
          await Promise.all(
            toRemove.map((servicioId) =>
              peluqueroServicioService.detach(selected.id, servicioId, csrfToken),
            ),
          );
        }
        setFlashMessage("Datos actualizados");
      }

      await loadData();
      closeModal();
    } catch (err) {
      setFormErrors({ general: getErrorMessage(err) });
      setMutationState("idle");
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setMutationState("loading");
    try {
      const { csrfToken } = await fetchCsrfToken();
      await peluquerosService.remove(selected.id, csrfToken);
      setFlashMessage("Barbero eliminado");
      await loadData();
      closeModal();
    } catch (err) {
      setFormErrors({ general: getErrorMessage(err) });
      setMutationState("idle");
    }
  };

  useEffect(() => {
    if (!flashMessage) return;
    const timeout = window.setTimeout(() => setFlashMessage(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [flashMessage]);

  // Consolidated: single pass for all barber metrics
  const barberStats = useMemo(() => {
    let withEspecialidad = 0;
    let morningShift = 0;
    for (const item of peluqueros) {
      if (item.especialidad) withEspecialidad += 1;
      if ((item.horarioInicio ?? "").slice(0, 2) <= "09") morningShift += 1;
    }
    return { total: peluqueros.length, withEspecialidad, morningShift };
  }, [peluqueros]);

  return (
    <div className="space-y-6">
      {flashMessage ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm text-blue-600 shadow-lg"
        >
          {flashMessage}
        </motion.div>
      ) : null}

      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Gestión de Peluqueros
            </h2>
            <p className="mt-1 text-sm text-gray-700">
              Controla el staff, define horarios y libera cupos en cuestión de segundos
            </p>
          </div>
          <button
            type="button"
            onClick={() => openModal("create")}
            className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-5 py-2.5 text-xs uppercase tracking-[0.24em] text-blue-600 transition hover:border-blue-500 hover:bg-blue-50"
          >
            <FaPlus aria-hidden="true" />
            Añadir peluquero
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.28em] text-gray-600">Equipo total</span>
              <FaUserTie aria-hidden="true" className="text-blue-600" />
            </div>
            <p className="mt-3 text-3xl font-semibold tabular-nums text-gray-900">
              {barberStats.total.toString().padStart(2, "0")}
            </p>
            <p className="mt-2 text-xs text-gray-600">Barberos activos</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.28em] text-gray-600">Con especialidad</span>
              <FaCut aria-hidden="true" className="text-amber-400" />
            </div>
            <p className="mt-3 text-3xl font-semibold tabular-nums text-gray-900">
              {barberStats.withEspecialidad.toString().padStart(2, "0")}
            </p>
            <p className="mt-2 text-xs text-gray-600">Staff especializado</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.28em] text-gray-600">Turno matutino</span>
              <FaClock aria-hidden="true" className="text-emerald-400" />
            </div>
            <p className="mt-3 text-3xl font-semibold tabular-nums text-gray-900">
              {barberStats.morningShift.toString().padStart(2, "0")}
            </p>
            <p className="mt-2 text-xs text-gray-600">Disponibles temprano</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1">
              <FaSearch aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
              <input
                type="search"
                aria-label="Buscar peluqueros"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nombre, especialidad o día libre"
                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left uppercase tracking-[0.24em] text-gray-600 text-[10px] border-b border-gray-200">
                <tr>
                  <th className="pb-3 pt-2">Barbero</th>
                  <th className="pb-3 pt-2">Disponibilidad</th>
                  <th className="pb-3 pt-2">Servicios</th>
                  <th className="pb-3 pt-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#151515] text-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-gray-600">
                      Cargando barberos…
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-gray-600">
                      Sin resultados que coincidan con la búsqueda.
                    </td>
                  </tr>
                ) : (
                  filtered.map((peluquero) => {
                    const diasLibresList = (peluquero.diasLibres ?? "")
                      .split(",")
                      .map((value) => value.trim())
                      .filter(Boolean);
                    const serviciosIds = servicioIdsPorPeluquero.get(peluquero.id) ?? [];
                    const serviciosAsociados = serviciosIds
                      .map((servicioId) => {
                        const servicio = servicioMap.get(servicioId);
                        return {
                          id: servicioId,
                          nombre: servicio?.nombre ?? `Servicio #${servicioId}`,
                          duracion: servicio?.duracion ?? null,
                          activo: servicio?.activo,
                        };
                      })
                      .sort((a, b) => a.nombre.localeCompare(b.nombre));

                    return (
                      <tr key={peluquero.id} className="align-top hover:bg-gray-50">
                        <td className="py-4 align-top">
                          <div className="flex items-start gap-4">
                            {peluquero.fotoUrl ? (
                              <div className="h-16 w-16 overflow-hidden rounded-2xl border border-blue-500/45 bg-blue-50 shadow-[0_0_28px_rgba(184,147,94,0.25)]">
                                <img
                                  src={peluquero.fotoUrl}
                                  alt={`Foto de ${peluquero.nombre}`}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-300 bg-blue-50 text-blue-600">
                                <FaUserTie aria-hidden="true" className="text-xl" />
                              </div>
                            )}
                            <div className="space-y-1">
                              <p className="font-semibold text-gray-900">{peluquero.nombre}</p>
                              {peluquero.especialidad ? (
                                <p className="text-xs text-gray-600">{peluquero.especialidad}</p>
                              ) : (
                                <p className="text-xs text-gray-900/30">Sin especialidad declarada</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 align-top text-gray-600">
                          <div className="grid gap-3 text-sm text-gray-600">
                            <div>
                              <p className="text-[10px] uppercase tracking-[0.28em] text-gray-600">Horario</p>
                              <div className="mt-1 inline-flex items-center gap-2">
                                <FaClock aria-hidden="true" className="text-blue-600/80" />
                                <span>
                                  {peluquero.horarioInicio?.slice(0, 5) ?? "—"} – {peluquero.horarioFin?.slice(0, 5) ?? "—"}
                                </span>
                              </div>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-[0.28em] text-gray-600">Días libres</p>
                              <div className="mt-1 flex flex-wrap gap-2">
                                {diasLibresList.length > 0 ? (
                                  diasLibresList.map((dia) => (
                                    <span
                                      key={dia}
                                      className="rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-gray-600"
                                    >
                                      {dia.substring(0, 3)}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-xs text-gray-600">Turno extendido</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 align-top text-gray-600">
                          {serviciosAsociados.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {serviciosAsociados.map((servicioInfo) => {
                                const isInactivo = servicioInfo.activo === false;
                                return (
                                  <span
                                    key={`${peluquero.id}-${servicioInfo.id}`}
                                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition ${
                                      isInactivo
                                        ? "border-red-400/40 bg-red-500/10 text-red-200"
                                        : "border-blue-500/45 bg-blue-600/12 text-blue-600"
                                    }`}
                                    title={isInactivo ? "Servicio inactivo en catálogo" : undefined}
                                  >
                                    <FaCut aria-hidden="true" className="text-[10px]" />
                                    <span className="font-semibold tracking-[0.18em]">
                                      {servicioInfo.nombre}
                                    </span>
                                    {typeof servicioInfo.duracion === "number" ? (
                                      <span className="text-[10px] uppercase tracking-[0.28em] text-gray-700">
                                        {servicioInfo.duracion}min
                                      </span>
                                    ) : null}
                                  </span>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-600">Sin servicios vinculados</span>
                          )}
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openModal("edit", peluquero)}
                              className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs uppercase tracking-[0.22em] text-blue-600 transition hover:bg-blue-50"
                            >
                              <FaEdit aria-hidden="true" /> Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => openModal("delete", peluquero)}
                              className="inline-flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs uppercase tracking-[0.22em] text-red-400 transition hover:bg-red-500/15"
                            >
                              <FaTrash aria-hidden="true" /> Borrar
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

          {serviciosError && !serviciosLoading ? (
            <div className="rounded-lg border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              No se pudieron cargar los servicios disponibles: {serviciosError}
            </div>
          ) : null}

          {error ? (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}
        </div>
      </div>

      <AdminModal
        open={modalMode === "create" || modalMode === "edit"}
        onClose={closeModal}
        title={modalMode === "edit" ? "Editar barbero" : "Registrar nuevo barbero"}
        size="lg"
        footer={
          <>
            <button
              type="button"
              onClick={closeModal}
              className="rounded-lg border border-gray-200 px-4 py-2 text-xs uppercase tracking-[0.28em] text-gray-700 transition hover:border-blue-500/50 hover:text-blue-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="peluquero-form"
              disabled={mutationState === "loading"}
              className="rounded-lg bg-blue-600 px-6 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-[#0D0D0D] shadow-[0_16px_40px_rgba(184,147,94,0.35)] transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {mutationState === "loading" ? "Guardando…" : "Guardar cambios"}
            </button>
          </>
        }
      >
        <form id="peluquero-form" onSubmit={handleSubmit} className="space-y-6 text-sm">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.28em] text-gray-700">Nombre completo</span>
              <input
                type="text"
                value={form.nombre}
                onChange={(event) => handleChange("nombre", event.target.value)}
                className={`rounded-2xl border bg-white px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 ${
                  formErrors.nombre ? "border-red-400/70" : "border-gray-300"
                }`}
                placeholder="Ej. Sebastián Rocabado"
              />
              {formErrors.nombre ? <span className="text-xs text-red-300">{formErrors.nombre}</span> : null}
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.28em] text-gray-700">Especialidad</span>
              <input
                type="text"
                value={form.especialidad}
                onChange={(event) => handleChange("especialidad", event.target.value)}
                className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
                placeholder="Fade signature, grooming ejecutivo…"
              />
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.28em] text-gray-700">Horario inicio</span>
              <input
                type="time"
                value={form.horarioInicio}
                onChange={(event) => handleChange("horarioInicio", event.target.value)}
                className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.28em] text-gray-700">Horario fin</span>
              <input
                type="time"
                value={form.horarioFin}
                onChange={(event) => handleChange("horarioFin", event.target.value)}
                className={`rounded-2xl border bg-white px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 ${
                  formErrors.horarioFin ? "border-red-400/70" : "border-gray-300"
                }`}
              />
              {formErrors.horarioFin ? <span className="text-xs text-red-300">{formErrors.horarioFin}</span> : null}
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-[0.28em] text-gray-700">Días libres</span>
            <div className="flex flex-wrap gap-2">
              {weekDays.map((day) => {
                const active = form.diasLibres.includes(day);
                return (
                  <button
                    type="button"
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.28em] transition ${
                      active
                        ? "border-blue-500 bg-blue-50 text-blue-600"
                        : "border-gray-300 text-gray-500 hover:border-blue-300 hover:text-blue-600"
                    }`}
                  >
                    {day.substring(0, 3)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-[0.28em] text-gray-700">Servicios vinculados</span>
            <p className="text-[11px] text-gray-600">
              Selecciona los servicios que este barbero domina. Puedes asociar múltiples perfiles y se sincronizarán al guardar.
            </p>
            {serviciosError ? (
              <span className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-xs text-red-200">
                {serviciosError}
              </span>
            ) : serviciosLoading ? (
              <span className="text-xs text-gray-600">Cargando catálogo de servicios…</span>
            ) : serviciosCatalogo.length === 0 ? (
              <span className="text-xs text-gray-600">Aún no hay servicios registrados.</span>
            ) : (
              <div className="flex flex-wrap gap-2">
                {serviciosCatalogo.map((servicio) => {
                  const isSelected = form.servicioIds.includes(servicio.id);
                  const isInactive = servicio.activo === false;
                  return (
                    <button
                      type="button"
                      key={servicio.id}
                      onClick={() => toggleServicio(servicio.id)}
                      className={`group inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs transition ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 text-blue-600"
                          : "border-gray-300 text-gray-500 hover:border-blue-300 hover:text-blue-600"
                      } ${isInactive ? "opacity-60" : ""}`}
                      title={isInactive ? "Servicio actualmente inactivo" : undefined}
                      aria-pressed={isSelected}
                    >
                      <FaCut aria-hidden="true" className="text-[10px]" />
                      <span className="font-semibold tracking-[0.18em]">{servicio.nombre}</span>
                      {typeof servicio.duracion === "number" ? (
                        <span className="text-[10px] uppercase tracking-[0.28em] text-gray-700">
                          {servicio.duracion}min
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.28em] text-gray-700">Foto (URL opcional)</span>
              <input
                type="url"
                value={form.fotoUrl}
                onChange={(event) => handleChange("fotoUrl", event.target.value)}
                placeholder="https://…"
                className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
              />
            </label>
            {form.fotoUrl ? (
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-blue-300 bg-white p-3 text-xs text-gray-700 shadow-md">
                <span className="uppercase tracking-[0.28em]">Preview</span>
                <img
                  src={form.fotoUrl}
                  alt="Vista previa"
                  onError={(event) => {
                    (event.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                  className="h-28 w-28 rounded-2xl object-cover shadow-[0_0_28px_rgba(184,147,94,0.25)]"
                />
              </div>
            ) : null}
          </div>

          {formErrors.general ? (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {formErrors.general}
            </div>
          ) : null}
        </form>
      </AdminModal>

      <AdminModal
        open={modalMode === "delete"}
        onClose={closeModal}
        title="Eliminar barbero"
        footer={
          <>
            <button
              type="button"
              onClick={closeModal}
              className="rounded-lg border border-gray-200 px-4 py-2 text-xs uppercase tracking-[0.28em] text-gray-700 transition hover:border-blue-500/50 hover:text-blue-600"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={mutationState === "loading"}
              className="rounded-lg bg-red-600 px-6 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {mutationState === "loading" ? "Eliminando…" : "Eliminar"}
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          ¿Confirma que desea eliminar a <strong className="text-gray-900">{selected?.nombre}</strong>? Esta acción despublica al barbero de todos los módulos y libera sus turnos asociados.
        </p>
        {formErrors.general ? (
          <div className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {formErrors.general}
          </div>
        ) : null}
      </AdminModal>
    </div>
  );
};

export default PeluquerosDashboard;
