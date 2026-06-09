import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "../middleware.js";
import { getDb } from "../queries/connection.js";
import {
  xtreinos,
  xtreinoTeams,
  teams,
} from "../../db/schema.js";
import { eq, and, sql } from "drizzle-orm";
import { verifyToken } from "../lib/auth.js";

export const registrationsRouter = createRouter({
  // ============================================================
  // LISTAR INSCRIÇÕES (todas as equipes em todos os xtreinos)
  // ============================================================
  list: publicQuery.query(() => {
    try {
      const db = getDb();
      const inscricoes = db.select().from(xtreinoTeams).all();

      return inscricoes.map((insc) => {
        // Busca dados do time se teamId existir
        let teamData = null;
        if (insc.teamId) {
          teamData = db
            .select()
            .from(teams)
            .where(eq(teams.id, insc.teamId))
            .get();
        }

        return {
          ...insc,
          teamName: teamData?.name ?? insc.teamName,
          teamTag: teamData?.tag ?? "",
          teamLogo: teamData?.logo ?? null,
        };
      });
    } catch (e) {
      console.error("[registrations.list] Erro geral:", e);
      throw e;
    }
  }),

  // ============================================================
  // LISTAR POR XTREINO
  // ============================================================
  listByXtreino: publicQuery
    .input(z.object({ xtreinoId: z.number() }))
    .query(({ input }) => {
      try {
        const db = getDb();
        const inscricoes = db
          .select()
          .from(xtreinoTeams)
          .where(eq(xtreinoTeams.xtreinoId, input.xtreinoId))
          .all();

        return inscricoes.map((insc) => {
          let teamData = null;
          if (insc.teamId) {
            teamData = db
              .select()
              .from(teams)
              .where(eq(teams.id, insc.teamId))
              .get();
          }

          return {
            ...insc,
            teamName: teamData?.name ?? insc.teamName,
            teamTag: teamData?.tag ?? "",
            teamLogo: teamData?.logo ?? null,
          };
        });
      } catch (e) {
        console.error("[registrations.listByXtreino] Erro:", e);
        throw e;
      }
    }),

  // ============================================================
  // REGISTRAR EQUIPE (inscrever no xtreino)
  // ============================================================
  register: publicQuery
    .input(
      z.object({
        xtreinoId: z.number(),
        teamName: z.string().min(1),
        teamId: z.number().optional(),
        isReserve: z.boolean().default(false),
      })
    )
    .mutation(({ input }) => {
      console.log("[registrations.register] Input recebido:", JSON.stringify(input));

      try {
        const db = getDb();
        const { xtreinoId, teamName, teamId, isReserve } = input;

        // Verifica se o xtreino existe e está aberto
        console.log("[registrations.register] Buscando xtreino:", xtreinoId);
        const evento = db
          .select()
          .from(xtreinos)
          .where(eq(xtreinos.id, xtreinoId))
          .get();

        if (!evento) {
          console.error("[registrations.register] Xtreino não encontrado:", xtreinoId);
          throw new Error("Xtreino não encontrado");
        }
        console.log("[registrations.register] Xtreino encontrado, status:", evento.status);

        if (evento.status !== "aberto") {
          throw new Error(`Inscrições ${evento.status}`);
        }

        // Verifica limite de equipes confirmadas (não reservas)
        console.log("[registrations.register] Verificando limite...");
        const countResult = db
          .select({ count: sql<number>`count(*)` })
          .from(xtreinoTeams)
          .where(
            and(
              eq(xtreinoTeams.xtreinoId, xtreinoId),
              eq(xtreinoTeams.isReserve, false)
            )
          )
          .get();

        const totalConfirmadas = countResult?.count ?? 0;
        console.log("[registrations.register] Confirmadas:", totalConfirmadas, "Max:", evento.maxTeams);

        if (totalConfirmadas >= evento.maxTeams) {
          throw new Error("Limite de equipes atingido");
        }

        // Verifica se equipe já está inscrita neste xtreino
        console.log("[registrations.register] Verificando duplicata...");
        let existing = null;

        if (teamId) {
          existing = db
            .select()
            .from(xtreinoTeams)
            .where(
              and(
                eq(xtreinoTeams.xtreinoId, xtreinoId),
                eq(xtreinoTeams.teamId, teamId)
              )
            )
            .get();
        } else {
          existing = db
            .select()
            .from(xtreinoTeams)
            .where(
              and(
                eq(xtreinoTeams.xtreinoId, xtreinoId),
                eq(xtreinoTeams.teamName, teamName)
              )
            )
            .get();
        }

        if (existing) {
          throw new Error(`Equipe ${teamName} já inscrita`);
        }

        // Calcula próximo slot
        console.log("[registrations.register] Calculando slot...");
        const posResult = db
          .select({ maxSlot: sql<number>`max(slot_number)` })
          .from(xtreinoTeams)
          .where(eq(xtreinoTeams.xtreinoId, xtreinoId))
          .get();

        const nextSlot = (posResult?.maxSlot ?? 0) + 1;
        console.log("[registrations.register] Próximo slot:", nextSlot);

        // Determina se é reserva (se explicitamente marcado ou slots esgotados)
        const finalIsReserve = isReserve || (nextSlot > (evento.maxTeams ?? 20));

        // Insere a equipe
        console.log("[registrations.register] Inserindo inscrição...");
        db.insert(xtreinoTeams).values({
          xtreinoId,
          teamId: teamId ?? null,
          teamName,
          isReserve: finalIsReserve,
          slotNumber: nextSlot,
          status: finalIsReserve ? "pendente" : "confirmed",
          registeredAt: new Date().toISOString(),
        }).run();

        console.log("[registrations.register] SUCESSO!");
        return {
          xtreinoId,
          teamName,
          status: finalIsReserve ? "pendente" : "confirmed",
          slotNumber: nextSlot,
          isReserve: finalIsReserve,
          success: true,
        };
      } catch (e) {
        console.error("[registrations.register] ERRO GERAL:", e);
        throw e;
      }
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
      try {
        const db = getDb();
        const { xtreinoId, teamName } = input;

        const inscricao = db
          .select()
          .from(xtreinoTeams)
          .where(
            and(
              eq(xtreinoTeams.xtreinoId, xtreinoId),
              eq(xtreinoTeams.teamName, teamName)
            )
          )
          .get();

        if (!inscricao) throw new Error("Inscrição não encontrada");

        db.delete(xtreinoTeams)
          .where(eq(xtreinoTeams.id, inscricao.id))
          .run();

        return { success: true, message: `Equipe ${teamName} removida` };
      } catch (e) {
        console.error("[registrations.unregister] ERRO:", e);
        throw e;
      }
    }),

  // ============================================================
  // CANCELAR INSCRIÇÃO
  // ============================================================
  cancel: publicQuery
    .input(
      z.object({
        xtreinoId: z.number(),
        teamName: z.string().min(1),
      })
    )
    .mutation(({ input }) => {
      try {
        const db = getDb();
        const { xtreinoId, teamName } = input;

        const inscricao = db
          .select()
          .from(xtreinoTeams)
          .where(
            and(
              eq(xtreinoTeams.xtreinoId, xtreinoId),
              eq(xtreinoTeams.teamName, teamName)
            )
          )
          .get();

        if (!inscricao) throw new Error("Inscrição não encontrada");

        db.update(xtreinoTeams)
          .set({ status: "cancelled" })
          .where(eq(xtreinoTeams.id, inscricao.id))
          .run();

        return { success: true, message: `Inscrição de ${teamName} cancelada` };
      } catch (e) {
        console.error("[registrations.cancel] ERRO:", e);
        throw e;
      }
    }),

  // ============================================================
  // TOGGLE TIME FIXO
  // ============================================================
  toggleFixed: adminQuery
    .input(
      z.object({
        xtreinoId: z.number(),
        teamName: z.string().min(1),
      })
    )
    .mutation(({ input, ctx }) => {
      try {
        const payload = verifyToken(ctx.adminToken as string);
        if (!payload) throw new Error("Invalid token");

        const db = getDb();
        const { xtreinoId, teamName } = input;

        const inscricao = db
          .select()
          .from(xtreinoTeams)
          .where(
            and(
              eq(xtreinoTeams.xtreinoId, xtreinoId),
              eq(xtreinoTeams.teamName, teamName)
            )
          )
          .get();

        if (!inscricao) throw new Error("Inscrição não encontrada");

        const newFixed = !inscricao.isFixed;

        db.update(xtreinoTeams)
          .set({ isFixed: newFixed })
          .where(eq(xtreinoTeams.id, inscricao.id))
          .run();

        console.log("[registrations.toggleFixed]:", teamName, "-> isFixed:", newFixed);
        return { success: true, teamName, isFixed: newFixed };
      } catch (e) {
        console.error("[registrations.toggleFixed] ERRO:", e);
        throw e;
      }
    }),

  // ============================================================
  // MIGRAR HISTÓRICOS (cria xtreinos dos dados históricos)
  // ============================================================
  migrarHistoricos: adminQuery.mutation(({ ctx }) => {
    try {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();

      const eventosHistoricos = [
        { id: 1, date: "2026-04-30", name: "Xtreino #1", maxTeams: 12, status: "finalizado" as const },
        { id: 2, date: "2026-05-07", name: "Xtreino #2", maxTeams: 12, status: "finalizado" as const },
        { id: 3, date: "2026-05-19", name: "Xtreino #3", maxTeams: 12, status: "finalizado" as const },
        { id: 4, date: "2026-05-21", name: "Xtreino #4", maxTeams: 12, status: "finalizado" as const },
        { id: 5, date: "2026-06-08", name: "Xtreino #5", maxTeams: 20, status: "finalizado" as const },
      ];

      const criados = [];
      for (const evento of eventosHistoricos) {
        const existing = db
          .select()
          .from(xtreinos)
          .where(eq(xtreinos.id, evento.id))
          .get();

        if (!existing) {
          db.insert(xtreinos)
            .values({
              id: evento.id,
              name: evento.name,
              date: evento.date,
              status: evento.status,
              maxTeams: evento.maxTeams,
              timeBr: "21:00",
              modality: "squad",
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
    } catch (e) {
      console.error("[registrations.migrarHistoricos] ERRO:", e);
      throw e;
    }
  }),
});