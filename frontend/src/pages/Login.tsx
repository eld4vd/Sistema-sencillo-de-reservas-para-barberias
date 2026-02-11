import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { authLogger } from "../helpers/logging";

// ═══════════════════════════════════════════════════════════════
// Design Token System - Interface Architecture
// Following interface-design skill principles
// ═══════════════════════════════════════════════════════════════

const tokens = {
  // Foreground hierarchy (text)
  foregroundPrimary: 'rgba(250, 248, 243, 0.98)',
  foregroundSecondary: 'rgba(250, 248, 243, 0.72)',
  foregroundTertiary: 'rgba(250, 248, 243, 0.56)',
  foregroundMuted: 'rgba(250, 248, 243, 0.42)',
  
  // Background surfaces - subtle elevation (Level 0-4)
  backgroundBase: '#0D0D0D',           // Level 0: Canvas
  backgroundElevated: 'rgba(255, 255, 255, 0.03)', // Level 1: Panels
  backgroundRaised: 'rgba(255, 255, 255, 0.045)',  // Level 2: Cards
  backgroundOverlay: 'rgba(255, 255, 255, 0.05)',  // Level 3: Overlays
  
  // Borders - subtlety principle (0.05-0.12 alpha)
  borderSubtle: 'rgba(255, 255, 255, 0.06)',
  borderDefault: 'rgba(255, 255, 255, 0.09)',
  borderStrong: 'rgba(255, 255, 255, 0.12)',
  
  // Brand identity
  brandPrimary: '#B8935E',
  brandSubtle: 'rgba(184, 147, 94, 0.10)',
  brandBorder: 'rgba(184, 147, 94, 0.15)',
  brandShadow: 'rgba(184, 147, 94, 0.30)',
  
  // Dedicated control tokens (inputs are NOT surfaces)
  controlBackground: 'rgba(255, 255, 255, 0.04)',
  controlBorder: 'rgba(255, 255, 255, 0.08)',
  controlBorderHover: 'rgba(255, 255, 255, 0.12)',
  controlBorderFocus: '#B8935E',
  
  // Semantic
  semanticDestructive: '#EF4444',
  semanticDestructiveBorder: 'rgba(139, 26, 26, 0.45)',
  semanticDestructiveBackground: 'rgba(139, 26, 26, 0.15)',
  semanticDestructiveText: '#F7D4D4',
} as const;

// Spacing system - base 4px
const space = {
  xs: '8px',   // 2x
  sm: '12px',  // 3x
  md: '16px',  // 4x
  lg: '20px',  // 5x
  xl: '24px',  // 6x
  '2xl': '32px',  // 8x
  '3xl': '40px',  // 10x
  '4xl': '48px',  // 12x
  '5xl': '60px',  // 15x
} as const;

