import { getDb } from "../api/queries/connection.js";
import { admins, settings } from "./schema.js";
import { eq } from "drizzle-orm";
import { hashSync } from "bcryptjs";

// ============================================================
// HELPERS IDEMPOTENTES
// ============================================================

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

// ============================================================
// SEED INICIAL (idempotente)
// ============================================================

export function seed() {
  const db = getDb();
  console.log("[SEED] Starting initial seed...");

  // --- Admin ---
  const adminCreated = upsertAdmin(db, {
    username: "admin",
    passwordHash: hashSync("admin123", 10),
    role: "super",
  });
  console.log(`[SEED] Admin ${adminCreated ? "created" : "already exists"} (admin/admin123)`);

  // --- Settings ---
  const settingsCreated = upsertSettings(db, {
    orgName: "Xtreino Underground",
    discordLink: "https://discord.gg/QpvaHxzPW",
    whatsappLink: "https://chat.whatsapp.com/Ks4fDFnA7eBHk9ULHuHyzm",
    defaultRules: "1. Respeitar todos os participantes\n2. Proibido uso de cheats/hacks\n3. Pontualidade obrigatoria\n4. Decisoes da staff sao finais",
    defaultTimesMx: "5:00 PM",
    defaultTimesBr: "8:00 PM",
    primaryColor: "#006400",
    whatsappTemplate: "{{ORG_NAME}} \n\nPLATAFORMA: MOBILE \n\nMODO: {{MODALITY}} \n\n{{DATE}}\n\nHORARIOS:\nMX {{TIME_MX}}\nBR {{TIME_BR}}\n\nSLOTS | EQUIPES:\n{{TEAMS_LIST}}\n\nRESERVAS:\n{{RESERVES_LIST}}\n\nDISCORD: {{DISCORD}}\nWHATSAPP: {{WHATSAPP}}\n\n@todos",
  });
  console.log(`[SEED] Settings ${settingsCreated ? "created" : "already exists"}`);

  console.log("[SEED] Initial seed completed successfully!");
}

// ============================================================
// SEED MINIMAL (idempotente)
// ============================================================

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