import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "../middleware.js";
import { getDb } from "../queries/connection.js";
import { scrims, teams, scrimResults, scrimPlayerStats } from "../../db/schema.js";
import { eq, desc, sql, and } from "drizzle-orm";
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
  // ROTAS DE RESULTADOS DOS TIMES (scrim_results)
  // ============================================================

  /** Listar todos os resultados de times */
  listResults: publicQuery.query(() => {
    const db = getDb();
    return db.select().from(scrimResults).orderBy(desc(scrimResults.createdAt)).all();
  }),

  /** Criar resultado de time */
  createResults: adminQuery
    .input(
      z.object({
        scrimId: z.number(),
        date: z.string(),
        teamName: z.string(),
        q1Pos: z.number().nullable().optional(),
        q2Pos: z.number().nullable().optional(),
        q3Pos: z.number().nullable().optional(),
        q1Score: z.number().nullable().optional(),
        q2Score: z.number().nullable().optional(),
        q3Score: z.number().nullable().optional(),
      })
    )
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();
      db.insert(scrimResults).values(input).run();
      return { success: true };
    }),

  /** Atualizar resultado de time */
  updateResults: adminQuery
    .input(
      z.object({
        id: z.number(),
        scrimId: z.number().optional(),
        date: z.string().optional(),
        teamName: z.string().optional(),
        q1Pos: z.number().nullable().optional(),
        q2Pos: z.number().nullable().optional(),
        q3Pos: z.number().nullable().optional(),
        q1Score: z.number().nullable().optional(),
        q2Score: z.number().nullable().optional(),
        q3Score: z.number().nullable().optional(),
      })
    )
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const { id, ...data } = input;
      const db = getDb();
      db.update(scrimResults).set(data).where(eq(scrimResults.id, id)).run();
      return { success: true };
    }),

  /** Deletar resultado de time */
  deleteResults: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();
      db.delete(scrimResults).where(eq(scrimResults.id, input.id)).run();
      return { success: true };
    }),

  // ============================================================
  // ROTAS DE ESTATISTICAS DOS JOGADORES (scrim_player_stats)
  // ============================================================

  /** Listar todas as estatisticas de jogadores */
  listPlayerStats: publicQuery.query(() => {
    const db = getDb();
    return db.select().from(scrimPlayerStats).orderBy(desc(scrimPlayerStats.totalKills)).all();
  }),

  /** Criar estatistica de jogador — com todos os campos do schema */
  createPlayerStats: adminQuery
    .input(
      z.object({
        scrimId: z.number(),
        date: z.string(),
        teamName: z.string(),
        playerName: z.string(),
        q1Kills: z.number().default(0),
        q1Assists: z.number().default(0),
        q1Deaths: z.number().default(0),
        q1Damage: z.number().default(0),
        q1Mvp: z.boolean().default(false),
        q1Score: z.number().default(0),
        q2Kills: z.number().default(0),
        q2Assists: z.number().default(0),
        q2Deaths: z.number().default(0),
        q2Damage: z.number().default(0),
        q2Mvp: z.boolean().default(false),
        q2Score: z.number().default(0),
        q3Kills: z.number().default(0),
        q3Assists: z.number().default(0),
        q3Deaths: z.number().default(0),
        q3Damage: z.number().default(0),
        q3Mvp: z.boolean().default(false),
        q3Score: z.number().default(0),
        totalKills: z.number().default(0),
        totalAssists: z.number().default(0),
        totalDeaths: z.number().default(0),
        totalDamage: z.number().default(0),
        totalMvp: z.number().default(0),
      })
    )
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();
      db.insert(scrimPlayerStats).values(input).run();
      return { success: true };
    }),

  /** Atualizar estatistica de jogador — com todos os campos do schema */
  updatePlayerStats: adminQuery
    .input(
      z.object({
        id: z.number(),
        scrimId: z.number().optional(),
        date: z.string().optional(),
        teamName: z.string().optional(),
        playerName: z.string().optional(),
        q1Kills: z.number().optional(),
        q1Assists: z.number().optional(),
        q1Deaths: z.number().optional(),
        q1Damage: z.number().optional(),
        q1Mvp: z.boolean().optional(),
        q1Score: z.number().optional(),
        q2Kills: z.number().optional(),
        q2Assists: z.number().optional(),
        q2Deaths: z.number().optional(),
        q2Damage: z.number().optional(),
        q2Mvp: z.boolean().optional(),
        q2Score: z.number().optional(),
        q3Kills: z.number().optional(),
        q3Assists: z.number().optional(),
        q3Deaths: z.number().optional(),
        q3Damage: z.number().optional(),
        q3Mvp: z.boolean().optional(),
        q3Score: z.number().optional(),
        totalKills: z.number().optional(),
        totalAssists: z.number().optional(),
        totalDeaths: z.number().optional(),
        totalDamage: z.number().optional(),
        totalMvp: z.number().optional(),
      })
    )
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const { id, ...data } = input;
      const db = getDb();
      db.update(scrimPlayerStats).set(data).where(eq(scrimPlayerStats.id, id)).run();
      return { success: true };
    }),

  /** Deletar estatistica de jogador */
  deletePlayerStats: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();
      db.delete(scrimPlayerStats).where(eq(scrimPlayerStats.id, input.id)).run();
      return { success: true };
    }),

  // ============================================================
  // ROTAS DE HISTORICO / CONSULTAS
  // ============================================================

  /** Listar datas unicas disponiveis */
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

      if (input.date) {
        return db
          .select()
          .from(scrimResults)
          .where(eq(scrimResults.date, input.date))
          .orderBy(scrimResults.q1Pos)
          .all();
      }

      return db.select().from(scrimResults).orderBy(desc(scrimResults.date)).all();
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

      if (input.date) {
        return db
          .select()
          .from(scrimPlayerStats)
          .where(eq(scrimPlayerStats.date, input.date))
          .orderBy(desc(scrimPlayerStats.totalKills))
          .all();
      }

      return db.select().from(scrimPlayerStats).orderBy(desc(scrimPlayerStats.totalKills)).all();
    }),

  /** Top jogadores de todos os tempos (soma total) — com todos os campos */
  playerStatsAllTime: publicQuery.query(() => {
    const db = getDb();
    return db
      .select({
        playerName: scrimPlayerStats.playerName,
        teamName: sql<string>`MAX(${scrimPlayerStats.teamName})`,
        totalKills: sql<number>`SUM(${scrimPlayerStats.totalKills})`,
        totalAssists: sql<number>`SUM(${scrimPlayerStats.totalAssists})`,
        totalDeaths: sql<number>`SUM(${scrimPlayerStats.totalDeaths})`,
        totalDamage: sql<number>`SUM(${scrimPlayerStats.totalDamage})`,
        totalMvp: sql<number>`SUM(${scrimPlayerStats.totalMvp})`,
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

  /** Top times de todos os tempos (com totais de rounds ganhos) */
  teamResultsAllTime: publicQuery.query(() => {
    const db = getDb();

    // Buscar todos os resultados para calcular totais de rounds ganhos
    const allResults = db.select().from(scrimResults).all();

    // Agrupar por time
    const teamMap = new Map<string, {
      teamName: string;
      totalRoundWins: number;
      totalKills: number;
      totalWins: number;
      matches: number;
      q1Wins: number;
      q2Wins: number;
      q3Wins: number;
    }>();

    for (const r of allResults) {
      const existing = teamMap.get(r.teamName);

      // Contar rounds ganhos (score) por queda
      const roundWins = (r.q1Score || 0) + (r.q2Score || 0) + (r.q3Score || 0);
      // Contar quedas vencidas (posicao 1)
      const quedaWins = [r.q1Pos, r.q2Pos, r.q3Pos].filter(p => p === 1).length;

      if (existing) {
        existing.totalRoundWins += roundWins;
        existing.totalWins += quedaWins;
        existing.matches += 1;
        existing.q1Wins += r.q1Pos === 1 ? 1 : 0;
        existing.q2Wins += r.q2Pos === 1 ? 1 : 0;
        existing.q3Wins += r.q3Pos === 1 ? 1 : 0;
      } else {
        teamMap.set(r.teamName, {
          teamName: r.teamName,
          totalRoundWins: roundWins,
          totalKills: 0,
          totalWins: quedaWins,
          matches: 1,
          q1Wins: r.q1Pos === 1 ? 1 : 0,
          q2Wins: r.q2Pos === 1 ? 1 : 0,
          q3Wins: r.q3Pos === 1 ? 1 : 0,
        });
      }
    }

    // Buscar kills por time
    const allPlayers = db.select().from(scrimPlayerStats).all();
    for (const p of allPlayers) {
      const team = teamMap.get(p.teamName);
      if (team) {
        team.totalKills += p.totalKills || 0;
      }
    }

    // Converter para array
    const result = Array.from(teamMap.values()).map(t => ({
      teamName: t.teamName,
      totalRoundWins: t.totalRoundWins,
      totalKills: t.totalKills,
      totalWins: t.totalWins,
      matches: t.matches,
      q1Wins: t.q1Wins,
      q2Wins: t.q2Wins,
      q3Wins: t.q3Wins,
      winRate: t.matches > 0 ? (t.totalWins / (t.matches * 3)) * 100 : 0,
    }));

    // Ordenar por rounds ganhos totais (descendente)
    return result.sort((a, b) => b.totalRoundWins - a.totalRoundWins);
  }),

  /** Buscar estatisticas detalhadas de um jogador especifico */
  playerStatsByName: publicQuery
    .input(z.object({ playerName: z.string() }))
    .query(({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(scrimPlayerStats)
        .where(eq(scrimPlayerStats.playerName, input.playerName))
        .orderBy(desc(scrimPlayerStats.date))
        .all();
    }),

  /** Buscar estatisticas detalhadas de um time especifico */
  teamStatsByName: publicQuery
    .input(z.object({ teamName: z.string() }))
    .query(({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(scrimResults)
        .where(eq(scrimResults.teamName, input.teamName))
        .orderBy(desc(scrimResults.date))
        .all();
    }),
});