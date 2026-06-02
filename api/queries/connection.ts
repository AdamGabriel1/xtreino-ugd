import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "@db/schema";
import * as relations from "@db/relations";
import { mkdirSync } from "fs";
import { dirname } from "path";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>>;

export function getDb() {
  if (!instance) {
    const dbPath = process.env.DATABASE_URL || "sqlite.db";
    // Cria a pasta se não existir (importante para o Render Disk)
    mkdirSync(dirname(dbPath), { recursive: true });
    const sqlite = new Database(dbPath);
    instance = drizzle(sqlite, { schema: fullSchema });
  }
  return instance;
}