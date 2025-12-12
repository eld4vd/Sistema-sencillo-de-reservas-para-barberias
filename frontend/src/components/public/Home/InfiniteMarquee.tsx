import { motion } from "framer-motion";

const InfiniteMarquee = () => {
  const words = [
    "CORTES CLÁSICOS",
    "•",
    "FADE EXPERTO",
    "•",
    "BARBA PREMIUM",
    "•",
    "ESTILO ÚNICO",
    "•",
    "TRADICIÓN",
    "•",
    "PRECISIÓN",
    "•",
  ];

  return (
    <section className="relative overflow-hidden bg-[#B8935E] py-6">
      <div className="flex">
        {/* Primera copia */}
        <motion.div
          animate={{ x: "-100%" }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="flex flex-shrink-0 items-center gap-8"
        >
          {words.map((word, index) => (
            <span
              key={`marquee1-${index}`}
              className="whitespace-nowrap text-xl font-bold uppercase tracking-wider text-black md:text-2xl"
            >
              {word}
            </span>
          ))}
        </motion.div>
        {/* Segunda copia (loop continuo) */}
        <motion.div
          animate={{ x: "-100%" }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="flex flex-shrink-0 items-center gap-8"
        >
          {words.map((word, index) => (
            <span
              key={`marquee2-${index}`}
              className="whitespace-nowrap text-xl font-bold uppercase tracking-wider text-black md:text-2xl"
            >
              {word}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default InfiniteMarquee;
