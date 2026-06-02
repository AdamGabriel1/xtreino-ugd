console.log("[BOOT] Step 0: File loaded");

// Apenas imports que não falham
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

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

// Tudo dinâmico a partir daqui
if (process.env.NODE_ENV === "production") {
  console.log("[BOOT] Production mode");
  
  try {
    console.log("[BOOT] Importing router...");
    const { appRouter } = await import("./router.js");
    
    console.log("[BOOT] Importing context...");
    const { createContext } = await import("./context.js");
    
    console.log("[BOOT] Importing env...");
    const { env } = await import("./lib/env.js");
    
    console.log("[BOOT] Importing connection...");
    const { getDb } = await import("./queries/connection.js");
    
    console.log("[BOOT] Importing schema...");
    const { admins, settings } = await import("../db/schema.js");
    
    console.log("[BOOT] All imports OK");
    
    // ... resto do código
  } catch (error) {
    console.error("[BOOT] IMPORT ERROR:", error);
    process.exit(1);
  }
}

export default app;