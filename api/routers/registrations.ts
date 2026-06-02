import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "../middleware.js";
import { getDb } from "../queries/connection.js";
import { registrations } from "../../db/schema.js";
import { eq, desc, and } from "drizzle-orm";
import { verifyToken } from "../lib/auth.js";

export const registrationsRouter = createRouter({
  list: adminQuery
    .input(
      z.object({
        eventType: z.string().optional(),
        status: z.string().optional(),
      }).optional()
    )
    .query(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();
      const conditions = [];

      if (input?.eventType) {
        conditions.push(eq(registrations.eventType, input.eventType));
      }
      if (input?.status) {
        conditions.push(eq(registrations.status, input.status));
      }

      if (conditions.length > 0) {
        return db
          .select()
          .from(registrations)
          .where(and(...conditions))
          .orderBy(desc(registrations.createdAt))
          .all();
      }

      return db
        .select()
        .from(registrations)
        .orderBy(desc(registrations.createdAt))
        .all();
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
    .mutation(({ input }) => {
      const db = getDb();
      const result = db.insert(registrations).values({
        ...input,
        status: "pendente",
      }).run();
      return { id: Number(result.lastInsertRowid), success: true };
    }),

  updateStatus: adminQuery
    .input(
      z.object({
        id: z.number(),
        status: z.string().min(1),
      })
    )
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();
      db
        .update(registrations)
        .set({ status: input.status })
        .where(eq(registrations.id, input.id))
        .run();
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();
      db.delete(registrations).where(eq(registrations.id, input.id)).run();
      return { success: true };
    }),
});