import { useState, useMemo } from "react";
import {
  Trophy,
  Target,
  Swords,
  BarChart3,
  TrendingUp,
  Crown,
  Zap,
  Users,
  Calendar,
  Tag,
  History,
  ChevronDown,
  ChevronUp,
  Flame,
  Award,
  BarChart2,
  CheckSquare,
  Square,
  Medal,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import {
  POSITION_POINTS,
  KILL_POINTS,
} from "@/hooks/useXtreinoCalculations";

// Componentes reutilizaveis
import {
  RankBadge,
  SummaryCards,
  SortHeader,
  FilterBar,
  SearchInput,
  EmptyState,
  LoadingSpinner,
  Sparkline,
  ComparisonBar,
  PodiumCard,
} from "./xtreino";

// ============================================================
// TIPOS
// ============================================================

interface MergedPlayer {
  id: number;
  nickname: string;
  playerName: string;
  totalKills: number;
  totalQ1Kills: number;
  totalQ2Kills: number;
  totalQ3Kills: number;
  participations: number;
  previousNicks: string[];
  avgKills: number;
}

interface EnrichedTeam {
  teamName: string;
  totalPoints: number;
  totalKills: number;
  totalKillPoints: number;
  totalPosPoints: number;
  xtreinosPlayed: number;
  top1Count: number;
  top2Count: number;
  top3Count: number;
  bestPosition: number | null;
  xtreinos: Array<{
    date: string;
    xtreinoId: number;
    q1Pos: number | null;
    q2Pos: number | null;
    q3Pos: number | null;
    totalPosPoints: number;
    totalKills: number;
    totalKillPoints: number;
    totalPoints: number;
  }>;
  // Novos campos enriquecidos
  sparkline: number[];
  streak: number;
  badges: string[];
  bestPerformance: number;
  worstPerformance: number;
  avgPosition: number;
  trend: "up" | "down" | "same";
  consistency: number;
}

type SortField = "total" | "kills" | "pos" | "xtreinos" | "avgPos" | "consistency" | "streak";

// ============================================================
// FUNCOES PURAS
// ============================================================

function getPosColor(pos: number | null): string {
  if (!pos) return "text-[#5a5a6e]";
  if (pos === 1) return "text-yellow-400 font-bold";
  if (pos === 2) return "text-gray-300 font-bold";
  if (pos === 3) return "text-amber-500 font-bold";
  return "text-[#8a8a9e]";
}

function getPosBg(pos: number | null): string {
  if (!pos) return "";
  if (pos === 1) return "bg-yellow-500/10";
  if (pos === 2) return "bg-gray-400/10";
  if (pos === 3) return "bg-amber-500/10";
  return "";
}

function getRankStyle(index: number): string {
  if (index === 0) return "bg-yellow-500/5 border-l-2 border-yellow-500";
  if (index === 1) return "bg-gray-400/5 border-l-2 border-gray-400";
  if (index === 2) return "bg-amber-500/5 border-l-2 border-amber-500";
  return "border-l-2 border-transparent";
}

function getMonthName(monthStr: string): string {
  const [year, month] = monthStr.split("-");
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];
  const monthIndex = parseInt(month) - 1;
  return `${monthNames[monthIndex]} de ${year}`;
}

function calcTeamSparkline(team: EnrichedTeam): number[] {
  return team.xtreinos
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((x) => x.totalPoints);
}

function calcTeamStreak(team: EnrichedTeam): number {
  return team.xtreinosPlayed;
}

function calcTeamBadges(team: EnrichedTeam): string[] {
  const badges: string[] = [];
  if (team.totalKills >= 50) badges.push("50 Kills");
  if (team.totalKills >= 100) badges.push("100 Kills");
  if (team.totalKills >= 200) badges.push("200 Kills");
  if (team.top1Count >= 2) badges.push("2x Campeao");
  if (team.top1Count >= 5) badges.push("5x Campeao");
  if ((team.top1Count + team.top2Count + team.top3Count) >= 5) badges.push("Top 3 Regular");
  if (team.xtreinosPlayed >= 5) badges.push("Veterano");
  if (team.xtreinosPlayed >= 10) badges.push("Lenda");
  if (team.avgPosition > 0 && team.avgPosition <= 3) badges.push("Elite");
  if (team.consistency > 0 && team.consistency <= 2) badges.push("Consistente");
  return badges;
}

function calcAvgPosition(team: EnrichedTeam): number {
  const positions: number[] = [];
  team.xtreinos.forEach((x) => {
    if (x.q1Pos) positions.push(x.q1Pos);
    if (x.q2Pos) positions.push(x.q2Pos);
    if (x.q3Pos) positions.push(x.q3Pos);
  });
  if (!positions.length) return 0;
  return Math.round((positions.reduce((a, b) => a + b, 0) / positions.length) * 10) / 10;
}

function calcConsistency(team: EnrichedTeam): number {
  if (team.xtreinos.length < 2) return 0;
  const totals = team.xtreinos.map((x) => x.totalPoints);
  const avg = totals.reduce((a, b) => a + b, 0) / totals.length;
  const variance = totals.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / totals.length;
  return Math.round(Math.sqrt(variance) * 10) / 10;
}

