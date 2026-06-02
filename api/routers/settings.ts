import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { settings } from "@db/schema";
import { eq } from "drizzle-orm";
import { verifyToken } from "../lib/auth";

export const settingsRouter = createRouter({
  get: publicQuery.query(async () => {
    const db = getDb();
    const result = await db.select().from(settings).limit(1);
    return result[0] ?? null;
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
    .mutation(async ({ input, ctx }) => {
      // Verify admin token
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();
      const existing = await db.select().from(settings).limit(1);

      if (existing.length === 0) {
        await db.insert(settings).values({
          ...input,
          updatedAt: new Date(),
        });
        return { success: true };
      }

      await db
        .update(settings)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(eq(settings.id, existing[0].id));

      return { success: true };
    }),
});
