import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "../../api/middleware.js";
import { getDb } from "../../api/queries/connection.js";
import { scrims, teams, scrimResults, scrimResultRounds, scrimPlayerStats, scrimPlayerStatRounds } from "../../db/schema.js";
import { eq, desc, sql, and, inArray } from "drizzle-orm";
import { verifyToken } from "../../api/lib/auth.js";

export const scrimsRouter = createRouter({
  // ============================================================
  // SCRIMS AGENDADOS
  // ============================================================
  list: publicQuery.query(() => {
    const db = getDb();
    const allScrims = db.select().from(scrims).orderBy(desc(scrims.createdAt)).all();
    return allScrims.map((s) => {
      const t1 = s.team1Id ? db.select().from(teams).where(eq(teams.id, s.team1Id)).get() : null;
      const t2 = s.team2Id ? db.select().from(teams).where(eq(teams.id, s.team2Id)).get() : null;
      return { ...s, team1Name: t1?.name ?? null, team2Name: t2?.name ?? null, team1Tag: t1?.tag ?? null, team2Tag: t2?.tag ?? null };
    });
  }),

  create: adminQuery.input(z.object({ name: z.string().min(1), team1Id: z.number().optional(), team2Id: z.number().optional(), date: z.string().optional(), time: z.string().optional(), modality: z.string().optional(), mode: z.enum(["br", "mme"]).optional(), status: z.string().optional(), result: z.string().optional() })).mutation(({ input, ctx }) => {
    verifyToken(ctx.adminToken as string);
    const db = getDb();
    const result = db.insert(scrims).values(input).run();
    return { id: Number(result.lastInsertRowid), success: true };
  }),

  update: adminQuery.input(z.object({ id: z.number(), name: z.string().optional(), team1Id: z.number().optional(), team2Id: z.number().optional(), date: z.string().optional(), time: z.string().optional(), modality: z.string().optional(), mode: z.enum(["br", "mme"]).optional(), status: z.string().optional(), result: z.string().optional() })).mutation(({ input, ctx }) => {
    verifyToken(ctx.adminToken as string);
    const { id, ...data } = input;
    const db = getDb();
    db.update(scrims).set(data).where(eq(scrims.id, id)).run();
    return { success: true };
  }),

  delete: adminQuery.input(z.object({ id: z.number() })).mutation(({ input, ctx }) => {
    verifyToken(ctx.adminToken as string);
    const db = getDb();
    db.delete(scrims).where(eq(scrims.id, input.id)).run();
    return { success: true };
  }),

  // ============================================================
  // RESULTADOS DOS TIMES (DINÂMICO)
  // ============================================================
  createResults: adminQuery.input(z.object({
    scrimId: z.number(), date: z.string(), teamName: z.string(),
    rounds: z.array(z.object({ roundNumber: z.number(), value: z.number() }))
  })).mutation(({ input, ctx }) => {
    verifyToken(ctx.adminToken as string);
    const db = getDb();
    const res = db.insert(scrimResults).values({ scrimId: input.scrimId, date: input.date, teamName: input.teamName }).run();
    const resultId = Number(res.lastInsertRowid);
    
    if (input.rounds.length > 0) {
      db.insert(scrimResultRounds).values(input.rounds.map(r => ({ ...r, scrimResultId: resultId }))).run();
    }
    return { success: true, resultId };
  }),

  deleteResults: adminQuery.input(z.object({ id: z.number() })).mutation(({ input, ctx }) => {
    verifyToken(ctx.adminToken as string);
    const db = getDb();
    db.delete(scrimResults).where(eq(scrimResults.id, input.id)).run();
    return { success: true };
  }),

  // ============================================================
  // STATS DOS JOGADORES (DINÂMICO)
  // ============================================================
  createPlayerStats: adminQuery.input(z.object({
    scrimId: z.number(), date: z.string(), teamName: z.string(), playerName: z.string(),
    totalKills: z.number().default(0), totalAssists: z.number().default(0), totalDeaths: z.number().default(0), totalDamage: z.number().default(0), totalMvp: z.number().default(0),
    rounds: z.array(z.object({ roundNumber: z.number(), kills: z.number(), assists: z.number(), deaths: z.number(), damage: z.number(), mvp: z.boolean(), score: z.number() }))
  })).mutation(({ input, ctx }) => {
    verifyToken(ctx.adminToken as string);
    const db = getDb();
    const res = db.insert(scrimPlayerStats).values({ scrimId: input.scrimId, date: input.date, teamName: input.teamName, playerName: input.playerName, totalKills: input.totalKills, totalAssists: input.totalAssists, totalDeaths: input.totalDeaths, totalDamage: input.totalDamage, totalMvp: input.totalMvp }).run();
    const statId = Number(res.lastInsertRowid);
    
    if (input.rounds.length > 0) {
      db.insert(scrimPlayerStatRounds).values(input.rounds.map(r => ({ ...r, scrimPlayerStatId: statId }))).run();
    }
    return { success: true };
  }),

  deletePlayerStats: adminQuery.input(z.object({ id: z.number() })).mutation(({ input, ctx }) => {
    verifyToken(ctx.adminToken as string);
    const db = getDb();
    db.delete(scrimPlayerStats).where(eq(scrimPlayerStats.id, input.id)).run();
    return { success: true };
  }),

  // ============================================================
  // CONSULTAS HISTÓRICO (COM JOIN E MODE)
  // ============================================================
  dates: publicQuery.query(() => {
    const db = getDb();
    return db.selectDistinct({ date: scrimResults.date }).from(scrimResults).orderBy(desc(scrimResults.date)).all().map(r => r.date);
  }),

  teamResults: publicQuery.input(z.object({ date: z.string().optional(), mode: z.enum(["br", "mme"]).optional() })).query(({ input }) => {
    const db = getDb();
    const conditions = [];
    if (input.mode) conditions.push(eq(scrims.mode, input.mode));
    if (input.date) conditions.push(eq(scrimResults.date, input.date));

    const results = db.select({ 
      id: scrimResults.id, 
      scrimId: scrimResults.scrimId, 
      date: scrimResults.date, 
      teamName: scrimResults.teamName, 
      mode: scrims.mode,
      createdAt: scrimResults.createdAt // ADICIONADO PARA O FRONTEND
    })
    .from(scrimResults)
    .innerJoin(scrims, eq(scrimResults.scrimId, scrims.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(scrimResults.date))
    .all();

    if (!results.length) return [];

    const allRounds = db.select().from(scrimResultRounds).where(inArray(scrimResultRounds.scrimResultId, results.map(r => r.id))).all();
    const roundsMap = new Map<number, typeof allRounds>();
    for (const round of allRounds) { roundsMap.set(round.scrimResultId, [...(roundsMap.get(round.scrimResultId) || []), round]); }

    return results.map(r => ({ 
      ...r, 
      mode: (r.mode || "br") as "br" | "mme", // <-- ADICIONE ESTA LINHA
      rounds: (roundsMap.get(r.id) || []).map(rd => ({ roundNumber: rd.roundNumber, value: rd.value })).sort((a, b) => a.roundNumber - b.roundNumber) 
    }));
  }),

  playerStats: publicQuery.input(z.object({ date: z.string().optional(), mode: z.enum(["br", "mme"]).optional() })).query(({ input }) => {
    const db = getDb();
    const conditions = [];
    if (input.mode) conditions.push(eq(scrims.mode, input.mode));
    if (input.date) conditions.push(eq(scrimPlayerStats.date, input.date));

    const results = db.select({ 
      id: scrimPlayerStats.id, 
      scrimId: scrimPlayerStats.scrimId, 
      date: scrimPlayerStats.date, 
      teamName: scrimPlayerStats.teamName, 
      playerName: scrimPlayerStats.playerName, 
      totalKills: scrimPlayerStats.totalKills, 
      totalAssists: scrimPlayerStats.totalAssists, 
      totalDeaths: scrimPlayerStats.totalDeaths, 
      totalDamage: scrimPlayerStats.totalDamage, 
      totalMvp: scrimPlayerStats.totalMvp, 
      mode: scrims.mode,
      createdAt: scrimPlayerStats.createdAt // ADICIONADO PARA O FRONTEND
    })
    .from(scrimPlayerStats)
    .innerJoin(scrims, eq(scrimPlayerStats.scrimId, scrims.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(scrimPlayerStats.totalKills))
    .all();

    if (!results.length) return [];

    const allRounds = db.select().from(scrimPlayerStatRounds).where(inArray(scrimPlayerStatRounds.scrimPlayerStatId, results.map(r => r.id))).all();
    const roundsMap = new Map<number, typeof allRounds>();
    for (const round of allRounds) { roundsMap.set(round.scrimPlayerStatId, [...(roundsMap.get(round.scrimPlayerStatId) || []), round]); }

    return results.map(r => ({ 
      ...r, 
      mode: (r.mode || "br") as "br" | "mme", // <-- ADICIONE ESTA LINHA
      rounds: (roundsMap.get(r.id) || []).map(rd => ({ roundNumber: rd.roundNumber, kills: rd.kills, assists: rd.assists, deaths: rd.deaths, damage: rd.damage, mvp: rd.mvp, score: rd.score })).sort((a, b) => a.roundNumber - b.roundNumber) 
    }));
  }),

  // ============================================================
  // ALL TIME — JOGADORES
  // ============================================================
  playerStatsAllTime: publicQuery.input(z.object({ mode: z.enum(["br", "mme"]).optional() }).optional()).query(({ input }) => {
    const db = getDb();
    let query = db.select({
      playerName: scrimPlayerStats.playerName,
      teamName: sql<string>`MAX(${scrimPlayerStats.teamName})`,
      totalKills: sql<number>`SUM(${scrimPlayerStats.totalKills})`,
      totalAssists: sql<number>`SUM(${scrimPlayerStats.totalAssists})`,
      totalDeaths: sql<number>`SUM(${scrimPlayerStats.totalDeaths})`,
      totalDamage: sql<number>`SUM(${scrimPlayerStats.totalDamage})`,
      totalMvp: sql<number>`SUM(${scrimPlayerStats.totalMvp})`,
      matches: sql<number>`COUNT(DISTINCT ${scrimPlayerStats.date})`
    }).from(scrimPlayerStats);
    
    if (input?.mode) { 
      query = query.innerJoin(scrims, eq(scrimPlayerStats.scrimId, scrims.id)).where(eq(scrims.mode, input.mode)) as any; 
    }
    
    return query.groupBy(scrimPlayerStats.playerName).orderBy(desc(sql`SUM(${scrimPlayerStats.totalKills})`)).all();
  }),

  // ============================================================
  // ALL TIME — TIMES BR
  // ============================================================
  teamResultsAllTimeBR: publicQuery.query(() => {
    const db = getDb();
    const results = db.select({ id: scrimResults.id, teamName: scrimResults.teamName })
      .from(scrimResults).innerJoin(scrims, eq(scrimResults.scrimId, scrims.id)).where(eq(scrims.mode, "br")).all();
      
    const rounds = db.select().from(scrimResultRounds).where(inArray(scrimResultRounds.scrimResultId, results.map(r => r.id))).all();
    const roundsMap = new Map<number, typeof rounds>();
    for (const r of rounds) { roundsMap.set(r.scrimResultId, [...(roundsMap.get(r.scrimResultId) || []), r]); }

    const teamMap = new Map<string, any>();
    for (const res of results) {
      const teamRounds = roundsMap.get(res.id) || [];
      const totalPoints = teamRounds.reduce((sum, r) => sum + getPointsByPosition(r.value), 0);
      const positions = teamRounds.map(r => r.value).filter(p => p > 0);
      const wins = positions.filter(p => p === 1).length;
      const top3 = positions.filter(p => p <= 3).length;

      if (teamMap.has(res.teamName)) {
        const t = teamMap.get(res.teamName);
        t.totalPoints += totalPoints; t.wins += wins; t.top3 += top3; t.matches += 1; t.posSum += positions.reduce((a,b) => a+b, 0); t.posCount += positions.length;
      } else {
        teamMap.set(res.teamName, { teamName: res.teamName, totalPoints, totalKills: 0, wins, top3, matches: 1, posSum: positions.reduce((a,b) => a+b, 0), posCount: positions.length });
      }
    }
    
    const brPlayers = db.select({ teamName: scrimPlayerStats.teamName, totalKills: scrimPlayerStats.totalKills }).from(scrimPlayerStats).innerJoin(scrims, eq(scrimPlayerStats.scrimId, scrims.id)).where(eq(scrims.mode, "br")).all();
    for (const p of brPlayers) { if (teamMap.has(p.teamName)) teamMap.get(p.teamName).totalKills += p.totalKills; }

    return Array.from(teamMap.values()).map(t => ({ ...t, avgPos: t.posCount > 0 ? Number((t.posSum / t.posCount).toFixed(1)) : 0 })).sort((a, b) => b.totalPoints - a.totalPoints);
  }),

  // ============================================================
  // ALL TIME — TIMES MME
  // ============================================================
  teamResultsAllTimeMME: publicQuery.query(() => {
    const db = getDb();
    const results = db.select({ id: scrimResults.id, teamName: scrimResults.teamName })
      .from(scrimResults).innerJoin(scrims, eq(scrimResults.scrimId, scrims.id)).where(eq(scrims.mode, "mme")).all();
      
    const rounds = db.select().from(scrimResultRounds).where(inArray(scrimResultRounds.scrimResultId, results.map(r => r.id))).all();
    const roundsMap = new Map<number, typeof rounds>();
    for (const r of rounds) { roundsMap.set(r.scrimResultId, [...(roundsMap.get(r.scrimResultId) || []), r]); }

    const teamMap = new Map<string, any>();
    for (const res of results) {
      const teamRounds = roundsMap.get(res.id) || [];
      const totalRoundWins = teamRounds.reduce((sum, r) => sum + r.value, 0);
      const maxRounds = teamRounds.length > 0 ? Math.max(...teamRounds.map(r => r.value)) : 0;
      const isSeriesWin = maxRounds > 0;

      if (teamMap.has(res.teamName)) {
        const t = teamMap.get(res.teamName);
        t.totalRoundWins += totalRoundWins; t.matches += 1; if(isSeriesWin) t.seriesWins += 1;
      } else {
        teamMap.set(res.teamName, { teamName: res.teamName, totalRoundWins, totalKills: 0, seriesWins: isSeriesWin ? 1 : 0, matches: 1 });
      }
    }

    const mmePlayers = db.select({ teamName: scrimPlayerStats.teamName, totalKills: scrimPlayerStats.totalKills }).from(scrimPlayerStats).innerJoin(scrims, eq(scrimPlayerStats.scrimId, scrims.id)).where(eq(scrims.mode, "mme")).all();
    for (const p of mmePlayers) { if (teamMap.has(p.teamName)) teamMap.get(p.teamName).totalKills += p.totalKills; }

    return Array.from(teamMap.values()).map(t => ({ ...t, winRate: t.matches > 0 ? Number(((t.seriesWins / t.matches) * 100).toFixed(1)) : 0 })).sort((a, b) => b.totalRoundWins - a.totalRoundWins);
  }),

  // ============================================================
  // CONSULTAS INDIVIDUAIS (CORRIGIDAS: AGORA FORMATAM AS RODADAS)
  // ============================================================
  playerStatsByName: publicQuery.input(z.object({ playerName: z.string() })).query(({ input }) => {
    const db = getDb();
    
    const results = db.select({
      id: scrimPlayerStats.id,
      scrimId: scrimPlayerStats.scrimId,
      date: scrimPlayerStats.date,
      teamName: scrimPlayerStats.teamName,
      playerName: scrimPlayerStats.playerName,
      totalKills: scrimPlayerStats.totalKills,
      totalAssists: scrimPlayerStats.totalAssists,
      totalDeaths: scrimPlayerStats.totalDeaths,
      totalDamage: scrimPlayerStats.totalDamage,
      totalMvp: scrimPlayerStats.totalMvp,
      createdAt: scrimPlayerStats.createdAt
    })
    .from(scrimPlayerStats)
    .where(eq(scrimPlayerStats.playerName, input.playerName))
    .orderBy(desc(scrimPlayerStats.date))
    .all();

    if (!results.length) return [];

    // Busca as rodadas desses resultados específicos
    const allRounds = db.select().from(scrimPlayerStatRounds)
      .where(inArray(scrimPlayerStatRounds.scrimPlayerStatId, results.map(r => r.id))).all();
      
    const roundsMap = new Map<number, typeof allRounds>();
    for (const round of allRounds) { 
      roundsMap.set(round.scrimPlayerStatId, [...(roundsMap.get(round.scrimPlayerStatId) || []), round]); 
    }

    // Retorna no formato que o frontend espera (com o array de rounds)
    return results.map(r => ({
      ...r,
      rounds: (roundsMap.get(r.id) || []).map(rd => ({ 
        roundNumber: rd.roundNumber, 
        kills: rd.kills, 
        assists: rd.assists, 
        deaths: rd.deaths, 
        damage: rd.damage, 
        mvp: rd.mvp, 
        score: rd.score 
      })).sort((a, b) => a.roundNumber - b.roundNumber)
    }));
  }),

  teamStatsByName: publicQuery.input(z.object({ teamName: z.string() })).query(({ input }) => {
    const db = getDb();
    
    const results = db.select({
      id: scrimResults.id,
      scrimId: scrimResults.scrimId,
      date: scrimResults.date,
      teamName: scrimResults.teamName,
      createdAt: scrimResults.createdAt
    })
    .from(scrimResults)
    .where(eq(scrimResults.teamName, input.teamName))
    .orderBy(desc(scrimResults.date))
    .all();

    if (!results.length) return [];

    // Busca as rodadas desses resultados específicos
    const allRounds = db.select().from(scrimResultRounds)
      .where(inArray(scrimResultRounds.scrimResultId, results.map(r => r.id))).all();
      
    const roundsMap = new Map<number, typeof allRounds>();
    for (const round of allRounds) { 
      roundsMap.set(round.scrimResultId, [...(roundsMap.get(round.scrimResultId) || []), round]); 
    }

    // Retorna no formato que o frontend espera (com o array de rounds)
    return results.map(r => ({
      ...r,
      rounds: (roundsMap.get(r.id) || []).map(rd => ({ 
        roundNumber: rd.roundNumber, 
        value: rd.value 
      })).sort((a, b) => a.roundNumber - b.roundNumber)
    }));
  }),

  getHeadToHead: publicQuery
    .input(z.object({ team1Name: z.string(), team2Name: z.string() }))
    .query(({ input }) => {
      const db = getDb();
      // Busca todos os scrims onde o Time A enfrentou o Time B
      const h2h = db.select().from(scrims).where(
        sql`(LOWER(name) LIKE ${`%${input.team1Name.toLowerCase()}%`} OR LOWER(name) LIKE ${`%${input.team2Name.toLowerCase()}%`})`
      ).all();

      return h2h.map(s => {
        const results = db.select().from(scrimResults).where(eq(scrimResults.scrimId, s.id)).all();
        return {
          ...s,
          results: results.map(r => {
            const rounds = db.select().from(scrimResultRounds).where(eq(scrimResultRounds.scrimResultId, r.id)).all();
            return { ...r, rounds };
          })
        };
      });
    }),
});

function getPointsByPosition(pos: number): number {
  if (!pos) return 0;
  const points: Record<number, number> = { 1: 15, 2: 12, 3: 10, 4: 9, 5: 8, 6: 7, 7: 6, 8: 5, 9: 4, 10: 3, 11: 2, 12: 1, 13: 1, 14: 0, 15: 0 };
  return points[pos] ?? 0;
}