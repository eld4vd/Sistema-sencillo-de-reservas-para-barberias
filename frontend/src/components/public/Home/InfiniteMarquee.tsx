import { memo } from "react";
import { motion } from "framer-motion";

// rendering-hoist-jsx: static data hoisted outside component
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

const marqueeTransition = {
  duration: 20,
  repeat: Infinity,
  ease: "linear",
} as const;

// rerender-memo: extract marquee row to memoized component
const MarqueeRow = memo(function MarqueeRow({ prefix }: { prefix: string }) {
  return (
    <motion.div
      animate={{ x: "-100%" }}
      transition={marqueeTransition}
      className="flex flex-shrink-0 items-center gap-8"
    >
      {words.map((word, index) => (
        <span
          key={`${prefix}-${index}`}
          className="whitespace-nowrap text-xl font-bold uppercase tracking-wider text-black md:text-2xl"
        >
          {word}
        </span>
      ))}
    </motion.div>
  );
});

const InfiniteMarquee = () => {
  return (
    <section className="relative overflow-hidden bg-[#B8935E] py-6">
      <div className="flex">
        <MarqueeRow prefix="marquee1" />
        <MarqueeRow prefix="marquee2" />
      </div>
    </section>
  );
};

export default InfiniteMarquee;
