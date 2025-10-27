import { useEffect, useRef } from "react";
import { motion, useAnimationControls } from "framer-motion";
import emblemLogo from "../../assets/logo.jpg";

type SplashScreenProps = {
  onFinish: () => void;
};

const displayDelay = 350; // Reducido de 650ms para mejor LCP

const wait = (ms: number) =>
  new Promise((resolve) => {
    if (typeof window === "undefined") {
      setTimeout(resolve, ms);
      return;
    }

    const timeout = window.setTimeout(() => {
      window.clearTimeout(timeout);
      resolve(null);
    }, ms);
  });

const waitNextFrame = () =>
  new Promise((resolve) => {
    if (typeof window === "undefined" || typeof window.requestAnimationFrame !== "function") {
      resolve(null);
      return;
    }
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => resolve(null));
    });
  });

const SplashScreen = ({ onFinish }: SplashScreenProps) => {
  const overlayControls = useAnimationControls();
  const logoControls = useAnimationControls();
  const logoRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    const runAnimation = async () => {
      await Promise.all([
        overlayControls.start({
          opacity: 1,
          transition: { duration: 0.3, ease: "easeOut" }, // Reducido de 0.45s
        }),
        logoControls.start({
          opacity: 1,
          scale: 1,
          transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] }, // Reducido de 0.65s
        }),
      ]);

      await wait(displayDelay);
      await waitNextFrame();

      const targetElement = document.getElementById("navbar-logo-anchor");

      let x = 0;
      let y = typeof window !== "undefined" ? -(window.innerHeight / 2 - 96) : -220;
      let scale = 0.52;

      if (targetElement && logoRef.current) {
        const targetRect = targetElement.getBoundingClientRect();
        const logoRect = logoRef.current.getBoundingClientRect();

        x =
          targetRect.left + targetRect.width / 2 -
          (logoRect.left + logoRect.width / 2);
        y =
          targetRect.top + targetRect.height / 2 -
          (logoRect.top + logoRect.height / 2);

        const widthRatio = targetRect.width / logoRect.width;
        const heightRatio = targetRect.height / logoRect.height;
        const computedScale = Math.min(widthRatio, heightRatio);
        if (!Number.isNaN(computedScale) && computedScale > 0) {
          scale = computedScale;
        }
      }

      await Promise.all([
        logoControls.start({
          opacity: 0,
          scale,
          x,
          y,
          transition: {
            duration: 0.55, // Reducido de 0.75s para LCP más rápido
            ease: [0.16, 1, 0.3, 1],
          },
        }),
        overlayControls.start({
          opacity: 0,
          transition: { duration: 0.45, ease: "easeInOut", delay: 0.05 }, // Reducido de 0.6s
        }),
      ]);

      if (!cancelled) {
        onFinish();
      }
    };

    runAnimation();

    return () => {
      cancelled = true;
      overlayControls.stop();
      logoControls.stop();
    };
  }, [logoControls, overlayControls, onFinish]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={overlayControls}
      className="pointer-events-auto fixed inset-0 z-[999] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#050607] via-[#07090C] to-[#050607]"
      style={{ willChange: "opacity" }}
    >
      <motion.div
        ref={logoRef}
        initial={{ opacity: 0, scale: 0.82 }}
        animate={logoControls}
        className="relative flex h-[150px] w-[150px] items-center justify-center rounded-full border border-[#B8935E]/35 bg-[#07090C]/60 p-6 shadow-[0_0_65px_rgba(184,147,94,0.35)] backdrop-blur-xl sm:h-[170px] sm:w-[170px]"
        style={{ willChange: "transform, opacity" }}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#B8935E]/30 via-transparent to-[#8B6F47]/35 blur-lg" />
        <div className="absolute inset-0 rounded-full bg-[#050607]/45" />
        <img
          src={emblemLogo}
          alt="Logotipo Barbería Sunsetz"
          width="170"
          height="170"
          loading="eager"
          fetchPriority="high"
          decoding="sync"
          className="relative z-10 h-full w-full rounded-full object-cover"
        />
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 0.2, duration: 0.5 }} // Reducido de 0.4/0.8s
          className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-xs uppercase tracking-[0.45em] text-[#B8935E]/80"
        >
          sunsetz experience
        </motion.span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 0.55, scale: 1 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="pointer-events-none absolute -top-32 right-16 h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,_rgba(184,147,94,0.18),_transparent_70%)] blur-3xl"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 0.45, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
        className="pointer-events-none absolute bottom-[-140px] left-[-60px] h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,_rgba(64,97,119,0.18),_transparent_70%)] blur-3xl"
      />
    </motion.div>
  );
};

export default SplashScreen;
