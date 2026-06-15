import { useState, useMemo } from "react";
import {
  Target,
  Calendar,
  TrendingUp,
  BarChart3,
  Swords,
  Users,
  Award,
  X,
  Flame,
  History,
  BarChart2,
  CheckSquare,
  Square,
  Crown,
  Shield,
  Tag,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import {
  calcPlayerAccumulatedStats,
  type XtreinoPlayerStat,
} from "../../hooks/useXtreinoCalculations.js";

// Componentes reutilizaveis
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
  PreviousNicksTooltip,
  PodiumCard,
  ComparisonBar,
} from "../components/xtreino";

// ============================================================
// TIPOS LOCAIS
// ============================================================

interface XTreinoOption {
  id: number;
  name: string;
  date: string;
}

interface PlayerRankingRawStat {
  id: number;
  xtreinoId: number;
  date: string;
  teamName: string;
  playerName: string;
  q1Kills: number;
  q2Kills: number;
  q3Kills: number;
  totalKills: number;
}

interface PlayerRankingDisplay {
  playerName: string;
  teamName: string | null;
  totalKills: number;
  totalQ1Kills: number;
  totalQ2Kills: number;
  totalQ3Kills: number;
  participations: number;
  avgKills: number;
  xtreinoDates: string[];
}

type PlayerRankingStat = PlayerRankingRawStat | PlayerRankingDisplay;

type RankingSortField =
  | "totalKills"
  | "q1Kills"
  | "q2Kills"
  | "q3Kills"
  | "participations"
  | "avgKills"
  | "streak"
  | "bestPerformance"
  | "teamContribution";

interface RankingSummary {
  totalPlayers: number;
  totalKills: number;
  totalQ1: number;
  totalQ2: number;
  totalQ3: number;
  totalRecords: number;
}

interface EnrichedPlayer extends PlayerRankingDisplay {
  sparkline: number[];
  streak: number;
  badges: string[];
  avgPerQuarter: { q1: number; q2: number; q3: number };
  bestPerformance: number;
  teamContribution: number;
  trend: "up" | "down" | "same";
  isNewbie: boolean;
  currentRank: number;
  previousNicks: string[];
}

// ============================================================
// FUNCOES DE CALCULO PURAS
// ============================================================

function calcPlayerRankingAccumulated(
  rawStats: PlayerRankingRawStat[]
): PlayerRankingDisplay[] {
  const accumulated = calcPlayerAccumulatedStats(rawStats as XtreinoPlayerStat[]);

  return accumulated.map((p) => ({
    playerName: p.playerName,
    teamName: p.teamName,
    totalKills: p.totalKills,
    totalQ1Kills: p.totalQ1Kills,
    totalQ2Kills: p.totalQ2Kills,
    totalQ3Kills: p.totalQ3Kills,
    participations: p.participations,
    avgKills: p.avgKills,
    xtreinoDates: p.xtreinoDates,
  }));
}

function filterStatsByXtreino(
  rawStats: PlayerRankingRawStat[],
  xtreinoId: number | null
): PlayerRankingRawStat[] {
  if (!xtreinoId) return rawStats;
  return rawStats.filter((s) => s.xtreinoId === xtreinoId);
}

function filterStatsByTeam<T extends { teamName?: string | null }>(
  stats: T[],
  team: string | null
): T[] {
  if (!team) return stats;
  return stats.filter((s) => (s.teamName ?? "").toLowerCase() === team.toLowerCase());
}

function searchPlayerStats<T extends { playerName: string; teamName?: string | null; previousNicks?: string[] }>(
  stats: T[],
  query: string
): T[] {
  if (!query.trim()) return stats;
  const q = query.toLowerCase();
  return stats.filter(
    (p) =>
      p.playerName.toLowerCase().includes(q) ||
      (p.teamName?.toLowerCase() ?? "").includes(q) ||
      (p.previousNicks?.some((n) => n.toLowerCase().includes(q)) ?? false)
  );
}

