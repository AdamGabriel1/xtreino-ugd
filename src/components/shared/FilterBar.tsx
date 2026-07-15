import { type ReactNode } from "react";
import { Filter, X } from "lucide-react";

interface FilterBarProps {
  children: ReactNode;
  hasFilters: boolean;
  onClear: () => void;
}

export function FilterBar({ children, hasFilters, onClear }: FilterBarProps) {
  return (
    <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        <div className="flex items-center gap-2 text-[#8a8a9e]">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filtros:</span>
        </div>

        <div className="flex flex-wrap gap-3 flex-1">
          {children}
        </div>

        {hasFilters && (
          <button
            onClick={onClear}
            className="text-xs text-green-400 hover:text-green-300 transition-colors flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  );
}

export default FilterBar;