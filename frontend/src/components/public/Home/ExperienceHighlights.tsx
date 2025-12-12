import { motion } from "framer-motion";
import { useState } from "react";

import cortando3 from "../../../assets/images/lugar/cortando3.jpg";
import local from "../../../assets/images/lugar/local.jpg";
import peluqueria1 from "../../../assets/images/lugar/peluqueria1.jpg";
import peluqueria2 from "../../../assets/images/lugar/peluqueria2.jpg";
import peluqueria3 from "../../../assets/images/lugar/peluqueria3.jpg";
import famoso from "../../../assets/images/lugar/famoso.jpg";

interface VenueImage {
  src: string;
  title: string;
  description: string;
  category: string;
}

const venueImages: VenueImage[] = [
  {
    src: local,
    title: "Fachada Sunsetz",
    description: "Ubicados en el corazón de Plaza 25 de Mayo, Sucre",
    category: "Exterior",
  },
  {
    src: peluqueria1,
    title: "Zona de corte premium",
    description: "Estaciones de barbería con iluminación profesional",
    category: "Interior",
  },
  {
    src: peluqueria2,
    title: "Lounge de espera",
    description: "Espacios cómodos con ambiente selecto",
    category: "Interior",
  },
  {
    src: peluqueria3,
    title: "Área de servicios",
    description: "Instalaciones modernas para tratamientos especializados",
    category: "Interior",
  },
  {
    src: cortando3,
    title: "Maestros en acción",
    description: "Profesionales ejecutando cortes de precisión",
    category: "Servicio",
  },
  {
    src: famoso,
    title: "Visita de celebridad",
    description: "Un cliente famoso disfrutando de su experiencia Sunsetz",
    category: "Evento",
  }
];

const VenueShowcase = () => {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#050607] via-[#060708] to-[#050607] py-20 text-[#FAF8F3] md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(184,147,94,0.1),_transparent_75%)]" />

      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-semibold text-[#FAF8F3] md:text-4xl">
            Nuestro local
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-[#FAF8F3]/70">
            Instalaciones modernas en Plaza 25 de Mayo
          </p>
        </div>

        {/* Grid principal */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {/* Imagen destacada - Primera posición, ocupa 2 columnas en desktop */}
          <motion.figure
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            onClick={() => setActiveIndex(0)}
            className="group relative col-span-1 cursor-pointer overflow-hidden rounded-[28px] border border-[#1C1C20] bg-[#0B0D11] shadow-xl transition-all duration-500 hover:shadow-2xl hover:shadow-[#B8935E]/10 md:col-span-2 lg:row-span-2"
            style={{ minHeight: "450px" }}
          >
            <img
              src={venueImages[0].src}
              alt={venueImages[0].title}
              width="1200"
              height="900"
              className="h-full w-full object-cover transition-all duration-700 group-hover:scale-105 group-hover:brightness-110"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050607]/90 via-transparent to-[#050607]/10 opacity-80 transition-opacity duration-500 group-hover:opacity-60" />
            
            {/* Badge categoría */}
            <span className="absolute right-5 top-5 rounded-full border border-[#B8935E]/40 bg-[#0D0F13]/80 px-4 py-1.5 text-[10px] uppercase tracking-[0.35em] text-[#B8935E] backdrop-blur-md">
              {venueImages[0].category}
            </span>

            {/* Info */}
            <div className="absolute inset-x-8 bottom-8 space-y-3">
              <h3 className="text-3xl leading-tight tracking-[0.08em] md:text-4xl">
                {venueImages[0].title}
              </h3>
              <p className="text-sm text-[#FAF8F3]/75 md:text-base">
                {venueImages[0].description}
              </p>
            </div>

            {/* Border glow */}
            <div className="pointer-events-none absolute inset-0 rounded-[28px] border border-[#B8935E]/0 transition-all duration-500 group-hover:border-[#B8935E]/40" />
          </motion.figure>

          {/* Grid de imágenes secundarias */}
          {venueImages.slice(1).map((image, index) => {
            const realIndex = index + 1;
            const isActive = activeIndex === realIndex;
            
            return (
              <motion.figure
                key={`${image.title}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                onClick={() => setActiveIndex(realIndex)}
                className={`group relative cursor-pointer overflow-hidden rounded-[24px] border bg-[#0B0D11] shadow-lg transition-all duration-500 ${
                  isActive
                    ? "border-[#B8935E]/50 shadow-xl shadow-[#B8935E]/15"
                    : "border-[#1C1C20] hover:border-[#B8935E]/30 hover:shadow-xl"
                }`}
                style={{ minHeight: "240px" }}
              >
                <img
                  src={image.src}
                  alt={image.title}
                  width="600"
                  height="480"
                  className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110"
                  loading="lazy"
                  decoding="async"
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-t from-[#050607] via-transparent to-transparent transition-opacity duration-500 ${
                    isActive ? "opacity-50" : "opacity-75 group-hover:opacity-55"
                  }`}
                />

                {/* Badge */}
                <span className="absolute right-4 top-4 rounded-full border border-[#B8935E]/30 bg-[#0D0F13]/75 px-3 py-1 text-[9px] uppercase tracking-[0.32em] text-[#B8935E] backdrop-blur-md">
                  {image.category}
                </span>

                {/* Info hover */}
                <div className="absolute inset-x-5 bottom-5 space-y-2">
                  <h4 className="text-xl leading-tight tracking-[0.08em]">
                    {image.title}
                  </h4>
                  <p className="text-xs text-[#FAF8F3]/70 line-clamp-2">
                    {image.description}
                  </p>
                </div>
              </motion.figure>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default VenueShowcase;
