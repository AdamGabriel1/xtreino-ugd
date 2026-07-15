import { useState, useMemo } from "react";
import { trpc } from "@/providers/trpc";
import { type XtreinoPlayerStat } from "@/hooks/xtreinos/useXtreinoCalculations";
import { buildDuelData, TEAM_COLORS } from "@/utils/xtreino";
import { getMonthName, enrichTeam, buildTeamRanking, useSortState, useCompareState, useRankingSort } from "@/hooks/xtreinos/xtreino-shared";
import type { PlayerFullStats, ChartDataPoint, H2HMode } from "@/types/xtreinos";
import type { EnrichedTeam } from "@/hooks/xtreinos/xtreino-shared";
import { useXtreinoCalculations, calcPosPoints, calcKillPoints } from "@/hooks/xtreinos/useXtreinoCalculations";
import { calcPlayerAccumulatedStats } from "@/utils/xtreinoCalculations";
import { calcAvgPosition, calcTeamBadges } from "@/hooks/xtreinos/xtreino-shared";

// --- HOOK DO DUOLO ---
export function useDueloTab() {
  const [selectedXtId, setSelectedXtId] = useState<string>("");
  const [teamAName, setTeamAName] = useState<string>("");
  const [teamBName, setTeamBName] = useState<string>("");
  const { data: xtreinosList } = trpc.xtreinos.listResults.useQuery();
  const { data: allPlayerStats } = trpc.xtreinos.listPlayerStats.useQuery();
  const isLoading = !xtreinosList || !allPlayerStats;

  const xtOptions = useMemo(() => {
    if (!xtreinosList) return [];
    const uniqueXts = new Map<string, string>();
    xtreinosList.forEach((xt) => { if (!uniqueXts.has(xt.xtreinoId.toString())) uniqueXts.set(xt.xtreinoId.toString(), xt.date); });
    return Array.from(uniqueXts.entries()).map(([id, date]) => ({ value: id, label: `XT #${id} — ${date.split("-")[2]}/${date.split("-")[1]}` })).sort((a, b) => b.value.localeCompare(a.value));
  }, [xtreinosList]);

  const xtResults = useMemo(() => { if (!selectedXtId || !xtreinosList) return []; return xtreinosList.filter((r) => r.xtreinoId === parseInt(selectedXtId)); }, [xtreinosList, selectedXtId]);
  const xtPlayerStats = useMemo(() => { if (!selectedXtId || !allPlayerStats) return []; const xtDates = new Set(xtResults.map((r) => r.date)); return allPlayerStats.filter((s) => xtDates.has(s.date)); }, [allPlayerStats, xtResults, selectedXtId]);
  const availableTeams = useMemo(() => [...new Set(xtResults.map((r) => r.teamName))].sort(), [xtResults]);
  
  const teamAData = useMemo(() => { if (!teamAName || xtResults.length === 0) return null; return buildDuelData(teamAName, xtResults, xtPlayerStats); }, [teamAName, xtResults, xtPlayerStats]);
  const teamBData = useMemo(() => { if (!teamBName || xtResults.length === 0) return null; return buildDuelData(teamBName, xtResults, xtPlayerStats); }, [teamBName, xtResults, xtPlayerStats]);

  const handleClear = () => { setSelectedXtId(""); setTeamAName(""); setTeamBName(""); };
  const handleXtChange = (v: string) => { setSelectedXtId(v); setTeamAName(""); setTeamBName(""); };

  return { isLoading, selectedXtId, teamAName, teamBName, xtOptions, availableTeams, teamAData, teamBData, setTeamAName, setTeamBName, handleXtChange, handleClear, hasFilters: selectedXtId !== "" || teamAName !== "" || teamBName !== "" };
}

