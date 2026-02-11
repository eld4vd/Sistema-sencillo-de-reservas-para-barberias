import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaCalendarAlt } from "react-icons/fa";
import presentationVideo from "../../../assets/videos/presentacion.webm";


const HeroSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Parallax suave para el video
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const videoY = useTransform(scrollYProgress, [0, 1], [0, 100]);

  // Cargar video DESPUÉS del first paint (no bloquea LCP)
  useEffect(() => {
    // Usar requestIdleCallback si está disponible, sino setTimeout
    const loadVideo = () => {
      if (videoRef.current && !videoRef.current.src) {
        videoRef.current.src = presentationVideo;
        videoRef.current.load();
      }
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(loadVideo);
    } else {
      setTimeout(loadVideo, 50);
    }
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative overflow-hidden bg-gradient-to-b from-[#050607] via-[#060708] to-[#050607]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(184,147,94,0.12),_transparent_68%)]" />
      
      {/* Círculos decorativos optimizados */}
      <div className="absolute -right-16 top-12 h-64 w-64 rounded-full border border-[#14161B]/40" />
      <div className="absolute -left-20 bottom-6 h-64 w-64 rounded-full border border-[#B8935E]/15" />
      
      <div className="relative mx-auto flex max-w-7xl flex-col gap-10 px-6 pb-20 pt-20 md:flex-row md:items-center md:gap-12 lg:px-12 lg:pt-24">
        
        {/* Columna de texto */}
        <div className="flex-1 space-y-7">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#B8935E]/30 bg-[#0A1929]/20 px-4 py-1.5 text-[11px] font-medium text-[#B8935E]">
            Plaza 25 de Mayo, Sucre
          </span>

          <h1 className="max-w-2xl text-5xl font-semibold leading-tight text-[#FAF8F3] sm:text-6xl lg:text-7xl">
            Barbería profesional{" "}
            <span className="text-[#B8935E]">en el centro de Sucre</span>
          </h1>

          <p className="max-w-xl text-lg text-[#FAF8F3]/75">
            Cortes modernos, afeitado clásico y productos premium.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/reservas"
              className="flex items-center gap-2 rounded-full bg-[#B8935E] px-7 py-3.5 text-base font-semibold text-[#0D0D0D] shadow-lg transition-all hover:bg-[#C9A46F]"
            >
              <FaCalendarAlt />
              Reservar turno
            </Link>
            <Link
              to="/tienda"
              className="flex items-center gap-2 rounded-full border border-[#B8935E]/40 px-7 py-3.5 text-base font-medium text-[#FAF8F3] transition-all hover:border-[#B8935E] hover:bg-[#B8935E]/10"
            >
              Ver productos
            </Link>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{ y: videoY }}
          className="flex-1"
        >
          <div className="relative mx-auto w-full max-w-[620px]">
            <div className="relative overflow-hidden rounded-2xl border border-[#2A2A2A] bg-[#0D0D0D] shadow-2xl">
              <video
                ref={videoRef}
                className="block h-[320px] w-full object-cover sm:h-[400px] lg:h-[480px]"
                autoPlay
                loop
                muted
                playsInline
                preload="none"
                poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 620 480'%3E%3Crect fill='%230D0D0D' width='620' height='480'/%3E%3C/svg%3E"
                aria-label="Barbería Sunsetz"
              >
                Tu navegador no soporta video HTML5.
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D]/60 to-transparent pointer-events-none" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
