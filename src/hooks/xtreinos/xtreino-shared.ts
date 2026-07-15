import { useState, useMemo } from "react";
import { XTREINO_POSITION_POINTS as POSITION_POINTS, XTREINO_KILL_POINTS as KILL_POINTS } from "@/constants/gameRules";

// ============================================================
// TIPOS
// ============================================================

export interface MergedPlayer {
  id: number;
  nickname: string;
  playerName: string;
  totalKills: number;
  totalQ1Kills: number;
  totalQ2Kills: number;
  totalQ3Kills: number;
  participations: number;
  previousNicks: string[];
  avgKills: number;
}

export interface TeamXtreinoHistory {
  date: string;
  xtreinoId: number;
  q1Pos: number | null;
  q2Pos: number | null;
  q3Pos: number | null;
  totalPosPoints: number;
  totalKills: number;
  totalKillPoints: number;
  totalPoints: number;
}

export interface EnrichedTeam {
  teamName: string;
  totalPoints: number;
  totalKills: number;
  totalKillPoints: number;
  totalPosPoints: number;
  xtreinosPlayed: number;
  top1Count: number;
  top2Count: number;
  top3Count: number;
  bestPosition: number | null;
  xtreinos: TeamXtreinoHistory[];
  sparkline: number[];
  streak: number;
  badges: string[];
  bestPerformance: number;
  worstPerformance: number;
  avgPosition: number;
  trend: "up" | "down" | "same";
  consistency: number;
  pointsVsPrevMonth: number | null;
}

export type SortField =
  | "total"
  | "kills"
  | "pos"
  | "xtreinos"
  | "avgPos"
  | "consistency"
  | "streak";

export interface BadgeThreshold {
  label: string;
  check: (team: EnrichedTeam) => boolean;
}

// ============================================================
// BADGES POR PERÍODO
// ============================================================

export const BADGE_THRESHOLDS: Record<"geral" | "mensal" | "semanal", BadgeThreshold[]> = {
  geral: [
    { label: "100 Kills", check: (t) => t.totalKills >= 100 },
    { label: "300 Kills", check: (t) => t.totalKills >= 300 },
    { label: "500 Kills", check: (t) => t.totalKills >= 500 },
    { label: "3x Campeao", check: (t) => t.top1Count >= 3 },
    { label: "5x Campeao", check: (t) => t.top1Count >= 5 },
    { label: "10x Campeao", check: (t) => t.top1Count >= 10 },
    { label: "Top 3 Regular", check: (t) => t.top1Count + t.top2Count + t.top3Count >= 10 },
    { label: "Veterano", check: (t) => t.xtreinosPlayed >= 10 },
    { label: "Lenda", check: (t) => t.xtreinosPlayed >= 20 },
    { label: "Elite", check: (t) => t.avgPosition > 0 && t.avgPosition <= 3 },
    { label: "Consistente", check: (t) => t.consistency > 0 && t.consistency <= 2 },
  ],
  mensal: [
    { label: "50 Kills", check: (t) => t.totalKills >= 50 },
    { label: "100 Kills", check: (t) => t.totalKills >= 100 },
    { label: "200 Kills", check: (t) => t.totalKills >= 200 },
    { label: "2x Campeao", check: (t) => t.top1Count >= 2 },
    { label: "5x Campeao", check: (t) => t.top1Count >= 5 },
    { label: "Top 3 Regular", check: (t) => t.top1Count + t.top2Count + t.top3Count >= 5 },
    { label: "Veterano", check: (t) => t.xtreinosPlayed >= 5 },
    { label: "Lenda", check: (t) => t.xtreinosPlayed >= 10 },
    { label: "Elite", check: (t) => t.avgPosition > 0 && t.avgPosition <= 3 },
    { label: "Consistente", check: (t) => t.consistency > 0 && t.consistency <= 2 },
  ],
  semanal: [
    { label: "20 Kills", check: (t) => t.totalKills >= 20 },
    { label: "50 Kills", check: (t) => t.totalKills >= 50 },
    { label: "100 Kills", check: (t) => t.totalKills >= 100 },
    { label: "Campeao", check: (t) => t.top1Count >= 1 },
    { label: "3x Campeao", check: (t) => t.top1Count >= 3 },
    { label: "Top 3 Regular", check: (t) => t.top1Count + t.top2Count + t.top3Count >= 3 },
    { label: "Veterano", check: (t) => t.xtreinosPlayed >= 3 },
    { label: "Lenda", check: (t) => t.xtreinosPlayed >= 5 },
    { label: "Elite", check: (t) => t.avgPosition > 0 && t.avgPosition <= 3 },
    { label: "Consistente", check: (t) => t.consistency > 0 && t.consistency <= 2 },
  ],
};

