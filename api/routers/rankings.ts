import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "../middleware.js";
import { getDb } from "../queries/connection.js";
import { rankings, teams, players } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import { verifyToken } from "../lib/auth.js";

export const rankingsRouter = createRouter({
  teams: publicQuery
    .input(
      z.object({
        limit: z.number().optional(),
      }).optional()
    )
    .query(({ input }) => {
      const db = getDb();

      if (input?.limit) {
        return db
          .select()
          .from(rankings)
          .where(eq(rankings.entityType, "team"))
          .orderBy(desc(rankings.points))
          .limit(input.limit)
          .all();
      }

      return db
        .select()
        .from(rankings)
        .where(eq(rankings.entityType, "team"))
        .orderBy(desc(rankings.points))
        .all();
    }),

  players: publicQuery
    .input(
      z.object({
        limit: z.number().optional(),
      }).optional()
    )
    .query(({ input }) => {
      const db = getDb();

      if (input?.limit) {
        return db
          .select()
          .from(rankings)
          .where(eq(rankings.entityType, "player"))
          .orderBy(desc(rankings.points))
          .limit(input.limit)
          .all();
      }

      return db
        .select()
        .from(rankings)
        .where(eq(rankings.entityType, "player"))
        .orderBy(desc(rankings.points))
        .all();
    }),

  recalculate: adminQuery.mutation(({ ctx }) => {
    const payload = verifyToken(ctx.adminToken as string);
    if (!payload) throw new Error("Invalid token");

    const db = getDb();

    // Clear existing rankings
    db.delete(rankings).run();

    // Calculate team rankings from players
    const allTeams = db.select().from(teams).all();
    const allPlayers = db.select().from(players).all();

    for (const team of allTeams) {
      const teamPlayers = allPlayers.filter(p => p.teamId === team.id);
      const totalKills = teamPlayers.reduce((sum, p) => sum + p.kills, 0);
      const totalWins = teamPlayers.reduce((sum, p) => sum + p.wins, 0);
      const totalMatches = teamPlayers.reduce((sum, p) => sum + p.matches, 0);
      const totalDeaths = teamPlayers.reduce((sum, p) => sum + p.deaths, 0);
      const kdRatio = totalDeaths > 0 ? parseFloat((totalKills / totalDeaths).toFixed(2)) : totalKills > 0 ? parseFloat(totalKills.toFixed(2)) : 0;
      const points = totalKills * 2 + totalWins * 50 + totalMatches * 5;

      db.insert(rankings).values({
        entityType: "team",
        entityId: team.id,
        entityName: team.name,
        points,
        kills: totalKills,
        wins: totalWins,
        participations: totalMatches,
        kdRatio,
      }).run();
    }

    for (const player of allPlayers) {
      const kdRatio = player.deaths > 0 ? parseFloat((player.kills / player.deaths).toFixed(2)) : player.kills > 0 ? parseFloat(player.kills.toFixed(2)) : 0;
      const points = player.kills * 2 + player.wins * 50 + player.matches * 5;

      db.insert(rankings).values({
        entityType: "player",
        entityId: player.id,
        entityName: player.nickname,
        points,
        kills: player.kills,
        wins: player.wins,
        participations: player.matches,
        kdRatio,
      }).run();
    }

    return { success: true };
  }),
});