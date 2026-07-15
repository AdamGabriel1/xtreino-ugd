import { UserCircle, Target, Trophy, Crown, Medal, Star } from "lucide-react";
import type { LucideIcon } from "@/types/home";

export default function FeaturedPlayerCard({ player, rank }: { player: { name?: string; entityName?: string; points: number; kills?: number; wins?: number }; rank: number }) {
  const rankColors = ["text-yellow-400", "text-gray-300", "text-amber-600"];
  const rankBgs = ["from-yellow-500/20 to-yellow-600/5", "from-gray-400/15 to-gray-500/5", "from-amber-500/15 to-amber-600/5"];
  const rankIcons: LucideIcon[] = [Crown, Medal, Star];
  const RankIcon = rankIcons[rank - 1] || Medal;

  return (
    <div className={`bg-gradient-to-br ${rankBgs[rank - 1] || "from-transparent to-transparent"} rounded-xl border border-[#2a2a3a] p-4 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-0.5 group`}>
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-900/20 border-2 border-emerald-500/30 flex items-center justify-center group-hover:border-emerald-400/50 transition-colors">
            <UserCircle className="w-7 h-7 text-emerald-400" />
          </div>
          <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#0a0a0f] border border-[#2a2a3a] flex items-center justify-center ${rankColors[rank - 1] || "text-[#5a5a6e]"}`}>
            <RankIcon className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-[#f0f0f5] font-bold text-sm truncate group-hover:text-emerald-400 transition-colors">{player.name || player.entityName}</h4>
          <p className="text-emerald-400 text-xs font-semibold">{player.points} pts</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[#5a5a6e] text-xs flex items-center gap-1">
              <Target className="w-3 h-3" />{player.kills ?? 0}K
            </span>
            <span className="text-[#5a5a6e] text-xs flex items-center gap-1">
              <Trophy className="w-3 h-3" />{player.wins ?? 0}V
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}