import { memo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaCut, FaSprayCan, FaCrown } from "react-icons/fa";

// Importar imágenes
import crewCut from "../../../assets/images/cortes/crew-cut-texturizado.jpg";
import pompadour from "../../../assets/images/cortes/pompadour-moderno.jpg";
import quiff from "../../../assets/images/cortes/quiff-texturizado.jpg";

// rendering-hoist-jsx: static data hoisted outside component
const services = [
  {
    id: 1,
    title: "Corte Clásico",
    price: "30",
    currency: "Bs",
    duration: "20 min",
    description: "Corte preciso con acabado profesional",
    image: crewCut,
    icon: FaCut,
    features: ["Consulta", "Corte", "Peinado"],
  },
  {
    id: 2,
    title: "Corte + Barba",
    price: "50",
    currency: "Bs",
    duration: "35 min",
    description: "El combo perfecto para el caballero moderno",
    image: pompadour,
    icon: FaSprayCan,
    features: ["Corte", "Perfilado", "Barba", "Aceite"],
    popular: true,
  },
  {
    id: 3,
    title: "Premium",
    price: "80",
    currency: "Bs",
    duration: "60 min",
    description: "Experiencia completa de transformación",
    image: quiff,
    icon: FaCrown,
    features: ["Todo incluido", "Tratamiento", "Masaje", "Bebida"],
  },
];

// rendering-hoist-jsx: static background texture
const backgroundTexture = (
  <div className="absolute inset-0 opacity-[0.03]">
    <div
      className="h-full w-full"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}
    />
  </div>
);

// rerender-memo: extract service card into memoized component
interface ServiceData {
  id: number;
  title: string;
  price: string;
  currency: string;
  duration: string;
  description: string;
  image: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
  popular?: boolean;
}

const ServiceCard = memo(function ServiceCard({
  service,
  index,
}: {
  service: ServiceData;
  index: number;
}) {
  const Icon = service.icon;

  return (
    <motion.div
      key={service.id}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.6 }}
      className={`group relative overflow-hidden rounded-3xl ${
        service.popular
          ? "bg-gradient-to-b from-[#B8935E]/20 to-[#B8935E]/5 ring-1 ring-[#B8935E]/30"
          : "bg-[#111111]"
      }`}
    >
      {/* Popular Badge - rendering-conditional-render: ternary instead of && */}
      {service.popular ? (
        <div className="absolute right-4 top-4 z-20 rounded-full bg-[#B8935E] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-black">
          Popular
        </div>
      ) : null}

      {/* Imagen */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={service.image}
          alt={service.title}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
        
        {/* Icono flotante */}
        <div className="absolute bottom-4 left-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-black/80 backdrop-blur-sm">
          <Icon className="text-2xl text-[#B8935E]" />
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white">
              {service.title}
            </h3>
            <p className="mt-1 text-sm text-white/50">
              {service.duration}
            </p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-white">
              {service.price}
            </span>
            <span className="text-lg text-white/60">
              {service.currency}
            </span>
          </div>
        </div>

        <p className="mb-6 text-sm text-white/60">
          {service.description}
        </p>

        {/* Features */}
        <div className="mb-6 flex flex-wrap gap-2">
          {service.features.map((feature) => (
            <span
              key={feature}
              className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/70"
            >
              {feature}
            </span>
          ))}
        </div>

        {/* CTA */}
        <Link
          to="/reservas"
          className={`block w-full rounded-xl py-3 text-center text-sm font-semibold uppercase tracking-wider transition-colors duration-300 ${
            service.popular
              ? "bg-[#B8935E] text-black hover:bg-[#C9A46F]"
              : "bg-white/10 text-white hover:bg-white/20"
          }`}
        >
          Reservar
        </Link>
      </div>
    </motion.div>
  );
});

const ServicesSection = () => {
  return (
    <section className="relative overflow-hidden bg-[#0A0A0A] py-32">
      {backgroundTexture}

      <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
        {/* Header */}
        <div className="mb-20 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-medium uppercase tracking-[0.4em] text-[#B8935E]"
          >
            Servicios
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-4xl font-bold text-white md:text-6xl lg:text-7xl"
          >
            Elige tu experiencia
          </motion.h2>
        </div>

        {/* Cards Grid */}
        <div className="grid gap-8 md:grid-cols-3">
          {services.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
