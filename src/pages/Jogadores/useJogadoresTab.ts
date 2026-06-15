import { useQuery } from "@tanstack/react-query";
import type { PlayerRankingStat, XTreinoOption } from "./types";

async function fetchXtreinos(): Promise<XTreinoOption[]> {
  const res = await fetch("/api/players-public/list-xtreinos");
  if (!res.ok) throw new Error("Falha ao carregar xtreinos");
  return res.json();
}

async function fetchPlayerStats(): Promise<PlayerRankingStat[]> {
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

  return {
    xtreinosList: xtreinosQuery.data,
    allPlayerStats: statsQuery.data,
    isLoading: xtreinosQuery.isLoading || statsQuery.isLoading,
    isError: xtreinosQuery.isError || statsQuery.isError,
    error: xtreinosQuery.error ?? statsQuery.error,
  };
}