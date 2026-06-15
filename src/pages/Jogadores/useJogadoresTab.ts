import { useQuery } from "@tanstack/react-query";
import type { PlayerRankingRawStat, XTreinoOption } from "./jogadoresCalculations";

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

export function useJogadoresTab() {
  const xtreinosQuery = useQuery({
    queryKey: ["xtreinos-list"],
    queryFn: fetchXtreinos,
  });

  const statsQuery = useQuery({
    queryKey: ["player-ranking-stats"],
    queryFn: fetchPlayerStats,
  });

  return {
    xtreinosList: xtreinosQuery.data,
    rawStats: statsQuery.data,
    isLoading: xtreinosQuery.isLoading || statsQuery.isLoading,
    isError: xtreinosQuery.isError || statsQuery.isError,
    error: xtreinosQuery.error ?? statsQuery.error,
  };
}