// --- HOOK DA EVOLUÇÃO ---
export function useEvolucaoTab() {
  const [search, setSearch] = useState("");
  const [selectedTeams, setSelectedTeams] = useState<Set<string>>(new Set());
  const [hiddenTeams, setHiddenTeams] = useState<Set<string>>(new Set());
  const { data: allResults } = trpc.xtreinos.listResults.useQuery();
  const { data: allPlayerStats } = trpc.xtreinos.listPlayerStats.useQuery();
  const isLoading = !allResults || !allPlayerStats;

  const months = useMemo(() => { if (!allResults) return []; const m = new Set<string>(); allResults.forEach((r) => { if (r.date) m.add(r.date.substring(0, 7)); }); return Array.from(m).sort(); }, [allResults]);

  const rankingByMonth = useMemo(() => {
    if (!allResults || !allPlayerStats) return new Map<string, EnrichedTeam[]>();
    const map = new Map<string, EnrichedTeam[]>();
    months.forEach((month) => {
      const mResults = allResults.filter((r) => r.date?.startsWith(month));
      const mStats = allPlayerStats.filter((s) => s.date?.startsWith(month));
      const baseRanking = buildTeamRanking(mResults, mStats as any);
      const enriched = baseRanking.map((t) => enrichTeam(t, "mensal"));
      map.set(month, enriched.sort((a, b) => b.totalPoints - a.totalPoints));
    });
    return map;
  }, [allResults, allPlayerStats, months]);

  const allTeams = useMemo(() => { const teamsSet = new Set<string>(); rankingByMonth.forEach((ranking) => ranking.forEach((t) => teamsSet.add(t.teamName))); return Array.from(teamsSet).sort(); }, [rankingByMonth]);
  const filteredTeams = useMemo(() => { if (!search.trim()) return allTeams; return allTeams.filter((t) => t.toLowerCase().includes(search.toLowerCase())); }, [allTeams, search]);

  const chartData = useMemo((): { points: ChartDataPoint[]; labels: string[] } => {
    if (selectedTeams.size === 0 || months.length === 0) return { points: [], labels: [] };
    const labels = months.map((m) => getMonthName(m));
    const points: ChartDataPoint[] = [];
    selectedTeams.forEach((teamName) => { months.forEach((month) => { const monthRanking = rankingByMonth.get(month) ?? []; const teamData = monthRanking.find((t) => t.teamName === teamName); points.push({ month, label: teamName, value: teamData?.totalPoints ?? 0 }); }); });
    return { points, labels };
  }, [selectedTeams, months, rankingByMonth]);

  const toggleTeam = (team: string) => { setSelectedTeams((prev) => { const next = new Set(prev); if (next.has(team)) { next.delete(team); setHiddenTeams((h) => { const nh = new Set(h); nh.delete(team); return nh; }); } else if (next.size < 5) { next.add(team); } return next; }); };
  const handleToggleVisibility = (team: string) => { setHiddenTeams((prev) => { const next = new Set(prev); if (next.has(team)) next.delete(team); else next.add(team); return next; }); };
  const clearFilters = () => { setSearch(""); setSelectedTeams(new Set()); setHiddenTeams(new Set()); };

  return { isLoading, search, setSearch, selectedTeams, hiddenTeams, filteredTeams, chartData, allTeams, toggleTeam, handleToggleVisibility, clearFilters, hasFilters: search.trim().length > 0 || selectedTeams.size > 0, teamColors: TEAM_COLORS };
}

