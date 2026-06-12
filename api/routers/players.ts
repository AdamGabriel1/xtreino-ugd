import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "../middleware.js";
import { getDb } from "../queries/connection.js";
import { players, teams, xtreinoPlayerStats, playerAliases } from "../../db/schema.js";
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

      // Busca jogadores
      const allPlayers = db.select().from(players).all();

      // Busca todos os aliases
      const allAliases = db.select().from(playerAliases).all();

      // Enriquece com stats dos xtreinos (incluindo aliases)
      const enriched = allPlayers.map(p => {
        // Pega todos os nicks deste jogador (atual + aliases)
        const playerAliasesList = allAliases
          .filter(a => a.playerId === p.id)
          .map(a => a.alias);

        const allNicks = [p.nickname, ...playerAliasesList];

        // Busca stats por qualquer um dos nicks
        const stats = db
          .select()
          .from(xtreinoPlayerStats)
          .all()
          .filter(s => allNicks.includes(s.playerName));

        const totalKills = stats.reduce((sum, s) => sum + (s.totalKills ?? 0), 0);
        const participations = stats.length;

        return {
          ...p,
          xtreinoKills: totalKills,
          xtreinoParticipations: participations,
          aliases: playerAliasesList,
        };
      });

      if (input?.search) {
        const q = input.search.toLowerCase();
        return enriched
          .filter(p => 
            p.nickname.toLowerCase().includes(q) ||
            p.aliases.some((a: string) => a.toLowerCase().includes(q))
          )
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }

      if (input?.teamId) {
        return enriched
          .filter(p => p.teamId === input.teamId)
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }

      return enriched.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
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

      // Pega aliases deste jogador
      const aliases = db
        .select()
        .from(playerAliases)
        .where(eq(playerAliases.playerId, input.id))
        .all()
        .map(a => a.alias);

      const allNicks = [player.nickname, ...aliases];

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