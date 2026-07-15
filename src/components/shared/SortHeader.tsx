import { ChevronDown, ChevronUp } from "lucide-react";

interface SortHeaderProps<T extends string> {
  field: T;
  label: string;
  currentField: T;
  direction: "asc" | "desc";
  onSort: (field: T) => void;
  className?: string;
}

export function SortHeader<T extends string>({
  field,
  label,
  currentField,
  direction,
  onSort,
  className = "",
}: SortHeaderProps<T>) {
  const isActive = currentField === field;

  return (
    <button
      onClick={() => onSort(field)}
      className={`flex items-center gap-1 text-xs font-medium uppercase hover:text-[#f0f0f5] transition-colors justify-center ${
        isActive ? "text-green-400" : "text-[#5a5a6e]"
      } ${className}`}
    >
      {label}
      {isActive &&
        (direction === "desc" ? (
          <ChevronDown className="w-3 h-3" />
        ) : (
          <ChevronUp className="w-3 h-3" />
        ))}
    </button>
  );
}

export default SortHeader;