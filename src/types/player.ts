export type PlayerSortField =
  | "totalKills" | "xtreinoKills" | "scrimKills" | "scrimMvps"
  | "scrimKdRatio" | "totalMatches" | "participations"
  | "avgKills" | "streak" | "bestPerformance" | "teamContribution"
  | "xtreinoMatches" | "q1Avg" | "q2Avg" | "q3Avg"
  | "q1Best" | "q2Best" | "q3Best";

export interface EnrichedPlayer {
  id: number;
  nickname: string;
  teamName: string;
  xtreinoMatches: number;
  xtreinoKills: number;
  scrimMatches: number;
  scrimKills: number;
  scrimMvps: number;
  scrimKdRatio: number;
  totalMatches: number;
  totalKills: number;
  aliases: string[];
  sparkline: number[];
  streak: number;
  badges: string[];
  avgPerQuarter: { q1: number; q2: number; q3: number };
  bestPerQuarter?: { q1: number; q2: number; q3: number };
  bestPerformance: number;
  teamContribution: number;
  trend: "up" | "down" | "same";
  isNewbie: boolean;
}

export interface PlayerStats {
  xtreinoMatches?: number | null;
  xtreinoKills?: number | null;
  xtreinoBestQ1?: number | null;
  xtreinoBestQ2?: number | null;
  xtreinoBestQ3?: number | null;
  scrimMatches?: number | null;
  scrimRounds?: number | null;
  scrimKills?: number | null;
  scrimAssists?: number | null;
  scrimDeaths?: number | null;
  scrimDamage?: number | null;
  scrimMvps?: number | null;
  scrimWins?: number | null;
  scrimLosses?: number | null;
  scrimKdRatio?: number | null;
  totalMatches?: number | null;
  totalKills?: number | null;
}
