import { type ReactNode, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ExpandableRowProps {
  rowKey: string;
  children: ReactNode;
  expandedContent: ReactNode;
  expandedKey: string | null;
  onToggle: (key: string | null) => void;
  rankStyle?: string;
}

export function ExpandableRow({
  rowKey,
  children,
  expandedContent,
  expandedKey,
  onToggle,
  rankStyle = "",
}: ExpandableRowProps) {
  const isExpanded = expandedKey === rowKey;

  return (
    <>
      <tr
        className={`hover:bg-[#1a1a24] transition-colors cursor-pointer ${rankStyle}`}
        onClick={() => onToggle(isExpanded ? null : rowKey)}
      >
        {children}
        <td className="px-4 py-3 text-center">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-[#5a5a6e]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#5a5a6e]" />
          )}
        </td>
      </tr>
      {isExpanded && (
        <tr className="bg-[#0a0a0f]">
          <td colSpan={100} className="px-4 py-4">
            {expandedContent}
          </td>
        </tr>
      )}
    </>
  );
}

export default ExpandableRow;