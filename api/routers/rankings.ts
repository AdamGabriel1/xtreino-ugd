import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "../../api/middleware.js";
import { getDb } from "../../api/queries/connection.js";
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
import { verifyToken } from "../../api/lib/auth.js";

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
      const existing = scrTeamMap.get(r.teamName) ?? {
        points: 0,
        kills: 0,
        wins: 0,
        participations: 0,
      };
      scrTeamMap.set(r.teamName, {
        points: existing.points,
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

    const teamIdMap = new Map<string, number>(
      db.select({ id: teams.id, name: teams.name }).from(teams).all().map((team) => [team.name, team.id])
    );
    const playerIdMap = new Map<string, number>(
      db.select({ id: players.id, nickname: players.nickname }).from(players).all().map((player) => [player.nickname, player.id])
    );

    // Insert all rankings - usando sql para evitar conflito de ID
    const insertRanking = (
      entityType: "team" | "player",
      rankType: "xtreino" | "campeonato" | "scrim",
      name: string,
      data: { points: number; kills: number; wins: number; participations: number }
    ) => {
      try {
        db.insert(rankings)
          .values({
            entityType,
            entityId: entityType === "team" ? teamIdMap.get(name) ?? 0 : playerIdMap.get(name) ?? 0,
            rankType,
            entityName: name,
            points: data.points,
            kills: data.kills,
            wins: data.wins,
            participations: data.participations,
            kdRatio: data.kills > 0 ? parseFloat((data.kills / Math.max(data.participations, 1)).toFixed(2)) : 0,
          })
          .run();
      } catch (e) {
        console.error(`Erro ao inserir ranking ${entityType} ${rankType} ${name}:`, e);
      }
    };

    for (const [name, data] of xtTeamMap) insertRanking("team", "xtreino", name, data);
    for (const [name, data] of xtPlayerMap) insertRanking("player", "xtreino", name, data);
    for (const [name, data] of campTeamMap) insertRanking("team", "campeonato", name, data);
    for (const [name, data] of campPlayerMap) insertRanking("player", "campeonato", name, data);
    for (const [name, data] of scrTeamMap) insertRanking("team", "scrim", name, data);
    for (const [name, data] of scrPlayerMap) insertRanking("player", "scrim", name, data);

    return { success: true, message: "Rankings recalculados com sucesso" };
  }),
});