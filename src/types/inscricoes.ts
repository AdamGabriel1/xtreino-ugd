export type InscricaoStatus = "confirmada" | "reserva" | "pendente" | "cancelada";

export interface InscricaoEquipe {
  id: number;
  xtreinoId: number;
  teamId: number | null;
  teamName: string;
  status: InscricaoStatus;
  isReserve: boolean;
  isFixed: boolean;
  slotNumber: number | null;
  registeredAt: string | null;
  players: string[];
  position: number;
  createdAt?: Date | string | null;
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
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
}