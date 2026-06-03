import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "../middleware.js";
import { getDb } from "../queries/connection.js";
import { scrims, teams, scrimResults, scrimPlayerStats } from "../../db/schema.js";
import { eq, desc, sql } from "drizzle-orm";
import { verifyToken } from "../lib/auth.js";

export const scrimsRouter = createRouter({
  // ============================================================
  // ROTAS ORIGINAIS (scrims agendados)
  // ============================================================

  list: publicQuery.query(() => {
    const db = getDb();
    const allScrims = db.select().from(scrims).orderBy(desc(scrims.createdAt)).all();

    const scrimsWithTeams = allScrims.map((s) => {
      const t1 = s.team1Id ? db.select().from(teams).where(eq(teams.id, s.team1Id)).get() : null;
      const t2 = s.team2Id ? db.select().from(teams).where(eq(teams.id, s.team2Id)).get() : null;
      return {
        ...s,
        team1Name: t1?.name ?? null,
        team2Name: t2?.name ?? null,
        team1Tag: t1?.tag ?? null,
        team2Tag: t2?.tag ?? null,
      };
    });

    return scrimsWithTeams;
  }),

  create: adminQuery
    .input(
      z.object({
        name: z.string().min(1),
        team1Id: z.number().optional(),
        team2Id: z.number().optional(),
        date: z.string().optional(),
        time: z.string().optional(),
        modality: z.string().optional(),
        status: z.string().optional(),
        result: z.string().optional(),
      })
    )
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();
      const result = db.insert(scrims).values(input).run();
      return { id: Number(result.lastInsertRowid), success: true };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        team1Id: z.number().optional(),
        team2Id: z.number().optional(),
        date: z.string().optional(),
        time: z.string().optional(),
        modality: z.string().optional(),
        status: z.string().optional(),
        result: z.string().optional(),
      })
    )
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const { id, ...data } = input;
      const db = getDb();
      db.update(scrims).set(data).where(eq(scrims.id, id)).run();
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();
      db.delete(scrims).where(eq(scrims.id, input.id)).run();
      return { success: true };
    }),

  // ============================================================
  // ROTAS NOVAS (dados historicos de scrims — rankings)
  // ============================================================

  /** Listar datas unicas disponiveis nos dados historicos */
  dates: publicQuery.query(() => {
    const db = getDb();
    const results = db
      .select({ date: scrimResults.date })
      .from(scrimResults)
      .groupBy(scrimResults.date)
      .orderBy(desc(scrimResults.date))
      .all();
    return results.map((r) => r.date);
  }),

  /** Colocacoes dos times por data */
  teamResults: publicQuery
    .input(
      z.object({
        date: z.string().optional(),
      })
    )
    .query(({ input }) => {
      const db = getDb();
      let query = db.select().from(scrimResults);

      if (input.date) {
        query = query.where(eq(scrimResults.date, input.date)) as typeof query;
      }

      return query.orderBy(scrimResults.q1Pos).all();
    }),

  /** Estatisticas dos jogadores por data */
  playerStats: publicQuery
    .input(
      z.object({
        date: z.string().optional(),
      })
    )
    .query(({ input }) => {
      const db = getDb();
      let query = db.select().from(scrimPlayerStats);

      if (input.date) {
        query = query.where(eq(scrimPlayerStats.date, input.date)) as typeof query;
      }

      return query.orderBy(desc(scrimPlayerStats.totalKills)).all();
    }),

  /** Top jogadores de todos os tempos (soma total de kills) */
  playerStatsAllTime: publicQuery.query(() => {
    const db = getDb();
    return db
      .select({
        playerName: scrimPlayerStats.playerName,
        teamName: sql<string>`MAX(${scrimPlayerStats.teamName})`,
        totalKills: sql<number>`SUM(${scrimPlayerStats.totalKills})`,
        totalQ1: sql<number>`SUM(${scrimPlayerStats.q1Kills})`,
        totalQ2: sql<number>`SUM(${scrimPlayerStats.q2Kills})`,
        totalQ3: sql<number>`SUM(${scrimPlayerStats.q3Kills})`,
        matches: sql<number>`COUNT(DISTINCT ${scrimPlayerStats.date})`,
      })
      .from(scrimPlayerStats)
      .groupBy(scrimPlayerStats.playerName)
      .orderBy(desc(sql`SUM(${scrimPlayerStats.totalKills})`))
      .all();
  }),

  /** Top times de todos os tempos (media de posicoes) */
  teamResultsAllTime: publicQuery.query(() => {
    const db = getDb();
    return db
      .select({
        teamName: scrimResults.teamName,
        avgQ1: sql<number>`AVG(${scrimResults.q1Pos})`,
        avgQ2: sql<number>`AVG(${scrimResults.q2Pos})`,
        avgQ3: sql<number>`AVG(${scrimResults.q3Pos})`,
        matches: sql<number>`COUNT(*)`,
      })
      .from(scrimResults)
      .groupBy(scrimResults.teamName)
      .orderBy(sql`AVG(${scrimResults.q1Pos})`)
      .all();
  }),
});