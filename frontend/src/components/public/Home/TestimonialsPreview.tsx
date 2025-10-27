import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { FaStar } from "react-icons/fa";

interface Testimonial {
  name: string;
  role: string;
  quote: string;
  rating: number;
  service: string;
  initials: string;
  gradientFrom: string;
  gradientTo: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Eduardo Salvatierra",
    role: "Empresario",
    quote:
      "Un club privado donde cada sesión define mi presencia antes de entrar a una sala de juntas.",
    rating: 5,
    service: "Membresía Signature",
    initials: "ES",
    gradientFrom: "#B8935E",
    gradientTo: "#8B6F47",
  },
  {
    name: "Diego Montaño",
    role: "Curador de arte",
    quote:
      "La experiencia Old School reinventa la barbería clásica con un nivel de detalle que nunca vi en Bolivia.",
    rating: 5,
    service: "Experiencia Old School",
    initials: "DM",
    gradientFrom: "#6B7280",
    gradientTo: "#4B5563",
  },
  {
    name: "Daniela Chávez",
    role: "Productora audiovisual",
    quote:
      "Llevo a mis talentos antes de cada premiere. Salen con seguridad escénica y acabado impecable.",
    rating: 5,
    service: "Fade + Beard Sculpting",
    initials: "DC",
    gradientFrom: "#B8935E",
    gradientTo: "#6B7280",
  },
  {
    name: "Andrés Villarroel",
    role: "Arquitecto",
    quote:
      "La atención al detalle y el ambiente hacen que cada visita sea una experiencia de lujo asequible.",
    rating: 5,
    service: "Corte Ejecutivo",
    initials: "AV",
    gradientFrom: "#4B5563",
    gradientTo: "#1F2937",
  },
];

const ClientTestimonials = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden bg-gradient-to-b from-[#050607] via-[#060708] to-[#050607] py-20 text-[#FAF8F3] md:py-32"
    >
      <motion.div
        style={{ y, opacity }}
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_65%_35%,_rgba(184,147,94,0.12),_transparent_55%)]"
      />
      <div className="pointer-events-none absolute left-0 top-1/3 h-[350px] w-[350px] bg-[radial-gradient(circle,_rgba(184,147,94,0.06),_transparent_70%)] blur-3xl" />

      <div className="relative mx-auto max-w-[1450px] px-4 sm:px-6 lg:px-10">
        <div className="mb-14 grid gap-10 lg:grid-cols-[1.15fr_0.95fr]">
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <span className="inline-block h-0.5 w-14 bg-[#B8935E]/65" />
              <span className="text-[10px] uppercase tracking-[0.28em] text-[#B8935E]">
                Testimonios 100% reales
              </span>
            </div>
            <h2
              className="max-w-2xl text-[2.9rem] leading-[1.1] md:text-[3.7rem]"
            >
              Clientes que transformaron su imagen con nosotros
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="flex flex-col justify-end space-y-5"
          >
            <p className="text-base leading-relaxed text-[#FAF8F3]/75">
              Más de 350 profesionales y ejecutivos confían en Sunsetz para mantener su estilo impecable.
            </p>
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="text-[#B8935E]" size={18} />
                ))}
              </div>
              <div className="h-8 w-px bg-[#FAF8F3]/20" />
              <span className="text-sm font-medium text-[#FAF8F3]">
                <strong className="text-[#B8935E]">4.9/5</strong> · 127 reseñas verificadas
              </span>
            </div>
          </motion.div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((testimonial, index) => {
            const isHovered = hoveredIndex === index;

            return (
              <motion.article
                key={`${testimonial.name}-${index}`}
                initial={{ opacity: 0, y: 38 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.48, delay: index * 0.09 }}
                onHoverStart={() => setHoveredIndex(index)}
                onHoverEnd={() => setHoveredIndex(null)}
                className={`group relative flex flex-col overflow-hidden rounded-[26px] border bg-gradient-to-br from-[#0B0D11] via-[#050607] to-[#0B0D11] p-7 shadow-xl transition-all duration-500 ${
                  isHovered
                    ? "border-[#B8935E]/55 shadow-2xl shadow-[#B8935E]/18 -translate-y-2 scale-[1.02]"
                    : "border-[#1C1C20]/80"
                }`}
              >
                <motion.div
                  animate={{
                    scale: isHovered ? 1.25 : 1,
                    rotate: isHovered ? 95 : 0,
                    opacity: isHovered ? 0.12 : 0.08,
                  }}
                  transition={{ duration: 0.65, ease: "easeOut" }}
                  className="absolute -right-10 -top-10 h-36 w-36 rounded-full blur-2xl"
                  style={{
                    background: `linear-gradient(140deg, ${testimonial.gradientFrom}, ${testimonial.gradientTo})`,
                  }}
                />

                <div className="relative z-10 mb-5 flex items-start justify-between">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-[18px] text-lg font-bold shadow-lg transition-transform duration-500 group-hover:scale-105"
                    style={{
                      background: `linear-gradient(138deg, ${testimonial.gradientFrom}, ${testimonial.gradientTo})`,
                    }}
                  >
                    {testimonial.initials}
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <div className="flex gap-0.5">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <FaStar key={i} className="text-[#B8935E]" size={11} />
                      ))}
                    </div>
                    <span className="rounded-full bg-[#B8935E]/12 px-3 py-0.5 text-[9px] font-medium uppercase tracking-[0.32em] text-[#B8935E]">
                      Verificado
                    </span>
                  </div>
                </div>

                <blockquote className="relative z-10 mb-6 flex-1">
                  <p className="text-[15px] leading-relaxed text-[#FAF8F3]/85 italic">
                    "{testimonial.quote}"
                  </p>
                </blockquote>

                <div className="relative z-10 space-y-3.5 border-t border-[#1C1C20]/70 pt-5">
                  <div>
                    <h4 className="text-[1.2rem] leading-tight">
                      {testimonial.name}
                    </h4>
                    <p className="mt-0.5 text-[11px] uppercase tracking-[0.28em] text-[#FAF8F3]/70">
                      {testimonial.role}
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5 text-[10px] uppercase tracking-[0.24em] text-[#B8935E]/80">
                    <span className="h-px flex-1 bg-[#B8935E]/35" />
                    <span>{testimonial.service}</span>
                  </div>
                </div>

                <motion.div
                  animate={{
                    opacity: isHovered ? 0.16 : 0,
                    scale: isHovered ? 1 : 0.85,
                  }}
                  transition={{ duration: 0.42 }}
                  className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#B8935E] via-transparent to-transparent"
                />
              </motion.article>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.42 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-5 rounded-full border border-[#1C1C20]/85 bg-[#0B0D11]/55 px-9 py-5 backdrop-blur-md transition-all duration-500 hover:border-[#B8935E]/40 hover:bg-[#0B0D11]/75">
            <div className="flex -space-x-3.5">
              {testimonials.slice(0, 3).map((t, i) => (
                <div
                  key={i}
                  className="flex h-11 w-11 items-center justify-center rounded-full border-[2.5px] border-[#0D0D0D] text-xs font-bold shadow-xl transition-transform duration-300 hover:scale-110"
                  style={{
                    background: `linear-gradient(138deg, ${t.gradientFrom}, ${t.gradientTo})`,
                  }}
                >
                  {t.initials}
                </div>
              ))}
            </div>
            <div className="text-left">
              <p className="text-[15px] font-semibold tracking-tight text-[#FAF8F3]">
                +350 clientes satisfechos
              </p>
              <p className="text-xs text-[#FAF8F3]/70">
                Únete a la comunidad de estilo Sunsetz
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ClientTestimonials;