// ============================================================
// ESTILOS
// ============================================================

export function getPosColor(pos: number | null): string {
  if (!pos) return "text-[#5a5a6e]";
  if (pos === 1) return "text-yellow-400 font-bold";
  if (pos === 2) return "text-gray-300 font-bold";
  if (pos === 3) return "text-amber-500 font-bold";
  return "text-[#8a8a9e]";
}

export function getPosBg(pos: number | null): string {
  if (!pos) return "";
  if (pos === 1) return "bg-yellow-500/10";
  if (pos === 2) return "bg-gray-400/10";
  if (pos === 3) return "bg-amber-500/10";
  return "";
}

export function getRankStyle(index: number): string {
  if (index === 0) return "bg-yellow-500/5 border-l-2 border-yellow-500";
  if (index === 1) return "bg-gray-400/5 border-l-2 border-gray-400";
  if (index === 2) return "bg-amber-500/5 border-l-2 border-amber-500";
  return "border-l-2 border-transparent";
}

// ============================================================
// CALCULOS
// ============================================================

export function calcTeamSparkline(team: EnrichedTeam): number[] {
  return team.xtreinos.sort((a, b) => a.date.localeCompare(b.date)).map((x) => x.totalPoints);
}

export function calcTeamStreak(team: EnrichedTeam): number {
  return team.xtreinosPlayed;
}

export function calcTeamBadges(team: EnrichedTeam, period: "geral" | "mensal" | "semanal" = "geral"): string[] {
  return BADGE_THRESHOLDS[period].filter((b) => b.check(team)).map((b) => b.label);
}

export function calcAvgPosition(team: EnrichedTeam): number {
  const positions: number[] = [];
  team.xtreinos.forEach((x) => {
    if (x.q1Pos) positions.push(x.q1Pos);
    if (x.q2Pos) positions.push(x.q2Pos);
    if (x.q3Pos) positions.push(x.q3Pos);
  });
  if (!positions.length) return 0;
  return Math.round((positions.reduce((a, b) => a + b, 0) / positions.length) * 10) / 10;
}

export function calcConsistency(team: EnrichedTeam): number {
  if (team.xtreinos.length < 2) return 0;
  const totals = team.xtreinos.map((x) => x.totalPoints);
  const avg = totals.reduce((a, b) => a + b, 0) / totals.length;
  const variance = totals.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / totals.length;
  return Math.round(Math.sqrt(variance) * 10) / 10;
}

export function calcTrend(team: EnrichedTeam): "up" | "down" | "same" {
  const sorted = team.xtreinos.sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length < 2) return "same";
  const last = sorted[sorted.length - 1].totalPoints;
  const prev = sorted[sorted.length - 2].totalPoints;
  if (last > prev) return "up";
  if (last < prev) return "down";
  return "same";
}

export function calcBestPerformance(team: EnrichedTeam): number {
  if (!team.xtreinos.length) return 0;
  return Math.max(...team.xtreinos.map((x) => x.totalPoints));
}

export function calcWorstPerformance(team: EnrichedTeam): number {
  if (!team.xtreinos.length) return 0;
  return Math.min(...team.xtreinos.map((x) => x.totalPoints));
}

