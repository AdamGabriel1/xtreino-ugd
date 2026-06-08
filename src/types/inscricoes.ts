export type InscricaoStatus = "confirmada" | "reserva" | "pendente" | "cancelada";

export interface InscricaoEquipe {
  id: number;
  xtreinoId: number;
  teamName: string;
  status: InscricaoStatus;
  registeredBy: string | null;
  registeredAt: string | null;
  players: string[];
  position: number;
}

export interface XtreinoEvento {
  id: number;
  name: string;
  date: string;
  status: string;
  maxTeams: number;
  timeBr?: string | null;
  timeMx?: string | null;
  modality?: string | null;
  whatsappLink?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}