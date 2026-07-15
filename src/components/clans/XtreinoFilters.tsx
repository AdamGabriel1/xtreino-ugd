import { Filter, Calendar, Clock } from "lucide-react";
import { formatMonthBR, formatDateBR } from "@/utils/date";

interface XtreinoFiltersProps {
  selectedMonth: string;
  selectedDate: string;
  availableMonths: string[];
  availableDates: string[];
  onMonthChange: (month: string) => void;
  onDateChange: (date: string) => void;
  onClear: () => void;
}

export default function XtreinoFilters({ selectedMonth, selectedDate, availableMonths, availableDates, onMonthChange, onDateChange, onClear }: XtreinoFiltersProps) {
  const hasFilters = selectedMonth || selectedDate;

  return (
    <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        <div className="flex items-center gap-2 text-[#8a8a9e]">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filtros XTreino:</span>
        </div>
        <div className="flex flex-wrap gap-3 flex-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#5a5a6e]" />
            <select value={selectedMonth} onChange={(e) => onMonthChange(e.target.value)} className="px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-emerald-500/50 min-w-[140px]">
              <option value="">Todos os meses</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>{formatMonthBR(m)}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#5a5a6e]" />
            <select value={selectedDate} onChange={(e) => onDateChange(e.target.value)} disabled={!selectedMonth} className="px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-emerald-500/50 min-w-[140px] disabled:opacity-40">
              <option value="">Todos os dias</option>
              {availableDates.map((d) => (
                <option key={d} value={d}>{formatDateBR(d)}</option>
              ))}
            </select>
          </div>
        </div>
        {hasFilters && (
          <button onClick={onClear} className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  );
}