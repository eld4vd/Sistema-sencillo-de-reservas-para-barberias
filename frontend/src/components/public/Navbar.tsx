import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaPhone, FaBars, FaTimes, FaCut } from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";
import { businessInfo } from "../../data/businessInfo";
import emblemLogo from "../../assets/logo.jpg";
import { prefetchByPath, preloadAdminArea } from "../../helpers/perf/prefetch";

const navLinks = [
  { name: "Inicio", href: "/home" },
  { name: "Tienda", href: "/tienda" },
  { name: "Sobre Nosotros", href: "/sobre-nosotros" },
  { name: "Contacto", href: "/contacto" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navTrackRef = useRef<HTMLDivElement | null>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();
    // client-passive-event-listeners: scroll listener doesn't call preventDefault
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`fixed top-0 z-50 w-full transition-[background-color,border-color,box-shadow] duration-300 ${
          isScrolled
            ? "bg-[#080808]/95 backdrop-blur-xl border-b border-[#1F1F1F]/60 shadow-lg"
            : "bg-[#080808]/90 backdrop-blur-md border-b border-[#1F1F1F]/30"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`flex items-center justify-between transition-[padding] duration-300 ${
              isScrolled ? "py-3" : "py-4"
            }`}
          >
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-3 group"
            >
              <img
                src={emblemLogo}
                alt="Barbería Sunsetz"
                className={`rounded-full object-cover transition-[height,width] duration-300 ${
                  isScrolled ? "h-11 w-11" : "h-12 w-12"
                }`}
                loading="eager"
              />
              <div className="hidden sm:block">
                <h1 className={`font-semibold text-[#FAF8F3] transition-[font-size] duration-300 ${
                  isScrolled ? "text-xl" : "text-2xl"
                }`}>
                  Barbería Sunsetz
                </h1>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <div
                ref={navTrackRef}
                className="relative flex items-center gap-1 rounded-full border border-[#2A2A2A]/80 bg-[#0D0D0D]/60 px-2 py-1.5"
              >
                {indicator.width > 0 && (
                  <motion.div
                    className="absolute top-1.5 bottom-1.5 rounded-full bg-[#B8935E]"
                    animate={{ left: indicator.left, width: indicator.width }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                {navLinks.map((link, index) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    ref={(el) => {
                      linkRefs.current[index] = el;
                    }}
                    onMouseEnter={() => prefetchByPath(link.href)}
                    className={`relative z-10 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                      isActive(link.href)
                        ? "text-[#0D0D0D]"
                        : "text-[#FAF8F3]/70 hover:text-[#FAF8F3]"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </nav>

            {/* CTA Section */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated && (
                <Link
                  to="/admin"
                  onMouseEnter={() => preloadAdminArea()}
                  className="px-4 py-2 text-sm font-medium text-[#FAF8F3]/80 hover:text-[#FAF8F3] transition-colors"
                >
                  Admin
                </Link>
              )}
              <Link
                to="/reservas"
                onMouseEnter={() => prefetchByPath("/reservas")}
                className="rounded-full bg-[#B8935E] px-5 py-2 text-sm font-semibold text-[#0D0D0D] shadow-lg hover:bg-[#C9A46F] transition-colors"
              >
                Reservar
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setOpen(prev => !prev)}
              className="md:hidden rounded-lg p-2 text-[#B8935E] hover:bg-[#B8935E]/10 transition-colors"
              aria-label="Toggle menu"
            >
              {open ? <FaTimes size={20} aria-hidden="true" /> : <FaBars size={20} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-[280px] flex flex-col bg-[#0D0D0D] border-l border-[#2A2A2A] md:hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#2A2A2A] p-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#B8935E] to-[#8B1A1A]">
                    <FaCut className="h-5 w-5 text-[#0D0D0D]" aria-hidden="true" />
                  </div>
                  <span className="text-lg font-semibold text-[#FAF8F3]">
                    Sunsetz
                  </span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-2 text-[#B8935E] hover:bg-[#B8935E]/10 transition-colors"
                >
                  <FaTimes size={18} aria-hidden="true" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setOpen(false)}
                    className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                      isActive(link.href)
                        ? "bg-[#B8935E]/15 text-[#B8935E]"
                        : "text-[#FAF8F3]/70 hover:bg-[#1F1F1F] hover:text-[#FAF8F3]"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>

              {/* Footer */}
              <div className="space-y-3 border-t border-[#2A2A2A] p-4">
                <Link
                  to="/reservas"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center rounded-full bg-[#B8935E] px-4 py-2.5 text-sm font-semibold text-[#0D0D0D] hover:bg-[#C9A46F] transition-colors"
                >
                  Reservar ahora
                </Link>
                {isAuthenticated && (
                  <Link
                    to="/admin"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center rounded-full border border-[#2A2A2A] px-4 py-2.5 text-sm font-medium text-[#FAF8F3] hover:bg-[#1F1F1F] transition-colors"
                  >
                    Portal Admin
                  </Link>
                )}
                <a
                  href={`tel:${businessInfo.contact.phone}`}
                  className="flex items-center justify-center gap-2 rounded-full border border-[#B8935E]/40 px-4 py-2.5 text-sm font-medium text-[#B8935E] hover:bg-[#B8935E]/10 transition-colors"
                >
                  <FaPhone size={14} aria-hidden="true" />
                  <span>Llamar</span>
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="h-[72px]" />
    </>
  );
};

export default Navbar;
