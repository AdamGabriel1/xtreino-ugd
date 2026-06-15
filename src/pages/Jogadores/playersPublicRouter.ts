import { createRouter, publicQuery } from "../../../api/middleware.js";
import { getDb } from "../../../api/queries/connection.js";
import { xtreinos, xtreinoPlayerStats, players, teams } from "../../../db/schema.js";
import { eq, desc } from "drizzle-orm";

export const playersPublicRouter = createRouter({
  listXtreinos: publicQuery.query(() => {
    const db = getDb();
    return db
      .select({ id: xtreinos.id, name: xtreinos.name, date: xtreinos.date })
      .from(xtreinos)
      .orderBy(desc(xtreinos.date))
      .all();
  }),

  rankingStats: publicQuery.query(() => {
    const db = getDb();

    const stats = db.select().from(xtreinoPlayerStats).all();

    // Enriquece com teamName (igual seu playersRouter faz)
    return stats.map((stat) => {
      let teamName = "Sem time";

      const player = db
        .select()
        .from(players)
        .where(eq(players.nickname, stat.playerName))
        .get();

      if (player?.teamId) {
        const team = db
          .select()
          .from(teams)
          .where(eq(teams.id, player.teamId))
          .get();
        if (team) teamName = team.name;
      }

      return {
        id: stat.id,
        xtreinoId: stat.xtreinoId,
        date: stat.date,
        teamName,
        playerName: stat.playerName,
        q1Kills: stat.q1Kills ?? 0,
        q2Kills: stat.q2Kills ?? 0,
        q3Kills: stat.q3Kills ?? 0,
        totalKills: stat.totalKills ?? 0,
      };
    });
  }),
});