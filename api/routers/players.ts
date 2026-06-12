import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "../middleware.js";
import { getDb } from "../queries/connection.js";
import { players, teams, xtreinoPlayerStats, playerAliases, playerMerges } from "../../db/schema.js";
import { eq, like, desc, and, sql } from "drizzle-orm";
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

      // Busca jogadores que NÃO foram merged (só os masters aparecem na listagem)
      const allPlayers = db
        .select()
        .from(players)
        .all()
        .filter(p => !mergedIds.has(p.id));

      // Busca aliases
      const allAliases = db.select().from(playerAliases).all();

      // Enriquece com stats (incluindo merges + aliases)
      const enriched = allPlayers.map(p => {
        // Encontra se este jogador é master de algum merge
        const merges = allMerges.filter(m => m.masterPlayerId === p.id);
        const mergedPlayerIds = merges.map(m => m.mergedPlayerId);

        // Todos os IDs deste jogador (master + merged)
        const allPlayerIds = [p.id, ...mergedPlayerIds];

        // Busca nicks de todos os IDs (master + merged + aliases)
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

        // Aliases de todos os IDs (master + merged)
        const playerAliasesList = allAliases
          .filter(a => allPlayerIds.includes(a.playerId))
          .map(a => a.alias);

        allNicks.push(...playerAliasesList);

        // Busca stats por qualquer um dos nicks
        const stats = db
          .select()
          .from(xtreinoPlayerStats)
          .all()
          .filter(s => allNicks.includes(s.playerName));

        const totalKills = stats.reduce((sum, s) => sum + (s.totalKills ?? 0), 0);
        const participations = stats.length;

        // Nicks antigos (aliases + merged) para mostrar na UI
        const otherNicks = [...new Set(allNicks.filter(n => n !== p.nickname))];

        return {
          ...p,
          xtreinoKills: totalKills,
          xtreinoParticipations: participations,
          aliases: playerAliasesList,
          mergedNicks: merges.length > 0 
            ? allMerges
                .filter(m => m.masterPlayerId === p.id)
                .map(m => {
                  const mp = db.select().from(players).where(eq(players.id, m.mergedPlayerId)).get();
                  return mp?.nickname;
                })
                .filter(Boolean) as string[]
            : [],
          allPreviousNicks: otherNicks,
        };
      });

      if (input?.search) {
        const q = input.search.toLowerCase();
        return enriched
          .filter(p => 
            p.nickname.toLowerCase().includes(q) ||
            p.allPreviousNicks.some((n: string) => n.toLowerCase().includes(q))
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

      // Verifica se este jogador tem merges
      const allMerges = db.select().from(playerMerges).all();
      const merges = allMerges.filter(m => m.masterPlayerId === input.id);
      const mergedPlayerIds = merges.map(m => m.mergedPlayerId);
      const allPlayerIds = [input.id, ...mergedPlayerIds];

      // Pega aliases de todos os IDs
      const aliases = db
        .select()
        .from(playerAliases)
        .where(eq(playerAliases.playerId, input.id))
        .all()
        .map(a => a.alias);

      // Nicks dos merged
      const mergedNicks = mergedPlayerIds.map(id => {
        const mp = db.select().from(players).where(eq(players.id, id)).get();
        return mp?.nickname;
      }).filter(Boolean) as string[];

      const allNicks = [player.nickname, ...mergedNicks, ...aliases];

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
        aliases,
        mergedNicks,
        xtreinoStats,
        totalXtreinoKills,
        xtreinoParticipations,
        bestXtreinoKills: bestXtreino?.totalKills ?? 0,
        bestXtreinoDate: bestXtreino?.date ?? null,
      };
    }),

  // ===== ADMIN: Gerenciar Aliases =====
  addAlias: adminQuery
    .input(
      z.object({
        playerId: z.number(),
        alias: z.string().min(1),
      })
    )
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();

      // Verifica se o alias já existe para outro jogador
      const existing = db
        .select()
        .from(playerAliases)
        .where(eq(playerAliases.alias, input.alias))
        .get();

      if (existing) throw new Error("Alias já existe para outro jogador");

      const result = db.insert(playerAliases).values(input).run();
      return { id: Number(result.lastInsertRowid), success: true };
    }),

  removeAlias: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();
      db.delete(playerAliases).where(eq(playerAliases.id, input.id)).run();
      return { success: true };
    }),

  listAliases: adminQuery
    .input(z.object({ playerId: z.number() }).optional())
    .query(({ input }) => {
      const db = getDb();
      if (input?.playerId) {
        return db
          .select()
          .from(playerAliases)
          .where(eq(playerAliases.playerId, input.playerId))
          .all();
      }
      return db.select().from(playerAliases).all();
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

      // Verifica se o merged já foi mergeado em outro
      const existing = db
        .select()
        .from(playerMerges)
        .where(eq(playerMerges.mergedPlayerId, input.mergedPlayerId))
        .get();

      if (existing) throw new Error("Jogador já foi mergeado em outro master");

      // Verifica se o master não é ele mesmo
      if (input.masterPlayerId === input.mergedPlayerId) {
        throw new Error("Não pode mergear um jogador nele mesmo");
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