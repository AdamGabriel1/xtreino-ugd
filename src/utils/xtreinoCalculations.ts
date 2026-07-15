// src/utils/xtreinoCalculations.ts
import { XTREINO_POSITION_POINTS, XTREINO_KILL_POINTS } from "@/constants/gameRules";

// ============================================================
// TIPOS
// ============================================================
export interface XtreinoResult {
  id: number;
  xtreinoId: number;
  date: string;
  teamName: string;
  q1Pos: number | null;
  q2Pos: number | null;
  q3Pos: number | null;
  totalPoints: number | null;
}

export interface XtreinoPlayerStat {
  id: number;
  xtreinoId: number;
  date: string;
  teamName: string;
  playerName: string;
  q1Kills: number;
  q2Kills: number;
  q3Kills: number;
  totalKills: number;
}

export interface XtreinoEvent {
  id: number;
  name: string;
  date: string;
  status: string;
  maxTeams: number;
}

export interface TeamXtreinoStats {
  teamName: string;
  date: string;
  xtreinoId: number;
  q1Pos: number | null;
  q2Pos: number | null;
  q3Pos: number | null;
  q1PosPoints: number;
  q2PosPoints: number;
  q3PosPoints: number;
  totalPosPoints: number;
  q1Kills: number;
  q2Kills: number;
  q3Kills: number;
  totalKills: number;
  totalKillPoints: number;
  totalPoints: number;
}

export interface PlayerXtreinoStats {
  playerName: string;
  teamName: string;
  date: string;
  xtreinoId: number;
  q1Kills: number;
  q2Kills: number;
  q3Kills: number;
  totalKills: number;
  killPoints: number;
}

export interface PlayerAccumulatedStats {
  playerName: string;
  teamName: string | null;
  totalKills: number;
  totalQ1Kills: number;
  totalQ2Kills: number;
  totalQ3Kills: number;
  participations: number;
  avgKills: number;
  xtreinoDates: string[];
}

export interface TeamAccumulatedStats {
  top3Count: number;
  teamName: string;
  totalPosPoints: number;
  totalQ1PosPoints: number;
  totalQ2PosPoints: number;
  totalQ3PosPoints: number;
  totalKills: number;
  totalKillPoints: number;
  totalPoints: number;
  participations: number;
  avgPoints: number;
  xtreinoDates: string[];
}