// Border radius scale
const radius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '28px',
  '3xl': '32px',
} as const;

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
    <div 
      className="relative flex min-h-screen w-full items-center justify-center px-4 py-16"
      style={{ 
        backgroundColor: tokens.backgroundBase,
        color: tokens.foregroundPrimary,
      }}
    >
      {/* Ambient gradients */}
      <div 
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at top, rgba(10, 25, 41, 0.35), transparent 70%)',
        }}
      />
      
      {/* Decorative circles - subtle presence */}
      <div 
        aria-hidden="true"
        className="absolute -left-24 top-24 hidden h-64 w-64 rounded-full lg:block"
        style={{
          border: `0.5px solid ${tokens.borderSubtle}`,
        }}
      />
      <div 
        aria-hidden="true"
        className="absolute -right-20 bottom-24 hidden h-72 w-72 rounded-full lg:block"
        style={{
          border: `0.5px solid ${tokens.brandBorder}`,
        }}
      />

      {/* Main container - Level 1 elevated surface */}
      <div 
        className="relative grid w-full max-w-5xl gap-12 p-10 backdrop-blur lg:grid-cols-[1.1fr_0.9fr]"
        style={{
          borderRadius: radius['3xl'],
          border: `0.5px solid ${tokens.brandBorder}`,
          backgroundColor: tokens.backgroundElevated,
          boxShadow: `0 40px 120px rgba(0, 0, 0, 0.55)`,
        }}
      >
        {/* Marketing panel - Level 2 raised surface */}
        <div 
          className="hidden flex-col justify-between lg:flex"
          style={{
            borderRadius: radius['2xl'],
            border: `0.5px solid ${tokens.brandSubtle}`,
            backgroundColor: tokens.backgroundRaised,
            padding: space['2xl'],
            gap: space['4xl'],
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: space.xl }}>
            <p 
              className="text-xs uppercase"
              style={{
                letterSpacing: '0.32em',
                color: tokens.brandPrimary,
                opacity: 0.8,
              }}
            >
              Sunsetz Barber Studio
            </p>
            <h1 
              className="text-4xl leading-[1.2]"
              style={{
                letterSpacing: '0.12em',
                color: tokens.foregroundPrimary,
              }}
            >
              Accede al backstage y orquesta la experiencia Sunsetz.
            </h1>
            <p 
              className="max-w-sm text-sm leading-relaxed"
              style={{ color: tokens.foregroundSecondary }}
            >
              Gestiona reservas, asigna rituales y mantén a tu equipo sincronizado. Seguridad reforzada con cookies HTTP-only, refresh tokens y protección CSRF automática.
            </p>
          </div>
          
          <div 
            className="space-y-4 text-sm"
            style={{ color: tokens.foregroundSecondary }}
          >
            <p className="leading-relaxed">
              ¿Aún no tienes acceso? Contacta al administrador principal para habilitar tu usuario corporativo.
            </p>
            <div 
              className="flex items-center gap-3 text-[11px] uppercase"
              style={{
                letterSpacing: '0.32em',
                color: tokens.foregroundMuted,
              }}
            >
              <span 
                className="h-px flex-1"
                style={{ backgroundColor: tokens.brandBorder }}
              />
              Sunsetz Admin Portal
              <span 
                className="h-px flex-1"
                style={{ backgroundColor: tokens.brandBorder }}
              />
            </div>
          </div>
        </div>

        {/* Form panel - Level 2 raised surface */}
        <div 
          className="flex flex-col justify-center"
          style={{
            borderRadius: radius['2xl'],
            border: `0.5px solid ${tokens.brandSubtle}`,
            backgroundColor: tokens.backgroundRaised,
            padding: space['2xl'],
            boxShadow: `0 24px 60px rgba(0, 0, 0, 0.45)`,
          }}
        >
          <p 
            className="text-xs uppercase"
            style={{
              letterSpacing: '0.32em',
              color: tokens.brandPrimary,
              opacity: 0.8,
            }}
          >
            Acceso privado
          </p>
          
          <h2 
            className="text-3xl"
            style={{
              marginTop: space.lg,
              letterSpacing: '0.1em',
              color: tokens.foregroundPrimary,
            }}
          >
            Iniciar sesión
          </h2>
          
          <p 
            className="text-sm leading-relaxed"
            style={{
              marginTop: space.sm,
              color: tokens.foregroundSecondary,
            }}
          >
            Usa tu correo corporativo y credenciales autorizadas.
          </p>

          <form 
            onSubmit={handleSubmit} 
            className="space-y-6"
            style={{ marginTop: space['2xl'] }}
          >
            {/* Email field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-[11px] font-medium uppercase"
                style={{
                  letterSpacing: '0.3em',
                  color: tokens.foregroundTertiary,
                }}
              >
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                spellCheck={false}
                required
                value={formValues.email}
                onInput={handleChange}
                placeholder="admin@sunsetz.com"
                className="w-full border-[0.5px] border-solid border-[rgba(255,255,255,0.08)] px-4 py-3 text-sm transition-colors focus:outline-none focus-visible:border-[#B8935E] focus-visible:ring-2 focus-visible:ring-[rgba(184,147,94,0.10)] hover:border-[rgba(255,255,255,0.12)]"
                style={{
                  borderRadius: radius.lg,
                  backgroundColor: tokens.controlBackground,
                  color: tokens.foregroundPrimary,
                }}
              />
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-[11px] font-medium uppercase"
                style={{
                  letterSpacing: '0.3em',
                  color: tokens.foregroundTertiary,
                }}
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
                className="w-full border-[0.5px] border-solid border-[rgba(255,255,255,0.08)] px-4 py-3 text-sm transition-colors focus:outline-none focus-visible:border-[#B8935E] focus-visible:ring-2 focus-visible:ring-[rgba(184,147,94,0.10)] hover:border-[rgba(255,255,255,0.12)]"
                style={{
                  borderRadius: radius.lg,
                  backgroundColor: tokens.controlBackground,
                  color: tokens.foregroundPrimary,
                }}
              />
            </div>

            {/* Error message */}
            {error ? (
              <div 
                role="alert"
                className="px-4 py-3 text-sm"
                style={{
                  borderRadius: radius.lg,
                  border: `0.5px solid ${tokens.semanticDestructiveBorder}`,
                  backgroundColor: tokens.semanticDestructiveBackground,
                  color: tokens.semanticDestructiveText,
                }}
              >
                {error}
              </div>
            ) : null}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center px-4 py-3 text-sm font-semibold uppercase transition-transform hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 focus-visible:ring-2 focus-visible:ring-[#B8935E]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D0D0D] disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                borderRadius: radius.lg,
                backgroundColor: tokens.brandPrimary,
                color: tokens.backgroundBase,
                letterSpacing: '0.3em',
                boxShadow: `0 18px 48px ${tokens.brandShadow}`,
              }}
            >
              {isSubmitting
                ? "Validando credenciales…"
                : isLoading
                  ? "Sincronizando sesión…"
                  : "Acceder al panel"}
            </button>
          </form>

          {/* Back to site link */}
          <div 
            className="text-center text-xs"
            style={{
              marginTop: space['2xl'],
              color: tokens.foregroundMuted,
            }}
          >
            <p>
              <Link
                to="/"
                className="text-[#B8935E] transition-colors hover:text-[#d3a96f] focus-visible:underline focus-visible:outline-none"
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
