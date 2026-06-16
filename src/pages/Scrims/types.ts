// types.ts — atualizado com campos de assists, deaths, damage, mvp

export type TabType = "agendados" | "historico-times" | "historico-jogadores";

export interface ScrimItem {
  id: number;
  name: string;
  team1Id?: number | null;
  team2Id?: number | null;
  team1Name?: string | null;
  team2Name?: string | null;
  team1Tag?: string | null;
  team2Tag?: string | null;
  date?: string | null;
  time?: string | null;
  modality?: string | null;
  status: string;
  result?: string | null;
  createdAt: Date;
}

export interface TeamResult {
  id: number;
  scrimId: number;
  date: string;
  teamName: string;
  q1Pos: number | null;
  q2Pos: number | null;
  q3Pos: number | null;
  createdAt: Date;
}

export interface PlayerStat {
  id: number;
  scrimId: number;
  date: string;
  teamName: string;
  playerName: string;
  q1Kills: number;
  q1Assists: number;
  q1Deaths: number;
  q1Damage: number;
  q1Mvp: boolean;
  q2Kills: number;
  q2Assists: number;
  q2Deaths: number;
  q2Damage: number;
  q2Mvp: boolean;
  q3Kills: number;
  q3Assists: number;
  q3Deaths: number;
  q3Damage: number;
  q3Mvp: boolean;
  totalKills: number;
  totalAssists: number;
  totalDeaths: number;
  totalDamage: number;
  totalMvp: number;
  createdAt: Date;
}

export interface PlayerAllTime {
  playerName: string;
  teamName: string;
  totalKills: number;
  totalAssists: number;
  totalDeaths: number;
  totalDamage: number;
  totalMvp: number;
  totalQ1: number;
  totalQ2: number;
  totalQ3: number;
  matches: number;
}

export interface TeamAllTime {
  teamName: string;
  totalPoints: number;
  totalKills: number;
  wins: number;
  matches: number;
  avgQ1: number;
  avgQ2: number;
  avgQ3: number;
}

export interface EnrichedPlayerRow {
  id: number;
  entityName: string;
  points: number;
  kills: number;
  assists?: number;
  deaths?: number;
  damage?: number;
  mvps?: number;
  wins: number;
  participations: number;
  q1Kills: number;
  q2Kills: number;
  q3Kills: number;
  teamName: string;
}

export interface EnrichedTeamRow {
  id: number;
  entityName: string;
  points: number;
  positionPoints: number;
  kills: number;
  wins: number;
  participations: number;
  q1Pos: number | null;
  q2Pos: number | null;
  q3Pos: number | null;
  q1Points: number;
  q2Points: number;
  q3Points: number;
}

export const STATUS_COLORS: Record<string, string> = {
  agendado: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  em_andamento: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  concluido: "bg-green-500/10 text-green-400 border-green-500/20",
  cancelado: "bg-red-500/10 text-red-400 border-red-500/20",
};

export const STATUS_LABELS: Record<string, string> = {
  agendado: "Agendado",
  em_andamento: "Ao Vivo",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

export function getPointsByPosition(pos: number | null): number {
  if (!pos) return 0;
  const points: Record<number, number> = {
    1: 15, 2: 12, 3: 10, 4: 9, 5: 8, 6: 7,
    7: 6, 8: 5, 9: 4, 10: 3, 11: 2, 12: 1,
    13: 1, 14: 0, 15: 0,
  };
  return points[pos] ?? 0;
}