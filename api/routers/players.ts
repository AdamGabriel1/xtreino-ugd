import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "../middleware.js";
import { getDb } from "../queries/connection.js";
import { players, teams, xtreinoPlayerStats, xtreinoResults } from "../../db/schema.js";
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

      // Busca jogadores com joins para stats de xtreino
      const allPlayers = db.select().from(players).all();

      // Enriquece com stats dos xtreinos
      const enriched = allPlayers.map(p => {
        const stats = db
          .select()
          .from(xtreinoPlayerStats)
          .where(eq(xtreinoPlayerStats.playerName, p.nickname))
          .all();

        const totalKills = stats.reduce((sum, s) => sum + (s.totalKills ?? 0), 0);
        const participations = stats.length;

        return {
          ...p,
          xtreinoKills: totalKills,
          xtreinoParticipations: participations,
        };
      });

      if (input?.search) {
        return enriched
          .filter(p => p.nickname.toLowerCase().includes(input.search!.toLowerCase()))
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

      // Stats de xtreinos
      const xtreinoStats = db
        .select()
        .from(xtreinoPlayerStats)
        .where(eq(xtreinoPlayerStats.playerName, player.nickname))
        .orderBy(desc(xtreinoPlayerStats.date))
        .all();

      const totalXtreinoKills = xtreinoStats.reduce((sum, s) => sum + (s.totalKills ?? 0), 0);
      const xtreinoParticipations = xtreinoStats.length;

      // Melhor performance
      const bestXtreino = xtreinoStats.length > 0 
        ? xtreinoStats.reduce((best, curr) => (curr.totalKills ?? 0) > (best.totalKills ?? 0) ? curr : best)
        : null;

      return { 
        ...player, 
        teamName,
        xtreinoStats,
        totalXtreinoKills,
        xtreinoParticipations,
        bestXtreinoKills: bestXtreino?.totalKills ?? 0,
        bestXtreinoDate: bestXtreino?.date ?? null,
      };
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