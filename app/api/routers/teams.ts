import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { teams, players } from "@db/schema";
import { eq, like, desc } from "drizzle-orm";
import { verifyToken } from "../lib/auth";

export const teamsRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        search: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      if (input?.search) {
        return db
          .select()
          .from(teams)
          .where(like(teams.name, `%${input.search}%`))
          .orderBy(desc(teams.createdAt));
      }
      return db.select().from(teams).orderBy(desc(teams.createdAt));
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const team = await db
        .select()
        .from(teams)
        .where(eq(teams.id, input.id))
        .limit(1);

      if (!team[0]) return null;

      const teamPlayers = await db
        .select()
        .from(players)
        .where(eq(players.teamId, input.id));

      return { ...team[0], players: teamPlayers };
    }),

  create: adminQuery
    .input(
      z.object({
        name: z.string().min(1),
        tag: z.string().min(1),
        logo: z.string().optional(),
        captainName: z.string().optional(),
        captainDiscord: z.string().optional(),
        whatsapp: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();
      const result = await db.insert(teams).values({
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
        tag: z.string().optional(),
        logo: z.string().optional(),
        captainName: z.string().optional(),
        captainDiscord: z.string().optional(),
        whatsapp: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const { id, ...data } = input;
      const db = getDb();
      await db
        .update(teams)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(teams.id, id));
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();
      await db.delete(teams).where(eq(teams.id, input.id));
      return { success: true };
    }),
});
