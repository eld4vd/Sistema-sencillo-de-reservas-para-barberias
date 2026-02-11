import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEdit, FaPlus, FaSearch, FaStar, FaTrash, FaCheckCircle, FaListAlt, FaMoneyBillWave } from "react-icons/fa";
import type { Servicio, CreateServicioDto } from "../../models/Servicio";
import { serviciosService } from "../../services/serviciosService";
import { fetchCsrfToken, getErrorMessage } from "../../services/api";
import AdminModal from "../../components/admin/ui/AdminModal";

type ModalMode = "create" | "edit" | "delete" | null;

type ServicioFormState = {
  nombre: string;
  descripcion: string;
  precio: string;
  duracion: string;
  activo: boolean;
};

type FormErrors = Partial<Record<keyof ServicioFormState | "general", string>>;

const defaultFormState: ServicioFormState = {
  nombre: "",
  descripcion: "",
  precio: "120",
  duracion: "60",
  activo: true,
};

const currencyFormatter = new Intl.NumberFormat("es-BO", {
  style: "currency",
  currency: "BOB",
  maximumFractionDigits: 2,
});

const ServiciosDashboard = () => {
  const [services, setServices] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selected, setSelected] = useState<Servicio | null>(null);
  const [form, setForm] = useState<ServicioFormState>(defaultFormState);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [mutationState, setMutationState] = useState<"idle" | "loading">("idle");
  const [flashMessage, setFlashMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await serviciosService.list();
      const ordered = [...response].sort((a, b) => a.nombre.localeCompare(b.nombre));
      setServices(ordered);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return services;
    const term = search.trim().toLowerCase();
    return services.filter((service) =>
      [service.nombre, service.descripcion]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term)),
    );
  }, [services, search]);

  const openModal = useCallback((mode: ModalMode, service?: Servicio) => {
    setModalMode(mode);
    setSelected(service ?? null);
    setFormErrors({});
    if (mode === "create") {
      setForm(defaultFormState);
    }
    if (mode === "edit" && service) {
      setForm({
        nombre: service.nombre,
        descripcion: service.descripcion ?? "",
        precio: service.precio?.toString() ?? "0",
        duracion: service.duracion?.toString() ?? "60",
        activo: service.activo,
      });
    }
  }, []);

  const closeModal = useCallback(() => {
    setModalMode(null);
    setSelected(null);
    setForm(defaultFormState);
    setFormErrors({});
    setMutationState("idle");
  }, []);

  const handleChange = useCallback(<K extends keyof ServicioFormState>(key: K, value: ServicioFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      delete next.general;
      return next;
    });
  }, []);

  const validate = (): FormErrors => {
    const errors: FormErrors = {};
    if (!form.nombre.trim()) errors.nombre = "Nombre del servicio requerido";
    const priceValue = Number(form.precio);
    if (Number.isNaN(priceValue) || priceValue <= 0) errors.precio = "Precio inválido";
    const durationValue = Number(form.duracion);
    if (Number.isNaN(durationValue) || durationValue <= 0) errors.duracion = "Duración inválida";
    return errors;
  };

  const toPayload = (data: ServicioFormState): CreateServicioDto => ({
    nombre: data.nombre.trim(),
    descripcion: data.descripcion.trim() || null,
    precio: Number(data.precio),
    duracion: Number(data.duracion),
    activo: data.activo,
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

      if (modalMode === "create") {
        await serviciosService.create(payload, csrfToken);
        setFlashMessage("Servicio creado con éxito");
      }

      if (modalMode === "edit" && selected) {
        await serviciosService.update(selected.id, payload, csrfToken);
        setFlashMessage("Servicio actualizado");
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
      await serviciosService.remove(selected.id, csrfToken);
      setFlashMessage("Servicio eliminado");
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

  // Consolidated: single pass for all service metrics
  const serviceStats = useMemo(() => {
    let activeCount = 0;
    let priceSum = 0;
    for (const s of services) {
      if (s.activo) activeCount += 1;
      priceSum += s.precio ?? 0;
    }
    return {
      total: services.length,
      active: activeCount,
      avgPrice: services.length > 0 ? priceSum / services.length : 0,
    };
  }, [services]);

  return (
    <div className="space-y-6">
      {flashMessage ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="rounded-2xl border border-gray-300 bg-white px-5 py-4 text-sm text-blue-600 shadow-lg"
        >
          {flashMessage}
        </motion.div>
      ) : null}

      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Catálogo de servicios
            </h2>
            <p className="mt-2 text-sm text-gray-700">
              Actualiza precios, duraciones y estados en un panel diseñado para decisiones rápidas.
            </p>
          </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/admin/peluqueros"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-xs uppercase tracking-[0.28em] text-gray-700 transition hover:border-blue-500 hover:text-blue-600"
              >
                Vincular barberos ↗
              </Link>
              <button
                type="button"
                onClick={() => openModal("create")}
                className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-5 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
              >
                <FaPlus aria-hidden="true" />
                Nuevo servicio
              </button>
            </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-300 bg-white p-5 text-sm text-gray-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="uppercase tracking-[0.32em] text-gray-500 text-[10px]">Servicios activos</p>
                <p className="mt-2 text-3xl font-semibold tabular-nums text-gray-900">
                  {serviceStats.active.toString().padStart(2, "0")}
                </p>
              </div>
              <FaCheckCircle aria-hidden="true" className="text-2xl text-emerald-400" />
            </div>
          </div>
          <div className="rounded-2xl border border-gray-300 bg-white p-5 text-sm text-gray-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="uppercase tracking-[0.32em] text-gray-500 text-[10px]">Total catálogo</p>
                <p className="mt-2 text-3xl font-semibold tabular-nums text-gray-900">
                  {serviceStats.total.toString().padStart(2, "0")}
                </p>
              </div>
              <FaListAlt aria-hidden="true" className="text-2xl text-amber-400" />
            </div>
          </div>
          <div className="rounded-2xl border border-gray-300 bg-white p-5 text-sm text-gray-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="uppercase tracking-[0.32em] text-gray-500 text-[10px]">Ticket promedio</p>
                <p className="mt-2 text-3xl font-semibold tabular-nums text-gray-900">
                  {currencyFormatter.format(serviceStats.avgPrice || 0)}
                </p>
              </div>
              <FaMoneyBillWave aria-hidden="true" className="text-2xl text-blue-600" />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-gray-300 bg-white p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1">
              <FaSearch aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="search"
                aria-label="Buscar servicios"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nombre o descripción"
                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left uppercase tracking-[0.24em] text-gray-500 text-[10px] border-b border-gray-300">
                <tr>
                  <th className="pb-3 pt-2">Servicio</th>
                  <th className="pb-3 pt-2">Duración</th>
                  <th className="pb-3 pt-2">Precio</th>
                  <th className="pb-3 pt-2">Estado</th>
                  <th className="pb-3 pt-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#151515] text-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-600">
                      Cargando servicios…
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-600">
                      Sin resultados que coincidan con la búsqueda.
                    </td>
                  </tr>
                ) : (
                  filtered.map((service) => (
                    <tr key={service.id} className="hover:bg-gray-50">
                      <td className="py-3">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                            <FaStar aria-hidden="true" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{service.nombre}</p>
                            {service.descripcion ? (
                              <p className="text-xs text-gray-600">{service.descripcion}</p>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 tabular-nums text-gray-600">{service.duracion} min</td>
                      <td className="py-3 tabular-nums text-gray-600">{currencyFormatter.format(service.precio ?? 0)}</td>
                      <td className="py-3 text-gray-600">
                        <span
                          className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.28em] ${
                            service.activo
                              ? "bg-blue-50 text-blue-600"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {service.activo ? "Activo" : "En pausa"}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openModal("edit", service)}
                            className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs uppercase tracking-[0.22em] text-blue-600 transition hover:bg-blue-50"
                          >
                            <FaEdit aria-hidden="true" /> Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => openModal("delete", service)}
                            className="inline-flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs uppercase tracking-[0.22em] text-red-400 transition hover:bg-red-500/15"
                          >
                            <FaTrash aria-hidden="true" /> Borrar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

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
        title={modalMode === "edit" ? "Editar servicio" : "Registrar nuevo servicio"}
        footer={
          <>
            <button
              type="button"
              onClick={closeModal}
              className="rounded-lg border border-gray-300 px-4 py-2 text-xs uppercase tracking-[0.28em] text-gray-700 transition hover:border-blue-500 hover:text-blue-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="servicio-form"
              disabled={mutationState === "loading"}
              className="rounded-lg bg-blue-600 px-6 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-[#0D0D0D] shadow-[0_16px_40px_rgba(184,147,94,0.35)] transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {mutationState === "loading" ? "Guardando…" : "Guardar cambios"}
            </button>
          </>
        }
      >
        <form id="servicio-form" onSubmit={handleSubmit} className="space-y-6 text-sm">
          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-[0.28em] text-gray-700">Nombre del servicio</span>
            <input
              type="text"
              value={form.nombre}
              onChange={(event) => handleChange("nombre", event.target.value)}
              className={`rounded-2xl border bg-white px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 ${
                formErrors.nombre ? "border-red-400/70" : "border-gray-300"
              }`}
              placeholder="Ej. Ritual Old School"
            />
            {formErrors.nombre ? <span className="text-xs text-red-300">{formErrors.nombre}</span> : null}
          </label>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.28em] text-gray-700">Precio (Bs.)</span>
              <input
                type="number"
                min="0"
                step="0.1"
                value={form.precio}
                onChange={(event) => handleChange("precio", event.target.value)}
                className={`rounded-2xl border bg-white px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 ${
                  formErrors.precio ? "border-red-400/70" : "border-gray-300"
                }`}
              />
              {formErrors.precio ? <span className="text-xs text-red-300">{formErrors.precio}</span> : null}
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.28em] text-gray-700">Duración (minutos)</span>
              <input
                type="number"
                min="10"
                step="5"
                value={form.duracion}
                onChange={(event) => handleChange("duracion", event.target.value)}
                className={`rounded-2xl border bg-white px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 ${
                  formErrors.duracion ? "border-red-400/70" : "border-gray-300"
                }`}
              />
              {formErrors.duracion ? <span className="text-xs text-red-300">{formErrors.duracion}</span> : null}
            </label>
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-[0.28em] text-gray-700">Descripción</span>
            <textarea
              value={form.descripcion}
              onChange={(event) => handleChange("descripcion", event.target.value)}
              rows={4}
              placeholder="Detalle la experiencia, rituales incluidos o beneficios extras"
              className="resize-none rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
            />
          </label>

          <label className="flex items-center gap-3 text-xs uppercase tracking-[0.28em] text-gray-700">
            <input
              type="checkbox"
              checked={form.activo}
              onChange={(event) => handleChange("activo", event.target.checked)}
              className="h-4 w-4 rounded border-gray-300 bg-white text-blue-600 focus:ring-blue-500"
            />
            Servicio activo en reservas
          </label>

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
        title="Eliminar servicio"
        footer={
          <>
            <button
              type="button"
              onClick={closeModal}
              className="rounded-lg border border-gray-300 px-4 py-2 text-xs uppercase tracking-[0.28em] text-gray-700 transition hover:border-blue-500 hover:text-blue-600"
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
        <p className="text-sm text-gray-700">
          ¿Confirma que desea eliminar <strong className="text-gray-900">{selected?.nombre}</strong>? Esta acción lo ocultará del motor de reservas y libera su relación con barberos.
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

export default ServiciosDashboard;