// --- HOOK DO HEAD TO HEAD ---
export function useHeadToHeadTab() {
  const [mode, setMode] = useState<H2HMode>("xtreino");
  const [searchA, setSearchA] = useState(""); const [searchB, setSearchB] = useState("");
  const [playerAName, setPlayerAName] = useState(""); const [playerBName, setPlayerBName] = useState("");
  const { data: rawStatsData } = trpc.players.rankingStats.useQuery();
  const { data: scrimH2H, isLoading: isLoadingScrim } = trpc.scrims.getHeadToHead.useQuery({ team1Name: playerAName, team2Name: playerBName }, { enabled: mode === "scrim" && !!playerAName && !!playerBName });

  const rawStats = (rawStatsData ?? []) as XtreinoPlayerStat[];
  const isLoadingXT = !rawStatsData;
  const isLoading = mode === "xtreino" ? isLoadingXT : isLoadingScrim;

  const playerNames = useMemo(() => [...new Set(rawStats.map((s) => s.playerName))].sort(), [rawStats]);
  const filteredA = useMemo(() => playerNames.filter((n) => n.toLowerCase().includes(searchA.toLowerCase())), [playerNames, searchA]);
  const filteredB = useMemo(() => playerNames.filter((n) => n.toLowerCase().includes(searchB.toLowerCase()) && n !== playerAName), [playerNames, searchB, playerAName]);

  const accumulated = useMemo(() => calcPlayerAccumulatedStats(rawStats), [rawStats]);

  const getPlayerStats = (name: string): PlayerFullStats | null => {
    if (!name) return null;
    const base = accumulated.find((p) => p.playerName === name);
    if (!base) return null;
    const playerRawStats = rawStats.filter((s) => s.playerName === name);
    const sparkline = playerRawStats.sort((a, b) => a.date.localeCompare(b.date)).map((s) => s.totalKills);
    const badges: string[] = [];
    if (base.totalKills >= 100) badges.push("100 Kills"); if (base.totalKills >= 300) badges.push("300 Kills"); if (base.participations >= 10) badges.push("10 XTs"); if (base.avgKills >= 8) badges.push("Sniper"); if (base.avgKills >= 12) badges.push("Elite");
    return { playerName: base.playerName, teamName: base.teamName, totalKills: base.totalKills, totalQ1Kills: base.totalQ1Kills, totalQ2Kills: base.totalQ2Kills, totalQ3Kills: base.totalQ3Kills, participations: base.participations, avgKills: base.avgKills, bestPerformance: Math.max(...playerRawStats.map((s) => s.totalKills), 0), badges, sparkline, avgPerQuarter: { q1: base.participations > 0 ? Math.round((base.totalQ1Kills / base.participations) * 10) / 10 : 0, q2: base.participations > 0 ? Math.round((base.totalQ2Kills / base.participations) * 10) / 10 : 0, q3: base.participations > 0 ? Math.round((base.totalQ3Kills / base.participations) * 10) / 10 : 0 } };
  };

  const scrimStats = useMemo(() => {
    if (!scrimH2H || scrimH2H.length === 0) return null;
    let winsA = 0, winsB = 0, totalRoundsA = 0, totalRoundsB = 0;
    scrimH2H.forEach((match: any) => { const resA = match.results?.find((r: any) => r.teamName === playerAName); const resB = match.results?.find((r: any) => r.teamName === playerBName); const scoreA = resA?.rounds?.reduce((sum: number, r: any) => sum + (r.value || 0), 0) || 0; const scoreB = resB?.rounds?.reduce((sum: number, r: any) => sum + (r.value || 0), 0) || 0; if (scoreA > scoreB) winsA++; else if (scoreB > scoreA) winsB++; totalRoundsA += scoreA; totalRoundsB += scoreB; });
    return { winsA, winsB, totalRoundsA, totalRoundsB, matches: scrimH2H.length };
  }, [scrimH2H, playerAName, playerBName]);

  const handleClear = () => { setSearchA(""); setSearchB(""); setPlayerAName(""); setPlayerBName(""); };
  const selectPlayerA = (name: string) => { setPlayerAName(name); setSearchA(name); };
  const selectPlayerB = (name: string) => { setPlayerBName(name); setSearchB(name); };

  return { isLoading, mode, setMode, searchA, setSearchA, searchB, setSearchB, playerAName, playerBName, filteredA, filteredB, playerA: getPlayerStats(playerAName), playerB: getPlayerStats(playerBName), scrimStats, selectPlayerA, selectPlayerB, handleClear, hasFilters: playerAName !== "" || playerBName !== "" };
}

