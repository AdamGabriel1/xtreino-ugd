// src/types/experience.ts
import type { UpcomingEvent } from "@/components/experience/UpcomingEvents";

export interface ExperienceStats {
  totalXtreinos: number;
  totalChampionships: number;
  totalScrims: number;
  totalTeams: number;
  totalPlayers: number;
  totalKills: number;
  totalPoints: number;
  totalMatches: number;
  avgKillsPerMatch: number;
  avgPointsPerTeam: number;
}

export interface DetailedEventStats {
  xtreinoStats: { total: number; abertos: number; emAndamento: number; fechados: number };
  championshipStats: { total: number; ativos: number; inscricoes: number; encerrados: number };
  scrimStats: { total: number; agendados: number; emAndamento: number; finalizados: number };
  salinhaStats: { total: number; abertas: number; encerradas: number };
  xtreinoRealStats: { totalTeams: number; totalKills: number; totalPoints: number; totalXtreinos: number };
  scrimRealStats: { totalTeams: number; totalKills: number; totalPoints: number; totalScrims: number };
}

export interface TopPlayer {
  id: number;
  clanId?: number;
  teamId?: number;
  name: string;
  teamName: string | null;
  kills: number;
  avgKills: number;
  participations: number;
  streak: number;
  rank: number;
  badges: string[];
  sparkline: number[];
  trend: "up" | "down" | "same";
}

export interface TopTeam {
  id: number;
  clanId?: number;
  name: string;
  wins: number;
  top3Count: number;
  kills: number;
  points: number;
  avgPoints: number;
  rank: number;
  badges: string[];
  sparkline: number[];
  trend: "up" | "down" | "same";
}

export interface RecentActivity {
  id: number;
  type: "xtreino" | "championship" | "scrim" | "ranking";
  title: string;
  description: string;
  date: string;
  highlight?: string;
}

// --- NOVO: O tipo que faltava ---
export interface ExperienceData {
  orgName: string;
  isLoading: boolean;
  stats: ExperienceStats;
  detailedEventStats: DetailedEventStats;
  topPlayers: TopPlayer[];
  topTeams: TopTeam[];
  recentActivities: RecentActivity[];
  upcomingEvents: UpcomingEvent[];
  periodSummary: {
    totalKills: number;
    totalPosPoints: number;
    totalKillPoints: number;
    totalPoints: number;
    uniqueTeams: number;
    uniquePlayers: number;
    uniqueDates: number;
  } | null;
}

// Re-exportando para facilitar a vida
export type { UpcomingEvent };