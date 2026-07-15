import { Trophy, Medal, Award } from "lucide-react";
import { Flame } from "lucide-react";

interface PodiumCardProps {
  name: string;
  subtitle?: string;
  rank: number;
  stats: Array<{ label: string; value: string | number; color?: string }>;
  streak?: number;
  onClick?: () => void;
}

const gradients = [
  "from-yellow-500/10 via-yellow-500/5 to-transparent border-yellow-500/20",
  "from-gray-300/10 via-gray-300/5 to-transparent border-gray-300/20",
  "from-amber-600/10 via-amber-600/5 to-transparent border-amber-600/20",
];

const iconColors = ["text-yellow-400", "text-gray-300", "text-amber-600"];

export function PodiumCard({ name, subtitle, rank, stats, streak, onClick }: PodiumCardProps) {
  const icons = [
    <Trophy key={0} className={`w-8 h-8 ${iconColors[0]}`} />,
    <Medal key={1} className={`w-8 h-8 ${iconColors[1]}`} />,
    <Award key={2} className={`w-8 h-8 ${iconColors[2]}`} />,
  ];

  return (
    <button
      onClick={onClick}
      className={`relative bg-gradient-to-br ${gradients[rank]} rounded-2xl border p-5 text-left hover:scale-[1.02] transition-transform cursor-pointer w-full`}
    >
      <div className="absolute top-3 right-3">{icons[rank]}</div>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-[#1a1a24] border border-[#2a2a3a] flex items-center justify-center text-xl font-bold text-[#f0f0f5]">
          {rank + 1}
        </div>
        <div className="min-w-0">
          <h4 className="font-bold text-[#f0f0f5] text-lg truncate">{name}</h4>
          {subtitle && <p className="text-sm text-[#5a5a6e] truncate">{subtitle}</p>}
        </div>
      </div>
      <div className={`grid gap-2 mt-4 ${stats.length === 3 ? "grid-cols-3" : stats.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
        {stats.map((s, i) => (
          <div key={i} className="text-center">
            <p className={`text-2xl font-bold ${s.color || "text-[#f0f0f5]"}`}>{s.value}</p>
            <p className="text-xs text-[#5a5a6e] uppercase">{s.label}</p>
          </div>
        ))}
      </div>
      {streak && streak >= 3 && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-orange-400">
          <Flame className="w-3.5 h-3.5" />
          <span>Streak de {streak} XTs</span>
        </div>
      )}
    </button>
  );
}

export default PodiumCard;