// --- HOOK DA PREDIÇÃO ---
export interface TeamPowerStats { teamName: string; rating: number; avgPoints: number; avgKills: number; avgPosition: number; consistency: number; xtreinosPlayed: number; }
export interface PredictionReason { text: string; winner: "A" | "B" | "Tie"; iconId: "trending-up" | "target" | "shield" | "alert-triangle"; }
export interface PredictionData { probA: number; probB: number; reasons: PredictionReason[]; winner: "A" | "B"; }

export function usePredicoesTab() {
  const [searchA, setSearchA] = useState(""); const [searchB, setSearchB] = useState("");
  const [teamA, setTeamA] = useState<string>(""); const [teamB, setTeamB] = useState<string>(""); const [showDetails, setShowDetails] = useState(false);
  const { data: allResults } = trpc.xtreinos.listResults.useQuery(); const { data: allPlayerStats } = trpc.xtreinos.listPlayerStats.useQuery();
  const isLoading = !allResults || !allPlayerStats;
  const { teamAccumulated } = useXtreinoCalculations({ results: allResults ?? [], playerStats: allPlayerStats ?? [] });

  const teamPowers = useMemo((): TeamPowerStats[] => {
    if (teamAccumulated.length === 0) return [];
    return teamAccumulated.map((t) => {
      const avgPoints = t.participations > 0 ? t.totalPoints / t.participations : 0; const avgKills = t.participations > 0 ? t.totalKills / t.participations : 0;
      const quartersPlayed = t.participations * 3; const avgPosPoints = quartersPlayed > 0 ? t.totalPosPoints / quartersPlayed : 0; const top3Rate = quartersPlayed > 0 ? (t.top3Count || 0) / quartersPlayed : 0;
      const normalizedPoints = (avgPoints / 60) * 100; const normalizedKills = Math.min((avgKills / 30) * 100, 100); const consistencyScore = top3Rate * 100;
      const rating = (normalizedPoints * 0.5) + (normalizedKills * 0.3) + (consistencyScore * 0.2);
      return { teamName: t.teamName, rating: Math.round(rating * 10) / 10, avgPoints: Math.round(avgPoints * 10) / 10, avgKills: Math.round(avgKills * 10) / 10, avgPosition: avgPosPoints, consistency: Math.round(top3Rate * 100), xtreinosPlayed: t.participations };
    }).sort((a, b) => b.rating - a.rating);
  }, [teamAccumulated]);

  const teamNames = useMemo(() => teamPowers.map((t) => t.teamName), [teamPowers]);
  const filteredA = useMemo(() => teamNames.filter((n) => n.toLowerCase().includes(searchA.toLowerCase())), [teamNames, searchA]);
  const filteredB = useMemo(() => teamNames.filter((n) => n.toLowerCase().includes(searchB.toLowerCase()) && n !== teamA), [teamNames, searchB, teamA]);
  const powerA = useMemo(() => teamPowers.find((t) => t.teamName === teamA), [teamPowers, teamA]);
  const powerB = useMemo(() => teamPowers.find((t) => t.teamName === teamB), [teamPowers, teamB]);

  const prediction = useMemo((): PredictionData | null => {
    if (!powerA || !powerB) return null;
    const diff = powerA.rating - powerB.rating; const probabilityA = 50 + (diff * 1.5); const probA = Math.max(10, Math.min(90, probabilityA)); const probB = 100 - probA;
    const reasons: PredictionReason[] = [];
    if (powerA.avgPoints > powerB.avgPoints) reasons.push({ text: `Maior média de pontos (${powerA.avgPoints} vs ${powerB.avgPoints})`, winner: "A", iconId: "trending-up" });
    else if (powerB.avgPoints > powerA.avgPoints) reasons.push({ text: `Maior média de pontos (${powerB.avgPoints} vs ${powerA.avgPoints})`, winner: "B", iconId: "trending-up" });
    if (powerA.avgKills > powerB.avgKills) reasons.push({ text: `Maior poder de eliminação (${powerA.avgKills} vs ${powerB.avgKills} kills/XT)`, winner: "A", iconId: "target" });
    else if (powerB.avgKills > powerA.avgKills) reasons.push({ text: `Maior poder de eliminação (${powerB.avgKills} vs ${powerA.avgKills} kills/XT)`, winner: "B", iconId: "target" });
    if (powerA.consistency > powerB.consistency + 10) reasons.push({ text: `Muito mais consistente no Top 3 (${powerA.consistency}% vs ${powerB.consistency}%)`, winner: "A", iconId: "shield" });
    else if (powerB.consistency > powerA.consistency + 10) reasons.push({ text: `Muito mais consistente no Top 3 (${powerB.consistency}% vs ${powerA.consistency}%)`, winner: "B", iconId: "shield" });
    if (Math.abs(powerA.xtreinosPlayed - powerB.xtreinosPlayed) > 5) reasons.push({ text: "Disparidade no número de XTs jogados (Dado pouco conclusivo)", winner: "Tie", iconId: "alert-triangle" });
    return { probA: Math.round(probA), probB: Math.round(probB), reasons, winner: probA > probB ? "A" : "B" };
  }, [powerA, powerB]);

  const handleClear = () => { setSearchA(""); setSearchB(""); setTeamA(""); setTeamB(""); setShowDetails(false); };
  const selectTeamA = (name: string) => { setTeamA(name); setSearchA(name); };
  const selectTeamB = (name: string) => { setTeamB(name); setSearchB(name); };

  return { isLoading, searchA, setSearchA, searchB, setSearchB, teamA, teamB, filteredA, filteredB, prediction, powerA, powerB, showDetails, setShowDetails, selectTeamA, selectTeamB, handleClear, hasFilters: !!teamA || !!teamB };
}

