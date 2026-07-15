// src/hooks/useXtreinoCalculations.ts
import { useMemo } from "react";
import {
  // Importa os tipos para uso INTERNO deste arquivo
  // Importa os tipos para uso INTERNO deste arquivo
  type XtreinoResult,
  type XtreinoPlayerStat,
  type TeamXtreinoStats,
  type PlayerXtreinoStats,
  type PlayerAccumulatedStats,
  type TeamAccumulatedStats,
  type TeamRankingStats,
  type TeamPlayerGrouped,
  // Importa as funções de cálculo
  filterByDate,
  extractMonths,
  extractDays,
  calcTeamXtreinoStats,
  calcPlayerXtreinoStats,
  calcPlayerAccumulatedStats,
  calcTeamAccumulatedStats,
  calcTeamRankingStats,
  calcTeamPlayersGrouped,
  calcPosPoints,
  calcKillPoints,
  playerPlayedForTeam,
} from "@/utils/xtreinoCalculations";

// Re-exporta os tipos para quem ainda importar daqui (ex: os hooks de Experience)
export type {
  XtreinoResult,
  XtreinoPlayerStat,
  XtreinoEvent,
  TeamXtreinoStats,
  PlayerXtreinoStats,
  PlayerAccumulatedStats,
  TeamAccumulatedStats,
  TeamRankingHistoryItem,
  TeamRankingStats,
  TeamPlayerGrouped,
} from "@/utils/xtreinoCalculations";

// Re-exporta as funções de cálculo úteis caso algum componente precise usar direto
export {
  calcPosPoints,
  calcKillPoints,
  calcTeamXtreinoStats,
  calcPlayerXtreinoStats,
  playerPlayedForTeam,
  filterByDate,
  extractMonths,
  extractDays,
} from "@/utils/xtreinoCalculations";

// ============================================================
// HOOK PRINCIPAL
// ============================================================
export interface UseXtreinoCalculationsProps {
  results?: XtreinoResult[];
  playerStats?: XtreinoPlayerStat[];
  selectedMonth?: string;
  selectedDate?: string;
}

export interface UseXtreinoCalculationsReturn {
  filteredResults: XtreinoResult[];
  filteredPlayerStats: XtreinoPlayerStat[];
  availableMonths: string[];
  availableDates: string[];
  teamXtreinoStats: TeamXtreinoStats[];
  playerXtreinoStats: PlayerXtreinoStats[];
  playerAccumulated: PlayerAccumulatedStats[];
  playerGlobalStats: Map<string, PlayerAccumulatedStats>;
  teamAccumulated: TeamAccumulatedStats[];
  teamRanking: TeamRankingStats[];
  teamPlayersGrouped: Map<string, TeamPlayerGrouped[]>;
  periodSummary: {
    totalKills: number;
    totalPosPoints: number;
    totalKillPoints: number;
    totalPoints: number;
    uniqueTeams: number;
    uniquePlayers: number;
    uniqueDates: number;
  } | null;
}

export function useXtreinoCalculations({
  results = [],
  playerStats = [],
  selectedMonth = "",
  selectedDate = "",
}: UseXtreinoCalculationsProps): UseXtreinoCalculationsReturn {

  const filteredResults = useMemo(
    () => filterByDate(results, selectedMonth, selectedDate),
    [results, selectedMonth, selectedDate]
  );

  const filteredPlayerStats = useMemo(
    () => filterByDate(playerStats, selectedMonth, selectedDate),
    [playerStats, selectedMonth, selectedDate]
  );

  const availableMonths = useMemo(() => extractMonths(results), [results]);
  
  const availableDates = useMemo(
    () => (selectedMonth ? extractDays(results, selectedMonth) : []),
    [results, selectedMonth]
  );

  const teamXtreinoStats = useMemo(
    () => filteredResults.map((r) => calcTeamXtreinoStats(r, filteredPlayerStats)),
    [filteredResults, filteredPlayerStats]
  );

  const playerXtreinoStats = useMemo(
    () => filteredPlayerStats.map((s) => calcPlayerXtreinoStats(s)),
    [filteredPlayerStats]
  );

  const playerAccumulated = useMemo(
    () => calcPlayerAccumulatedStats(filteredPlayerStats),
    [filteredPlayerStats]
  );

  const playerGlobalStats = useMemo(() => {
    const map = new Map<string, PlayerAccumulatedStats>();
    for (const player of playerAccumulated) {
      map.set(player.playerName.trim().toLowerCase(), player);
    }
    return map;
  }, [playerAccumulated]);

  const teamAccumulated = useMemo(
    () => calcTeamAccumulatedStats(filteredResults, filteredPlayerStats),
    [filteredResults, filteredPlayerStats]
  );

  const teamRanking = useMemo(
    () => calcTeamRankingStats(results, playerStats), // Ranking é sempre global
    [results, playerStats]
  );

  const teamPlayersGrouped = useMemo(
    () => calcTeamPlayersGrouped(playerStats), // Agrupamento é sempre global
    [playerStats]
  );

  const periodSummary = useMemo(() => {
    if (!filteredResults.length && !filteredPlayerStats.length) return null;

    const totalKills = filteredPlayerStats.reduce((sum, s) => sum + (s.totalKills || 0), 0);
    const totalPosPoints = teamXtreinoStats.reduce((sum, s) => sum + s.totalPosPoints, 0);
    const totalKillPoints = teamXtreinoStats.reduce((sum, s) => sum + s.totalKillPoints, 0);
    const totalPoints = teamXtreinoStats.reduce((sum, s) => sum + s.totalPoints, 0);
    const uniqueTeams = new Set(filteredResults.map((r) => r.teamName)).size;
    const uniquePlayers = new Set(filteredPlayerStats.map((s) => s.playerName)).size;
    const uniqueDates = new Set([
      ...filteredResults.map((r) => r.date),
      ...filteredPlayerStats.map((s) => s.date),
    ]).size;

    return { totalKills, totalPosPoints, totalKillPoints, totalPoints, uniqueTeams, uniquePlayers, uniqueDates };
  }, [filteredResults, filteredPlayerStats, teamXtreinoStats]);

  return {
    filteredResults, filteredPlayerStats, availableMonths, availableDates,
    teamXtreinoStats, playerXtreinoStats, playerAccumulated, playerGlobalStats,
    teamAccumulated, teamRanking, teamPlayersGrouped, periodSummary,
  };
}