import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { registrations } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import { verifyToken } from "../lib/auth";

export const registrationsRouter = createRouter({
  list: adminQuery
    .input(
      z.object({
        eventType: z.string().optional(),
        status: z.string().optional(),
      }).optional()
    )
    .query(async ({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();
      let query = db.select().from(registrations).orderBy(desc(registrations.createdAt));

      if (input?.eventType) {
        query = query.where(eq(registrations.eventType, input.eventType)) as typeof query;
      }
      if (input?.status) {
        query = query.where(eq(registrations.status, input.status)) as typeof query;
      }

      return query;
    }),

  create: publicQuery
    .input(
      z.object({
        type: z.string().min(1),
        teamName: z.string().min(1),
        teamTag: z.string().optional(),
        captainName: z.string().optional(),
        captainDiscord: z.string().optional(),
        whatsapp: z.string().optional(),
        teamLogo: z.string().optional(),
        eventType: z.string().min(1),
        eventId: z.number(),
        playersData: z.string().optional(),
        reservesData: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(registrations).values({
        ...input,
        status: "pendente",
        createdAt: new Date(),
      });
      return { id: Number(result[0].insertId), success: true };
    }),

  updateStatus: adminQuery
    .input(
      z.object({
        id: z.number(),
        status: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();
      await db
        .update(registrations)
        .set({ status: input.status })
        .where(eq(registrations.id, input.id));
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();
      await db.delete(registrations).where(eq(registrations.id, input.id));
      return { success: true };
    }),
});