// --- HISTÓRICO, OUSADO, CARROSSEL, CROSSFIRE ---
export function useHistoricoGeralTab() {
  const [typeFilter, setTypeFilter] = useState<string>(""); const [limit, setLimit] = useState<number>(50);
  const { data: historyData, isLoading } = trpc.unified.listGeneralHistory.useQuery({ limit });
  const filteredHistory = useMemo(() => { if (!historyData) return []; if (!typeFilter) return historyData; return historyData.filter((event) => event.type === typeFilter); }, [historyData, typeFilter]);
  const groupedByDate = useMemo(() => { const groups = new Map<string, any[]>(); filteredHistory.forEach((event) => { const dayKey = event.date.split("T")[0]; if (!groups.has(dayKey)) groups.set(dayKey, []); groups.get(dayKey)!.push(event); }); return Array.from(groups.entries()).sort((a, b) => b[0].localeCompare(a[0])); }, [filteredHistory]);
  const handleClear = () => setTypeFilter(""); const loadMore = () => setLimit((prev) => prev + 50);
  return { isLoading, typeFilter, setTypeFilter, filteredHistory, groupedByDate, loadMore, handleClear, hasFilters: !!typeFilter };
}

export function usePredicoesOusadoTab() {
  const { data: allResults } = trpc.xtreinos.listResults.useQuery(); const { data: allPlayerStats } = trpc.xtreinos.listPlayerStats.useQuery();
  const months = useMemo(() => { if (!allResults) return []; const m = new Set<string>(); allResults.forEach((r) => { if (r.date) m.add(r.date.substring(0, 7)); }); return Array.from(m).sort(); }, [allResults]);
  const rankingByMonth = useMemo(() => { if (!allResults || !allPlayerStats) return new Map<string, EnrichedTeam[]>(); const map = new Map<string, EnrichedTeam[]>(); months.forEach((month) => { const mResults = allResults.filter((r) => r.date?.startsWith(month)); const mStats = allPlayerStats.filter((s) => s.date?.startsWith(month)); const baseRanking = buildTeamRanking(mResults, mStats as any); const enriched = baseRanking.map((t) => enrichTeam(t, "mensal")); map.set(month, enriched.sort((a, b) => b.totalPoints - a.totalPoints)); }); return map; }, [allResults, allPlayerStats, months]);
  const predictions = useMemo(() => { if (months.length < 3) return []; const lastMonth = months[months.length - 1]; const prevMonth = months[months.length - 2]; const prevPrevMonth = months[months.length - 3]; const lastRanking = rankingByMonth.get(lastMonth) ?? []; const prevRanking = rankingByMonth.get(prevMonth) ?? []; const prevPrevRanking = rankingByMonth.get(prevPrevMonth) ?? []; return lastRanking.slice(0, 5).map((team) => { const lastPts = team.totalPoints; const prevPts = prevRanking.find((t) => t.teamName === team.teamName)?.totalPoints ?? 0; const prevPrevPts = prevPrevRanking.find((t) => t.teamName === team.teamName)?.totalPoints ?? 0; const movingAvg = (lastPts + prevPts + prevPrevPts) / 3; const diff = lastPts - prevPts; const projection = Math.round(movingAvg + (diff * 0.5)); const trendLabel = diff > 20 ? "🔥 Em Alta" : diff < -20 ? "📉 Em Queda" : "➡️ Estável"; return { teamName: team.teamName, currentPts: lastPts, projectionPts: projection, minPts: Math.round(movingAvg * 0.9), maxPts: Math.round(movingAvg * 1.1), trendLabel }; }); }, [months, rankingByMonth]);
  return { isLoading: !allResults, predictions };
}

