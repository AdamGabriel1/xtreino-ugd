import { type ReactNode } from "react";

interface SelectFilterProps {
  icon: ReactNode;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  disabled?: boolean;
  minWidth?: string;
}

export function SelectFilter({
  icon,
  value,
  onChange,
  options,
  placeholder = "Selecionar...",
  disabled = false,
  minWidth = "160px",
}: SelectFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[#5a5a6e]">{icon}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50 disabled:opacity-40 transition-colors"
        style={{ minWidth }}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SelectFilter;