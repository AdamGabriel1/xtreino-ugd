import { Tag } from "lucide-react";

interface PreviousNicksTooltipProps {
  nicks: string[];
}

export function PreviousNicksTooltip({ nicks }: PreviousNicksTooltipProps) {
  if (!nicks.length) return null;

  return (
    <div className="group relative inline-flex items-center">
      <Tag className="w-3 h-3 text-[#5a5a6e] ml-1 cursor-help" />
      <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 hidden group-hover:block">
        <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-3 py-2 shadow-xl whitespace-nowrap">
          <p className="text-[10px] text-[#5a5a6e] uppercase mb-1">Nicks anteriores:</p>
          <div className="flex flex-wrap gap-1">
            {nicks.map((nick) => (
              <span key={nick} className="text-xs text-[#8a8a9e] bg-[#2a2a3a] px-1.5 py-0.5 rounded">
                {nick}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PreviousNicksTooltip;