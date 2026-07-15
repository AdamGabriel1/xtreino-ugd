import { useState, useMemo, useEffect } from "react";
import { trpc } from "@/providers/trpc";
import { useXtreinoCalculations, calcPosPoints, calcKillPoints } from "@/hooks/xtreinos/useXtreinoCalculations";
import { useSortState, useCompareState, usePlayersByName, useRankingSort, mergePlayersById, enrichTeam, calcPointsVsPrevMonth, groupPlayersByTeam, getWeekKey, getWeekDates } from "@/hooks/xtreinos/xtreino-shared";
import type { EnrichedTeam, MergedPlayer } from "@/hooks/xtreinos/xtreino-shared";
import { buildTeamRanking } from "@/hooks/xtreinos/xtreino-shared";

// --- FUNÇÃO AUXILIAR LOCAL ---
function adaptClanToEnrichedTeam(clanSum: any): EnrichedTeam {
  return {
    teamName: clanSum.teamName, xtreinosPlayed: clanSum.xtreinosPlayed || 0,
    totalPoints: clanSum.totalPoints || 0, totalPosPoints: clanSum.totalPosPoints || 0,
    totalKillPoints: clanSum.totalKillPoints || 0, totalKills: clanSum.totalKills || 0,
    badges: [], top1Count: clanSum.top1Count || 0, top2Count: clanSum.top2Count || 0,
    top3Count: clanSum.top3Count || 0, bestPosition: clanSum.bestPosition || null,
    avgPosition: clanSum.avgPosition || 0, consistency: 0, streak: 0, trend: "same" as const,
    sparkline: clanSum.sparklineData || [], xtreinos: [], bestPerformance: clanSum.totalPoints || 0,
    worstPerformance: clanSum.totalPoints || 0, pointsVsPrevMonth: null,
  };
}

// --- HOOK DO RANKING GERAL ---
export function useRankingGeralTab() {
  const { sortBy, sortDir, handleSort } = useSortState();
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const { compareMode, setCompareMode, selected: selectedForCompare, toggle: toggleCompare, clear: clearCompare } = useCompareState();
  const [search, setSearch] = useState("");

  const { data: allResults } = trpc.xtreinos.listResults.useQuery();
  const { data: allPlayerStats } = trpc.xtreinos.listPlayerStats.useQuery();
  const { data: playersList } = trpc.players.list.useQuery();
  const { data: teamsList } = trpc.teams.list.useQuery();

  const { teamRanking, teamPlayersGrouped } = useXtreinoCalculations({ results: allResults ?? [], playerStats: allPlayerStats ?? [] });
  const isLoading = !allResults || !allPlayerStats;
  const playersByName = usePlayersByName(playersList);

  const totalXtreinosUnicos = useMemo(() => { const ids = new Set<number>(); allResults?.forEach((r) => ids.add(r.xtreinoId)); return ids.size; }, [allResults]);
  
  const enrichedRanking: EnrichedTeam[] = useMemo(() => teamRanking.map((team) => enrichTeam(team, "geral")), [teamRanking]);
  const sorted = useRankingSort(enrichedRanking, sortBy, sortDir);
  const finalRanking = useMemo(() => { if (!search.trim()) return sorted; const q = search.toLowerCase(); return sorted.filter((t) => t.teamName.toLowerCase().includes(q)); }, [sorted, search]);

  const getTeamPlayers = (teamName: string): MergedPlayer[] => {
    const teamKey = teamName.trim().toLowerCase();
    const players = teamPlayersGrouped.get(teamKey) ?? [];
    return mergePlayersById(players, playersByName);
  };

  const top3 = useMemo(() => (finalRanking.length >= 3 ? finalRanking.slice(0, 3) : []), [finalRanking]);
  const comparisonTeams = useMemo(() => sorted.filter((t) => selectedForCompare.has(t.teamName)), [sorted, selectedForCompare]);

  const teamNameToIdMap = useMemo(() => {
    const map = new Map<string, { teamId: number; clanId: number | null }>();
    if (!teamsList) return map;
    for (const team of teamsList) map.set(team.name.trim().toLowerCase(), { teamId: team.id, clanId: team.clanId ?? null });
    return map;
  }, [teamsList]);

  const clearFilters = () => { setSearch(""); clearCompare(); };

  return {
    isLoading, sortBy, sortDir, handleSort, search, setSearch, compareMode, setCompareMode,
    selectedForCompare, toggleCompare, clearCompare, expandedTeam, setExpandedTeam,
    finalRanking, top3, comparisonTeams, totalXtreinosUnicos, getTeamPlayers, teamRanking, teamNameToIdMap, clearFilters,
    hasFilters: search.trim().length > 0 || sortBy !== "total" || compareMode,
  };
}

