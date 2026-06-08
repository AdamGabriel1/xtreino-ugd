import { getDb } from "../../api/queries/connection.js";
import { admins, settings } from "../schema.js";
import { eq } from "drizzle-orm";
import { hashSync } from "bcryptjs";

function upsertAdmin(db: ReturnType<typeof getDb>, data: typeof admins.$inferInsert) {
  const existing = db.select().from(admins).where(eq(admins.username, data.username)).get();
  if (!existing) {
    db.insert(admins).values(data).run();
    return true;
  }
  return false;
}

function upsertSettings(db: ReturnType<typeof getDb>, data: typeof settings.$inferInsert) {
  const existing = db.select().from(settings).limit(1).get();
  if (!existing) {
    db.insert(settings).values(data).run();
    return true;
  }
  return false;
}

export function seedMinimal() {
  const db = getDb();
  console.log("[SEED-MINIMAL] Ensuring admin and settings...");

  const adminCreated = upsertAdmin(db, {
    username: "admin",
    passwordHash: hashSync("admin123", 10),
    role: "super",
  });
  console.log(`[SEED-MINIMAL] Admin ${adminCreated ? "created" : "already exists"}`);

  const settingsCreated = upsertSettings(db, {
    orgName: "Xtreino Underground",
    primaryColor: "#006400",
  });
  console.log(`[SEED-MINIMAL] Settings ${settingsCreated ? "created" : "already exists"}`);

  console.log("[SEED-MINIMAL] Done!");
}