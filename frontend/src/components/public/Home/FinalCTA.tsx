import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

import famoso from "../../../assets/images/lugar/famoso.jpg";

const FinalCTA = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  const rotateX = useTransform(y, [-300, 300], [5, -5]);
  const rotateY = useTransform(x, [-300, 300], [-5, 5]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  return (
    <section className="relative overflow-hidden bg-black py-32">
      <div className="mx-auto max-w-6xl px-6 lg:px-12">
        <motion.div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          style={{
            rotateX: isHovered ? rotateX : 0,
            rotateY: isHovered ? rotateY : 0,
            transformPerspective: 1200,
          }}
          className="group relative overflow-hidden rounded-3xl"
        >
          {/* Imagen de fondo */}
          <div className="relative h-[500px] md:h-[600px]">
            <img
              src={famoso}
              alt="Barbería Sunsetz"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Overlay oscuro */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
          </div>

          {/* Contenido */}
          <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-16">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xs font-medium uppercase tracking-[0.4em] text-[#B8935E]"
            >
              ¿Listo para el cambio?
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-4 max-w-lg text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl"
            >
              Tu próximo
              <br />
              <span className="text-[#B8935E]">gran estilo</span>
              <br />
              te espera
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-6 max-w-md text-lg text-white/60"
            >
              Reserva tu cita ahora y descubre por qué somos la barbería
              preferida de Sucre.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-10"
            >
              <Link
                to="/reservas"
                className="group/btn inline-flex items-center gap-3 rounded-full bg-[#B8935E] px-8 py-4 text-sm font-semibold uppercase tracking-wider text-black transition-all duration-300 hover:gap-5 hover:bg-white"
              >
                Reservar Ahora
                <FaArrowRight className="transition-transform duration-300 group-hover/btn:translate-x-1" />
              </Link>
            </motion.div>
          </div>

          {/* Detalles decorativos */}
          <div className="absolute bottom-8 right-8 text-right">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">
              Plaza 25 de Mayo
            </p>
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">
              Sucre, Bolivia
            </p>
          </div>

          {/* Border glow en hover */}
          <div className="pointer-events-none absolute inset-0 rounded-3xl border border-[#B8935E]/0 transition-all duration-500 group-hover:border-[#B8935E]/30" />
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTA;