function sortRankingStats(
  stats: PlayerRankingStat[],
  field: RankingSortField,
  direction: "asc" | "desc"
): PlayerRankingStat[] {
  return [...stats].sort((a, b) => {
    const aVal = (field in a ? (a as unknown as Record<string, number>)[field] : 0) ?? 0;
    const bVal = (field in b ? (b as unknown as Record<string, number>)[field] : 0) ?? 0;
    return direction === "desc" ? bVal - aVal : aVal - bVal;
  });
}

function calcRankingSummary(stats: PlayerRankingStat[]): RankingSummary | null {
  if (!stats.length) return null;
  const first = stats[0];
  const isAccumulated = "participations" in first;

  return {
    totalPlayers: new Set(stats.map((p) => p.playerName)).size,
    totalKills: stats.reduce((sum, p) => sum + (p.totalKills || 0), 0),
    totalQ1: stats.reduce((sum, p) => {
      const val = "totalQ1Kills" in p ? p.totalQ1Kills : "q1Kills" in p ? p.q1Kills : 0;
      return sum + (val || 0);
    }, 0),
    totalQ2: stats.reduce((sum, p) => {
      const val = "totalQ2Kills" in p ? p.totalQ2Kills : "q2Kills" in p ? p.q2Kills : 0;
      return sum + (val || 0);
    }, 0),
    totalQ3: stats.reduce((sum, p) => {
      const val = "totalQ3Kills" in p ? p.totalQ3Kills : "q3Kills" in p ? p.q3Kills : 0;
      return sum + (val || 0);
    }, 0),
    totalRecords: isAccumulated
      ? (stats as PlayerRankingDisplay[]).reduce((sum, p) => sum + p.participations, 0)
      : stats.length,
  };
}

// --- NOVAS FUNCOES DE CALCULO ---

function calcPlayerSparkline(rawStats: PlayerRankingRawStat[], playerName: string): number[] {
  const playerStats = rawStats
    .filter((s) => s.playerName === playerName)
    .sort((a, b) => a.date.localeCompare(b.date));
  const dateMap = new Map<string, number>();
  playerStats.forEach((s) => {
    dateMap.set(s.date, (dateMap.get(s.date) || 0) + s.totalKills);
  });
  const dates = Array.from(dateMap.keys()).sort();
  return dates.map((d) => dateMap.get(d) || 0);
}

function calcPlayerStreak(rawStats: PlayerRankingRawStat[], playerName: string): number {
  const allDates = [...new Set(rawStats.map((s) => s.date))].sort();
  const playerDates = new Set(
    rawStats.filter((s) => s.playerName === playerName).map((s) => s.date)
  );
  let streak = 0;
  for (let i = allDates.length - 1; i >= 0; i--) {
    if (playerDates.has(allDates[i])) streak++;
    else break;
  }
  return streak;
}

function calcPlayerBadges(acc: PlayerRankingDisplay): string[] {
  const badges: string[] = [];
  if (acc.totalKills >= 100) badges.push("100 Kills");
  if (acc.totalKills >= 300) badges.push("300 Kills");
  if (acc.totalKills >= 500) badges.push("500 Kills");
  if (acc.participations >= 5) badges.push("5 XTs");
  if (acc.participations >= 10) badges.push("10 XTs");
  if (acc.participations >= 20) badges.push("20 XTs");
  if (acc.totalQ1Kills >= 50) badges.push("Q1 Master");
  if (acc.totalQ2Kills >= 50) badges.push("Q2 Master");
  if (acc.totalQ3Kills >= 50) badges.push("Q3 Master");
  if (acc.avgKills >= 8) badges.push("Sniper");
  if (acc.avgKills >= 12) badges.push("Elite");
  return badges;
}

function calcAvgPerQuarter(acc: PlayerRankingDisplay) {
  return {
    q1: acc.participations > 0 ? Math.round((acc.totalQ1Kills / acc.participations) * 10) / 10 : 0,
    q2: acc.participations > 0 ? Math.round((acc.totalQ2Kills / acc.participations) * 10) / 10 : 0,
    q3: acc.participations > 0 ? Math.round((acc.totalQ3Kills / acc.participations) * 10) / 10 : 0,
  };
}

