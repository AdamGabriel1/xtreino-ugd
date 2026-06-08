import { getDb } from "../api/queries/connection.js";
import { eq, and, sql } from "drizzle-orm";
import {
  xtreinoEventos,
  xtreinoInscricoes,
  xtreinoInscricoesJogadores,
} from "./schema.js";

/**
 * ============================================================
 * INSCRIÇÕES NO BANCO DE DADOS (SQLite via Drizzle ORM)
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
  registeredAt: string;
}

// ============================================================
// CRUD DE EVENTOS (Xtreinos)
// ============================================================

/**
 * Cria um novo evento de xtreino no banco
 */
export function createXtreinoEvent(
  date: string,
  maxTeams: number = 12,
  status: "aberto" | "fechado" | "em_andamento" | "finalizado" = "aberto"
): number {
  const db = getDb();

  const result = db
    .insert(xtreinoEventos)
    .values({
      date,
      status,
      maxTeams,
      createdAt: new Date().toISOString(),
    })
    .returning({ id: xtreinoEventos.id })
    .get();

  console.log(`[XTREINO-EVENTO] Criado xtreino #${result.id} para ${date}`);
  return result.id;
}

/**
 * Lista todos os eventos de xtreino
 */
export function listXtreinoEvents() {
  const db = getDb();
  return db.select().from(xtreinoEventos).orderBy(xtreinoEventos.date).all();
}

/**
 * Busca um evento por ID
 */
export function getXtreinoEvent(id: number) {
  const db = getDb();
  return db
    .select()
    .from(xtreinoEventos)
    .where(eq(xtreinoEventos.id, id))
    .get();
}

/**
 * Atualiza status de um evento
 */
export function updateXtreinoStatus(
  id: number,
  status: "aberto" | "fechado" | "em_andamento" | "finalizado"
) {
  const db = getDb();
  db
    .update(xtreinoEventos)
    .set({ status, updatedAt: new Date().toISOString() })
    .where(eq(xtreinoEventos.id, id))
    .run();
  console.log(`[XTREINO-EVENTO] Status do xtreino #${id} alterado para ${status}`);
}

// ============================================================
// INSCRIÇÕES DE EQUIPES
// ============================================================

/**
 * Inscreve uma equipe em um xtreino
 * Retorna o ID da inscrição ou null se falhar
 */
export function inscreverEquipe(
  xtreinoId: number,
  teamName: string,
  players: string[],
  registeredBy?: string
): number | null {
  const db = getDb();

  // Verifica se o xtreino existe e está aberto
  const evento = getXtreinoEvent(xtreinoId);
  if (!evento) {
    console.error(`[INSCRIÇÃO] Xtreino #${xtreinoId} não encontrado`);
    return null;
  }
  if (evento.status !== "aberto") {
    console.error(`[INSCRIÇÃO] Xtreino #${xtreinoId} não está aberto (status: ${evento.status})`);
    return null;
  }

  // Verifica limite de equipes
  const inscricoesAtuais = db
    .select({ count: sql<number>`count(*)` })
    .from(xtreinoInscricoes)
    .where(eq(xtreinoInscricoes.xtreinoId, xtreinoId))
    .get();

  // FIX: verifica se inscricoesAtuais existe antes de acessar count
  const totalInscricoes = inscricoesAtuais?.count ?? 0;

  if (totalInscricoes >= evento.maxTeams) {
    console.error(`[INSCRIÇÃO] Limite de ${evento.maxTeams} equipes atingido`);
    return null;
  }

  // Verifica se equipe já está inscrita
  const existing = db
    .select()
    .from(xtreinoInscricoes)
    .where(
      and(
        eq(xtreinoInscricoes.xtreinoId, xtreinoId),
        eq(xtreinoInscricoes.teamName, teamName)
      )
    )
    .get();

  if (existing) {
    console.log(`[INSCRIÇÃO] Equipe ${teamName} já inscrita no xtreino #${xtreinoId}`);
    return null;
  }

  // Insere a equipe
  const inscricao = db
    .insert(xtreinoInscricoes)
    .values({
      xtreinoId,
      teamName,
      status: "confirmada",
      registeredBy,
      registeredAt: new Date().toISOString(),
    })
    .returning({ id: xtreinoInscricoes.id })
    .get();

  // Insere os jogadores
  for (const playerName of players) {
    db.insert(xtreinoInscricoesJogadores).values({
      inscricaoId: inscricao.id,
      playerName,
    }).run();
  }

  console.log(`[INSCRIÇÃO] Equipe ${teamName} inscrita no xtreino #${xtreinoId} (${players.length} jogadores)`);
  return inscricao.id;
}

