// ============================================================
// TIPOS COMPARTILHADOS - Admin XTreinos
// ============================================================

export type XTreinoStatus = "aberto" | "encerrado" | "cancelado";
export type ScheduleStatus = "scheduled" | "completed" | "cancelled";
export type Modality = "solo" | "duo" | "squad" | "4v4";

export interface XTreino {
  id: number;
  name: string;
  date: string;
  timeMx: string | null;
  timeBr: string | null;
  modality: Modality;
  maxTeams: number;
  rules: string | null;
  discordLink: string | null;
  whatsappLink: string | null;
  status: XTreinoStatus;
  results?: XTreinoResult[];
  playerStats?: PlayerStat[];
  registrations?: TeamRegistration[];
}

export interface XTreinoResult {
  id: number;
  xtreinoId: number;
  date: string;
  teamName: string;
  q1Pos: number | null;
  q2Pos: number | null;
  q3Pos: number | null;
  totalPoints: number | null;
}

export interface PlayerStat {
  id: number;
  xtreinoId: number;
  date: string;
  teamName: string;
  playerName: string;
  q1Kills: number;
  q2Kills: number;
  q3Kills: number;
  totalKills: number;
}

export interface TeamRegistration {
  id: number;
  xtreinoId: number;
  teamName: string;
  isFixed: boolean;
  position: number;
  registeredAt: string;
  status: "confirmed" | "reserve" | "cancelled";
}

export interface ScheduleItem {
  id: number;
  date: string;
  dayOfWeek: string;
  timeBr: string;
  status: ScheduleStatus;
  notes: string | null;
}

export interface XTreinoFormData {
  name: string;
  date: string;
  timeMx: string;
  timeBr: string;
  modality: Modality;
  maxTeams: number;
  rules: string;
  discordLink: string;
  whatsappLink: string;
  status: XTreinoStatus;
}

export interface ResultFormData {
  xtreinoId: number;
  date: string;
  teamName: string;
  q1Pos: number;
  q2Pos: number;
  q3Pos: number;
  totalPoints: number;
}

export interface PlayerFormData {
  xtreinoId: number;
  date: string;
  teamName: string;
  playerName: string;
  q1Kills: number;
  q2Kills: number;
  q3Kills: number;
  totalKills: number;
}

export interface ScheduleFormData {
  date: string;
  dayOfWeek: string;
  timeBr: string;
  status: ScheduleStatus;
  notes: string;
}

export type AdminTab = "list" | "results" | "players" | "schedule" | "inscricoes";
