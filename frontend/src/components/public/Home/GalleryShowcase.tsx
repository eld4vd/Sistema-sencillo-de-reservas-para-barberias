import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useRef } from "react";

import broccoliHaircut from "../../../assets/images/cortes/broccoli-haircut.jpg";
import crewCutTexturizado from "../../../assets/images/cortes/crew-cut-texturizado.jpg";
import curtainsLargos from "../../../assets/images/cortes/curtains-largos.jpg";
import flow from "../../../assets/images/cortes/flow.jpg";
import frenchCrop from "../../../assets/images/cortes/french-crop.jpg";
import midFade from "../../../assets/images/cortes/mid-fade.jpg";
import mulletCorto from "../../../assets/images/cortes/mullet-corto.jpg";
import pompadourModerno from "../../../assets/images/cortes/pompadour-moderno.jpg";
import quiffTexturizado from "../../../assets/images/cortes/quiff-texturizado.jpg";
import undercut from "../../../assets/images/cortes/undercut.jpg";

interface GalleryItem {
  src: string;
  title: string;
  tag: string;
  height: "small" | "medium" | "large" | "xlarge";
  parallaxSpeed: number;
  overlaps?: boolean;
}

// Masonry items con alturas variables y velocidades parallax
const masonryItems: GalleryItem[] = [
  {
    src: mulletCorto,
    title: "Mullet Corto",
    tag: "Retro",
    height: "xlarge",
    parallaxSpeed: 0.5,
  },
  {
    src: midFade,
    title: "Mid Fade Esculpido",
    tag: "Trending",
    height: "medium",
    parallaxSpeed: -0.3,
  },
  {
    src: quiffTexturizado,
    title: "Quiff Texturizado",
    tag: "Classic",
    height: "large",
    parallaxSpeed: 0.4,
    overlaps: true,
  },
  {
    src: undercut,
    title: "Undercut Pulcro",
    tag: "Sharp",
    height: "small",
    parallaxSpeed: -0.2,
  },
  {
    src: frenchCrop,
    title: "French Crop",
    tag: "Clean",
    height: "large",
    parallaxSpeed: 0.6,
  },
  {
    src: flow,
    title: "Flow Despeinado",
    tag: "Natural",
    height: "medium",
    parallaxSpeed: -0.4,
    overlaps: true,
  },
  {
    src: curtainsLargos,
    title: "Curtains XL",
    tag: "Soft",
    height: "xlarge",
    parallaxSpeed: 0.3,
  },
  {
    src: broccoliHaircut,
    title: "Broccoli Texture",
    tag: "Bold",
    height: "small",
    parallaxSpeed: -0.5,
  },
  {
    src: crewCutTexturizado,
    title: "Crew Cut Supremo",
    tag: "Timeless",
    height: "medium",
    parallaxSpeed: 0.2,
  },
  {
    src: pompadourModerno,
    title: "Pompadour Moderno",
    tag: "Signature",
    height: "large",
    parallaxSpeed: -0.3,
    overlaps: true,
  },
];

