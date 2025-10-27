interface PaymentMethodChipProps {
  metodo: string | null;
}

const normalizeMethod = (metodo: string | null) => {
  if (!metodo) return "Método no registrado";
  const trimmed = metodo.trim();
  if (!trimmed) return "Método no registrado";
  return trimmed;
};

const PaymentMethodChip = ({ metodo }: PaymentMethodChipProps) => {
  const label = normalizeMethod(metodo);
  return (
    <span className="inline-flex items-center rounded-full border border-[#2A2A2A] bg-[#0F0F0F]/80 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[#FAF8F3]/65">
      {label}
    </span>
  );
};

export default PaymentMethodChip;
