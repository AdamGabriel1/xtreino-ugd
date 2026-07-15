// src/hooks/useExperienceData.ts
import { trpc } from "@/providers/trpc";
import { useXtreinoCalculations } from "@/hooks/xtreinos/useXtreinoCalculations";
import { useHomeStats } from "@/hooks/experience/useHomeStats";
import { useHomeRankings } from "@/hooks/experience/useHomeRankings";
import { useHomeActivities } from "@/hooks/experience/useHomeActivities";
import type { ExperienceData } from "@/types/experience";

export function useExperienceData(): ExperienceData {
  // 1. Busca os dados crus do backend
  const { data: allResults } = trpc.xtreinos.listResults.useQuery();
  const { data: allPlayerStats } = trpc.xtreinos.listPlayerStats.useQuery();
  const { data: settings } = trpc.settings.get.useQuery();

  // 2. Usa o seu hook de cálculos reais (que tem o totalKills, top1Count, etc)
  const calculations = useXtreinoCalculations({
    results: allResults ?? [],
    playerStats: allPlayerStats ?? [],
  });

  // 3. Repassa os dados calculados para os hooks que desenham a tela
  const { stats, detailedEventStats } = useHomeStats(calculations.teamRanking);
  const { topPlayers, topTeams } = useHomeRankings(calculations.teamRanking, calculations.playerAccumulated);
  const { recentActivities, upcomingEvents } = useHomeActivities(calculations.teamRanking);

  const isLoading = !allResults || !allPlayerStats;

  return {
    orgName: settings?.orgName ?? "Underground",
    isLoading,
    stats,
    detailedEventStats,
    topPlayers,
    topTeams,
    recentActivities,
    upcomingEvents,
    periodSummary: calculations.periodSummary,
  };
}