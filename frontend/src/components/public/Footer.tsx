import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaInstagram, FaFacebookF } from "react-icons/fa";
import { SiTiktok } from "react-icons/si";
import type { IconType } from "react-icons";
import { businessInfo } from "../../data/businessInfo";

const enlacesRapidos = [
  { nombre: "Inicio", ruta: "/home" },
  { nombre: "Reservas", ruta: "/reservas" },
  { nombre: "Tienda", ruta: "/tienda" },
  { nombre: "Sobre Nosotros", ruta: "/sobre-nosotros" },
  { nombre: "Contacto", ruta: "/contacto" },
];

const redes: { nombre: string; href: string; Icono: IconType }[] = [
  { nombre: "Instagram", href: "https://www.instagram.com", Icono: FaInstagram },
  { nombre: "Facebook", href: "https://www.facebook.com", Icono: FaFacebookF },
  { nombre: "TikTok", href: "https://www.tiktok.com", Icono: SiTiktok },
];

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0D0D0D] text-[#FAF8F3]">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#B8935E] to-[#8B1A1A] shadow-[0_0_30px_rgba(184,147,94,0.28)]">
                <span className="text-2xl font-bold text-[#0D0D0D]">SZ</span>
              </div>
              <div>
                <h3
                  className="text-4xl font-semibold text-[#B8935E]"
                >
                  Barbería Sunsetz
                </h3>
                <p className="text-xs uppercase tracking-[0.2em] text-[#FAF8F3]/75">
                  Estilo • Técnica • Presencia
                </p>
              </div>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-[#FAF8F3]/70">
              Somos un lounge de barbería en la Plaza 25 de Mayo que combina tradición andina y precisión contemporánea. Agenda tu experiencia y sal con actitud renovada.
            </p>
            <div className="flex gap-3">
              {redes.map(({ nombre, href, Icono }) => (
                <a
                  key={nombre}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={nombre}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-[#2A2A2A] bg-[#0D0D0D] text-[#FAF8F3] transition-colors hover:border-[#B8935E] hover:text-[#B8935E]"
                >
                  <Icono className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Enlaces rápidos">
            <h4
              className="text-base font-semibold uppercase tracking-[0.2em] text-[#B8935E]"
            >
              Mapa del sitio
            </h4>
            <ul className="mt-5 space-y-3 text-sm text-[#FAF8F3]/85">
              {enlacesRapidos.map((item) => (
                <li key={item.nombre}>
                  <Link
                    to={item.ruta}
                    className="transition-colors hover:text-[#B8935E]"
                  >
                    {item.nombre}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h4
              className="text-base font-semibold uppercase tracking-[0.2em] text-[#B8935E]"
            >
              Contacto
            </h4>
            <div className="mt-5 space-y-3 text-sm text-[#FAF8F3]/85">
              <p>{businessInfo.location.plaza}</p>
              <p>
                {businessInfo.location.city}, {businessInfo.location.department} · {businessInfo.location.country}
              </p>
              <a href={`tel:${businessInfo.contact.phone}`} className="block text-[#FAF8F3] transition-colors hover:text-[#B8935E]">
                {businessInfo.contact.phoneDisplay}
              </a>
              <a href={`mailto:${businessInfo.contact.email}`} className="block text-[#FAF8F3] transition-colors hover:text-[#B8935E]">
                {businessInfo.contact.email}
              </a>
            </div>
            <div className="mt-6 space-y-2 text-xs uppercase tracking-[0.2em] text-[#FAF8F3]/65">
              <p>{businessInfo.schedule.full}</p>
              <p>Atención continua los 7 días de la semana</p>
            </div>
          </div>

          <div className="space-y-5">
            <h4
              className="text-base font-semibold uppercase tracking-[0.2em] text-[#B8935E]"
            >
              Recibe novedades
            </h4>
            <p className="text-sm leading-relaxed text-[#FAF8F3]/75">
              Promociones, lanzamientos y tips de barbería directo a tu bandeja.
            </p>
            <form className="flex w-full max-w-sm overflow-hidden rounded-full border border-[#2A2A2A] bg-[#2A2A2A]">
              <input
                type="email"
                placeholder="Tu correo electrónico"
                className="flex-1 bg-transparent px-4 py-3 text-sm text-[#FAF8F3] placeholder:text-[#8B8B8B] focus:outline-none"
              />
              <button
                type="submit"
                className="bg-[#B8935E] px-6 text-sm font-semibold text-[#0D0D0D] transition-colors hover:bg-[#c9a476]"
              >
                Enviar
              </button>
            </form>
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.22em] text-[#FAF8F3]/70">
              <span className="rounded-full border border-[#2A2A2A] px-3 py-1">Visa</span>
              <span className="rounded-full border border-[#2A2A2A] px-3 py-1">Mastercard</span>
              <span className="rounded-full border border-[#2A2A2A] px-3 py-1">Tigo Money</span>
              <span className="rounded-full border border-[#2A2A2A] px-3 py-1">QR</span>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-12 border-t border-[#2A2A2A] pt-6 text-xs text-[#FAF8F3]/70"
        >
          <div className="flex flex-col gap-4 text-center md:flex-row md:items-center md:justify-between">
            <p>© {new Date().getFullYear()} Barbería Sunsetz · Todos los derechos reservados.</p>
            <p className="text-[#FAF8F3]/55">Experiencias premium en barbería y grooming.</p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;