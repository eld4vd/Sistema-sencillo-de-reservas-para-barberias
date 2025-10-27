import { motion } from "framer-motion";

const partnerPlaceholders = ["Signature Oils", "Lounge Mixology", "Tailor Allies"];

const PartnerHighlight = () => {
  return (
    <section className="relative overflow-hidden bg-[#0D0D0D] py-24 text-[#FAF8F3] lg:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(10,25,41,0.25),_transparent_72%)]" />
      <div className="relative mx-auto max-w-5xl px-6 text-center lg:px-12">
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl leading-[1.2] tracking-[0.1em]"
        >
          Alianzas y marcas invitadas.
        </motion.h3>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mx-auto mt-6 max-w-2xl text-sm text-[#FAF8F3]/70"
        >
          Cuando definas tus colaboradores, reemplaza estos placeholders por logos y descripciones breves.
        </motion.p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {partnerPlaceholders.map((partner) => (
            <motion.div
              key={partner}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-full border border-[#0A1929]/40 bg-[#0A1929]/20 px-6 py-3 text-sm uppercase tracking-[0.35em] text-[#B8935E]"
            >
              {partner}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnerHighlight;
