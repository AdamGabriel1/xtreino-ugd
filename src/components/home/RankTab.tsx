import type { LucideIcon } from "@/types/home";

export default function RankTab({ active, onClick, label, icon: Icon }: { active: boolean; onClick: () => void; label: string; icon: LucideIcon }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
        active
          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm shadow-emerald-500/10"
          : "text-[#8a8a9e] hover:text-[#f0f0f5] hover:bg-[#1a1a24]"
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}