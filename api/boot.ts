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
  seedAllXtreinos,
  seedAllScrims,
  seedAliases, // 🆕 Cria jogadores canônicos e mapeia variações de nick
  seedUnify,   // 🆕 Calcula estatísticas unificadas cruzando os dados
} from "../db/seed.js";

console.log("[BOOT] Starting server...");

const app = new Hono();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));
app.get("/health", (c) => c.json({ status: "ok", time: Date.now() }));

  // ============================================================
  // WEBHOOK DO GOOGLE FORMS (Rota limpa, sem passar pelo tRPC)
  // ============================================================
  app.post("/api/webhook/google-forms", async (c) => {
    try {
      // Pega o body de forma bruta
      const rawBody = await c.req.text();

      let data: any;

      // 1. Tenta fazer parse de JSON puro (se o proxy do Railway não bagunçar)
      try {
        data = JSON.parse(rawBody);
      } catch {
        // 2. Se falhar, o proxy transformou em Form Data (input={"json":...})
        // Fazemos o decode reverso
        const urlParams = new URLSearchParams(rawBody);
        const inputStr = urlParams.get("input");
        if (inputStr) {
          data = JSON.parse(inputStr);
        } else {
          return c.json({ error: "Formato inválido" }, 400);
        }
      }

      // Extrai os dados (funciona nos dois cenários)
      const payload = data?.input?.json || data?.["0"]?.json || data;

      const { secret, teamName, players, coach } = payload;

      // Valida a chave secreta
      if (secret !== process.env.GOOGLE_FORMS_SECRET) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      // Valida os dados
      if (!teamName || !players || players.length === 0) {
        return c.json({ error: "Dados inválidos" }, 400);
      }

      // Importa as funções do banco
      const { inscreverEquipe } = await import("../db/inscricoes.js");
      const { xtreinos } = await import("../db/schema.js");
      const { eq, sql } = await import("drizzle-orm");

      const db = getDb();

      // Busca o xtreino aberto mais recente
      const activeXtreino = db
        .select()
        .from(xtreinos)
        .where(eq(xtreinos.status, "aberto"))
        .orderBy(sql`date DESC`)
        .limit(1)
        .get();

      if (!activeXtreino) {
        return c.json({ error: "Nenhum xtreino aberto no momento" }, 400);
      }

      // Registra a equipe
      const id = inscreverEquipe(activeXtreino.id, teamName, players);
      
      if (!id) {
        return c.json({ error: "Falha ao inscrever (duplicata ou lotado?)" }, 400);
      }

      if (coach) {
        console.log(`[WEBHOOK] Coach da equipe "${teamName}": ${coach}`);
      }

      console.log(`[WEBHOOK] Equipe "${teamName}" registrada via Google Forms no xtreino #${activeXtreino.id}`);

      return c.json({ success: true, id, xtreinoId: activeXtreino.id });

    } catch (error: any) {
      console.error("[WEBHOOK] Erro:", error);
      return c.json({ error: error.message || "Erro interno" }, 500);
    }
  });

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

    resetAllSeedRuns(); // 🚨 CUIDADO: Limpa TUDO, força re-execução de todos os seeds abaixo

    // 1. Mapeamento de jogadores e times (precisa rodar antes do unify)
    runSeedIfNeeded("aliases-xtreinos-v1", seedAliases);

    // 2. Dados detalhados por evento (XTreinos e Scrims)
    runSeedIfNeeded("xtreinos_all", seedAllXtreinos);
    runSeedIfNeeded("scrims_all", seedAllScrims);

    // 3. Cálculo das estatísticas unificadas (precisa rodar DEPOIS do aliases)
    runSeedIfNeeded("unify-v1", seedUnify);

    // 4. Estéticos (Logos)
    runSeedIfNeeded("logos", seedLogos);
    // runSeedIfNeeded("logos_auto", () => seedLogosAuto("public")); // descomente se quiser auto

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