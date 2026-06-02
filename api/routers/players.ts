import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { players, teams } from "@db/schema";
import { eq, like, desc } from "drizzle-orm";
import { verifyToken } from "../lib/auth";

export const playersRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        search: z.string().optional(),
        teamId: z.number().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      if (input?.search) {
        return db
          .select()
          .from(players)
          .where(like(players.nickname, `%${input.search}%`))
          .orderBy(desc(players.createdAt));
      }

      if (input?.teamId) {
        return db
          .select()
          .from(players)
          .where(eq(players.teamId, input.teamId))
          .orderBy(desc(players.createdAt));
      }

      return db.select().from(players).orderBy(desc(players.createdAt));
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const player = await db
        .select()
        .from(players)
        .where(eq(players.id, input.id))
        .limit(1);

      if (!player[0]) return null;

      let teamName = null;
      if (player[0].teamId) {
        const team = await db
          .select()
          .from(teams)
          .where(eq(teams.id, player[0].teamId))
          .limit(1);
        teamName = team[0]?.name ?? null;
      }

      return { ...player[0], teamName };
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
    .mutation(async ({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();
      const result = await db.insert(players).values({
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
    .mutation(async ({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const { id, ...data } = input;
      const db = getDb();
      await db
        .update(players)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(players.id, id));
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();
      await db.delete(players).where(eq(players.id, input.id));
      return { success: true };
    }),
});
