import { getDb } from "../api/queries/connection.js";
import { eq, and, sql } from "drizzle-orm";
import {
  xtreinos,
  xtreinoTeams,
  xtreinoPlayers,
} from "./schema.js";

/**
 * ============================================================
 * INSCRIÇÕES NO BANCO DE DADOS (SQLite via Drizzle ORM)
 * Usa o schema principal: xtreinos + xtreinoTeams + xtreinoPlayers
 * ============================================================
 */

export interface InscricaoEquipeInput {
  teamName: string;
  players: string[];
  registeredBy?: string;
}

export interface InscricaoEquipe extends InscricaoEquipeInput {
  id: number;
  xtreinoId: number;
  status: "confirmada" | "pendente" | "cancelada";
  isReserve: boolean;
  isFixed: boolean;
  slotNumber: number | null;
  registeredAt: string | null;
}

// ============================================================
// CRUD DE EVENTOS (Xtreinos)
// ============================================================

export function createXtreinoEvent(
  date: string,
  maxTeams: number = 12,
  status: "aberto" | "fechado" | "em_andamento" | "finalizado" = "aberto"
): number {
  const db = getDb();

  const result = db
    .insert(xtreinos)
    .values({
      name: `Xtreino #${date}`,
      date,
      status,
      maxTeams,
      timeBr: "21:00",
      modality: "squad",
    })
    .returning({ id: xtreinos.id })
    .get();

  console.log(`[XTREINO-EVENTO] Criado xtreino #${result.id} para ${date}`);
  return result.id;
}

export function listXtreinoEvents() {
  const db = getDb();
  return db.select().from(xtreinos).orderBy(sql`date DESC`).all();
}

export function getXtreinoEvent(id: number) {
  const db = getDb();
  return db.select().from(xtreinos).where(eq(xtreinos.id, id)).get();
}

export function updateXtreinoStatus(
  id: number,
  status: "aberto" | "fechado" | "em_andamento" | "finalizado"
) {
  const db = getDb();
  db.update(xtreinos).set({ status, updatedAt: new Date() }).where(eq(xtreinos.id, id)).run();
  console.log(`[XTREINO-EVENTO] Status do xtreino #${id} -> ${status}`);
}

// ============================================================
// INSCRIÇÕES DE EQUIPES
// ============================================================

export function inscreverEquipe(
  xtreinoId: number,
  teamName: string,
  players: string[],
  registeredBy?: string
): number | null {
  const db = getDb();

  const evento = getXtreinoEvent(xtreinoId);
  if (!evento) {
    console.error(`[INSCRIÇÃO] Xtreino #${xtreinoId} não encontrado`);
    return null;
  }
  if (evento.status !== "aberto") {
    console.error(`[INSCRIÇÃO] Xtreino #${xtreinoId} fechado (status: ${evento.status})`);
    return null;
  }

  const existing = db
    .select()
    .from(xtreinoTeams)
    .where(and(eq(xtreinoTeams.xtreinoId, xtreinoId), eq(xtreinoTeams.teamName, teamName)))
    .get();

  if (existing) {
    console.log(`[INSCRIÇÃO] Equipe ${teamName} já inscrita no xtreino #${xtreinoId}`);
    return null;
  }

  const countResult = db
    .select({ count: sql<number>`count(*)` })
    .from(xtreinoTeams)
    .where(and(eq(xtreinoTeams.xtreinoId, xtreinoId), eq(xtreinoTeams.isReserve, false), eq(xtreinoTeams.status, "confirmed")))
    .get();

  const totalConfirmadas = countResult?.count ?? 0;

  const posResult = db
    .select({ maxSlot: sql<number>`max(slot_number)` })
    .from(xtreinoTeams)
    .where(eq(xtreinoTeams.xtreinoId, xtreinoId))
    .get();

  const nextSlot = (posResult?.maxSlot ?? 0) + 1;
  const isReserve = totalConfirmadas >= evento.maxTeams;

  const inscricao = db
    .insert(xtreinoTeams)
    .values({
      xtreinoId,
      teamName,
      isReserve,
      slotNumber: nextSlot,
      isFixed: false,
      status: isReserve ? "pending" : "confirmed",
      registeredAt: new Date().toISOString(),
    })
    .returning({ id: xtreinoTeams.id })
    .get();

  for (const playerName of players) {
    db.insert(xtreinoPlayers).values({
      xtreinoTeamId: inscricao.id,
      playerName: playerName.trim(),
      teamName,
      q1Kills: 0,
      q2Kills: 0,
      q3Kills: 0,
      totalKills: 0,
    }).run();
  }

  console.log(`[INSCRIÇÃO] ${teamName} inscrita no xtreino #${xtreinoId} (${players.length} jogadores)`);
  return inscricao.id;
}

