import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "../middleware.js";
import { getDb } from "../queries/connection.js";
import { scrims, teams } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import { verifyToken } from "../lib/auth.js";

export const scrimsRouter = createRouter({
  list: publicQuery.query(() => {
    const db = getDb();
    const allScrims = db.select().from(scrims).orderBy(desc(scrims.createdAt)).all();

    const scrimsWithTeams = allScrims.map((s) => {
      const t1 = s.team1Id ? db.select().from(teams).where(eq(teams.id, s.team1Id)).get() : null;
      const t2 = s.team2Id ? db.select().from(teams).where(eq(teams.id, s.team2Id)).get() : null;
      return {
        ...s,
        team1Name: t1?.name ?? null,
        team2Name: t2?.name ?? null,
        team1Tag: t1?.tag ?? null,
        team2Tag: t2?.tag ?? null,
      };
    });

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
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();
      const result = db.insert(scrims).values(input).run();
      return { id: Number(result.lastInsertRowid), success: true };
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
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const { id, ...data } = input;
      const db = getDb();
      db.update(scrims).set(data).where(eq(scrims.id, id)).run();
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();
      db.delete(scrims).where(eq(scrims.id, input.id)).run();
      return { success: true };
    }),
});