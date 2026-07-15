// ============================================================
// FUNÇÕES DE CÁLCULO PURAS (Enriquecimento de X-Treinos)
// Extraídas para não duplicar entre JogadoresXTKillsTab e JogadoresTab
// ============================================================

export interface XtreinoRawStat {
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

export function calcPlayerSparkline(rawStats: XtreinoRawStat[], playerName: string): number[] {
  const playerStats = rawStats
    .filter((s) => s.playerName === playerName)
    .sort((a, b) => a.date.localeCompare(b.date));
  const dateMap = new Map<string, number>();
  playerStats.forEach((s) => {
    dateMap.set(s.date, (dateMap.get(s.date) || 0) + s.totalKills);
  });
  const dates = Array.from(dateMap.keys()).sort();
  return dates.map((d) => dateMap.get(d) || 0);
}

export function calcPlayerStreak(rawStats: XtreinoRawStat[], playerName: string): number {
  const allDates = [...new Set(rawStats.map((s) => s.date))].sort();
  const playerDates = new Set(
    rawStats.filter((s) => s.playerName === playerName).map((s) => s.date)
  );
  let streak = 0;
  for (let i = allDates.length - 1; i >= 0; i--) {
    if (playerDates.has(allDates[i])) streak++;
    else break;
  }
  return streak;
}

export function calcAvgPerQuarter(rawStats: XtreinoRawStat[], playerName: string, participations: number) {
  const stats = rawStats.filter((s) => s.playerName === playerName);
  const totalQ1 = stats.reduce((sum, s) => sum + s.q1Kills, 0);
  const totalQ2 = stats.reduce((sum, s) => sum + s.q2Kills, 0);
  const totalQ3 = stats.reduce((sum, s) => sum + s.q3Kills, 0);
  return {
    q1: participations > 0 ? Math.round((totalQ1 / participations) * 10) / 10 : 0,
    q2: participations > 0 ? Math.round((totalQ2 / participations) * 10) / 10 : 0,
    q3: participations > 0 ? Math.round((totalQ3 / participations) * 10) / 10 : 0,
  };
}

export function calcBestPerQuarter(rawStats: XtreinoRawStat[], playerName: string) {
  const stats = rawStats.filter((s) => s.playerName === playerName);
  if (!stats.length) return { q1: 0, q2: 0, q3: 0 };
  return {
    q1: Math.max(...stats.map((s) => s.q1Kills)),
    q2: Math.max(...stats.map((s) => s.q2Kills)),
    q3: Math.max(...stats.map((s) => s.q3Kills)),
  };
}

export function calcBestPerformance(rawStats: XtreinoRawStat[], playerName: string): number {
  const stats = rawStats.filter((s) => s.playerName === playerName);
  if (!stats.length) return 0;
  return Math.max(...stats.map((s) => s.totalKills));
}

export function calcTeamContribution(rawStats: XtreinoRawStat[], playerName: string, teamName: string): number {
  if (!teamName || teamName === "Sem Time") return 0;
  const playerStats = rawStats.filter((s) => s.playerName === playerName);
  const playerDates = new Set(playerStats.map((s) => s.date));
  const teamStats = rawStats.filter((s) => s.teamName === teamName && playerDates.has(s.date));
  const playerKills = playerStats.reduce((sum, s) => sum + s.totalKills, 0);
  const teamKills = teamStats.reduce((sum, s) => sum + s.totalKills, 0);
  return teamKills > 0 ? Math.round((playerKills / teamKills) * 1000) / 10 : 0;
}

export function calcTrend(rawStats: XtreinoRawStat[], playerName: string): "up" | "down" | "same" {
  const allDates = [...new Set(rawStats.map((s) => s.date))].sort();
  if (allDates.length < 2) return "same";
  const lastDate = allDates[allDates.length - 1];
  const prevDate = allDates[allDates.length - 2];

  const lastStats = rawStats.filter((s) => s.date === lastDate);
  const prevStats = rawStats.filter((s) => s.date === prevDate);

  const lastRank = [...lastStats].sort((a, b) => b.totalKills - a.totalKills).findIndex((s) => s.playerName === playerName);
  const prevRank = [...prevStats].sort((a, b) => b.totalKills - a.totalKills).findIndex((s) => s.playerName === playerName);

  if (lastRank === -1 || prevRank === -1) return "same";
  if (lastRank < prevRank) return "up";
  if (lastRank > prevRank) return "down";
  return "same";
}