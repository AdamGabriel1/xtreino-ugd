import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router.js";
import { createContext } from "./context.js";
import { env } from "./lib/env.js";

// @ts-ignore - Hono types
const app = new Hono();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

// Health check endpoint
app.get("/health", (c) => c.json({ status: "ok", time: Date.now() }));

// tRPC API handler
app.all("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});

// API 404 fallback
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

// Serve static files in production (React app built by Vite)
if (env.isProduction) {
  // @ts-ignore - dynamic import
  const { serve } = await import("@hono/node-server");
  // @ts-ignore - dynamic import
  const { serveStatic } = await import("@hono/node-server/serve-static");

  // Serve built frontend files from dist/public
  app.use("/*", serveStatic({ root: "./dist/public" }));

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;