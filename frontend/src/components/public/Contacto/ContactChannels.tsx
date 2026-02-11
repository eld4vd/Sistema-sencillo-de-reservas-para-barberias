import { memo } from "react";
import { motion } from "framer-motion";
import { FaWhatsapp, FaPhoneAlt, FaEnvelopeOpenText } from "react-icons/fa";
import { businessInfo } from "../../../data/businessInfo";

const scheduleWindow = `${businessInfo.schedule.daysText.toLowerCase()} de ${businessInfo.schedule.hoursRangeText}`;

// rendering-hoist-jsx: static icon elements hoisted outside
const whatsappIcon = <FaWhatsapp className="text-[#25D366]" aria-hidden="true" />;
const phoneIcon = <FaPhoneAlt className="text-[#B8935E]" aria-hidden="true" />;
const emailIcon = <FaEnvelopeOpenText className="text-[#B8935E]" aria-hidden="true" />;

const channels = [
  {
    icon: whatsappIcon,
    title: "Whatsapp Asesoría",
    value: businessInfo.contact.phoneDisplay,
    caption: `Respuestas en menos de 15 minutos ${scheduleWindow}.`,
    link: businessInfo.contact.whatsappUrl,
  },
  {
    icon: phoneIcon,
    title: "Línea directa",
    value: businessInfo.contact.phoneDisplay,
    caption: `Coordina eventos corporativos o reservas express ${scheduleWindow}.`,
    link: `tel:${businessInfo.contact.phone}`,
  },
  {
    icon: emailIcon,
    title: "Mail Sunsetz",
    value: businessInfo.contact.email,
    caption: "Agenda membresías, press kits o colaboraciones.",
    link: `mailto:${businessInfo.contact.email}`,
  },
];

// rerender-memo: extract channel card to memoized component
const ChannelCard = memo(function ChannelCard({ channel }: { channel: typeof channels[number] }) {
  return (
    <div
      className="flex items-center gap-5 rounded-[26px] border border-[#B8935E]/15 bg-[#161616]/80 p-7 shadow-[0_18px_45px_rgba(0,0,0,0.42)] backdrop-blur"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0A1929]/35 text-xl text-[#B8935E]">
        {channel.icon}
      </div>
      <div className="space-y-2">
        <p className="text-[11px] uppercase tracking-[0.22em] text-[#B8935E]/85">{channel.title}</p>
        <a
          href={channel.link}
          className="text-lg font-semibold text-[#FAF8F3] transition-colors hover:text-[#B8935E]"
        >
          {channel.value}
        </a>
        <p className="text-xs leading-relaxed text-[#FAF8F3]/70">{channel.caption}</p>
      </div>
    </div>
  );
});

const ContactChannels = () => {
  return (
    <section className="relative bg-[#0D0D0D] py-24 text-[#FAF8F3]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(10,25,41,0.28),_transparent_70%)]" />
      <div className="relative mx-auto max-w-6xl px-6 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h2
              className="text-3xl uppercase tracking-[0.05em] text-[#FAF8F3] lg:text-[2.8rem]"
            >
              Asistencia personalizada en tres canales.
            </h2>
            <p className="max-w-xl text-base leading-relaxed text-[#FAF8F3]/75">
              Selecciona el medio ideal según tu ritmo. Reemplaza los datos por tus líneas oficiales cuando estés listo.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid gap-5"
          >
            {channels.map((channel) => (
              <ChannelCard key={channel.title} channel={channel} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactChannels;
