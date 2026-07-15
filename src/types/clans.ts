import type { ReactNode } from "react";

export type SortField = "name" | "teamsCount" | "playersCount";
export type SortDir = "asc" | "desc";

export type PlayerSortField = "totalXtreinoKills" | "participations" | "avgKills" | "q1Kills" | "q2Kills" | "q3Kills" | "killPoints";
export type PlayerSortDir = "asc" | "desc";

export interface PlayerItem {
  id: number;
  nickname: string;
  uid: string | null;
  role: string;
  kills: number;
  deaths: number;
  wins: number;
  matches: number;
}

export interface EnrichedPlayerItem extends PlayerItem {
  totalXtreinoKills: number;
  q1Kills: number;
  q2Kills: number;
  q3Kills: number;
  participations: number;
  avgKills: number;
  killPoints: number;
  xtreinoDates: string[];
}

export interface TeamItem {
  id: number;
  name: string;
  tag: string;
  logo: string | null;
  description: string | null;
  status: string;
  captainName: string | null;
  captainId: number | null;
  players: PlayerItem[];
}

export interface ClanItem {
  id: number;
  name: string;
  tag: string;
  description: string | null;
  logo: string | null;
  color: string | null;
  status: string;
  discord: string | null;
  teams: TeamItem[];
}

export interface ClanWithStats extends ClanItem {
  totalPlayers: number;
  activeLines: number;
}

export interface StatsSummary {
  totalClans: number;
  totalTeams: number;
  totalPlayers: number;
  activeClans: number;
}

export interface XtreinoStats {
  playerName: string;
  date: string;
  xtreinoId: number;
  teamName: string;
  q1Kills: number;
  q2Kills: number;
  q3Kills: number;
  totalKills: number;
  killPoints: number;
}

export interface AccumulatedStats {
  playerName: string;
  totalKills: number;
  totalQ1Kills: number;
  totalQ2Kills: number;
  totalQ3Kills: number;
  participations: number;
  avgKills: number;
  xtreinoDates: string[];
}

export interface XtreinoCalculations {
  playerAccumulated: AccumulatedStats[];
  playerXtreinoStats: XtreinoStats[];
  availableMonths: string[];
  availableDates: string[];
}

export interface RoleConfig {
  icon: ReactNode;
  label: string;
  color: string;
}