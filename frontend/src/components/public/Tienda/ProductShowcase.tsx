import { motion } from "framer-motion";
import { useEffect, useState, useCallback, memo, useMemo } from "react";
import { FaSearch, FaBox, FaFilter } from "react-icons/fa";
import { productosService } from "../../../services/productosService";
import type { Producto } from "../../../models/Producto";
import { productLogger } from "../../../helpers/logging";

// ✅ Componente memoizado para evitar re-renders innecesarios
const ProductCard = memo(({ producto, index }: { producto: Producto; index: number }) => {
  // rendering-conditional-render: explicit ternaries for stock badges
  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return (
        <span className="bg-red-600 text-white text-xs font-medium px-2.5 py-1 rounded-full">
          Agotado
        </span>
      );
    }
    if (stock < 5) {
      return (
        <span className="bg-orange-600 text-white text-xs font-medium px-2.5 py-1 rounded-full">
          Últimas {stock} unidades
        </span>
      );
    }
    if (stock < 10) {
      return (
        <span className="bg-yellow-600 text-white text-xs font-medium px-2.5 py-1 rounded-full">
          Stock limitado
        </span>
      );
    }
    return null;
  };

  return (
    <motion.div
      key={producto.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-800/70 bg-[#111111] transition-[border-color,background-color,box-shadow] hover:border-[#B8935E]/40 hover:bg-[#181818] hover:shadow-xl"
    >
      {/* Product Image - Aspect ratio más cuadrado */}
      <div className="relative aspect-square bg-[#0F0F0F] overflow-hidden">
        {producto.imagenUrl ? (
          <img
            src={producto.imagenUrl}
            alt={`${producto.nombre}${producto.categoria ? ` - ${producto.categoria}` : ''}`}
            loading={index < 4 ? "eager" : "lazy"}
            fetchPriority={index < 4 ? "high" : "auto"}
            width="400"
            height="400"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FaBox className="text-5xl text-gray-700" aria-hidden="true" />
          </div>
        )}
        
        {/* Stock Badge - Top Right */}
        <div className="absolute top-3 right-3">
          {getStockBadge(producto.stock)}
        </div>
      </div>

      {/* Product Info - Compacto */}
      <div className="flex flex-1 flex-col p-4">
        {/* Category + Name en línea */}
        <div className="mb-2">
          {producto.categoria ? (
            <span className="text-[10px] uppercase tracking-wider text-gray-500">
              {producto.categoria}
            </span>
          ) : null}
          <h3 className="mt-1 text-base font-medium text-[#FAF8F3] line-clamp-1">
            {producto.nombre}
          </h3>
        </div>
        
        {/* Description - Solo 1 línea */}
        <p className="text-xs text-gray-400 line-clamp-1 mb-3">
          {producto.descripcion || "Producto de calidad premium"}
        </p>
        
        {/* Price and Stock - En una línea */}
        <div className="mt-auto flex items-center justify-between border-t border-gray-800/70 pt-3">
          <div className="text-xl font-bold text-[#B8935E]">
            Bs. {Number(producto.precio).toFixed(2)}
          </div>
          <div className="text-[10px] text-gray-400">
            {producto.stock > 0 ? `${producto.stock} disp.` : 'Agotado'}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

ProductCard.displayName = 'ProductCard';

const ProductShowcase = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState<string>("Todos");

  // ✅ rerender-derived-state-no-effect: derive categorias during render, no state needed
  const categorias = useMemo(() => {
    const dynamicCategories = Array.from(
      new Set(
        productos
          .map((producto) => producto.categoria)
          .filter((categoria): categoria is string => Boolean(categoria))
      )
    );
    return ["Todos", ...dynamicCategories];
  }, [productos]);

  // ✅ rerender-derived-state-no-effect: derive filtered list during render, NOT in effect+state
  // This was previously stored in a separate useState + synced via useEffect, causing extra renders
  const filteredProductos = useMemo(() => {
    // js-early-exit: reset category if it no longer exists
    const effectiveCategoria =
      selectedCategoria !== "Todos" && !categorias.includes(selectedCategoria)
        ? "Todos"
        : selectedCategoria;

    let filtered = productos;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      // js-combine-iterations: single filter pass for both fields
      filtered = filtered.filter((producto) =>
        producto.nombre.toLowerCase().includes(term) ||
        producto.descripcion?.toLowerCase().includes(term)
      );
    }

    if (effectiveCategoria !== "Todos") {
      filtered = filtered.filter(
        (producto) =>
          producto.categoria?.toLowerCase() === effectiveCategoria.toLowerCase()
      );
    }

    return filtered;
  }, [productos, searchTerm, selectedCategoria, categorias]);

  useEffect(() => {
    loadProductos();
  }, []);

  // Auto-refresh inteligente para actualizar stock
  useEffect(() => {
    const REFRESH_INTERVAL = 3 * 60 * 1000; // 3 minutos

    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadProductosSilent();
      }
    }, REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, []);

  // rerender-functional-setstate: stable callbacks
  const loadProductosSilent = useCallback(async () => {
    try {
      const data = await productosService.listActive();
      setProductos(data);
      setError(null);
    } catch (err) {
      productLogger.error("Error al actualizar productos:", err);
    }
  }, []);

  const loadProductos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productosService.listActive();
      setProductos(data);
    } catch (err) {
      productLogger.error("Error al cargar productos:", err);
      setError("No pudimos actualizar el catálogo. Intenta nuevamente en unos segundos.");
    } finally {
      setLoading(false);
    }
  }, []);

  // rerender-move-effect-to-event: search/filter handlers as event handlers
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleCategoriaChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategoria(e.target.value);
  }, []);

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header compacto con título y controles en una línea */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Título compacto con badge inline */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-semibold text-[#FAF8F3] md:text-3xl">
                Productos disponibles
              </h1>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#B8935E]/40 bg-[#1a1a1a] px-3 py-1 text-[10px] uppercase tracking-wide text-[#B8935E]">
                Stock actualizado
              </span>
            </div>
            <p className="text-sm text-gray-400 max-w-xl">
              Los mismos productos premium que usamos en cada servicio
            </p>
          </div>

          {/* Controles de búsqueda y filtro */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
            <div className="relative w-full sm:w-64 lg:w-72">
              <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400" aria-hidden="true" />
              <input
                type="text"
                placeholder="Buscar productos…"
                aria-label="Buscar productos"
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full rounded-lg border border-gray-700 bg-[#161616] py-2.5 pl-10 pr-4 text-sm text-[#FAF8F3] outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#B8935E]"
              />
            </div>
            <div className="flex items-center gap-2">
              <FaFilter className="text-sm text-gray-400" aria-hidden="true" />
              <select
                value={selectedCategoria}
                aria-label="Filtrar por categoría"
                onChange={handleCategoriaChange}
                className="cursor-pointer rounded-lg border border-gray-700 bg-[#161616] px-4 py-2.5 text-sm text-[#FAF8F3] outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#B8935E]"
              >
                {categorias.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div role="alert" className="mb-6 rounded-lg border border-red-600/40 bg-red-600/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* Resultados count */}
        {!loading && (
          <div className="mb-4 text-sm text-gray-400">
            {filteredProductos.length} {filteredProductos.length === 1 ? 'producto' : 'productos'} encontrado{filteredProductos.length === 1 ? '' : 's'}
          </div>
        )}

        {/* Products Grid - Estilo Amazon */}
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#B8935E]"></div>
          </div>
        ) : filteredProductos.length === 0 ? (
          <div className="rounded-lg border border-gray-800/70 bg-[#161616] py-32 text-center">
            <FaBox className="mx-auto mb-6 text-7xl text-gray-600" aria-hidden="true" />
            <h3 className="mb-2 text-2xl font-semibold text-gray-400">
              No se encontraron productos
            </h3>
            <p className="text-gray-500">
              Intenta ajustar los filtros o búsqueda
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredProductos.map((producto, index) => (
              <ProductCard key={producto.id} producto={producto} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductShowcase;
