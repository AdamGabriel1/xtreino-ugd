import { ChevronDown, ChevronUp } from "lucide-react";
import type { PlayerSortField, PlayerSortDir } from "@/types/clans";

interface PlayerSortHeaderProps {
  field: PlayerSortField;
  label: string;
  currentField: PlayerSortField;
  currentDir: PlayerSortDir;
  onSort: (field: PlayerSortField) => void;
}

export default function PlayerSortHeader({
  field,
  label,
  currentField,
  currentDir,
  onSort,
}: PlayerSortHeaderProps) {
  return (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1 text-xs font-medium text-[#5a5a6e] uppercase hover:text-[#f0f0f5] transition-colors"
    >
      {label}
      {currentField === field && (
        currentDir === "desc" ? (
          <ChevronDown className="w-3 h-3" />
        ) : (
          <ChevronUp className="w-3 h-3" />
        )
      )}
    </button>
  );
}