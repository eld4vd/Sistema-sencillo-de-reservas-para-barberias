import { useRef, memo } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

// Importar imágenes
import midFade from "../../../assets/images/cortes/mid-fade.jpg";
import pompadour from "../../../assets/images/cortes/pompadour-moderno.jpg";
import quiff from "../../../assets/images/cortes/quiff-texturizado.jpg";
import frenchCrop from "../../../assets/images/cortes/french-crop.jpg";
import undercut from "../../../assets/images/cortes/undercut.jpg";
import flow from "../../../assets/images/cortes/flow.jpg";
import mullet from "../../../assets/images/cortes/mullet-corto.jpg";
import crewCut from "../../../assets/images/cortes/crew-cut-texturizado.jpg";

// rendering-hoist-jsx: static data hoisted outside component
const cuts = [
  { image: midFade, name: "Mid Fade" },
  { image: pompadour, name: "Pompadour" },
  { image: quiff, name: "Quiff" },
  { image: frenchCrop, name: "French Crop" },
  { image: undercut, name: "Undercut" },
  { image: flow, name: "Flow" },
  { image: mullet, name: "Mullet" },
  { image: crewCut, name: "Crew Cut" },
];

const reversedCuts = [...cuts].reverse();

// rendering-hoist-jsx: static gradient overlays
const leftGradient = (
  <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent" />
);
const rightGradient = (
  <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent" />
);

// rerender-memo: extract gallery card into memoized component
interface GalleryCardProps {
  image: string;
  name: string;
  index: number;
  prefix: string;
  height: string;
  width: string;
  showSubtext?: boolean;
}

const GalleryCard = memo(function GalleryCard({
  image,
  name,
  index,
  prefix,
  height,
  width,
  showSubtext = true,
}: GalleryCardProps) {
  return (
    <motion.div
      key={`${prefix}-${name}`}
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className={`group relative ${height} ${width} flex-shrink-0 overflow-hidden rounded-2xl`}
    >
      <img
        src={image}
        alt={name}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
        <p className="text-lg font-semibold text-white">{name}</p>
        {showSubtext ? <p className="text-sm text-white/60">Ver estilo →</p> : null}
      </div>
      <div className="absolute inset-0 rounded-2xl border border-white/0 transition-[border-color] duration-300 group-hover:border-[#B8935E]/50" />
    </motion.div>
  );
});

const HorizontalGallery = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const x = useTransform(scrollYProgress, [0, 1], ["5%", "-45%"]);
  const x2 = useTransform(scrollYProgress, [0, 1], ["-5%", "25%"]);

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden bg-black py-32"
    >
      {/* Título */}
      <div className="mb-16 px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs font-medium uppercase tracking-[0.4em] text-[#B8935E]"
        >
          Nuestra Galería
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-4 text-4xl font-bold text-white md:text-6xl"
        >
          Estilos que definen
        </motion.h2>
      </div>

      {/* Primera fila - se mueve hacia la izquierda */}
      <motion.div style={{ x }} className="mb-6 flex gap-6 pl-6">
        {cuts.map((cut, index) => (
          <GalleryCard
            key={`row1-${cut.name}`}
            image={cut.image}
            name={cut.name}
            index={index}
            prefix="row1"
            height="h-[350px] md:h-[450px]"
            width="w-[280px] md:w-[350px]"
          />
        ))}
      </motion.div>

      {/* Segunda fila - se mueve hacia la derecha */}
      <motion.div style={{ x: x2 }} className="flex gap-6 pl-6">
        {reversedCuts.map((cut, index) => (
          <GalleryCard
            key={`row2-${cut.name}`}
            image={cut.image}
            name={cut.name}
            index={index}
            prefix="row2"
            height="h-[300px] md:h-[400px]"
            width="w-[240px] md:w-[320px]"
            showSubtext={false}
          />
        ))}
      </motion.div>

      {/* Decoración lateral */}
      {leftGradient}
      {rightGradient}
    </section>
  );
};

export default HorizontalGallery;
