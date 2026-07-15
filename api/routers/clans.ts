import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "../../api/middleware.js";
import { getDb } from "../../api/queries/connection.js";
import { clans, teams, players } from "../../db/schema.js";
import { eq, like, or, and, sql } from "drizzle-orm";
import { verifyToken } from "../../api/lib/auth.js";

export const clansRouter = createRouter({
  list: publicQuery
    .input(
      z.object({ search: z.string().optional() }).optional()
    )
    .query(({ input }) => {
      const db = getDb();

      let query = db.select().from(clans);

      if (input?.search) {
        const searchTerm = `%${input.search}%`;
        query = db.select().from(clans).where(
          or(
            like(clans.name, searchTerm),
            like(clans.tag, searchTerm),
            like(clans.description, searchTerm)
          )
        ) as typeof query;
      }

      const allClans = query.all();
      const allTeams = db.select().from(teams).all();
      const allPlayers = db.select().from(players).all();

      const teamsWithPlayers = allTeams.map((team: typeof teams.$inferSelect) => ({
        ...team,
        players: allPlayers.filter((p: typeof players.$inferSelect) => p.teamId === team.id),
      }));

      return allClans.map((clan: typeof clans.$inferSelect) => ({
        ...clan,
        teams: teamsWithPlayers.filter((t: typeof teamsWithPlayers[number]) => t.clanId === clan.id),
      }));
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(({ input }) => {
      const db = getDb();

      const clan = db.select().from(clans).where(eq(clans.id, input.id)).get();
      if (!clan) return null;

      const clanTeams = db.select().from(teams).where(eq(teams.clanId, input.id)).all();
      const teamIds = clanTeams.map((t: typeof teams.$inferSelect) => t.id);

      const allPlayers = teamIds.length > 0
        ? db.select().from(players).where(sql`${players.teamId} IN (${sql.join(teamIds, sql`, `)})`).all()
        : [];

      const teamsWithPlayers = clanTeams.map((team: typeof teams.$inferSelect) => ({
        ...team,
        players: allPlayers.filter((p: typeof players.$inferSelect) => p.teamId === team.id),
      }));

      return {
        ...clan,
        teams: teamsWithPlayers,
      };
    }),

  create: adminQuery
    .input(
      z.object({
        name: z.string().min(1),
        tag: z.string().min(1),
        description: z.string().optional(),
        logo: z.string().optional(),
        banner: z.string().optional(),
        discord: z.string().optional(),
        color: z.string().optional(),
        foundedAt: z.string().optional(),
        status: z.enum(["active", "inactive"]).default("active"),
      })
    )
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();
      const result = db.insert(clans).values(input).run();
      return { id: Number(result.lastInsertRowid), success: true };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        tag: z.string().optional(),
        description: z.string().optional(),
        logo: z.string().optional(),
        banner: z.string().optional(),
        discord: z.string().optional(),
        color: z.string().optional(),
        foundedAt: z.string().optional(),
        status: z.enum(["active", "inactive"]).optional(),
      })
    )
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const { id, ...data } = input;
      const db = getDb();
      db.update(clans).set(data).where(eq(clans.id, id)).run();
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();
      db.delete(clans).where(eq(clans.id, input.id)).run();
      return { success: true };
    }),
});

export const teamsRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        search: z.string().optional(),
        clanId: z.number().optional(),
      }).optional()
    )
    .query(({ input }) => {
      const db = getDb();

      let conditions = [];

      if (input?.search) {
        const searchTerm = `%${input.search}%`;
        conditions.push(or(like(teams.name, searchTerm), like(teams.tag, searchTerm)));
      }
      if (input?.clanId) {
        conditions.push(eq(teams.clanId, input.clanId));
      }

      if (conditions.length === 0) {
        return db.select().from(teams).all();
      }

      return db.select().from(teams).where(and(...conditions)).all();
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(({ input }) => {
      const db = getDb();

      const team = db.select().from(teams).where(eq(teams.id, input.id)).get();
      if (!team) return null;

      const teamPlayers = db.select().from(players).where(eq(players.teamId, input.id)).all();

      return {
        ...team,
        players: teamPlayers,
      };
    }),

  create: adminQuery
    .input(
      z.object({
        name: z.string().min(1),
        tag: z.string().min(1),
        clanId: z.number().optional(),
        logo: z.string().optional(),
        description: z.string().optional(),
        captainName: z.string().optional(),
        captainDiscord: z.string().optional(),
        whatsapp: z.string().optional(),
        status: z.enum(["active", "inactive", "disbanded"]).default("active"),
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
        clanId: z.number().optional(),
        logo: z.string().optional(),
        description: z.string().optional(),
        captainName: z.string().optional(),
        captainDiscord: z.string().optional(),
        whatsapp: z.string().optional(),
        status: z.enum(["active", "inactive", "disbanded"]).optional(),
      })
    )
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const { id, ...data } = input;
      const db = getDb();
      db.update(teams).set(data).where(eq(teams.id, id)).run();
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