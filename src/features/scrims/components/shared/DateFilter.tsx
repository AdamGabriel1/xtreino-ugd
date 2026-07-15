// src/app/scrims/components/DateFilter.tsx
"use client";

import { Filter } from "lucide-react";

interface DateFilterProps {
  selectedDate: string;
  availableDates?: string[];
  onChange: (date: string) => void;
}

export function DateFilter({ selectedDate, availableDates, onChange }: DateFilterProps) {
  return (
    <div className="flex items-center gap-3 mb-6 p-4 bg-[#1a1a24] rounded-xl border border-[#2a2a3a]">
      <Filter className="w-4 h-4 text-[#5a5a6e]" />
      <span className="text-sm text-[#8a8a9e]">Filtrar por data:</span>
      <select
        value={selectedDate}
        onChange={(e) => onChange(e.target.value)}
        className="bg-[#12121a] text-[#f0f0f5] text-sm px-4 py-2 rounded-lg border border-[#2a2a3a] focus:outline-none focus:border-emerald-500 transition-colors"
      >
        <option value="all">Todos os tempos</option>
        {availableDates?.map((date) => (
          <option key={date} value={date}>
            {formatDateOption(date)}
          </option>
        ))}
      </select>
      {selectedDate !== "all" && (
        <button
          onClick={() => onChange("all")}
          className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          Limpar filtro
        </button>
      )}
    </div>
  );
}

function formatDateOption(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  const monthNames = ["", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return `${day} ${monthNames[parseInt(month)]}/${year}`;
}
