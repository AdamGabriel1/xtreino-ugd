import { useMemo } from "react";
import type { XtreinoPlayerStat } from "../../hooks/useXtreinoCalculations.js";
import { calcPlayerAccumulatedStats } from "../../hooks/useXtreinoCalculations.js";

// ============================================================
// TIPOS ESPECÍFICOS DO RANKING DE JOGADORES
// ============================================================

export interface XTreinoOption {
  id: number;
  name: string;
  date: string;
}

/** Stats de um jogador em um xtreino específico (formato da API) */
export interface PlayerRankingRawStat {
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

/** Stats acumuladas de um jogador para exibição no ranking */
export interface PlayerRankingDisplay {
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

/** Union type para stats que podem ser exibidos */
export type PlayerRankingStat = PlayerRankingRawStat | PlayerRankingDisplay;

// ============================================================
// FUNÇÕES DE CÁLCULO PURAS
// ============================================================

/** Converte stats brutos da API para formato de exibição acumulado */
export function calcPlayerRankingAccumulated(
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

/** Filtra stats por xtreino */
export function filterStatsByXtreino(
  rawStats: PlayerRankingRawStat[],
  xtreinoId: number | null
): PlayerRankingRawStat[] {
  if (!xtreinoId) return rawStats;
  return rawStats.filter((s) => s.xtreinoId === xtreinoId);
}

/** Busca por nome ou time */
export function searchPlayerStats<T extends { playerName: string; teamName?: string | null }>(
  stats: T[],
  query: string
): T[] {
  if (!query.trim()) return stats;
  const q = query.toLowerCase();
  return stats.filter(
    (p) =>
      p.playerName.toLowerCase().includes(q) ||
      (p.teamName?.toLowerCase() ?? "").includes(q)
  );
}

/** Ordena stats por campo */
export type RankingSortField =
  | "totalKills"
  | "q1Kills"
  | "q2Kills"
  | "q3Kills"
  | "participations"
  | "avgKills"
  | "date";

function sortRankingStats(
  stats: PlayerRankingStat[],
  field: RankingSortField,
  direction: "asc" | "desc"
): PlayerRankingStat[] {
  return [...stats].sort((a, b) => {
    if (field === "date") {
      const aDate = "date" in a ? (a.date ?? "") : "";
      const bDate = "date" in b ? (b.date ?? "") : "";
      return direction === "desc" ? bDate.localeCompare(aDate) : aDate.localeCompare(bDate);
    }

    const aVal = (field in a ? (a as unknown as Record<string, number>)[field] : 0) ?? 0;
    const bVal = (field in b ? (b as unknown as Record<string, number>)[field] : 0) ?? 0;
    return direction === "desc" ? bVal - aVal : aVal - bVal;
  });
}

/** Calcula resumo do ranking */
export interface RankingSummary {
  totalPlayers: number;
  totalKills: number;
  totalQ1: number;
  totalQ2: number;
  totalQ3: number;
  totalRecords: number;
}

export function calcRankingSummary(
  stats: PlayerRankingStat[]
): RankingSummary | null {
  if (!stats.length) return null;

  const first = stats[0];
  const isAccumulated = "participations" in first;

  return {
    totalPlayers: new Set(stats.map((p) => p.playerName)).size,
    totalKills: stats.reduce((sum, p) => sum + (p.totalKills || 0), 0),
    totalQ1: stats.reduce((sum, p) => {
      const val = "totalQ1Kills" in p
        ? p.totalQ1Kills
        : "q1Kills" in p
        ? p.q1Kills
        : 0;
      return sum + (val || 0);
    }, 0),
    totalQ2: stats.reduce((sum, p) => {
      const val = "totalQ2Kills" in p
        ? p.totalQ2Kills
        : "q2Kills" in p
        ? p.q2Kills
        : 0;
      return sum + (val || 0);
    }, 0),
    totalQ3: stats.reduce((sum, p) => {
      const val = "totalQ3Kills" in p
        ? p.totalQ3Kills
        : "q3Kills" in p
        ? p.q3Kills
        : 0;
      return sum + (val || 0);
    }, 0),
    totalRecords: isAccumulated
      ? (stats as PlayerRankingDisplay[]).reduce(
          (sum, p) => sum + p.participations,
          0
        )
      : stats.length,
  };
}

// ============================================================
// HOOK PRINCIPAL
// ============================================================

export interface UsePlayerRankingCalculationsProps {
  rawStats?: PlayerRankingRawStat[];
  selectedXtreinoId?: number | null;
  searchQuery?: string;
  sortField?: RankingSortField;
  sortDirection?: "asc" | "desc";
}

export interface UsePlayerRankingCalculationsReturn {
  accumulatedStats: PlayerRankingDisplay[];
  singleXtreinoStats: PlayerRankingRawStat[];
  displayStats: PlayerRankingStat[];
  summary: RankingSummary | null;
  isAccumulated: boolean;
}

export function usePlayerRankingCalculations({
  rawStats = [],
  selectedXtreinoId = null,
  searchQuery = "",
  sortField = "totalKills",
  sortDirection = "desc",
}: UsePlayerRankingCalculationsProps): UsePlayerRankingCalculationsReturn {
  const isAccumulated = !selectedXtreinoId;

  const accumulatedStats = useMemo(
    () => calcPlayerRankingAccumulated(rawStats),
    [rawStats]
  );

  const singleXtreinoStats = useMemo(
    () => filterStatsByXtreino(rawStats, selectedXtreinoId),
    [rawStats, selectedXtreinoId]
  );

  const baseStats: PlayerRankingStat[] = isAccumulated
    ? accumulatedStats
    : singleXtreinoStats;

  const searchedStats = useMemo(
    () => searchPlayerStats(baseStats, searchQuery),
    [baseStats, searchQuery]
  );

  const displayStats = useMemo(
    () => sortRankingStats(searchedStats, sortField, sortDirection),
    [searchedStats, sortField, sortDirection]
  );

  const summary = useMemo(
    () => calcRankingSummary(displayStats),
    [displayStats]
  );

  return {
    accumulatedStats,
    singleXtreinoStats,
    displayStats,
    summary,
    isAccumulated,
  };
}