import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "../../api/middleware.js";
import { getDb } from "../../api/queries/connection.js";
import {
  xtreinos,
  xtreinoTeams,
  xtreinoResults,
  xtreinoPlayerStats,
  xtreinoSchedule,
  teams,
  settings,
} from "../../db/schema.js";
import { eq, desc, and, sql, isNull } from "drizzle-orm";
import { verifyToken } from "../../api/lib/auth.js";
import { calcularPontosXtreino } from "../../api/lib/pontuacao.js";

export const xtreinosRouter = createRouter({
  // ============================================================
  // LISTAR XTREINOS
  // ============================================================
  list: publicQuery
    .input(
      z.object({
        status: z.string().optional(),
      }).optional()
    )
    .query(({ input }) => {
      const db = getDb();
      if (input?.status) {
        return db
          .select()
          .from(xtreinos)
          .where(eq(xtreinos.status, input.status))
          .orderBy(desc(xtreinos.createdAt))
          .all();
      }
      return db.select().from(xtreinos).orderBy(desc(xtreinos.createdAt)).all();
    }),

  // ============================================================
  // OBTER XTREINO POR ID (com times, resultados e inscrições)
  // ============================================================
  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(({ input }) => {
      const db = getDb();
      const xtreino = db
        .select()
        .from(xtreinos)
        .where(eq(xtreinos.id, input.id))
        .get();

      if (!xtreino) return null;

      // Times inscritos (com dados completos do time)
      const xTeams = db
        .select()
        .from(xtreinoTeams)
        .where(eq(xtreinoTeams.xtreinoId, input.id))
        .all();

      // Buscar dados dos times (teamId pode ser null)
      const teamIds = xTeams
        .map(t => t.teamId)
        .filter((tid): tid is number => tid != null);

      const teamData = teamIds.length > 0
        ? db.select().from(teams).where(sql`${teams.id} IN (${sql.join(teamIds, sql`, `)})`).all()
        : [];

      const teamMap = new Map(teamData.map(t => [t.id, t]));

      const mainTeams = xTeams
        .filter(t => !t.isReserve)
        .map(t => ({
          ...t,
          teamName: teamMap.get(t.teamId ?? -1)?.name ?? t.teamName ?? "Desconhecido",
          teamTag: teamMap.get(t.teamId ?? -1)?.tag ?? "",
        }));

      const reserveTeams = xTeams
        .filter(t => t.isReserve)
        .map(t => ({
          ...t,
          teamName: teamMap.get(t.teamId ?? -1)?.name ?? t.teamName ?? "Desconhecido",
          teamTag: teamMap.get(t.teamId ?? -1)?.tag ?? "",
        }));

      // Resultados do xtreino
      const results = db
        .select()
        .from(xtreinoResults)
        .where(eq(xtreinoResults.xtreinoId, input.id))
        .orderBy(sql`COALESCE(q1_pos, 999), COALESCE(q2_pos, 999), COALESCE(q3_pos, 999)`)
        .all();

      // Stats dos jogadores
      const playerStats = db
        .select()
        .from(xtreinoPlayerStats)
        .where(eq(xtreinoPlayerStats.xtreinoId, input.id))
        .orderBy(desc(xtreinoPlayerStats.totalKills))
        .all();

      return {
        ...xtreino,
        teams: mainTeams,
        reserves: reserveTeams,
        results,
        playerStats,
      };
    }),

  // ============================================================
  // CRIAR XTREINO
  // ============================================================
  create: adminQuery
    .input(
      z.object({
        name: z.string().min(1),
        date: z.string().min(1),
        timeMx: z.string().optional(),
        timeBr: z.string().optional().default("21:00"),
        modality: z.string().min(1),
        maxTeams: z.number().optional(),
        rules: z.string().optional(),
        discordLink: z.string().optional(),
        whatsappLink: z.string().optional(),
        status: z.string().optional(),
      })
    )
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();
      const result = db.insert(xtreinos).values({
        ...input,
        timeBr: input.timeBr ?? "21:00",
      }).run();
      return { id: Number(result.lastInsertRowid), success: true };
    }),

  // ============================================================
  // ATUALIZAR XTREINO
  // ============================================================
  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        date: z.string().optional(),
        timeMx: z.string().optional(),
        timeBr: z.string().optional(),
        modality: z.string().optional(),
        maxTeams: z.number().optional(),
        rules: z.string().optional(),
        discordLink: z.string().optional(),
        whatsappLink: z.string().optional(),
        status: z.string().optional(),
      })
    )
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const { id, ...data } = input;
      const db = getDb();
      db
        .update(xtreinos)
        .set(data)
        .where(eq(xtreinos.id, id))
        .run();
      return { success: true };
    }),

  // ============================================================
  // DELETAR XTREINO
  // ============================================================
  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();
      // Deleta dados relacionados primeiro
      db.delete(xtreinoTeams).where(eq(xtreinoTeams.xtreinoId, input.id)).run();
      db.delete(xtreinoResults).where(eq(xtreinoResults.xtreinoId, input.id)).run();
      db.delete(xtreinoPlayerStats).where(eq(xtreinoPlayerStats.xtreinoId, input.id)).run();
      db.delete(xtreinos).where(eq(xtreinos.id, input.id)).run();
      return { success: true };
    }),

  // ============================================================
  // ADICIONAR TIME AO XTREINO
  // ============================================================
  addTeam: adminQuery
    .input(
      z.object({
        xtreinoId: z.number(),
        teamId: z.number(),
        isReserve: z.boolean().optional(),
        slotNumber: z.number().optional(),
      })
    )
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();

      // Buscar nome do time
      const team = db
        .select()
        .from(teams)
        .where(eq(teams.id, input.teamId))
        .get();

      if (!team) throw new Error("Time não encontrado");

      // Verificar se time já está inscrito
      const existing = db
        .select()
        .from(xtreinoTeams)
        .where(
          and(
            eq(xtreinoTeams.xtreinoId, input.xtreinoId),
            eq(xtreinoTeams.teamId, input.teamId)
          )
        )
        .get();

      if (existing) throw new Error("Time já inscrito neste xtreino");

      // Contar times confirmados para definir slot
      const confirmed = db
        .select()
        .from(xtreinoTeams)
        .where(
          and(
            eq(xtreinoTeams.xtreinoId, input.xtreinoId),
            eq(xtreinoTeams.isReserve, false)
          )
        )
        .all();

      const isReserve = input.isReserve ?? (confirmed.length >= 10);
      const slotNumber = input.slotNumber ?? (confirmed.length + 1);

      db.insert(xtreinoTeams).values({
        xtreinoId: input.xtreinoId,
        teamId: input.teamId,
        teamName: team.name,
        isReserve,
        slotNumber,
      }).run();

      return { success: true, isReserve, slotNumber };
    }),

  // ============================================================
  // REMOVER TIME DO XTREINO
  // ============================================================
  removeTeam: adminQuery
    .input(
      z.object({
        xtreinoId: z.number(),
        teamId: z.number(),
      })
    )
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();
      db
        .delete(xtreinoTeams)
        .where(
          and(
            eq(xtreinoTeams.xtreinoId, input.xtreinoId),
            eq(xtreinoTeams.teamId, input.teamId)
          )
        )
        .run();
      return { success: true };
    }),

  // ============================================================
  // ATUALIZAR SLOT/RESERVA DO TIME
  // ============================================================
  updateTeamSlot: adminQuery
    .input(
      z.object({
        xtreinoId: z.number(),
        teamId: z.number(),
        slotNumber: z.number().optional(),
        isReserve: z.boolean().optional(),
      })
    )
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();
      const { xtreinoId, teamId, ...data } = input;

      db
        .update(xtreinoTeams)
        .set(data)
        .where(
          and(
            eq(xtreinoTeams.xtreinoId, xtreinoId),
            eq(xtreinoTeams.teamId, teamId)
          )
        )
        .run();

      return { success: true };
    }),

  // ============================================================
  // ADICIONAR RESULTADO DO XTREINO
  // ============================================================
  addResult: adminQuery
    .input(
      z.object({
        xtreinoId: z.number(),
        date: z.string(),
        teamName: z.string(),
        q1Pos: z.number().optional(),
        q2Pos: z.number().optional(),
        q3Pos: z.number().optional(),
        totalPoints: z.number().optional(),
      })
    )
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const { xtreinoId, ...data } = input;
      const db = getDb();

      // Calcula totalPoints automaticamente se não fornecido
      const totalPoints =
        input.totalPoints ?? calcularPontosXtreino(input.q1Pos, input.q2Pos, input.q3Pos);

      db.insert(xtreinoResults).values({
        xtreinoId,
        ...data,
        totalPoints,
      }).run();
      return { success: true, totalPoints };
    }),

  // ============================================================
  // ADICIONAR STATS DE JOGADOR NO XTREINO
  // ============================================================
  addPlayerStats: adminQuery
    .input(
      z.object({
        xtreinoId: z.number(),
        date: z.string(),
        teamName: z.string(),
        playerName: z.string(),
        q1Kills: z.number().default(0),
        q2Kills: z.number().default(0),
        q3Kills: z.number().default(0),
        totalKills: z.number().default(0),
      })
    )
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const { xtreinoId, ...data } = input;
      const db = getDb();

      // Calcula totalKills automaticamente se não fornecido ou for 0
      const totalKills =
        input.totalKills > 0
          ? input.totalKills
          : input.q1Kills + input.q2Kills + input.q3Kills;

      db.insert(xtreinoPlayerStats).values({
        xtreinoId,
        ...data,
        totalKills,
      }).run();
      return { success: true, totalKills };
    }),

  // ============================================================
  // LISTAR RESULTADOS DO XTREINO
  // ============================================================
  listResults: publicQuery
    .input(
      z.object({
        date: z.string().optional(),
        xtreinoId: z.number().optional(),
      }).optional()
    )
    .query(({ input }) => {
      const db = getDb();
      if (input?.xtreinoId) {
        return db
          .select()
          .from(xtreinoResults)
          .where(eq(xtreinoResults.xtreinoId, input.xtreinoId))
          .orderBy(sql`COALESCE(q1_pos, 999)`)
          .all();
      }
      if (input?.date) {
        return db
          .select()
          .from(xtreinoResults)
          .where(eq(xtreinoResults.date, input.date))
          .orderBy(sql`COALESCE(q1_pos, 999)`)
          .all();
      }
      return db.select().from(xtreinoResults).orderBy(desc(xtreinoResults.date)).all();
    }),

  // ============================================================
  // LISTAR STATS DE JOGADORES DO XTREINO
  // ============================================================
  listPlayerStats: publicQuery
    .input(
      z.object({
        date: z.string().optional(),
        xtreinoId: z.number().optional(),
        teamName: z.string().optional(),
      }).optional()
    )
    .query(({ input }) => {
      const db = getDb();
      if (input?.xtreinoId) {
        return db
          .select()
          .from(xtreinoPlayerStats)
          .where(eq(xtreinoPlayerStats.xtreinoId, input.xtreinoId))
          .orderBy(desc(xtreinoPlayerStats.totalKills))
          .all();
      }
      if (input?.date && input?.teamName) {
        return db
          .select()
          .from(xtreinoPlayerStats)
          .where(
            and(
              eq(xtreinoPlayerStats.date, input.date),
              eq(xtreinoPlayerStats.teamName, input.teamName)
            )
          )
          .orderBy(desc(xtreinoPlayerStats.totalKills))
          .all();
      }
      if (input?.date) {
        return db
          .select()
          .from(xtreinoPlayerStats)
          .where(eq(xtreinoPlayerStats.date, input.date))
          .orderBy(desc(xtreinoPlayerStats.totalKills))
          .all();
      }
      return db.select().from(xtreinoPlayerStats).orderBy(desc(xtreinoPlayerStats.totalKills)).all();
    }),

  // ============================================================
  // RANKING DE TIMES DO XTREINO (acumulado)
  // ============================================================
  teamRanking: publicQuery
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(({ input }) => {
      const db = getDb();
      const results = db
        .select({
          teamName: xtreinoResults.teamName,
          totalPoints: sql<number>`SUM(COALESCE(${xtreinoResults.totalPoints}, 0))`.as("totalPoints"),
          participations: sql<number>`COUNT(*)`.as("participations"),
          avgQ1: sql<number>`AVG(COALESCE(${xtreinoResults.q1Pos}, 0))`.as("avgQ1"),
          avgQ2: sql<number>`AVG(COALESCE(${xtreinoResults.q2Pos}, 0))`.as("avgQ2"),
          avgQ3: sql<number>`AVG(COALESCE(${xtreinoResults.q3Pos}, 0))`.as("avgQ3"),
        })
        .from(xtreinoResults)
        .groupBy(xtreinoResults.teamName)
        .orderBy(desc(sql`totalPoints`))
        .all();

      return input?.limit ? results.slice(0, input.limit) : results;
    }),

  // ============================================================
  // RANKING DE JOGADORES DO XTREINO (acumulado)
  // ============================================================
  playerRanking: publicQuery
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(({ input }) => {
      const db = getDb();
      const results = db
        .select({
          playerName: xtreinoPlayerStats.playerName,
          teamName: xtreinoPlayerStats.teamName,
          totalKills: sql<number>`SUM(${xtreinoPlayerStats.totalKills})`.as("totalKills"),
          totalQ1: sql<number>`SUM(${xtreinoPlayerStats.q1Kills})`.as("totalQ1"),
          totalQ2: sql<number>`SUM(${xtreinoPlayerStats.q2Kills})`.as("totalQ2"),
          totalQ3: sql<number>`SUM(${xtreinoPlayerStats.q3Kills})`.as("totalQ3"),
          participations: sql<number>`COUNT(*)`.as("participations"),
          avgKills: sql<number>`AVG(${xtreinoPlayerStats.totalKills})`.as("avgKills"),
        })
        .from(xtreinoPlayerStats)
        .groupBy(xtreinoPlayerStats.playerName)
        .orderBy(desc(sql`totalKills`))
        .all();

      return input?.limit ? results.slice(0, input.limit) : results;
    }),

  // ============================================================
  // AGENDAMENTO DE XTREINOS
  // ============================================================
  schedule: {
    list: publicQuery
      .input(
        z.object({
          month: z.string().optional(),
          status: z.string().optional(),
        }).optional()
      )
      .query(({ input }) => {
        const db = getDb();
        if (input?.status) {
          return db
            .select()
            .from(xtreinoSchedule)
            .where(eq(xtreinoSchedule.status, input.status))
            .orderBy(xtreinoSchedule.date)
            .all();
        }
        if (input?.month) {
          return db
            .select()
            .from(xtreinoSchedule)
            .where(sql`${xtreinoSchedule.date} LIKE ${input.month + "%"}`)
            .orderBy(xtreinoSchedule.date)
            .all();
        }
        return db.select().from(xtreinoSchedule).orderBy(xtreinoSchedule.date).all();
      }),

    create: adminQuery
      .input(
        z.object({
          date: z.string(),
          dayOfWeek: z.string(),
          timeBr: z.string().default("21:00"),
          status: z.string().default("scheduled"),
          notes: z.string().optional(),
        })
      )
      .mutation(({ input, ctx }) => {
        const payload = verifyToken(ctx.adminToken as string);
        if (!payload) throw new Error("Invalid token");

        const db = getDb();
        db.insert(xtreinoSchedule).values(input).run();
        return { success: true };
      }),

    updateStatus: adminQuery
      .input(
        z.object({
          id: z.number(),
          status: z.string(),
          notes: z.string().optional(),
        })
      )
      .mutation(({ input, ctx }) => {
        const payload = verifyToken(ctx.adminToken as string);
        if (!payload) throw new Error("Invalid token");

        const { id, ...data } = input;
        const db = getDb();
        db.update(xtreinoSchedule).set(data).where(eq(xtreinoSchedule.id, id)).run();
        return { success: true };
      }),

    generateMonth: adminQuery
      .input(z.object({ year: z.number(), month: z.number() }))
      .mutation(({ input, ctx }) => {
        const payload = verifyToken(ctx.adminToken as string);
        if (!payload) throw new Error("Invalid token");

        const db = getDb();
        const diasSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
        const daysInMonth = new Date(input.year, input.month, 0).getDate();
        let count = 0;

        for (let dia = 1; dia <= daysInMonth; dia++) {
          const data = new Date(input.year, input.month - 1, dia);
          const diaSemana = data.getDay();

          // Segunda(1) a Sexta(5)
          if (diaSemana >= 1 && diaSemana <= 5) {
            const dataStr = `${input.year}-${input.month.toString().padStart(2, "0")}-${dia.toString().padStart(2, "0")}`;
            const existing = db
              .select()
              .from(xtreinoSchedule)
              .where(eq(xtreinoSchedule.date, dataStr))
              .get();

            if (!existing) {
              db.insert(xtreinoSchedule).values({
                date: dataStr,
                dayOfWeek: diasSemana[diaSemana],
                timeBr: "21:00",
                status: "scheduled",
                notes: diaSemana === 5 ? "Último xtreino da semana" : null,
              }).run();
              count++;
            }
          }
        }

        return { generated: count, success: true };
      }),
  },
});