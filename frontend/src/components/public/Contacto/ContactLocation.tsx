import { motion } from "framer-motion";
import { businessInfo } from "../../../data/businessInfo";

const ContactLocation = () => {
  return (
    <section className="relative overflow-hidden bg-[#0D0D0D] py-24 text-[#FAF8F3]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(10,25,41,0.32),_transparent_72%)]" />
      <div className="relative mx-auto max-w-5xl px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-5 text-center"
        >
          <h3 className="text-3xl uppercase tracking-[0.08em] text-[#FAF8F3] lg:text-[2.6rem]">
            Encuéntranos en {businessInfo.location.plaza}, {businessInfo.location.city}.
          </h3>
          <p className="mx-auto max-w-2xl text-sm text-[#FAF8F3]/70">
            Este espacio mostrará tu mapa interactivo y recorrido virtual del lounge en el centro histórico. Usa el placeholder para planificar la integración.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-12 h-72 rounded-[28px] border border-[#B8935E]/15 bg-gradient-to-br from-[#151515] via-[#131313] to-[#0D0D0D] shadow-[0_25px_60px_rgba(0,0,0,0.55)]"
        >
          <div className="flex h-full flex-col items-center justify-center gap-4 text-sm text-[#FAF8F3]/80">
            <span className="rounded-full border border-[#B8935E]/25 bg-[#0A1929]/30 px-5 py-1.5 text-[11px] uppercase tracking-[0.32em] text-[#B8935E]">
              Placeholder mapa
            </span>
            <p className="max-w-md text-xs text-[#FAF8F3]/70">
              Inserta aquí el iframe de Google Maps o tu recorrido 360° cuando esté listo.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactLocation;
