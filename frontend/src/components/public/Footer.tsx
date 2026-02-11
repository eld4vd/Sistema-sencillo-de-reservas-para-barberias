import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaInstagram, FaFacebookF, FaWhatsapp, FaClock, FaMapMarkerAlt, FaPhone, FaEnvelope } from "react-icons/fa";
import { SiTiktok } from "react-icons/si";
import { motion } from "framer-motion";
import type { IconType } from "react-icons";
import { businessInfo } from "../../data/businessInfo";

const enlacesRapidos = [
  { nombre: "Inicio", ruta: "/home" },
  { nombre: "Reservas", ruta: "/reservas" },
  { nombre: "Tienda", ruta: "/tienda" },
  { nombre: "Sobre Nosotros", ruta: "/sobre-nosotros" },
  { nombre: "Contacto", ruta: "/contacto" },
];

const redes: { nombre: string; href: string; Icono: IconType; color: string }[] = [
  { nombre: "Instagram", href: "https://www.instagram.com", Icono: FaInstagram, color: "hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500" },
  { nombre: "Facebook", href: "https://www.facebook.com", Icono: FaFacebookF, color: "hover:bg-[#1877F2]" },
  { nombre: "TikTok", href: "https://www.tiktok.com", Icono: SiTiktok, color: "hover:bg-black" },
];

const Footer: React.FC = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setStatus("success");
      setEmail("");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <footer className="bg-[#0D0D0D] text-[#FAF8F3] border-t border-[#1F1F1F]">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {/* Newsletter Section */}
        <div className="mb-12 rounded-2xl border border-[#2A2A2A] bg-gradient-to-br from-[#1F1F1F]/40 to-[#0D0D0D]/20 p-8 backdrop-blur-sm">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="text-2xl font-bold text-[#B8935E] md:text-3xl">
              Mantente al día con nuestras ofertas
            </h3>
            <p className="mt-3 text-sm text-[#FAF8F3]/70 md:text-base">
              Suscríbete para recibir promociones exclusivas y novedades
            </p>
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row sm:gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="flex-1 rounded-full border border-[#2A2A2A] bg-[#0D0D0D]/60 px-5 py-3 text-sm text-[#FAF8F3] placeholder-[#FAF8F3]/40 outline-none transition-all focus:border-[#B8935E] focus:ring-2 focus:ring-[#B8935E]/20"
              />
              <button
                type="submit"
                className="rounded-full bg-[#B8935E] px-6 py-3 text-sm font-semibold text-[#0D0D0D] transition-all hover:bg-[#C9A46F] hover:shadow-lg hover:shadow-[#B8935E]/20"
              >
                {status === "success" ? "¡Suscrito! ✓" : "Suscribirse"}
              </button>
            </form>
          </div>
        </div>

        {/* Divider decorativo */}
        <div className="mb-12 flex items-center gap-4">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#B8935E]/30 to-transparent" />
          <div className="h-2 w-2 rotate-45 bg-[#B8935E]" />
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#B8935E]/30 to-transparent" />
        </div>

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {/* Sección principal */}
          <div className="space-y-5 lg:col-span-1">
            <h3 className="text-2xl font-bold text-[#B8935E]">
              Barbería Sunsetz
            </h3>
            <p className="text-sm leading-relaxed text-[#FAF8F3]/70">
              Barbería premium en el corazón de Sucre, donde la tradición se encuentra con el estilo moderno.
            </p>
            <div className="flex gap-3">
              {redes.map(({ nombre, href, Icono, color }) => (
                <motion.a
                  key={nombre}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={nombre}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className={`group flex h-11 w-11 items-center justify-center rounded-full border border-[#2A2A2A] text-[#FAF8F3] transition-all ${color} hover:border-transparent hover:text-white hover:shadow-lg`}
                >
                  <Icono className="h-4 w-4" aria-hidden="true" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Enlaces */}
          <nav aria-label="Enlaces rápidos">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[#B8935E]">
              Navegación
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-[#FAF8F3]/75">
              {enlacesRapidos.map((item) => (
                <li key={item.nombre}>
                  <Link
                    to={item.ruta}
                    className="group inline-flex items-center transition-colors hover:text-[#B8935E]"
                  >
                    <span className="mr-2 text-[#B8935E] opacity-0 transition-opacity group-hover:opacity-100">→</span>
                    {item.nombre}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Horarios */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[#B8935E]">
              Horarios
            </h4>
            <div className="mt-4 space-y-4">
              <div className="rounded-lg border border-[#2A2A2A] bg-[#1F1F1F]/30 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#B8935E]/10">
                    <FaClock className="h-4 w-4 text-[#B8935E]" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#FAF8F3]/60">{businessInfo.schedule.daysLabel}</p>
                    <p className="text-sm font-semibold text-[#FAF8F3]">{businessInfo.schedule.hoursLabel}</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-[#FAF8F3]/60">
                Abierto todos los días para tu comodidad
              </p>
            </div>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[#B8935E]">
              Contacto
            </h4>
            <div className="mt-4 space-y-3 text-sm text-[#FAF8F3]/75">
              <div className="flex items-start gap-3">
                <FaMapMarkerAlt className="mt-1 h-4 w-4 text-[#B8935E]" />
                <div>
                  <p>{businessInfo.location.plaza}</p>
                  <p>Sucre, Bolivia</p>
                </div>
              </div>
              <a 
                href={`tel:${businessInfo.contact.phone}`} 
                className="flex items-center gap-3 transition-colors hover:text-[#B8935E]"
              >
                <FaPhone className="h-4 w-4 text-[#B8935E]" />
                {businessInfo.contact.phoneDisplay}
              </a>
              <a 
                href={`mailto:${businessInfo.contact.email}`} 
                className="flex items-center gap-3 transition-colors hover:text-[#B8935E]"
              >
                <FaEnvelope className="h-4 w-4 text-[#B8935E]" />
                {businessInfo.contact.email}
              </a>
              <a
                href={businessInfo.contact.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 font-semibold text-white transition-all hover:bg-[#20BA5A] hover:shadow-lg hover:shadow-[#25D366]/20"
              >
                <FaWhatsapp className="h-5 w-5" />
                <span className="text-sm">WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t border-[#2A2A2A] pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-[#FAF8F3]/60">
              © {new Date().getFullYear()} Barbería Sunsetz · Todos los derechos reservados
            </p>
            <p className="text-xs text-[#FAF8F3]/40">
              Hecho con ❤️ en Sucre, Bolivia
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;