import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "../middleware.js";
import { getDb } from "../queries/connection.js";
import { players, teams, xtreinoPlayerStats, playerMerges } from "../../db/schema.js";
import { eq, desc } from "drizzle-orm";
import { verifyToken } from "../lib/auth.js";

export const playersRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        search: z.string().optional(),
        teamId: z.number().optional(),
      }).optional()
    )
    .query(({ input }) => {
      const db = getDb();

      // Busca todos os merges
      const allMerges = db.select().from(playerMerges).all();
      const mergedIds = new Set(allMerges.map(m => m.mergedPlayerId));

      // Busca jogadores que NÃO foram merged (só os masters aparecem)
      const allPlayers = db
        .select()
        .from(players)
        .all()
        .filter(p => !mergedIds.has(p.id));

      // Enriquece com stats (master + merged + nicks antigos dos xtreinos)
      const enriched = allPlayers.map(p => {
        // Encontra merges deste master
        const merges = allMerges.filter(m => m.masterPlayerId === p.id);
        const mergedPlayerIds = merges.map(m => m.mergedPlayerId);

        // Todos os IDs deste jogador
        const allPlayerIds = [p.id, ...mergedPlayerIds];

        // Todos os nicks (master + merged)
        const allNicks = [p.nickname];

        // Nicks dos jogadores merged
        for (const mergedId of mergedPlayerIds) {
          const mergedPlayer = db
            .select()
            .from(players)
            .where(eq(players.id, mergedId))
            .get();
          if (mergedPlayer) allNicks.push(mergedPlayer.nickname);
        }

        // Busca stats por qualquer um dos nicks
        const stats = db
          .select()
          .from(xtreinoPlayerStats)
          .all()
          .filter(s => allNicks.includes(s.playerName));

        const totalKills = stats.reduce((sum, s) => sum + (s.totalKills ?? 0), 0);
        const participations = stats.length;

        // Nicks antigos (todos exceto o atual)
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

      // Verifica merges deste jogador
      const allMerges = db.select().from(playerMerges).all();
      const merges = allMerges.filter(m => m.masterPlayerId === input.id);
      const mergedPlayerIds = merges.map(m => m.mergedPlayerId);

      // Todos os nicks (master + merged)
      const allNicks = [player.nickname];

      for (const mergedId of mergedPlayerIds) {
        const mp = db.select().from(players).where(eq(players.id, mergedId)).get();
        if (mp) allNicks.push(mp.nickname);
      }

      const previousNicks = [...new Set(allNicks.filter(n => n !== player.nickname))];

      // Stats de xtreinos por qualquer nick
      const xtreinoStats = db
        .select()
        .from(xtreinoPlayerStats)
        .all()
        .filter(s => allNicks.includes(s.playerName))
        .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));

      const totalXtreinoKills = xtreinoStats.reduce((sum, s) => sum + (s.totalKills ?? 0), 0);
      const xtreinoParticipations = xtreinoStats.length;

      // Melhor performance
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

  // ===== ADMIN: Gerenciar Merges =====
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
      db
        .update(players)
        .set(data)
        .where(eq(players.id, id))
        .run();
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