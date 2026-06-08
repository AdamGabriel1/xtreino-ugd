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
  list: publicQuery
    .query(() => {
      const db = getDb();

      // Busca todas as inscrições com jogadores
      const inscricoes = db.select().from(xtreinoInscricoes).all();

      return inscricoes.map(insc => {
        const jogadores = db
          .select()
          .from(xtreinoInscricoesJogadores)
          .where(eq(xtreinoInscricoesJogadores.inscricaoId, insc.id))
          .all();

        return {
          ...insc,
          players: jogadores.map(j => j.playerName),
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

      return inscricoes.map(insc => {
        const jogadores = db
          .select()
          .from(xtreinoInscricoesJogadores)
          .where(eq(xtreinoInscricoesJogadores.inscricaoId, insc.id))
          .all();

        return {
          ...insc,
          players: jogadores.map(j => j.playerName),
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
        teamId: z.number(),
        isReserve: z.boolean().default(false),
      })
    )
    .mutation(({ input }) => {
      const db = getDb();
      const { xtreinoId, teamId, isReserve } = input;

      // Busca o nome do time pelo ID (assumindo que existe tabela teams)
      // Se não tiver, pode passar teamName direto
      const teamName = `Team ${teamId}`; // Substitua pela query real

      // Verifica se o xtreino existe e está aberto
      const evento = db
        .select()
        .from(xtreinoEventos)
        .where(eq(xtreinoEventos.id, xtreinoId))
        .get();

      if (!evento) throw new Error("Xtreino não encontrado");
      if (evento.status !== "aberto") throw new Error(`Inscrições ${evento.status}`);

      // Verifica limite de equipes
      const countResult = db
        .select({ count: sql<number>`count(*)` })
        .from(xtreinoInscricoes)
        .where(eq(xtreinoInscricoes.xtreinoId, xtreinoId))
        .get();

      const totalInscricoes = countResult?.count ?? 0;
      if (totalInscricoes >= evento.maxTeams) {
        throw new Error("Limite de equipes atingido");
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

      if (existing) throw new Error(`Equipe ${teamName} já inscrita`);

      // Insere a equipe
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

      return {
        id: inscricao.id,
        xtreinoId,
        teamName,
        status: isReserve ? "pendente" : "confirmada",
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
        teamId: z.number(),
      })
    )
    .mutation(({ input }) => {
      const db = getDb();
      const { xtreinoId, teamId } = input;

      const teamName = `Team ${teamId}`; // Substitua pela query real

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
      db
        .delete(xtreinoInscricoesJogadores)
        .where(eq(xtreinoInscricoesJogadores.inscricaoId, inscricao.id))
        .run();

      // Remove inscrição
      db
        .delete(xtreinoInscricoes)
        .where(eq(xtreinoInscricoes.id, inscricao.id))
        .run();

      return { success: true, message: `Equipe ${teamName} removida` };
    }),

  // ============================================================
  // TOGGLE TIME FIXO
  // ============================================================
  toggleFixed: adminQuery
    .input(
      z.object({
        xtreinoId: z.number(),
        teamId: z.number(),
        isReserve: z.boolean(),
      })
    )
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      // Aqui você implementa a lógica de times fixos
      // Pode ser um campo na tabela settings ou uma tabela separada
      console.log("Toggle fixed:", input);

      return { success: true };
    }),

  // ============================================================
  // MIGRAR HISTÓRICOS
  // ============================================================
  migrarHistoricos: adminQuery
    .mutation(({ ctx }) => {
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
          db.insert(xtreinoEventos).values({
            id: evento.id,
            date: evento.date,
            status: evento.status,
            maxTeams: evento.maxTeams,
            createdAt: new Date().toISOString(),
          }).run();
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