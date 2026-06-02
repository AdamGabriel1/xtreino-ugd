import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "../middleware.js";
import { getDb } from "../queries/connection.js";
import { teams, players } from "@db/schema";
import { eq, like, desc } from "drizzle-orm";
import { verifyToken } from "../lib/auth.js";

export const teamsRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        search: z.string().optional(),
      }).optional()
    )
    .query(({ input }) => {
      const db = getDb();
      if (input?.search) {
        return db
          .select()
          .from(teams)
          .where(like(teams.name, `%${input.search}%`))
          .orderBy(desc(teams.createdAt))
          .all();
      }
      return db.select().from(teams).orderBy(desc(teams.createdAt)).all();
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(({ input }) => {
      const db = getDb();
      const team = db
        .select()
        .from(teams)
        .where(eq(teams.id, input.id))
        .get();

      if (!team) return null;

      const teamPlayers = db
        .select()
        .from(players)
        .where(eq(players.teamId, input.id))
        .all();

      return { ...team, players: teamPlayers };
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
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();
      const result = db.insert(teams).values(input).run();
      return { id: Number(result.lastInsertRowid), success: true };
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
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const { id, ...data } = input;
      const db = getDb();
      db
        .update(teams)
        .set(data)
        .where(eq(teams.id, id))
        .run();
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();
      db.delete(teams).where(eq(teams.id, input.id)).run();
      return { success: true };
    }),
});