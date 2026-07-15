import { Shield, Layers, Users, Star, ChevronRight } from "lucide-react";
import type { ClanWithStats } from "@/types/clans";

interface ClanCardProps {
  clan: ClanWithStats;
  onClick: () => void;
}

export default function ClanCard({ clan, onClick }: ClanCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-5 cursor-pointer hover:border-emerald-500/30 hover:bg-[#1a1a24] transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 border border-[#2a2a3a]"
            style={{
              background: clan.color
                ? `linear-gradient(135deg, ${clan.color}30, ${clan.color}10)`
                : "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.05))",
            }}
          >
            {clan.logo ? (
              <img src={clan.logo} alt={clan.name} className="w-10 h-10 rounded-lg object-cover" />
            ) : (
              <Shield className="w-7 h-7" style={{ color: clan.color ?? "#10b981" }} />
            )}
          </div>
          <div>
            <h3 className="font-bold text-[#f0f0f5] group-hover:text-emerald-400 transition-colors">
              {clan.name}
            </h3>
            <span className="text-xs text-[#5a5a6e]">[{clan.tag}]</span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-[#2a2a3a] group-hover:text-emerald-400 transition-colors" />
      </div>

      {clan.description && (
        <p className="text-sm text-[#5a5a6e] mb-4 line-clamp-2">{clan.description}</p>
      )}

      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-[#8a8a9e]">{clan.teams?.length ?? 0} lines</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[#8a8a9e]">{clan.totalPlayers} jogadores</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 text-yellow-400" />
          <span className="text-[#8a8a9e]">{clan.activeLines} ativas</span>
        </div>
      </div>

      {clan.teams && clan.teams.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[#2a2a3a]">
          <div className="flex flex-wrap gap-1.5">
            {clan.teams.slice(0, 4).map((team) => (
              <span
                key={team.id}
                className={`px-2 py-0.5 rounded text-xs font-medium border ${
                  team.status === "active"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-[#1a1a24] text-[#5a5a6e] border-[#2a2a3a]"
                }`}
              >
                {team.name}
              </span>
            ))}
            {clan.teams.length > 4 && (
              <span className="px-2 py-0.5 rounded text-xs text-[#5a5a6e]">
                +{clan.teams.length - 4}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}