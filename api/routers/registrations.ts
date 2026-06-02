import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "../middleware.js";
import { getDb } from "../queries/connection.js";
import { settings } from "@db/schema";
import { eq } from "drizzle-orm";
import { verifyToken } from "../lib/auth.js";

export const settingsRouter = createRouter({
  get: publicQuery.query(() => {
    const db = getDb();
    const result = db.select().from(settings).get();
    return result ?? null;
  }),

  update: adminQuery
    .input(
      z.object({
        orgName: z.string().optional(),
        orgLogo: z.string().optional(),
        orgBanner: z.string().optional(),
        discordLink: z.string().optional(),
        whatsappLink: z.string().optional(),
        defaultRules: z.string().optional(),
        defaultTimesMx: z.string().optional(),
        defaultTimesBr: z.string().optional(),
        primaryColor: z.string().optional(),
        whatsappTemplate: z.string().optional(),
      })
    )
    .mutation(({ input, ctx }) => {
      // Verify admin token
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();
      const existing = db.select().from(settings).get();

      if (!existing) {
        db.insert(settings).values(input).run();
        return { success: true };
      }

      db
        .update(settings)
        .set(input)
        .where(eq(settings.id, existing.id))
        .run();

      return { success: true };
    }),
});