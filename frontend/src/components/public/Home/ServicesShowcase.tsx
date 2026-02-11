import { useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { FaCut, FaStar, FaCheck, FaArrowRight, FaGem } from "react-icons/fa";

interface Service {
  id: number;
  title: string;
  subtitle: string;
  price: string;
  duration: string;
  features: string[];
  popular?: boolean;
  icon: React.ReactNode;
  gradient: string;
  image: string;
}

const services: Service[] = [
  {
    id: 1,
    title: "Corte Clásico",
    subtitle: "Lo esencial, bien hecho",
    price: "30",
    duration: "20 min",
    features: [
      "Consulta personalizada",
      "Corte con técnica profesional",
      "Peinado incluido",
      "Acabado con cera premium"
    ],
    icon: <FaCut className="text-3xl" />,
    gradient: "from-zinc-700 to-zinc-900",
    image: "/src/assets/images/cortes/crew-cut-texturizado.jpg"
  },
  {
    id: 2,
    title: "Corte + Barba",
    subtitle: "El combo perfecto",
    price: "50",
    duration: "35 min",
    features: [
      "Todo del corte clásico",
      "Perfilado de barba",
      "Afeitado de precisión",
      "Aceite de barba premium",
      "Masaje facial"
    ],
    popular: true,
    icon: <FaGem className="text-3xl" />,
    gradient: "from-[#B8935E] to-[#8B6F47]",
    image: "/src/assets/images/cortes/pompadour-moderno.jpg"
  },
  {
    id: 3,
    title: "Experiencia Premium",
    subtitle: "Transformación completa",
    price: "80",
    duration: "60 min",
    features: [
      "Todo del combo anterior",
      "Tratamiento capilar",
      "Mascarilla facial",
      "Bebida signature",
      "Lavado con productos premium",
      "Ambiente privado"
    ],
    icon: <FaStar className="text-3xl" />,
    gradient: "from-amber-600 to-orange-800",
    image: "/src/assets/images/cortes/quiff-texturizado.jpg"
  }
];

const ServiceCard3D = ({ service, index }: { service: Service; index: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [7, -7]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-7, 7]), {
    stiffness: 300,
    damping: 30,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set((e.clientX - centerX) / rect.width);
    mouseY.set((e.clientY - centerY) / rect.height);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={`group relative h-full ${service.popular ? "lg:scale-110" : ""}`}
    >
      {/* Badge Popular */}
      {service.popular ? (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="absolute -top-4 left-1/2 z-20 -translate-x-1/2"
        >
          <div className="rounded-full bg-gradient-to-r from-[#B8935E] to-[#C9A46F] px-6 py-2 text-sm font-bold text-black shadow-lg">
            ⭐ MÁS ELEGIDO
          </div>
        </motion.div>
      ) : null}

      {/* Card Container */
      <div
        className={`relative h-full overflow-hidden rounded-3xl border-2 transition-all duration-500 ${
          service.popular
            ? "border-[#B8935E] shadow-[0_20px_60px_rgba(184,147,94,0.3)]"
            : "border-zinc-800 shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
        } ${isHovered ? "shadow-[0_30px_80px_rgba(184,147,94,0.4)]" : ""}`}
        style={{ transform: "translateZ(20px)" }}
      >
        {/* Background Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-90`} />

        {/* Image Background con overlay */}
        <div className="absolute inset-0">
          <img
            src={service.image}
            alt={service.title}
            className="h-full w-full object-cover opacity-20 transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col p-8">
          {/* Header */}
          <div className="mb-6 space-y-4">
            <motion.div
              style={{ transform: "translateZ(40px)" }}
              className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur-md"
            >
              {service.icon}
            </motion.div>

            <div style={{ transform: "translateZ(30px)" }}>
              <h3 className="text-3xl font-bold text-white">{service.title}</h3>
              <p className="mt-1 text-sm text-white/70">{service.subtitle}</p>
            </div>
          </div>

          {/* Price */}
          <motion.div
            style={{ transform: "translateZ(35px)" }}
            className="mb-6"
          >
            <div className="inline-flex items-baseline gap-2 rounded-2xl bg-white/10 px-6 py-3 backdrop-blur-md">
              <span className="text-5xl font-bold text-white">{service.price}</span>
              <span className="text-xl text-white/70">Bs</span>
              <span className="ml-2 text-sm text-white/50">· {service.duration}</span>
            </div>
          </motion.div>

          {/* Features */}
          <div
            style={{ transform: "translateZ(25px)" }}
            className="mb-8 flex-1 space-y-3"
          >
            {service.features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * idx }}
                className="flex items-start gap-3"
              >
                <FaCheck className="mt-1 shrink-0 text-[#B8935E]" />
                <span className="text-sm text-white/80">{feature}</span>
              </motion.div>
            ))}
          </div>

          {/* CTA Button */}
          <motion.div style={{ transform: "translateZ(50px)" }}>
            <Link
              to="/reservas"
              className={`group/btn flex w-full items-center justify-center gap-3 rounded-full py-4 text-lg font-bold transition-all ${
                service.popular
                  ? "bg-white text-black hover:bg-white/90"
                  : "bg-white/20 text-white backdrop-blur-md hover:bg-white/30"
              }`}
            >
              Reservar ahora
              <FaArrowRight className="transition-transform group-hover/btn:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        {/* Glow effect on hover */}
        <motion.div
          animate={{
            opacity: isHovered ? 1 : 0,
          }}
          className="pointer-events-none absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#B8935E]/30 via-transparent to-[#B8935E]/30 blur-2xl"
        />
      </div>
    </motion.div>
  );
};

