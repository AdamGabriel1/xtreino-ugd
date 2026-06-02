import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { scrims, teams } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import { verifyToken } from "../lib/auth";

export const scrimsRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    const allScrims = await db.select().from(scrims).orderBy(desc(scrims.createdAt));

    const scrimsWithTeams = await Promise.all(
      allScrims.map(async (s) => {
        const t1 = s.team1Id ? await db.select().from(teams).where(eq(teams.id, s.team1Id)).limit(1) : [];
        const t2 = s.team2Id ? await db.select().from(teams).where(eq(teams.id, s.team2Id)).limit(1) : [];
        return {
          ...s,
          team1Name: t1[0]?.name ?? null,
          team2Name: t2[0]?.name ?? null,
          team1Tag: t1[0]?.tag ?? null,
          team2Tag: t2[0]?.tag ?? null,
        };
      })
    );

    return scrimsWithTeams;
  }),

  create: adminQuery
    .input(
      z.object({
        name: z.string().min(1),
        team1Id: z.number().optional(),
        team2Id: z.number().optional(),
        date: z.string().optional(),
        time: z.string().optional(),
        modality: z.string().optional(),
        status: z.string().optional(),
        result: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();
      const result = await db.insert(scrims).values({
        ...input,
        createdAt: new Date(),
      });
      return { id: Number(result[0].insertId), success: true };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        team1Id: z.number().optional(),
        team2Id: z.number().optional(),
        date: z.string().optional(),
        time: z.string().optional(),
        modality: z.string().optional(),
        status: z.string().optional(),
        result: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const { id, ...data } = input;
      const db = getDb();
      await db.update(scrims).set(data).where(eq(scrims.id, id));
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();
      await db.delete(scrims).where(eq(scrims.id, input.id));
      return { success: true };
    }),
});
