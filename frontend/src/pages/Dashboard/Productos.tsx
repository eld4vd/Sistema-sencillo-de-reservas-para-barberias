import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FaBox,
  FaEdit,
  FaPlus,
  FaSearch,
  FaSyncAlt,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaCheckCircle,
  FaMoneyBillWave,
  FaExclamationTriangle,
} from "react-icons/fa";
import type { Producto } from "../../models/Producto";
import { productosService } from "../../services/productosService";
import { fetchCsrfToken, getErrorMessage } from "../../services/api";
import AdminModal from "../../components/admin/ui/AdminModal";

const currencyFormatter = new Intl.NumberFormat("es-BO", {
  style: "currency",
  currency: "BOB",
  maximumFractionDigits: 2,
});

const ProductosDashboard = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [flashMessage, setFlashMessage] = useState<string | null>(null);
  
  // Estados del modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    nombre: "",
    precio: 0,
    stock: 0,
    descripcion: "",
    imagenUrl: "",
    categoria: "",
    activo: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formMutation, setFormMutation] = useState<"idle" | "loading">("idle");

  // Estados de confirmación de eliminación
  const [deleteTarget, setDeleteTarget] = useState<Producto | null>(null);
  const [deleteMutation, setDeleteMutation] = useState<"idle" | "loading">("idle");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await productosService.list();
      setProductos(response);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!flashMessage) return;
    const timeout = window.setTimeout(() => setFlashMessage(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [flashMessage]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return productos;
    return productos.filter((producto) =>
      producto.nombre.toLowerCase().includes(term) ||
      producto.categoria?.toLowerCase().includes(term) ||
      producto.descripcion?.toLowerCase().includes(term)
    );
  }, [productos, search]);

  // Consolidated: single pass for all product metrics
  const productStats = useMemo(() => {
    let activos = 0;
    let valorInventario = 0;
    let stockBajo = 0;
    for (const p of productos) {
      if (p.activo) {
        activos += 1;
        if (p.stock < 5) stockBajo += 1;
      }
      valorInventario += p.precio * p.stock;
    }
    return { total: productos.length, activos, valorInventario, stockBajo };
  }, [productos]);

  const openCreateModal = useCallback(() => {
    setModalMode("create");
    setSelectedProducto(null);
    setFormData({
      nombre: "",
      precio: 0,
      stock: 0,
      descripcion: "",
      imagenUrl: "",
      categoria: "",
      activo: true,
    });
    setFormErrors({});
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((producto: Producto) => {
    setModalMode("edit");
    setSelectedProducto(producto);
    setFormData({
      nombre: producto.nombre,
      precio: producto.precio,
      stock: producto.stock,
      descripcion: producto.descripcion || "",
      imagenUrl: producto.imagenUrl || "",
      categoria: producto.categoria || "",
      activo: producto.activo,
    });
    setFormErrors({});
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedProducto(null);
    setFormData({
      nombre: "",
      precio: 0,
      stock: 0,
      descripcion: "",
      imagenUrl: "",
      categoria: "",
      activo: true,
    });
    setFormErrors({});
    setFormMutation("idle");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMutation("loading");
    setFormErrors({});

    try {
      const { csrfToken } = await fetchCsrfToken();
      
      if (modalMode === "create") {
        await productosService.create(formData, csrfToken);
        setFlashMessage("Producto creado correctamente");
      } else if (selectedProducto) {
        await productosService.update(selectedProducto.id, formData, csrfToken);
        setFlashMessage("Producto actualizado correctamente");
      }
      
      await loadData();
      closeModal();
    } catch (err) {
      setFormErrors({ general: getErrorMessage(err) });
      setFormMutation("idle");
    }
  };

  const openDeleteModal = useCallback((producto: Producto) => {
    setDeleteTarget(producto);
    setDeleteMutation("idle");
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteTarget(null);
    setDeleteMutation("idle");
  }, []);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteMutation("loading");
    
    try {
      const { csrfToken } = await fetchCsrfToken();
      await productosService.delete(deleteTarget.id, csrfToken);
      setFlashMessage(`Producto "${deleteTarget.nombre}" eliminado`);
      await loadData();
      closeDeleteModal();
    } catch (err) {
      setFlashMessage(getErrorMessage(err));
      setDeleteMutation("idle");
    }
  };

  const handleToggleActivo = async (producto: Producto) => {
    try {
      const { csrfToken } = await fetchCsrfToken();
      await productosService.update(producto.id, { activo: !producto.activo }, csrfToken);
      setFlashMessage(`Producto ${!producto.activo ? "activado" : "desactivado"}`);
      await loadData();
    } catch (err) {
      setFlashMessage(getErrorMessage(err));
    }
  };

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
              Gestión de productos
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Administra el inventario de productos disponibles en la tienda
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-xs uppercase tracking-[0.28em] text-gray-600 transition hover:border-blue-500/50 hover:text-blue-600 disabled:opacity-60"
            >
              <FaSyncAlt aria-hidden="true" className={loading ? "animate-spin" : undefined} /> {loading ? "Actualizando…" : "Actualizar"}
            </button>
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-xs uppercase tracking-[0.28em] text-blue-600 transition hover:bg-blue-50"
            >
              <FaPlus aria-hidden="true" /> Nuevo producto
            </button>
          </div>
        </div>

        {/* Métricas */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-600">
            <div className="flex justify-between items-start">
              <div>
                <p className="uppercase tracking-[0.32em] text-gray-600 text-[10px]">Total productos</p>
                <p className="mt-2 text-3xl font-semibold tabular-nums text-gray-900">
                  {productStats.total.toString().padStart(2, "0")}
                </p>
                <p className="mt-3 text-xs text-gray-600">
                  En catálogo
                </p>
              </div>
              <FaBox aria-hidden="true" className="text-2xl text-blue-600" />
            </div>
          </div>
          
          <div className="rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-600">
            <div className="flex justify-between items-start">
              <div>
                <p className="uppercase tracking-[0.32em] text-gray-600 text-[10px]">Activos</p>
                <p className="mt-2 text-3xl font-semibold tabular-nums text-gray-900">
                  {productStats.activos.toString().padStart(2, "0")}
                </p>
                <p className="mt-3 text-xs text-emerald-400">
                  Disponibles
                </p>
              </div>
              <FaCheckCircle aria-hidden="true" className="text-2xl text-emerald-400" />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-600">
            <div className="flex justify-between items-start">
              <div>
                <p className="uppercase tracking-[0.32em] text-gray-600 text-[10px]">Valor inventario</p>
                <p className="mt-2 text-2xl font-semibold tabular-nums text-gray-900">
                  {currencyFormatter.format(productStats.valorInventario)}
                </p>
                <p className="mt-3 text-xs text-gray-600">
                  Total en stock
                </p>
              </div>
              <FaMoneyBillWave aria-hidden="true" className="text-2xl text-amber-400" />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-600">
            <div className="flex justify-between items-start">
              <div>
                <p className="uppercase tracking-[0.32em] text-gray-600 text-[10px]">Stock bajo</p>
                <p className="mt-2 text-3xl font-semibold tabular-nums text-red-400">
                  {productStats.stockBajo.toString().padStart(2, "0")}
                </p>
                <p className="mt-3 text-xs text-red-400/70">
                  Menos de 5 unidades
                </p>
              </div>
              <FaExclamationTriangle aria-hidden="true" className="text-2xl text-red-400" />
            </div>
          </div>
        </div>

        {/* Buscador */}
        <div className="flex items-center gap-3">
          <div className="relative w-full max-w-md">
            <FaSearch aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              type="search"
              aria-label="Buscar productos"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, categoría o descripción"
              className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
            />
          </div>
          <div className="rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-xs uppercase tracking-[0.28em] text-blue-600">
            <span className="font-semibold tabular-nums">{filtered.length}</span> productos
          </div>
        </div>

        {/* Tabla de productos */}
        <div className="overflow-x-auto border border-gray-200 bg-white rounded-2xl">
          <table className="min-w-full text-sm">
            <thead className="text-left uppercase tracking-[0.24em] text-gray-600 text-[10px] border-b border-gray-200">
              <tr>
                <th className="px-5 pb-3 pt-2">Producto</th>
                <th className="px-5 pb-3 pt-2">Categoría</th>
                <th className="px-5 pb-3 pt-2">Precio</th>
                <th className="px-5 pb-3 pt-2">Stock</th>
                <th className="px-5 pb-3 pt-2">Estado</th>
                <th className="px-5 pb-3 pt-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#151515] text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-600">
                    Cargando productos…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-600">
                    No se encontraron productos que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filtered.map((producto) => (
                  <tr key={producto.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {producto.imagenUrl ? (
                          <img
                            src={producto.imagenUrl}
                            alt={producto.nombre}
                            className="h-12 w-12 rounded-lg border border-gray-200 object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-gray-200 bg-white text-blue-600">
                            <FaBox aria-hidden="true" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">{producto.nombre}</p>
                          {producto.descripcion ? (
                            <p className="text-xs text-gray-600 line-clamp-1">{producto.descripcion}</p>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {producto.categoria ? (
                        <span className="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs uppercase tracking-[0.28em] text-blue-600">
                          {producto.categoria}
                        </span>
                      ) : (
                        <span className="text-gray-900/30">Sin categoría</span>
                      )}
                    </td>
                    <td className="px-5 py-4 font-semibold tabular-nums text-gray-900">
                      {currencyFormatter.format(producto.precio)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`font-semibold tabular-nums ${
                          producto.stock < 5 ? "text-red-300" : producto.stock < 10 ? "text-yellow-300" : "text-emerald-300"
                        }`}
                      >
                        {producto.stock} unidades
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => handleToggleActivo(producto)}
                        className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1 text-xs uppercase tracking-[0.28em] transition ${
                          producto.activo
                            ? "border-emerald-400/35 bg-emerald-500/12 text-emerald-300 hover:bg-emerald-500/20"
                            : "border-red-400/35 bg-red-500/12 text-red-300 hover:bg-red-500/20"
                        }`}
                      >
                        {producto.activo ? <FaToggleOn aria-hidden="true" /> : <FaToggleOff aria-hidden="true" />}
                        {producto.activo ? "Activo" : "Inactivo"}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(producto)}
                          className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs uppercase tracking-[0.22em] text-blue-600 transition hover:bg-blue-50"
                        >
                          <FaEdit aria-hidden="true" /> Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteModal(producto)}
                          className="inline-flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs uppercase tracking-[0.22em] text-red-400 transition hover:bg-red-500/15"
                        >
                          <FaTrash aria-hidden="true" /> Eliminar
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

      {/* Modal Crear/Editar */}
      <AdminModal
        open={isModalOpen}
        onClose={closeModal}
        title={modalMode === "create" ? "Crear producto" : "Editar producto"}
        size="lg"
        footer={
          <>
            <button
              type="button"
              onClick={closeModal}
              disabled={formMutation === "loading"}
              className="rounded-lg border border-gray-200 px-4 py-2 text-xs uppercase tracking-[0.28em] text-gray-700 transition hover:border-blue-500/50 hover:text-blue-600 disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="producto-form"
              disabled={formMutation === "loading"}
              className="rounded-lg bg-blue-600 px-6 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-[#0D0D0D] shadow-[0_16px_40px_rgba(184,147,94,0.35)] transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {formMutation === "loading" ? "Guardando…" : modalMode === "create" ? "Crear producto" : "Actualizar"}
            </button>
          </>
        }
      >
        <form id="producto-form" onSubmit={handleSubmit} className="space-y-5 text-sm">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.28em] text-gray-700">Nombre *</span>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
                className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
                placeholder="Gel Ultra Strong"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.28em] text-gray-700">Categoría</span>
              <input
                type="text"
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
                placeholder="Gel, Pomada, Cera…"
              />
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.28em] text-gray-700">Precio (Bs) *</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.precio}
                onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) })}
                required
                className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.28em] text-gray-700">Stock *</span>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                required
                className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
              />
            </label>
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-[0.28em] text-gray-700">URL de imagen</span>
            <input
              type="url"
              value={formData.imagenUrl}
              onChange={(e) => setFormData({ ...formData, imagenUrl: e.target.value })}
              className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
              placeholder="https://…"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-[0.28em] text-gray-700">Descripción</span>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              rows={3}
              className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
              placeholder="Descripción del producto…"
            />
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.activo}
              onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
              className="h-5 w-5 rounded border-gray-300 bg-white text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-900">Producto activo (visible en la tienda)</span>
          </label>

          {formErrors.general ? (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {formErrors.general}
            </div>
          ) : null}
        </form>
      </AdminModal>

      {/* Modal Confirmar eliminación */}
      <AdminModal
        open={Boolean(deleteTarget)}
        onClose={closeDeleteModal}
        title="Confirmar eliminación"
        size="md"
        footer={
          <>
            <button
              type="button"
              onClick={closeDeleteModal}
              disabled={deleteMutation === "loading"}
              className="rounded-lg border border-gray-200 px-4 py-2 text-xs uppercase tracking-[0.28em] text-gray-700 transition hover:border-blue-500/50 hover:text-blue-600 disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={deleteMutation === "loading"}
              className="rounded-lg bg-red-500 px-6 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-white shadow-[0_16px_40px_rgba(239,68,68,0.35)] transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleteMutation === "loading" ? "Eliminando…" : "Sí, eliminar"}
            </button>
          </>
        }
      >
        {deleteTarget && (
          <div className="space-y-4 text-sm">
            <p className="text-gray-900">
              ¿Estás seguro de eliminar el producto <strong>"{deleteTarget.nombre}"</strong>?
            </p>
            <p className="text-gray-500">Esta acción no se puede deshacer.</p>
          </div>
        )}
      </AdminModal>
    </div>
  );
};

export default ProductosDashboard;
