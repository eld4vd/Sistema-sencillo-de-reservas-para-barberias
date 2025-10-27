import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPhone,
  FaBars,
  FaTimes,
  FaCut,
  FaClock,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";
import { businessInfo } from "../../data/businessInfo";
import emblemLogo from "../../assets/logo.jpg";
import { prefetchByPath, preloadAdminArea } from "../../helpers/perf/prefetch";
import { logger } from "../../helpers/logging";

const navLinks = [
  { name: "Inicio", href: "/home" },
  { name: "Reservas", href: "/reservas" },
  { name: "Tienda", href: "/tienda" },
  { name: "Sobre Nosotros", href: "/sobre-nosotros" },
  { name: "Contacto", href: "/contacto" },
];

const MotionLink = motion.create(Link);

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navTrackRef = useRef<HTMLDivElement | null>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const { isAuthenticated } = useAuth();
  const apiBase = (import.meta as any).env?.VITE_API_URL as string | undefined;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Preconexión al API para reducir TTFB en la primera llamada
  useEffect(() => {
    try {
      if (!apiBase) return;
      const url = new URL(apiBase);
      const link = document.createElement("link");
      link.rel = "preconnect";
      link.href = `${url.origin}`;
      link.crossOrigin = "anonymous";
      document.head.appendChild(link);
    } catch (e) {
      logger.debug("No se pudo registrar preconnect", e);
    }
  }, [apiBase]);

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    const updateIndicator = () => {
      const activeIndex = navLinks.findIndex((link) => isActive(link.href));
      if (activeIndex === -1) {
        setIndicator({ left: 0, width: 0 });
        return;
      }

      const target = linkRefs.current[activeIndex];
      const track = navTrackRef.current;

      if (target && track) {
        const targetRect = target.getBoundingClientRect();
        const trackRect = track.getBoundingClientRect();
        setIndicator({
          left: targetRect.left - trackRect.left,
          width: targetRect.width,
        });
      }
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [isActive, location.pathname]);

  const scheduleLabel = `${businessInfo.schedule.daysLabel} ${businessInfo.schedule.hoursLabel}`;
  const scheduleFull = businessInfo.schedule.full;
  const locationLabel = `${businessInfo.location.plaza} · ${businessInfo.location.city}`;

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`fixed top-0 z-50 w-full transition-all duration-500 ${
          isScrolled
            ? "bg-[#080808]/96 backdrop-blur-xl border-b border-[#1F1F1F] shadow-[0_20px_40px_rgba(8,8,8,0.45)]"
            : "bg-[#080808]/98 backdrop-blur-xl border-b border-[#1F1F1F]/10 shadow-[0_12px_32px_rgba(0,0,0,0.35)]"
        }`}
      >
        <div className="hidden lg:block">
          <div className="mx-auto flex max-w-7xl items-center justify-between border-b border-[#0A1929]/50 bg-[#0A1929] px-8 py-1.5 text-xs uppercase tracking-[0.28em] text-[#FAF8F3]">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2">
                <FaClock className="text-[#B8935E]" />
                <span>{scheduleLabel}</span>
              </span>
              <span className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-[#B8935E]" />
                <span>{locationLabel}</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <FaPhone className="text-[#B8935E]" />
              <span className="tracking-[0.4em] text-[#FAF8F3]">
                {businessInfo.contact.phoneDisplay}
              </span>
              <span className="ml-4 text-[10px] tracking-[0.28em] text-[#FAF8F3]/70">
                Reserva tu turno premium
              </span>
              <span className="ml-4 inline-flex items-center rounded-full border border-[#FAF8F3]/25 px-3 py-1 text-[10px] font-semibold tracking-[0.25em] text-[#FAF8F3]">
                CORTES DESDE 10BS
              </span>
              {isAuthenticated ? (
                <Link
                  to="/admin"
                  className="ml-4 rounded-full border border-[#FAF8F3]/20 px-3 py-1 text-[10px] font-semibold tracking-[0.25em] text-[#FAF8F3] transition-colors hover:bg-[#FAF8F3]/10"
                >
                  Portal admin
                </Link>
              ) : null}
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={false}
            animate={{
              paddingTop: isScrolled ? 16 : 32,
              paddingBottom: isScrolled ? 16 : 32,
            }}
            className="flex items-center justify-between gap-6"
          >
            {/* Logo y marca */}
            <Link
              to="/"
              id="navbar-logo-anchor"
              className="relative flex items-center gap-3 group"
            >
              <div
                className={`flex items-center justify-center rounded-full bg-gradient-to-br from-[#B8935E] to-[#8B1A1A] shadow-[0_0_25px_rgba(184,147,94,0.28)] transition-all duration-500 ${
                  isScrolled ? "w-11 h-11" : "w-12 h-12"
                } sm:hidden`}
              >
                <FaCut
                  className="text-[#0D0D0D] transition-transform duration-500"
                  style={{
                    width: isScrolled ? "1.65rem" : "1.85rem",
                    height: isScrolled ? "1.65rem" : "1.85rem",
                  }}
                />
              </div>

              <img
                src={emblemLogo}
                alt="Escudo Barbería Sunsetz"
                width="78"
                height="78"
                className={`hidden sm:block ${
                  isScrolled ? "h-[3.5rem] w-[3.5rem]" : "h-[3.9rem] w-[3.9rem]"
                } shrink-0 rounded-full object-cover drop-shadow-[0_0_34px_rgba(184,147,94,0.4)] transition-all duration-500`}
                loading="eager"
                decoding="async"
              />

              <div className="hidden sm:flex flex-col">
                <h1
                  className="leading-none text-[#FAF8F3] drop-shadow-[0_6px_16px_rgba(0,0,0,0.6)]"
                  style={{
                    fontSize: isScrolled ? "2.2rem" : "2.5rem",
                  }}
                >
                  Barbería Sunsetz
                </h1>
                <span className="mt-2 text-xs font-medium uppercase tracking-[0.24em] text-[#8B8B8B]">
                  Sucre · Bolivia
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex flex-1 justify-center">
              <div
                ref={navTrackRef}
                className="relative flex items-center gap-2 rounded-full border border-[#2A2A2A] bg-[#0D0D0D]/90 px-3 py-1.5 backdrop-blur-xl shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]"
              >
                {indicator.width > 0 && (
                  <motion.div
                    className="absolute top-2 bottom-2 rounded-full bg-[#B8935E] shadow-[0_0_25px_rgba(184,147,94,0.4)]"
                    animate={{ left: indicator.left, width: indicator.width }}
                    transition={{ type: "spring", stiffness: 260, damping: 30 }}
                  />
                )}
                {navLinks.map((link, index) => (
                  <MotionLink
                    key={link.name}
                    to={link.href}
                    ref={(el: HTMLAnchorElement | null) => {
                      linkRefs.current[index] = el;
                    }}
                    onMouseEnter={() => prefetchByPath(link.href)}
                    className={`relative z-10 rounded-full px-4 py-1.5 text-sm tracking-[0.15em] transition-colors ${
                      isActive(link.href)
                        ? "font-semibold text-[#0D0D0D] bg-[#B8935E]"
                        : "font-medium text-[#FAF8F3]/75 hover:text-[#FAF8F3] hover:bg-[#0A1929]/25"
                    }`}
                    whileHover={{ y: -2 }}
                  >
                    <span className="relative z-10">{link.name}</span>
                  </MotionLink>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <MotionLink
                to="/reservas"
                onMouseEnter={() => prefetchByPath("/reservas")}
                className="flex items-center gap-2 rounded-full bg-[#B8935E] px-6 py-2.5 text-sm font-semibold text-[#0D0D0D] shadow-[0_12px_28px_rgba(184,147,94,0.32)] transition-transform hover:shadow-[0_16px_32px_rgba(184,147,94,0.38)]"
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.96 }}
              >
                <span>Reservar ahora</span>
              </MotionLink>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden flex items-center justify-center rounded-full border border-[#B8935E]/50 p-2 text-[#B8935E] transition-colors hover:bg-[#B8935E]/15"
              aria-label="Toggle menu"
            >
              {open ? <FaTimes size={22} /> : <FaBars size={22} />}
            </button>
          </motion.div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-[#0D0D0D]/70 backdrop-blur-sm md:hidden"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 z-50 flex w-[320px] flex-col overflow-y-auto border-l border-[#2A2A2A] bg-[#0D0D0D] md:hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#2A2A2A] p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#B8935E] to-[#8B1A1A] shadow-lg">
                    <FaCut className="h-6 w-6 text-[#0D0D0D]" />
                  </div>
                  <div>
                    <h2
                      className="text-3xl font-semibold leading-none text-[#FAF8F3]"
                    >
                      Barbería Sunsetz
                    </h2>
                    <span className="ml-0.5 mt-2 block text-[10px] font-semibold uppercase tracking-[0.24em] text-[#8B8B8B]">
                      Sucre · Bolivia
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-2 text-[#B8935E] transition-colors hover:bg-[#B8935E]/18"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              {/* Lema y experiencias */}
              <div className="space-y-4 border-b border-[#2A2A2A] px-6 py-5">
                <p className="text-sm leading-relaxed text-[#FAF8F3]/75">
                  Experiencia de barbería con esencia chuquisaqueña: cortes de
                  autor, afeitado de precisión y mixología de la casa.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-[#B8935E]/25 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-[#B8935E]/85">
                    Servicio express 45′
                  </span>
                  <span className="rounded-full border border-[#B8935E]/25 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-[#B8935E]/85">
                    Mixología Sunsetz
                  </span>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="p-6 space-y-2">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={link.href}
                      onMouseEnter={() => prefetchByPath(link.href)}
                      onClick={() => setOpen(false)}
                      className={`block rounded-lg px-4 py-3 transition-all ${
                        isActive(link.href)
                          ? "bg-[#B8935E]/15 text-[#B8935E] font-semibold"
                          : "text-[#FAF8F3]/75 hover:bg-[#B8935E]/12 hover:text-[#B8935E]"
                      }`}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* CTA & Datos */}
              <div className="mt-auto space-y-4 border-t border-[#2A2A2A] p-6">
                <MotionLink
                  to="/reservas"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-full bg-[#B8935E] px-5 py-2.5 text-sm font-semibold text-[#0D0D0D] shadow-[0_14px_30px_rgba(184,147,94,0.32)] transition-transform hover:shadow-[0_18px_36px_rgba(184,147,94,0.38)]"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <span>Agendar Experiencia</span>
                </MotionLink>
                {isAuthenticated ? (
                  <MotionLink
                    to="/admin"
                    onMouseEnter={() => preloadAdminArea()}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-full border border-[#0A1929] px-5 py-2.5 text-sm font-semibold text-[#FAF8F3] transition-all hover:bg-[#0A1929]/25"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <span>Portal admin</span>
                  </MotionLink>
                ) : null}
                <motion.a
                  href={`tel:${businessInfo.contact.phone}`}
                  className="flex items-center justify-center gap-2 rounded-full border border-[#B8935E]/40 px-5 py-2.5 text-sm font-semibold text-[#B8935E] transition-all hover:border-[#B8935E] hover:bg-[#B8935E]/12"
                  whileTap={{ scale: 0.96 }}
                >
                  <FaPhone />
                  <span>Llamar al lounge</span>
                </motion.a>
                <div className="space-y-3 text-sm text-[#FAF8F3]/70">
                  <p className="flex items-center gap-2">
                    <FaClock className="text-[#B8935E]" />
                    <span>{scheduleFull}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-[#B8935E]" />
                    <span>{businessInfo.fullAddress}</span>
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer para evitar que el contenido quede debajo del navbar fijo */}
      <div className="h-24 md:h-32" />
    </>
  );
};

export default Navbar;
