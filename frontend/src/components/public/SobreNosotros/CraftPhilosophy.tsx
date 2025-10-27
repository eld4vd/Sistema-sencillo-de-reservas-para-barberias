import { motion } from "framer-motion";

const resaltados = [
  {
    titulo: "Turnos a tu ritmo",
    detalle: "Sesiones largas, cero apuro. Tu silla es tuya.",
  },
  {
    titulo: "Manos latinas",
    detalle: "Pulso andino con sazón chuquisaqueña en cada corte.",
  },
  {
    titulo: "Lounge con onda",
    detalle: "Beat urbano, vermut y charlas entre amigos.",
  },
];

const FilosofiaSunsetz = () => {
  return (
    <section 
      className="relative bg-[#0D0D0D] py-24 text-[#FAF8F3] lg:py-28"
      aria-labelledby="philosophy-title"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(10,25,41,0.35),_transparent_70%)]" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-14 px-6 lg:flex-row lg:items-center lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex-1 space-y-6"
        >
          <span className="inline-flex rounded-full border border-[#0A1929]/45 bg-[#0A1929]/20 px-6 py-2 text-xs uppercase tracking-[0.22em] text-[#B8935E]">
            Nuestro ritmo
          </span>
          <h2
            id="philosophy-title"
            className="max-w-xl text-4xl leading-[1.2] sm:text-[3rem]"
          >
            Menos discurso, más barbería con corazón.
          </h2>
          <p className="max-w-xl text-base leading-relaxed text-[#FAF8F3]/80">
            Somos un punto de encuentro: música, buena vibra y técnica impecable para que salgas sintiéndote distinto.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }}
          className="flex-1 grid gap-6 sm:grid-cols-3"
        >
          {resaltados.map((item) => (
            <div
              key={item.titulo}
              className="rounded-[24px] border border-[#2A2A2A] bg-[#2A2A2A] p-8 text-left shadow-[0_24px_60px_rgba(0,0,0,0.45)] transition-transform duration-300 hover:-translate-y-1"
            >
              <h3
                className="text-xl text-[#FAF8F3]"
              >
                {item.titulo}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-[#FAF8F3]/75">{item.detalle}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FilosofiaSunsetz;
