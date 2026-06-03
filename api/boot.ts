import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router.js";
import { createContext } from "./context.js";
import { env } from "./lib/env.js";
import { getDb } from "./queries/connection.js";
import { seed, seedMinimal } from "../db/seed.js";
import { runSeedIfNeeded } from "../db/seed-runner.js";

// ============================================================
// IMPORTS DOS SEEDS DIARIOS
// Adicione novos imports aqui conforme for criando seeds
// ============================================================
import { seed as seedScrimHistorico } from "../db/seeds/scrim-historico.js";

console.log("[BOOT] Starting server...");

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

if (env.isProduction) {
  console.log("[BOOT] Production mode detected");
  console.log("[BOOT] DATABASE_URL:", env.databaseUrl);

  try {
    const db = getDb();
    console.log("[BOOT] Database connected");

    // Access raw better-sqlite3 driver
    // @ts-ignore - $client is internal property
    const sqlite = db.$client;

    // Check if table exists by querying sqlite_master
    let tableExists = false;
    try {
      // @ts-ignore
      const result = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='admins'").get();
      tableExists = !!result;
    } catch {
      tableExists = false;
    }

    console.log("[BOOT] Table 'admins' exists:", tableExists);

    if (!tableExists) {
      // ========================================================
      // PRIMEIRA VEZ: tabelas nao existem
      // Roda seed inicial (idempotente) + registra no seed_runs
      // ========================================================
      console.log("[BOOT] Tables not found, running initial seed...");
      seed();
      console.log("[BOOT] Initial seed completed successfully!");
    } else {
      // ========================================================
      // TABELAS JA EXISTEM: verifica se precisa de seed inicial
      // ========================================================
      // @ts-ignore
      const adminCheck = sqlite.prepare("SELECT * FROM admins LIMIT 1").get();
      if (!adminCheck) {
        console.log("[BOOT] Tables exist but empty, running initial seed...");
        seed();
        console.log("[BOOT] Initial seed completed successfully!");
      } else {
        console.log("[BOOT] Database already has initial data, skipping initial seed");
      }
    }

    // ============================================================
    // SEEDS DIARIOS
    // Sempre executa (com controle via seed_runs)
    // Adicione novos seeds aqui na ordem cronologica
    // ============================================================
    console.log("[BOOT] Checking daily seeds...");
    runSeedIfNeeded("scrim_historico", seedScrimHistorico);
    // Exemplo futuro:
    // import { seed as seed20260604 } from "../db/seeds/2026-06-04.js";
    // runSeedIfNeeded("daily_2026_06_04", seed20260604);

    console.log("[BOOT] All seeds processed");

  } catch (error) {
    console.error("[BOOT] Database/Seed error:", error);
    // Fallback: tenta minimal seed
    try {
      console.log("[BOOT] Trying minimal seed as fallback...");
      seedMinimal();
      console.log("[BOOT] Minimal seed completed");
    } catch (err) {
      console.error("[BOOT] Minimal seed also failed:", err);
    }
  }

  const { serve } = await import("@hono/node-server");
  const { serveStatic } = await import("@hono/node-server/serve-static");

  app.use("/*", serveStatic({ root: "./dist/public" }));

  const port = parseInt(process.env.PORT || "3000");
  console.log("[BOOT] Starting server on port:", port);

  serve({ fetch: app.fetch, port }, () => {
    console.log(`[BOOT] Server running on port ${port}`);
  });
}

export default app;