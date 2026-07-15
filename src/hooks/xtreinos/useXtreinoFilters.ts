import { useState, useMemo } from "react";
import { trpc } from "@/providers/trpc";
import { type XtreinoRawStat, calcPlayerSparkline, calcPlayerStreak, calcAvgPerQuarter, calcBestPerQuarter, calcBestPerformance, calcTeamContribution, calcTrend } from "@/lib/xtreino-calcs";

export function useXtreinoFilters() {
  const [search, setSearch] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedXtreino, setSelectedXtreino] = useState<number | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<Set<number>>(new Set());

  // Queries
  const { data: xtreinosList } = trpc.xtreinos.list.useQuery();
  const { data: playersList, isLoading } = trpc.unified.listPlayers.useQuery({ search: search || undefined });
  const { data: rawXtreinoStatsData } = trpc.players.rankingStats.useQuery();
  const rawXtStats = (rawXtreinoStatsData ?? []) as XtreinoRawStat[];
  
  const { data: specificXtStatsData } = trpc.xtreinos.listPlayerStats.useQuery(
    { xtreinoId: selectedXtreino! },
    { enabled: !!selectedXtreino }
  );

  const activeRawXtStats = useMemo(() => {
    if (selectedXtreino && specificXtStatsData) return specificXtStatsData as XtreinoRawStat[];
    return rawXtStats;
  }, [rawXtStats, selectedXtreino, specificXtStatsData]);

  const filteredPlayers = useMemo(() => {
    if (!playersList) return [];
    if (!selectedTeam) return playersList;
    return playersList.filter((p) => p.teamName === selectedTeam);
  }, [playersList, selectedTeam]);

  const allTeams = useMemo(() => {
    if (!playersList) return [];
    return [...new Set(playersList.map((p) => p.teamName).filter(Boolean))].sort();
  }, [playersList]);

  const clearFilters = () => {
    setSearch("");
    setSelectedTeam(null);
    setSelectedXtreino(null);
    setSelectedForCompare(new Set());
    setCompareMode(false);
  };

  const hasFilters = !!search || !!selectedTeam || !!selectedXtreino || compareMode;

  const toggleCompare = (id: number) => {
    setSelectedForCompare((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 4) next.add(id);
      return next;
    });
  };

  // Função helper para enriquecer um jogador genérico
  const enrichPlayer = (p: any): any => {
    const aliases = Array.isArray(p.aliases) ? p.aliases : [];
    const sparkline = calcPlayerSparkline(activeRawXtStats, p.nickname);
    const streak = calcPlayerStreak(activeRawXtStats, p.nickname);
    const xtParticipations = selectedXtreino ? 1 : p.xtreinoMatches;
    
    return {
      ...p,
      aliases,
      sparkline,
      streak,
      xtParticipations,
      avgPerQuarter: calcAvgPerQuarter(activeRawXtStats, p.nickname, xtParticipations),
      bestPerQuarter: calcBestPerQuarter(activeRawXtStats, p.nickname),
      bestPerformance: calcBestPerformance(activeRawXtStats, p.nickname),
      teamContribution: calcTeamContribution(activeRawXtStats, p.nickname, p.teamName),
      trend: calcTrend(activeRawXtStats, p.nickname),
      specificXtKills: selectedXtreino ? (activeRawXtStats.find(s => s.playerName === p.nickname)?.totalKills ?? 0) : p.xtreinoKills,
    };
  };

  return {
    search, setSearch,
    selectedTeam, setSelectedTeam,
    selectedXtreino, setSelectedXtreino,
    xtreinosList,
    playersList: filteredPlayers,
    allTeams,
    activeRawXtStats,
    isLoading,
    compareMode, setCompareMode,
    selectedForCompare,
    hasFilters, clearFilters, toggleCompare,
    enrichPlayer,
  };
}