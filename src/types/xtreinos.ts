// types/xtreinos.ts

export interface TeamDuelData {
  teamName: string;
  q1Pos: number | null;
  q2Pos: number | null;
  q3Pos: number | null;
  totalPosPoints: number;
  totalKills: number;
  totalKillPoints: number;
  totalPoints: number;
  players: Array<{
    playerName: string;
    q1Kills: number;
    q2Kills: number;
    q3Kills: number;
    totalKills: number;
  }>;
}

export interface PlayerFullStats {
  playerName: string;
  teamName: string | null;
  totalKills: number;
  totalQ1Kills: number;
  totalQ2Kills: number;
  totalQ3Kills: number;
  participations: number;
  avgKills: number;
  bestPerformance: number;
  badges: string[];
  avgPerQuarter: { q1: number; q2: number; q3: number };
  sparkline: number[];
}

export interface HistoryEvent {
  id: number;
  type: "xtreino" | "scrim";
  date: string;
  title: string;
  team1Name: string | null;
  team2Name: string | null;
  details: string;
}

export interface ChartDataPoint {
  month: string;
  label: string;
  value: number;
}

export type H2HMode = "xtreino" | "scrim";