// ============================================================
// TIPOS PUROS (Sem JSX)
// ============================================================

export type ScrimsTabKey = "agendados" | "ranking-jogadores" | "ranking-times";

export interface TabConfig {
  key: ScrimsTabKey;
  label: string;
  icon: React.ReactNode;
  group: "gestao" | "ranking";
}

export interface EnrichedScrimPlayer {
  nickname: string;
  teamName: string;
  scrimKills: number;
  scrimAssists: number;
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