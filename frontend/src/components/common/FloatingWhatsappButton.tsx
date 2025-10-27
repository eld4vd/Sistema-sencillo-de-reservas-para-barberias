import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import { businessInfo } from "../../data/businessInfo";

const whatsappMessage =
  "Hola! 😀, quiero hacer una consulta sobre los servicios de Sunsetz Barberia 💈";
const whatsappLink = `https://wa.me/${businessInfo.contact.phone.replace(
  "+",
  ""
)}?text=${encodeURIComponent(whatsappMessage)}`;

const FloatingWhatsappButton = () => {
  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      <motion.a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Abrir chat de WhatsApp con Barbería Sunsetz"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 18,
          delay: 0.35,
        }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="group relative flex items-center overflow-hidden rounded-full border border-[#25D366]/25 bg-[#121212]/90 px-3 py-3 shadow-[0_18px_34px_rgba(0,0,0,0.35)] backdrop-blur transition-all duration-300"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366]/12 text-2xl text-[#25D366] transition duration-300 group-hover:bg-[#25D366]/18">
          <FaWhatsapp size={22} />
        </span>
        <span
          className="max-w-0 overflow-hidden pl-0 text-sm font-semibold uppercase tracking-[0.22em] text-[#FAF8F3] opacity-0 transition-all duration-300 group-hover:max-w-[160px] group-hover:pl-4 group-hover:opacity-100 group-focus-visible:max-w-[160px] group-focus-visible:pl-4 group-focus-visible:opacity-100"
        >
          Consultas
        </span>
        <span className="absolute inset-0 rounded-full bg-white/0 transition-colors duration-300 group-hover:bg-white/5" />
      </motion.a>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.4 }}
        className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.32em] text-[#FAF8F3]/50"
      >
        <span className="h-[1px] w-6 bg-[#B8935E]/35" />
        {businessInfo.schedule.full}
      </motion.div>
    </div>
  );
};

export default FloatingWhatsappButton;
