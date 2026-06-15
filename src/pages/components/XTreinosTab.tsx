import { useState, useMemo } from "react";
import {
  Calendar,
  Clock,
  Trophy,
  Target,
  TrendingUp,
  Swords,
  Medal,
  BarChart3,
  Users,

  Flame,
  Crown,
  Award,
  BarChart2,
  CheckSquare,
  Square,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import {
  useXtreinoCalculations,
  POSITION_POINTS,
  KILL_POINTS,
} from "@/hooks/useXtreinoCalculations";

// Componentes reutilizáveis
import {
  Sparkline,
  BadgeIcon,
  TrendIcon,
  RankBadge,
  SummaryCards,
  SortHeader,
  FilterBar,
  SearchInput,
  SelectFilter,
  EmptyState,
  LoadingSpinner,
  PodiumCard,
  ExpandableRow,
  ComparisonBar,
} from "./xtreino";

// ============================================================
// TIPOS
// ============================================================

interface TeamXtreinoStat {
  date: string;
  teamName: string;
  q1Pos: number | null;
  q2Pos: number | null;
  q3Pos: number | null;
  totalPosPoints: number;
  totalKills: number;
  totalKillPoints: number;
  totalPoints: number;
}

interface PlayerXtreinoStat {
  date: string;
  teamName: string;
  playerName: string;
  q1Kills: number;
  q2Kills: number;
  q3Kills: number;
  totalKills: number;
}

interface EnrichedTeam extends TeamXtreinoStat {
  sparkline: number[];
  streak: number;
  badges: string[];
  bestPerformance: number;
  worstPerformance: number;
  avgPosition: number;
  trend: "up" | "down" | "same";
  top1Count: number;
  top3Count: number;
  consistency: number;
}

type SortField = "total" | "kills" | "pos" | "xtreinos" | "avgPos" | "consistency" | "streak";

// ============================================================
// FUNCOES DE CALCULO PURAS
// ============================================================

function calcTeamSparkline(allStats: TeamXtreinoStat[], teamName: string): number[] {
  const teamStats = allStats
    .filter((s) => s.teamName === teamName)
    .sort((a, b) => a.date.localeCompare(b.date));
  const dateMap = new Map<string, number>();
  teamStats.forEach((s) => {
    dateMap.set(s.date, (dateMap.get(s.date) || 0) + s.totalPoints);
  });
  const dates = Array.from(dateMap.keys()).sort();
  return dates.map((d) => dateMap.get(d) || 0);
}

function calcTeamStreak(allStats: TeamXtreinoStat[], teamName: string): number {
  const allDates = [...new Set(allStats.map((s) => s.date))].sort();
  const teamDates = new Set(
    allStats.filter((s) => s.teamName === teamName).map((s) => s.date)
  );
  let streak = 0;
  for (let i = allDates.length - 1; i >= 0; i--) {
    if (teamDates.has(allDates[i])) streak++;
    else break;
  }
  return streak;
}

function calcTeamBadges(team: EnrichedTeam): string[] {
  const badges: string[] = [];
  if (team.totalKills >= 100) badges.push("100 Kills");
  if (team.totalKills >= 300) badges.push("300 Kills");
  if (team.totalKills >= 500) badges.push("500 Kills");
  if (team.top1Count >= 3) badges.push("3x Campeao");
  if (team.top1Count >= 5) badges.push("5x Campeao");
  if (team.top3Count >= 10) badges.push("Top 3 Regular");
  if (team.streak >= 5) badges.push("Streak 5+");
  if (team.streak >= 10) badges.push("Streak 10+");
  if (team.avgPosition <= 3) badges.push("Elite");
  if (team.consistency <= 2) badges.push("Consistente");
  return badges;
}

function calcBestPerformance(allStats: TeamXtreinoStat[], teamName: string): number {
  const stats = allStats.filter((s) => s.teamName === teamName);
  if (!stats.length) return 0;
  return Math.max(...stats.map((s) => s.totalPoints));
}

function calcWorstPerformance(allStats: TeamXtreinoStat[], teamName: string): number {
  const stats = allStats.filter((s) => s.teamName === teamName);
  if (!stats.length) return 0;
  return Math.min(...stats.map((s) => s.totalPoints));
}

function calcAvgPosition(team: TeamXtreinoStat): number {
  const positions: number[] = [];
  if (team.q1Pos) positions.push(team.q1Pos);
  if (team.q2Pos) positions.push(team.q2Pos);
  if (team.q3Pos) positions.push(team.q3Pos);
  if (!positions.length) return 0;
  return Math.round((positions.reduce((a, b) => a + b, 0) / positions.length) * 10) / 10;
}

function calcConsistency(allStats: TeamXtreinoStat[], teamName: string): number {
  const stats = allStats.filter((s) => s.teamName === teamName);
  if (stats.length < 2) return 0;
  const totals = stats.map((s) => s.totalPoints);
  const avg = totals.reduce((a, b) => a + b, 0) / totals.length;
  const variance = totals.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / totals.length;
  return Math.round(Math.sqrt(variance) * 10) / 10;
}

function calcTrend(allStats: TeamXtreinoStat[], teamName: string): "up" | "down" | "same" {
  const stats = allStats
    .filter((s) => s.teamName === teamName)
    .sort((a, b) => a.date.localeCompare(b.date));
  if (stats.length < 2) return "same";
  const last = stats[stats.length - 1].totalPoints;
  const prev = stats[stats.length - 2].totalPoints;
  if (last > prev) return "up";
  if (last < prev) return "down";
  return "same";
}

function countTopPositions(allStats: TeamXtreinoStat[], teamName: string): { top1: number; top3: number } {
  const stats = allStats.filter((s) => s.teamName === teamName);
  let top1 = 0;
  let top3 = 0;
  stats.forEach((s) => {
    [s.q1Pos, s.q2Pos, s.q3Pos].forEach((pos) => {
      if (pos === 1) top1++;
      if (pos && pos <= 3) top3++;
    });
  });
  return { top1, top3 };
}

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

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function XTreinosTab() {
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortField>("total");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<Set<string>>(new Set());

  const { data: allResults } = trpc.xtreinos.listResults.useQuery();
  const { data: allPlayerStats } = trpc.xtreinos.listPlayerStats.useQuery();
  const { data: scheduleList } = trpc.xtreinos.schedule.list.useQuery();

  const {
    teamXtreinoStats,
    playerXtreinoStats,
    availableMonths,
    availableDates,
    periodSummary,
  } = useXtreinoCalculations({
    results: allResults ?? [],
    playerStats: allPlayerStats ?? [],
    selectedMonth,
    selectedDate,
  });

  const isLoading = !allResults || !allPlayerStats;
  const isAccumulated = !selectedDate && !selectedMonth;

  // Enriquecer stats no modo acumulado
  const enrichedStats: EnrichedTeam[] = useMemo(() => {
    return teamXtreinoStats.map((t) => {
      const sparkline = calcTeamSparkline(teamXtreinoStats, t.teamName);
      const streak = calcTeamStreak(teamXtreinoStats, t.teamName);
      const bestPerf = calcBestPerformance(teamXtreinoStats, t.teamName);
      const worstPerf = calcWorstPerformance(teamXtreinoStats, t.teamName);
      const avgPos = calcAvgPosition(t);
      const trend = calcTrend(teamXtreinoStats, t.teamName);
      const { top1, top3 } = countTopPositions(teamXtreinoStats, t.teamName);
      const consistency = calcConsistency(teamXtreinoStats, t.teamName);

      const enriched: EnrichedTeam = {
        ...t,
        sparkline,
        streak,
        badges: [],
        bestPerformance: bestPerf,
        worstPerformance: worstPerf,
        avgPosition: avgPos,
        trend,
        top1Count: top1,
        top3Count: top3,
        consistency,
      };

      enriched.badges = calcTeamBadges(enriched);
      return enriched;
    });
  }, [teamXtreinoStats]);

  // Filtro por busca
  const searchedStats = useMemo(() => {
    if (!search.trim()) return enrichedStats;
    const q = search.toLowerCase();
    return enrichedStats.filter((t) => t.teamName.toLowerCase().includes(q));
  }, [enrichedStats, search]);

  // Ordenar times
  const sortedStats = useMemo(() => {
    return [...searchedStats].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "total":
          comparison = a.totalPoints - b.totalPoints;
          break;
        case "kills":
          comparison = a.totalKills - b.totalKills;
          break;
        case "pos":
          comparison = a.totalPosPoints - b.totalPosPoints;
          break;
        case "xtreinos":
          comparison = a.streak - b.streak;
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
      }
      return sortDir === "desc" ? -comparison : comparison;
    });
  }, [searchedStats, sortBy, sortDir]);

  // Jogadores de um time específico
  const getTeamPlayers = (teamName: string, date: string) => {
    return playerXtreinoStats.filter(
      (p) => p.teamName === teamName && p.date === date
    );
  };

  // Top 3 para pódio (modo acumulado)
  const top3 = useMemo(() => {
    if (!isAccumulated || sortedStats.length < 3) return [];
    return sortedStats.slice(0, 3);
  }, [sortedStats, isAccumulated]);

  // Times para comparação
  const comparisonTeams = useMemo(() => {
    return sortedStats.filter((t) => selectedForCompare.has(t.teamName));
  }, [sortedStats, selectedForCompare]);

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
    setSelectedDate("");
    setSelectedMonth("");
    setSelectedForCompare(new Set());
    setCompareMode(false);
    setSortBy("total");
    setSortDir("desc");
  };

  const hasFilters = Boolean(search) || Boolean(selectedDate) || Boolean(selectedMonth) || sortBy !== "total" || compareMode;

  // Cards de resumo
  const summaryCards = periodSummary
    ? [
        {
          icon: <Users className="w-4 h-4 text-blue-400" />,
          label: "Equipes",
          value: periodSummary.uniqueTeams,
        },
        {
          icon: <Swords className="w-4 h-4 text-red-400" />,
          label: "Total Kills",
          value: periodSummary.totalKills,
          valueColor: "text-red-400",
        },
        {
          icon: <Trophy className="w-4 h-4 text-yellow-400" />,
          label: "Pts Posicao",
          value: periodSummary.totalPosPoints,
          valueColor: "text-yellow-400",
        },
        {
          icon: <BarChart3 className="w-4 h-4 text-green-400" />,
          label: "Total Geral",
          value: periodSummary.totalPoints,
          valueColor: "text-green-400",
        },
      ]
    : [];

  return (
    <div className={`space-y-6 ${comparisonTeams.length >= 2 ? "pb-48" : ""}`}>
      {/* Filtros */}
      <FilterBar hasFilters={hasFilters} onClear={clearFilters}>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar equipe..."
          minWidth="200px"
        />

        <SelectFilter
          icon={<Calendar className="w-4 h-4" />}
          value={selectedMonth}
          onChange={(v) => {
            setSelectedMonth(v);
            setSelectedDate("");
          }}
          placeholder="Todos os meses"
          options={availableMonths.map((m) => ({
            value: m,
            label: `${m.split("-")[1]}/${m.split("-")[0]}`,
          }))}
          minWidth="140px"
        />

        <SelectFilter
          icon={<Clock className="w-4 h-4" />}
          value={selectedDate}
          onChange={setSelectedDate}
          placeholder="Todos os dias"
          options={availableDates.map((d) => ({
            value: d,
            label: `${d.split("-")[2]}/${d.split("-")[1]}`,
          }))}
          disabled={!selectedMonth}
          minWidth="140px"
        />

        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#5a5a6e]" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortField)}
            className="px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50 min-w-[160px]"
          >
            <option value="total">Ordenar: Total</option>
            <option value="kills">Ordenar: Kills</option>
            <option value="pos">Ordenar: Posicao</option>
            <option value="xtreinos">Ordenar: X-Treinos</option>
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
      {isLoading && <LoadingSpinner text="Carregando estatisticas..." />}

      {/* Cards de Resumo */}
      {summaryCards.length > 0 && !isLoading && (
        <SummaryCards cards={summaryCards} columns={4} />
      )}

      {/* Podio - Top 3 (modo acumulado) */}
      {isAccumulated && top3.length === 3 && !isLoading && (
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
                  { label: "XTs", value: t.streak || 1 },
                  { label: "Media", value: t.avgPosition },
                ]}
                streak={t.streak >= 3 ? t.streak : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tabela Principal */}
      {!isLoading && (
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center justify-between">
            <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
              <Medal className="w-5 h-5 text-yellow-400" />
              Classificacao{" "}
              {selectedDate
                ? `— ${selectedDate.split("-")[2]}/${selectedDate.split("-")[1]}`
                : selectedMonth
                ? `— ${selectedMonth.split("-")[1]}/${selectedMonth.split("-")[0]}`
                : `— Todos os periodos`}
            </h3>
            <div className="flex items-center gap-3">
              {compareMode && (
                <span className="text-xs text-green-400">
                  {selectedForCompare.size}/4 selecionados
                </span>
              )}
              <span className="text-xs text-[#5a5a6e]">
                {sortedStats.length} registros
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
                  <th className="px-4 py-3 text-center w-12">
                    <span className="text-xs font-medium text-[#5a5a6e] uppercase">#</span>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">
                    Equipe
                  </th>
                  {!selectedDate && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">
                      Data
                    </th>
                  )}
                  <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">
                    Q1 Pos
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">
                    Q2 Pos
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">
                    Q3 Pos
                  </th>
                  <th className="px-4 py-3 text-center">
                    <SortHeader
                      field="xtreinos"
                      label="XTs"
                      currentField={sortBy}
                      direction={sortDir}
                      onSort={handleSort}
                    />
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
                  <th className="px-4 py-3 text-center">
                    <span className="text-xs font-medium text-[#5a5a6e] uppercase">Evol.</span>
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
                  <th className="px-4 py-3 text-center w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a3a]">
                {sortedStats.map((team, index) => {
                  const rowKey = `${team.date}-${team.teamName}`;
                  const isExpanded = expandedTeam === rowKey;
                  const teamPlayers = getTeamPlayers(team.teamName, team.date);

                  return (
                    <ExpandableRow
                      key={rowKey}
                      rowKey={rowKey}
                      expandedKey={expandedTeam}
                      onToggle={setExpandedTeam}
                      rankStyle={getRankStyle(index)}
                      expandedContent={
                        <div className="ml-8 space-y-4">
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

                          {/* Jogadores do time */}
                          {teamPlayers.length > 0 && (
                            <div>
                              <h4 className="text-xs font-medium text-[#5a5a6e] mb-2">Jogadores</h4>
                              <div className="flex flex-wrap gap-2">
                                {teamPlayers.map((player) => (
                                  <div
                                    key={player.playerName}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a1a24] border border-[#2a2a3a]"
                                  >
                                    <Target className="w-3 h-3 text-green-400" />
                                    <span className="text-sm text-[#f0f0f5]">{player.playerName}</span>
                                    <span className="text-xs text-green-400 font-bold">{player.totalKills}k</span>
                                    <span className="text-xs text-[#5a5a6e]">
                                      ({player.q1Kills}/{player.q2Kills}/{player.q3Kills})
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      }
                    >
                      {/* Celulas da linha */}
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
                        <RankBadge index={index} />
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
                      {!selectedDate && (
                        <td className="px-4 py-3 text-sm text-[#8a8a9e]">
                          {team.date.split("-")[2]}/{team.date.split("-")[1]}
                        </td>
                      )}
                      <td className={`px-4 py-3 text-center ${getPosBg(team.q1Pos)}`}>
                        <span className={`text-sm font-medium ${getPosColor(team.q1Pos)}`}>
                          {team.q1Pos ?? "-"}
                        </span>
                        {team.q1Pos && team.q1Pos <= 3 && (
                          <span className="ml-1 text-xs">
                            {team.q1Pos === 1 ? "🥇" : team.q1Pos === 2 ? "🥈" : "🥉"}
                          </span>
                        )}
                      </td>
                      <td className={`px-4 py-3 text-center ${getPosBg(team.q2Pos)}`}>
                        <span className={`text-sm font-medium ${getPosColor(team.q2Pos)}`}>
                          {team.q2Pos ?? "-"}
                        </span>
                        {team.q2Pos && team.q2Pos <= 3 && (
                          <span className="ml-1 text-xs">
                            {team.q2Pos === 1 ? "🥇" : team.q2Pos === 2 ? "🥈" : "🥉"}
                          </span>
                        )}
                      </td>
                      <td className={`px-4 py-3 text-center ${getPosBg(team.q3Pos)}`}>
                        <span className={`text-sm font-medium ${getPosColor(team.q3Pos)}`}>
                          {team.q3Pos ?? "-"}
                        </span>
                        {team.q3Pos && team.q3Pos <= 3 && (
                          <span className="ml-1 text-xs">
                            {team.q3Pos === 1 ? "🥇" : team.q3Pos === 2 ? "🥈" : "🥉"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-[#8a8a9e]">
                        {team.streak > 0 ? (
                          <span className="inline-flex items-center gap-1">
                            {team.streak >= 3 && <Flame className="w-3.5 h-3.5 text-orange-400" />}
                            {team.streak}
                          </span>
                        ) : (
                          "-"
                        )}
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
                    </ExpandableRow>
                  );
                })}
              </tbody>
            </table>
          </div>

          {sortedStats.length === 0 && (
            <EmptyState
              icon={<BarChart3 className="w-12 h-12" />}
              title="Nenhum resultado encontrado"
              subtitle={
                selectedDate
                  ? "Nenhum dado para esta data"
                  : selectedMonth
                  ? "Nenhum dado para este mes"
                  : "Nenhum dado disponivel"
              }
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

      {/* Agenda */}
      {scheduleList && scheduleList.length > 0 && (
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2a2a3a]">
            <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              Proximos Xtreinos
            </h3>
          </div>
          <div className="divide-y divide-[#2a2a3a]">
            {scheduleList
              .filter((s) => s.status === "scheduled")
              .slice(0, 5)
              .map((s) => (
                <div key={s.id} className="flex items-center justify-between px-6 py-3">
                  <div className="flex items-center gap-4">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span className="text-sm text-[#f0f0f5]">{s.date}</span>
                    <span className="text-xs text-[#5a5a6e]">{s.dayOfWeek}</span>
                  </div>
                  <span className="text-sm text-[#8a8a9e] flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {s.timeBr}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

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