/**
 * Remove uma equipe do xtreino
 */
export function removerEquipe(xtreinoId: number, teamName: string): boolean {
  const db = getDb();

  const inscricao = db
    .select()
    .from(xtreinoInscricoes)
    .where(
      and(
        eq(xtreinoInscricoes.xtreinoId, xtreinoId),
        eq(xtreinoInscricoes.teamName, teamName)
      )
    )
    .get();

  if (!inscricao) {
    console.log(`[INSCRIÇÃO] Equipe ${teamName} não encontrada no xtreino #${xtreinoId}`);
    return false;
  }

  // Remove jogadores primeiro (FK constraint)
  db
    .delete(xtreinoInscricoesJogadores)
    .where(eq(xtreinoInscricoesJogadores.inscricaoId, inscricao.id))
    .run();

  // Remove inscrição
  db
    .delete(xtreinoInscricoes)
    .where(eq(xtreinoInscricoes.id, inscricao.id))
    .run();

  console.log(`[INSCRIÇÃO] Equipe ${teamName} removida do xtreino #${xtreinoId}`);
  return true;
}

/**
 * Lista todas as equipes inscritas em um xtreino
 */
export function getInscricoesPorXtreino(xtreinoId: number) {
  const db = getDb();

  const equipes = db
    .select()
    .from(xtreinoInscricoes)
    .where(eq(xtreinoInscricoes.xtreinoId, xtreinoId))
    .all();

  const result = [];
  for (const equipe of equipes) {
    const jogadores = db
      .select()
      .from(xtreinoInscricoesJogadores)
      .where(eq(xtreinoInscricoesJogadores.inscricaoId, equipe.id))
      .all();

    result.push({
      ...equipe,
      players: jogadores.map(j => j.playerName),
    });
  }

  return result;
}

/**
 * Lista todos os xtreinos com contagem de equipes
 */
export function getResumoInscricoes() {
  const db = getDb();

  const eventos = db.select().from(xtreinoEventos).orderBy(xtreinoEventos.date).all();

  return eventos.map(evento => {
    const countResult = db
      .select({ count: sql<number>`count(*)` })
      .from(xtreinoInscricoes)
      .where(eq(xtreinoInscricoes.xtreinoId, evento.id))
      .get();

    // FIX: verifica se countResult existe antes de acessar count
    const equipesInscritas = countResult?.count ?? 0;

    return {
      ...evento,
      equipesInscritas,
      vagasRestantes: evento.maxTeams - equipesInscritas,
    };
  });
}

// ============================================================
// MIGRAÇÃO: Cria eventos para os xtreinos históricos
// ============================================================

/**
 * Cria os eventos de xtreino para os dados históricos existentes
 * Rode uma vez após criar as tabelas
 */
export function migrarEventosHistoricos() {
  const db = getDb();

  const eventosHistoricos = [
    { id: 1, date: "2026-04-30", maxTeams: 12 },
    { id: 2, date: "2026-05-07", maxTeams: 12 },
    { id: 3, date: "2026-05-19", maxTeams: 12 },
    { id: 4, date: "2026-05-21", maxTeams: 12 },
  ];

  for (const evento of eventosHistoricos) {
    const existing = db
      .select()
      .from(xtreinoEventos)
      .where(eq(xtreinoEventos.id, evento.id))
      .get();

    if (!existing) {
      db.insert(xtreinoEventos).values({
        id: evento.id,
        date: evento.date,
        status: "finalizado",
        maxTeams: evento.maxTeams,
        createdAt: new Date().toISOString(),
      }).run();
      console.log(`[MIGRAÇÃO] Evento xtreino #${evento.id} (${evento.date}) criado`);
    }
  }

  console.log("[MIGRAÇÃO] Eventos históricos migrados!");
}

// ============================================================
// EXEMPLOS DE USO (descomente para testar)
// ============================================================

// const novoXtreinoId = createXtreinoEvent("2026-05-26", 12, "aberto");
// inscreverEquipe(novoXtreinoId, "UGD Threat", ["UGD Treon", "UGD Kaze", "UGD cool7", "UGD ARISE"], "admin");
// inscreverEquipe(novoXtreinoId, "CMF", ["CMF Syx", "CMF Leo", "CMF Stygian", "CMF MOIZO"], "admin");
// console.log(getInscricoesPorXtreino(novoXtreinoId));
// console.log(getResumoInscricoes());