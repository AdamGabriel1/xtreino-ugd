import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { rankings, teams, players } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import { verifyToken } from "../lib/auth";

export const rankingsRouter = createRouter({
  teams: publicQuery
    .input(
      z.object({
        limit: z.number().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      let query = db
        .select()
        .from(rankings)
        .where(eq(rankings.entityType, "team"))
        .orderBy(desc(rankings.points));

      if (input?.limit) {
        query = query.limit(input.limit) as typeof query;
      }

      return query;
    }),

  players: publicQuery
    .input(
      z.object({
        limit: z.number().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      let query = db
        .select()
        .from(rankings)
        .where(eq(rankings.entityType, "player"))
        .orderBy(desc(rankings.points));

      if (input?.limit) {
        query = query.limit(input.limit) as typeof query;
      }

      return query;
    }),

  recalculate: adminQuery.mutation(async ({ ctx }) => {
    const payload = verifyToken(ctx.adminToken as string);
    if (!payload) throw new Error("Invalid token");

    const db = getDb();

    // Clear existing rankings
    await db.delete(rankings);

    // Calculate team rankings from players
    const allTeams = await db.select().from(teams);
    const allPlayers = await db.select().from(players);

    for (const team of allTeams) {
      const teamPlayers = allPlayers.filter(p => p.teamId === team.id);
      const totalKills = teamPlayers.reduce((sum, p) => sum + p.kills, 0);
      const totalWins = teamPlayers.reduce((sum, p) => sum + p.wins, 0);
      const totalMatches = teamPlayers.reduce((sum, p) => sum + p.matches, 0);
      const totalDeaths = teamPlayers.reduce((sum, p) => sum + p.deaths, 0);
      const kdRatio = totalDeaths > 0 ? (totalKills / totalDeaths).toFixed(2) : totalKills > 0 ? totalKills.toFixed(2) : "0.00";
      const points = totalKills * 2 + totalWins * 50 + totalMatches * 5;

      await db.insert(rankings).values({
        entityType: "team",
        entityId: team.id,
        entityName: team.name,
        points,
        kills: totalKills,
        wins: totalWins,
        participations: totalMatches,
        kdRatio,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    for (const player of allPlayers) {
      const kdRatio = player.deaths > 0 ? (player.kills / player.deaths).toFixed(2) : player.kills > 0 ? player.kills.toFixed(2) : "0.00";
      const points = player.kills * 2 + player.wins * 50 + player.matches * 5;

      await db.insert(rankings).values({
        entityType: "player",
        entityId: player.id,
        entityName: player.nickname,
        points,
        kills: player.kills,
        wins: player.wins,
        participations: player.matches,
        kdRatio,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return { success: true };
  }),
});
