import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "../middleware.js";
import { getDb } from "../queries/connection.js";
import { settings } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { verifyToken } from "../lib/auth.js";

export const settingsRouter = createRouter({
  // ============================================================
  // OBTER CONFIGURAÇÕES
  // ============================================================
  get: publicQuery
    .query(() => {
      const db = getDb();
      const result = db.select().from(settings).get();
      return result ?? null;
    }),

  // ============================================================
  // ATUALIZAR CONFIGURAÇÕES
  // ============================================================
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
        // 🆕 NOVO: Lista de times fixos (JSON string)
        fixedTeamsList: z.string().optional(),
      })
    )
    .mutation(({ input, ctx }) => {
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

  // ============================================================
  // 🆕 OBTER TIMES FIXOS (parseado do JSON)
  // ============================================================
  getFixedTeams: publicQuery
    .query(() => {
      const db = getDb();
      const config = db.select().from(settings).get();

      if (!config?.fixedTeamsList) return { fixedTeams: [] };

      try {
        const parsed = JSON.parse(config.fixedTeamsList);
        return { fixedTeams: Array.isArray(parsed) ? parsed : [] };
      } catch {
        return { fixedTeams: [] };
      }
    }),

  // ============================================================
  // 🆕 ATUALIZAR LISTA COMPLETA DE TIMES FIXOS
  // ============================================================
  updateFixedTeams: adminQuery
    .input(
      z.object({
        teams: z.array(z.string()),
      })
    )
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();
      const existing = db.select().from(settings).get();

      const fixedTeamsList = JSON.stringify(input.teams);

      if (!existing) {
        db.insert(settings).values({ fixedTeamsList }).run();
      } else {
        db
          .update(settings)
          .set({ fixedTeamsList })
          .where(eq(settings.id, existing.id))
          .run();
      }

      return { success: true, fixedTeams: input.teams };
    }),

  // ============================================================
  // 🆕 TOGGLE TIME FIXO (adicionar/remover individual)
  // ============================================================
  toggleFixedTeam: adminQuery
    .input(
      z.object({
        teamName: z.string().min(1),
        isFixed: z.boolean(),
      })
    )
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();
      const existing = db.select().from(settings).get();

      const currentList = existing?.fixedTeamsList
        ? JSON.parse(existing.fixedTeamsList)
        : [];

      const updated = input.isFixed
        ? [...new Set([...currentList, input.teamName])]
        : currentList.filter((t: string) => t !== input.teamName);

      const fixedTeamsList = JSON.stringify(updated);

      if (!existing) {
        db.insert(settings).values({ fixedTeamsList }).run();
      } else {
        db
          .update(settings)
          .set({ fixedTeamsList })
          .where(eq(settings.id, existing.id))
          .run();
      }

      return { success: true, fixedTeams: updated };
    }),
});