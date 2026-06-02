import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context.js";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const createRouter = t.router;
export const publicQuery = t.procedure;

// Admin-only procedure - checks for admin auth token
export const adminQuery = t.procedure.use(async ({ ctx, next }) => {
  const authHeader = ctx.req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Unauthorized - Admin access required");
  }

  const token = authHeader.slice(7);
  if (!token) {
    throw new Error("Unauthorized - Invalid token");
  }

  // Verify token will be done in the router
  return next({
    ctx: {
      ...ctx,
      adminToken: token,
    },
  });
});
