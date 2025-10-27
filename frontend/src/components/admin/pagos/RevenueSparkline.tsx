import { memo } from "react";
import { currencyFormatter } from "../../../helpers/reservas";

export interface RevenuePoint {
  label: string;
  value: number;
  sublabel: string;
  isToday: boolean;
  height: number; // 0 - 100
}

interface RevenueSparklineProps {
  points: RevenuePoint[];
}

const RevenueSparkline = ({ points }: RevenueSparklineProps) => {
  if (points.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-[#232323] bg-[#0F0F0F]/50 text-xs uppercase tracking-[0.28em] text-[#FAF8F3]/35">
        Sin datos suficientes
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
      {points.map(({ label, sublabel, value, height, isToday }) => (
        <div
          key={label}
          className="flex flex-col items-center gap-2 rounded-2xl border border-[#1E1E1E] bg-[#101010]/80 px-3 py-3 text-center"
        >
          <div className="relative flex h-24 w-full items-end justify-center overflow-hidden rounded-xl border border-[#1F1F1F] bg-[#080808]">
            <div
              style={{ height: `${height}%` }}
              className={`w-full rounded-t-xl bg-gradient-to-t from-[#B8935E] via-[#d1ac6f] to-[#f4d59c] transition-[height] duration-500 ${
                isToday ? "shadow-[0_0_25px_rgba(184,147,94,0.35)]" : ""
              }`}
            />
            <span className="pointer-events-none absolute bottom-1 text-xs font-semibold text-[#FAF8F3]">
              {currencyFormatter.format(value)}
            </span>
          </div>
          <div className="space-y-0.5 text-[10px] uppercase tracking-[0.24em] text-[#FAF8F3]/55">
            <p className={isToday ? "text-[#B8935E]" : undefined}>{label}</p>
            <p className="text-[9px] text-[#FAF8F3]/40">{sublabel}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default memo(RevenueSparkline);
