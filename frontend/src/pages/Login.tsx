import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { authLogger } from "../helpers/logging";

const initialForm = {
  email: "",
  password: "",
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading, error, setError } = useAuth();
  const [formValues, setFormValues] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = useMemo(() => {
    const state = location.state as
      | { from?: { pathname?: string } }
      | undefined;
    return state?.from?.pathname ?? "/admin";
  }, [location.state]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTo]);

  useEffect(() => {
    return () => {
      setError(null);
    };
  }, [setError]);

  const handleChange = (event: FormEvent<HTMLInputElement>) => {
    const { name, value } = event.currentTarget;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formValues.email || !formValues.password) {
      setError("Por favor ingresa tu correo y contraseña.");
      return;
    }
    setIsSubmitting(true);
    try {
      await login({ email: formValues.email, password: formValues.password });
      // La navegación se manejará automáticamente por el useEffect cuando isAuthenticated cambie
    } catch (err) {
      authLogger.error("Error al iniciar sesión:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-[#0D0D0D] px-4 py-16 text-[#FAF8F3]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(10,25,41,0.35),_transparent_70%)]" />
      <div className="absolute -left-24 top-24 hidden h-64 w-64 rounded-full border border-[#0A1929]/40 lg:block" />
      <div className="absolute -right-20 bottom-24 hidden h-72 w-72 rounded-full border border-[#B8935E]/25 lg:block" />
      <div className="relative grid w-full max-w-5xl gap-12 rounded-[32px] border border-[#B8935E]/15 bg-[#111111]/85 p-10 shadow-[0_40px_120px_rgba(0,0,0,0.55)] backdrop-blur lg:grid-cols-[1.1fr_0.9fr]">
        <div className="hidden flex-col justify-between space-y-12 rounded-[28px] border border-[#B8935E]/10 bg-[#161616]/70 p-10 lg:flex">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-[#B8935E]/80">
              Sunsetz Barber Studio
            </p>
            <h1 className="mt-6 text-4xl leading-[1.2] tracking-[0.12em] text-[#FAF8F3]">
              Accede al backstage y orquesta la experiencia Sunsetz.
            </h1>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-[#FAF8F3]/75">
              Gestiona reservas, asigna rituales y mantén a tu equipo sincronizado. Seguridad reforzada con cookies HTTP-only, refresh tokens y protección CSRF automática.
            </p>
          </div>
          <div className="space-y-4 text-sm text-[#FAF8F3]/75">
            <p className="leading-relaxed">
              ¿Aún no tienes acceso? Contacta al administrador principal para habilitar tu usuario corporativo.
            </p>
            <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.32em] text-[#B8935E]/70">
              <span className="h-px flex-1 bg-[#B8935E]/30" />
              Sunsetz Admin Portal
              <span className="h-px flex-1 bg-[#B8935E]/30" />
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center rounded-[28px] border border-[#B8935E]/10 bg-[#151515]/85 p-10 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
          <p className="text-xs uppercase tracking-[0.32em] text-[#B8935E]/80">Acceso privado</p>
          <h2 className="mt-5 text-3xl tracking-[0.1em] text-[#FAF8F3]">
            Iniciar sesión
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#FAF8F3]/75">
            Usa tu correo corporativo y credenciales autorizadas.
          </p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-[11px] font-medium uppercase tracking-[0.3em] text-[#FAF8F3]/70"
              >
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={formValues.email}
                onInput={handleChange}
                className="w-full rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] px-4 py-3 text-sm text-[#FAF8F3] outline-none transition focus:border-[#B8935E] focus:ring-2 focus:ring-[#B8935E]/25"
                placeholder="admin@sunsetz.com"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-[11px] font-medium uppercase tracking-[0.3em] text-[#FAF8F3]/70"
              >
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formValues.password}
                onInput={handleChange}
                className="w-full rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] px-4 py-3 text-sm text-[#FAF8F3] outline-none transition focus:border-[#B8935E] focus:ring-2 focus:ring-[#B8935E]/25"
              />
            </div>

            {error ? (
              <div className="rounded-2xl border border-[#8B1A1A]/45 bg-[#8B1A1A]/15 px-4 py-3 text-sm text-[#F7D4D4]">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center rounded-2xl bg-[#B8935E] px-4 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-[#0D0D0D] shadow-[0_18px_48px_rgba(184,147,94,0.3)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Validando credenciales…"
                : isLoading
                ? "Sincronizando sesión…"
                : "Acceder al panel"}
            </button>
          </form>

          <div className="mt-10 text-center text-xs text-[#FAF8F3]/70">
            <p>
              <Link
                to="/"
                className="text-[#B8935E] transition hover:text-[#d3a96f]"
              >
                ← Regresar al sitio principal
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