export interface TeamRankingHistoryItem {
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

export interface TeamRankingStats {
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
  xtreinos: TeamRankingHistoryItem[];
}

export interface TeamPlayerGrouped {
  playerName: string;
  totalKills: number;
  totalQ1Kills: number;
  totalQ2Kills: number;
  totalQ3Kills: number;
  participations: number;
  avgKills: number;
}

// ============================================================
// FUNÇÕES DE CÁLCULO PURAS
// ============================================================

/** Calcula pontos de posição para uma queda */
export function calcPosPoints(pos: number | null): number {
  if (!pos || pos <= 0) return 0;
  return XTREINO_POSITION_POINTS[pos] ?? 0;
}

/** Calcula pontos por kills */
export function calcKillPoints(kills: number): number {
  return (kills || 0) * XTREINO_KILL_POINTS;
}

/** Calcula stats completas de um time em um xtreino */
export function calcTeamXtreinoStats(
  result: XtreinoResult,
  playerStats: XtreinoPlayerStat[]
): TeamXtreinoStats {
  const teamPlayerStats = playerStats.filter(
    (p) => p.teamName === result.teamName && p.date === result.date
  );

  const q1Kills = teamPlayerStats.reduce((sum, p) => sum + (p.q1Kills || 0), 0);
  const q2Kills = teamPlayerStats.reduce((sum, p) => sum + (p.q2Kills || 0), 0);
  const q3Kills = teamPlayerStats.reduce((sum, p) => sum + (p.q3Kills || 0), 0);
  const totalKills = teamPlayerStats.reduce((sum, p) => sum + (p.totalKills || 0), 0);

  const q1PosPoints = calcPosPoints(result.q1Pos);
  const q2PosPoints = calcPosPoints(result.q2Pos);
  const q3PosPoints = calcPosPoints(result.q3Pos);
  const totalPosPoints = q1PosPoints + q2PosPoints + q3PosPoints;

  const totalKillPoints = calcKillPoints(totalKills);
  const totalPoints = totalPosPoints + totalKillPoints;

  return {
    teamName: result.teamName, date: result.date, xtreinoId: result.xtreinoId,
    q1Pos: result.q1Pos, q2Pos: result.q2Pos, q3Pos: result.q3Pos,
    q1PosPoints, q2PosPoints, q3PosPoints, totalPosPoints,
    q1Kills, q2Kills, q3Kills, totalKills, totalKillPoints, totalPoints,
  };
}

/** Calcula stats de um jogador em um xtreino */
export function calcPlayerXtreinoStats(stat: XtreinoPlayerStat): PlayerXtreinoStats {
  return {
    playerName: stat.playerName, teamName: stat.teamName, date: stat.date,
    xtreinoId: stat.xtreinoId, q1Kills: stat.q1Kills || 0, q2Kills: stat.q2Kills || 0,
    q3Kills: stat.q3Kills || 0, totalKills: stat.totalKills || 0,
    killPoints: calcKillPoints(stat.totalKills || 0),
  };
}

/** Acumula stats de um jogador em todos os xtreinos */
export function calcPlayerAccumulatedStats(playerStats: XtreinoPlayerStat[]): PlayerAccumulatedStats[] {
  const map = new Map<string, PlayerAccumulatedStats>();

  playerStats.forEach((stat) => {
    const key = stat.playerName.trim().toLowerCase();
    const existing = map.get(key);

    if (existing) {
      existing.totalKills += stat.totalKills || 0;
      existing.totalQ1Kills += stat.q1Kills || 0;
      existing.totalQ2Kills += stat.q2Kills || 0;
      existing.totalQ3Kills += stat.q3Kills || 0;
      existing.participations += 1;
      if (!existing.xtreinoDates.includes(stat.date)) existing.xtreinoDates.push(stat.date);
    } else {
      map.set(key, {
        playerName: stat.playerName, teamName: stat.teamName,
        totalKills: stat.totalKills || 0, totalQ1Kills: stat.q1Kills || 0,
        totalQ2Kills: stat.q2Kills || 0, totalQ3Kills: stat.q3Kills || 0,
        participations: 1, avgKills: 0, xtreinoDates: [stat.date],
      });
    }
  });

  return Array.from(map.values()).map((p) => ({
    ...p,
    avgKills: p.participations > 0 ? Math.round(p.totalKills / p.participations) : 0,
  }));
}

/** Acumula stats de um time em todos os xtreinos */
export function calcTeamAccumulatedStats(
  results: XtreinoResult[],
  playerStats: XtreinoPlayerStat[]
): TeamAccumulatedStats[] {
  const teamStatsMap = new Map<string, TeamAccumulatedStats>();

  results.forEach((result) => {
    const stats = calcTeamXtreinoStats(result, playerStats);
    const key = result.teamName.trim().toLowerCase();
    const existing = teamStatsMap.get(key);

    if (existing) {
      existing.totalPosPoints += stats.totalPosPoints;
      existing.totalQ1PosPoints += stats.q1PosPoints;
      existing.totalQ2PosPoints += stats.q2PosPoints;
      existing.totalQ3PosPoints += stats.q3PosPoints;
      existing.totalKills += stats.totalKills;
      existing.totalKillPoints += stats.totalKillPoints;
      existing.totalPoints += stats.totalPoints;
      existing.participations += 1;
      if (!existing.xtreinoDates.includes(result.date)) existing.xtreinoDates.push(result.date);
    } else {
      teamStatsMap.set(key, {
        teamName: result.teamName, totalPosPoints: stats.totalPosPoints,
        totalQ1PosPoints: stats.q1PosPoints, totalQ2PosPoints: stats.q2PosPoints,
        totalQ3PosPoints: stats.q3PosPoints, totalKills: stats.totalKills,
        totalKillPoints: stats.totalKillPoints, totalPoints: stats.totalPoints,
        participations: 1, avgPoints: 0, xtreinoDates: [result.date], top3Count: 0
      });
    }
  });

  return Array.from(teamStatsMap.values()).map((t) => ({
    ...t,
    avgPoints: t.participations > 0 ? Math.round(t.totalPoints / t.participations) : 0,
  }));
}

/** Calcula stats de ranking geral por time */
export function calcTeamRankingStats(
  results: XtreinoResult[],
  playerStats: XtreinoPlayerStat[]
): TeamRankingStats[] {
  const map = new Map<string, TeamRankingStats>();

  for (const result of results) {
    const stats = calcTeamXtreinoStats(result, playerStats);
    const existing = map.get(result.teamName);

    const historyItem: TeamRankingHistoryItem = {
      date: result.date, xtreinoId: result.xtreinoId,
      q1Pos: result.q1Pos, q2Pos: result.q2Pos, q3Pos: result.q3Pos,
      totalPosPoints: stats.totalPosPoints, totalKills: stats.totalKills,
      totalKillPoints: stats.totalKillPoints, totalPoints: stats.totalPoints,
    };

    if (!existing) {
      const positions = [result.q1Pos, result.q2Pos, result.q3Pos].filter((p): p is number => p !== null);
      const bestPos = positions.length > 0 ? Math.min(...positions) : null;

      map.set(result.teamName, {
        teamName: result.teamName, totalPoints: stats.totalPoints,
        totalKills: stats.totalKills, totalKillPoints: stats.totalKillPoints,
        totalPosPoints: stats.totalPosPoints, xtreinosPlayed: 1,
        top1Count: [result.q1Pos, result.q2Pos, result.q3Pos].filter((p) => p === 1).length,
        top2Count: [result.q1Pos, result.q2Pos, result.q3Pos].filter((p) => p === 2).length,
        top3Count: [result.q1Pos, result.q2Pos, result.q3Pos].filter((p) => p === 3).length,
        bestPosition: bestPos, xtreinos: [historyItem],
      });
    } else {
      existing.totalPoints += stats.totalPoints;
      existing.totalKills += stats.totalKills;
      existing.totalKillPoints += stats.totalKillPoints;
      existing.totalPosPoints += stats.totalPosPoints;
      existing.xtreinosPlayed += 1;

      const podiums = [result.q1Pos, result.q2Pos, result.q3Pos];
      existing.top1Count += podiums.filter((p) => p === 1).length;
      existing.top2Count += podiums.filter((p) => p === 2).length;
      existing.top3Count += podiums.filter((p) => p === 3).length;

      const positions = [result.q1Pos, result.q2Pos, result.q3Pos].filter((p): p is number => p !== null);
      if (positions.length > 0) {
        const minPos = Math.min(...positions);
        existing.bestPosition = existing.bestPosition ? Math.min(existing.bestPosition, minPos) : minPos;
      }
      existing.xtreinos.push(historyItem);
    }
  }
  return Array.from(map.values());
}

/** Agrupa jogadores por time (somando todas as participações) */
export function calcTeamPlayersGrouped(playerStats: XtreinoPlayerStat[]): Map<string, TeamPlayerGrouped[]> {
  const teamMap = new Map<string, Map<string, TeamPlayerGrouped>>();

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
      playerMap.set(playerKey, {
        playerName: stat.playerName, totalKills: stat.totalKills || 0,
        totalQ1Kills: stat.q1Kills || 0, totalQ2Kills: stat.q2Kills || 0,
        totalQ3Kills: stat.q3Kills || 0, participations: 1, avgKills: 0,
      });
    }
  }

  const result = new Map<string, TeamPlayerGrouped[]>();
  for (const [teamName, playerMap] of teamMap) {
    const players = Array.from(playerMap.values()).map((p) => ({
      ...p,
      avgKills: p.participations > 0 ? Math.round((p.totalKills / p.participations) * 10) / 10 : 0,
    }));
    players.sort((a, b) => b.totalKills - a.totalKills);
    result.set(teamName, players);
  }
  return result;
}

/** Verifica se jogador jogou para um time */
export function playerPlayedForTeam(
  player: PlayerAccumulatedStats | TeamPlayerGrouped,
  teamName: string
): boolean {
  if ("teamName" in player && player.teamName) {
    return player.teamName.trim().toLowerCase() === teamName.trim().toLowerCase();
  }
  return false;
}

/** Filtra dados por mês e/ou dia */
export function filterByDate<T extends { date: string }>(data: T[], month?: string, day?: string): T[] {
  return data.filter((item) => {
    if (month && !item.date?.startsWith(month)) return false;
    if (day && item.date !== day) return false;
    return true;
  });
}

/** Extrai meses únicos de um array de dados */
export function extractMonths<T extends { date: string }>(data: T[]): string[] {
  const months = new Set<string>();
  data.forEach((item) => { if (item.date) months.add(item.date.substring(0, 7)); });
  return Array.from(months).sort().reverse();
}

/** Extrai dias únicos de um mês específico */
export function extractDays<T extends { date: string }>(data: T[], month: string): string[] {
  const days = new Set<string>();
  data.forEach((item) => { if (item.date && item.date.startsWith(month)) days.add(item.date); });
  return Array.from(days).sort();
}