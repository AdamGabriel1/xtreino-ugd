import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "../middleware.js";
import { getDb } from "../queries/connection.js";
import { championships, championshipTeams, matches, teams } from "../../db/schema.js";
import { eq, desc, and } from "drizzle-orm";
import { verifyToken } from "../lib/auth.js";

export const championshipsRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        status: z.string().optional(),
      }).optional()
    )
    .query(({ input }) => {
      const db = getDb();
      if (input?.status) {
        return db
          .select()
          .from(championships)
          .where(eq(championships.status, input.status))
          .orderBy(desc(championships.createdAt))
          .all();
      }
      return db.select().from(championships).orderBy(desc(championships.createdAt)).all();
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(({ input }) => {
      const db = getDb();
      const champ = db
        .select()
        .from(championships)
        .where(eq(championships.id, input.id))
        .get();

      if (!champ) return null;

      const cTeams = db
        .select()
        .from(championshipTeams)
        .where(eq(championshipTeams.championshipId, input.id))
        .all();

      const allMatches = db
        .select()
        .from(matches)
        .where(eq(matches.championshipId, input.id))
        .all();

      // Get team names for matches
      const allTeamIds = [...new Set([
        ...cTeams.map(t => t.teamId),
        ...allMatches.filter(m => m.team1Id).map(m => m.team1Id!),
        ...allMatches.filter(m => m.team2Id).map(m => m.team2Id!),
      ])];

      const teamData = allTeamIds.map((tid) => {
        return db.select().from(teams).where(eq(teams.id, tid)).get();
      }).filter(Boolean);

      const teamMap = new Map(teamData.filter(Boolean).map(t => [t!.id, t!]));

      const matchesWithTeams = allMatches.map(m => ({
        ...m,
        team1Name: m.team1Id ? teamMap.get(m.team1Id)?.name : null,
        team2Name: m.team2Id ? teamMap.get(m.team2Id)?.name : null,
      }));

      const cTeamsWithNames = cTeams.map(ct => ({
        ...ct,
        teamName: teamMap.get(ct.teamId)?.name ?? "Desconhecido",
        teamTag: teamMap.get(ct.teamId)?.tag ?? "",
      }));

      return {
        ...champ,
        teams: cTeamsWithNames,
        matches: matchesWithTeams,
      };
    }),

  create: adminQuery
    .input(
      z.object({
        name: z.string().min(1),
        modality: z.string().min(1),
        format: z.string().min(1),
        status: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        rules: z.string().optional(),
        prizePool: z.string().optional(),
        maxTeams: z.number().optional(),
      })
    )
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();
      const result = db.insert(championships).values(input).run();
      return { id: Number(result.lastInsertRowid), success: true };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        modality: z.string().optional(),
        format: z.string().optional(),
        status: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        rules: z.string().optional(),
        prizePool: z.string().optional(),
        maxTeams: z.number().optional(),
        bracketData: z.string().optional(),
        registeredTeams: z.number().optional(),
      })
    )
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const { id, ...data } = input;
      const db = getDb();
      db
        .update(championships)
        .set(data)
        .where(eq(championships.id, id))
        .run();
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();
      db.delete(matches).where(eq(matches.championshipId, input.id)).run();
      db.delete(championshipTeams).where(eq(championshipTeams.championshipId, input.id)).run();
      db.delete(championships).where(eq(championships.id, input.id)).run();
      return { success: true };
    }),

  addTeam: adminQuery
    .input(
      z.object({
        championshipId: z.number(),
        teamId: z.number(),
        groupName: z.string().optional(),
      })
    )
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();
      db.insert(championshipTeams).values({
        championshipId: input.championshipId,
        teamId: input.teamId,
        groupName: input.groupName,
      }).run();

      // Update registered teams count
      const count = db
        .select()
        .from(championshipTeams)
        .where(eq(championshipTeams.championshipId, input.championshipId))
        .all();

      db
        .update(championships)
        .set({ registeredTeams: count.length })
        .where(eq(championships.id, input.championshipId))
        .run();

      return { success: true };
    }),

  removeTeam: adminQuery
    .input(
      z.object({
        championshipId: z.number(),
        teamId: z.number(),
      })
    )
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();
      db
        .delete(championshipTeams)
        .where(
          and(
            eq(championshipTeams.championshipId, input.championshipId),
            eq(championshipTeams.teamId, input.teamId)
          )
        )
        .run();

      const count = db
        .select()
        .from(championshipTeams)
        .where(eq(championshipTeams.championshipId, input.championshipId))
        .all();

      db
        .update(championships)
        .set({ registeredTeams: count.length })
        .where(eq(championships.id, input.championshipId))
        .run();

      return { success: true };
    }),

  updateMatch: adminQuery
    .input(
      z.object({
        id: z.number().optional(),
        championshipId: z.number(),
        team1Id: z.number().optional(),
        team2Id: z.number().optional(),
        round: z.number().optional(),
        bracketType: z.string().optional(),
        team1Score: z.number().optional(),
        team2Score: z.number().optional(),
        status: z.string().optional(),
        scheduledDate: z.string().optional(),
      })
    )
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();
      const { id, championshipId, ...data } = input;

      if (id) {
        db
          .update(matches)
          .set(data)
          .where(eq(matches.id, id))
          .run();
      } else {
        db.insert(matches).values({
          championshipId,
          ...data,
        }).run();
      }
      return { success: true };
    }),

  updateStandings: adminQuery
    .input(
      z.object({
        championshipTeamId: z.number(),
        points: z.number().optional(),
        kills: z.number().optional(),
        wins: z.number().optional(),
        matchesPlayed: z.number().optional(),
      })
    )
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const { championshipTeamId, ...data } = input;
      const db = getDb();
      db
        .update(championshipTeams)
        .set(data)
        .where(eq(championshipTeams.id, championshipTeamId))
        .run();
      return { success: true };
    }),
});