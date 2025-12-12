import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { FaClock, FaArrowRight } from "react-icons/fa";

interface Transformation {
  id: number;
  clientName: string;
  before: string;
  during: string;
  after: string;
  duration: string;
  service: string;
  barber: string;
}

const transformations: Transformation[] = [
  {
    id: 1,
    clientName: "Juan P.",
    before: "/src/assets/images/cortes/mullet-corto.jpg",
    during: "/src/assets/images/lugar/cortando3.jpg",
    after: "/src/assets/images/cortes/mid-fade.jpg",
    duration: "25 min",
    service: "Mid Fade + Barba",
    barber: "Carlos"
  },
  {
    id: 2,
    clientName: "Diego M.",
    before: "/src/assets/images/cortes/undercut.jpg",
    during: "/src/assets/images/lugar/peluqueria1.jpg",
    after: "/src/assets/images/cortes/pompadour-moderno.jpg",
    duration: "30 min",
    service: "Pompadour Premium",
    barber: "Miguel"
  },
  {
    id: 3,
    clientName: "Luis R.",
    before: "/src/assets/images/cortes/crew-cut-texturizado.jpg",
    during: "/src/assets/images/lugar/peluqueria2.jpg",
    after: "/src/assets/images/cortes/quiff-texturizado.jpg",
    duration: "20 min",
    service: "Quiff Texturizado",
    barber: "Javier"
  },
  {
    id: 4,
    clientName: "Marco A.",
    before: "/src/assets/images/cortes/flow.jpg",
    during: "/src/assets/images/lugar/peluqueria3.jpg",
    after: "/src/assets/images/cortes/french-crop.jpg",
    duration: "22 min",
    service: "French Crop",
    barber: "Carlos"
  }
];

const TransformationTimeline = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);

  return (
    <section ref={containerRef} className="relative overflow-hidden bg-[#050607] py-24 text-white">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(184,147,94,0.08),_transparent_70%)]" />
      
      <div className="relative">
        {/* Header */}
        <div className="mx-auto max-w-7xl px-6 mb-12 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h2 className="text-5xl font-bold md:text-6xl">
              Historias de transformación
            </h2>
            <p className="text-xl text-white/70 max-w-2xl">
              Cada cliente es único. Desliza para ver el proceso completo de transformación.
            </p>
          </motion.div>
        </div>

        {/* Timeline Horizontal */}
        <motion.div style={{ x }} className="flex gap-6 px-6 lg:px-12">
          {transformations.map((t, index) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative min-w-[320px] sm:min-w-[400px]"
            >
              <div className="relative overflow-hidden rounded-2xl border border-[#2A2A2A] bg-[#0D0D0D] p-6 transition-all hover:border-[#B8935E]/50 hover:shadow-[0_20px_50px_rgba(184,147,94,0.2)]">
                
                {/* Cliente Info */}
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">{t.clientName}</h3>
                    <p className="text-sm text-white/60">Cliente real</p>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-[#B8935E]/20 px-3 py-1 text-sm font-medium text-[#B8935E]">
                    <FaClock />
                    {t.duration}
                  </div>
                </div>

                {/* Timeline visual de 3 imágenes */}
                <div className="space-y-4">
                  {/* ANTES */}
                  <div className="relative">
                    <div className="absolute left-4 top-4 z-10 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-black">
                      ANTES
                    </div>
                    <img
                      src={t.before}
                      alt={`${t.clientName} antes`}
                      className="h-48 w-full rounded-xl object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* Flecha indicadora */}
                  <div className="flex items-center justify-center">
                    <FaArrowRight className="text-2xl text-[#B8935E]" />
                  </div>

                  {/* DURANTE */}
                  <div className="relative">
                    <div className="absolute left-4 top-4 z-10 rounded-full bg-[#B8935E] px-3 py-1 text-xs font-bold text-black">
                      PROCESO
                    </div>
                    <img
                      src={t.during}
                      alt={`${t.clientName} durante`}
                      className="h-48 w-full rounded-xl object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* Flecha indicadora */}
                  <div className="flex items-center justify-center">
                    <FaArrowRight className="text-2xl text-[#B8935E]" />
                  </div>

                  {/* DESPUÉS */}
                  <div className="relative">
                    <div className="absolute left-4 top-4 z-10 rounded-full bg-[#B8935E] px-3 py-1 text-xs font-bold text-black">
                      RESULTADO
                    </div>
                    <img
                      src={t.after}
                      alt={`${t.clientName} después`}
                      className="h-48 w-full rounded-xl object-cover ring-2 ring-[#B8935E]/50"
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* Info del servicio */}
                <div className="mt-6 space-y-2 border-t border-white/10 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Servicio:</span>
                    <span className="font-medium">{t.service}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Barbero:</span>
                    <span className="font-medium">{t.barber}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Card final: CTA */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="min-w-[320px] sm:min-w-[400px]"
          >
            <div className="flex h-full items-center justify-center rounded-2xl border-2 border-dashed border-[#B8935E]/40 bg-gradient-to-br from-[#B8935E]/10 to-transparent p-12 text-center">
              <div className="space-y-6">
                <h3 className="text-3xl font-bold">¿Listo para tu transformación?</h3>
                <p className="text-white/70">
                  Únete a más de 1000 clientes satisfechos
                </p>
                <a
                  href="/reservas"
                  className="inline-flex items-center gap-2 rounded-full bg-[#B8935E] px-8 py-4 text-lg font-bold text-black transition-all hover:scale-105 hover:shadow-[0_20px_50px_rgba(184,147,94,0.4)]"
                >
                  Agendar ahora
                  <FaArrowRight />
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Hint de scroll */}
        <div className="mt-8 text-center">
          <p className="text-sm text-white/50">
            ← Desliza horizontalmente para ver más transformaciones →
          </p>
        </div>
      </div>
    </section>
  );
};

export default TransformationTimeline;