function calcBestPerformance(rawStats: PlayerRankingRawStat[], playerName: string): number {
  const stats = rawStats.filter((s) => s.playerName === playerName);
  if (!stats.length) return 0;
  return Math.max(...stats.map((s) => s.totalKills));
}

function calcTeamContribution(
  rawStats: PlayerRankingRawStat[],
  playerName: string,
  teamName: string | null
): number {
  if (!teamName) return 0;
  const playerStats = rawStats.filter((s) => s.playerName === playerName);
  const playerDates = new Set(playerStats.map((s) => s.date));
  const teamStats = rawStats.filter(
    (s) => s.teamName === teamName && playerDates.has(s.date)
  );
  const playerKills = playerStats.reduce((sum, s) => sum + s.totalKills, 0);
  const teamKills = teamStats.reduce((sum, s) => sum + s.totalKills, 0);
  return teamKills > 0 ? Math.round((playerKills / teamKills) * 1000) / 10 : 0;
}

function calcTrend(
  rawStats: PlayerRankingRawStat[],
  playerName: string,
  _currentRank: number
): "up" | "down" | "same" {
  const allDates = [...new Set(rawStats.map((s) => s.date))].sort();
  if (allDates.length < 2) return "same";
  const lastDate = allDates[allDates.length - 1];
  const prevDate = allDates[allDates.length - 2];

  const lastStats = rawStats.filter((s) => s.date === lastDate);
  const prevStats = rawStats.filter((s) => s.date === prevDate);

  const lastRank = [...lastStats]
    .sort((a, b) => b.totalKills - a.totalKills)
    .findIndex((s) => s.playerName === playerName);
  const prevRank = [...prevStats]
    .sort((a, b) => b.totalKills - a.totalKills)
    .findIndex((s) => s.playerName === playerName);

  if (lastRank === -1 || prevRank === -1) return "same";
  if (lastRank < prevRank) return "up";
  if (lastRank > prevRank) return "down";
  return "same";
}