const GalleryShowcase = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax global
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Función para obtener altura según el tipo
  const getHeightClass = (height: string) => {
    switch (height) {
      case "small":
        return "h-[280px] sm:h-[320px]";
      case "medium":
        return "h-[380px] sm:h-[420px]";
      case "large":
        return "h-[480px] sm:h-[540px]";
      case "xlarge":
        return "h-[580px] sm:h-[660px]";
      default:
        return "h-[380px]";
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#050607] via-[#060708] to-[#050607] py-16 text-[#FAF8F3] md:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(184,147,94,0.08),_transparent_72%)]" />

      <div className="relative mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
        >
          <div>
            <span className="mb-2 inline-block rounded-full border border-[#B8935E]/30 bg-[#0A0B0E]/60 px-5 py-1.5 text-[10px] uppercase tracking-[0.3em] text-[#B8935E] backdrop-blur-sm">
              Portfolio 2025
            </span>
            <h2 className="mt-3 text-3xl leading-tight tracking-[0.06em] md:text-[2.75rem]">
              Cortes que definen estilo
            </h2>
          </div>
          <p className="text-xs uppercase tracking-[0.35em] text-[#FAF8F3]/70">
            10 estilos · Alta definición
          </p>
        </motion.div>

        {/* Masonry Layout tipo Pinterest */}
        <div ref={containerRef} className="relative">
          <div className="columns-1 gap-4 sm:columns-2 sm:gap-5 lg:columns-3 xl:columns-4">
            {masonryItems.map((item, index) => {
              const isHovered = hoveredIndex === index;
              
              // Parallax individual por item
              const y = useTransform(
                scrollYProgress,
                [0, 1],
                [0, item.parallaxSpeed * 100]
              );

              return (
                <motion.figure
                  key={`${item.title}-${index}`}
                  style={{ y }}
                  initial={{ opacity: 0, scale: 0.92, y: 40 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.08,
                    ease: [0.25, 0.4, 0.25, 1],
                  }}
                  onHoverStart={() => setHoveredIndex(index)}
                  onHoverEnd={() => setHoveredIndex(null)}
                  className={`
                    group relative mb-4 break-inside-avoid overflow-hidden 
                    rounded-3xl bg-[#0B0D11] shadow-lg transition-all duration-500 sm:mb-5
                    ${getHeightClass(item.height)}
                    ${isHovered ? 'z-20 scale-[1.02] shadow-2xl shadow-[#B8935E]/30' : 'shadow-black/50'}
                    ${item.overlaps ? '-ml-2 sm:-ml-4 lg:-ml-6' : ''}
                  `}
                >
                  {/* Imagen */}
                  <img
                    src={item.src}
                    alt={item.title}
                    width={600}
                    height={item.height === "xlarge" ? 900 : item.height === "large" ? 750 : 600}
                    className={`
                      h-full w-full object-cover transition-all duration-700
                      ${isHovered ? 'scale-110 brightness-110 saturate-110' : 'scale-100 brightness-95'}
                    `}
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                    sizes="(min-width: 1280px) 24vw, (min-width: 1024px) 32vw, (min-width: 640px) 48vw, 90vw"
                  />

                  {/* Overlay gradient dinámico */}
                  <div
                    className={`
                      absolute inset-0 bg-gradient-to-t transition-opacity duration-500
                      ${isHovered 
                        ? 'from-[#050607]/80 via-[#050607]/20 to-transparent opacity-70' 
                        : 'from-[#050607]/90 via-[#050607]/40 to-transparent opacity-85'
                      }
                    `}
                  />

                  {/* Tag flotante */}
                  <motion.span
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08 + 0.3 }}
                    className="absolute right-4 top-4 rounded-full border border-[#B8935E]/50 bg-[#0D0F13]/90 px-4 py-1.5 text-[10px] uppercase tracking-[0.35em] text-[#B8935E] backdrop-blur-md shadow-lg"
                  >
                    {item.tag}
                  </motion.span>

                  {/* Info siempre visible + detalles en hover */}
                  <div className="absolute inset-x-5 bottom-5">
                    <motion.h3
                      animate={{
                        y: isHovered ? -5 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                      className={`
                        leading-tight tracking-[0.08em] transition-all duration-300
                        ${item.height === "xlarge" || item.height === "large" 
                          ? 'text-2xl sm:text-3xl' 
                          : 'text-xl sm:text-2xl'
                        }
                        ${isHovered ? 'text-[#FAF8F3]' : 'text-[#FAF8F3]/90'}
                      `}
                    >
                      {item.title}
                    </motion.h3>

                    {/* Descripción adicional en hover (solo en grandes) */}
                    {(item.height === "xlarge" || item.height === "large") && (
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{
                          opacity: isHovered ? 1 : 0,
                          y: isHovered ? 0 : 10,
                        }}
                        transition={{ duration: 0.3 }}
                        className="mt-2 text-sm text-[#FAF8F3]/80"
                      >
                        Técnica avanzada con acabado premium
                      </motion.p>
                    )}
                  </div>

                  {/* Border glow */}
                  <div
                    className={`
                      pointer-events-none absolute inset-0 rounded-3xl border transition-all duration-500
                      ${isHovered ? 'border-[#B8935E]/60 shadow-inner' : 'border-[#1C1C20]/50'}
                    `}
                  />

                  {/* Efecto de brillo en hover */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    transition={{ duration: 0.4 }}
                    className="pointer-events-none absolute -inset-1 rounded-3xl bg-gradient-to-br from-[#B8935E]/20 via-transparent to-[#B8935E]/10 blur-xl"
                  />
                </motion.figure>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-[#FAF8F3]/60">
            Cada corte es único y personalizado según tu estilo
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="h-px w-12 bg-[#B8935E]/40" />
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#B8935E]/70">
              Plaza 25 de Mayo, Sucre
            </span>
            <span className="h-px w-12 bg-[#B8935E]/40" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default GalleryShowcase;
