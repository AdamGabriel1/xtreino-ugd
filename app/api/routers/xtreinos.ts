import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { xtreinos, xtreinoTeams, teams } from "@db/schema";
import { eq, desc, and } from "drizzle-orm";
import { verifyToken } from "../lib/auth";

export const xtreinosRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        status: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      if (input?.status) {
        return db
          .select()
          .from(xtreinos)
          .where(eq(xtreinos.status, input.status))
          .orderBy(desc(xtreinos.createdAt));
      }
      return db.select().from(xtreinos).orderBy(desc(xtreinos.createdAt));
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const xtreino = await db
        .select()
        .from(xtreinos)
        .where(eq(xtreinos.id, input.id))
        .limit(1);

      if (!xtreino[0]) return null;

      const xTeams = await db
        .select()
        .from(xtreinoTeams)
        .where(eq(xtreinoTeams.xtreinoId, input.id));

      const teamIds = xTeams.map(t => t.teamId);
      const teamData = await Promise.all(
        teamIds.map(async (tid) => {
          const t = await db.select().from(teams).where(eq(teams.id, tid)).limit(1);
          return t[0];
        })
      );
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
        ...xtreino[0],
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
    .mutation(async ({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();
      const result = await db.insert(xtreinos).values({
        ...input,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return { id: Number(result[0].insertId), success: true };
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
    .mutation(async ({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const { id, ...data } = input;
      const db = getDb();
      await db
        .update(xtreinos)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(xtreinos.id, id));
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();
      await db.delete(xtreinoTeams).where(eq(xtreinoTeams.xtreinoId, input.id));
      await db.delete(xtreinos).where(eq(xtreinos.id, input.id));
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
    .mutation(async ({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();
      await db.insert(xtreinoTeams).values({
        xtreinoId: input.xtreinoId,
        teamId: input.teamId,
        isReserve: input.isReserve ?? false,
        slotNumber: input.slotNumber,
        createdAt: new Date(),
      });
      return { success: true };
    }),

  removeTeam: adminQuery
    .input(
      z.object({
        xtreinoId: z.number(),
        teamId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();
      await db
        .delete(xtreinoTeams)
        .where(
          and(
            eq(xtreinoTeams.xtreinoId, input.xtreinoId),
            eq(xtreinoTeams.teamId, input.teamId)
          )
        );
      return { success: true };
    }),
});
