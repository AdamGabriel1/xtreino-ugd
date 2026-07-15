import { Search } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minWidth?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Buscar...",
  minWidth = "260px",
}: SearchInputProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5a6e]" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 pr-4 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm placeholder-[#5a5a6e] focus:outline-none focus:border-green-500/50 transition-colors"
        style={{ minWidth }}
      />
    </div>
  );
}

export default SearchInput;