export function useMomentosCarousel() {
  const { data: allPlayerStats } = trpc.xtreinos.listPlayerStats.useQuery();
  const moments = useMemo(() => { if (!allPlayerStats) return []; const highlights: Array<{ id: string; title: string; subtitle: string; iconId: string; color: string }> = []; let maxKill = { playerName: "", totalKills: 0, date: "" }; allPlayerStats.forEach((s) => { if (s.totalKills > maxKill.totalKills) maxKill = { playerName: s.playerName, totalKills: s.totalKills, date: s.date }; }); if (maxKill.totalKills > 0) highlights.push({ id: "mk", title: "Maior Kill Stamp Individual", subtitle: `${maxKill.playerName} marcou ${maxKill.totalKills} kills em ${maxKill.date.split("-").reverse().slice(0, 2).join("/")}`, iconId: "target", color: "text-red-400 border-red-500/20 bg-red-500/5" }); let bestComeback = { playerName: "", diff: 0, date: "", total: 0 }; allPlayerStats.forEach((s) => { const firstHalf = s.q1Kills; const secondHalf = s.q2Kills + s.q3Kills; const diff = secondHalf - firstHalf; if (diff > bestComeback.diff) bestComeback = { playerName: s.playerName, diff, date: s.date, total: s.totalKills }; }); if (bestComeback.diff > 5) highlights.push({ id: "cb", title: "Maior Virada de Quarto", subtitle: `${bestComeback.playerName} fez +${bestComeback.diff} kills na segunda metade (${bestComeback.date.split("-").reverse().slice(0, 2).join("/")})`, iconId: "trophy", color: "text-yellow-400 border-yellow-500/20 bg-yellow-500/5" }); return highlights; }, [allPlayerStats]);
  return { moments };
}