// --- HOOK DO RANKING MENSAL ---
export function useRankingMensalTab() {
  const { sortBy, sortDir, handleSort } = useSortState();
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState("");
  const { compareMode, setCompareMode, selected: selectedForCompare, toggle: toggleCompare, clear: clearCompare } = useCompareState();
  const [search, setSearch] = useState("");

  const { data: allResults } = trpc.xtreinos.listResults.useQuery();
  const { data: allPlayerStats } = trpc.xtreinos.listPlayerStats.useQuery();
  const { data: playersList } = trpc.players.list.useQuery();
  const { data: teamsList } = trpc.teams.list.useQuery();

  const isLoading = !allResults || !allPlayerStats;
  const playersByName = usePlayersByName(playersList);

  const availableMonths = useMemo(() => {
    if (!allResults) return [];
    const months = new Set<string>();
    allResults.forEach((r) => { if (r.date) months.add(r.date.substring(0, 7)); });
    return Array.from(months).sort().reverse();
  }, [allResults]);

  useEffect(() => { if (availableMonths.length > 0 && !selectedMonth) setSelectedMonth(availableMonths[0]); }, [availableMonths, selectedMonth]);

  const filteredResults = useMemo(() => { if (!selectedMonth || !allResults) return []; return allResults.filter((r) => r.date?.startsWith(selectedMonth)); }, [allResults, selectedMonth]);
  const filteredPlayerStats = useMemo(() => { if (!selectedMonth || !allPlayerStats) return []; return allPlayerStats.filter((s) => s.date?.startsWith(selectedMonth)); }, [allPlayerStats, selectedMonth]);
  
    const monthTeamRanking = useMemo((): any[] => { return buildTeamRanking(filteredResults, filteredPlayerStats as any); }, [filteredResults, filteredPlayerStats]);

  const previousMonthStr = useMemo(() => {
    if (!selectedMonth || selectedMonth.length < 7) return "";
    const [year, month] = selectedMonth.split("-").map(Number);
    const d = new Date(year, month - 2, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }, [selectedMonth]);

  const prevMonthResults = useMemo(() => { if (!previousMonthStr || !allResults) return []; return allResults.filter((r) => r.date?.startsWith(previousMonthStr)); }, [allResults, previousMonthStr]);
  const prevMonthPlayerStats = useMemo(() => { if (!previousMonthStr || !allPlayerStats) return []; return allPlayerStats.filter((s) => s.date?.startsWith(previousMonthStr)); }, [allPlayerStats, previousMonthStr]);
  const prevMonthTeamRanking = useMemo(() => { return buildTeamRanking(prevMonthResults, prevMonthPlayerStats as any); }, [prevMonthResults, prevMonthPlayerStats]);
  const pointsDeltaMap = useMemo(() => calcPointsVsPrevMonth(monthTeamRanking, prevMonthTeamRanking), [monthTeamRanking, prevMonthTeamRanking]);

  const enrichedRanking = useMemo(() => monthTeamRanking.map((t) => enrichTeam(t, "mensal", pointsDeltaMap.get(t.teamName.trim().toLowerCase()) ?? null)), [monthTeamRanking, pointsDeltaMap]);
  const sorted = useRankingSort(enrichedRanking, sortBy, sortDir);
  const finalRanking = useMemo(() => { if (!search.trim()) return sorted; const q = search.toLowerCase(); return sorted.filter((t) => t.teamName.toLowerCase().includes(q)); }, [sorted, search]);

  const monthTeamPlayers = useMemo(() => groupPlayersByTeam(filteredPlayerStats as any), [filteredPlayerStats]);
  const getTeamPlayers = (teamName: string): MergedPlayer[] => mergePlayersById(monthTeamPlayers.get(teamName.trim().toLowerCase()) ?? [], playersByName);

  const top3 = useMemo(() => (finalRanking.length >= 3 ? finalRanking.slice(0, 3) : []), [finalRanking]);
  const comparisonTeams = useMemo(() => sorted.filter((t) => selectedForCompare.has(t.teamName)), [sorted, selectedForCompare]);
  const totalXtreinosUnicos = useMemo(() => { const ids = new Set<number>(); filteredResults.forEach((r) => ids.add(r.xtreinoId)); return ids.size; }, [filteredResults]);

  const teamNameToIdMap = useMemo(() => {
    const map = new Map<string, { teamId: number; clanId: number | null }>();
    if (!teamsList) return map;
    for (const team of teamsList) map.set(team.name.trim().toLowerCase(), { teamId: team.id, clanId: team.clanId ?? null });
    return map;
  }, [teamsList]);

  const clearFilters = () => { setSearch(""); setSelectedMonth(availableMonths[0] ?? ""); clearCompare(); };

  return {
    isLoading, sortBy, sortDir, handleSort, search, setSearch, selectedMonth, setSelectedMonth,
    compareMode, setCompareMode, selectedForCompare, toggleCompare, clearCompare, expandedTeam, setExpandedTeam,
    availableMonths, filteredResults, finalRanking, top3, comparisonTeams, totalXtreinosUnicos,
    teamNameToIdMap, getTeamPlayers, monthTeamRanking, clearFilters,
    hasFilters: search.trim().length > 0 || sortBy !== "total" || compareMode,
  };
}

// --- HOOK DO RANKING SEMANAL ---
export function useRankingSemanalTab() {
  const { sortBy, sortDir, handleSort } = useSortState();
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState("");
  const { compareMode, setCompareMode, selected: selectedForCompare, toggle: toggleCompare, clear: clearCompare } = useCompareState();
  const [search, setSearch] = useState("");

  const { data: allResults } = trpc.xtreinos.listResults.useQuery();
  const { data: allPlayerStats } = trpc.xtreinos.listPlayerStats.useQuery();
  const { data: playersList } = trpc.players.list.useQuery();
  const { data: teamsList } = trpc.teams.list.useQuery();

  const isLoading = !allResults || !allPlayerStats;
  const playersByName = usePlayersByName(playersList);

  const availableWeeks = useMemo(() => {
    if (!allResults) return [];
    const weeks = new Set<string>();
    allResults.forEach((r) => { if (r.date) weeks.add(getWeekKey(r.date)); });
    return Array.from(weeks).sort().reverse();
  }, [allResults]);

  useEffect(() => { if (availableWeeks.length > 0 && !selectedWeek) setSelectedWeek(availableWeeks[0]); }, [availableWeeks, selectedWeek]);

  const filteredResults = useMemo(() => { if (!selectedWeek || !allResults) return []; return allResults.filter((r) => getWeekKey(r.date) === selectedWeek); }, [allResults, selectedWeek]);
  const filteredPlayerStats = useMemo(() => { if (!selectedWeek || !allPlayerStats) return []; return allPlayerStats.filter((s) => getWeekKey(s.date) === selectedWeek); }, [allPlayerStats, selectedWeek]);

  const weekTeamRanking = useMemo((): any[] => { return buildTeamRanking(filteredResults, filteredPlayerStats as any); }, [filteredResults, filteredPlayerStats]);
  const enrichedRanking = useMemo(() => weekTeamRanking.map((t) => enrichTeam(t, "semanal")), [weekTeamRanking]);
  
  const sorted = useRankingSort(enrichedRanking, sortBy, sortDir);
  const finalRanking = useMemo(() => { if (!search.trim()) return sorted; const q = search.toLowerCase(); return sorted.filter((t) => t.teamName.toLowerCase().includes(q)); }, [sorted, search]);

  const weekTeamPlayers = useMemo(() => groupPlayersByTeam(filteredPlayerStats as any), [filteredPlayerStats]);
  const getTeamPlayers = (teamName: string): MergedPlayer[] => mergePlayersById(weekTeamPlayers.get(teamName.trim().toLowerCase()) ?? [], playersByName);

  const top3 = useMemo(() => (finalRanking.length >= 3 ? finalRanking.slice(0, 3) : []), [finalRanking]);
  const comparisonTeams = useMemo(() => sorted.filter((t) => selectedForCompare.has(t.teamName)), [sorted, selectedForCompare]);
  const totalXtreinosUnicos = useMemo(() => { const ids = new Set<number>(); filteredResults.forEach((r) => ids.add(r.xtreinoId)); return ids.size; }, [filteredResults]);
  
  const weekDates = selectedWeek ? getWeekDates(selectedWeek) : null;

  const teamNameToIdMap = useMemo(() => {
    const map = new Map<string, { teamId: number; clanId: number | null }>();
    if (!teamsList) return map;
    for (const team of teamsList) map.set(team.name.trim().toLowerCase(), { teamId: team.id, clanId: team.clanId ?? null });
    return map;
  }, [teamsList]);

  const clearFilters = () => { setSearch(""); setSelectedWeek(availableWeeks[0] ?? ""); clearCompare(); };

  return {
    isLoading, sortBy, sortDir, handleSort, search, setSearch, selectedWeek, setSelectedWeek,
    compareMode, setCompareMode, selectedForCompare, toggleCompare, clearCompare, expandedTeam, setExpandedTeam,
    availableWeeks, filteredResults, finalRanking, top3, comparisonTeams, totalXtreinosUnicos,
    teamNameToIdMap, getTeamPlayers, weekTeamRanking, weekDates, clearFilters,
    hasFilters: search.trim().length > 0 || sortBy !== "total" || compareMode,
  };
}

// --- HOOK DO RANKING DE CLÃS ---
export function useRankingClasTab() {
  const { sortBy, sortDir, handleSort } = useSortState();
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const { compareMode, setCompareMode, selected: selectedForCompare, toggle: toggleCompare, clear: clearCompare } = useCompareState();
  const [search, setSearch] = useState("");

  const { data: allResults } = trpc.xtreinos.listResults.useQuery();
  const { data: allPlayerStats } = trpc.xtreinos.listPlayerStats.useQuery();
  const { data: playersList } = trpc.players.list.useQuery();
  const { data: clansList } = trpc.clans.list.useQuery();

  const isLoading = !allResults || !allPlayerStats || !clansList;
  const playersByName = usePlayersByName(playersList);
  const { teamPlayersGrouped } = useXtreinoCalculations({ results: allResults ?? [], playerStats: allPlayerStats ?? [] });

  const lineToClanMap = useMemo(() => {
    const map = new Map<string, string>();
    if (!clansList) return map;
    clansList.forEach((clan) => { clan.teams?.forEach((team) => { map.set(team.name.trim().toLowerCase(), clan.name); }); });
    return map;
  }, [clansList]);

  const clanNameToIdMap = useMemo(() => {
    const map = new Map<string, number>();
    if (!clansList) return map;
    clansList.forEach((clan) => { map.set(clan.name.trim().toLowerCase(), clan.id); });
    return map;
  }, [clansList]);

  const availableMonths = useMemo(() => {
    if (!allResults) return [];
    const months = new Set<string>();
    allResults.forEach((r) => { if (r.date) months.add(r.date.substring(0, 7)); });
    return Array.from(months).sort().reverse();
  }, [allResults]);

  const filteredResults = useMemo(() => { if (!selectedMonth || !allResults) return allResults ?? []; return allResults.filter((r) => r.date?.startsWith(selectedMonth)); }, [allResults, selectedMonth]);
  const filteredPlayerStats = useMemo(() => { if (!selectedMonth || !allPlayerStats) return allPlayerStats ?? []; return allPlayerStats.filter((s) => s.date?.startsWith(selectedMonth)); }, [allPlayerStats, selectedMonth]);

  const clanRankingRaw = useMemo(() => {
    const clanMap = new Map<string, any>();
    filteredResults.forEach((result) => {
      const teamKey = result.teamName.trim().toLowerCase();
      const clanName = lineToClanMap.get(teamKey) || "Lines Solos/Desconhecidas";
      if (!clanMap.has(clanName)) {
        clanMap.set(clanName, { teamName: clanName, totalPoints: 0, totalPosPoints: 0, totalKillPoints: 0, totalKills: 0, xtreinosPlayed: 0, lines: new Set<string>(), top1Count: 0, top2Count: 0, top3Count: 0, bestPosition: null, sumAllPositions: 0, countAllPositions: 0, pointsByDate: new Map<string, number>() });
      }
      const clan = clanMap.get(clanName);
      const matchPoints = calcPosPoints(result.q1Pos) + calcPosPoints(result.q2Pos) + calcPosPoints(result.q3Pos);
      clan.totalPosPoints += matchPoints; clan.xtreinosPlayed += 1; clan.lines.add(result.teamName);
      clan.pointsByDate.set(result.date || "unknown", (clan.pointsByDate.get(result.date || "unknown") || 0) + matchPoints);
      const positions = [result.q1Pos, result.q2Pos, result.q3Pos].filter((p): p is number => p !== null && p !== undefined);
      positions.forEach(pos => { if (pos === 1) clan.top1Count++; if (pos === 2) clan.top2Count++; if (pos === 3) clan.top3Count++; if (clan.bestPosition === null || pos < clan.bestPosition) clan.bestPosition = pos; clan.sumAllPositions += pos; clan.countAllPositions += 1; });
    });
    filteredPlayerStats.forEach((stat) => { const matchedClanName = lineToClanMap.get(stat.teamName.trim().toLowerCase()) || "Lines Solos/Desconhecidas"; if (clanMap.has(matchedClanName)) clanMap.get(matchedClanName).totalKills += stat.totalKills || 0; });
    const finalArray = Array.from(clanMap.values());
    finalArray.forEach(c => { c.lines = Array.from(c.lines); c.totalKillPoints = calcKillPoints(c.totalKills); c.totalPoints = c.totalPosPoints + c.totalKillPoints; c.avgPosition = c.countAllPositions > 0 ? Math.round((c.sumAllPositions / c.countAllPositions) * 10) / 10 : 0; const dateEntries = Array.from(c.pointsByDate.entries()) as [string, number][]; c.sparklineData = dateEntries.sort(([a], [b]) => a.localeCompare(b)).map(([, points]) => points); delete c.pointsByDate; });
    return finalArray;
  }, [filteredResults, filteredPlayerStats, lineToClanMap]);

  const enrichedRanking: EnrichedTeam[] = useMemo(() => clanRankingRaw.map(adaptClanToEnrichedTeam), [clanRankingRaw]);
  const sorted = useRankingSort(enrichedRanking, sortBy, sortDir);
  const finalRanking = useMemo(() => { if (!search.trim()) return sorted; const q = search.toLowerCase(); return sorted.filter((t) => t.teamName.toLowerCase().includes(q)); }, [sorted, search]);

  const getTeamPlayers = (clanName: string): MergedPlayer[] => {
    const clanData = clanRankingRaw.find(c => c.teamName === clanName);
    if (!clanData) return [];
    let allPlayers: any[] = [];
    clanData.lines.forEach((lineName: string) => { const players = teamPlayersGrouped.get(lineName.trim().toLowerCase()) ?? []; allPlayers = [...allPlayers, ...players]; });
    return mergePlayersById(allPlayers, playersByName);
  };

  const top3 = useMemo(() => (finalRanking.length >= 3 ? finalRanking.slice(0, 3) : []), [finalRanking]);
  const comparisonTeams = useMemo(() => sorted.filter((t) => selectedForCompare.has(t.teamName)), [sorted, selectedForCompare]);
  const totalXtreinosUnicos = useMemo(() => { const ids = new Set<number>(); filteredResults.forEach((r) => ids.add(r.xtreinoId)); return ids.size; }, [filteredResults]);
  const clearFilters = () => { setSearch(""); setSelectedMonth(""); clearCompare(); };
  
  return {
    isLoading, sortBy, sortDir, handleSort, search, setSearch, selectedMonth, setSelectedMonth,
    compareMode, setCompareMode, selectedForCompare, toggleCompare, clearCompare, expandedTeam, setExpandedTeam,
    availableMonths, filteredResults, finalRanking, top3, comparisonTeams, totalXtreinosUnicos,
    clanNameToIdMap, getTeamPlayers, clanRankingRaw, clearFilters,
    hasFilters: search.trim().length > 0 || sortBy !== "total" || compareMode || selectedMonth !== "",
  };
}