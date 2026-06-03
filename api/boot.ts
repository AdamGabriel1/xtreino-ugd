import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router.js";
import { createContext } from "./context.js";
import { env } from "./lib/env.js";

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
    const { getDb } = await import("./queries/connection.js");
    const db = getDb();

    console.log("[BOOT] Setting up database...");

    // Create tables if they don't exist
    db.run(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'admin',
        created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        org_name TEXT NOT NULL DEFAULT 'Devils Mobile League',
        org_logo TEXT,
        org_banner TEXT,
        discord_link TEXT,
        whatsapp_link TEXT,
        default_rules TEXT,
        default_times_mx TEXT,
        default_times_br TEXT,
        primary_color TEXT NOT NULL DEFAULT '#ff3b3b',
        whatsapp_template TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS teams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        tag TEXT NOT NULL,
        logo TEXT,
        captain_name TEXT,
        captain_discord TEXT,
        whatsapp TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nickname TEXT NOT NULL,
        uid TEXT,
        discord TEXT,
        team_id INTEGER,
        kills INTEGER NOT NULL DEFAULT 0,
        deaths INTEGER NOT NULL DEFAULT 0,
        wins INTEGER NOT NULL DEFAULT 0,
        matches INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS championships (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        modality TEXT NOT NULL,
        format TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'em_breve',
        start_date TEXT,
        end_date TEXT,
        rules TEXT,
        prize_pool TEXT,
        max_teams INTEGER NOT NULL DEFAULT 16,
        registered_teams INTEGER NOT NULL DEFAULT 0,
        bracket_data TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS championship_teams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        championship_id INTEGER NOT NULL,
        team_id INTEGER NOT NULL,
        group_name TEXT,
        points INTEGER NOT NULL DEFAULT 0,
        kills INTEGER NOT NULL DEFAULT 0,
        wins INTEGER NOT NULL DEFAULT 0,
        matches_played INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS matches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        championship_id INTEGER NOT NULL,
        team1_id INTEGER,
        team2_id INTEGER,
        round INTEGER NOT NULL DEFAULT 1,
        bracket_type TEXT DEFAULT 'winners',
        team1_score INTEGER NOT NULL DEFAULT 0,
        team2_score INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'pendente',
        scheduled_date TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS xtreinos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        date TEXT NOT NULL,
        time_mx TEXT,
        time_br TEXT,
        modality TEXT NOT NULL,
        max_teams INTEGER NOT NULL DEFAULT 20,
        rules TEXT,
        discord_link TEXT,
        whatsapp_link TEXT,
        status TEXT NOT NULL DEFAULT 'aberto',
        created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS xtreino_teams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        xtreino_id INTEGER NOT NULL,
        team_id INTEGER NOT NULL,
        is_reserve INTEGER NOT NULL DEFAULT 0,
        slot_number INTEGER,
        created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS scrims (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        team1_id INTEGER,
        team2_id INTEGER,
        date TEXT,
        time TEXT,
        modality TEXT,
        status TEXT NOT NULL DEFAULT 'agendado',
        result TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS registrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        team_name TEXT NOT NULL,
        team_tag TEXT,
        captain_name TEXT,
        captain_discord TEXT,
        whatsapp TEXT,
        team_logo TEXT,
        event_type TEXT NOT NULL,
        event_id INTEGER NOT NULL,
        players_data TEXT,
        reserves_data TEXT,
        status TEXT NOT NULL DEFAULT 'pendente',
        created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS rankings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_type TEXT NOT NULL,
        entity_id INTEGER NOT NULL,
        entity_name TEXT NOT NULL,
        points INTEGER NOT NULL DEFAULT 0,
        kills INTEGER NOT NULL DEFAULT 0,
        wins INTEGER NOT NULL DEFAULT 0,
        participations INTEGER NOT NULL DEFAULT 0,
        kd_ratio REAL,
        created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
      )
    `);

    console.log("[BOOT] Database tables created/verified");

    // Check if admin exists
    const { admins, settings } = await import("../db/schema.js");
    const adminCheck = await db.query.admins.findFirst();

    if (!adminCheck) {
      console.log("[BOOT] Database empty, seeding...");
      const { hashSync } = await import("bcryptjs");

      await db.insert(admins).values({
        username: "admin",
        passwordHash: hashSync("admin123", 10),
        role: "super",
        createdAt: new Date(),
      });

      await db.insert(settings).values({
        orgName: "Devils Mobile League",
        primaryColor: "#ff3b3b",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log("[BOOT] Seed completed (admin: admin/admin123)");
    } else {
      console.log("[BOOT] Database already has data");
    }
  } catch (error) {
    console.error("[BOOT] Database error:", error);
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