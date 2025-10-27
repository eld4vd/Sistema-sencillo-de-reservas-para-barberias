import { motion } from "framer-motion";
import retratoDueno from "../../../assets/images/Sobre-Nosotros/dueño.jpg";

const HeroSobreNosotros = () => {
  return (
  <section 
    className="relative overflow-hidden bg-[#0D0D0D] pb-20 pt-24 text-[#FAF8F3] lg:py-28"
    aria-labelledby="hero-title"
  >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(10,25,41,0.45),_transparent_65%)]" />
      <div className="relative mx-auto flex max-w-6xl flex-col-reverse gap-12 px-6 lg:flex-row lg:items-center lg:gap-20 lg:px-12">
        <motion.figure
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex-1"
        >
          <div className="relative mx-auto max-w-[520px]">
            <div className="absolute -inset-2 rounded-[40px] bg-gradient-to-br from-[#0A1929]/35 via-transparent to-[#B8935E]/35 blur-3xl" />
            <div className="relative overflow-hidden rounded-[36px] border border-[#2A2A2A] bg-[#0D0D0D]/60 shadow-[0_32px_80px_rgba(0,0,0,0.6)]">
              <img
                src={retratoDueno}
                alt="Leonel Quiroga, fundador de Barbería Sunsetz"
                width="1040"
                height="1300"
                className="h-full w-full object-cover"
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D]/85 via-[#0D0D0D]/45 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 rounded-[28px] border border-[#2A2A2A] bg-[#0D0D0D]/75 px-8 py-6 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.32em] text-[#B8935E]">Dueño Sunsetz</p>
                <p className="mt-3 text-2xl font-semibold text-[#FAF8F3]">Leonel Quiroga</p>
              </div>
            </div>
          </div>
        </motion.figure>

        <div className="flex-1 space-y-10 lg:max-w-xl">
          <span className="inline-flex items-center gap-3 rounded-full border border-[#0A1929]/40 bg-[#0A1929]/20 px-6 py-2 text-xs uppercase tracking-[0.32em] text-[#B8935E]">
            Barbería Sunsetz
          </span>
          <h1
            id="hero-title"
            className="text-5xl leading-[1.15] tracking-[0.02em]"
          >
            Estilo boliviano con sello latino.
          </h1>
          <blockquote className="text-lg italic text-[#FAF8F3]/75">
            “Cada cliente merece un cierre impecable y una charla sincera.”
          </blockquote>
          <div className="flex flex-wrap gap-3 text-xs text-[#FAF8F3]/70">
            {["Sucre", "Buenos Aires", "Música urbana", "Hospitalidad cálida"].map((etiqueta) => (
              <span
                key={etiqueta}
                className="rounded-full border border-[#2A2A2A] bg-[#2A2A2A]/70 px-4 py-2"
              >
                {etiqueta}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSobreNosotros;