export function enrichTeam(
  base: {
    teamName: string;
    totalPoints: number;
    totalKills: number;
    totalKillPoints: number;
    totalPosPoints: number;
    xtreinosPlayed: number;
    top1Count: number;
    top2Count: number;
    top3Count: number;
    bestPosition: number | null;
    xtreinos: TeamXtreinoHistory[];
  },
  period: "geral" | "mensal" | "semanal" = "geral",
  pointsVsPrevMonth?: number | null // NOVO PARÂMETRO
): EnrichedTeam {
  const enriched: EnrichedTeam = {
    ...base,
    sparkline: calcTeamSparkline(base as EnrichedTeam),
    streak: calcTeamStreak(base as EnrichedTeam),
    badges: [],
    bestPerformance: calcBestPerformance(base as EnrichedTeam),
    worstPerformance: calcWorstPerformance(base as EnrichedTeam),
    avgPosition: calcAvgPosition(base as EnrichedTeam),
    trend: calcTrend(base as EnrichedTeam),
    consistency: calcConsistency(base as EnrichedTeam),
    pointsVsPrevMonth: pointsVsPrevMonth ?? null, // ATRIBUIÇÃO NOVA
  };
  enriched.badges = calcTeamBadges(enriched, period);
  return enriched;
}

// ============================================================
// CALCULO DE VARIAÇÃO VS MÊS ANTERIOR
// ============================================================

export function calcPointsVsPrevMonth(
  currentMonthRanking: TeamRankingBase[],
  prevMonthRanking: TeamRankingBase[]
): Map<string, number> {
  const prevMap = new Map<string, number>();
  prevMonthRanking.forEach((t) => {
    prevMap.set(t.teamName.trim().toLowerCase(), t.totalPoints);
  });

  const deltaMap = new Map<string, number>();
  currentMonthRanking.forEach((t) => {
    const key = t.teamName.trim().toLowerCase();
    const prevPoints = prevMap.get(key);
    if (prevPoints !== undefined) {
      deltaMap.set(key, t.totalPoints - prevPoints);
    } else {
      deltaMap.set(key, 0); // Time novo no mês, variação neutra
    }
  });

  return deltaMap;
}

// ============================================================
// DATAS
// ============================================================

