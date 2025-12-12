import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaCalendarAlt, FaWhatsapp } from "react-icons/fa";
import presentationVideo from "../../../assets/videos/presentacion.webm";
import BeforeAfterSlider from "./BeforeAfterSlider";
import cortando3 from "../../../assets/images/lugar/cortando3.jpg";
import peluqueria1 from "../../../assets/images/lugar/peluqueria1.jpg";

const HeroRevolutionary = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [0.3, 0.7]);

  useEffect(() => {
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
      className="relative min-h-screen overflow-hidden bg-[#050607]"
    >
      {/* Video Background Fullscreen */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Crect fill='%23050607' width='1920' height='1080'/%3E%3C/svg%3E"
        >
          Tu navegador no soporta video HTML5.
        </video>
        <motion.div 
          style={{ opacity: overlayOpacity }}
          className="absolute inset-0 bg-gradient-to-b from-[#050607]/80 via-[#050607]/60 to-[#050607]" 
        />
      </div>

      {/* Contenido Principal */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-20 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          
          {/* Columna Izquierda: Texto */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-10"
          >
            <h1 className="text-7xl font-bold leading-[1.05] text-white sm:text-8xl lg:text-9xl">
              Barbería{" "}
              <span className="bg-gradient-to-r from-[#B8935E] to-[#C9A46F] bg-clip-text text-transparent">
                Sunsetz
              </span>
            </h1>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/reservas"
                className="group flex items-center gap-3 rounded-full bg-[#B8935E] px-8 py-4 text-lg font-bold text-[#0D0D0D] shadow-[0_20px_50px_rgba(184,147,94,0.4)] transition-all hover:scale-105 hover:shadow-[0_25px_60px_rgba(184,147,94,0.5)]"
              >
                <FaCalendarAlt className="text-xl" />
                Reservar
              </Link>
              <a
                href="https://wa.me/59176543210"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-8 py-4 text-lg font-medium text-white backdrop-blur-md transition-all hover:bg-white/20"
              >
                <FaWhatsapp className="text-xl" />
                WhatsApp
              </a>
            </div>
          </motion.div>

          {/* Columna Derecha: Before/After Slider */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="h-[500px] lg:h-[600px]"
          >
            <div className="relative h-full overflow-hidden rounded-3xl border-2 border-[#B8935E]/30 shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
              <BeforeAfterSlider
                beforeImage={cortando3}
                afterImage={peluqueria1}
                altText="Transformación Barbería Sunsetz"
              />
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-white/50">Scroll para ver más</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="h-10 w-6 rounded-full border-2 border-white/30 p-1"
            >
              <div className="h-2 w-2 rounded-full bg-white/50 mx-auto"></div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroRevolutionary;
