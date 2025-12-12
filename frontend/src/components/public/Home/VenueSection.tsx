import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

import local from "../../../assets/images/lugar/local.jpg";
import peluqueria1 from "../../../assets/images/lugar/peluqueria1.jpg";
import peluqueria2 from "../../../assets/images/lugar/peluqueria2.jpg";
import peluqueria3 from "../../../assets/images/lugar/peluqueria3.jpg";
import cortando3 from "../../../assets/images/lugar/cortando3.jpg";

const images = [
  { src: local, label: "Exterior" },
  { src: peluqueria1, label: "Interior" },
  { src: cortando3, label: "En acción" },
  { src: peluqueria2, label: "Lounge" },
  { src: peluqueria3, label: "Detalles" },
];

const VenueSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const y3 = useTransform(scrollYProgress, [0, 1], [50, -50]);

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden bg-black py-32"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Header */}
        <div className="mb-20 grid gap-8 lg:grid-cols-2 lg:items-end">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xs font-medium uppercase tracking-[0.4em] text-[#B8935E]"
            >
              Nuestro Espacio
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-4xl font-bold text-white md:text-5xl lg:text-6xl"
            >
              Un lugar diseñado
              <br />
              <span className="text-white/40">para ti</span>
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-white/60 lg:text-right"
          >
            Plaza 25 de Mayo, Sucre
            <br />
            Lun - Sáb: 9:00 - 20:00
          </motion.p>
        </div>

        {/* Masonry Grid con Parallax */}
        <div className="grid gap-4 md:grid-cols-3 md:gap-6">
          {/* Columna 1 */}
          <motion.div style={{ y: y1 }} className="space-y-4 md:space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="group relative aspect-[4/5] overflow-hidden rounded-2xl"
            >
              <img
                src={images[0].src}
                alt={images[0].label}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 transition-opacity duration-300 group-hover:opacity-0" />
              <span className="absolute bottom-4 left-4 rounded-full bg-black/60 px-4 py-2 text-xs font-medium uppercase tracking-wider text-white backdrop-blur-sm">
                {images[0].label}
              </span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="group relative aspect-square overflow-hidden rounded-2xl"
            >
              <img
                src={images[1].src}
                alt={images[1].label}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 transition-opacity duration-300 group-hover:opacity-0" />
              <span className="absolute bottom-4 left-4 rounded-full bg-black/60 px-4 py-2 text-xs font-medium uppercase tracking-wider text-white backdrop-blur-sm">
                {images[1].label}
              </span>
            </motion.div>
          </motion.div>

          {/* Columna 2 */}
          <motion.div
            style={{ y: y2 }}
            className="space-y-4 pt-12 md:space-y-6 md:pt-24"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="group relative aspect-[3/4] overflow-hidden rounded-2xl"
            >
              <img
                src={images[2].src}
                alt={images[2].label}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 transition-opacity duration-300 group-hover:opacity-0" />
              <span className="absolute bottom-4 left-4 rounded-full bg-black/60 px-4 py-2 text-xs font-medium uppercase tracking-wider text-white backdrop-blur-sm">
                {images[2].label}
              </span>
            </motion.div>
          </motion.div>

          {/* Columna 3 */}
          <motion.div style={{ y: y3 }} className="space-y-4 md:space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="group relative aspect-square overflow-hidden rounded-2xl"
            >
              <img
                src={images[3].src}
                alt={images[3].label}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 transition-opacity duration-300 group-hover:opacity-0" />
              <span className="absolute bottom-4 left-4 rounded-full bg-black/60 px-4 py-2 text-xs font-medium uppercase tracking-wider text-white backdrop-blur-sm">
                {images[3].label}
              </span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="group relative aspect-[4/5] overflow-hidden rounded-2xl"
            >
              <img
                src={images[4].src}
                alt={images[4].label}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 transition-opacity duration-300 group-hover:opacity-0" />
              <span className="absolute bottom-4 left-4 rounded-full bg-black/60 px-4 py-2 text-xs font-medium uppercase tracking-wider text-white backdrop-blur-sm">
                {images[4].label}
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default VenueSection;
