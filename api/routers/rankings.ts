import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "../middleware.js";
import { getDb } from "../queries/connection.js";
import {
  rankings,
  teams,
  players,
  xtreinoResults,
  xtreinoPlayerStats,
  campeonatoResults,
  campeonatoPlayerStats,
  scrimResults,
  scrimPlayerStats,
} from "../../db/schema.js";
import { eq, desc, and } from "drizzle-orm";
import { verifyToken } from "../lib/auth.js";

export const rankingsRouter = createRouter({
  teams: publicQuery
    .input(
      z
        .object({
          limit: z.number().optional(),
          rankType: z.enum(["xtreino", "campeonato", "scrim"]).optional(),
        })
        .optional()
    )
    .query(({ input }) => {
      const db = getDb();
      const conditions = [eq(rankings.entityType, "team")];

      if (input?.rankType) {
        conditions.push(eq(rankings.rankType, input.rankType));
      }

      const query = db
        .select()
        .from(rankings)
        .where(and(...conditions))
        .orderBy(desc(rankings.points));

      if (input?.limit) {
        return query.limit(input.limit).all();
      }

      return query.all();
    }),

  players: publicQuery
    .input(
      z
        .object({
          limit: z.number().optional(),
          rankType: z.enum(["xtreino", "campeonato", "scrim"]).optional(),
        })
        .optional()
    )
    .query(({ input }) => {
      const db = getDb();
      const conditions = [eq(rankings.entityType, "player")];

      if (input?.rankType) {
        conditions.push(eq(rankings.rankType, input.rankType));
      }

      const query = db
        .select()
        .from(rankings)
        .where(and(...conditions))
        .orderBy(desc(rankings.points));

      if (input?.limit) {
        return query.limit(input.limit).all();
      }

      return query.all();
    }),

  recalculate: adminQuery.mutation(({ ctx }) => {
    const payload = verifyToken(ctx.adminToken as string);
    if (!payload) throw new Error("Invalid token");

    const db = getDb();

    // Delete existing rankings
    db.delete(rankings).run();

    // --- XTreino Rankings ---
    const xtResults = db.select().from(xtreinoResults).all();
    const xtPlayerStats = db.select().from(xtreinoPlayerStats).all();

    const xtTeamMap = new Map<
      string,
      { points: number; kills: number; wins: number; participations: number }
    >();
    const xtPlayerMap = new Map<
      string,
      { points: number; kills: number; wins: number; participations: number }
    >();

    for (const r of xtResults) {
      const pts =
        (r.totalPoints ?? 0) +
        ((4 - (r.q1Pos ?? 99)) * 10 + (4 - (r.q2Pos ?? 99)) * 10 + (4 - (r.q3Pos ?? 99)) * 10);
      const existing = xtTeamMap.get(r.teamName) ?? {
        points: 0,
        kills: 0,
        wins: 0,
        participations: 0,
      };
      xtTeamMap.set(r.teamName, {
        points: existing.points + pts,
        kills: existing.kills,
        wins: existing.wins,
        participations: existing.participations + 1,
      });
    }

    for (const p of xtPlayerStats) {
      const pts = (p.totalKills ?? 0) * 2;
      const existing = xtPlayerMap.get(p.playerName) ?? {
        points: 0,
        kills: 0,
        wins: 0,
        participations: 0,
      };
      xtPlayerMap.set(p.playerName, {
        points: existing.points + pts,
        kills: existing.kills + (p.totalKills ?? 0),
        wins: existing.wins,
        participations: existing.participations + 1,
      });
    }

    // --- Campeonato Rankings ---
    const campResults = db.select().from(campeonatoResults).all();
    const campPlayerStats = db.select().from(campeonatoPlayerStats).all();

    const campTeamMap = new Map<
      string,
      { points: number; kills: number; wins: number; participations: number }
    >();
    const campPlayerMap = new Map<
      string,
      { points: number; kills: number; wins: number; participations: number }
    >();

    for (const r of campResults) {
      const pts =
        (r.totalPoints ?? 0) +
        ((4 - (r.q1Pos ?? 99)) * 15 + (4 - (r.q2Pos ?? 99)) * 15 + (4 - (r.q3Pos ?? 99)) * 15);
      const existing = campTeamMap.get(r.teamName) ?? {
        points: 0,
        kills: 0,
        wins: 0,
        participations: 0,
      };
      campTeamMap.set(r.teamName, {
        points: existing.points + pts,
        kills: existing.kills,
        wins: existing.wins + ((r.finalPos ?? 99) <= 3 ? 1 : 0),
        participations: existing.participations + 1,
      });
    }

    for (const p of campPlayerStats) {
      const pts = (p.totalKills ?? 0) * 2;
      const existing = campPlayerMap.get(p.playerName) ?? {
        points: 0,
        kills: 0,
        wins: 0,
        participations: 0,
      };
      campPlayerMap.set(p.playerName, {
        points: existing.points + pts,
        kills: existing.kills + (p.totalKills ?? 0),
        wins: existing.wins,
        participations: existing.participations + 1,
      });
    }

    // --- Scrim Rankings ---
    const scrResults = db.select().from(scrimResults).all();
    const scrPlayerStats = db.select().from(scrimPlayerStats).all();

    const scrTeamMap = new Map<
      string,
      { points: number; kills: number; wins: number; participations: number }
    >();
    const scrPlayerMap = new Map<
      string,
      { points: number; kills: number; wins: number; participations: number }
    >();

    for (const r of scrResults) {
      const pts =
        (4 - (r.q1Pos ?? 99)) * 5 + (4 - (r.q2Pos ?? 99)) * 5 + (4 - (r.q3Pos ?? 99)) * 5;
      const existing = scrTeamMap.get(r.teamName) ?? {
        points: 0,
        kills: 0,
        wins: 0,
        participations: 0,
      };
      scrTeamMap.set(r.teamName, {
        points: existing.points + pts,
        kills: existing.kills,
        wins: existing.wins,
        participations: existing.participations + 1,
      });
    }

    for (const p of scrPlayerStats) {
      const pts = (p.totalKills ?? 0) * 2;
      const existing = scrPlayerMap.get(p.playerName) ?? {
        points: 0,
        kills: 0,
        wins: 0,
        participations: 0,
      };
      scrPlayerMap.set(p.playerName, {
        points: existing.points + pts,
        kills: existing.kills + (p.totalKills ?? 0),
        wins: existing.wins,
        participations: existing.participations + 1,
      });
    }

    // Insert all rankings
    const insertRanking = (
      entityType: "team" | "player",
      rankType: "xtreino" | "campeonato" | "scrim",
      name: string,
      data: { points: number; kills: number; wins: number; participations: number }
    ) => {
      db.insert(rankings)
        .values({
          entityType,
          rankType,
          entityId: 0, // placeholder — pode usar hash do nome se precisar de ID único
          entityName: name,
          points: data.points,
          kills: data.kills,
          wins: data.wins,
          participations: data.participations,
          kdRatio: data.kills > 0 ? parseFloat((data.kills / Math.max(data.participations, 1)).toFixed(2)) : 0,
        })
        .run();
    };

    for (const [name, data] of xtTeamMap) insertRanking("team", "xtreino", name, data);
    for (const [name, data] of xtPlayerMap) insertRanking("player", "xtreino", name, data);
    for (const [name, data] of campTeamMap) insertRanking("team", "campeonato", name, data);
    for (const [name, data] of campPlayerMap) insertRanking("player", "campeonato", name, data);
    for (const [name, data] of scrTeamMap) insertRanking("team", "scrim", name, data);
    for (const [name, data] of scrPlayerMap) insertRanking("player", "scrim", name, data);

    return { success: true };
  }),
});