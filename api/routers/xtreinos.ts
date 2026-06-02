import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "../middleware.js";
import { getDb } from "../queries/connection.js";
import { xtreinos, xtreinoTeams, teams } from "../../db/schema.js";
import { eq, desc, and } from "drizzle-orm";
import { verifyToken } from "../lib/auth.js";

export const xtreinosRouter = createRouter({
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
          .from(xtreinos)
          .where(eq(xtreinos.status, input.status))
          .orderBy(desc(xtreinos.createdAt))
          .all();
      }
      return db.select().from(xtreinos).orderBy(desc(xtreinos.createdAt)).all();
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(({ input }) => {
      const db = getDb();
      const xtreino = db
        .select()
        .from(xtreinos)
        .where(eq(xtreinos.id, input.id))
        .get();

      if (!xtreino) return null;

      const xTeams = db
        .select()
        .from(xtreinoTeams)
        .where(eq(xtreinoTeams.xtreinoId, input.id))
        .all();

      const teamIds = xTeams.map(t => t.teamId);
      const teamData = teamIds.map((tid) => {
        return db.select().from(teams).where(eq(teams.id, tid)).get();
      }).filter(Boolean);

      const teamMap = new Map(teamData.filter(Boolean).map(t => [t!.id, t!]));

      const mainTeams = xTeams
        .filter(t => !t.isReserve)
        .map(t => ({
          ...t,
          teamName: teamMap.get(t.teamId)?.name ?? "Desconhecido",
          teamTag: teamMap.get(t.teamId)?.tag ?? "",
        }));

      const reserveTeams = xTeams
        .filter(t => t.isReserve)
        .map(t => ({
          ...t,
          teamName: teamMap.get(t.teamId)?.name ?? "Desconhecido",
          teamTag: teamMap.get(t.teamId)?.tag ?? "",
        }));

      return {
        ...xtreino,
        teams: mainTeams,
        reserves: reserveTeams,
      };
    }),

  create: adminQuery
    .input(
      z.object({
        name: z.string().min(1),
        date: z.string().min(1),
        timeMx: z.string().optional(),
        timeBr: z.string().optional(),
        modality: z.string().min(1),
        maxTeams: z.number().optional(),
        rules: z.string().optional(),
        discordLink: z.string().optional(),
        whatsappLink: z.string().optional(),
        status: z.string().optional(),
      })
    )
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();
      const result = db.insert(xtreinos).values(input).run();
      return { id: Number(result.lastInsertRowid), success: true };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        date: z.string().optional(),
        timeMx: z.string().optional(),
        timeBr: z.string().optional(),
        modality: z.string().optional(),
        maxTeams: z.number().optional(),
        rules: z.string().optional(),
        discordLink: z.string().optional(),
        whatsappLink: z.string().optional(),
        status: z.string().optional(),
      })
    )
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const { id, ...data } = input;
      const db = getDb();
      db
        .update(xtreinos)
        .set(data)
        .where(eq(xtreinos.id, id))
        .run();
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();
      db.delete(xtreinoTeams).where(eq(xtreinoTeams.xtreinoId, input.id)).run();
      db.delete(xtreinos).where(eq(xtreinos.id, input.id)).run();
      return { success: true };
    }),

  addTeam: adminQuery
    .input(
      z.object({
        xtreinoId: z.number(),
        teamId: z.number(),
        isReserve: z.boolean().optional(),
        slotNumber: z.number().optional(),
      })
    )
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();
      db.insert(xtreinoTeams).values({
        xtreinoId: input.xtreinoId,
        teamId: input.teamId,
        isReserve: input.isReserve ?? false,
        slotNumber: input.slotNumber,
      }).run();
      return { success: true };
    }),

  removeTeam: adminQuery
    .input(
      z.object({
        xtreinoId: z.number(),
        teamId: z.number(),
      })
    )
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();
      db
        .delete(xtreinoTeams)
        .where(
          and(
            eq(xtreinoTeams.xtreinoId, input.xtreinoId),
            eq(xtreinoTeams.teamId, input.teamId)
          )
        )
        .run();
      return { success: true };
    }),
});