export function removerEquipe(xtreinoId: number, teamName: string): boolean {
  const db = getDb();

  const inscricao = db
    .select()
    .from(xtreinoTeams)
    .where(and(eq(xtreinoTeams.xtreinoId, xtreinoId), eq(xtreinoTeams.teamName, teamName)))
    .get();

  if (!inscricao) {
    console.log(`[INSCRIÇÃO] Equipe ${teamName} não encontrada no xtreino #${xtreinoId}`);
    return false;
  }

  db.delete(xtreinoPlayers).where(eq(xtreinoPlayers.xtreinoTeamId, inscricao.id)).run();
  db.delete(xtreinoTeams).where(eq(xtreinoTeams.id, inscricao.id)).run();

  const remaining = db.select().from(xtreinoTeams).where(eq(xtreinoTeams.xtreinoId, xtreinoId)).orderBy(xtreinoTeams.slotNumber).all();
  for (let i = 0; i < remaining.length; i++) {
    db.update(xtreinoTeams).set({ slotNumber: i + 1 }).where(eq(xtreinoTeams.id, remaining[i].id)).run();
  }

  console.log(`[INSCRIÇÃO] Equipe ${teamName} removida do xtreino #${xtreinoId}`);
  return true;
}

export function cancelarInscricao(xtreinoId: number, teamName: string): boolean {
  const db = getDb();
  const inscricao = db
    .select()
    .from(xtreinoTeams)
    .where(and(eq(xtreinoTeams.xtreinoId, xtreinoId), eq(xtreinoTeams.teamName, teamName)))
    .get();

  if (!inscricao) return false;

  db.update(xtreinoTeams).set({ status: "cancelled" }).where(eq(xtreinoTeams.id, inscricao.id)).run();
  console.log(`[INSCRIÇÃO] ${teamName} cancelada no xtreino #${xtreinoId}`);
  return true;
}

export function reativarInscricao(xtreinoId: number, teamName: string): boolean {
  const db = getDb();
  const inscricao = db
    .select()
    .from(xtreinoTeams)
    .where(and(eq(xtreinoTeams.xtreinoId, xtreinoId), eq(xtreinoTeams.teamName, teamName)))
    .get();

  if (!inscricao) return false;

  db.update(xtreinoTeams).set({ status: "confirmed" }).where(eq(xtreinoTeams.id, inscricao.id)).run();
  console.log(`[INSCRIÇÃO] ${teamName} reativada no xtreino #${xtreinoId}`);
  return true;
}

export function getInscricoesPorXtreino(xtreinoId: number) {
  const db = getDb();
  const equipes = db.select().from(xtreinoTeams).where(eq(xtreinoTeams.xtreinoId, xtreinoId)).orderBy(xtreinoTeams.slotNumber).all();

  const result = [];
  for (const equipe of equipes) {
    const jogadores = db.select().from(xtreinoPlayers).where(eq(xtreinoPlayers.xtreinoTeamId, equipe.id)).all();
    result.push({
      ...equipe,
      status: equipe.status === "confirmed" ? "confirmada" : equipe.status === "cancelled" ? "cancelada" : equipe.status,
      players: jogadores.map(j => j.playerName),
      position: equipe.slotNumber ?? 0,
    });
  }
  return result;
}

export function getResumoInscricoes() {
  const db = getDb();
  const eventos = db.select().from(xtreinos).orderBy(sql`date DESC`).all();

  return eventos.map(evento => {
    const countResult = db
      .select({ count: sql<number>`count(*)` })
      .from(xtreinoTeams)
      .where(and(eq(xtreinoTeams.xtreinoId, evento.id), eq(xtreinoTeams.status, "confirmed")))
      .get();

    const equipesInscritas = countResult?.count ?? 0;
    return {
      ...evento,
      equipesInscritas,
      vagasRestantes: evento.maxTeams - equipesInscritas,
    };
  });
}

export function migrarEventosHistoricos() {
  const db = getDb();
  const eventosHistoricos = [
    { id: 1, date: "2026-04-30", maxTeams: 12 },
    { id: 2, date: "2026-05-07", maxTeams: 12 },
    { id: 3, date: "2026-05-19", maxTeams: 12 },
    { id: 4, date: "2026-05-21", maxTeams: 12 },
    { id: 5, date: "2026-06-08", maxTeams: 20 },
  ];

  for (const evento of eventosHistoricos) {
    const existing = db.select().from(xtreinos).where(eq(xtreinos.id, evento.id)).get();
    if (!existing) {
      db.insert(xtreinos).values({
        id: evento.id,
        name: `Xtreino #${evento.id}`,
        date: evento.date,
        status: "finalizado",
        maxTeams: evento.maxTeams,
        timeBr: "21:00",
        modality: "squad",
      }).run();
      console.log(`[MIGRAÇÃO] Evento xtreino #${evento.id} (${evento.date}) criado`);
    }
  }
  console.log("[MIGRAÇÃO] Eventos históricos migrados!");
}