import { useQuery } from "@tanstack/react-query";
import { calcPlayerAccumulatedStats } from "../../hooks/useXtreinoCalculations.js";
import type { XtreinoPlayerStat, PlayerAccumulatedStats } from "../../hooks/useXtreinoCalculations.js";
import type { XTreinoOption } from "./types";

async function fetchXtreinos(): Promise<XTreinoOption[]> {
  const res = await fetch("/api/players-public/list-xtreinos");
  if (!res.ok) throw new Error("Falha ao carregar xtreinos");
  return res.json();
}

async function fetchPlayerStats(): Promise<XtreinoPlayerStat[]> {
  const res = await fetch("/api/players-public/ranking-stats");
  if (!res.ok) throw new Error("Falha ao carregar estatísticas");
  return res.json();
}

export function useJogadoresTab() {
  const xtreinosQuery = useQuery({
    queryKey: ["xtreinos-list"],
    queryFn: fetchXtreinos,
  });

  const statsQuery = useQuery({
    queryKey: ["player-ranking-stats"],
    queryFn: fetchPlayerStats,
  });

  // Usa SUA função existente para acumular stats
  const accumulated = statsQuery.data
    ? calcPlayerAccumulatedStats(statsQuery.data)
    : [];

  return {
    xtreinosList: xtreinosQuery.data,
    allPlayerStats: statsQuery.data,
    accumulatedStats: accumulated,
    isLoading: xtreinosQuery.isLoading || statsQuery.isLoading,
    isError: xtreinosQuery.isError || statsQuery.isError,
    error: xtreinosQuery.error ?? statsQuery.error,
  };
}