import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaCalendarAlt, FaStar, FaUsers } from "react-icons/fa";
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
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);

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
          {/* Badge animado */}
          <span className="inline-flex items-center gap-2.5 rounded-full border border-[#B8935E]/40 bg-[#0A1929]/30 px-5 py-2 text-[10px] uppercase tracking-[0.3em] text-[#B8935E] backdrop-blur-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#B8935E]" />
            Sucre · Plaza 25 de Mayo
          </span>

          {/* Título principal - más corto y potente */}
          <h1 className="max-w-2xl text-5xl font-semibold leading-[1.1] tracking-tight text-[#FAF8F3] sm:text-6xl lg:text-7xl">
            Tu mejor versión{" "}
            <span className="text-[#B8935E]">comienza aquí</span>
          </h1>

          {/* Descripción compacta en 1 línea */}
          <p className="max-w-xl text-base leading-relaxed text-[#FAF8F3]/80 sm:text-lg">
            Corte de autor · Afeitado a navaja · Mixología signature
          </p>

          {/* CTA principal premium */}
          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/reservas"
              className="group flex items-center gap-3 rounded-full bg-[#B8935E] px-8 py-4 text-base font-semibold text-[#0D0D0D] shadow-[0_20px_45px_rgba(184,147,94,0.4)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_25px_55px_rgba(184,147,94,0.5)]"
            >
              <FaCalendarAlt className="text-lg" />
              Agenda tu sesión
              <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-[#0D0D0D]" />
            </Link>
            <Link
              to="/tienda"
              className="flex items-center gap-2 rounded-full border border-[#B8935E]/40 bg-[#B8935E]/10 px-8 py-4 text-base font-medium text-[#FAF8F3] backdrop-blur-sm transition-all duration-300 hover:border-[#B8935E]/60 hover:bg-[#B8935E]/20"
            >
              Ver productos
            </Link>
          </div>

          {/* Stats bar - métricas que generan confianza */}
          <div className="grid grid-cols-3 gap-6 border-t border-[#2A2A2A] pt-6">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <FaStar className="text-[#B8935E]" />
                <span className="text-2xl font-bold text-[#FAF8F3]">4.9</span>
              </div>
              <span className="text-xs text-[#FAF8F3]/60">Rating promedio</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <FaUsers className="text-[#B8935E]" />
                <span className="text-2xl font-bold text-[#FAF8F3]">500+</span>
              </div>
              <span className="text-xs text-[#FAF8F3]/60">Clientes activos</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-[#B8935E]" />
                <span className="text-2xl font-bold text-[#FAF8F3]">3+</span>
              </div>
              <span className="text-xs text-[#FAF8F3]/60">Años de experiencia</span>
            </div>
          </div>
        </div>

        {/* Columna de video */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ y: videoY, scale: videoScale }}
          className="flex-1"
        >
          <div className="relative mx-auto w-full max-w-[680px]">
            {/* Glow exterior */}
            <div className="absolute -inset-2 rounded-[44px] bg-gradient-to-br from-[#B8935E]/20 via-transparent to-[#B8935E]/10 blur-3xl" />
            
            {/* Container del video */}
            <div className="relative overflow-hidden rounded-[36px] border border-[#2A2A2A] bg-[#0D0D0D]/75 shadow-[0_32px_80px_rgba(0,0,0,0.6)]">
              
              <video
                ref={videoRef}
                className="block h-[360px] w-full object-cover sm:h-[450px] lg:h-[620px]"
                autoPlay
                loop
                muted
                playsInline
                preload="none"
                poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 680 620'%3E%3Crect fill='%230D0D0D' width='680' height='620'/%3E%3C/svg%3E"
                aria-label="Video experiencia Sunsetz"
              >
                Tu navegador no soporta video HTML5.
              </video>

              {/* Overlay gradient optimizado */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D]/80 via-[#0D0D0D]/20 to-transparent pointer-events-none" />

              {/* Badge minimalista flotante */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="absolute right-6 top-6"
              >
                <div className="flex items-center gap-2 rounded-full border border-[#B8935E]/50 bg-[#0D0D0D]/90 px-4 py-2 backdrop-blur-md">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#B8935E] opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#B8935E]" />
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-[#B8935E]">
                    En vivo
                  </span>
                </div>
              </motion.div>

              {/* Info minimalista en la base */}
              <div className="absolute inset-x-6 bottom-6">
                <p className="text-sm text-[#FAF8F3]/70">
                  Fragmento de la experiencia completa Sunsetz
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
