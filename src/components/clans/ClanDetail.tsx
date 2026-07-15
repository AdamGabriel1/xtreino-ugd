import { useParams } from "react-router-dom";
import { Shield, Star, Layers, Users, Swords, Award, ChevronRight, Crown, ExternalLink } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useXtreinoCalculations, calcKillPoints } from "@/hooks/xtreinos/useXtreinoCalculations";
import type { PlayerItem, EnrichedPlayerItem } from "@/types/clans";
import { getStatusBadge, getStatusLabel } from "@/utils/badges";
import PageHeader from "./PageHeader";
import StatsCards from "./StatsCards";
import { useNavigate } from "react-router-dom";

export default function ClanDetail() {
  const { clanId } = useParams<{ clanId: string }>();
  const navigate = useNavigate();
  const id = Number(clanId);

  const { data: clan, isLoading } = trpc.clans.getById.useQuery(
    { id },
    { enabled: !isNaN(id) }
  );

  // Lógica de enriquecimento (igual você já fazia no index, movida para cá)
  const { data: allResults } = trpc.xtreinos.listResults.useQuery(undefined, { enabled: !!clan });
  const { data: allPlayerStats } = trpc.xtreinos.listPlayerStats.useQuery(undefined, { enabled: !!clan });
  const { playerAccumulated } = useXtreinoCalculations({ results: allResults ?? [], playerStats: allPlayerStats ?? [] });

  const enrichPlayer = (player: PlayerItem): EnrichedPlayerItem => {
    const statsMap = new Map(playerAccumulated.map(s => [s.playerName.trim().toLowerCase(), s]));
    const stats = statsMap.get(player.nickname.trim().toLowerCase());
    return {
      ...player,
      totalXtreinoKills: stats?.totalKills ?? 0,
      q1Kills: stats?.totalQ1Kills ?? 0,
      q2Kills: stats?.totalQ2Kills ?? 0,
      q3Kills: stats?.totalQ3Kills ?? 0,
      participations: stats?.participations ?? 0,
      avgKills: stats?.avgKills ?? 0,
      killPoints: calcKillPoints(stats?.totalKills ?? 0),
      xtreinoDates: stats?.xtreinoDates ?? [],
    };
  };

  if (isLoading || !clan) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // CORREÇÕES: Adicionado `(t: any)` nas linhas 50 e 51
  const activeTeams = clan.teams?.filter((t: any) => t.status === "active") ?? [];
  const allClanPlayers = clan.teams?.flatMap((t: any) => t.players ?? []) ?? [];
  const enrichedClanPlayers = allClanPlayers.map(enrichPlayer);
  
  // CORREÇÕES: Adicionado `(sum: any, p: any)` nas linhas 54, 55 e `(acc: any, t: any)` na linha 56
  const clanTotalKills = enrichedClanPlayers.reduce((sum: any, p: any) => sum + p.totalXtreinoKills, 0);
  const clanTotalPoints = enrichedClanPlayers.reduce((sum: any, p: any) => sum + p.killPoints, 0);
  const totalPlayers = clan.teams?.reduce((acc: any, t: any) => acc + (t.players?.length ?? 0), 0) ?? 0;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <PageHeader
        title={clan.name}
        subtitle={clan.description}
        backLabel="Voltar para Clãs"
        onBack={() => navigate("/clans")}
        icon={clan.logo ? <img src={clan.logo} alt={clan.name} className="w-12 h-12 rounded-lg object-cover" /> : <Shield className="w-8 h-8 text-emerald-400/50" />}
        extraInfo={
          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-2 py-0.5 rounded bg-[#1a1a24] text-[#8a8a9e] text-sm font-medium border border-[#2a2a3a]">[{clan.tag}]</span>
            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusBadge(clan.status)}`}>{getStatusLabel(clan.status)}</span>
            {clan.discord && (
              <a href={clan.discord} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
                <ExternalLink className="w-3 h-3" /> Discord
              </a>
            )}
          </div>
        }
      />

      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6 space-y-6">
        <StatsCards stats={[
          { icon: <Layers className="w-4 h-4 text-emerald-400" />, label: "Lines", value: clan.teams?.length ?? 0, subValue: `${activeTeams.length} ativas`, color: "#10b981" },
          { icon: <Users className="w-4 h-4 text-blue-400" />, label: "Jogadores", value: totalPlayers, color: "#3b82f6" },
          { icon: <Swords className="w-4 h-4 text-emerald-400" />, label: "Total Kills XT", value: clanTotalKills, color: "#10b981" },
          { icon: <Award className="w-4 h-4 text-emerald-400" />, label: "Total Pts XT", value: clanTotalPoints, color: "#f0f0f5" },
        ]} />

        {activeTeams.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-[#f0f0f5] mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-emerald-400" /> Lines Ativas ({activeTeams.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeTeams.map((team: any) => { // CORREÇÃO: Adicionado `(team: any)` na linha 93
                // CORREÇÕES: Adicionado `(p: any)` nas linhas 94, 95, 96
                const captain = team.players?.find((p: any) => p.role === "captain");
                const officialCount = team.players?.filter((p: any) => p.role === "official" || p.role === "captain").length ?? 0;
                const reserveCount = team.players?.filter((p: any) => p.role === "reserve").length ?? 0;
                const enrichedPlayers = (team.players ?? []).map(enrichPlayer);
                // CORREÇÃO: Adicionado `(sum: any, p: any)` na linha 98
                const teamKills = enrichedPlayers.reduce((sum: any, p: any) => sum + p.totalXtreinoKills, 0);
                
                return (
                  <div 
                    key={team.id} 
                    onClick={() => navigate(`/clans/${id}/line/${team.id}`)} 
                    className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-5 cursor-pointer hover:border-emerald-500/30 hover:bg-[#1a1a24] transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-900/30 to-emerald-600/10 flex items-center justify-center shrink-0 border border-[#2a2a3a]">
                          {team.logo ? <img src={team.logo} alt={team.name} className="w-9 h-9 rounded-lg object-cover" /> : <Shield className="w-6 h-6 text-emerald-400/50" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-[#f0f0f5] group-hover:text-emerald-400 transition-colors">{team.name}</h4>
                          <span className="text-xs text-[#5a5a6e]">[{team.tag}]</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#2a2a3a] group-hover:text-emerald-400 transition-colors" />
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      {captain && (
                        <div className="flex items-center gap-2">
                          <Crown className="w-3.5 h-3.5 text-yellow-400" />
                          <span className="text-[#8a8a9e]">Cap:</span>
                          <span className="text-yellow-400 font-medium">{captain.nickname}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs text-[#5a5a6e] border-t border-[#2a2a3a] pt-2 mt-2">
                        <span>{officialCount} tit. / {reserveCount} res.</span>
                        <span className="text-emerald-400 font-medium">{teamKills} Kills XT</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}