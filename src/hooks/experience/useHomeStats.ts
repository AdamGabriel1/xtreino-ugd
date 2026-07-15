// src/hooks/experience/useHomeStats.ts
import { useMemo } from "react";
import { trpc } from "@/providers/trpc";
import type { ExperienceStats, DetailedEventStats } from "@/types/experience";
import type { TeamRankingStats } from "@/hooks/xtreinos/useXtreinoCalculations"; // Importando o tipo real

export function useHomeStats(teamRanking?: TeamRankingStats[]) {
  const { data: allXtreinos } = trpc.xtreinos.list.useQuery(undefined);
  const { data: allChampionships } = trpc.championships.list.useQuery(undefined);
  const { data: allScrims } = trpc.scrims.list.useQuery(undefined);
  const { data: teamsList } = trpc.teams.list.useQuery();
  const { data: playersList } = trpc.players.list.useQuery();
  const { data: scrimTeamAllTime } = trpc.scrims.teamResultsAllTimeBR.useQuery();
  const { data: salinhasList } = trpc.salinhas.list.useQuery();

  const stats = useMemo<ExperienceStats>(() => {
    const totalXtreinos = allXtreinos?.length ?? 0;
    const totalChampionships = allChampionships?.length ?? 0;
    const totalScrims = allScrims?.length ?? 0;
    const totalTeams = teamsList?.length ?? 0;
    const totalPlayers = playersList?.length ?? 0;
    
    // Como teamRanking agora tem o tipo correto, o TS sabe que 't' tem totalKills
    const totalKills = teamRanking?.reduce((acc, t) => acc + t.totalKills, 0) ?? 0;
    const totalPoints = teamRanking?.reduce((acc, t) => acc + t.totalPoints, 0) ?? 0;
    const totalMatches = totalXtreinos + totalScrims + totalChampionships;
    
    return {
      totalXtreinos, totalChampionships, totalScrims, totalTeams, totalPlayers,
      totalKills, totalPoints, totalMatches,
      avgKillsPerMatch: totalMatches > 0 ? Math.round((totalKills / totalMatches) * 10) / 10 : 0,
      avgPointsPerTeam: totalTeams > 0 ? Math.round((totalPoints / totalTeams) * 10) / 10 : 0,
    };
  }, [allXtreinos, allChampionships, allScrims, teamsList, playersList, teamRanking]);

  const detailedEventStats = useMemo<DetailedEventStats>(() => {
    return {
      xtreinoStats: {
        total: allXtreinos?.length ?? 0,
        abertos: allXtreinos?.filter((x) => x.status === "aberto" || !x.status).length ?? 0,
        emAndamento: allXtreinos?.filter((x) => x.status === "em_andamento").length ?? 0,
        fechados: allXtreinos?.filter((x) => x.status === "finalizado").length ?? 0,
      },
      championshipStats: {
        total: allChampionships?.length ?? 0,
        ativos: allChampionships?.filter((c) => c.status === "ativo" || !c.status).length ?? 0,
        inscricoes: allChampionships?.filter((c) => c.status === "inscricoes").length ?? 0,
        encerrados: allChampionships?.filter((c) => c.status === "encerrado").length ?? 0,
      },
      scrimStats: {
        total: allScrims?.length ?? 0,
        agendados: allScrims?.filter((s) => s.status === "agendado" || !s.status).length ?? 0,
        emAndamento: allScrims?.filter((s) => s.status === "em_andamento").length ?? 0,
        finalizados: allScrims?.filter((s) => s.status === "concluido").length ?? 0,
      },
      salinhaStats: {
        total: salinhasList?.length ?? 0,
        abertas: salinhasList?.filter((s) => s.status === "aberta").length ?? 0,
        encerradas: salinhasList?.filter((s) => s.status === "encerrada").length ?? 0,
      },
      xtreinoRealStats: {
        totalTeams: teamRanking?.length ?? 0,
        totalKills: teamRanking?.reduce((acc, t) => acc + t.totalKills, 0) ?? 0,
        totalPoints: teamRanking?.reduce((acc, t) => acc + t.totalPoints, 0) ?? 0,
        totalXtreinos: teamRanking?.reduce((acc, t) => acc + t.xtreinosPlayed, 0) ?? 0,
      },
      scrimRealStats: {
        totalTeams: scrimTeamAllTime?.length ?? 0,
        totalKills: scrimTeamAllTime?.reduce((acc, t) => acc + (t.totalKills || 0), 0) ?? 0,
        totalPoints: scrimTeamAllTime?.reduce((acc, t) => acc + (t.totalPoints || 0), 0) ?? 0,
        totalScrims: scrimTeamAllTime?.reduce((acc, t) => acc + (t.matches || 0), 0) ?? 0,
      },
    };
  }, [allXtreinos, allChampionships, allScrims, salinhasList, teamRanking, scrimTeamAllTime]);

  return { stats, detailedEventStats };
}