// rendering-hoist-jsx: static background effects
const backgroundEffects = (
  <div className="pointer-events-none absolute inset-0">
    <div className="absolute left-1/4 top-20 h-96 w-96 rounded-full bg-[#B8935E]/5 blur-[120px]" />
    <div className="absolute right-1/4 bottom-20 h-96 w-96 rounded-full bg-amber-500/5 blur-[120px]" />
  </div>
);

// rendering-hoist-jsx: static trust badges
const trustBadges = (
  <div className="mt-16 flex flex-wrap items-center justify-center gap-8 border-t border-white/10 pt-12 text-center">
    <div>
      <div className="text-3xl font-bold text-white">+1000</div>
      <div className="text-sm text-white/60">Clientes satisfechos</div>
    </div>
    <div className="h-12 w-px bg-white/10" />
    <div>
      <div className="text-3xl font-bold text-white">100%</div>
      <div className="text-sm text-white/60">Garantía de calidad</div>
    </div>
    <div className="h-12 w-px bg-white/10" />
    <div>
      <div className="text-3xl font-bold text-white">4.9★</div>
      <div className="text-sm text-white/60">Valoración promedio</div>
    </div>
  </div>
);

const ServicesShowcase = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#0A0A0A] via-[#050607] to-[#0A0A0A] py-32 text-white">
      {/* Background effects */}
      {backgroundEffects}

      <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className="mb-6 inline-block"
          >
            <div className="rounded-full border border-[#B8935E]/30 bg-[#B8935E]/10 px-6 py-2 text-sm font-medium text-[#B8935E]">
              Precios transparentes
            </div>
          </motion.div>

          <h2 className="mb-6 text-6xl font-bold md:text-7xl">
            Elige tu{" "}
            <span className="bg-gradient-to-r from-[#B8935E] to-[#C9A46F] bg-clip-text text-transparent">
              experiencia
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-white/70">
            Desde lo esencial hasta la transformación completa. Calidad garantizada en cada servicio.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {services.map((service, index) => (
            <ServiceCard3D key={service.id} service={service} index={index} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="mb-6 text-lg text-white/60">
            ¿No estás seguro? Habla con nosotros
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="https://wa.me/59176543210"
              className="inline-flex items-center gap-2 rounded-full border border-[#B8935E]/40 bg-[#B8935E]/10 px-8 py-4 font-medium text-white backdrop-blur-md transition-all hover:bg-[#B8935E]/20"
            >
              💬 Consultar por WhatsApp
            </a>
            <Link
              to="/contacto"
              className="font-medium text-white/70 transition-colors hover:text-white"
            >
              Ver todos los servicios →
            </Link>
          </div>
        </motion.div>

        {/* Trust badges */}
        {trustBadges}
      </div>
    </section>
  );
};

export default ServicesShowcase;
