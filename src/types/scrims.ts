export type TabType = "agendados" | "historico-times" | "historico-jogadores";
export type ScrimMode = "br" | "mme";

export interface ScrimItem {
  id: number; name?: string | null; team1Id?: number | null; team2Id?: number | null;
  team1Name?: string | null; team2Name?: string | null; team1Tag?: string | null; team2Tag?: string | null;
  date?: string | null; time?: string | null; modality?: string | null; mode?: ScrimMode | null;
  status: string; result?: string | null; createdAt: Date;
}

// NOVOS TIPOS DINÂMICOS
export interface ScrimResultRound { roundNumber: number; value: number; }
export interface PlayerStatRound { roundNumber: number; kills: number; assists: number; deaths: number; damage: number; mvp: boolean; score: number; }

export interface TeamResult {
  id: number; scrimId: number | null; date: string; teamName: string; mode: ScrimMode;
  rounds: ScrimResultRound[]; createdAt: Date;
}

export interface PlayerStat {
  id: number; scrimId: number | null; date: string; teamName: string; playerName: string; mode: ScrimMode;
  rounds: PlayerStatRound[];
  totalKills: number; totalAssists: number; totalDeaths: number; totalDamage: number; totalMvp: number; createdAt: Date;
}

export interface PlayerAllTime { playerName: string; teamName: string; totalKills: number; totalAssists: number; totalDeaths: number; totalDamage: number; totalMvp: number; matches: number; }
export interface TeamAllTimeBR { teamName: string; totalPoints: number; totalKills: number; wins: number; top3: number; matches: number; avgPos: number; }
export interface TeamAllTimeMME { teamName: string; totalRoundWins: number; totalKills: number; seriesWins: number; matches: number; winRate: number; }

// Enriched (para tabelas do Frontend)
export interface EnrichedTeamRowBR {
  positionPoints: number; id: number; entityName: string; points: number; kills: number; wins: number; top3: number; participations: number; rounds: ScrimResultRound[]; 
}
export interface EnrichedTeamRowMME { id: number; entityName: string; roundWins: number; kills: number; seriesWins: number; participations: number; rounds: ScrimResultRound[]; }
export interface EnrichedPlayerRow {
  id: number;
  entityName: string;
  points: number;
  kills: number;
  assists: number;
  deaths: number;
  damage: number;
  mvps: number; // Certifique-se que é number, não boolean
  wins: number;
  participations: number;
  roundKills: number[]; // O array dinâmico que criamos
  teamName: string;
}

export const STATUS_COLORS: Record<string, string> = { agendado: "bg-blue-500/10 text-blue-400 border-blue-500/20", em_andamento: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", concluido: "bg-green-500/10 text-green-400 border-green-500/20", cancelado: "bg-red-500/10 text-red-400 border-red-500/20" };
export const STATUS_LABELS: Record<string, string> = { agendado: "Agendado", em_andamento: "Ao Vivo", concluido: "Concluído", cancelado: "Cancelado" };

export function getPointsByPosition(pos: number): number {
  if (!pos) return 0;
  const points: Record<number, number> = { 1: 15, 2: 12, 3: 10, 4: 9, 5: 8, 6: 7, 7: 6, 8: 5, 9: 4, 10: 3, 11: 2, 12: 1, 13: 1, 14: 0, 15: 0 };
  return points[pos] ?? 0;
}

// types/scrims.ts

export type ScrimRankTabKey = "jogadores" | "times";

export interface EnrichedScrimPlayer {
  nickname: string;
  teamName: string;
  scrimKills: number;
  scrimAssists: number;
  scrimDeaths: number;
  scrimDamage: number;
  scrimMvps: number;
  scrimKdRatio: number;
  scrimWins: number;
  scrimLosses: number;
  totalMatches: number;
}

export interface EnrichedScrimTeam {
  name: string;
  tag: string;
  scrimKills: number;
  scrimWins: number;
  scrimLosses: number;
  scrimMatches: number;
  winRate: number;
}