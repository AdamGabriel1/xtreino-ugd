import { z } from "zod";
import { createRouter, publicQuery } from "../../api/middleware.js";
import { getDb } from "../../api/queries/connection.js";
import { admins } from "@db/schema.js";
import { eq } from "drizzle-orm";
import { compareSync } from "bcryptjs";
import { signToken, verifyToken } from "../../api/lib/auth.js";

export const authRouter = createRouter({
  login: publicQuery
    .input(
      z.object({
        username: z.string().min(1),
        password: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(admins)
        .where(eq(admins.username, input.username))
        .limit(1);

      const admin = result[0];
      if (!admin) {
        throw new Error("Invalid credentials");
      }

      const valid = compareSync(input.password, admin.passwordHash);
      if (!valid) {
        throw new Error("Invalid credentials");
      }

      const token = signToken({
        id: admin.id,
        username: admin.username,
        role: admin.role,
      });

      return { token, admin: { id: admin.id, username: admin.username, role: admin.role } };
    }),

  me: publicQuery.query(async ({ ctx }) => {
    const authHeader = ctx.req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    if (!payload) return null;

    return { id: payload.id, username: payload.username, role: payload.role };
  }),
});
