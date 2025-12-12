import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import presentationVideo from "../../../assets/videos/Presentacion.webm";

const HeroCinematic = () => {
  const containerRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.src = presentationVideo;
      videoRef.current.load();
    }
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative h-[100dvh] w-full overflow-hidden bg-black"
    >
      {/* Video Background */}
      <motion.div style={{ scale }} className="absolute inset-0">
        <video
          ref={videoRef}
          className={`h-full w-full object-cover transition-opacity duration-1000 ${
            videoLoaded ? "opacity-100" : "opacity-0"
          }`}
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => setVideoLoaded(true)}
        />
        {/* Overlay gradiente */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black" />
      </motion.div>

      {/* Contenido Central */}
      <motion.div
        style={{ opacity, y }}
        className="relative z-10 flex h-full flex-col items-center justify-center px-6"
      >
        {/* Logo / Título con efecto reveal */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="overflow-hidden"
        >
          <motion.p
            initial={{ y: 60 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.33, 1, 0.68, 1] }}
            className="text-center text-sm font-light uppercase tracking-[0.4em] text-white/70"
          >
            Barbería Premium en Sucre
          </motion.p>
        </motion.div>

        <div className="overflow-hidden">
          <motion.h1
            initial={{ y: 120 }}
            animate={{ y: 0 }}
            transition={{ duration: 1, delay: 0.7, ease: [0.33, 1, 0.68, 1] }}
            className="mt-4 text-center text-[15vw] font-bold leading-[0.85] tracking-tighter text-white sm:text-[12vw] md:text-[10vw]"
          >
            SUNSETZ
          </motion.h1>
        </div>

        {/* Línea decorativa animada */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, delay: 1.2, ease: [0.33, 1, 0.68, 1] }}
          className="mt-8 h-[1px] w-24 origin-center bg-gradient-to-r from-transparent via-[#B8935E] to-transparent"
        />

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="mt-6 text-center text-lg font-light text-white/60 md:text-xl"
        >
          Donde cada corte cuenta una historia
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6 }}
          className="mt-10"
        >
          <Link
            to="/reservas"
            className="group relative overflow-hidden rounded-full bg-white px-10 py-4 text-sm font-semibold uppercase tracking-wider text-black transition-all duration-300 hover:bg-[#B8935E] hover:text-white"
          >
            <span className="relative z-10">Reservar Ahora</span>
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">
            Scroll
          </span>
          <div className="h-12 w-[1px] bg-gradient-to-b from-white/40 to-transparent" />
        </motion.div>
      </motion.div>

      {/* Detalle lateral */}
      <div className="absolute right-6 top-1/2 z-10 hidden -translate-y-1/2 md:block">
        <div className="flex flex-col items-center gap-4">
          <div className="h-20 w-[1px] bg-white/20" />
          <span className="rotate-90 text-[10px] uppercase tracking-[0.3em] text-white/40">
            Est. 2020
          </span>
          <div className="h-20 w-[1px] bg-white/20" />
        </div>
      </div>
    </section>
  );
};

export default HeroCinematic;
