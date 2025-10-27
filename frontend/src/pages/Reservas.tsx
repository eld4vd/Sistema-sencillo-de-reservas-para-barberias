import { Link } from "react-router-dom";
import { FaArrowRight, FaCheckCircle, FaMapMarkerAlt, FaRegClock } from "react-icons/fa";

const Reservas = () => {
  return (
    <main className="relative overflow-hidden bg-[#070605] text-[#F5F1E8]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(219,174,95,0.25),_transparent_62%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,_rgba(8,8,8,0.85),_rgba(8,8,8,0.2)_40%,_rgba(8,8,8,0.92)_88%)]" />

      <section className="relative mx-auto flex min-h-[78vh] max-w-6xl flex-col items-start justify-center gap-12 px-6 py-24 lg:px-12">
        <div className="inline-flex items-center gap-3 rounded-full border border-[#EED8B0]/25 bg-white/10 px-5 py-2 text-[11px] uppercase tracking-[0.38em] text-[#F6E5C7] shadow-[0_18px_48px_rgba(12,10,6,0.6)] backdrop-blur">
          Agenda Sunsetz
        </div>
        <div className="flex flex-col gap-12 lg:flex-row lg:items-stretch lg:justify-between lg:gap-16">
          <div className="max-w-3xl space-y-6">
            <h1 className="text-[2.75rem] leading-tight tracking-[0.06em] text-[#F9F3E7] sm:text-5xl lg:text-[3.8rem]">
              Agenda tu corte o combo Sunsetz en minutos
            </h1>
            <p className="text-base text-[#D9CFBF]/90 sm:text-lg">
              Te respondemos rápido, sin llamadas ni formularios eternos. Elegís el servicio, escoges a tu barbero y nosotros coordinamos los detalles para que llegues directo a relajarte.
            </p>
            <div className="flex flex-wrap items-center gap-6 text-sm text-[#E2D7C5]">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1.5">
                <FaRegClock /> Confirmación promedio 15 min hábiles
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1.5">
                <FaMapMarkerAlt /> Av. Ballivián 123 · Calacoto
              </span>
            </div>
          </div>
          <div className="w-full max-w-md self-center rounded-3xl border border-white/15 bg-white/10 p-7 text-[#F6E5C7] shadow-[0_22px_55px_rgba(7,6,5,0.6)] backdrop-blur lg:self-stretch">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-[#F6E5C7]/70">Así de simple</p>
              <p className="mt-3 text-2xl font-semibold tracking-[0.04em] text-[#F9F3E7]">
                Reserva paso a paso
              </p>
            </div>
            <ul className="mt-4 space-y-3 text-sm text-[#E9DFCF]">
              <li className="flex items-center gap-3">
                <FaCheckCircle className="text-[#9FE2BF]" />
                Elegí el servicio y a tu barbero de confianza (o te recomendamos uno).
              </li>
              <li className="flex items-center gap-3">
                <FaCheckCircle className="text-[#9FE2BF]" />
                Indicá día, hora y dejá un mensaje si querés algún detalle especial.
              </li>
              <li className="flex items-center gap-3">
                <FaCheckCircle className="text-[#9FE2BF]" />
                Confirmá con nuestro pago simulado y recibí tu código por correo.
              </li>
            </ul>
            <Link
              to="/reservar"
              className="group mt-6 inline-flex w-full max-w-sm items-center justify-center gap-3 self-start rounded-full bg-gradient-to-r from-[#C49A4A] via-[#D4A853] to-[#C49A4A] px-10 py-3.5 text-base font-semibold uppercase tracking-[0.18em] text-[#0A0603] shadow-[0_8px_24px_rgba(196,154,74,0.35),0_2px_8px_rgba(10,6,3,0.2)] ring-1 ring-[#E8C56A]/25 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:from-[#D4A853] hover:via-[#E0BA62] hover:to-[#D4A853] hover:text-[#0A0603] hover:shadow-[0_12px_32px_rgba(212,168,83,0.45),0_4px_12px_rgba(10,6,3,0.25)] hover:ring-[#E8C56A]/40"
            >
              Reservar turno ahora
              <FaArrowRight className="text-lg transition-transform group-hover:translate-x-2" />
            </Link>
            <p className="mt-3 text-xs text-[#DCCFB7]/70">
              Sin cobro adelantado. Podés mover o cancelar hasta 6 horas antes sin penalización.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Reservas;
