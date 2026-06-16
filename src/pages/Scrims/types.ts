// types.ts — Sistemas separados: BR (Battle Royale) e MME (Mata-Mata em Equipe)

export type TabType = "agendados" | "historico-times" | "historico-jogadores";
export type ScrimMode = "br" | "mme"; // BR = Battle Royale, MME = Mata-Mata em Equipe

// ============================================================
// SCRIMS — Agendamentos
// ============================================================

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
  modality?: string | null; // solo, duo, squad, 4v4, 5v5, etc.
  mode?: ScrimMode | null; // "br" ou "mme"
  status: string;
  result?: string | null;
  createdAt: Date;
}

// ============================================================
// SCRIM RESULTS — Times
// ============================================================

export interface TeamResult {
  id: number;
  scrimId: number | null;
  date: string;
  teamName: string;
  // BR: posições nas quedas (usam pontuação por posição)
  q1Pos: number | null;
  q2Pos: number | null;
  q3Pos: number | null;
  // MME: placar de rounds por queda
  q1Score: number | null;
  q2Score: number | null;
  q3Score: number | null;
  // MME: placares adicionais para melhor de 5, 7, etc.
  q4Score: number | null;
  q5Score: number | null;
  q6Score: number | null;
  q7Score: number | null;
  createdAt: Date;
}

// ============================================================
// SCRIM PLAYER STATS
// ============================================================

export interface PlayerStat {
  id: number;
  scrimId: number | null;
  date: string;
  teamName: string;
  playerName: string;
  // Q1
  q1Kills: number;
  q1Assists: number;
  q1Deaths: number;
  q1Damage: number;
  q1Mvp: boolean;
  q1Score: number; // MME: rounds do time nesta queda
  // Q2
  q2Kills: number;
  q2Assists: number;
  q2Deaths: number;
  q2Damage: number;
  q2Mvp: boolean;
  q2Score: number;
  // Q3
  q3Kills: number;
  q3Assists: number;
  q3Deaths: number;
  q3Damage: number;
  q3Mvp: boolean;
  q3Score: number;
  // Q4-Q7 (MME extended)
  q4Kills: number;
  q4Assists: number;
  q4Deaths: number;
  q4Damage: number;
  q4Mvp: boolean;
  q4Score: number;
  q5Kills: number;
  q5Assists: number;
  q5Deaths: number;
  q5Damage: number;
  q5Mvp: boolean;
  q5Score: number;
  q6Kills: number;
  q6Assists: number;
  q6Deaths: number;
  q6Damage: number;
  q6Mvp: boolean;
  q6Score: number;
  q7Kills: number;
  q7Assists: number;
  q7Deaths: number;
  q7Damage: number;
  q7Mvp: boolean;
  q7Score: number;
  // Totais
  totalKills: number;
  totalAssists: number;
  totalDeaths: number;
  totalDamage: number;
  totalMvp: number;
  createdAt: Date;
}

// ============================================================
// ALL TIME — Jogadores
// ============================================================

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
  totalQ4: number;
  totalQ5: number;
  totalQ6: number;
  totalQ7: number;
  matches: number;
}

// ============================================================
// ALL TIME — Times BR (pontuação por posição)
// ============================================================

export interface TeamAllTimeBR {
  teamName: string;
  totalPoints: number; // Soma de pontos por posição
  totalKills: number;
  wins: number; // Quedas em 1º lugar
  top3: number; // Quedas no top 3
  matches: number;
  avgPos: number;
}

// ============================================================
// ALL TIME — Times MME (rounds ganhos)
// ============================================================

export interface TeamAllTimeMME {
  teamName: string;
  totalRoundWins: number; // Soma de todos os rounds ganhos
  totalKills: number;
  seriesWins: number; // Séries vencidas (ex: 3-0, 3-1)
  matches: number;
  winRate: number; // % de séries vencidas
}

// ============================================================
// ROWS ENRICHED (para tabelas)
// ============================================================

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

export interface EnrichedTeamRowBR {
  id: number;
  entityName: string;
  points: number; // Pontos por posição
  positionPoints: number;
  kills: number;
  wins: number; // 1º lugares
  top3: number;
  participations: number;
  q1Pos: number | null;
  q2Pos: number | null;
  q3Pos: number | null;
}

export interface EnrichedTeamRowMME {
  id: number;
  entityName: string;
  roundWins: number; // Rounds ganhos totais
  kills: number;
  seriesWins: number; // Séries vencidas
  participations: number;
  q1Score: number | null;
  q2Score: number | null;
  q3Score: number | null;
  q4Score: number | null;
  q5Score: number | null;
  q6Score: number | null;
  q7Score: number | null;
}

// ============================================================
// STATUS
// ============================================================

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

// ============================================================
// PONTUAÇÃO BR (Battle Royale)
// ============================================================

export function getPointsByPosition(pos: number | null): number {
  if (!pos) return 0;
  const points: Record<number, number> = {
    1: 15, 2: 12, 3: 10, 4: 9, 5: 8, 6: 7,
    7: 6, 8: 5, 9: 4, 10: 3, 11: 2, 12: 1,
    13: 1, 14: 0, 15: 0,
  };
  return points[pos] ?? 0;
}