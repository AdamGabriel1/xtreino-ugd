import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "../middleware.js";
import { getDb } from "../queries/connection.js";
import { players, teams, xtreinos, xtreinoPlayerStats, playerMerges } from "../../db/schema.js";
import { eq, desc, inArray } from "drizzle-orm";
import { verifyToken } from "../lib/auth.js";

export const playersRouter = createRouter({
  // ===== PUBLICO: Lista de xtreinos para filtros =====
  listXtreinos: publicQuery.query(() => {
    const db = getDb();
    return db
      .select({ id: xtreinos.id, name: xtreinos.name, date: xtreinos.date })
      .from(xtreinos)
      .orderBy(desc(xtreinos.date))
      .all();
  }),

  // ===== PUBLICO: Stats de jogadores para ranking (UNIFICADO) =====
  rankingStats: publicQuery.query(() => {
    const db = getDb();

    // 1. Busca todos os merges (master → merged)
    const allMerges = db.select().from(playerMerges).all();

    // 2. Cria map: mergedPlayerId → masterPlayerId
    const mergeMap = new Map<number, number>();
    for (const m of allMerges) {
      mergeMap.set(m.mergedPlayerId, m.masterPlayerId);
    }

    // 3. Busca todos os jogadores para resolver nicks
    const allPlayers = db.select().from(players).all();
    const playerById = new Map(allPlayers.map((p) => [p.id, p]));

    // 4. Cria map: merged nickname → master nickname
    // E também: masterPlayerId → { nickname, teamId }
    const nickMergeMap = new Map<string, string>(); // antigo → atual
    const masterInfoMap = new Map<number, { nickname: string; teamId: number | null }>();

    for (const m of allMerges) {
      const master = playerById.get(m.masterPlayerId);
      const merged = playerById.get(m.mergedPlayerId);
      if (master && merged) {
        nickMergeMap.set(merged.nickname, master.nickname);
        masterInfoMap.set(m.masterPlayerId, { nickname: master.nickname, teamId: master.teamId });
      }
    }
    // Também adiciona os próprios masters no map
    for (const p of allPlayers) {
      if (!masterInfoMap.has(p.id)) {
        masterInfoMap.set(p.id, { nickname: p.nickname, teamId: p.teamId });
      }
    }

    // 5. Busca todos os stats dos xtreinos
    const stats = db.select().from(xtreinoPlayerStats).all();

    // 6. Resolve teamName para cada jogador (master)
    const teamCache = new Map<number, string>();
    function getTeamName(teamId: number | null): string {
      if (!teamId) return "Sem time";
      if (teamCache.has(teamId)) return teamCache.get(teamId)!;
      const team = db.select().from(teams).where(eq(teams.id, teamId)).get();
      const name = team?.name ?? "Sem time";
      teamCache.set(teamId, name);
      return name;
    }

    // 7. Unifica os stats: soma kills do mesmo jogador no mesmo xtreino
    // Chave: "masterNickname|xtreinoId|date"
    const unifiedMap = new Map<string, {
      id: number;
      xtreinoId: number;
      date: string;
      teamName: string;
      playerName: string;
      q1Kills: number;
      q2Kills: number;
      q3Kills: number;
      totalKills: number;
    }>();

    for (const stat of stats) {
      // Verifica se esse nick é um nick antigo (merged)
      const masterNick = nickMergeMap.get(stat.playerName) ?? stat.playerName;

      // Resolve team do master
      let teamName = "Sem time";
      const masterPlayer = allPlayers.find((p) => p.nickname === masterNick);
      if (masterPlayer?.teamId) {
        teamName = getTeamName(masterPlayer.teamId);
      } else {
        // Fallback: tenta achar pelo player original do stat
        const originalPlayer = allPlayers.find((p) => p.nickname === stat.playerName);
        if (originalPlayer?.teamId) {
          teamName = getTeamName(originalPlayer.teamId);
        } else {
          // Último fallback: usa o teamName do próprio stat se existir
          teamName = stat.teamName ?? "Sem time";
        }
      }

      const key = `${masterNick}|${stat.xtreinoId}|${stat.date}`;
      const existing = unifiedMap.get(key);

      if (existing) {
        existing.q1Kills += stat.q1Kills ?? 0;
        existing.q2Kills += stat.q2Kills ?? 0;
        existing.q3Kills += stat.q3Kills ?? 0;
        existing.totalKills += stat.totalKills ?? 0;
      } else {
        unifiedMap.set(key, {
          id: stat.id,
          xtreinoId: stat.xtreinoId,
          date: stat.date,
          teamName,
          playerName: masterNick,
          q1Kills: stat.q1Kills ?? 0,
          q2Kills: stat.q2Kills ?? 0,
          q3Kills: stat.q3Kills ?? 0,
          totalKills: stat.totalKills ?? 0,
        });
      }
    }

    return Array.from(unifiedMap.values());
  }),

  list: publicQuery
    .input(
      z.object({
        search: z.string().optional(),
        teamId: z.number().optional(),
      }).optional()
    )
    .query(({ input }) => {
      const db = getDb();

      const allMerges = db.select().from(playerMerges).all();
      const mergedIds = new Set(allMerges.map(m => m.mergedPlayerId));

      const allPlayers = db
        .select()
        .from(players)
        .all()
        .filter(p => !mergedIds.has(p.id));

      const enriched = allPlayers.map(p => {
        const merges = allMerges.filter(m => m.masterPlayerId === p.id);
        const mergedPlayerIds = merges.map(m => m.mergedPlayerId);
        const allPlayerIds = [p.id, ...mergedPlayerIds];
        const allNicks = [p.nickname];

        for (const mergedId of mergedPlayerIds) {
          const mergedPlayer = db
            .select()
            .from(players)
            .where(eq(players.id, mergedId))
            .get();
          if (mergedPlayer) allNicks.push(mergedPlayer.nickname);
        }

        const stats = db
          .select()
          .from(xtreinoPlayerStats)
          .all()
          .filter(s => allNicks.includes(s.playerName));

        const totalKills = stats.reduce((sum, s) => sum + (s.totalKills ?? 0), 0);
        const participations = stats.length;
        const previousNicks = [...new Set(allNicks.filter(n => n !== p.nickname))];

        return {
          ...p,
          xtreinoKills: totalKills,
          xtreinoParticipations: participations,
          previousNicks,
        };
      });

      if (input?.search) {
        const q = input.search.toLowerCase();
        return enriched
          .filter(p => 
            p.nickname.toLowerCase().includes(q) ||
            p.previousNicks.some((n: string) => n.toLowerCase().includes(q))
          )
          .sort((a, b) => (b.xtreinoKills ?? 0) - (a.xtreinoKills ?? 0));
      }

      if (input?.teamId) {
        return enriched
          .filter(p => p.teamId === input.teamId)
          .sort((a, b) => (b.xtreinoKills ?? 0) - (a.xtreinoKills ?? 0));
      }

      return enriched.sort((a, b) => (b.xtreinoKills ?? 0) - (a.xtreinoKills ?? 0));
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(({ input }) => {
      const db = getDb();
      const player = db
        .select()
        .from(players)
        .where(eq(players.id, input.id))
        .get();

      if (!player) return null;

      let teamName = null;
      if (player.teamId) {
        const team = db
          .select()
          .from(teams)
          .where(eq(teams.id, player.teamId))
          .get();
        teamName = team?.name ?? null;
      }

      const allMerges = db.select().from(playerMerges).all();
      const merges = allMerges.filter(m => m.masterPlayerId === input.id);
      const mergedPlayerIds = merges.map(m => m.mergedPlayerId);

      const allNicks = [player.nickname];
      for (const mergedId of mergedPlayerIds) {
        const mp = db.select().from(players).where(eq(players.id, mergedId)).get();
        if (mp) allNicks.push(mp.nickname);
      }

      const previousNicks = [...new Set(allNicks.filter(n => n !== player.nickname))];

      const xtreinoStats = db
        .select()
        .from(xtreinoPlayerStats)
        .all()
        .filter(s => allNicks.includes(s.playerName))
        .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));

      const totalXtreinoKills = xtreinoStats.reduce((sum, s) => sum + (s.totalKills ?? 0), 0);
      const xtreinoParticipations = xtreinoStats.length;

      const bestXtreino = xtreinoStats.length > 0 
        ? xtreinoStats.reduce((best, curr) => (curr.totalKills ?? 0) > (best.totalKills ?? 0) ? curr : best)
        : null;

      return { 
        ...player, 
        teamName,
        previousNicks,
        xtreinoStats,
        totalXtreinoKills,
        xtreinoParticipations,
        bestXtreinoKills: bestXtreino?.totalKills ?? 0,
        bestXtreinoDate: bestXtreino?.date ?? null,
      };
    }),

  addMerge: adminQuery
    .input(
      z.object({
        masterPlayerId: z.number(),
        mergedPlayerId: z.number(),
      })
    )
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();
      const existing = db
        .select()
        .from(playerMerges)
        .where(eq(playerMerges.mergedPlayerId, input.mergedPlayerId))
        .get();

      if (existing) throw new Error("Jogador já foi mergeado");
      if (input.masterPlayerId === input.mergedPlayerId) {
        throw new Error("Não pode mergear em si mesmo");
      }

      const result = db.insert(playerMerges).values(input).run();
      return { id: Number(result.lastInsertRowid), success: true };
    }),

  removeMerge: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();
      db.delete(playerMerges).where(eq(playerMerges.id, input.id)).run();
      return { success: true };
    }),

  listMerges: adminQuery
    .query(() => {
      const db = getDb();
      return db.select().from(playerMerges).all();
    }),

  create: adminQuery
    .input(
      z.object({
        nickname: z.string().min(1),
        uid: z.string().optional(),
        discord: z.string().optional(),
        teamId: z.number().optional(),
        kills: z.number().optional(),
        deaths: z.number().optional(),
        wins: z.number().optional(),
        matches: z.number().optional(),
      })
    )
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();
      const result = db.insert(players).values(input).run();
      return { id: Number(result.lastInsertRowid), success: true };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        nickname: z.string().optional(),
        uid: z.string().optional(),
        discord: z.string().optional(),
        teamId: z.number().optional(),
        kills: z.number().optional(),
        deaths: z.number().optional(),
        wins: z.number().optional(),
        matches: z.number().optional(),
      })
    )
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const { id, ...data } = input;
      const db = getDb();
      db.update(players).set(data).where(eq(players.id, id)).run();
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();
      db.delete(players).where(eq(players.id, input.id)).run();
      return { success: true };
    }),
});