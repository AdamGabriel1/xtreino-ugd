import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "../middleware.js";
import { getDb } from "../queries/connection.js";
import {
  xtreinoEventos,
  xtreinoInscricoes,
  xtreinoInscricoesJogadores,
} from "../../db/schema.js";
import { eq, and, sql } from "drizzle-orm";
import { verifyToken } from "../lib/auth.js";

export const registrationsRouter = createRouter({
  // ============================================================
  // LISTAR INSCRIÇÕES
  // ============================================================
  list: publicQuery.query(() => {
    const db = getDb();

    const inscricoes = db.select().from(xtreinoInscricoes).all();

    return inscricoes.map((insc) => {
      const jogadores = db
        .select()
        .from(xtreinoInscricoesJogadores)
        .where(eq(xtreinoInscricoesJogadores.inscricaoId, insc.id))
        .all();

      return {
        ...insc,
        players: jogadores.map((j) => j.playerName),
      };
    });
  }),

  // ============================================================
  // LISTAR POR XTREINO
  // ============================================================
  listByXtreino: publicQuery
    .input(z.object({ xtreinoId: z.number() }))
    .query(({ input }) => {
      const db = getDb();

      const inscricoes = db
        .select()
        .from(xtreinoInscricoes)
        .where(eq(xtreinoInscricoes.xtreinoId, input.xtreinoId))
        .all();

      return inscricoes.map((insc) => {
        const jogadores = db
          .select()
          .from(xtreinoInscricoesJogadores)
          .where(eq(xtreinoInscricoesJogadores.inscricaoId, insc.id))
          .all();

        return {
          ...insc,
          players: jogadores.map((j) => j.playerName),
        };
      });
    }),

  // ============================================================
  // REGISTRAR EQUIPE (inscrever)
  // ============================================================
  register: publicQuery
    .input(
      z.object({
        xtreinoId: z.number(),
        teamName: z.string().min(1),
        players: z.array(z.string().min(1)).default([]),
        isReserve: z.boolean().default(false),
      })
    )
    .mutation(({ input }) => {
      const db = getDb();
      const { xtreinoId, teamName, players, isReserve } = input;

      // Verifica se o xtreino existe e está aberto
      const evento = db
        .select()
        .from(xtreinoEventos)
        .where(eq(xtreinoEventos.id, xtreinoId))
        .get();

      if (!evento) throw new Error("Xtreino não encontrado");
      if (evento.status !== "aberto")
        throw new Error(`Inscrições ${evento.status}`);

      // Verifica limite de equipes confirmadas
      const countResult = db
        .select({ count: sql<number>`count(*)` })
        .from(xtreinoInscricoes)
        .where(
          and(
            eq(xtreinoInscricoes.xtreinoId, xtreinoId),
            eq(xtreinoInscricoes.status, "confirmada")
          )
        )
        .get();

      const totalConfirmadas = countResult?.count ?? 0;
      if (totalConfirmadas >= evento.maxTeams) {
        throw new Error("Limite de equipes atingido");
      }

      // Verifica se equipe já está inscrita neste xtreino
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

      if (existing) throw new Error(`Equipe ${teamName} já inscrita`);

      // Calcula posição (próximo número disponível)
      const posResult = db
        .select({ maxPos: sql<number>`max(position)` })
        .from(xtreinoInscricoes)
        .where(eq(xtreinoInscricoes.xtreinoId, xtreinoId))
        .get();

      const nextPosition = (posResult?.maxPos ?? 0) + 1;

      // Insere a equipe (SEM position no .values() - usa default do schema)
      const inscricao = db
        .insert(xtreinoInscricoes)
        .values({
          xtreinoId,
          teamName,
          status: isReserve ? "pendente" : "confirmada",
          registeredAt: new Date().toISOString(),
        })
        .returning({ id: xtreinoInscricoes.id })
        .get();

      // Atualiza a posição manualmente (workaround se não tiver coluna no schema)
      db.update(xtreinoInscricoes)
        .set({ position: nextPosition })
        .where(eq(xtreinoInscricoes.id, inscricao.id))
        .run();

      // Insere os jogadores na tabela de relacionamento
      if (players.length > 0) {
        for (const playerName of players) {
          db.insert(xtreinoInscricoesJogadores)
            .values({
              inscricaoId: inscricao.id,
              playerName,
            })
            .run();
        }
      }

      return {
        id: inscricao.id,
        xtreinoId,
        teamName,
        status: isReserve ? "pendente" : "confirmada",
        players,
        position: nextPosition,
        success: true,
      };
    }),

  // ============================================================
  // REMOVER INSCRIÇÃO
  // ============================================================
  unregister: publicQuery
    .input(
      z.object({
        xtreinoId: z.number(),
        teamName: z.string().min(1),
      })
    )
    .mutation(({ input }) => {
      const db = getDb();
      const { xtreinoId, teamName } = input;

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

      if (!inscricao) throw new Error("Inscrição não encontrada");

      // Remove jogadores primeiro (FK)
      db.delete(xtreinoInscricoesJogadores)
        .where(eq(xtreinoInscricoesJogadores.inscricaoId, inscricao.id))
        .run();

      // Remove inscrição
      db.delete(xtreinoInscricoes)
        .where(eq(xtreinoInscricoes.id, inscricao.id))
        .run();

      return { success: true, message: `Equipe ${teamName} removida` };
    }),

  // ============================================================
  // CANCELAR INSCRIÇÃO (muda status para cancelada)
  // ============================================================
  cancel: publicQuery
    .input(
      z.object({
        xtreinoId: z.number(),
        teamName: z.string().min(1),
      })
    )
    .mutation(({ input }) => {
      const db = getDb();
      const { xtreinoId, teamName } = input;

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

      if (!inscricao) throw new Error("Inscrição não encontrada");

      db.update(xtreinoInscricoes)
        .set({ status: "cancelada" })
        .where(eq(xtreinoInscricoes.id, inscricao.id))
        .run();

      return { success: true, message: `Inscrição de ${teamName} cancelada` };
    }),

  // ============================================================
  // TOGGLE TIME FIXO
  // ============================================================
  toggleFixed: adminQuery
    .input(
      z.object({
        teamName: z.string().min(1),
      })
    )
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      console.log("Toggle fixed:", input.teamName);

      return { success: true, teamName: input.teamName };
    }),

  // ============================================================
  // MIGRAR HISTÓRICOS
  // ============================================================
  migrarHistoricos: adminQuery.mutation(({ ctx }) => {
    const payload = verifyToken(ctx.adminToken as string);
    if (!payload) throw new Error("Invalid token");

    const db = getDb();

    const eventosHistoricos = [
      { id: 1, date: "2026-04-30", maxTeams: 12, status: "finalizado" as const },
      { id: 2, date: "2026-05-07", maxTeams: 12, status: "finalizado" as const },
      { id: 3, date: "2026-05-19", maxTeams: 12, status: "finalizado" as const },
      { id: 4, date: "2026-05-21", maxTeams: 12, status: "finalizado" as const },
    ];

    const criados = [];
    for (const evento of eventosHistoricos) {
      const existing = db
        .select()
        .from(xtreinoEventos)
        .where(eq(xtreinoEventos.id, evento.id))
        .get();

      if (!existing) {
        db.insert(xtreinoEventos)
          .values({
            id: evento.id,
            date: evento.date,
            status: evento.status,
            maxTeams: evento.maxTeams,
            createdAt: new Date().toISOString(),
          })
          .run();
        criados.push(evento);
      }
    }

    return {
      success: true,
      criados: criados.length,
      eventos: criados,
    };
  }),
});