import { motion } from "framer-motion";
import retratoDueno from "../../../assets/images/Sobre-Nosotros/dueño.jpg";
import retratoBarberoUno from "../../../assets/images/Sobre-Nosotros/peluquero1.jpg";
import retratoBarberoDos from "../../../assets/images/Sobre-Nosotros/peluquero2.jpg";
import retratoBarberoTres from "../../../assets/images/Sobre-Nosotros/peluquero3.jpg";

const fundador = {
  nombre: "Leonel Quiroga",
  frase: "Fundador chuquisaqueño que dirige cada sesión Sunsetz con precisión boutique.",
  foto: retratoDueno,
};

const equipo = [
  {
    nombre: "Marcos Vidal",
    frase: "Especialista en cortes clásicos y modernos para todos los estilos.",
    foto: retratoBarberoUno,
  },
  {
    nombre: "Alessia Ríos",
    frase: "Experta en coloración, peinados y estilizado profesional.",
    foto: retratoBarberoDos,
  },
  {
    nombre: "Gabriel Méndez",
    frase: "Barbero con experiencia en cortes, afeitados y cuidado de la barba.",
    foto: retratoBarberoTres,
  },
];

const EquipoSunsetz = () => {
  return (
    <section 
      className="relative overflow-hidden bg-[#0D0D0D] pb-24 pt-28 text-[#FAF8F3] lg:py-32"
      aria-labelledby="team-title"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(10,25,41,0.25),_transparent_75%)]" />
      <div className="relative mx-auto max-w-6xl px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex flex-col items-center text-center"
        >
          <span className="rounded-full border border-[#0A1929]/45 bg-[#0A1929]/25 px-6 py-2 text-xs uppercase tracking-[0.24em] text-[#B8935E]">
            Nuestra familia
          </span>
          <h3
            id="team-title"
            className="mt-6 max-w-2xl text-4xl leading-[1.2] sm:text-[2.75rem]"
          >
            Los rostros detrás del flow Sunsetz.
          </h3>
        </motion.div>

        <motion.article
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05, ease: "easeOut" }}
          className="mx-auto mt-16 overflow-hidden rounded-[40px] border border-[#2A2A2A] bg-[#2A2A2A] shadow-[0_36px_90px_rgba(0,0,0,0.55)]"
        >
          <div className="relative h-[460px]">
            <img
              src={fundador.foto}
              alt={`${fundador.nombre}, fundador y líder de Barbería Sunsetz`}
              width="800"
              height="920"
              className="h-full w-full object-cover"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D]/85 via-[#0D0D0D]/35 to-transparent" />
            <div className="absolute bottom-10 left-10 right-10 rounded-[28px] border border-[#2A2A2A] bg-[#0D0D0D]/75 px-8 py-6 backdrop-blur">
              <h4
                className="text-3xl text-[#FAF8F3]"
              >
                {fundador.nombre}
              </h4>
              <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[#FAF8F3]/80">
                {fundador.frase}
              </p>
            </div>
          </div>
        </motion.article>

        <div className="mt-16 grid gap-10 lg:grid-cols-3">
          {equipo.map((integrante, index) => (
            <motion.article
              key={integrante.nombre}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.35, delay: 0.1 * index, ease: "easeOut" }}
              className="group overflow-hidden rounded-[36px] border border-[#2A2A2A] bg-[#2A2A2A] shadow-[0_32px_80px_rgba(0,0,0,0.55)] transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="relative h-[320px] sm:h-[360px] lg:h-[480px]">
                <img
                  src={integrante.foto}
                  alt={`${integrante.nombre}, especialista en ${integrante.frase.toLowerCase()}`}
                  width="600"
                  height="960"
                  className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D]/85 via-[#0D0D0D]/25 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8 rounded-[28px] border border-[#2A2A2A] bg-[#0D0D0D]/70 px-6 py-5 backdrop-blur">
                  <h5
                    className="text-2xl text-[#FAF8F3]"
                  >
                    {integrante.nombre}
                  </h5>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#FAF8F3]/75">
                    {integrante.frase}
                  </p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EquipoSunsetz;
