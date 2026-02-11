import { Outlet, NavLink, Link } from "react-router-dom";
import { useState, useCallback } from "react";
import { MotionConfig } from "framer-motion";
import { 
  HiBars3, 
  HiXMark, 
  HiHome, 
  HiCalendarDays, 
  HiCheckCircle, 
  HiScissors, 
  HiUsers, 
  HiCube, 
  HiBanknotes 
} from "react-icons/hi2";
import { useAuth } from "../../hooks/useAuth";
import NotificationBadge from "./NotificationBadge";
import ToastNotification from "./ToastNotification";
import NotificationPermissionRequest from "./NotificationPermissionRequest";

// Items de navegación con iconos Heroicons v2 (más modernos y ligeros)
const navItems = [
  { to: ".", label: "Panel", icon: HiHome, end: true },
  { to: "reservas", label: "Reservas", icon: HiCalendarDays, end: false },
  { to: "reservas/completadas", label: "Completadas", icon: HiCheckCircle, end: false },
  { to: "servicios", label: "Servicios", icon: HiScissors, end: false },
  { to: "peluqueros", label: "Peluqueros", icon: HiUsers, end: false },
  { to: "productos", label: "Productos", icon: HiCube, end: false },
  { to: "pagos", label: "Pagos", icon: HiBanknotes, end: false },
];

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 flex items-center gap-3 ${
    isActive
      ? "bg-blue-50 text-blue-700 font-semibold"
      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
  }`;

const AdminLayout = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleLogout = useCallback(async () => {
    try {
      setIsSigningOut(true);
      await logout();
    } finally {
      setIsSigningOut(false);
    }
  }, [logout]);

  return (
    <MotionConfig reducedMotion="user">
    <div className="admin-dashboard flex min-h-screen w-full bg-gray-50 text-gray-900">
      {/* Sidebar con transición suave de ancho */}
      <aside 
        className={`
          hidden lg:flex flex-col border-r border-gray-200 bg-white 
          sticky top-0 h-screen overflow-hidden shadow-sm
          transition-[width] duration-300 ease-in-out
          ${isSidebarOpen ? 'w-64' : 'w-20'}
        `}
      >
        {/* Header del sidebar */}
        <div className="flex-shrink-0 border-b border-gray-200 py-5 overflow-hidden flex items-center justify-center">
          {isSidebarOpen ? (
            <div className="px-6 w-full transition-opacity duration-300">
              <p className="text-xs font-medium uppercase tracking-wider text-blue-600 whitespace-nowrap">
                Sunsetz Studio
              </p>
              <h1 className="mt-2 text-xl font-semibold text-gray-900 whitespace-nowrap">
                Admin Portal
              </h1>
            </div>
          ) : (
            <div className="transition-opacity duration-300">
              <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                S
              </div>
            </div>
          )}
        </div>

        {/* Navegación con iconos */}
        <nav className="flex flex-col gap-1 px-3 py-4 overflow-y-auto flex-1">
          {navItems.map((item) => (
            <NavLink 
              key={item.to} 
              to={item.to} 
              end={item.end} 
              className={navLinkClass}
              title={!isSidebarOpen ? item.label : undefined}
            >
              <item.icon className="flex-shrink-0 text-lg" aria-hidden="true" />
              <span 
                className={`
                  whitespace-nowrap transition-all duration-300
                  ${isSidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}
                `}
              >
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* Footer tip (solo visible cuando está expandido) */}
        {isSidebarOpen ? (
          <div className="mt-auto border-t border-gray-200 p-4 transition-opacity duration-300">
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Pro tip</p>
              <p className="mt-2 text-xs leading-relaxed text-gray-600">
                Integra métricas clave para monitorear reservas en tiempo real.
              </p>
            </div>
          </div>
        ) : null}
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 flex-shrink-0 items-center justify-between gap-4 border-b border-gray-200 bg-white px-6 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-sm text-gray-600 transition-colors duration-200 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50"
              aria-label={isSidebarOpen ? "Ocultar menú lateral" : "Mostrar menú lateral"}
            >
              {isSidebarOpen ? <HiXMark className="h-5 w-5" /> : <HiBars3 className="h-5 w-5" />}
            </button>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-blue-600">Panel de control</span>
              <span className="text-sm font-semibold text-gray-900">
                {user?.nombre ?? "Administrador"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBadge />
            {isAuthenticated ? (
              <Link
                to="/"
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-50 hover:border-gray-400"
              >
                Sitio Público
              </Link>
            ) : null}
            <button
              type="button"
              onClick={handleLogout}
              disabled={isSigningOut}
              className="rounded-lg border border-blue-300 bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSigningOut ? "Cerrando…" : "Cerrar Sesión"}
            </button>
          </div>
        </header>
        <main className="relative flex-1 overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
        <ToastNotification />
        <NotificationPermissionRequest />
      </div>
    </div>
    </MotionConfig>
  );
};

export default AdminLayout;
