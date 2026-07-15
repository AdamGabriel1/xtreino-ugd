import { useMemo } from "react";
import { trpc } from "@/providers/trpc";
import { useXtreinoCalculations } from "@/hooks/xtreinos/useXtreinoCalculations";

export function useHomeData() {
  // ============================================================
  // 1. BUSCA DE DADOS (TRPC)
  // ============================================================
  const { data: allXtreinos } = trpc.xtreinos.list.useQuery(undefined); // ✅ REMOVIDO refetchOnWindowFocus
  const { data: allChampionships } = trpc.championships.list.useQuery(undefined); // ✅ REMOVIDO
  const { data: allScrims } = trpc.scrims.list.useQuery(undefined); // ✅ REMOVIDO
  const { data: allResults } = trpc.xtreinos.listResults.useQuery(undefined); // ✅ REMOVIDO
  const { data: allPlayerStats } = trpc.xtreinos.listPlayerStats.useQuery(undefined); // ✅ REMOVIDO
  const { data: scrimTeamAllTime } = trpc.scrims.teamResultsAllTimeBR.useQuery(); // ✅ REMOVIDO

  // Dados leves para os componentes de header e stats básicas
  const { data: championships } = trpc.championships.list.useQuery({ status: "ativo" });
  const { data: xtreinosList } = trpc.xtreinos.list.useQuery({ status: "aberto" });
  const { data: teamsList } = trpc.teams.list.useQuery();
  const { data: playersList } = trpc.players.list.useQuery();
  const { data: settings } = trpc.settings.get.useQuery();

  // ============================================================
  // 2. CÁLCULOS COMPLEXOS ( useMemo)
  // ============================================================
  const { teamRanking, teamPlayersGrouped } = useXtreinoCalculations({
    results: allResults ?? [],
    playerStats: allPlayerStats ?? [],
  });

  const xtreinoStats = useMemo(() => ({
    total: allXtreinos?.length ?? 0,
    abertos: allXtreinos?.filter((x: any) => x.status === "aberto" || !x.status).length ?? 0,
    emAndamento: allXtreinos?.filter((x: any) => x.status === "em_andamento").length ?? 0,
    fechados: allXtreinos?.filter((x: any) => x.status === "fechado").length ?? 0,
  }), [allXtreinos]);

  const championshipStats = useMemo(() => ({
    total: allChampionships?.length ?? 0,
    ativos: allChampionships?.filter((c: any) => c.status === "ativo" || !c.status).length ?? 0,
    inscricoes: allChampionships?.filter((c: any) => c.status === "inscricoes").length ?? 0,
    encerrados: allChampionships?.filter((c: any) => c.status === "encerrado").length ?? 0,
  }), [allChampionships]);

  const scrimStats = useMemo(() => ({
    total: allScrims?.length ?? 0,
    agendados: allScrims?.filter((s: any) => s.status === "agendado" || !s.status).length ?? 0,
    emAndamento: allScrims?.filter((s: any) => s.status === "em_andamento").length ?? 0,
    finalizados: allScrims?.filter((s: any) => s.status === "finalizado").length ?? 0,
  }), [allScrims]);

  const xtreinoRealStats = useMemo(() => {
    if (!teamRanking || teamRanking.length === 0) return { totalTeams: 0, totalKills: 0, totalPoints: 0, totalXtreinos: 0 };
    return {
      totalTeams: teamRanking.length,
      totalKills: teamRanking.reduce((acc: any, t: any) => acc + t.totalKills, 0),
      totalPoints: teamRanking.reduce((acc: any, t: any) => acc + t.totalPoints, 0),
      totalXtreinos: teamRanking.reduce((acc: any, t: any) => acc + t.xtreinosPlayed, 0),
    };
  }, [teamRanking]);

  const scrimRealStats = useMemo(() => {
    if (!scrimTeamAllTime || scrimTeamAllTime.length === 0) return { totalTeams: 0, totalKills: 0, totalPoints: 0, totalScrims: 0 };
    return {
      totalTeams: scrimTeamAllTime.length,
      totalKills: scrimTeamAllTime.reduce((acc: any, t: any) => acc + (t.totalKills || 0), 0),
      totalPoints: scrimTeamAllTime.reduce((acc: any, t: any) => acc + (t.totalPoints || 0), 0),
      totalScrims: scrimTeamAllTime.reduce((acc: any, t: any) => acc + (t.matches || 0), 0),
    };
  }, [scrimTeamAllTime]);

  // ============================================================
  // 3. DERIVAÇÕES DE LISTA (useMemo)
  // ============================================================
  const upcomingEvents = useMemo(() => {
    return [
      ...(allXtreinos?.map((x: any) => ({ id: x.id, name: x.name, date: x.date || "Data não definida", type: "xtreino" as const, modality: x.modality || "", status: x.status || "aberto" })) || []),
      ...(allChampionships?.map((c: any) => ({ id: c.id + 10000, name: c.name, date: c.startDate || "Data não definida", type: "championship" as const, modality: c.modality || "", status: c.status || "ativo" })) || []),
      ...(allScrims?.map((s: any) => ({ id: s.id + 20000, name: s.name, date: s.date || "Data não definida", type: "scrim" as const, modality: s.modality || "", status: s.status || "agendado" })) || []),
    ].filter((e: any) => e.status !== "encerrado" && e.status !== "fechado" && e.status !== "finalizado")
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  }, [allXtreinos, allChampionships, allScrims]);

  const recentActivities = useMemo(() => {
    const activities: Array<{ id: number; text: string; time: string; type: "match" | "result" | "registration" | "ranking" }> = [];
    if (teamRanking && teamRanking.length > 0) {
      const recentXtreinos = new Map<string, { date: string; teamName: string; totalPoints: number }>();
      for (const team of teamRanking.slice(0, 5)) {
        for (const xt of team.xtreinos.slice(-1)) {
          const key = `${xt.date}-${team.teamName}`;
          if (!recentXtreinos.has(key)) recentXtreinos.set(key, { date: xt.date, teamName: team.teamName, totalPoints: xt.totalPoints });
        }
      }
      Array.from(recentXtreinos.values()).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3).forEach((xt: any) => {
        activities.push({ id: activities.length + 1, text: `"${xt.teamName}" marcou ${xt.totalPoints} pts`, time: xt.date, type: "result" });
      });
    }
    if (allChampionships && allChampionships.length > 0) {
      allChampionships.slice(-2).forEach((champ: any) => {
        activities.push({
          id: activities.length + 1,
          text: `Camp. "${champ.name}" ${champ.status === "ativo" ? "iniciado" : champ.status === "inscricoes" ? "com inscrições abertas" : "encerrado"}`,
          time: champ.startDate || "Recente",
          type: champ.status === "encerrado" ? "result" : "registration",
        });
      });
    }
    return activities.slice(0, 5);
  }, [teamRanking, allChampionships]);

  const topXtreinoPlayers = useMemo(() => {
    if (!teamPlayersGrouped || teamPlayersGrouped.size === 0) return [];
    const allPlayers: Array<{ playerName: string; totalKills: number; participations: number; avgKills: number; teamName: string }> = [];
    for (const [teamName, players] of teamPlayersGrouped.entries()) {
      for (const player of players) allPlayers.push({ ...player, teamName });
    }
    const playerMap = new Map<string, typeof allPlayers[0]>();
    for (const p of allPlayers) {
      const key = p.playerName.trim().toLowerCase();
      if (playerMap.has(key)) {
        const existing = playerMap.get(key)!;
        existing.totalKills += p.totalKills;
        existing.participations += p.participations;
        existing.avgKills = Number((existing.totalKills / existing.participations).toFixed(1));
      } else {
        playerMap.set(key, { ...p });
      }
    }
    return Array.from(playerMap.values()).sort((a: any, b: any) => b.totalKills - a.totalKills).slice(0, 3).map((p: any) => ({ name: p.playerName, entityName: p.playerName, points: p.totalKills, kills: p.totalKills, wins: p.participations }));
  }, [teamPlayersGrouped]);

  const xtreinoRankingFallback = useMemo(() => {
    if (!teamRanking || teamRanking.length === 0) return [];
    return teamRanking.map((t: any, i: any) => ({ id: i + 1, entityName: t.teamName, points: t.totalPoints, kills: t.totalKills, wins: t.top1Count })).sort((a: any, b: any) => b.points - a.points);
  }, [teamRanking]);

  const scrimRankingFallback = useMemo(() => {
    if (!scrimTeamAllTime || scrimTeamAllTime.length === 0) return [];
    return scrimTeamAllTime.map((t: any, i: any) => ({ id: i + 1, entityName: t.teamName, points: t.totalPoints || 0, kills: t.totalKills || 0, wins: t.wins || 0 })).sort((a: any, b: any) => b.points - a.points);
  }, [scrimTeamAllTime]);

  // ============================================================
  // 4. RETORNO LIMPO
  // ============================================================
  return {
    // Dados para o Header/Stats básicas
    championships,
    xtreinosList,
    teamsList,
    playersList,
    settings,
    xtreinoStats,
    championshipStats,
    scrimStats,
    
    // Dados reais calculados
    xtreinoRealStats,
    scrimRealStats,
    
    // Dados derivados para componentes
    upcomingEvents,
    recentActivities,
    topXtreinoPlayers,
    xtreinoRankingFallback,
    scrimRankingFallback,
    
    // Flags de loading
    isLoading: !allResults || !allPlayerStats || !scrimTeamAllTime,
  };
}