export function useCrossfireTab() {
  const { data: allResults } = trpc.xtreinos.listResults.useQuery();
  const matchups = useMemo(() => { if (!allResults) return []; const map = new Map<string, { teamA: string; teamB: string; winsA: number; winsB: number; draws: number }>(); const xtDates = new Set(allResults.map((r) => r.xtreinoId)); xtDates.forEach((xtId) => { const xtResults = allResults.filter((r) => r.xtreinoId === xtId); const teams = xtResults.map((r) => r.teamName); for (let i = 0; i < teams.length; i++) { for (let j = i + 1; j < teams.length; j++) { const teamA = teams[i]; const teamB = teams[j]; const key = [teamA, teamB].sort().join(" vs "); const statsA = xtResults.find((r) => r.teamName === teamA); const statsB = xtResults.find((r) => r.teamName === teamB); if (!statsA || !statsB) continue; if (!map.has(key)) map.set(key, { teamA: [teamA, teamB].sort()[0], teamB: [teamA, teamB].sort()[1], winsA: 0, winsB: 0, draws: 0 }); const matchup = map.get(key)!; const isATeamA = matchup.teamA === teamA; const pointsA = statsA.totalPoints ?? 0; const pointsB = statsB.totalPoints ?? 0; if (pointsA > pointsB) { isATeamA ? matchup.winsA++ : matchup.winsB++; } else if (pointsB > pointsA) { isATeamA ? matchup.winsB++ : matchup.winsA++; } else { matchup.draws++; } } } }); return Array.from(map.values()).filter((m) => (m.winsA + m.winsB + m.draws) >= 2).sort((a, b) => (b.winsA + b.winsB) - (a.winsA + a.winsB)); }, [allResults]);
  return { isLoading: !allResults, matchups };
}

// --- HOOK DO X-TREINOS TAB (Adicionado) ---
function enrichXTreinoTeam(team: any): EnrichedTeam {
  const avgPos = calcAvgPosition(team);
  const badges = calcTeamBadges(team);

  return {
    teamName: team.teamName,
    xtreinosPlayed: 1,
    totalPoints: team.totalPoints || 0,
    totalPosPoints: team.totalPosPoints || 0,
    totalKillPoints: team.totalKillPoints || 0,
    totalKills: team.totalKills || 0,
    badges,
    top1Count: team.top1Count || 0,
    top2Count: team.top2Count || 0,
    top3Count: team.top3Count || 0,
    bestPosition: team.bestPosition || null,
    avgPosition: avgPos,
    consistency: 0,
    streak: 0,
    trend: "same" as const,
    sparkline: [team.totalPoints || 0], 
    xtreinos: [],
    bestPerformance: team.totalPoints || 0,
    worstPerformance: team.totalPoints || 0,
    pointsVsPrevMonth: null,
  };
}

