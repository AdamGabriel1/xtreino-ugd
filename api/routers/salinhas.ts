import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "../../api/middleware.js";
import { getDb } from "../../api/queries/connection.js";
import { salinhas } from "../../db/schema.js";
import { eq, desc, and, sql } from "drizzle-orm";
import { verifyToken } from "../../api/lib/auth.js";

export const salinhasRouter = createRouter({
  // ============================================================
  // LISTAR SALINHAS
  // ============================================================
  list: publicQuery
    .input(
      z.object({
        status: z.string().optional(),
        hostName: z.string().optional(),
      }).optional()
    )
    .query(({ input }) => {
      const db = getDb();
      if (input?.status && input?.hostName) {
        return db
          .select()
          .from(salinhas)
          .where(
            and(
              eq(salinhas.status, input.status),
              eq(salinhas.hostName, input.hostName)
            )
          )
          .orderBy(desc(salinhas.date), desc(salinhas.createdAt))
          .all();
      }
      if (input?.status) {
        return db
          .select()
          .from(salinhas)
          .where(eq(salinhas.status, input.status))
          .orderBy(desc(salinhas.date))
          .all();
      }
      if (input?.hostName) {
        return db
          .select()
          .from(salinhas)
          .where(eq(salinhas.hostName, input.hostName))
          .orderBy(desc(salinhas.date))
          .all();
      }
      return db.select().from(salinhas).orderBy(desc(salinhas.date)).all();
    }),

  // ============================================================
  // OBTER SALINHA POR ID
  // ============================================================
  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(salinhas)
        .where(eq(salinhas.id, input.id))
        .get();
    }),

  // ============================================================
  // CRIAR SALINHA
  // ============================================================
  create: adminQuery
    .input(
      z.object({
        name: z.string().min(1),
        date: z.string().min(1),
        timeBr: z.string().optional().default("19:00"),
        modality: z.string().optional().default("solo"),
        maxParticipants: z.number().optional().default(50),
        prize1st: z.string().min(1),
        prize2nd: z.string().min(1),
        prize3rd: z.string().min(1),
        specialPrize: z.string().optional(),
        hostName: z.string().min(1),
        hostTiktok: z.string().optional(),
        hostInstagram: z.string().optional(),
        hostYoutube: z.string().optional(),
        roomId: z.string().optional(),
        roomPassword: z.string().optional(),
        bannerUrl: z.string().optional(),
        postUrl: z.string().optional(),
        status: z.string().optional().default("aberta"),
        rules: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();
      const result = db.insert(salinhas).values(input).run();
      return { id: Number(result.lastInsertRowid), success: true };
    }),

  // ============================================================
  // ATUALIZAR SALINHA
  // ============================================================
  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        date: z.string().optional(),
        timeBr: z.string().optional(),
        modality: z.string().optional(),
        maxParticipants: z.number().optional(),
        prize1st: z.string().optional(),
        prize2nd: z.string().optional(),
        prize3rd: z.string().optional(),
        specialPrize: z.string().optional(),
        hostName: z.string().optional(),
        hostTiktok: z.string().optional(),
        hostInstagram: z.string().optional(),
        hostYoutube: z.string().optional(),
        roomId: z.string().optional(),
        roomPassword: z.string().optional(),
        bannerUrl: z.string().optional(),
        postUrl: z.string().optional(),
        status: z.string().optional(),
        winner1st: z.string().optional(),
        winner2nd: z.string().optional(),
        winner3rd: z.string().optional(),
        specialWinner: z.string().optional(),
        rules: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const { id, ...data } = input;
      const db = getDb();
      db.update(salinhas).set(data).where(eq(salinhas.id, id)).run();
      return { success: true };
    }),

  // ============================================================
  // DELETAR SALINHA
  // ============================================================
  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const db = getDb();
      db.delete(salinhas).where(eq(salinhas.id, input.id)).run();
      return { success: true };
    }),

  // ============================================================
  // DEFINIR VENCEDORES
  // ============================================================
  setWinners: adminQuery
    .input(
      z.object({
        id: z.number(),
        winner1st: z.string(),
        winner2nd: z.string(),
        winner3rd: z.string(),
        specialWinner: z.string().optional(),
      })
    )
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const { id, ...winners } = input;
      const db = getDb();
      db
        .update(salinhas)
        .set({ ...winners, status: "encerrada" })
        .where(eq(salinhas.id, id))
        .run();
      return { success: true };
    }),

  // ============================================================
  // DEFINIR ID E SENHA DA SALA
  // ============================================================
  setRoomCredentials: adminQuery
    .input(
      z.object({
        id: z.number(),
        roomId: z.string(),
        roomPassword: z.string(),
      })
    )
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");

      const { id, ...creds } = input;
      const db = getDb();
      db
        .update(salinhas)
        .set(creds)
        .where(eq(salinhas.id, id))
        .run();
      return { success: true };
    }),
});