import React from "react";
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
    <footer className="bg-[#0D0D0D] text-[#FAF8F3] border-t border-[#1F1F1F]">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3 lg:gap-12">
          {/* Sección principal */}
          <div className="space-y-5">
            <h3 className="text-2xl font-semibold text-[#B8935E]">
              Barbería Sunsetz
            </h3>
            <p className="text-sm text-[#FAF8F3]/70">
              Barbería premium en Plaza 25 de Mayo, Sucre.
            </p>
            <div className="flex gap-3">
              {redes.map(({ nombre, href, Icono }) => (
                <a
                  key={nombre}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={nombre}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2A2A2A] text-[#FAF8F3] transition-colors hover:border-[#B8935E] hover:text-[#B8935E]"
                >
                  <Icono className="h-4 w-4" aria-hidden="true" />
                </a>
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
                    className="transition-colors hover:text-[#B8935E]"
                  >
                    {item.nombre}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contacto */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[#B8935E]">
              Contacto
            </h4>
            <div className="mt-4 space-y-2.5 text-sm text-[#FAF8F3]/75">
              <p>{businessInfo.location.plaza}</p>
              <p>Sucre, Bolivia</p>
              <a 
                href={`tel:${businessInfo.contact.phone}`} 
                className="block hover:text-[#B8935E] transition-colors"
              >
                {businessInfo.contact.phoneDisplay}
              </a>
              <a 
                href={`mailto:${businessInfo.contact.email}`} 
                className="block hover:text-[#B8935E] transition-colors"
              >
                {businessInfo.contact.email}
              </a>
              <p className="pt-2 text-xs text-[#FAF8F3]/60">
                {businessInfo.schedule.full}
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 border-t border-[#2A2A2A] pt-6">
          <p className="text-center text-xs text-[#FAF8F3]/60">
            © {new Date().getFullYear()} Barbería Sunsetz · Todos los derechos reservados
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;