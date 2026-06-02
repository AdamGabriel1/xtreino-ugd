import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router.js";
import { createContext } from "./context.js";
import { env } from "./lib/env.js";
import { getDb } from "./queries/connection.js";
import { admins } from "../db/schema.js";

console.log("[BOOT] Step 1: Imports loaded");

const app = new Hono();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));
app.get("/health", (c) => c.json({ status: "ok", time: Date.now() }));

app.all("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});

app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

console.log("[BOOT] Step 2: App created, isProduction:", env.isProduction);

if (env.isProduction) {
  console.log("[BOOT] Step 3: Production mode");
  console.log("[BOOT] Step 4: DATABASE_URL:", env.databaseUrl);

  // Check database
  console.log("[BOOT] Step 5: Checking database...");
  const db = getDb();
  const existingAdmin = db.select().from(admins).get();
  console.log("[BOOT] Step 6: existingAdmin:", existingAdmin);

  if (!existingAdmin) {
    console.log("[BOOT] Step 7: Database empty, seeding...");

    // Inline seed to avoid import issues
    const { hashSync } = await import("bcryptjs");

    db.insert(admins).values({
      username: "admin",
      passwordHash: hashSync("admin123", 10),
      role: "super",
    }).run();

    console.log("[BOOT] Step 8: Admin created");

    // Add default settings
    const { settings } = await import("../db/schema.js");
    db.insert(settings).values({
      orgName: "Devils Mobile League",
      primaryColor: "#ff3b3b",
    }).run();

    console.log("[BOOT] Step 9: Settings created, seed done");
  } else {
    console.log("[BOOT] Step 7: Database already has data");
  }

  console.log("[BOOT] Step 10: Starting server...");
  const { serve } = await import("@hono/node-server");
  const { serveStatic } = await import("@hono/node-server/serve-static");

  app.use("/*", serveStatic({ root: "./dist/public" }));

  const port = parseInt(process.env.PORT || "3000");
  console.log("[BOOT] Step 11: Port:", port);

  serve({ fetch: app.fetch, port }, () => {
    console.log(`[BOOT] Server running on port ${port}`);
  });
}

export default app;