function calcTrend(team: EnrichedTeam): "up" | "down" | "same" {
  const sorted = team.xtreinos.sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length < 2) return "same";
  const last = sorted[sorted.length - 1].totalPoints;
  const prev = sorted[sorted.length - 2].totalPoints;
  if (last > prev) return "up";
  if (last < prev) return "down";
  return "same";
}

function calcBestPerformance(team: EnrichedTeam): number {
  if (!team.xtreinos.length) return 0;
  return Math.max(...team.xtreinos.map((x) => x.totalPoints));
}

function calcWorstPerformance(team: EnrichedTeam): number {
  if (!team.xtreinos.length) return 0;
  return Math.min(...team.xtreinos.map((x) => x.totalPoints));
}

function TrendIcon({ trend }: { trend: "up" | "down" | "same" }) {
  if (trend === "up") return <ArrowUp className="w-3 h-3 text-green-400" />;
  if (trend === "down") return <ArrowDown className="w-3 h-3 text-red-400" />;
  return <Minus className="w-3 h-3 text-[#5a5a6e]" />;
}

function BadgeIcon({ badge }: { badge: string }) {
  if (badge.includes("Kills")) return <Swords className="w-3 h-3 text-red-400" />;
  if (badge.includes("Campeao")) return <Crown className="w-3 h-3 text-yellow-400" />;
  if (badge.includes("Veterano") || badge.includes("Lenda")) return <Award className="w-3 h-3 text-purple-400" />;
  if (badge.includes("Elite")) return <Target className="w-3 h-3 text-blue-400" />;
  if (badge.includes("Consistente")) return <BarChart3 className="w-3 h-3 text-green-400" />;
  if (badge.includes("Top 3")) return <Medal className="w-3 h-3 text-amber-400" />;
  return <Zap className="w-3 h-3 text-orange-400" />;
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function RankingMensalTab() {
  const [sortBy, setSortBy] = useState<SortField>("total");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<Set<string>>(new Set());

  const { data: allResults } = trpc.xtreinos.listResults.useQuery();
  const { data: allPlayerStats } = trpc.xtreinos.listPlayerStats.useQuery();
  const { data: playersList } = trpc.players.list.useQuery();

  const isLoading = !allResults || !allPlayerStats;

  // Meses disponiveis
  const availableMonths = useMemo(() => {
    if (!allResults) return [];
    const months = new Set<string>();
    allResults.forEach((r) => {
      if (r.date) months.add(r.date.substring(0, 7));
    });
    return Array.from(months).sort().reverse();
  }, [allResults]);

  // Seleciona o mes mais recente por padrao
  useMemo(() => {
    if (availableMonths.length > 0 && !selectedMonth) {
      setSelectedMonth(availableMonths[0]);
    }
  }, [availableMonths, selectedMonth]);

  // Filtra dados pelo mes selecionado
  const filteredResults = useMemo(() => {
    if (!selectedMonth || !allResults) return [];
    return allResults.filter((r) => r.date?.startsWith(selectedMonth));
  }, [allResults, selectedMonth]);

  const filteredPlayerStats = useMemo(() => {
    if (!selectedMonth || !allPlayerStats) return [];
    return allPlayerStats.filter((s) => s.date?.startsWith(selectedMonth));
  }, [allPlayerStats, selectedMonth]);

  // Calcula stats do mes
  const monthTeamRanking = useMemo(() => {
    const map = new Map<string, {
      teamName: string;
      totalPoints: number;
      totalKills: number;
      totalKillPoints: number;
      totalPosPoints: number;
      xtreinosPlayed: number;
      top1Count: number;
      top2Count: number;
      top3Count: number;
      bestPosition: number | null;
      xtreinos: Array<{
        date: string;
        xtreinoId: number;
        q1Pos: number | null;
        q2Pos: number | null;
        q3Pos: number | null;
        totalPosPoints: number;
        totalKills: number;
        totalKillPoints: number;
        totalPoints: number;
      }>;
    }>();

    for (const result of filteredResults) {
      // Calcula kills do time neste xtreino
      const teamPlayerStats = filteredPlayerStats.filter(
        (p) => p.teamName === result.teamName && p.date === result.date
      );
      const totalKills = teamPlayerStats.reduce((sum, p) => sum + (p.totalKills || 0), 0);

      // Calcula pontos de posicao
      const q1PosPoints = POSITION_POINTS[result.q1Pos ?? 0] ?? 0;
      const q2PosPoints = POSITION_POINTS[result.q2Pos ?? 0] ?? 0;
      const q3PosPoints = POSITION_POINTS[result.q3Pos ?? 0] ?? 0;
      const totalPosPoints = q1PosPoints + q2PosPoints + q3PosPoints;
      const totalKillPoints = totalKills * KILL_POINTS;
      const totalPoints = totalPosPoints + totalKillPoints;

      const existing = map.get(result.teamName);

      const historyItem = {
        date: result.date,
        xtreinoId: result.xtreinoId,
        q1Pos: result.q1Pos,
        q2Pos: result.q2Pos,
        q3Pos: result.q3Pos,
        totalPosPoints,
        totalKills,
        totalKillPoints,
        totalPoints,
      };

      if (!existing) {
        const positions = [result.q1Pos, result.q2Pos, result.q3Pos].filter(
          (p): p is number => p !== null && p !== undefined
        );
        const bestPos = positions.length > 0 ? Math.min(...positions) : null;

        map.set(result.teamName, {
          teamName: result.teamName,
          totalPoints,
          totalKills,
          totalKillPoints,
          totalPosPoints,
          xtreinosPlayed: 1,
          top1Count: [result.q1Pos, result.q2Pos, result.q3Pos].filter((p) => p === 1).length,
          top2Count: [result.q1Pos, result.q2Pos, result.q3Pos].filter((p) => p === 2).length,
          top3Count: [result.q1Pos, result.q2Pos, result.q3Pos].filter((p) => p === 3).length,
          bestPosition: bestPos,
          xtreinos: [historyItem],
        });
      } else {
        existing.totalPoints += totalPoints;
        existing.totalKills += totalKills;
        existing.totalKillPoints += totalKillPoints;
        existing.totalPosPoints += totalPosPoints;
        existing.xtreinosPlayed += 1;

        const podiums = [result.q1Pos, result.q2Pos, result.q3Pos];
        existing.top1Count += podiums.filter((p) => p === 1).length;
        existing.top2Count += podiums.filter((p) => p === 2).length;
        existing.top3Count += podiums.filter((p) => p === 3).length;

        const positions = [result.q1Pos, result.q2Pos, result.q3Pos].filter(
          (p): p is number => p !== null && p !== undefined
        );
        if (positions.length > 0) {
          const minPos = Math.min(...positions);
          existing.bestPosition = existing.bestPosition
            ? Math.min(existing.bestPosition, minPos)
            : minPos;
        }

        existing.xtreinos.push(historyItem);
      }
    }

    return Array.from(map.values());
  }, [filteredResults, filteredPlayerStats]);

  // Enriquecer times com metricas avancadas
  const enrichedRanking: EnrichedTeam[] = useMemo(() => {
    return monthTeamRanking.map((team) => {
      const enriched: EnrichedTeam = {
        ...team,
        sparkline: calcTeamSparkline(team as EnrichedTeam),
        streak: calcTeamStreak(team as EnrichedTeam),
        badges: [],
        bestPerformance: calcBestPerformance(team as EnrichedTeam),
        worstPerformance: calcWorstPerformance(team as EnrichedTeam),
        avgPosition: calcAvgPosition(team as EnrichedTeam),
        trend: calcTrend(team as EnrichedTeam),
        consistency: calcConsistency(team as EnrichedTeam),
      };
      enriched.badges = calcTeamBadges(enriched);
      return enriched;
    });
  }, [monthTeamRanking]);

  // Jogadores agrupados por time no mes
  const monthTeamPlayers = useMemo(() => {
    const teamMap = new Map<string, Map<string, {
      playerName: string;
      totalKills: number;
      totalQ1Kills: number;
      totalQ2Kills: number;
      totalQ3Kills: number;
      participations: number;
      avgKills: number;
    }>>();

    for (const stat of filteredPlayerStats) {
      const teamKey = stat.teamName.trim().toLowerCase();
      const playerKey = stat.playerName.trim().toLowerCase();

      if (!teamMap.has(teamKey)) {
        teamMap.set(teamKey, new Map());
      }

      const playerMap = teamMap.get(teamKey)!;
      const existing = playerMap.get(playerKey);

      if (existing) {
        existing.totalKills += stat.totalKills || 0;
        existing.totalQ1Kills += stat.q1Kills || 0;
        existing.totalQ2Kills += stat.q2Kills || 0;
        existing.totalQ3Kills += stat.q3Kills || 0;
        existing.participations += 1;
      } else {
        playerMap.set(playerKey, {
          playerName: stat.playerName,
          totalKills: stat.totalKills || 0,
          totalQ1Kills: stat.q1Kills || 0,
          totalQ2Kills: stat.q2Kills || 0,
          totalQ3Kills: stat.q3Kills || 0,
          participations: 1,
          avgKills: 0,
        });
      }
    }

    const result = new Map<string, Array<{
      playerName: string;
      totalKills: number;
      totalQ1Kills: number;
      totalQ2Kills: number;
      totalQ3Kills: number;
      participations: number;
      avgKills: number;
    }>>();

    for (const [teamName, playerMap] of teamMap) {
      const players = Array.from(playerMap.values()).map((p) => ({
        ...p,
        avgKills: p.participations > 0 ? Math.round((p.totalKills / p.participations) * 10) / 10 : 0,
      }));
      players.sort((a, b) => b.totalKills - a.totalKills);
      result.set(teamName, players);
    }

    return result;
  }, [filteredPlayerStats]);

  // Map de jogadores por nome
  const playersByName = useMemo(() => {
    const map = new Map<string, { id: number; nickname: string; previousNicks: string[] }>();
    if (!playersList) return map;

    for (const p of playersList) {
      const key = p.nickname.trim().toLowerCase();
      map.set(key, {
        id: p.id,
        nickname: p.nickname,
        previousNicks: p.previousNicks ?? [],
      });
      for (const nick of (p.previousNicks ?? [])) {
        map.set(nick.trim().toLowerCase(), {
          id: p.id,
          nickname: p.nickname,
          previousNicks: p.previousNicks ?? [],
        });
      }
    }
    return map;
  }, [playersList]);

  // Merge jogadores por ID
  const mergePlayersById = (
    players: Array<{
      playerName: string;
      totalKills: number;
      totalQ1Kills: number;
      totalQ2Kills: number;
      totalQ3Kills: number;
      participations: number;
      avgKills: number;
    }>
  ): MergedPlayer[] => {
    const mergedMap = new Map<
      number,
      {
        id: number;
        nickname: string;
        playerName: string;
        totalKills: number;
        totalQ1Kills: number;
        totalQ2Kills: number;
        totalQ3Kills: number;
        participations: number;
        previousNicks: string[];
      }
    >();

    for (const player of players) {
      const playerInfo = playersByName.get(player.playerName.trim().toLowerCase());

      if (playerInfo) {
        const existing = mergedMap.get(playerInfo.id);
        if (existing) {
          existing.totalKills += player.totalKills;
          existing.totalQ1Kills += player.totalQ1Kills;
          existing.totalQ2Kills += player.totalQ2Kills;
          existing.totalQ3Kills += player.totalQ3Kills;
          existing.participations += player.participations;
        } else {
          mergedMap.set(playerInfo.id, {
            id: playerInfo.id,
            nickname: playerInfo.nickname,
            playerName: playerInfo.nickname,
            totalKills: player.totalKills,
            totalQ1Kills: player.totalQ1Kills,
            totalQ2Kills: player.totalQ2Kills,
            totalQ3Kills: player.totalQ3Kills,
            participations: player.participations,
            previousNicks: playerInfo.previousNicks,
          });
        }
      } else {
        const tempId = -Math.abs(
          player.playerName.toLowerCase().split("").reduce((a, b) => a + b.charCodeAt(0), 0)
        );
        const existing = mergedMap.get(tempId);
        if (existing) {
          existing.totalKills += player.totalKills;
          existing.totalQ1Kills += player.totalQ1Kills;
          existing.totalQ2Kills += player.totalQ2Kills;
          existing.totalQ3Kills += player.totalQ3Kills;
          existing.participations += player.participations;
        } else {
          mergedMap.set(tempId, {
            id: tempId,
            nickname: player.playerName,
            playerName: player.playerName,
            totalKills: player.totalKills,
            totalQ1Kills: player.totalQ1Kills,
            totalQ2Kills: player.totalQ2Kills,
            totalQ3Kills: player.totalQ3Kills,
            participations: player.participations,
            previousNicks: [],
          });
        }
      }
    }

    return Array.from(mergedMap.values())
      .map((p) => ({
        ...p,
        avgKills: p.participations > 0 ? Math.round((p.totalKills / p.participations) * 10) / 10 : 0,
      }))
      .sort((a, b) => b.totalKills - a.totalKills);
  };

  // Ordenar ranking
  const sortedRanking = useMemo(() => {
    return [...enrichedRanking].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "kills":
          comparison = a.totalKills - b.totalKills;
          break;
        case "pos":
          comparison = a.totalPosPoints - b.totalPosPoints;
          break;
        case "xtreinos":
          comparison = a.xtreinosPlayed - b.xtreinosPlayed;
          break;
        case "avgPos":
          comparison = a.avgPosition - b.avgPosition;
          break;
        case "consistency":
          comparison = a.consistency - b.consistency;
          break;
        case "streak":
          comparison = a.streak - b.streak;
          break;
        default:
          comparison = a.totalPoints - b.totalPoints;
          break;
      }
      return sortDir === "desc" ? -comparison : comparison;
    });
  }, [enrichedRanking, sortBy, sortDir]);

  // Filtro por busca
  const filteredRanking = useMemo(() => {
    if (!search.trim()) return sortedRanking;
    const q = search.toLowerCase();
    return sortedRanking.filter((t) => t.teamName.toLowerCase().includes(q));
  }, [sortedRanking, search]);

  // Top 3 para podio
  const top3 = useMemo(() => {
    if (filteredRanking.length < 3) return [];
    return filteredRanking.slice(0, 3);
  }, [filteredRanking]);

  // Times para comparacao
  const comparisonTeams = useMemo(() => {
    return sortedRanking.filter((t) => selectedForCompare.has(t.teamName));
  }, [sortedRanking, selectedForCompare]);

  // Busca jogadores do time e merge por ID
  const getTeamPlayers = (teamName: string): MergedPlayer[] => {
    const teamKey = teamName.trim().toLowerCase();
    const players = monthTeamPlayers.get(teamKey) ?? [];
    return mergePlayersById(players);
  };

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortBy(field);
      setSortDir("desc");
    }
  };

  const toggleCompare = (teamName: string) => {
    setSelectedForCompare((prev) => {
      const next = new Set(prev);
      if (next.has(teamName)) next.delete(teamName);
      else if (next.size < 4) next.add(teamName);
      return next;
    });
  };

  const clearFilters = () => {
    setSearch("");
    setSortBy("total");
    setSortDir("desc");
    setSelectedForCompare(new Set());
    setCompareMode(false);
  };

  const hasFilters = search.trim().length > 0 || sortBy !== "total" || compareMode;

  // Conta xtreinos unicos do mes
  const totalXtreinosUnicos = useMemo(() => {
    const uniqueXtreinoIds = new Set<number>();
    filteredResults.forEach((r) => uniqueXtreinoIds.add(r.xtreinoId));
    return uniqueXtreinoIds.size;
  }, [filteredResults]);

  // Cards de resumo
  const summaryCards = [
    {
      icon: <Users className="w-4 h-4 text-blue-400" />,
      label: "Equipes",
      value: monthTeamRanking.length,
    },
    {
      icon: <Swords className="w-4 h-4 text-red-400" />,
      label: "Total Kills",
      value: monthTeamRanking.reduce((acc, t) => acc + t.totalKills, 0),
      valueColor: "text-red-400",
    },
    {
      icon: <Trophy className="w-4 h-4 text-yellow-400" />,
      label: "Pts Posicao",
      value: monthTeamRanking.reduce((acc, t) => acc + t.totalPosPoints, 0),
      valueColor: "text-yellow-400",
    },
    {
      icon: <BarChart3 className="w-4 h-4 text-green-400" />,
      label: "Total Geral",
      value: monthTeamRanking.reduce((acc, t) => acc + t.totalPoints, 0),
      valueColor: "text-green-400",
    },
    {
      icon: <Zap className="w-4 h-4 text-purple-400" />,
      label: "X-Treinos",
      value: totalXtreinosUnicos,
      valueColor: "text-purple-400",
    },
  ];

  return (
    <div className={`space-y-6 ${comparisonTeams.length >= 2 ? "pb-48" : ""}`}>
      {/* Seletor de Mes */}
      <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-emerald-400" />
          <label className="text-sm font-medium text-[#f0f0f5]">Selecionar Mes:</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-emerald-500/50 min-w-[200px]"
          >
            {availableMonths.map((month) => (
              <option key={month} value={month}>
                {getMonthName(month)}
              </option>
            ))}
          </select>
          {selectedMonth && (
            <span className="text-xs text-[#5a5a6e]">
              {filteredResults.length} resultados
            </span>
          )}
        </div>
      </div>

      {/* Filtros */}
      <FilterBar hasFilters={hasFilters} onClear={clearFilters}>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar equipe..."
          minWidth="200px"
        />

        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#5a5a6e]" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortField)}
            className="px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50 min-w-[160px]"
          >
            <option value="total">Ordenar: Total Geral</option>
            <option value="kills">Ordenar: Kills Totais</option>
            <option value="pos">Ordenar: Pts Posicao</option>
            <option value="xtreinos">Ordenar: X-Treinos Jogados</option>
            <option value="avgPos">Ordenar: Media Pos</option>
            <option value="consistency">Ordenar: Consistencia</option>
            <option value="streak">Ordenar: Streak</option>
          </select>
        </div>

        <button
          onClick={() => {
            setCompareMode((m) => !m);
            setSelectedForCompare(new Set());
          }}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
            compareMode
              ? "bg-green-500/10 border-green-500/30 text-green-400"
              : "bg-[#1a1a24] border-[#2a2a3a] text-[#5a5a6e] hover:text-[#f0f0f5]"
          }`}
        >
          <BarChart2 className="w-4 h-4 inline mr-1.5" />
          Comparar
        </button>
      </FilterBar>

      {/* Loading */}
      {isLoading && <LoadingSpinner text="Carregando ranking mensal..." />}

      {/* Cards de Resumo */}
      {!isLoading && selectedMonth && <SummaryCards cards={summaryCards} columns={5} />}

      {/* Podio - Top 3 */}
      {!isLoading && selectedMonth && top3.length === 3 && (
        <div>
          <h3 className="text-sm font-medium text-[#8a8a9e] mb-3 flex items-center gap-2">
            <Crown className="w-4 h-4 text-yellow-400" /> Podio
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {top3.map((t, i) => (
              <PodiumCard
                key={t.teamName}
                name={t.teamName}
                rank={i}
                stats={[
                  { label: "Kills", value: t.totalKills, color: "text-green-400" },
                  { label: "XTs", value: t.xtreinosPlayed },
                  { label: "Media", value: t.avgPosition },
                ]}
                streak={t.streak >= 3 ? t.streak : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tabela Principal */}
      {!isLoading && selectedMonth && (
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center justify-between">
            <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-400" />
              Ranking Mensal — {getMonthName(selectedMonth)}
            </h3>
            <div className="flex items-center gap-3">
              {compareMode && (
                <span className="text-xs text-green-400">
                  {selectedForCompare.size}/4 selecionados
                </span>
              )}
              <span className="text-xs text-[#5a5a6e]">
                {filteredRanking.length} equipes
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a2a3a] bg-[#0a0a0f]">
                  {compareMode && (
                    <th className="px-3 py-3 text-center w-10">
                      <span className="text-xs font-medium text-[#5a5a6e]">#</span>
                    </th>
                  )}
                  <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase w-14">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">
                    Equipe
                  </th>
                  <th className="px-4 py-3 text-center">
                    <SortHeader
                      field="xtreinos"
                      label="X-Treinos"
                      currentField={sortBy}
                      direction={sortDir}
                      onSort={handleSort}
                    />
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">
                    🥇 🥈 🥉
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">
                    Melhor Pos
                  </th>
                  <th className="px-4 py-3 text-center">
                    <SortHeader
                      field="avgPos"
                      label="Media Pos"
                      currentField={sortBy}
                      direction={sortDir}
                      onSort={handleSort}
                    />
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">
                    Evol.
                  </th>
                  <th className="px-4 py-3 text-center bg-yellow-500/5">
                    <SortHeader
                      field="pos"
                      label="Pts Pos"
                      currentField={sortBy}
                      direction={sortDir}
                      onSort={handleSort}
                    />
                  </th>
                  <th className="px-4 py-3 text-center">
                    <SortHeader
                      field="kills"
                      label="Kills"
                      currentField={sortBy}
                      direction={sortDir}
                      onSort={handleSort}
                    />
                  </th>
                  <th className="px-4 py-3 text-center bg-red-500/5">
                    <span className="text-xs font-medium text-[#5a5a6e] uppercase">Pts Kill</span>
                  </th>
                  <th className="px-4 py-3 text-center bg-green-500/5">
                    <SortHeader
                      field="total"
                      label="Total"
                      currentField={sortBy}
                      direction={sortDir}
                      onSort={handleSort}
                    />
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a3a]">
                {filteredRanking.map((team, index) => {
                  const rowKey = team.teamName;
                  const isExpanded = expandedTeam === rowKey;
                  const teamPlayers = getTeamPlayers(team.teamName);

                  return (
                    <>
                      <tr
                        key={rowKey}
                        className={`${getRankStyle(index)} hover:bg-[#1a1a24]/50 transition-colors cursor-pointer`}
                        onClick={() => setExpandedTeam(isExpanded ? null : rowKey)}
                      >
                        {compareMode && (
                          <td className="px-3 py-3 text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCompare(team.teamName);
                              }}
                              className="text-[#5a5a6e] hover:text-green-400 transition-colors"
                            >
                              {selectedForCompare.has(team.teamName) ? (
                                <CheckSquare className="w-4 h-4 text-green-400" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </button>
                          </td>
                        )}
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center">
                            <RankBadge index={index} />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-bold text-[#f0f0f5]">
                              {team.teamName}
                            </span>
                            {team.badges.length > 0 && (
                              <div className="flex items-center gap-1 flex-wrap">
                                {team.badges.slice(0, 2).map((badge) => (
                                  <span
                                    key={badge}
                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#1a1a24] border border-[#2a2a3a] text-[10px] text-[#8a8a9e]"
                                  >
                                    <BadgeIcon badge={badge} />
                                    {badge}
                                  </span>
                                ))}
                                {team.badges.length > 2 && (
                                  <span className="text-[10px] text-[#5a5a6e]">
                                    +{team.badges.length - 2}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center gap-1 text-sm font-medium text-purple-400">
                            {team.xtreinosPlayed >= 5 && <Flame className="w-3.5 h-3.5 text-orange-400" />}
                            {team.xtreinosPlayed}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2 text-xs">
                            {team.top1Count > 0 && (
                              <span className="text-yellow-400 font-bold">{team.top1Count}🥇</span>
                            )}
                            {team.top2Count > 0 && (
                              <span className="text-gray-300 font-bold">{team.top2Count}🥈</span>
                            )}
                            {team.top3Count > 0 && (
                              <span className="text-amber-500 font-bold">{team.top3Count}🥉</span>
                            )}
                            {team.top1Count === 0 && team.top2Count === 0 && team.top3Count === 0 && (
                              <span className="text-[#5a5a6e]">-</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`text-sm font-bold ${
                              team.bestPosition && team.bestPosition <= 3
                                ? getPosColor(team.bestPosition)
                                : "text-[#8a8a9e]"
                            }`}
                          >
                            {team.bestPosition ? `${team.bestPosition}º` : "-"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-[#8a8a9e]">
                          {team.avgPosition > 0 ? team.avgPosition : "-"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <Sparkline data={team.sparkline} />
                            <TrendIcon trend={team.trend} />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center bg-yellow-500/5">
                          <span className="text-sm font-bold text-yellow-400">{team.totalPosPoints}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm text-[#8a8a9e]">{team.totalKills}</span>
                        </td>
                        <td className="px-4 py-3 text-center bg-red-500/5">
                          <span className="text-sm font-bold text-red-400">{team.totalKillPoints}</span>
                        </td>
                        <td className="px-4 py-3 text-center bg-green-500/5">
                          <span className="text-lg font-bold text-green-400">{team.totalPoints}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-[#5a5a6e]" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-[#5a5a6e]" />
                          )}
                        </td>
                      </tr>

                      {/* Conteudo expandido */}
                      {isExpanded && (
                        <tr className="bg-[#0a0a0f]/50">
                          <td colSpan={compareMode ? 13 : 12} className="px-6 py-4">
                            <div className="ml-4 space-y-4">
                              {/* Badges do time */}
                              {team.badges.length > 0 && (
                                <div>
                                  <h4 className="text-xs font-medium text-[#5a5a6e] mb-2 flex items-center gap-2">
                                    <Award className="w-3 h-3" /> Conquistas
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                    {team.badges.map((badge) => (
                                      <span
                                        key={badge}
                                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#1a1a24] border border-[#2a2a3a] text-xs text-[#8a8a9e]"
                                      >
                                        <BadgeIcon badge={badge} />
                                        {badge}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Stats extras */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="bg-[#1a1a24] rounded-lg border border-[#2a2a3a] p-3 text-center">
                                  <p className="text-xs text-[#5a5a6e] mb-1">Melhor</p>
                                  <p className="text-lg font-bold text-green-400">{team.bestPerformance}</p>
                                </div>
                                <div className="bg-[#1a1a24] rounded-lg border border-[#2a2a3a] p-3 text-center">
                                  <p className="text-xs text-[#5a5a6e] mb-1">Pior</p>
                                  <p className="text-lg font-bold text-red-400">{team.worstPerformance}</p>
                                </div>
                                <div className="bg-[#1a1a24] rounded-lg border border-[#2a2a3a] p-3 text-center">
                                  <p className="text-xs text-[#5a5a6e] mb-1">Consistencia</p>
                                  <p className="text-lg font-bold text-[#f0f0f5]">{team.consistency}</p>
                                </div>
                                <div className="bg-[#1a1a24] rounded-lg border border-[#2a2a3a] p-3 text-center">
                                  <p className="text-xs text-[#5a5a6e] mb-1">Top 1s</p>
                                  <p className="text-lg font-bold text-yellow-400">{team.top1Count}</p>
                                </div>
                              </div>

                              {/* Sparkline de evolucao */}
                              {team.sparkline.length > 1 && (
                                <div>
                                  <h4 className="text-xs font-medium text-[#5a5a6e] mb-2 flex items-center gap-2">
                                    <TrendingUp className="w-3 h-3" /> Evolucao
                                  </h4>
                                  <div className="bg-[#1a1a24] rounded-lg border border-[#2a2a3a] p-3">
                                    <Sparkline data={team.sparkline} />
                                  </div>
                                </div>
                              )}

                              {/* Historico de X-Treinos */}
                              <div>
                                <h4 className="text-xs font-medium text-[#5a5a6e] mb-3 flex items-center gap-2">
                                  <Calendar className="w-3 h-3" />
                                  Historico de X-Treinos ({team.xtreinos.length})
                                </h4>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b border-[#2a2a3a]">
                                        <th className="px-3 py-2 text-left text-xs text-[#5a5a6e]">Data</th>
                                        <th className="px-3 py-2 text-center text-xs text-[#5a5a6e]">Q1</th>
                                        <th className="px-3 py-2 text-center text-xs text-[#5a5a6e]">Q2</th>
                                        <th className="px-3 py-2 text-center text-xs text-[#5a5a6e]">Q3</th>
                                        <th className="px-3 py-2 text-center text-xs text-[#5a5a6e]">Pts Pos</th>
                                        <th className="px-3 py-2 text-center text-xs text-[#5a5a6e]">Kills</th>
                                        <th className="px-3 py-2 text-center text-xs text-[#5a5a6e]">Total</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#2a2a3a]/50">
                                      {team.xtreinos
                                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                        .map((xt) => (
                                          <tr key={xt.date} className="hover:bg-[#1a1a24]/50">
                                            <td className="px-3 py-2 text-[#8a8a9e]">
                                              {xt.date.split("-")[2]}/{xt.date.split("-")[1]}
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                              <span className={getPosColor(xt.q1Pos)}>{xt.q1Pos ?? "-"}</span>
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                              <span className={getPosColor(xt.q2Pos)}>{xt.q2Pos ?? "-"}</span>
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                              <span className={getPosColor(xt.q3Pos)}>{xt.q3Pos ?? "-"}</span>
                                            </td>
                                            <td className="px-3 py-2 text-center text-yellow-400 font-bold">
                                              {xt.totalPosPoints}
                                            </td>
                                            <td className="px-3 py-2 text-center text-[#8a8a9e]">{xt.totalKills}</td>
                                            <td className="px-3 py-2 text-center text-green-400 font-bold">
                                              {xt.totalPoints}
                                            </td>
                                          </tr>
                                        ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              {/* Jogadores do time */}
                              {teamPlayers.length > 0 && (
                                <div>
                                  <h4 className="text-xs font-medium text-[#5a5a6e] mb-3 flex items-center gap-2">
                                    <Users className="w-3 h-3" />
                                    Jogadores ({teamPlayers.length})
                                  </h4>
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                      <thead>
                                        <tr className="border-b border-[#2a2a3a]">
                                          <th className="px-3 py-2 text-left text-xs text-[#5a5a6e]">#</th>
                                          <th className="px-3 py-2 text-left text-xs text-[#5a5a6e]">Jogador</th>
                                          <th className="px-3 py-2 text-center text-xs text-[#5a5a6e]">Q1</th>
                                          <th className="px-3 py-2 text-center text-xs text-[#5a5a6e]">Q2</th>
                                          <th className="px-3 py-2 text-center text-xs text-[#5a5a6e]">Q3</th>
                                          <th className="px-3 py-2 text-center text-xs text-[#5a5a6e]">Total</th>
                                          <th className="px-3 py-2 text-center text-xs text-[#5a5a6e]">Partic.</th>
                                          <th className="px-3 py-2 text-center text-xs text-[#5a5a6e]">Media</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-[#2a2a3a]/50">
                                        {teamPlayers.map((player, idx) => {
                                          const hasPreviousNicks = player.previousNicks.length > 0;

                                          return (
                                            <tr key={player.id} className="hover:bg-[#1a1a24]/50">
                                              <td className="px-3 py-2 text-[#5a5a6e] text-xs">{idx + 1}</td>
                                              <td className="px-3 py-2">
                                                <div className="flex flex-col gap-1">
                                                  <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center">
                                                      <Target className="w-3 h-3 text-green-400" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                      <span className="text-sm font-medium text-[#f0f0f5]">
                                                        {player.nickname}
                                                      </span>
                                                      {player.id > 0 && (
                                                        <span className="text-[10px] text-[#5a5a6e]">
                                                          ID: {player.id}
                                                        </span>
                                                      )}
                                                    </div>
                                                  </div>
                                                  {hasPreviousNicks && (
                                                    <div className="flex items-center gap-1 ml-8">
                                                      <History className="w-3 h-3 text-[#5a5a6e]" />
                                                      <div className="flex flex-wrap gap-1">
                                                        {player.previousNicks.map((nick) => (
                                                          <span
                                                            key={nick}
                                                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#1a1a24] border border-[#2a2a3a] text-[10px] text-[#8a8a9e]"
                                                          >
                                                            <Tag className="w-2 h-2 text-[#5a5a6e]" />
                                                            {nick}
                                                          </span>
                                                        ))}
                                                      </div>
                                                    </div>
                                                  )}
                                                </div>
                                              </td>
                                              <td className="px-3 py-2 text-center text-[#8a8a9e]">{player.totalQ1Kills}</td>
                                              <td className="px-3 py-2 text-center text-[#8a8a9e]">{player.totalQ2Kills}</td>
                                              <td className="px-3 py-2 text-center text-[#8a8a9e]">{player.totalQ3Kills}</td>
                                              <td className="px-3 py-2 text-center text-green-400 font-bold">{player.totalKills}</td>
                                              <td className="px-3 py-2 text-center text-[#5a5a6e]">{player.participations}</td>
                                              <td className="px-3 py-2 text-center text-[#8a8a9e]">{player.avgKills}</td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredRanking.length === 0 && (
            <EmptyState
              icon={<BarChart3 className="w-12 h-12" />}
              title="Nenhum dado disponivel para este mes"
            />
          )}
        </div>
      )}

      {/* Legenda */}
      <div className="grid md:grid-cols-3 gap-4 text-sm">
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
          <h4 className="font-bold text-[#f0f0f5] mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            Pontuacao por Posicao
          </h4>
          <div className="grid grid-cols-5 gap-x-2 gap-y-1 text-xs">
            {Object.entries(POSITION_POINTS).map(([pos, pts]) => (
              <div key={pos} className="flex justify-between text-[#8a8a9e]">
                <span>{pos}º</span>
                <span className="font-bold text-yellow-400">{pts}pts</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
          <h4 className="font-bold text-[#f0f0f5] mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-red-400" />
            Pontuacao por Kill
          </h4>
          <p className="text-[#8a8a9e] text-xs">
            Cada kill vale <span className="font-bold text-red-400">{KILL_POINTS} ponto</span>.
            <br />
            Total de kills do time × {KILL_POINTS} = Pontos de Kill
          </p>
        </div>
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
          <h4 className="font-bold text-[#f0f0f5] mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-green-400" />
            Calculo do Total
          </h4>
          <p className="text-[#8a8a9e] text-xs">
            <span className="text-yellow-400">Pts Posicao</span> +{" "}
            <span className="text-red-400">Pts Kill</span> ={" "}
            <span className="text-green-400 font-bold">Total</span>
          </p>
        </div>
      </div>

      {/* Barra de Comparacao */}
      <ComparisonBar
        players={comparisonTeams.map((t) => ({
          name: t.teamName,
          stats: [
            { label: "Kills", value: t.totalKills, color: "text-green-400" },
            { label: "Total", value: t.totalPoints, color: "text-green-400" },
            { label: "Pos", value: t.totalPosPoints, color: "text-yellow-400" },
          ],
        }))}
        onRemove={(name) => toggleCompare(name)}
        onClear={() => setSelectedForCompare(new Set())}
      />
    </div>
  );
}