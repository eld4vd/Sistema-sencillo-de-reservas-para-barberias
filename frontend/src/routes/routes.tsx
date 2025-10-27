import { Suspense, lazy, useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "../components/public/Layout";
import ProtectedRoute from "../components/common/ProtectedRoute";

const Home = lazy(() => import("../pages/Home"));
const Reservas = lazy(() => import("../pages/Reservas"));
const ReservaExperiencia = lazy(() => import("../pages/ReservaExperiencia"));
const Tienda = lazy(() => import("../pages/Tienda"));
const SobreNosotros = lazy(() => import("../pages/SobreNosotros"));
const Contacto = lazy(() => import("../pages/Contacto"));
const ErrorPage = lazy(() => import("../pages/Error"));
const Login = lazy(() => import("../pages/Login"));
const AdminLayout = lazy(() => import("../components/admin/AdminLayout"));
const DashboardHome = lazy(() => import("../pages/Dashboard"));
const DashboardReservas = lazy(() => import("../pages/Dashboard/Reservas"));
const DashboardReservasCompletadas = lazy(() => import("../pages/Dashboard/ReservasCompletadas"));
const DashboardServicios = lazy(() => import("../pages/Dashboard/Servicios"));
const DashboardPeluqueros = lazy(() => import("../pages/Dashboard/Peluqueros"));
const DashboardPagos = lazy(() => import("../pages/Dashboard/Pagos"));
const DashboardProductos = lazy(() => import("../pages/Dashboard/Productos"));

const SuspenseFallback = () => {
  const [allowFallback, setAllowFallback] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      setAllowFallback(true);
      return;
    }

    if (sessionStorage.getItem("sunsetzSplashSeen")) {
      setAllowFallback(true);
    }
  }, []);

  if (!allowFallback) {
    return <div className="min-h-screen bg-[#070707]" />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-sm text-gray-400">
      Cargando experiencia Sunsetz…
    </div>
  );
};

const MyRoutes = () => {
  return (
    <Suspense fallback={<SuspenseFallback />}>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="home" element={<Home />} />
          <Route path="inicio" element={<Navigate to="/home" replace />} />
          <Route path="reservas" element={<Reservas />} />
          <Route path="tienda" element={<Tienda />} />
          <Route path="sobre-nosotros" element={<SobreNosotros />} />
          <Route path="contacto" element={<Contacto />} />
        </Route>

        <Route path="/reservar" element={<ReservaExperiencia />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="reservas" element={<DashboardReservas />} />
          <Route path="reservas/completadas" element={<DashboardReservasCompletadas />} />
          <Route path="servicios" element={<DashboardServicios />} />
          <Route path="peluqueros" element={<DashboardPeluqueros />} />
          <Route path="pagos" element={<DashboardPagos />} />
          <Route path="productos" element={<DashboardProductos />} />
        </Route>
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </Suspense>
  );
};

export default MyRoutes;
