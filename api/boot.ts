import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router.js";
import { createContext } from "./context.js";
import { env } from "./lib/env.js";
import { getDb } from "./queries/connection.js";
import { runSeedIfNeeded, clearSeedRuns, resetAllSeedRuns } from "../db/seed-runner.js";
import { readFileSync } from "fs";
import { join } from "path";

// ============================================================
// IMPORTS DOS SEEDS (único ponto de entrada)
// ============================================================
import {
  seed,
  seedMinimal,
  seedLogos,
  seedLogosAuto,
  seedAllXtreinos,  // 🆕 seed genérico de xtreinos
  seedPlayerUnified,
  seedScrimPlayers,
  seedScrim4v4
} from "../db/seed.js";

console.log("[BOOT] Starting server...");

const app = new Hono();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));
app.get("/health", (c) => c.json({ status: "ok", time: Date.now() }));

// ============================================================
// API ROUTES (sempre antes do catch-all)
// ============================================================
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

    // @ts-ignore - $client is internal property
    const sqlite = db.$client;

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
      console.log("[BOOT] Tables not found, running initial seed...");
      seed();
      console.log("[BOOT] Initial seed completed successfully!");
    } else {
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
    // SEEDS ESPECÍFICOS (com controle via seed_runs)
    // ============================================================
    console.log("[BOOT] Checking specific seeds...");

    resetAllSeedRuns(); // 🆕 Limpa TUDO, força re-execução

    // 🆕 Seed genérico de todos os xtreinos
    runSeedIfNeeded("xtreinos_all", seedAllXtreinos);

    // Na seção de seeds:
    runSeedIfNeeded("player_unified", seedPlayerUnified);

    // Seed de logos (manual ou auto)
    runSeedIfNeeded("logos", seedLogos);
    // runSeedIfNeeded("logos_auto", () => seedLogosAuto("public")); // descomente se quiser auto

    runSeedIfNeeded("scrim_players", seedScrimPlayers);
    runSeedIfNeeded("scrim_4v4", seedScrim4v4);

    console.log("[BOOT] All seeds processed");

  } catch (error) {
    console.error("[BOOT] Database/Seed error:", error);
    try {
      console.log("[BOOT] Trying minimal seed as fallback...");
      seedMinimal();
      console.log("[BOOT] Minimal seed completed");
    } catch (err) {
      console.error("[BOOT] Minimal seed also failed:", err);
    }
  }

  // ============================================================
  // SERVIR ARQUIVOS ESTÁTICOS + SPA FALLBACK
  // ============================================================
  const { serve } = await import("@hono/node-server");
  const { serveStatic } = await import("@hono/node-server/serve-static");

  // Servir arquivos estáticos (CSS, JS, imagens, etc.)
  app.use("/*", serveStatic({ root: "./dist/public" }));

  // SPA FALLBACK: serve index.html para rotas do React Router
  app.notFound((c) => {
    if (c.req.path.startsWith("/api/")) {
      return c.json({ error: "Not Found" }, 404);
    }

    try {
      const indexPath = join(process.cwd(), "dist/public/index.html");
      console.log(`[BOOT] SPA fallback for: ${c.req.path} → serving ${indexPath}`);
      const html = readFileSync(indexPath, "utf-8");
      return c.html(html);
    } catch (err) {
      console.error("[BOOT] Failed to serve index.html:", err);
      return c.json({ error: "index.html not found. Did you run 'npm run build'?" }, 500);
    }
  });

  const port = parseInt(process.env.PORT || "3000");
  console.log("[BOOT] Starting server on port:", port);

  serve({ fetch: app.fetch, port }, () => {
    console.log(`[BOOT] Server running on port ${port}`);
  });
}

export default app;