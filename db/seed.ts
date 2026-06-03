import { getDb } from "../api/queries/connection.js";
import { admins, settings, xtreinos, xtreinoTeams, teams, seedRuns } from "./schema.js";
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

function upsertXtreino(db: ReturnType<typeof getDb>, data: typeof xtreinos.$inferInsert) {
  const existing = db.select().from(xtreinos).where(eq(xtreinos.name, data.name)).get();
  if (!existing) {
    db.insert(xtreinos).values(data).run();
    return true;
  }
  return false;
}

function upsertTeam(db: ReturnType<typeof getDb>, data: typeof teams.$inferInsert) {
  const existing = db.select().from(teams).where(eq(teams.name, data.name)).get();
  if (!existing) {
    db.insert(teams).values(data).run();
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

  // --- Teams (equipes que participam dos xtreinos) ---
  const teamsData = [
    { name: "UGD Threat", tag: "UGD" },
    { name: "UGD Royal", tag: "UGD" },
    { name: "UGD Light", tag: "UGD" },
    { name: "RED", tag: "RED" },
    { name: "RED Magic BR", tag: "RED" },
    { name: "CMF", tag: "CMF" },
    { name: "KOV", tag: "KOV" },
    { name: "LMF", tag: "LMF" },
    { name: "INF", tag: "INF" },
    { name: "Eternity", tag: "ETE" },
    { name: "FURY", tag: "FURY" },
    { name: "Λつつ", tag: "Λつつ" },
    { name: "ODS", tag: "ODS" },
    { name: "Misturado", tag: "MIX" },
    { name: "Time I", tag: "TI" },
    { name: "Time E", tag: "TE" },
  ];

  let teamsCount = 0;
  for (const teamData of teamsData) {
    if (upsertTeam(db, teamData)) teamsCount++;
  }
  console.log(`[SEED] ${teamsCount} teams created`);

  // --- XTreinos Históricos da Underground ---
  const xtreinosData = [
    {
      name: "XTreino Underground - 30/04",
      date: "2026-04-30",
      timeBr: "21:00",
      modality: "squad",
      maxTeams: 20,
      status: "finalizado",
    },
    {
      name: "XTreino Underground - 07/05",
      date: "2026-05-07",
      timeBr: "21:00",
      modality: "squad",
      maxTeams: 20,
      status: "finalizado",
    },
    {
      name: "XTreino Underground - 19/05",
      date: "2026-05-19",
      timeBr: "21:00",
      modality: "squad",
      maxTeams: 20,
      status: "finalizado",
    },
    {
      name: "XTreino Underground - 21/05",
      date: "2026-05-21",
      timeBr: "21:00",
      modality: "squad",
      maxTeams: 20,
      status: "finalizado",
    },
  ];

  let xtreinosCount = 0;
  for (const xtData of xtreinosData) {
    if (upsertXtreino(db, xtData)) xtreinosCount++;
  }
  console.log(`[SEED] ${xtreinosCount} xtreinos created`);

  // --- Seed run tracking ---
  const seedName = "initial-v1";
  const existingSeed = db.select().from(seedRuns).where(eq(seedRuns.seedName, seedName)).get();
  if (!existingSeed) {
    db.insert(seedRuns).values({ seedName }).run();
    console.log(`[SEED] Seed run '${seedName}' recorded`);
  }

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