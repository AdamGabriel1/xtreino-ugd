import { useMemo } from "react";
import { ArrowLeft, Shield, Star, Layers, ExternalLink, Crown, Users, RotateCcw, Swords, Award, ChevronRight } from "lucide-react";
import type { ClanItem, TeamItem, PlayerItem, EnrichedPlayerItem } from "../types/clans";
import StatsCards from "./StatsCards";

interface ClanDetailProps {
  clan: ClanItem;
  onBack: () => void;
  onTeamClick: (teamId: number) => void;
  enrichPlayer: (player: PlayerItem) => EnrichedPlayerItem;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "disbanded": return "bg-red-500/10 text-red-400 border-red-500/20";
    case "inactive": return "bg-[#1a1a24] text-[#5a5a6e] border-[#2a2a3a]";
    default: return "bg-[#1a1a24] text-[#5a5a6e] border-[#2a2a3a]";
  }
};

export default function ClanDetail({ clan, onBack, onTeamClick, enrichPlayer }: ClanDetailProps) {
  const activeTeams = clan.teams?.filter((t) => t.status === "active") ?? [];
  const disbandedTeams = clan.teams?.filter((t) => t.status === "disbanded") ?? [];

  const allClanPlayers = clan.teams?.flatMap((t) => t.players ?? []) ?? [];
  const enrichedClanPlayers = allClanPlayers.map(enrichPlayer);
  const clanTotalKills = enrichedClanPlayers.reduce((sum, p) => sum + p.totalXtreinoKills, 0);
  const clanTotalPoints = enrichedClanPlayers.reduce((sum, p) => sum + p.killPoints, 0);
  const totalPlayers = clan.teams?.reduce((acc, t) => acc + (t.players?.length ?? 0), 0) ?? 0;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="bg-[#12121a] border-b border-[#2a2a3a]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#5a5a6e] hover:text-[#f0f0f5] transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Voltar para Clãs</span>
          </button>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 border border-[#2a2a3a]"
              style={{
                background: clan.color
                  ? `linear-gradient(135deg, ${clan.color}30, ${clan.color}10)`
                  : "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.05))",
              }}
            >
              {clan.logo ? (
                <img src={clan.logo} alt={clan.name} className="w-16 h-16 rounded-xl object-cover" />
              ) : (
                <Shield className="w-10 h-10" style={{ color: clan.color ?? "#10b981" }} />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-extrabold text-[#f0f0f5]">{clan.name}</h1>
                <span className="px-2 py-0.5 rounded bg-[#1a1a24] text-[#8a8a9e] text-sm font-medium border border-[#2a2a3a]">
                  [{clan.tag}]
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusBadge(clan.status)}`}>
                  {clan.status === "active" ? "Ativo" : "Inativo"}
                </span>
              </div>
              {clan.description && (
                <p className="text-[#8a8a9e] mt-2 max-w-2xl">{clan.description}</p>
              )}
              {clan.discord && (
                <a
                  href={clan.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 mt-2 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  Discord do Clã
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6 space-y-6">
        <StatsCards
          stats={[
            { icon: <Layers className="w-4 h-4 text-emerald-400" />, label: "Lines", value: clan.teams?.length ?? 0, subValue: `${activeTeams.length} ativas`, color: "#10b981" },
            { icon: <Users className="w-4 h-4 text-blue-400" />, label: "Jogadores", value: totalPlayers, color: "#3b82f6" },
            { icon: <Swords className="w-4 h-4 text-emerald-400" />, label: "Total Kills XT", value: clanTotalKills, color: "#10b981" },
            { icon: <Award className="w-4 h-4 text-emerald-400" />, label: "Total Pts XT", value: clanTotalPoints, color: "#f0f0f5" },
          ]}
        />

        {activeTeams.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-[#f0f0f5] mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-emerald-400" />
              Lines Ativas ({activeTeams.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeTeams.map((team) => {
                const officialCount = team.players?.filter((p) => p.role === "official" || p.role === "captain").length ?? 0;
                const reserveCount = team.players?.filter((p) => p.role === "reserve").length ?? 0;
                const captain = team.players?.find((p) => p.role === "captain");
                const teamPlayers = team.players ?? [];
                const enrichedPlayers = teamPlayers.map(enrichPlayer);
                const teamKills = enrichedPlayers.reduce((sum, p) => sum + p.totalXtreinoKills, 0);
                const teamPoints = enrichedPlayers.reduce((sum, p) => sum + p.killPoints, 0);

                return (
                  <div
                    key={team.id}
                    onClick={() => onTeamClick(team.id)}
                    className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-5 cursor-pointer hover:border-emerald-500/30 hover:bg-[#1a1a24] transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-900/30 to-emerald-600/10 flex items-center justify-center shrink-0 border border-[#2a2a3a]">
                          {team.logo ? (
                            <img src={team.logo} alt={team.name} className="w-9 h-9 rounded-lg object-cover" />
                          ) : (
                            <Shield className="w-6 h-6 text-emerald-400/50" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-[#f0f0f5] group-hover:text-emerald-400 transition-colors">
                            {team.name}
                          </h4>
                          <span className="text-xs text-[#5a5a6e]">[{team.tag}]</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#2a2a3a] group-hover:text-emerald-400 transition-colors" />
                    </div>
                    {team.description && (
                      <p className="text-sm text-[#5a5a6e] mb-3 line-clamp-2">{team.description}</p>
                    )}
                    <div className="space-y-2">
                      {captain && (
                        <div className="flex items-center gap-2 text-sm">
                          <Crown className="w-3.5 h-3.5 text-yellow-400" />
                          <span className="text-[#8a8a9e]">Cap:</span>
                          <span className="text-yellow-400 font-medium">{captain.nickname}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-blue-400" />
                          <span className="text-[#8a8a9e]">{officialCount} titulares</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <RotateCcw className="w-3 h-3 text-[#5a5a6e]" />
                          <span className="text-[#5a5a6e]">{reserveCount} reservas</span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-[#2a2a3a] flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1">
                          <Swords className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400 font-medium">{teamKills} kills</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Award className="w-3 h-3 text-emerald-400" />
                          <span className="text-[#8a8a9e]">{teamPoints} pts</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {disbandedTeams.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-[#f0f0f5] mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#5a5a6e]" />
              Lines Desativadas ({disbandedTeams.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
              {disbandedTeams.map((team) => (
                <div
                  key={team.id}
                  onClick={() => onTeamClick(team.id)}
                  className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-5 cursor-pointer hover:border-emerald-500/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-[#5a5a6e]" />
                    <div>
                      <h4 className="font-bold text-[#5a5a6e]">{team.name}</h4>
                      <span className="text-xs text-[#3a3a4e]">Desativada</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}