export function getMonthName(monthStr: string): string {
  const [, month] = monthStr.split("-");
  const monthNames = ["Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  return `${monthNames[parseInt(month) - 1]} de ${monthStr.split("-")[0]}`;
}

export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function getWeekKey(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const year = date.getFullYear();
  const week = getWeekNumber(date);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

export function getWeekLabel(weekKey: string): string {
  const [year, weekStr] = weekKey.split("-W");
  return `Semana ${parseInt(weekStr)} de ${year}`;
}

export function getWeekDates(weekKey: string): { start: string; end: string } {
  const [yearStr, weekStr] = weekKey.split("-W");
  const year = parseInt(yearStr);
  const week = parseInt(weekStr);
  const jan4 = new Date(year, 0, 4);
  const jan4Day = jan4.getDay() || 7;
  const firstMonday = new Date(year, 0, 4 - jan4Day + 1);
  const weekStart = new Date(firstMonday);
  weekStart.setDate(firstMonday.getDate() + (week - 1) * 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const fmt = (d: Date) => `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
  return { start: fmt(weekStart), end: fmt(weekEnd) };
}

// ============================================================
// MERGE JOGADORES
// ============================================================

export function mergePlayersById(
  players: Array<{ playerName: string; totalKills: number; totalQ1Kills: number; totalQ2Kills: number; totalQ3Kills: number; participations: number }>,
  playersByName: Map<string, { id: number; nickname: string; previousNicks: string[] }>
): MergedPlayer[] {
  const mergedMap = new Map<number, { id: number; nickname: string; playerName: string; totalKills: number; totalQ1Kills: number; totalQ2Kills: number; totalQ3Kills: number; participations: number; previousNicks: string[] }>();
  for (const player of players) {
    const info = playersByName.get(player.playerName.trim().toLowerCase());
    const id = info?.id ?? -Math.abs(player.playerName.toLowerCase().split("").reduce((a, b) => a + b.charCodeAt(0), 0));
    const nickname = info?.nickname ?? player.playerName;
    const previousNicks = info?.previousNicks ?? [];
    const existing = mergedMap.get(id);
    if (existing) {
      existing.totalKills += player.totalKills;
      existing.totalQ1Kills += player.totalQ1Kills;
      existing.totalQ2Kills += player.totalQ2Kills;
      existing.totalQ3Kills += player.totalQ3Kills;
      existing.participations += player.participations;
    } else {
      mergedMap.set(id, { id, nickname, playerName: nickname, totalKills: player.totalKills, totalQ1Kills: player.totalQ1Kills, totalQ2Kills: player.totalQ2Kills, totalQ3Kills: player.totalQ3Kills, participations: player.participations, previousNicks });
    }
  }
  return Array.from(mergedMap.values())
    .map((p) => ({ ...p, avgKills: p.participations > 0 ? Math.round((p.totalKills / p.participations) * 10) / 10 : 0 }))
    .sort((a, b) => b.totalKills - a.totalKills);
}

// ============================================================
// HOOKS
// ============================================================

export function usePlayersByName(playersList: Array<{ id: number; nickname: string; previousNicks?: string[] }> | undefined) {
  return useMemo(() => {
    const map = new Map<string, { id: number; nickname: string; previousNicks: string[] }>();
    if (!playersList) return map;
    for (const p of playersList) {
      const entry = { id: p.id, nickname: p.nickname, previousNicks: p.previousNicks ?? [] };
      map.set(p.nickname.trim().toLowerCase(), entry);
      for (const nick of entry.previousNicks) map.set(nick.trim().toLowerCase(), entry);
    }
    return map;
  }, [playersList]);
}

export interface RawPlayerStat {
  date: string;
  teamName: string;
  playerName: string;
  totalKills: number;
  q1Kills: number;
  q2Kills: number;
  q3Kills: number;
}

export interface TeamRankingBase {
  teamName: string;
  totalPoints: number;
  totalKills: number;
  totalKillPoints: number;
  totalPosPoints: number;
  xtreinosPlayed: number;
  top1Count: number;
  top2Count: number;
  top3Count: number;
  bestPosition: number | null;
  xtreinos: TeamXtreinoHistory[];
}

export function buildTeamRanking(
  results: Array<{ xtreinoId: number; date: string; teamName: string; q1Pos: number | null; q2Pos: number | null; q3Pos: number | null }>,
  playerStats: RawPlayerStat[]
): TeamRankingBase[] {
  const map = new Map<string, TeamRankingBase>();
  for (const result of results) {
    const teamKills = playerStats.filter((p) => p.teamName === result.teamName && p.date === result.date).reduce((sum, p) => sum + (p.totalKills || 0), 0);
    const totalPosPoints = (POSITION_POINTS[result.q1Pos ?? 0] ?? 0) + (POSITION_POINTS[result.q2Pos ?? 0] ?? 0) + (POSITION_POINTS[result.q3Pos ?? 0] ?? 0);
    const totalKillPoints = teamKills * KILL_POINTS;
    const totalPoints = totalPosPoints + totalKillPoints;
    const historyItem: TeamXtreinoHistory = { date: result.date, xtreinoId: result.xtreinoId, q1Pos: result.q1Pos, q2Pos: result.q2Pos, q3Pos: result.q3Pos, totalPosPoints, totalKills: teamKills, totalKillPoints, totalPoints };
    const existing = map.get(result.teamName);
    if (!existing) {
      const positions = [result.q1Pos, result.q2Pos, result.q3Pos].filter((p): p is number => p !== null && p !== undefined);
      const bestPos = positions.length > 0 ? Math.min(...positions) : null;
      const podiums = [result.q1Pos, result.q2Pos, result.q3Pos];
      map.set(result.teamName, { teamName: result.teamName, totalPoints, totalKills: teamKills, totalKillPoints, totalPosPoints, xtreinosPlayed: 1, top1Count: podiums.filter((p) => p === 1).length, top2Count: podiums.filter((p) => p === 2).length, top3Count: podiums.filter((p) => p === 3).length, bestPosition: bestPos, xtreinos: [historyItem] });
    } else {
      existing.totalPoints += totalPoints;
      existing.totalKills += teamKills;
      existing.totalKillPoints += totalKillPoints;
      existing.totalPosPoints += totalPosPoints;
      existing.xtreinosPlayed += 1;
      const podiums = [result.q1Pos, result.q2Pos, result.q3Pos];
      existing.top1Count += podiums.filter((p) => p === 1).length;
      existing.top2Count += podiums.filter((p) => p === 2).length;
      existing.top3Count += podiums.filter((p) => p === 3).length;
      const positions = [result.q1Pos, result.q2Pos, result.q3Pos].filter((p): p is number => p !== null && p !== undefined);
      if (positions.length > 0) { const minPos = Math.min(...positions); existing.bestPosition = existing.bestPosition ? Math.min(existing.bestPosition, minPos) : minPos; }
      existing.xtreinos.push(historyItem);
    }
  }
  return Array.from(map.values());
}

export function groupPlayersByTeam(playerStats: RawPlayerStat[]): Map<string, MergedPlayer[]> {
  const teamMap = new Map<string, Map<string, { playerName: string; totalKills: number; totalQ1Kills: number; totalQ2Kills: number; totalQ3Kills: number; participations: number; avgKills: number }>>();
  for (const stat of playerStats) {
    const teamKey = stat.teamName.trim().toLowerCase();
    const playerKey = stat.playerName.trim().toLowerCase();
    if (!teamMap.has(teamKey)) teamMap.set(teamKey, new Map());
    const playerMap = teamMap.get(teamKey)!;
    const existing = playerMap.get(playerKey);
    if (existing) {
      existing.totalKills += stat.totalKills || 0;
      existing.totalQ1Kills += stat.q1Kills || 0;
      existing.totalQ2Kills += stat.q2Kills || 0;
      existing.totalQ3Kills += stat.q3Kills || 0;
      existing.participations += 1;
    } else {
      playerMap.set(playerKey, { playerName: stat.playerName, totalKills: stat.totalKills || 0, totalQ1Kills: stat.q1Kills || 0, totalQ2Kills: stat.q2Kills || 0, totalQ3Kills: stat.q3Kills || 0, participations: 1, avgKills: 0 });
    }
  }
  const result = new Map<string, MergedPlayer[]>();
  for (const [teamName, playerMap] of teamMap) {
    const players = Array.from(playerMap.values()).map((p) => ({ ...p, id: 0, nickname: p.playerName, previousNicks: [] as string[], avgKills: p.participations > 0 ? Math.round((p.totalKills / p.participations) * 10) / 10 : 0 }));
    result.set(teamName, players);
  }
  return result;
}

export function useRankingSort(data: EnrichedTeam[], sortBy: SortField, sortDir: "asc" | "desc"): EnrichedTeam[] {
  return useMemo(() => {
    return [...data].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "kills": comparison = a.totalKills - b.totalKills; break;
        case "pos": comparison = a.totalPosPoints - b.totalPosPoints; break;
        case "xtreinos": comparison = a.xtreinosPlayed - b.xtreinosPlayed; break;
        case "avgPos": comparison = a.avgPosition - b.avgPosition; break;
        case "consistency": comparison = a.consistency - b.consistency; break;
        case "streak": comparison = a.streak - b.streak; break;
        default: comparison = a.totalPoints - b.totalPoints; break;
      }
      return sortDir === "desc" ? -comparison : comparison;
    });
  }, [data, sortBy, sortDir]);
}

export function useCompareState(maxItems = 4) {
  const [compareMode, setCompareMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const toggle = (name: string) => { setSelected((prev) => { const next = new Set(prev); if (next.has(name)) next.delete(name); else if (next.size < maxItems) next.add(name); return next; }); };
  const clear = () => { setSelected(new Set()); setCompareMode(false); };
  return { compareMode, setCompareMode, selected, toggle, clear };
}

export function useSortState(defaultField: SortField = "total") {
  const [sortBy, setSortBy] = useState<SortField>(defaultField);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const handleSort = (field: SortField) => { if (sortBy === field) { setSortDir((d) => (d === "desc" ? "asc" : "desc")); } else { setSortBy(field); setSortDir("desc"); } };
  return { sortBy, setSortBy, sortDir, setSortDir, handleSort };
}

export function useSearchFilter(data: EnrichedTeam[]) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => { if (!search.trim()) return data; const q = search.toLowerCase(); return data.filter((t) => t.teamName.toLowerCase().includes(q)); }, [data, search]);
  return { search, setSearch, filtered };
}