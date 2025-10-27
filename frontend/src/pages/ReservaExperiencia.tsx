import { Link } from "react-router-dom";
import ReservationBookingForm from "../components/public/Reservas/ReservationBookingForm";
import FloatingWhatsappButton from "../components/common/FloatingWhatsappButton";

const ReservaExperiencia = () => {
  return (
    <div className="flex min-h-screen flex-col bg-[#0A0806] text-[#ECE4D6]">
      <header className="border-b border-white/10 bg-[#0F0C08]/95 text-[#F6E5C7]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5 lg:px-12">
          <Link
            to="/home"
            className="text-2xl tracking-[0.24em] text-[#F6E5C7] transition-colors hover:text-white"
          >
            Barbería Sunsetz
          </Link>
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.32em] text-[#D9CBB4]">
            <span>Cortes premium · Sucre</span>
            <span className="hidden h-1 w-1 rounded-full bg-[#F6E5C7] sm:inline-block" />
            <Link
              to="/reservas"
              className="rounded-full border border-[#F6E5C7]/30 px-4 py-1.5 text-[11px] font-semibold text-[#F6E5C7] transition hover:border-[#F6E5C7] hover:bg-[#F6E5C7]/15"
            >
              Volver a la pagina
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1">
        <ReservationBookingForm hasNavbar={false} />
      </div>

      <FloatingWhatsappButton />
    </div>
  );
};

export default ReservaExperiencia;
