// src/app/scrims/types.ts
// Tipos compartilhados do sistema de scrims

export type TabType = "agendados" | "historico-times" | "historico-jogadores";
export type ModalityType = "todos" | "solo" | "duo" | "squad" | "4v4";

export type ScrimStatus = "agendado" | "em_andamento" | "concluido" | "cancelado";

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
  status: ScrimStatus;
  result?: string | null;
}

export interface TeamResult {
  id: number;
  scrimId?: number | null;
  date: string;
  teamName: string;
  q1Pos: number | null;
  q2Pos: number | null;
  q3Pos: number | null;
}

export interface PlayerStat {
  id: number;
  scrimId?: number | null;
  date: string;
  teamName: string;
  playerName: string;
  q1Kills: number;
  q2Kills: number;
  q3Kills: number;
  totalKills: number;
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

export interface PlayerAllTime {
  playerName: string;
  teamName: string;
  totalKills: number;
  totalQ1: number;
  totalQ2: number;
  totalQ3: number;
  matches: number;
}

export interface EnrichedTeamRow {
  id: number;
  entityName: string;
  points: number;
  positionPoints: number;
  kills: number;
  wins: number;
  participations: number;
  q1Pos?: number | null;
  q2Pos?: number | null;
  q3Pos?: number | null;
  q1Points?: number;
  q2Points?: number;
  q3Points?: number;
}

export interface EnrichedPlayerRow {
  id: number;
  entityName: string;
  points: number;
  kills: number;
  wins: number;
  participations: number;
  q1Kills: number;
  q2Kills: number;
  q3Kills: number;
  teamName: string;
}

/** Pontos por colocação (BR) */
export const POSITION_POINTS: Record<number, number> = {
  1: 15, 2: 12, 3: 10, 4: 9, 5: 8, 6: 7,
  7: 6, 8: 5, 9: 4, 10: 3, 11: 2, 12: 1,
  13: 1, 14: 0, 15: 0,
};

/** Pontos por kill */
export const KILL_POINTS = 1;

export function getPointsByPosition(pos: number | null): number {
  if (!pos) return 0;
  return POSITION_POINTS[pos] ?? 0;
}

export const STATUS_COLORS: Record<string, string> = {
  agendado: "bg-blue-500/10 text-blue-400",
  em_andamento: "bg-yellow-500/10 text-yellow-400",
  concluido: "bg-green-500/10 text-green-400",
  cancelado: "bg-red-500/10 text-red-400",
};

export const STATUS_LABELS: Record<string, string> = {
  agendado: "Agendado",
  em_andamento: "Ao Vivo",
  concluido: "Concluído",
  cancelado: "Cancelado",
};
