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
        mode: z.enum(["br", "mme"]).optional(),
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
        mode: z.enum(["br", "mme"]).optional(),
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
  // ROTAS DE RESULTADOS DOS TIMES
  // ============================================================

  listResults: publicQuery.query(() => {
    const db = getDb();
    return db.select().from(scrimResults).orderBy(desc(scrimResults.createdAt)).all();
  }),

  createResults: adminQuery
    .input(
      z.object({
        scrimId: z.number(),
        date: z.string(),
        teamName: z.string(),
        // BR: posições
        q1Pos: z.number().nullable().optional(),
        q2Pos: z.number().nullable().optional(),
        q3Pos: z.number().nullable().optional(),
        // MME: placares de rounds
        q1Score: z.number().nullable().optional(),
        q2Score: z.number().nullable().optional(),
        q3Score: z.number().nullable().optional(),
        q4Score: z.number().nullable().optional(),
        q5Score: z.number().nullable().optional(),
        q6Score: z.number().nullable().optional(),
        q7Score: z.number().nullable().optional(),
      })
    )
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();
      db.insert(scrimResults).values(input).run();
      return { success: true };
    }),

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
        q4Score: z.number().nullable().optional(),
        q5Score: z.number().nullable().optional(),
        q6Score: z.number().nullable().optional(),
        q7Score: z.number().nullable().optional(),
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
  // ROTAS DE ESTATISTICAS DOS JOGADORES
  // ============================================================

  listPlayerStats: publicQuery.query(() => {
    const db = getDb();
    return db.select().from(scrimPlayerStats).orderBy(desc(scrimPlayerStats.totalKills)).all();
  }),

  createPlayerStats: adminQuery
    .input(
      z.object({
        scrimId: z.number(),
        date: z.string(),
        teamName: z.string(),
        playerName: z.string(),
        // Q1
        q1Kills: z.number().default(0),
        q1Assists: z.number().default(0),
        q1Deaths: z.number().default(0),
        q1Damage: z.number().default(0),
        q1Mvp: z.boolean().default(false),
        q1Score: z.number().default(0),
        // Q2
        q2Kills: z.number().default(0),
        q2Assists: z.number().default(0),
        q2Deaths: z.number().default(0),
        q2Damage: z.number().default(0),
        q2Mvp: z.boolean().default(false),
        q2Score: z.number().default(0),
        // Q3
        q3Kills: z.number().default(0),
        q3Assists: z.number().default(0),
        q3Deaths: z.number().default(0),
        q3Damage: z.number().default(0),
        q3Mvp: z.boolean().default(false),
        q3Score: z.number().default(0),
        // Q4
        q4Kills: z.number().default(0),
        q4Assists: z.number().default(0),
        q4Deaths: z.number().default(0),
        q4Damage: z.number().default(0),
        q4Mvp: z.boolean().default(false),
        q4Score: z.number().default(0),
        // Q5
        q5Kills: z.number().default(0),
        q5Assists: z.number().default(0),
        q5Deaths: z.number().default(0),
        q5Damage: z.number().default(0),
        q5Mvp: z.boolean().default(false),
        q5Score: z.number().default(0),
        // Q6
        q6Kills: z.number().default(0),
        q6Assists: z.number().default(0),
        q6Deaths: z.number().default(0),
        q6Damage: z.number().default(0),
        q6Mvp: z.boolean().default(false),
        q6Score: z.number().default(0),
        // Q7
        q7Kills: z.number().default(0),
        q7Assists: z.number().default(0),
        q7Deaths: z.number().default(0),
        q7Damage: z.number().default(0),
        q7Mvp: z.boolean().default(false),
        q7Score: z.number().default(0),
        // Totais
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
        q4Kills: z.number().optional(),
        q4Assists: z.number().optional(),
        q4Deaths: z.number().optional(),
        q4Damage: z.number().optional(),
        q4Mvp: z.boolean().optional(),
        q4Score: z.number().optional(),
        q5Kills: z.number().optional(),
        q5Assists: z.number().optional(),
        q5Deaths: z.number().optional(),
        q5Damage: z.number().optional(),
        q5Mvp: z.boolean().optional(),
        q5Score: z.number().optional(),
        q6Kills: z.number().optional(),
        q6Assists: z.number().optional(),
        q6Deaths: z.number().optional(),
        q6Damage: z.number().optional(),
        q6Mvp: z.boolean().optional(),
        q6Score: z.number().optional(),
        q7Kills: z.number().optional(),
        q7Assists: z.number().optional(),
        q7Deaths: z.number().optional(),
        q7Damage: z.number().optional(),
        q7Mvp: z.boolean().optional(),
        q7Score: z.number().optional(),
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
  // ROTAS DE HISTORICO / CONSULTAS — CORRIGIDAS COM FILTRO POR MODE
  // ============================================================

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

  // ============================================================
  // teamResults — AGORA COM FILTRO POR MODE VIA JOIN COM SCRIMS
  // ============================================================
  teamResults: publicQuery
    .input(
      z.object({
        date: z.string().optional(),
        mode: z.enum(["br", "mme"]).optional(),
      })
    )
    .query(({ input }) => {
      const db = getDb();

      // Se filtrar por modo, faz JOIN com scrims para pegar o mode
      if (input.mode) {
        const conditions = [eq(scrims.mode, input.mode)];
        if (input.date) {
          conditions.push(eq(scrimResults.date, input.date));
        }
        return db
          .select()
          .from(scrimResults)
          .innerJoin(scrims, eq(scrimResults.scrimId, scrims.id))
          .where(and(...conditions))
          .orderBy(desc(scrimResults.date))
          .all()
          .map((row) => row.scrim_results);
      }

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

  // ============================================================
  // playerStats — AGORA COM FILTRO POR MODE VIA JOIN COM SCRIMS
  // ============================================================
  playerStats: publicQuery
    .input(
      z.object({
        date: z.string().optional(),
        mode: z.enum(["br", "mme"]).optional(),
      })
    )
    .query(({ input }) => {
      const db = getDb();

      // Se filtrar por modo, faz JOIN com scrims para pegar o mode
      if (input.mode) {
        const conditions = [eq(scrims.mode, input.mode)];
        if (input.date) {
          conditions.push(eq(scrimPlayerStats.date, input.date));
        }
        return db
          .select()
          .from(scrimPlayerStats)
          .innerJoin(scrims, eq(scrimPlayerStats.scrimId, scrims.id))
          .where(and(...conditions))
          .orderBy(desc(scrimPlayerStats.totalKills))
          .all()
          .map((row) => row.scrim_player_stats);
      }

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

  // ============================================================
  // ALL TIME — JOGADORES (unificado) — AGORA COM FILTRO POR MODE
  // ============================================================
  playerStatsAllTime: publicQuery
    .input(
      z.object({
        mode: z.enum(["br", "mme"]).optional(),
      }).optional()
    )
    .query(({ input }) => {
      const db = getDb();

      let query = db
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
          totalQ4: sql<number>`SUM(${scrimPlayerStats.q4Kills})`,
          totalQ5: sql<number>`SUM(${scrimPlayerStats.q5Kills})`,
          totalQ6: sql<number>`SUM(${scrimPlayerStats.q6Kills})`,
          totalQ7: sql<number>`SUM(${scrimPlayerStats.q7Kills})`,
          matches: sql<number>`COUNT(DISTINCT ${scrimPlayerStats.date})`,
        })
        .from(scrimPlayerStats);

      // Se filtrar por modo, faz JOIN com scrims
      if (input?.mode) {
        query = query
          .innerJoin(scrims, eq(scrimPlayerStats.scrimId, scrims.id))
          .where(eq(scrims.mode, input.mode)) as any;
      }

      return query
        .groupBy(scrimPlayerStats.playerName)
        .orderBy(desc(sql`SUM(${scrimPlayerStats.totalKills})`))
        .all();
    }),

  // ============================================================
  // ALL TIME — TIMES BR (pontuação por posição)
  // ============================================================
  teamResultsAllTimeBR: publicQuery.query(() => {
    const db = getDb();

    // Só pega scrims do tipo BR
    const brResults = db
      .select()
      .from(scrimResults)
      .innerJoin(scrims, eq(scrimResults.scrimId, scrims.id))
      .where(eq(scrims.mode, "br"))
      .all()
      .map((row) => row.scrim_results);

    const teamMap = new Map<string, {
      teamName: string;
      totalPoints: number;
      totalKills: number;
      wins: number;
      top3: number;
      matches: number;
      posSum: number;
      posCount: number;
    }>();

    for (const r of brResults) {
      const existing = teamMap.get(r.teamName);

      const q1Pts = getPointsByPosition(r.q1Pos);
      const q2Pts = getPointsByPosition(r.q2Pos);
      const q3Pts = getPointsByPosition(r.q3Pos);
      const totalPts = q1Pts + q2Pts + q3Pts;

      const positions = [r.q1Pos, r.q2Pos, r.q3Pos].filter((p): p is number => p !== null);
      const wins = positions.filter(p => p === 1).length;
      const top3 = positions.filter(p => p && p <= 3).length;

      if (existing) {
        existing.totalPoints += totalPts;
        existing.wins += wins;
        existing.top3 += top3;
        existing.matches += 1;
        existing.posSum += positions.reduce((a, b) => a + b, 0);
        existing.posCount += positions.length;
      } else {
        teamMap.set(r.teamName, {
          teamName: r.teamName,
          totalPoints: totalPts,
          totalKills: 0,
          wins,
          top3,
          matches: 1,
          posSum: positions.reduce((a, b) => a + b, 0),
          posCount: positions.length,
        });
      }
    }

    // Buscar kills por time (só de scrims BR)
    const brPlayerStats = db
      .select()
      .from(scrimPlayerStats)
      .innerJoin(scrims, eq(scrimPlayerStats.scrimId, scrims.id))
      .where(eq(scrims.mode, "br"))
      .all()
      .map((row) => row.scrim_player_stats);

    for (const p of brPlayerStats) {
      const team = teamMap.get(p.teamName);
      if (team) {
        team.totalKills += p.totalKills || 0;
      }
    }

    return Array.from(teamMap.values()).map(t => ({
      teamName: t.teamName,
      totalPoints: t.totalPoints,
      totalKills: t.totalKills,
      wins: t.wins,
      top3: t.top3,
      matches: t.matches,
      avgPos: t.posCount > 0 ? t.posSum / t.posCount : 0,
    })).sort((a, b) => b.totalPoints - a.totalPoints);
  }),

  // ============================================================
  // ALL TIME — TIMES MME (rounds ganhos)
  // ============================================================
  teamResultsAllTimeMME: publicQuery.query(() => {
    const db = getDb();

    // Só pega scrims do tipo MME
    const mmeResults = db
      .select()
      .from(scrimResults)
      .innerJoin(scrims, eq(scrimResults.scrimId, scrims.id))
      .where(eq(scrims.mode, "mme"))
      .all()
      .map((row) => row.scrim_results);

    const teamMap = new Map<string, {
      teamName: string;
      totalRoundWins: number;
      totalKills: number;
      seriesWins: number;
      matches: number;
    }>();

    for (const r of mmeResults) {
      const existing = teamMap.get(r.teamName);

      const roundWins = (r.q1Score || 0) + (r.q2Score || 0) + (r.q3Score || 0)
        + (r.q4Score || 0) + (r.q5Score || 0) + (r.q6Score || 0) + (r.q7Score || 0);

      const hasRounds = roundWins > 0;

      if (existing) {
        existing.totalRoundWins += roundWins;
        existing.matches += 1;
        if (hasRounds) existing.seriesWins += 1;
      } else {
        teamMap.set(r.teamName, {
          teamName: r.teamName,
          totalRoundWins: roundWins,
          totalKills: 0,
          seriesWins: hasRounds ? 1 : 0,
          matches: 1,
        });
      }
    }

    // Buscar kills por time (só de scrims MME)
    const mmePlayerStats = db
      .select()
      .from(scrimPlayerStats)
      .innerJoin(scrims, eq(scrimPlayerStats.scrimId, scrims.id))
      .where(eq(scrims.mode, "mme"))
      .all()
      .map((row) => row.scrim_player_stats);

    for (const p of mmePlayerStats) {
      const team = teamMap.get(p.teamName);
      if (team) {
        team.totalKills += p.totalKills || 0;
      }
    }

    return Array.from(teamMap.values()).map(t => ({
      teamName: t.teamName,
      totalRoundWins: t.totalRoundWins,
      totalKills: t.totalKills,
      seriesWins: t.seriesWins,
      matches: t.matches,
      winRate: t.matches > 0 ? (t.seriesWins / t.matches) * 100 : 0,
    })).sort((a, b) => b.totalRoundWins - a.totalRoundWins);
  }),

  // ============================================================
  // CONSULTAS INDIVIDUAIS
  // ============================================================

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

// ============================================================
// PONTUAÇÃO BR (Battle Royale)
// ============================================================

function getPointsByPosition(pos: number | null): number {
  if (!pos) return 0;
  const points: Record<number, number> = {
    1: 15, 2: 12, 3: 10, 4: 9, 5: 8, 6: 7,
    7: 6, 8: 5, 9: 4, 10: 3, 11: 2, 12: 1,
    13: 1, 14: 0, 15: 0,
  };
  return points[pos] ?? 0;
}