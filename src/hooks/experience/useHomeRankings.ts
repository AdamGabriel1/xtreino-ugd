// src/hooks/experience/useHomeRankings.ts
import { useMemo } from "react";
import { trpc } from "@/providers/trpc";
import { calculatePlayerBadges } from "@/constants/gameRules";
import type { TopPlayer, TopTeam } from "@/types/experience";
import type { TeamRankingStats, PlayerAccumulatedStats } from "@/hooks/xtreinos/useXtreinoCalculations";

function calcPlayerSparkline(rawStats: Array<{ playerName: string; date: string; totalKills: number }>, playerName: string): number[] {
  const playerStats = rawStats.filter((s) => s.playerName === playerName).sort((a, b) => a.date.localeCompare(b.date));
  const dateMap = new Map<string, number>();
  playerStats.forEach((s) => { dateMap.set(s.date, (dateMap.get(s.date) || 0) + s.totalKills); });
  return Array.from(dateMap.keys()).sort().map((d) => dateMap.get(d) || 0);
}

function calcPlayerStreak(rawStats: Array<{ playerName: string; date: string }>, playerName: string): number {
  const allDates = [...new Set(rawStats.map((s) => s.date))].sort();
  const playerDates = new Set(rawStats.filter((s) => s.playerName === playerName).map((s) => s.date));
  let streak = 0;
  for (let i = allDates.length - 1; i >= 0; i--) {
    if (playerDates.has(allDates[i])) streak++;
    else break;
  }
  return streak;
}

function calcTeamSparkline(teamXtreinos: Array<{ date: string; totalPoints: number }>): number[] {
  return [...teamXtreinos].sort((a, b) => a.date.localeCompare(b.date)).map((x) => x.totalPoints);
}

function calcTeamTrend(sparkline: number[]): "up" | "down" | "same" {
  if (sparkline.length < 2) return "same";
  const last = sparkline[sparkline.length - 1];
  const prev = sparkline[sparkline.length - 2];
  if (last > prev) return "up";
  if (last < prev) return "down";
  return "same";
}

function calcTeamBadges(team: { totalKills: number; totalPoints: number; xtreinosPlayed: number; top1Count: number; top3Count: number }): string[] {
  const badges: string[] = [];
  if (team.top1Count >= 1) badges.push("Campeão");
  if (team.top1Count >= 5) badges.push("Dinastia");
  if (team.top3Count >= 10) badges.push("Consistente");
  if (team.totalKills >= 500) badges.push("500+ Kills");
  if (team.xtreinosPlayed >= 20) badges.push("Veterano");
  if (team.totalPoints >= 500) badges.push("500+ Pts");
  return badges;
}

export function useHomeRankings(
  teamRanking?: TeamRankingStats[],
  playerAccumulated?: PlayerAccumulatedStats[]
) {
  const { data: rawPlayerRanking } = trpc.players.rankingStats.useQuery();
  const { data: teamsList } = trpc.teams.list.useQuery();
  const { data: playersList } = trpc.players.list.useQuery();

  const teamMap = useMemo(() => {
    const map = new Map<string, { id: number; clanId: number | null }>();
    if (!teamsList) return map;
    for (const team of teamsList) {
      map.set(team.name.trim().toLowerCase(), { id: team.id, clanId: team.clanId ?? null });
    }
    return map;
  }, [teamsList]);

  const playerMap = useMemo(() => {
    const map = new Map<string, { id: number; teamId: number | null }>();
    if (!playersList) return map;
    for (const player of playersList) {
      map.set(player.nickname.trim().toLowerCase(), { id: player.id, teamId: player.teamId ?? null });
    }
    return map;
  }, [playersList]);

  const topPlayers = useMemo<TopPlayer[]>(() => {
    if (!rawPlayerRanking || rawPlayerRanking.length === 0) return [];
    const playerStatsMap = new Map<string, any>();

    for (const stat of rawPlayerRanking) {
      const key = stat.playerName.trim().toLowerCase();
      const existing = playerStatsMap.get(key);
      if (existing) {
        existing.totalKills += stat.totalKills || 0;
        existing.participations += 1;
        if (!existing.dates.includes(stat.date)) existing.dates.push(stat.date);
      } else {
        playerStatsMap.set(key, { playerName: stat.playerName, teamName: stat.teamName, totalKills: stat.totalKills || 0, participations: 1, dates: [stat.date] });
      }
    }

    return Array.from(playerStatsMap.values())
      .map((p) => {
        const dbPlayer = playerMap.get(p.playerName.trim().toLowerCase());
        const avg = p.participations > 0 ? p.totalKills / p.participations : 0;
        return {
          id: dbPlayer?.id ?? 0,
          clanId: undefined,
          teamId: dbPlayer?.teamId ?? undefined,
          name: p.playerName, 
          teamName: p.teamName, 
          kills: p.totalKills,
          participations: p.participations, 
          avgKills: Math.round(avg * 10) / 10,
          streak: calcPlayerStreak(rawPlayerRanking, p.playerName),
          badges: calculatePlayerBadges(p.totalKills, p.participations, avg),
          rank: 0, 
          trend: "same" as const, 
          sparkline: calcPlayerSparkline(rawPlayerRanking, p.playerName),
        };
      })
      .sort((a, b) => b.kills - a.kills)
      .slice(0, 8)
      .map((p, i) => ({ ...p, rank: i + 1 }));
  }, [rawPlayerRanking, playerMap]);

  const topTeams = useMemo<TopTeam[]>(() => {
    // O tipo TeamRankingStats garante que todas essas propriedades existem!
    if (!teamRanking || teamRanking.length === 0) return [];
    
    return teamRanking
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 8)
      .map((team) => {
        const sparkline = calcTeamSparkline(team.xtreinos);
        const dbTeam = teamMap.get(team.teamName.trim().toLowerCase());
        return {
          id: dbTeam?.id ?? 0,
          clanId: dbTeam?.clanId ?? undefined,
          name: team.teamName, 
          points: team.totalPoints, 
          kills: team.totalKills,
          wins: team.top1Count, 
          top3Count: team.top3Count, 
          avgPoints: team.xtreinosPlayed > 0 ? Math.round((team.totalPoints / team.xtreinosPlayed) * 10) / 10 : 0,
          rank: 0,
          sparkline, 
          trend: calcTeamTrend(sparkline), 
          badges: calcTeamBadges(team),
        };
      })
      .map((p, i) => ({ ...p, rank: i + 1 }));
  }, [teamRanking, teamMap]);

  return { topPlayers, topTeams };
}