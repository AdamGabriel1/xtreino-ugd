import { useState, useMemo } from "react";
import {
  Users,
  Search,
  Shield,
  UserCircle,
  ChevronRight,
  ArrowLeft,
  Filter,
  Crown,
  Target,
  ExternalLink,
  Layers,
  Star,
  RotateCcw,
  Trophy,
  Medal,
  Swords,
  BarChart3,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Award,
  Calendar,
  Clock,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import MainLayout from "@/layout/MainLayout";
import {
  useXtreinoCalculations,
  calcKillPoints,
} from "../hooks/useXtreinoCalculations";

type SortField = "name" | "teamsCount" | "playersCount";
type SortDir = "asc" | "desc";

type PlayerSortField = "totalXtreinoKills" | "participations" | "avgKills" | "q1Kills" | "q2Kills" | "q3Kills" | "killPoints";
type PlayerSortDir = "asc" | "desc";

interface ClanItem {
  id: number;
  name: string;
  tag: string;
  description: string | null;
  logo: string | null;
  color: string | null;
  status: string;
  discord: string | null;
  teams: TeamItem[];
}

interface TeamItem {
  id: number;
  name: string;
  tag: string;
  logo: string | null;
  description: string | null;
  status: string;
  captainName: string | null;
  captainId: number | null;
  players: PlayerItem[];
}

interface PlayerItem {
  id: number;
  nickname: string;
  uid: string | null;
  role: string;
  kills: number;
  deaths: number;
  wins: number;
  matches: number;
}

// Interface estendida para jogadores com stats de xtreino
interface EnrichedPlayerItem extends PlayerItem {
  totalXtreinoKills: number;
  q1Kills: number;
  q2Kills: number;
  q3Kills: number;
  participations: number;
  avgKills: number;
  killPoints: number;
  xtreinoDates: string[];
}

export default function Clans() {
  const [search, setSearch] = useState("");
  const [selectedClan, setSelectedClan] = useState<number | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [showDisbanded, setShowDisbanded] = useState(false);

  // Filtros de mês e dia do xtreino
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");

  // Player sort state
    const [playerSortField, setPlayerSortField] = useState<PlayerSortField>("totalXtreinoKills");
  const [playerSortDir, setPlayerSortDir] = useState<PlayerSortDir>("desc");

  // Queries
  const { data: clansList, isLoading: clansLoading } = trpc.clans.list.useQuery(
    search ? { search } : undefined
  );
  const { data: clanDetail } = trpc.clans.getById.useQuery(
    { id: selectedClan! },
    { enabled: !!selectedClan }
  );
  const { data: teamDetail } = trpc.teams.getById.useQuery(
    { id: selectedTeam! },
    { enabled: !!selectedTeam }
  );
  const { data: allResults } = trpc.xtreinos.listResults.useQuery();
  const { data: allPlayerStats } = trpc.xtreinos.listPlayerStats.useQuery();
  const { data: playerDetail } = trpc.players.getById.useQuery(
    { id: selectedPlayer ? parseInt(selectedPlayer) : 0 },
    { enabled: !!selectedPlayer && !isNaN(parseInt(selectedPlayer)) }
  );

  // Hook de cálculos do xtreino
  const {
    playerAccumulated,
    playerXtreinoStats,
    availableMonths,
    availableDates,

  } = useXtreinoCalculations({
    results: allResults ?? [],
    playerStats: allPlayerStats ?? [],
    selectedMonth,
    selectedDate,
  });

  const isSingleXtreino = !!selectedDate;

  // Enrich data with stats
  const enrichedClans = useMemo(() => {
    if (!clansList) return [];
    return clansList.map((clan: ClanItem) => {
      const activeLines = clan.teams?.filter((t: TeamItem) => t.status === "active").length ?? 0;
      const totalPlayers = clan.teams?.reduce((acc: number, t: TeamItem) => acc + (t.players?.length ?? 0), 0) ?? 0;
      return {
        ...clan,
        totalPlayers,
        activeLines,
      };
    });
  }, [clansList]);

  // Ordenação de clãs
  const sortedClans = useMemo(() => {
    const filtered = enrichedClans.filter((clan: ClanItem & { totalPlayers: number; activeLines: number }) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        clan.name.toLowerCase().includes(q) ||
        clan.tag.toLowerCase().includes(q) ||
        (clan.description?.toLowerCase().includes(q) ?? false)
      );
    }).filter((clan: ClanItem & { activeLines: number }) => {
      if (showDisbanded) return true;
      return clan.activeLines > 0 || (clan.teams?.length ?? 0) === 0;
    });

    return [...filtered].sort((a: ClanItem & { totalPlayers: number }, b: ClanItem & { totalPlayers: number }) => {
      if (sortField === "name") {
        return sortDir === "desc" ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name);
      }
      if (sortField === "teamsCount") {
        const aVal = a.teams?.length ?? 0;
        const bVal = b.teams?.length ?? 0;
        return sortDir === "desc" ? bVal - aVal : aVal - bVal;
      }
      const aVal = a.totalPlayers;
      const bVal = b.totalPlayers;
      return sortDir === "desc" ? bVal - aVal : aVal - bVal;
    });
  }, [enrichedClans, search, sortField, sortDir, showDisbanded]);

  // Stats gerais
  const stats = useMemo(() => {
    if (!clansList) return null;
    const allTeams = clansList.flatMap((c: ClanItem) => c.teams ?? []);
    const allPlayers = allTeams.flatMap((t: TeamItem) => t.players ?? []);
    return {
      totalClans: clansList.length,
      totalTeams: allTeams.length,
      totalPlayers: allPlayers.length,
      activeClans: clansList.filter((c: ClanItem) => c.teams?.some((t: TeamItem) => t.status === "active")).length,
    };
  }, [clansList]);

  // Helper: enriquecer jogador com stats de xtreino
  const enrichPlayerWithXtreino = (player: PlayerItem): EnrichedPlayerItem => {
    const nameKey = player.nickname.trim().toLowerCase();

    if (isSingleXtreino) {
      const dayStats = playerXtreinoStats.find(
        (s) => s.playerName.trim().toLowerCase() === nameKey && s.date === selectedDate
      );

      if (dayStats) {
        return {
          ...player,
          totalXtreinoKills: dayStats.totalKills,
          q1Kills: dayStats.q1Kills,
          q2Kills: dayStats.q2Kills,
          q3Kills: dayStats.q3Kills,
          participations: 1,
          avgKills: dayStats.totalKills,
          killPoints: dayStats.killPoints,
          xtreinoDates: [selectedDate],
        };
      }
      return {
        ...player,
        totalXtreinoKills: 0,
        q1Kills: 0,
        q2Kills: 0,
        q3Kills: 0,
        participations: 0,
        avgKills: 0,
        killPoints: 0,
        xtreinoDates: [],
      };
    }

    const stats = playerAccumulated.find(
      (s) => s.playerName.trim().toLowerCase() === nameKey
    );

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

  // Stats do jogador selecionado (histórico de xtreinos)
  const selectedPlayerStats = useMemo(() => {
    if (!selectedPlayer) return null;
    const nameKey = selectedPlayer.toLowerCase();
    return playerXtreinoStats.filter(
      (s) => s.playerName.toLowerCase() === nameKey
    );
  }, [selectedPlayer, playerXtreinoStats]);

  // @ts-expect-error — usado na seção de listagem de clãs
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "desc" ? "asc" : "desc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const handlePlayerSort = (field: PlayerSortField) => {
    if (playerSortField === field) {
      setPlayerSortDir(playerSortDir === "desc" ? "asc" : "desc");
    } else {
      setPlayerSortField(field);
      setPlayerSortDir("desc");
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "captain": return <Crown className="w-3.5 h-3.5 text-yellow-400" />;
      case "official": return <Target className="w-3.5 h-3.5 text-blue-400" />;
      case "reserve": return <RotateCcw className="w-3.5 h-3.5 text-[#5a5a6e]" />;
      default: return null;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "captain": return "Capitão";
      case "official": return "Titular";
      case "reserve": return "Reserva";
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "captain": return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "official": return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      case "reserve": return "text-[#5a5a6e] bg-[#1a1a24] border-[#2a2a3a]";
      default: return "text-[#5a5a6e]";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "disbanded": return "bg-red-500/10 text-red-400 border-red-500/20";
      case "inactive": return "bg-[#1a1a24] text-[#5a5a6e] border-[#2a2a3a]";
      default: return "bg-[#1a1a24] text-[#5a5a6e] border-[#2a2a3a]";
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-5 h-5 text-emerald-400" />;
    if (index === 1) return <Medal className="w-5 h-5 text-emerald-300" />;
    if (index === 2) return <Medal className="w-5 h-5 text-emerald-500" />;
    return <span className="w-5 text-center text-sm font-bold text-[#5a5a6e]">{index + 1}</span>;
  };

  const getRankStyle = (index: number) => {
    if (index === 0) return "bg-gradient-to-r from-emerald-500/10 to-transparent border-l-2 border-emerald-400";
    if (index === 1) return "bg-gradient-to-r from-emerald-400/10 to-transparent border-l-2 border-emerald-300";
    if (index === 2) return "bg-gradient-to-r from-emerald-600/10 to-transparent border-l-2 border-emerald-500";
    return "hover:bg-[#1a1a24]";
  };

  const PlayerSortHeader = ({ field, label }: { field: PlayerSortField; label: string }) => (
    <button
      onClick={() => handlePlayerSort(field)}
      className="flex items-center gap-1 text-xs font-medium text-[#5a5a6e] uppercase hover:text-[#f0f0f5] transition-colors"
    >
      {label}
      {playerSortField === field && (
        playerSortDir === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
      )}
    </button>
  );

  const isLoading = clansLoading;

  // ===== DETALHE DO JOGADOR =====
  if (selectedPlayer && playerDetail) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-[#0a0a0f]">
          <div className="bg-[#12121a] border-b border-[#2a2a3a]">
            <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6">
              <button
                onClick={() => setSelectedPlayer(null)}
                className="flex items-center gap-2 text-[#5a5a6e] hover:text-[#f0f0f5] transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Voltar</span>
              </button>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-900/30 to-emerald-600/10 flex items-center justify-center shrink-0 border border-[#2a2a3a]">
                  <Target className="w-8 h-8 text-emerald-400/50" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[#f0f0f5]">{playerDetail.nickname}</h1>
                  <p className="text-sm text-[#8a8a9e] mt-1">
                    {clanDetail?.name ?? "—"} / {teamDetail?.name ?? "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-[#5a5a6e] uppercase">K/D Geral</span>
                </div>
                <p className="text-xl font-bold text-[#f0f0f5]">
                  {playerDetail.deaths > 0 
                    ? (playerDetail.kills / playerDetail.deaths).toFixed(2) 
                    : playerDetail.kills}
                </p>
              </div>
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Swords className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-[#5a5a6e] uppercase">Kills Geral</span>
                </div>
                <p className="text-xl font-bold text-[#f0f0f5]">{playerDetail.kills}</p>
              </div>
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-[#5a5a6e] uppercase">XT Kills</span>
                </div>
                <p className="text-xl font-bold text-emerald-400">
                  {playerDetail.totalXtreinoKills ?? 0}
                </p>
              </div>
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-[#5a5a6e] uppercase">XT Partic.</span>
                </div>
                <p className="text-xl font-bold text-[#f0f0f5]">
                  {playerDetail.xtreinoParticipations ?? 0}
                </p>
              </div>
            </div>

            {/* Histórico de XTreinos */}
            {selectedPlayerStats && selectedPlayerStats.length > 0 && (
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
                <div className="px-6 py-4 border-b border-[#2a2a3a]">
                  <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-emerald-400" />
                    Histórico de XTreinos
                    {selectedMonth && (
                      <span className="text-sm font-normal text-[#5a5a6e]">
                        — {selectedMonth.split("-")[1]}/{selectedMonth.split("-")[0]}
                      </span>
                    )}
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#2a2a3a] bg-[#0a0a0f]">
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Data</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Time</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Q1</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Q2</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Q3</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Total</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Pts</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2a2a3a]">
                      {selectedPlayerStats.map((stat) => (
                        <tr key={`${stat.date}-${stat.xtreinoId}`} className="hover:bg-[#1a1a24]">
                          <td className="px-4 py-3 text-sm text-[#f0f0f5]">{stat.date}</td>
                          <td className="px-4 py-3 text-sm text-[#8a8a9e]">{stat.teamName}</td>
                          <td className="px-4 py-3 text-sm text-center text-[#8a8a9e]">{stat.q1Kills}</td>
                          <td className="px-4 py-3 text-sm text-center text-[#8a8a9e]">{stat.q2Kills}</td>
                          <td className="px-4 py-3 text-sm text-center text-[#8a8a9e]">{stat.q3Kills}</td>
                          <td className="px-4 py-3 text-sm text-center text-emerald-400 font-bold">{stat.totalKills}</td>
                          <td className="px-4 py-3 text-sm text-center text-emerald-400">{stat.killPoints}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </MainLayout>
    );
  }

  // ===== DETALHE DO TIME (LINE) =====
  // Calcula jogadores enriquecidos do time SELECIONADO (fora do if para hooks funcionarem)
  const teamPlayers: PlayerItem[] = teamDetail?.players ?? [];
  const enrichedTeamPlayers = useMemo(() => {
    return teamPlayers.map(enrichPlayerWithXtreino);
  }, [teamPlayers, playerAccumulated, playerXtreinoStats, selectedDate, isSingleXtreino]);

  const sortedTeamPlayers = useMemo(() => {
    return [...enrichedTeamPlayers].sort((a, b) => {
      const aVal = a[playerSortField] ?? 0;
      const bVal = b[playerSortField] ?? 0;
      return playerSortDir === "desc" ? bVal - aVal : aVal - bVal;
    });
  }, [enrichedTeamPlayers, playerSortField, playerSortDir]);

  const officialPlayers = teamPlayers.filter((p: PlayerItem) => p.role === "official" || p.role === "captain");
  const reservePlayers = teamPlayers.filter((p: PlayerItem) => p.role === "reserve");
  const captain = teamPlayers.find((p: PlayerItem) => p.role === "captain");

  // Calcular totais do time
  const teamTotalKills = enrichedTeamPlayers.reduce((sum, p) => sum + p.totalXtreinoKills, 0);
  const teamTotalPoints = enrichedTeamPlayers.reduce((sum, p) => sum + p.killPoints, 0);
  const teamTotalParticipations = enrichedTeamPlayers.reduce((sum, p) => sum + p.participations, 0);

  if (selectedTeam && teamDetail) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-[#0a0a0f]">
          <div className="bg-[#12121a] border-b border-[#2a2a3a]">
            <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6">
              <button
                onClick={() => setSelectedTeam(null)}
                className="flex items-center gap-2 text-[#5a5a6e] hover:text-[#f0f0f5] transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Voltar para {clanDetail?.name ?? "Clã"}</span>
              </button>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-900/30 to-emerald-600/10 flex items-center justify-center shrink-0 border border-[#2a2a3a]">
                  {teamDetail.logo ? (
                    <img src={teamDetail.logo} alt={teamDetail.name} className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    <Shield className="w-8 h-8 text-emerald-400/50" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-[#f0f0f5]">{teamDetail.name}</h1>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusBadge(teamDetail.status)}`}>
                      {teamDetail.status === "active" ? "Ativa" : teamDetail.status === "disbanded" ? "Desativada" : "Inativa"}
                    </span>
                  </div>
                  <p className="text-sm text-[#8a8a9e] mt-1">
                    Line do clã <span className="text-[#f0f0f5] font-medium">{clanDetail?.name ?? "—"}</span>
                  </p>
                  {teamDetail.description && (
                    <p className="text-sm text-[#5a5a6e] mt-1">{teamDetail.description}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6 space-y-6">
            {/* Filtros de XTreino */}
            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                <div className="flex items-center gap-2 text-[#8a8a9e]">
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-medium">Filtros XTreino:</span>
                </div>
                <div className="flex flex-wrap gap-3 flex-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#5a5a6e]" />
                    <select
                      value={selectedMonth}
                      onChange={(e) => { setSelectedMonth(e.target.value); setSelectedDate(""); }}
                      className="px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-emerald-500/50 min-w-[140px]"
                    >
                      <option value="">Todos os meses</option>
                      {availableMonths.map((m) => (
                        <option key={m} value={m}>
                          {m.split("-")[1]}/{m.split("-")[0]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#5a5a6e]" />
                    <select
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      disabled={!selectedMonth}
                      className="px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-emerald-500/50 min-w-[140px] disabled:opacity-40"
                    >
                      <option value="">Todos os dias</option>
                      {availableDates.map((d) => (
                        <option key={d} value={d}>
                          {d.split("-")[2]}/{d.split("-")[1]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {(selectedMonth || selectedDate) && (
                  <button
                    onClick={() => { setSelectedMonth(""); setSelectedDate(""); }}
                    className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs text-[#5a5a6e] uppercase">Capitão</span>
                </div>
                <p className="text-lg font-bold text-[#f0f0f5]">{captain?.nickname ?? "—"}</p>
              </div>
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-[#5a5a6e] uppercase">Titulares</span>
                </div>
                <p className="text-2xl font-bold text-blue-400">{officialPlayers.length}</p>
              </div>
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <RotateCcw className="w-4 h-4 text-[#5a5a6e]" />
                  <span className="text-xs text-[#5a5a6e] uppercase">Reservas</span>
                </div>
                <p className="text-2xl font-bold text-[#5a5a6e]">{reservePlayers.length}</p>
              </div>
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-[#5a5a6e] uppercase">Total Jogadores</span>
                </div>
                <p className="text-2xl font-bold text-emerald-400">{teamPlayers.length}</p>
              </div>
            </div>

            {/* Stats de XTreino do Time */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Swords className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-[#5a5a6e] uppercase">Total Kills XT</span>
                </div>
                <p className="text-2xl font-bold text-emerald-400">{teamTotalKills}</p>
              </div>
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-[#5a5a6e] uppercase">Total Pts</span>
                </div>
                <p className="text-2xl font-bold text-[#f0f0f5]">{teamTotalPoints}</p>
              </div>
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-[#5a5a6e] uppercase">Participações</span>
                </div>
                <p className="text-2xl font-bold text-[#f0f0f5]">{teamTotalParticipations}</p>
              </div>
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-[#5a5a6e] uppercase">Média/Player</span>
                </div>
                <p className="text-2xl font-bold text-[#f0f0f5]">
                  {teamPlayers.length > 0 ? (teamTotalKills / teamPlayers.length).toFixed(1) : "0"}
                </p>
              </div>
            </div>

            {/* Elenco com Stats de XTreino */}
            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center justify-between">
                <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-400" />
                  Elenco Completo
                  {isSingleXtreino && (
                    <span className="text-sm font-normal text-[#5a5a6e]">
                      — {selectedDate.split("-")[2]}/{selectedDate.split("-")[1]}/{selectedDate.split("-")[0]}
                    </span>
                  )}
                </h3>
                <span className="text-xs text-[#5a5a6e]">{sortedTeamPlayers.length} jogadores</span>
              </div>

              {sortedTeamPlayers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#2a2a3a] bg-[#0a0a0f]">
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase w-16">Rank</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Jogador</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Role</th>
                        <th className="px-6 py-3 text-center">
                          <PlayerSortHeader field="totalXtreinoKills" label="Kills XT" />
                        </th>
                        <th className="px-6 py-3 text-center">
                          <PlayerSortHeader field="q1Kills" label="Q1" />
                        </th>
                        <th className="px-6 py-3 text-center">
                          <PlayerSortHeader field="q2Kills" label="Q2" />
                        </th>
                        <th className="px-6 py-3 text-center">
                          <PlayerSortHeader field="q3Kills" label="Q3" />
                        </th>
                        {!isSingleXtreino && (
                          <>
                            <th className="px-6 py-3 text-center">
                              <PlayerSortHeader field="participations" label="XTreinos" />
                            </th>
                            <th className="px-6 py-3 text-center">
                              <PlayerSortHeader field="avgKills" label="Média" />
                            </th>
                          </>
                        )}
                        <th className="px-6 py-3 text-center">
                          <PlayerSortHeader field="killPoints" label="Pts" />
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">K/D</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2a2a3a]">
                      {sortedTeamPlayers.map((p, i) => {
                        const kd = p.deaths > 0 ? (p.kills / p.deaths).toFixed(2) : p.kills > 0 ? p.kills.toString() : "0";
                        return (
                          <tr 
                            key={p.id} 
                            className={`${getRankStyle(i)} cursor-pointer transition-colors`}
                            onClick={() => setSelectedPlayer(p.nickname)}
                          >
                            <td className="px-6 py-3">
                              <div className="flex items-center gap-2">{getRankIcon(i)}</div>
                            </td>
                            <td className="px-6 py-3">
                              <div className="flex items-center gap-2">
                                {getRoleIcon(p.role)}
                                <span className={`text-sm font-medium ${p.role === "captain" ? "text-yellow-400" : "text-[#f0f0f5]"}`}>
                                  {p.nickname}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-3">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${getRoleColor(p.role)}`}>
                                {getRoleLabel(p.role)}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-sm text-center font-bold text-emerald-400">{p.totalXtreinoKills}</td>
                            <td className="px-6 py-3 text-sm text-center text-[#8a8a9e]">{p.q1Kills}</td>
                            <td className="px-6 py-3 text-sm text-center text-[#8a8a9e]">{p.q2Kills}</td>
                            <td className="px-6 py-3 text-sm text-center text-[#8a8a9e]">{p.q3Kills}</td>
                            {!isSingleXtreino && (
                              <>
                                <td className="px-6 py-3 text-sm text-center text-[#8a8a9e]">{p.participations}</td>
                                <td className="px-6 py-3 text-sm text-center text-[#8a8a9e]">{p.avgKills}</td>
                              </>
                            )}
                            <td className="px-6 py-3 text-sm text-center text-emerald-400">{p.killPoints}</td>
                            <td className="px-6 py-3 text-sm text-center text-red-400 font-bold">{kd}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-6 py-12 text-center">
                  <UserCircle className="w-12 h-12 mx-auto mb-4 text-[#2a2a3a]" />
                  <p className="text-[#5a5a6e] text-lg font-medium">Nenhum jogador registrado</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // ===== DETALHE DO CLÃ =====
  if (selectedClan && clanDetail) {
    const clanTeams: TeamItem[] = clanDetail.teams ?? [];
    const activeTeams = clanTeams.filter((t: TeamItem) => t.status === "active");
    const disbandedTeams = clanTeams.filter((t: TeamItem) => t.status === "disbanded");

    // Coletar todos os jogadores do clã para stats agregados
    const allClanPlayers = clanTeams.flatMap((t: TeamItem) => t.players ?? []);
    const enrichedClanPlayers = allClanPlayers.map(enrichPlayerWithXtreino);
    const clanTotalKills = enrichedClanPlayers.reduce((sum, p) => sum + p.totalXtreinoKills, 0);
    const clanTotalPoints = enrichedClanPlayers.reduce((sum, p) => sum + p.killPoints, 0);

    return (
      <MainLayout>
        <div className="min-h-screen bg-[#0a0a0f]">
          {/* Header do Clã */}
          <div className="bg-[#12121a] border-b border-[#2a2a3a]">
            <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
              <button
                onClick={() => setSelectedClan(null)}
                className="flex items-center gap-2 text-[#5a5a6e] hover:text-[#f0f0f5] transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Voltar para Clãs</span>
              </button>

              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 border border-[#2a2a3a]"
                  style={{
                    background: clanDetail.color
                      ? `linear-gradient(135deg, ${clanDetail.color}30, ${clanDetail.color}10)`
                      : "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.05))",
                  }}
                >
                  {clanDetail.logo ? (
                    <img src={clanDetail.logo} alt={clanDetail.name} className="w-16 h-16 rounded-xl object-cover" />
                  ) : (
                    <Shield className="w-10 h-10" style={{ color: clanDetail.color ?? "#10b981" }} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-3xl font-extrabold text-[#f0f0f5]">{clanDetail.name}</h1>
                    <span className="px-2 py-0.5 rounded bg-[#1a1a24] text-[#8a8a9e] text-sm font-medium border border-[#2a2a3a]">
                      [{clanDetail.tag}]
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusBadge(clanDetail.status)}`}>
                      {clanDetail.status === "active" ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                  {clanDetail.description && (
                    <p className="text-[#8a8a9e] mt-2 max-w-2xl">{clanDetail.description}</p>
                  )}
                  {clanDetail.discord && (
                    <a
                      href={clanDetail.discord}
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
            {/* Stats do Clã */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-[#5a5a6e] uppercase">Lines</span>
                </div>
                <p className="text-2xl font-bold text-emerald-400">{clanTeams.length}</p>
                <p className="text-xs text-[#5a5a6e] mt-1">{activeTeams.length} ativas</p>
              </div>
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-[#5a5a6e] uppercase">Jogadores</span>
                </div>
                <p className="text-2xl font-bold text-blue-400">
                  {clanTeams.reduce((acc: number, t: TeamItem) => acc + (t.players?.length ?? 0), 0)}
                </p>
              </div>
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Swords className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-[#5a5a6e] uppercase">Total Kills XT</span>
                </div>
                <p className="text-2xl font-bold text-emerald-400">{clanTotalKills}</p>
              </div>
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-[#5a5a6e] uppercase">Total Pts XT</span>
                </div>
                <p className="text-2xl font-bold text-[#f0f0f5]">{clanTotalPoints}</p>
              </div>
            </div>

            {/* Lines Ativas */}
            {activeTeams.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-[#f0f0f5] mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-emerald-400" />
                  Lines Ativas ({activeTeams.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeTeams.map((team: TeamItem) => {
                    const officialCount = team.players?.filter((p: PlayerItem) => p.role === "official" || p.role === "captain").length ?? 0;
                    const reserveCount = team.players?.filter((p: PlayerItem) => p.role === "reserve").length ?? 0;
                    const captain = team.players?.find((p: PlayerItem) => p.role === "captain");

                    // Calcular stats de xtreino da line
                    const teamPlayers = team.players ?? [];
                    const enrichedPlayers = teamPlayers.map(enrichPlayerWithXtreino);
                    const teamKills = enrichedPlayers.reduce((sum, p) => sum + p.totalXtreinoKills, 0);
                    const teamPoints = enrichedPlayers.reduce((sum, p) => sum + p.killPoints, 0);

                    return (
                      <div
                        key={team.id}
                        onClick={() => setSelectedTeam(team.id)}
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

                          {/* Stats de XTreino na preview */}
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

            {/* Lines Desativadas */}
            {disbandedTeams.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-[#f0f0f5] mb-4 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#5a5a6e]" />
                  Lines Desativadas ({disbandedTeams.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
                  {disbandedTeams.map((team: TeamItem) => (
                    <div
                      key={team.id}
                      onClick={() => setSelectedTeam(team.id)}
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
      </MainLayout>
    );
  }

  // ===== LISTAGEM DE CLÃS =====
  return (
    <MainLayout>
      <div className="min-h-screen bg-[#0a0a0f]">
        {/* Header */}
        <div className="bg-[#12121a] border-b border-[#2a2a3a]">
          <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8 text-emerald-400" />
              <h1 className="text-3xl md:text-4xl font-extrabold text-[#f0f0f5]">Clãs</h1>
            </div>
            <p className="text-[#8a8a9e]">
              Conheça todas as organizações e suas lines registradas no sistema
            </p>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6 space-y-6">
          {/* ===== FILTROS ===== */}
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              <div className="flex items-center gap-2 text-[#8a8a9e]">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filtros:</span>
              </div>

              <div className="flex flex-wrap gap-3 flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5a6e]" />
                  <input
                    type="text"
                    placeholder="Buscar clã..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm placeholder-[#5a5a6e] focus:outline-none focus:border-emerald-500/50 min-w-[250px]"
                  />
                </div>

                <label className="flex items-center gap-2 text-sm text-[#8a8a9e] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showDisbanded}
                    onChange={(e) => setShowDisbanded(e.target.checked)}
                    className="w-4 h-4 rounded border-[#2a2a3a] bg-[#1a1a24] text-emerald-500 focus:ring-emerald-500/20"
                  />
                  Mostrar clãs inativos
                </label>
              </div>

              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          </div>

          {/* ===== CARDS DE RESUMO ===== */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-[#5a5a6e] uppercase">Total Clãs</span>
                </div>
                <p className="text-2xl font-bold text-emerald-400">{stats.totalClans}</p>
              </div>
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-[#5a5a6e] uppercase">Total Lines</span>
                </div>
                <p className="text-2xl font-bold text-blue-400">{stats.totalTeams}</p>
              </div>
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-[#5a5a6e] uppercase">Jogadores</span>
                </div>
                <p className="text-2xl font-bold text-emerald-400">{stats.totalPlayers}</p>
              </div>
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs text-[#5a5a6e] uppercase">Clãs Ativos</span>
                </div>
                <p className="text-2xl font-bold text-yellow-400">{stats.activeClans}</p>
              </div>
            </div>
          )}

          {/* ===== LOADING ===== */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[#5a5a6e]">Carregando clãs...</p>
            </div>
          )}

          {/* ===== GRID DE CLÃS ===== */}
          {!isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedClans.map((clan: ClanItem & { totalPlayers: number; activeLines: number }) => (
                <div
                  key={clan.id}
                  onClick={() => setSelectedClan(clan.id)}
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

                  {/* Preview das lines */}
                  {clan.teams && clan.teams.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[#2a2a3a]">
                      <div className="flex flex-wrap gap-1.5">
                        {clan.teams.slice(0, 4).map((team: TeamItem) => (
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
              ))}
            </div>
          )}

          {sortedClans.length === 0 && !isLoading && (
            <div className="text-center py-16">
              <Shield className="w-12 h-12 mx-auto mb-4 text-[#2a2a3a]" />
              <p className="text-[#5a5a6e] text-lg font-medium">Nenhum clã encontrado</p>
              <p className="text-[#3a3a4e] text-sm mt-1">
                {search ? "Tente ajustar a busca" : "Nenhum clã registrado"}
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}