import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Shield, Crown, Users, RotateCcw, Target, Swords, Award, Calendar, TrendingUp } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useXtreinoCalculations, calcKillPoints } from "@/hooks/xtreinos/useXtreinoCalculations";
import type { PlayerItem, EnrichedPlayerItem, PlayerSortField, PlayerSortDir } from "@/types/clans";
import { getStatusBadge, getStatusLabel } from "@/utils/badges";
import PageHeader from "./PageHeader";
import XtreinoFilters from "./XtreinoFilters";
import StatsCards from "./StatsCards";
import PlayerTable from "./PlayerTable";

interface XtreinoFiltersConfig {
  selectedMonth: string;
  selectedDate: string;
  availableMonths: string[];
  availableDates: string[];
  onMonthChange: (m: string) => void;
  onDateChange: (d: string) => void;
  onClear: () => void;
}

export default function TeamDetail({ xtreinoFilters }: { xtreinoFilters?: XtreinoFiltersConfig }) {
  const { clanId, teamId } = useParams<{ clanId: string; teamId: string }>();
  const navigate = useNavigate();
  
  const cId = Number(clanId);
  const tId = Number(teamId);

  // Filtros locais
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [sortField, setSortField] = useState<PlayerSortField>("totalXtreinoKills");
  const [sortDir, setSortDir] = useState<PlayerSortDir>("desc");

  const { data: team, isLoading } = trpc.teams.getById.useQuery({ id: tId }, { enabled: !isNaN(tId) });
  const { data: clan } = trpc.clans.getById.useQuery({ id: cId }, { enabled: !isNaN(cId) });
  
  const { data: allResults } = trpc.xtreinos.listResults.useQuery(undefined, { enabled: !!team });
  const { data: allPlayerStats } = trpc.xtreinos.listPlayerStats.useQuery(undefined, { enabled: !!team });
  const { playerAccumulated, playerXtreinoStats, availableMonths, availableDates } = useXtreinoCalculations({
    results: allResults ?? [], playerStats: allPlayerStats ?? [], selectedMonth, selectedDate,
  });

  const isSingleXtreino = !!selectedDate;

  const enrichPlayer = (player: PlayerItem): EnrichedPlayerItem => {
    const nameKey = player.nickname.trim().toLowerCase();
    if (isSingleXtreino) {
      const dayStats = playerXtreinoStats.find((s) => s.playerName.trim().toLowerCase() === nameKey && s.date === selectedDate);
      if (dayStats) return { ...player, totalXtreinoKills: dayStats.totalKills, q1Kills: dayStats.q1Kills, q2Kills: dayStats.q2Kills, q3Kills: dayStats.q3Kills, participations: 1, avgKills: dayStats.totalKills, killPoints: dayStats.killPoints, xtreinoDates: [selectedDate] };
      return { ...player, totalXtreinoKills: 0, q1Kills: 0, q2Kills: 0, q3Kills: 0, participations: 0, avgKills: 0, killPoints: 0, xtreinoDates: [] };
    }
    const statsMap = new Map(playerAccumulated.map(s => [s.playerName.trim().toLowerCase(), s]));
    const stats = statsMap.get(nameKey);
    return { ...player, totalXtreinoKills: stats?.totalKills ?? 0, q1Kills: stats?.totalQ1Kills ?? 0, q2Kills: stats?.totalQ2Kills ?? 0, q3Kills: stats?.totalQ3Kills ?? 0, participations: stats?.participations ?? 0, avgKills: stats?.avgKills ?? 0, killPoints: calcKillPoints(stats?.totalKills ?? 0), xtreinoDates: stats?.xtreinoDates ?? [] };
  };

  const teamPlayers = team?.players ?? [];
  const enrichedTeamPlayers = useMemo(() => teamPlayers.map(enrichPlayer), [teamPlayers, isSingleXtreino, playerAccumulated, playerXtreinoStats, selectedDate]);

  if (isLoading || !team) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const officialPlayers = teamPlayers.filter((p) => p.role === "official" || p.role === "captain");
  const reservePlayers = teamPlayers.filter((p) => p.role === "reserve");
  const captain = teamPlayers.find((p) => p.role === "captain");
  const teamTotalKills = enrichedTeamPlayers.reduce((sum, p) => sum + p.totalXtreinoKills, 0);
  const teamTotalPoints = enrichedTeamPlayers.reduce((sum, p) => sum + p.killPoints, 0);
  const teamTotalParticipations = enrichedTeamPlayers.reduce((sum, p) => sum + p.participations, 0);

  const handleSort = (field: PlayerSortField) => {
    if (sortField === field) setSortDir(sortDir === "desc" ? "asc" : "desc");
    else { setSortField(field); setSortDir("desc"); }
  };

  // CORREÇÃO: Agora passa o ID numérico do jogador
  const handlePlayerClick = (player_id: number) => {
    navigate(`/clans/${cId}/line/${tId}/jogador/${player_id}`);
  };

  const filtersConfig: XtreinoFiltersConfig = {
    selectedMonth, selectedDate, availableMonths, availableDates,
    onMonthChange: (m) => { setSelectedMonth(m); setSelectedDate(""); },
    onDateChange: setSelectedDate,
    onClear: () => { setSelectedMonth(""); setSelectedDate(""); },
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <PageHeader
        title={team.name}
        subtitle={`Line do clã ${clan?.name ?? "Clã"}${team.description ? ` — ${team.description}` : ""}`}
        backLabel={`Voltar para ${clan?.name ?? "Clã"}`}
        onBack={() => navigate(`/clans/${cId}`)}
        icon={team.logo ? <img src={team.logo} alt={team.name} className="w-12 h-12 rounded-lg object-cover" /> : <Shield className="w-8 h-8 text-emerald-400/50" />}
        extraInfo={<span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusBadge(team.status)}`}>{getStatusLabel(team.status)}</span>}
      />
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6 space-y-6">
        <XtreinoFilters {...filtersConfig} />
        <StatsCards stats={[
          { icon: <Crown className="w-4 h-4 text-yellow-400" />, label: "Capitão", value: captain?.nickname ?? "—", color: "#f0f0f5" },
          { icon: <Users className="w-4 h-4 text-blue-400" />, label: "Titulares", value: officialPlayers.length, color: "#3b82f6" },
          { icon: <RotateCcw className="w-4 h-4 text-[#5a5a6e]" />, label: "Reservas", value: reservePlayers.length, color: "#5a5a6e" },
          { icon: <Target className="w-4 h-4 text-emerald-400" />, label: "Total Jogadores", value: teamPlayers.length, color: "#10b981" },
        ]} />
        <StatsCards stats={[
          { icon: <Swords className="w-4 h-4 text-emerald-400" />, label: "Total Kills XT", value: teamTotalKills, color: "#10b981" },
          { icon: <Award className="w-4 h-4 text-emerald-400" />, label: "Total Pts", value: teamTotalPoints, color: "#f0f0f5" },
          { icon: <Calendar className="w-4 h-4 text-emerald-400" />, label: "Participações", value: teamTotalParticipations, color: "#f0f0f5" },
          { icon: <TrendingUp className="w-4 h-4 text-emerald-400" />, label: "Média/Player", value: teamPlayers.length > 0 ? (teamTotalKills / teamPlayers.length).toFixed(1) : "0", color: "#f0f0f5" },
        ]} />
        
        <PlayerTable
          players={enrichedTeamPlayers}
          sortField={sortField}
          sortDir={sortDir}
          onSort={handleSort}
          // CORREÇÃO DA TIPAGEM: Mudei de (nickname: string) para (id: number)
          onPlayerClick={handlePlayerClick}
          isSingleXtreino={isSingleXtreino}
          selectedDate={selectedDate}
        />
      </div>
    </div>
  );
}