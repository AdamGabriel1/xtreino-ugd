import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { PlayerRankingRawStat, XTreinoOption } from "./jogadoresCalculations";
import {
  calcPlayerRankingAccumulated,
  filterStatsByXtreino,
  searchPlayerStats,
  sortRankingStats,
  calcRankingSummary,
  type RankingSortField,
  type PlayerRankingStat,
} from "./jogadoresCalculations";

async function fetchXtreinos(): Promise<XTreinoOption[]> {
  const res = await fetch("/api/players/listXtreinos");
  if (!res.ok) throw new Error("Falha ao carregar xtreinos");
  return res.json();
}

async function fetchPlayerStats(): Promise<PlayerRankingRawStat[]> {
  const res = await fetch("/api/players/rankingStats");
  if (!res.ok) throw new Error("Falha ao carregar estatísticas");
  return res.json();
}

export interface UseJogadoresTabProps {
  selectedXtreinoId?: number | null;
  searchQuery?: string;
  sortField?: RankingSortField;
  sortDirection?: "asc" | "desc";
}

export interface UseJogadoresTabReturn {
  xtreinosList: XTreinoOption[] | undefined;
  accumulatedStats: import("./jogadoresCalculations").PlayerRankingDisplay[];
  singleXtreinoStats: PlayerRankingRawStat[];
  displayStats: PlayerRankingStat[];
  summary: import("./jogadoresCalculations").RankingSummary | null;
  isAccumulated: boolean;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

export function useJogadoresTab({
  selectedXtreinoId = null,
  searchQuery = "",
  sortField = "totalKills",
  sortDirection = "desc",
}: UseJogadoresTabProps = {}): UseJogadoresTabReturn {
  const xtreinosQuery = useQuery({
    queryKey: ["xtreinos-list"],
    queryFn: fetchXtreinos,
  });

  const statsQuery = useQuery({
    queryKey: ["player-ranking-stats"],
    queryFn: fetchPlayerStats,
  });

  const rawStats = statsQuery.data ?? [];
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
    xtreinosList: xtreinosQuery.data,
    accumulatedStats,
    singleXtreinoStats,
    displayStats,
    summary,
    isAccumulated,
    isLoading: xtreinosQuery.isLoading || statsQuery.isLoading,
    isError: xtreinosQuery.isError || statsQuery.isError,
    error: (xtreinosQuery.error ?? statsQuery.error) as Error | null,
  };
}