export function useXTreinosTab() {
  const { sortBy, sortDir, handleSort } = useSortState();
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const {
    compareMode,
    setCompareMode,
    selected: selectedForCompare,
    toggle: toggleCompare,
    clear: clearCompare,
  } = useCompareState();
  const [search, setSearch] = useState("");

  const { data: allResults } = trpc.xtreinos.listResults.useQuery();
  const { data: allPlayerStats } = trpc.xtreinos.listPlayerStats.useQuery();

  const isLoading = !allResults || !allPlayerStats;

  const availableMonths = useMemo(() => {
    if (!allResults) return [];
    const months = new Set<string>();
    allResults.forEach((r) => { if (r.date) months.add(r.date.substring(0, 7)); });
    return Array.from(months).sort().reverse();
  }, [allResults]);

  const availableDates = useMemo(() => {
    if (!selectedMonth || !allResults) return [];
    const dates = new Set<string>();
    allResults.forEach((r) => { if (r.date?.startsWith(selectedMonth)) dates.add(r.date); });
    return Array.from(dates).sort().reverse();
  }, [allResults, selectedMonth]);

  const filteredResults = useMemo(() => {
    if (!allResults) return [];
    if (selectedDate) return allResults.filter((r) => r.date === selectedDate);
    if (selectedMonth) return allResults.filter((r) => r.date?.startsWith(selectedMonth));
    return allResults;
  }, [allResults, selectedMonth, selectedDate]);

  const filteredPlayerStats = useMemo(() => {
    if (!allPlayerStats) return [];
    if (selectedDate) return allPlayerStats.filter((s) => s.date === selectedDate);
    if (selectedMonth) return allPlayerStats.filter((s) => s.date?.startsWith(selectedMonth));
    return allPlayerStats;
  }, [allPlayerStats, selectedMonth, selectedDate]);

  const baseRanking = useMemo(
    () => buildTeamRanking(filteredResults, filteredPlayerStats as any),
    [filteredResults, filteredPlayerStats]
  );

  const isAccumulated = !selectedMonth && !selectedDate;

  const enrichedRanking = useMemo(() => {
    if (isAccumulated) {
      return baseRanking.map((t) => enrichTeam(t, "geral"));
    }
    return baseRanking.map((t) => {
      const raw = filteredResults.find((r) => r.teamName === t.teamName);
      return {
        ...enrichXTreinoTeam(t),
        date: raw?.date || "",
        q1Pos: raw?.q1Pos ?? null,
        q2Pos: raw?.q2Pos ?? null,
        q3Pos: raw?.q3Pos ?? null,
      };
    });
  }, [baseRanking, isAccumulated, filteredResults]);

  const sorted = useRankingSort(enrichedRanking, sortBy, sortDir);

  const sortedStats = useMemo(() => {
    if (!search.trim()) return sorted;
    const q = search.toLowerCase();
    return sorted.filter((t) => t.teamName.toLowerCase().includes(q));
  }, [sorted, search]);

  const top3 = useMemo(() => (sortedStats.length >= 3 ? sortedStats.slice(0, 3) : []), [sortedStats]);
  
  const comparisonTeams = useMemo(
    () => sorted.filter((t) => selectedForCompare.has(t.teamName)),
    [sorted, selectedForCompare]
  );

  const getTeamPlayers = (teamName: string, date?: string) => {
    const stats = date 
      ? filteredPlayerStats.filter((s) => s.teamName === teamName && s.date === date)
      : filteredPlayerStats.filter((s) => s.teamName === teamName);
      
    return stats.map((p) => ({
      playerName: p.playerName,
      totalKills: p.totalKills,
      q1Kills: p.q1Kills,
      q2Kills: p.q2Kills,
      q3Kills: p.q3Kills,
    }));
  };

  const scheduleList = useMemo(() => {
    if (!allResults) return [];
    const uniqueXts = new Map<number, { id: number; date: string; status: string }>();
    allResults.forEach((r) => {
      if (!uniqueXts.has(r.xtreinoId)) {
        uniqueXts.set(r.xtreinoId, { id: r.xtreinoId, date: r.date, status: "scheduled" });
      }
    });
    return Array.from(uniqueXts.values())
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((s) => ({
        ...s,
        dayOfWeek: new Date(s.date + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "short" }),
        timeBr: "20:00",
      }));
  }, [allResults]);

  const periodSummary = useMemo(() => {
    if (sortedStats.length === 0) return null;
    return {
      uniqueTeams: new Set(sortedStats.map((t) => t.teamName)).size,
      totalKills: sortedStats.reduce((sum, t) => sum + t.totalKills, 0),
      totalPosPoints: sortedStats.reduce((sum, t) => sum + t.totalPosPoints, 0),
      totalPoints: sortedStats.reduce((sum, t) => sum + t.totalPoints, 0),
    };
  }, [sortedStats]);

  const clearFilters = () => {
    setSearch("");
    setSelectedMonth("");
    setSelectedDate("");
    clearCompare();
  };

  return {
    isLoading,
    isAccumulated,
    sortBy,
    sortDir,
    handleSort,
    selectedMonth,
    setSelectedMonth,
    selectedDate,
    setSelectedDate,
    search,
    setSearch,
    compareMode,
    setCompareMode,
    selectedForCompare,
    toggleCompare,
    clearCompare,
    expandedTeam,
    setExpandedTeam,
    sortedStats,
    top3,
    comparisonTeams,
    getTeamPlayers,
    scheduleList,
    periodSummary,
    clearFilters,
    availableMonths,
    availableDates,
    hasFilters: search.trim().length > 0 || !!selectedMonth || !!selectedDate || compareMode,
  };
}