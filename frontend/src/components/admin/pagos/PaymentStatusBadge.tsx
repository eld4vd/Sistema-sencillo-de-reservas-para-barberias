import type { ReactNode } from "react";
import type { EstadoPago } from "../../../models/Pago";
import { FaCheckCircle, FaClock, FaTimesCircle } from "react-icons/fa";

const STATUS_STYLES: Record<EstadoPago, { base: string; icon: ReactNode }> = {
  Completado: {
    base: "border-emerald-500/50 bg-emerald-500/10 text-emerald-300",
    icon: <FaCheckCircle className="text-sm" />,
  },
  Pendiente: {
    base: "border-[#B8935E]/50 bg-[#B8935E]/10 text-[#B8935E]",
    icon: <FaClock className="text-sm" />,
  },
  Fallido: {
    base: "border-red-500/50 bg-red-500/10 text-red-300",
    icon: <FaTimesCircle className="text-sm" />,
  },
};

interface PaymentStatusBadgeProps {
  estado: EstadoPago;
}

const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({ estado }) => {
  const styles = STATUS_STYLES[estado] ?? STATUS_STYLES.Pendiente;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.28em] ${styles.base}`}
    >
      {styles.icon}
      {estado}
    </span>
  );
};

export default PaymentStatusBadge;
