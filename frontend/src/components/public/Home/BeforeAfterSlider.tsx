import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  altText?: string;
}

const BeforeAfterSlider = ({ beforeImage, afterImage, altText = "Transformación" }: BeforeAfterSliderProps) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percent);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging) {
      handleMove(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchend", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full cursor-ew-resize select-none overflow-hidden"
      onMouseDown={(e) => {
        setIsDragging(true);
        handleMove(e.clientX);
      }}
      onTouchStart={(e) => {
        setIsDragging(true);
        handleMove(e.touches[0].clientX);
      }}
    >
      {/* Imagen DESPUÉS */}
      <div className="absolute inset-0">
        <img
          src={afterImage}
          alt={`${altText} - Después`}
          className="h-full w-full object-cover"
          draggable={false}
        />
        <div className="absolute right-6 top-6 rounded-full bg-[#B8935E] px-4 py-2 text-sm font-bold text-[#0D0D0D]">
          DESPUÉS
        </div>
      </div>

      {/* Imagen ANTES (recortada) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={beforeImage}
          alt={`${altText} - Antes`}
          className="h-full w-full object-cover"
          draggable={false}
        />
        <div className="absolute left-6 top-6 rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-[#0D0D0D]">
          ANTES
        </div>
      </div>

      {/* Línea divisora */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)]"
        style={{ left: `${sliderPosition}%` }}
      >
        {/* Handle */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-2xl"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="flex gap-2">
            <div className="h-6 w-0.5 bg-[#0D0D0D]"></div>
            <div className="h-6 w-0.5 bg-[#0D0D0D]"></div>
            <div className="h-6 w-0.5 bg-[#0D0D0D]"></div>
          </div>
        </motion.div>
      </div>

      {/* Instrucción */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: isDragging ? 0 : 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 rounded-full border border-white/30 bg-black/50 px-6 py-3 text-sm text-white backdrop-blur-md"
      >
        ← Desliza para comparar →
      </motion.div>
    </div>
  );
};

export default BeforeAfterSlider;
