export interface XTreinoOption {
  id: number;
  name: string;
  date: string;
}

export interface PlayerRankingStat {
  id: number;
  playerName: string;
  teamName: string;
  date: string;
  xtreinoId: number;
  q1Kills: number;
  q2Kills: number;
  q3Kills: number;
  totalKills: number;
}

export interface PlayerRankingSummary {
  totalPlayers: number;
  totalKills: number;
  totalQ1: number;
  totalQ2: number;
  totalQ3: number;
  totalRecords: number;
}