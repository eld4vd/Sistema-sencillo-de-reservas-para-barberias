// Utilidades para prefetch de rutas (code-splitting con Vite).
// Invocar estas funciones adelanta la descarga del chunk correspondiente.

type PrefetchFn = () => Promise<unknown>;

// Mapa simple de rutas públicas a sus imports dinámicos.
const prefetchMap: Record<string, PrefetchFn> = {
  "/": () => import("../../pages/Home"),
  "/home": () => import("../../pages/Home"),
  "/inicio": () => import("../../pages/Home"),
  "/reservas": () => import("../../pages/Reservas"),
  "/reservar": () => import("../../pages/ReservaExperiencia"),
  "/tienda": () => import("../../pages/Tienda"),
  "/sobre-nosotros": () => import("../../pages/SobreNosotros"),
  "/contacto": () => import("../../pages/Contacto"),
};

let inFlight: Partial<Record<string, Promise<unknown>>> = {};

export function prefetchByPath(path: string): void {
  const key = path.toLowerCase();
  const fn = prefetchMap[key];
  if (!fn) return;
  if (inFlight[key]) return; // evita duplicados
  inFlight[key] = fn().finally(() => {
    // mantenemos la promesa resuelta en memoria simple (no la limpiamos)
  });
}

export function prefetchMany(paths: string[]): void {
  paths.forEach(prefetchByPath);
}

// Precarga de la zona de administración: layout y páginas principales.
export function preloadAdminArea(): void {
  const tasks: Array<Promise<unknown>> = [
    import("../../components/admin/AdminLayout"),
    import("../../pages/Dashboard"),
    import("../../pages/Dashboard/Reservas"),
    import("../../pages/Dashboard/ReservasCompletadas"),
    import("../../pages/Dashboard/Servicios"),
    import("../../pages/Dashboard/Peluqueros"),
    import("../../pages/Dashboard/Pagos"),
    import("../../pages/Dashboard/Productos"),
  ];

  // No esperamos a que terminen; dejamos que el navegador descargue en segundo plano.
  void Promise.allSettled(tasks);
}