function extractTeams(stats: PlayerRankingRawStat[]): string[] {
  return [...new Set(stats.map((s) => s.teamName).filter(Boolean))].sort();
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function JogadoresTab() {
  const [search, setSearch] = useState("");
  const [selectedXt, setSelectedXt] = useState<number | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [sortField, setSortField] = useState<RankingSortField>("totalKills");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<Set<string>>(new Set());
  const [modalPlayer, setModalPlayer] = useState<EnrichedPlayer | null>(null);

  // tRPC
  const { data: xtreinosList } = trpc.players.listXtreinos.useQuery();
  const { data: rawStatsData } = trpc.players.rankingStats.useQuery();
  const { data: playersList } = trpc.players.list.useQuery();

  const rawStats = (rawStatsData ?? []) as PlayerRankingRawStat[];
  const isAccumulated = !selectedXt;
  const isLoading = !xtreinosList || !rawStatsData;

  // Map de playerName -> previousNicks
  const previousNicksMap = useMemo(() => {
    const map = new Map<string, string[]>();
    if (!playersList) return map;
    for (const player of playersList) {
      if (player.previousNicks && player.previousNicks.length > 0) {
        map.set(player.nickname.trim().toLowerCase(), player.previousNicks);
      }
    }
    return map;
  }, [playersList]);

  // Calculos com useMemo
  const accumulatedStats = useMemo(
    () => calcPlayerRankingAccumulated(rawStats),
    [rawStats]
  );

  const singleXtreinoStats = useMemo(
    () => filterStatsByXtreino(rawStats, selectedXt),
    [rawStats, selectedXt]
  );

  const baseStats: PlayerRankingStat[] = isAccumulated
    ? accumulatedStats
    : singleXtreinoStats;

  const teamFilteredStats = useMemo(
    () => filterStatsByTeam(baseStats, selectedTeam),
    [baseStats, selectedTeam]
  );

  const searchedStats = useMemo(
    () => searchPlayerStats(teamFilteredStats, search),
    [teamFilteredStats, search]
  );

  const sortedStats = useMemo(
    () => sortRankingStats(searchedStats, sortField, sortDir),
    [searchedStats, sortField, sortDir]
  );

  // Enriquecer stats no modo acumulado
  const enrichedStats: EnrichedPlayer[] = useMemo(() => {
    if (!isAccumulated) return sortedStats as unknown as EnrichedPlayer[];

    return (sortedStats as PlayerRankingDisplay[]).map((p, idx) => {
      const sparkline = calcPlayerSparkline(rawStats, p.playerName);
      const streak = calcPlayerStreak(rawStats, p.playerName);
      const badges = calcPlayerBadges(p);
      const avgPerQuarter = calcAvgPerQuarter(p);
      const bestPerformance = calcBestPerformance(rawStats, p.playerName);
      const teamContribution = calcTeamContribution(rawStats, p.playerName, p.teamName);
      const trend = calcTrend(rawStats, p.playerName, idx);
      const previousNicks = previousNicksMap.get(p.playerName.trim().toLowerCase()) ?? [];

      return {
        ...p,
        sparkline,
        streak,
        badges,
        avgPerQuarter,
        bestPerformance,
        teamContribution,
        trend,
        isNewbie: p.participations < 3,
        currentRank: idx,
        previousNicks,
      };
    });
  }, [sortedStats, isAccumulated, rawStats, previousNicksMap]);

  const displayStats = isAccumulated ? enrichedStats : (sortedStats as PlayerRankingStat[]);

  const summary = useMemo(
    () => calcRankingSummary(displayStats),
    [displayStats]
  );

  const allTeams = useMemo(() => extractTeams(rawStats), [rawStats]);

  const top3 = useMemo(() => {
    if (!isAccumulated || displayStats.length < 3) return [];
    return (displayStats as EnrichedPlayer[]).slice(0, 3);
  }, [displayStats, isAccumulated]);

  const comparisonPlayers = useMemo(() => {
    if (!isAccumulated) return [];
    return (displayStats as EnrichedPlayer[]).filter((p) =>
      selectedForCompare.has(p.playerName)
    );
  }, [displayStats, selectedForCompare, isAccumulated]);

  const handleSort = (field: RankingSortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const toggleCompare = (playerName: string) => {
    setSelectedForCompare((prev) => {
      const next = new Set(prev);
      if (next.has(playerName)) next.delete(playerName);
      else if (next.size < 4) next.add(playerName);
      return next;
    });
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedXt(null);
    setSelectedTeam(null);
    setSelectedForCompare(new Set());
    setCompareMode(false);
  };

  const hasFilters = !!search || selectedXt !== null || selectedTeam !== null || compareMode;

  // Cards de resumo
  const summaryCards = summary
    ? [
        {
          icon: <Users className="w-4 h-4 text-green-400" />,
          label: "Jogadores",
          value: summary.totalPlayers,
        },
        {
          icon: <Swords className="w-4 h-4 text-green-400" />,
          label: "Total Kills",
          value: summary.totalKills,
          valueColor: "text-green-400",
        },
        {
          icon: <BarChart3 className="w-4 h-4 text-green-400" />,
          label: "Q1 + Q2 + Q3",
          value: `${summary.totalQ1}/${summary.totalQ2}/${summary.totalQ3}`,
        },
        {
          icon: <TrendingUp className="w-4 h-4 text-green-400" />,
          label: isAccumulated ? "Participacoes" : "Registros",
          value: summary.totalRecords,
        },
      ]
    : [];

  // Dados do modal
  const modalData = useMemo(() => {
    if (!modalPlayer) return null;
    return {
      playerName: modalPlayer.playerName,
      teamName: modalPlayer.teamName,
      totalKills: modalPlayer.totalKills,
      participations: modalPlayer.participations,
      avgKills: modalPlayer.avgKills,
      bestPerformance: modalPlayer.bestPerformance,
      badges: modalPlayer.badges,
      previousNicks: modalPlayer.previousNicks,
      avgPerQuarter: modalPlayer.avgPerQuarter,
      sparkline: modalPlayer.sparkline,
      history: rawStats.filter((s) => s.playerName === modalPlayer.playerName),
    };
  }, [modalPlayer, rawStats]);

  return (
    <div className={`space-y-6 ${comparisonPlayers.length >= 2 ? "pb-48" : ""}`}>
      {/* Filtros */}
      <FilterBar hasFilters={hasFilters} onClear={clearFilters}>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar jogador, time ou nick antigo..."
          minWidth="260px"
        />

        <SelectFilter
          icon={<Calendar className="w-4 h-4 text-[#5a5a6e]" />}
          value={selectedXt?.toString() ?? ""}
          onChange={(v) => setSelectedXt(v ? parseInt(v) : null)}
          placeholder="Todos os xtreinos (acumulado)"
          options={(xtreinosList ?? []).map((x: XTreinoOption) => ({
            value: x.id.toString(),
            label: `${x.name} (${x.date})`,
          }))}
          minWidth="180px"
        />

        <SelectFilter
          icon={<Shield className="w-4 h-4 text-[#5a5a6e]" />}
          value={selectedTeam ?? ""}
          onChange={(v) => setSelectedTeam(v || null)}
          placeholder="Todos os times"
          options={allTeams.map((team) => ({ value: team, label: team }))}
          minWidth="160px"
        />

        {isAccumulated && (
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
        )}
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
            {top3.map((p, i) => (
              <PodiumCard
                key={p.playerName}
                name={p.playerName}
                subtitle={p.teamName ?? "Sem time"}
                rank={i}
                stats={[
                  { label: "Kills", value: p.totalKills, color: "text-green-400" },
                  { label: "XTs", value: p.participations },
                  { label: "Media", value: p.avgKills },
                ]}
                streak={p.streak >= 3 ? p.streak : undefined}
                onClick={() => setModalPlayer(p)}
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
              <TrendingUp className="w-5 h-5 text-green-400" />
              {selectedXt ? "Estatisticas do XTreino" : "Ranking Geral de Jogadores"}
              {selectedXt && xtreinosList?.find((x: XTreinoOption) => x.id === selectedXt) && (
                <span className="text-sm font-normal text-[#5a5a6e]">
                  — {xtreinosList.find((x: XTreinoOption) => x.id === selectedXt)?.date}
                </span>
              )}
            </h3>
            <div className="flex items-center gap-3">
              {compareMode && (
                <span className="text-xs text-green-400">
                  {selectedForCompare.size}/4 selecionados
                </span>
              )}
              <span className="text-xs text-[#5a5a6e]">
                {displayStats.length} registros
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a2a3a] bg-[#0a0a0f]">
                  {isAccumulated && compareMode && (
                    <th className="px-3 py-3 text-center w-10">
                      <span className="text-xs font-medium text-[#5a5a6e]">#</span>
                    </th>
                  )}
                  <th className="px-4 py-3 text-center w-12">
                    <span className="text-xs font-medium text-[#5a5a6e] uppercase">#</span>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">
                    Jogador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">
                    Time
                  </th>
                  {isAccumulated && (
                    <>
                      <th className="px-4 py-3 text-center">
                        <SortHeader
                          field="participations"
                          label="XTs"
                          currentField={sortField}
                          direction={sortDir}
                          onSort={handleSort}
                        />
                      </th>
                      <th className="px-4 py-3 text-center">
                        <SortHeader
                          field="avgKills"
                          label="Media"
                          currentField={sortField}
                          direction={sortDir}
                          onSort={handleSort}
                        />
                      </th>
                      <th className="px-4 py-3 text-center">
                        <SortHeader
                          field="streak"
                          label="Streak"
                          currentField={sortField}
                          direction={sortDir}
                          onSort={handleSort}
                        />
                      </th>
                      <th className="px-4 py-3 text-center">
                        <span className="text-xs font-medium text-[#5a5a6e] uppercase">Q1</span>
                      </th>
                      <th className="px-4 py-3 text-center">
                        <span className="text-xs font-medium text-[#5a5a6e] uppercase">Q2</span>
                      </th>
                      <th className="px-4 py-3 text-center">
                        <span className="text-xs font-medium text-[#5a5a6e] uppercase">Q3</span>
                      </th>
                      <th className="px-4 py-3 text-center">
                        <SortHeader
                          field="bestPerformance"
                          label="Recorde"
                          currentField={sortField}
                          direction={sortDir}
                          onSort={handleSort}
                        />
                      </th>
                      <th className="px-4 py-3 text-center">
                        <SortHeader
                          field="teamContribution"
                          label="Time %"
                          currentField={sortField}
                          direction={sortDir}
                          onSort={handleSort}
                        />
                      </th>
                      <th className="px-4 py-3 text-center">
                        <span className="text-xs font-medium text-[#5a5a6e] uppercase">Evol.</span>
                      </th>
                    </>
                  )}
                  {!isAccumulated && (
                    <>
                      <th className="px-6 py-3 text-center">
                        <SortHeader
                          field="q1Kills"
                          label="Q1"
                          currentField={sortField}
                          direction={sortDir}
                          onSort={handleSort}
                        />
                      </th>
                      <th className="px-6 py-3 text-center">
                        <SortHeader
                          field="q2Kills"
                          label="Q2"
                          currentField={sortField}
                          direction={sortDir}
                          onSort={handleSort}
                        />
                      </th>
                      <th className="px-6 py-3 text-center">
                        <SortHeader
                          field="q3Kills"
                          label="Q3"
                          currentField={sortField}
                          direction={sortDir}
                          onSort={handleSort}
                        />
                      </th>
                    </>
                  )}
                  <th className="px-6 py-3 text-center bg-green-500/5">
                    <SortHeader
                      field="totalKills"
                      label="Total"
                      currentField={sortField}
                      direction={sortDir}
                      onSort={handleSort}
                    />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a3a]">
                {displayStats.map((p: PlayerRankingStat, index: number) => {
                  const isAcc = isAccumulated;
                  const acc = p as EnrichedPlayer;
                  const single = p as PlayerRankingRawStat;
                  const isTop3 = index < 3 && isAcc;

                  return (
                    <tr
                      key={`${p.playerName}-${index}`}
                      className={`hover:bg-[#1a1a24] transition-colors group ${
                        isTop3
                          ? index === 0
                            ? "bg-gradient-to-r from-yellow-500/5 to-transparent border-l-2 border-yellow-400"
                            : index === 1
                            ? "bg-gradient-to-r from-gray-400/5 to-transparent border-l-2 border-gray-300"
                            : "bg-gradient-to-r from-amber-700/5 to-transparent border-l-2 border-amber-600"
                          : ""
                      }`}
                    >
                      {isAccumulated && compareMode && (
                        <td className="px-3 py-3 text-center">
                          <button
                            onClick={() => toggleCompare(acc.playerName)}
                            className="text-[#5a5a6e] hover:text-green-400 transition-colors"
                          >
                            {selectedForCompare.has(acc.playerName) ? (
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
                      <td className="px-6 py-3">
                        <button
                          onClick={() => isAcc && setModalPlayer(acc)}
                          className="flex items-center gap-3 text-left w-full group/player"
                        >
                          <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center group-hover/player:bg-green-500/20 transition-colors">
                            <Target className="w-4 h-4 text-green-400" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-[#f0f0f5] group-hover/player:text-green-400 transition-colors">
                                {p.playerName}
                              </span>
                              {isAcc && acc.previousNicks.length > 0 && (
                                <PreviousNicksTooltip nicks={acc.previousNicks} />
                              )}
                              {isAcc && acc.isNewbie && (
                                <span className="px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] font-medium text-blue-400">
                                  NOVATO
                                </span>
                              )}
                            </div>
                            {isAcc && acc.badges.length > 0 && (
                              <div className="flex items-center gap-1 mt-1 flex-wrap">
                                {acc.badges.slice(0, 3).map((badge) => (
                                  <span
                                    key={badge}
                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#1a1a24] border border-[#2a2a3a] text-[10px] text-[#8a8a9e]"
                                  >
                                    <BadgeIcon badge={badge} />
                                    {badge}
                                  </span>
                                ))}
                                {acc.badges.length > 3 && (
                                  <span className="text-[10px] text-[#5a5a6e]">
                                    +{acc.badges.length - 3}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </button>
                      </td>
                      <td className="px-6 py-3 text-sm text-[#8a8a9e]">
                        {p.teamName ?? "—"}
                      </td>
                      {isAcc && (
                        <>
                          <td className="px-4 py-3 text-center text-sm text-[#8a8a9e]">
                            {acc.participations}
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-[#8a8a9e]">
                            {acc.avgKills}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {acc.streak >= 3 ? (
                              <span className="inline-flex items-center gap-1 text-sm text-orange-400">
                                <Flame className="w-3.5 h-3.5" />
                                {acc.streak}
                              </span>
                            ) : (
                              <span className="text-sm text-[#8a8a6e]">{acc.streak}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-red-400/80">
                            {acc.avgPerQuarter.q1}
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-orange-400/80">
                            {acc.avgPerQuarter.q2}
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-purple-400/80">
                            {acc.avgPerQuarter.q3}
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-yellow-400/80">
                            {acc.bestPerformance}
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-[#8a8a9e]">
                            {acc.teamContribution > 0 ? `${acc.teamContribution}%` : "—"}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <Sparkline data={acc.sparkline} />
                              <TrendIcon trend={acc.trend} />
                            </div>
                          </td>
                        </>
                      )}
                      {!isAcc && (
                        <>
                          <td className="px-6 py-3 text-center text-sm text-[#8a8a9e]">
                            {single.q1Kills}
                          </td>
                          <td className="px-6 py-3 text-center text-sm text-[#8a8a9e]">
                            {single.q2Kills}
                          </td>
                          <td className="px-6 py-3 text-center text-sm text-[#8a8a9e]">
                            {single.q3Kills}
                          </td>
                        </>
                      )}
                      <td className="px-6 py-3 text-center bg-green-500/5">
                        <span className="text-sm font-bold text-green-400">
                          {p.totalKills}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {displayStats.length === 0 && (
            <EmptyState
              icon={<Target className="w-12 h-12" />}
              title="Nenhuma estatistica encontrada"
              subtitle={
                search || selectedXt || selectedTeam
                  ? "Tente ajustar os filtros"
                  : "Nenhum dado disponivel"
              }
            />
          )}
        </div>
      )}

      {/* Modal de Detalhes */}
      {modalPlayer && modalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalPlayer(null)} />
          <div className="relative bg-[#12121a] rounded-2xl border border-[#2a2a3a] w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-[#12121a]/95 backdrop-blur border-b border-[#2a2a3a] px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#f0f0f5]">{modalData.playerName}</h2>
                  <p className="text-sm text-[#5a5a6e]">{modalData.teamName ?? "Sem time"}</p>
                </div>
              </div>
              <button
                onClick={() => setModalPlayer(null)}
                className="p-2 rounded-lg hover:bg-[#2a2a3a] transition-colors"
              >
                <X className="w-5 h-5 text-[#5a5a6e]" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Nicks antigos */}
              {modalData.previousNicks.length > 0 && (
                <div className="bg-[#1a1a24] rounded-xl border border-[#2a2a3a] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-4 h-4 text-[#5a5a6e]" />
                    <h3 className="text-sm font-medium text-[#8a8a9e]">Nicks anteriores</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {modalData.previousNicks.map((nick) => (
                      <span
                        key={nick}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0a0a0f] border border-[#2a2a3a] text-xs text-[#8a8a9e]"
                      >
                        <History className="w-3 h-3 text-[#5a5a6e]" />
                        {nick}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-[#1a1a24] rounded-xl p-3 border border-[#2a2a3a]">
                  <p className="text-xs text-[#5a5a6e] uppercase mb-1">Total Kills</p>
                  <p className="text-xl font-bold text-green-400">{modalData.totalKills}</p>
                </div>
                <div className="bg-[#1a1a24] rounded-xl p-3 border border-[#2a2a3a]">
                  <p className="text-xs text-[#5a5a6e] uppercase mb-1">XTs</p>
                  <p className="text-xl font-bold text-[#f0f0f5]">{modalData.participations}</p>
                </div>
                <div className="bg-[#1a1a24] rounded-xl p-3 border border-[#2a2a3a]">
                  <p className="text-xs text-[#5a5a6e] uppercase mb-1">Media</p>
                  <p className="text-xl font-bold text-[#f0f0f5]">{modalData.avgKills}</p>
                </div>
                <div className="bg-[#1a1a24] rounded-xl p-3 border border-[#2a2a3a]">
                  <p className="text-xs text-[#5a5a6e] uppercase mb-1">Recorde</p>
                  <p className="text-xl font-bold text-yellow-400">{modalData.bestPerformance}</p>
                </div>
              </div>

              {/* Badges */}
              {modalData.badges.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-[#8a8a9e] mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4" /> Conquistas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {modalData.badges.map((badge) => (
                      <span
                        key={badge}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1a1a24] border border-[#2a2a3a] text-xs font-medium text-[#f0f0f5]"
                      >
                        <BadgeIcon badge={badge} />
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Avg per Quarter */}
              <div>
                <h3 className="text-sm font-medium text-[#8a8a9e] mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" /> Media por Quarto
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#1a1a24] rounded-xl p-3 border border-[#2a2a3a] text-center">
                    <p className="text-xs text-[#5a5a6e] mb-1">Q1</p>
                    <p className="text-lg font-bold text-red-400">{modalData.avgPerQuarter.q1}</p>
                  </div>
                  <div className="bg-[#1a1a24] rounded-xl p-3 border border-[#2a2a3a] text-center">
                    <p className="text-xs text-[#5a5a6e] mb-1">Q2</p>
                    <p className="text-lg font-bold text-orange-400">{modalData.avgPerQuarter.q2}</p>
                  </div>
                  <div className="bg-[#1a1a24] rounded-xl p-3 border border-[#2a2a3a] text-center">
                    <p className="text-xs text-[#5a5a6e] mb-1">Q3</p>
                    <p className="text-lg font-bold text-purple-400">{modalData.avgPerQuarter.q3}</p>
                  </div>
                </div>
              </div>

              {/* Sparkline grande */}
              <div>
                <h3 className="text-sm font-medium text-[#8a8a9e] mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Evolucao
                </h3>
                <div className="bg-[#1a1a24] rounded-xl border border-[#2a2a3a] p-4">
                  <Sparkline data={modalData.sparkline} width={600} height={80} color="#4ade80" />
                  <div className="flex justify-between mt-2 text-xs text-[#5a5a6e]">
                    <span>Inicio</span>
                    <span>Atual</span>
                  </div>
                </div>
              </div>

              {/* Historico */}
              <div>
                <h3 className="text-sm font-medium text-[#8a8a9e] mb-3 flex items-center gap-2">
                  <History className="w-4 h-4" /> Historico de Participacoes
                </h3>
                <div className="space-y-2">
                  {modalData.history
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .map((h) => (
                      <div
                        key={`${h.date}-${h.id}`}
                        className="flex items-center justify-between bg-[#1a1a24] rounded-lg border border-[#2a2a3a] px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-[#5a5a6e]" />
                          <span className="text-sm text-[#f0f0f5]">{h.date}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-[#5a5a6e]">
                            Q1: <span className="text-red-400">{h.q1Kills}</span>
                            {" / "}
                            Q2: <span className="text-orange-400">{h.q2Kills}</span>
                            {" / "}
                            Q3: <span className="text-purple-400">{h.q3Kills}</span>
                          </span>
                          <span className="text-sm font-bold text-green-400">{h.totalKills} kills</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Barra de Comparacao */}
      <ComparisonBar
        players={comparisonPlayers.map((p) => ({
          name: p.playerName,
          stats: [
            { label: "Kills", value: p.totalKills, color: "text-green-400" },
            { label: "Media", value: p.avgKills },
            { label: "XTs", value: p.participations },
            { label: "Recorde", value: p.bestPerformance, color: "text-yellow-400" },
          ],
        }))}
        onRemove={(name) => toggleCompare(name)}
        onClear={() => setSelectedForCompare(new Set())}
      />
    </div>
  );
}