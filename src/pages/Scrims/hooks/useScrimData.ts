// src/app/scrims/hooks/useScrimData.ts
// Hook centralizado para buscar todos os dados de scrims

import { trpc } from "@/providers/trpc";
import type { ScrimMode } from "../types";

export function useScrimData(selectedDate: string, selectedMode: ScrimMode | "all" = "all") {
  const isAllTime = selectedDate === "all";

  const { data: scrimsList, isLoading: loadingScrims } = trpc.scrims.list.useQuery();
  const { data: availableDates, isLoading: loadingDates } = trpc.scrims.dates.useQuery();

  // teamResults filtra por modo quando não é "all"
  const { data: scrimTeamResults, isLoading: loadingTeamResults } = trpc.scrims.teamResults.useQuery(
    {
      date: isAllTime ? undefined : selectedDate,
      mode: selectedMode === "all" ? undefined : selectedMode,
    },
    { enabled: !isAllTime }
  );

  // playerStats filtra por modo quando não é "all"
  const { data: scrimPlayerStats, isLoading: loadingPlayerStats } = trpc.scrims.playerStats.useQuery(
    {
      date: isAllTime ? undefined : selectedDate,
      mode: selectedMode === "all" ? undefined : selectedMode,
    },
    { enabled: !isAllTime }
  );

  // playerStatsAllTime opcionalmente filtra por modo
  const { data: scrimPlayerAllTime, isLoading: loadingPlayerAllTime } = trpc.scrims.playerStatsAllTime.useQuery(
    selectedMode === "all" ? undefined : { mode: selectedMode }
  );

  const { data: scrimTeamAllTimeBR, isLoading: loadingTeamAllTimeBR } = trpc.scrims.teamResultsAllTimeBR.useQuery();
  const { data: scrimTeamAllTimeMME, isLoading: loadingTeamAllTimeMME } = trpc.scrims.teamResultsAllTimeMME.useQuery();

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