import { useState, useMemo } from "react";
import { ArrowLeft, Shield, Crown, Users, RotateCcw, Target, Swords, Award, Calendar, TrendingUp } from "lucide-react";
import type { TeamItem, PlayerItem, EnrichedPlayerItem, PlayerSortField, PlayerSortDir } from "../types/clans";
import XtreinoFilters from "./XtreinoFilters";
import StatsCards from "./StatsCards";
import PlayerTable from "./PlayerTable";

interface TeamDetailProps {
  team: TeamItem;
  clanName: string;
  onBack: () => void;
  onPlayerClick: (nickname: string) => void;
  enrichPlayer: (player: PlayerItem) => EnrichedPlayerItem;
  xtreinoFilters: {
    selectedMonth: string;
    selectedDate: string;
    availableMonths: string[];
    availableDates: string[];
    onMonthChange: (m: string) => void;
    onDateChange: (d: string) => void;
    onClear: () => void;
  };
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "disbanded": return "bg-red-500/10 text-red-400 border-red-500/20";
    case "inactive": return "bg-[#1a1a24] text-[#5a5a6e] border-[#2a2a3a]";
    default: return "bg-[#1a1a24] text-[#5a5a6e] border-[#2a2a3a]";
  }
};

export default function TeamDetail({
  team,
  clanName,
  onBack,
  onPlayerClick,
  enrichPlayer,
  xtreinoFilters,
}: TeamDetailProps) {
  const [sortField, setSortField] = useState<PlayerSortField>("totalXtreinoKills");
  const [sortDir, setSortDir] = useState<PlayerSortDir>("desc");

  const isSingleXtreino = !!xtreinoFilters.selectedDate;

  const teamPlayers = team.players ?? [];
  const enrichedTeamPlayers = useMemo(() => {
    return teamPlayers.map(enrichPlayer);
  }, [teamPlayers, enrichPlayer]);

  const officialPlayers = teamPlayers.filter((p) => p.role === "official" || p.role === "captain");
  const reservePlayers = teamPlayers.filter((p) => p.role === "reserve");
  const captain = teamPlayers.find((p) => p.role === "captain");

  const teamTotalKills = enrichedTeamPlayers.reduce((sum, p) => sum + p.totalXtreinoKills, 0);
  const teamTotalPoints = enrichedTeamPlayers.reduce((sum, p) => sum + p.killPoints, 0);
  const teamTotalParticipations = enrichedTeamPlayers.reduce((sum, p) => sum + p.participations, 0);

  const handleSort = (field: PlayerSortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "desc" ? "asc" : "desc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="bg-[#12121a] border-b border-[#2a2a3a]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#5a5a6e] hover:text-[#f0f0f5] transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Voltar para {clanName}</span>
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-900/30 to-emerald-600/10 flex items-center justify-center shrink-0 border border-[#2a2a3a]">
              {team.logo ? (
                <img src={team.logo} alt={team.name} className="w-12 h-12 rounded-lg object-cover" />
              ) : (
                <Shield className="w-8 h-8 text-emerald-400/50" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-[#f0f0f5]">{team.name}</h1>
                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusBadge(team.status)}`}>
                  {team.status === "active" ? "Ativa" : team.status === "disbanded" ? "Desativada" : "Inativa"}
                </span>
              </div>
              <p className="text-sm text-[#8a8a9e] mt-1">
                Line do clã <span className="text-[#f0f0f5] font-medium">{clanName}</span>
              </p>
              {team.description && (
                <p className="text-sm text-[#5a5a6e] mt-1">{team.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6 space-y-6">
        <XtreinoFilters
          selectedMonth={xtreinoFilters.selectedMonth}
          selectedDate={xtreinoFilters.selectedDate}
          availableMonths={xtreinoFilters.availableMonths}
          availableDates={xtreinoFilters.availableDates}
          onMonthChange={xtreinoFilters.onMonthChange}
          onDateChange={xtreinoFilters.onDateChange}
          onClear={xtreinoFilters.onClear}
        />

        <StatsCards
          stats={[
            { icon: <Crown className="w-4 h-4 text-yellow-400" />, label: "Capitão", value: captain?.nickname ?? "—", color: "#f0f0f5" },
            { icon: <Users className="w-4 h-4 text-blue-400" />, label: "Titulares", value: officialPlayers.length, color: "#3b82f6" },
            { icon: <RotateCcw className="w-4 h-4 text-[#5a5a6e]" />, label: "Reservas", value: reservePlayers.length, color: "#5a5a6e" },
            { icon: <Target className="w-4 h-4 text-emerald-400" />, label: "Total Jogadores", value: teamPlayers.length, color: "#10b981" },
          ]}
        />

        <StatsCards
          stats={[
            { icon: <Swords className="w-4 h-4 text-emerald-400" />, label: "Total Kills XT", value: teamTotalKills, color: "#10b981" },
            { icon: <Award className="w-4 h-4 text-emerald-400" />, label: "Total Pts", value: teamTotalPoints, color: "#f0f0f5" },
            { icon: <Calendar className="w-4 h-4 text-emerald-400" />, label: "Participações", value: teamTotalParticipations, color: "#f0f0f5" },
            { icon: <TrendingUp className="w-4 h-4 text-emerald-400" />, label: "Média/Player", value: teamPlayers.length > 0 ? (teamTotalKills / teamPlayers.length).toFixed(1) : "0", color: "#f0f0f5" },
          ]}
        />

        <PlayerTable
          players={enrichedTeamPlayers}
          sortField={sortField}
          sortDir={sortDir}
          onSort={handleSort}
          onPlayerClick={onPlayerClick}
          isSingleXtreino={isSingleXtreino}
          selectedDate={xtreinoFilters.selectedDate}
        />
      </div>
    </div>
  );
}