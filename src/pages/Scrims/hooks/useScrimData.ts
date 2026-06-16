// src/app/scrims/hooks/useScrimData.ts
// Hook centralizado para buscar todos os dados de scrims

import { trpc } from "@/providers/trpc";

export function useScrimData(selectedDate: string) {
  const isAllTime = selectedDate === "all";

  const { data: scrimsList, isLoading: loadingScrims } = trpc.scrims.list.useQuery();
  const { data: availableDates, isLoading: loadingDates } = trpc.scrims.dates.useQuery();
  const { data: scrimTeamResults, isLoading: loadingTeamResults } = trpc.scrims.teamResults.useQuery(
    { date: isAllTime ? undefined : selectedDate },
    { enabled: !isAllTime }
  );
  const { data: scrimPlayerStats, isLoading: loadingPlayerStats } = trpc.scrims.playerStats.useQuery(
    { date: isAllTime ? undefined : selectedDate },
    { enabled: !isAllTime }
  );
  const { data: scrimPlayerAllTime, isLoading: loadingPlayerAllTime } = trpc.scrims.playerStatsAllTime.useQuery();
  const { data: scrimTeamAllTimeBR, isLoading: loadingTeamAllTimeBR } = trpc.scrims.teamResultsAllTimeBR.useQuery();
  const { data: scrimTeamAllTimeMME, isLoading: loadingTeamAllTimeMME } = trpc.scrims.teamResultsAllTimeMME?.useQuery();

  return {
    scrimsList,
    availableDates,
    scrimTeamResults,
    scrimPlayerStats,
    scrimPlayerAllTime,
    scrimTeamAllTimeBR,
    scrimTeamAllTimeMME,
    isLoading: loadingScrims || loadingDates || loadingTeamResults || loadingPlayerStats || loadingPlayerAllTime || loadingTeamAllTimeBR || loadingTeamAllTimeMME,
    loadingStates: {
      scrims: loadingScrims,
      dates: loadingDates,
      teamResults: loadingTeamResults,
      playerStats: loadingPlayerStats,
      playerAllTime: loadingPlayerAllTime,
      teamAllTimeBR: loadingTeamAllTimeBR,
      teamAllTimeMME: loadingTeamAllTimeMME,
    },
  };
}