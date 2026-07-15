// db/seeds/seed-initial.ts
// Seed inicial: admins, settings, clans, teams
// ⚠️ JOGADORES NÃO SÃO MAIS CRIADOS AQUI!
// O sistema de unificação (seed-aliases.ts) cuida disso agora.

import { getDb } from "../../api/queries/connection.js";
import { admins, settings, clans, teams, seedRuns, xtreinos } from "../schema.js";
import { eq } from "drizzle-orm";
import { hashSync } from "bcryptjs";
import { WHATSAPP_TEMPLATE } from "../seeds-backup/whatsapp-template.js";

// ============================================================
// HELPERS
// ============================================================

function upsertAdmin(db: ReturnType<typeof getDb>, data: typeof admins.$inferInsert) {
  const existing = db.select().from(admins).where(eq(admins.username, data.username)).get();
  if (!existing) { db.insert(admins).values(data).run(); return true; }
  return false;
}

function upsertSettings(db: ReturnType<typeof getDb>, data: typeof settings.$inferInsert) {
  const existing = db.select().from(settings).limit(1).get();
  if (!existing) { db.insert(settings).values(data).run(); return true; }
  return false;
}

function upsertClan(db: ReturnType<typeof getDb>, data: typeof clans.$inferInsert) {
  const existing = db.select().from(clans).where(eq(clans.name, data.name)).get();
  if (!existing) { db.insert(clans).values(data).run(); return true; }
  return false;
}

function upsertTeam(db: ReturnType<typeof getDb>, data: typeof teams.$inferInsert) {
  const existing = db.select().from(teams).where(eq(teams.name, data.name)).get();
  if (!existing) { db.insert(teams).values(data).run(); return true; }
  return false;
}

function upsertXtreino(db: ReturnType<typeof getDb>, data: typeof xtreinos.$inferInsert) {
  const existing = db.select().from(xtreinos).where(eq(xtreinos.name, data.name)).get();
  if (!existing) { db.insert(xtreinos).values(data).run(); return true; }
  return false;
}

// ============================================================
// DADOS — SÓ EDITE AQUI! 📝
// ============================================================

// --- CLANS ---
const CLANS_DATA: [string, string, string, string][] = [
  ["Underground", "UGD", "#006400", "Clã Underground."],
  ["FURY", "FURY", "#ff4444", "Clã FURY Rising"],
  ["CMF", "CMF", "#4444ff", "Clã Comando Anfibios."],
  ["RED", "RED", "#ff0000", "Clã Red Devils"],
  ["Eternity", "ETE", "#ffd700", "Clã Eternity."],
  ["KOV", "KOV", "#800080", "Clã KOV."],
  ["LMF", "LMF", "#ff8c00", "Clã Lá Mafia."],
  ["INF", "INF", "#00ced1", "Clã Infinit Esports."],
  ["Lambda", "Λつつ", "#ffffff", "Clã (Λつつ)."],
  ["ODS", "ODS", "#228b22", "Clã ODS."],
  ["7KW", "7KW", "#ffff00", "Clã 7KW."],
  ["K4F", "K4F", "#ff69b4", "Clã Kill 4 Fun."],
  ["Dev", "DEV", "#808080", "Clã Dev."],
  ["EmE", "EME", "#008080", "Clã EmE."],
  ["VOID STRIKE", "VOID", "#000000", "Clã VOID STRIKE."],
  ["CPF", "CPF", "#a52a2a", "Clã CPF."],
];

// --- TEAMS (Lines) ---
const TEAMS_DATA: [string, string, string | null, "active" | "disbanded", string][] = [
  // Underground
  ["UGD Threat", "UGD", "Underground", "active", "Line Threat da Underground."],
  ["UGD Royal", "UGD", "Underground", "disbanded", "Line antiga da Underground. Desativada em 2026."],
  ["UGD Light", "UGD", "Underground", "active", "Line dos Manitos da Underground."],
  ["UGD LEGENDS", "UGD", "Underground", "active", "Line Legends da Underground."],
  ["UGD OLYMPIQUE", "UGD", "Underground", "active", "Line Olympique da Underground."],
  ["UGD OLYMPIQUE / LEGENDS", "UGD", "Underground", "active", "Line mista Olympique/Legends da Underground."],
  ["UGD Threat + Olympique", "UGD", "Underground", "active", "Line mista Threat/Olympique da Underground."],
  ["UGD CASUAL", "UGD", "Underground", "active", "Line casual da Underground."],

  // FURY
  ["FURY", "FURY", "FURY", "active", "Line principal da FURY."],
  ["FURY ELITE", "FURY", "FURY", "active", "Line elite da FURY."],
  ["FURY ROYAL", "FURY", "FURY", "active", "Line royal da FURY."],
  ["FURY CASUAL", "FURY", "FURY", "active", "Line casual da FURY."],
  ["FURY MIX (ELITE / ROYAL)", "FURY", "FURY", "active", "Line mista Elite/Royal da FURY."],
  ["FURY ELITE / MIX (Line H)", "FURY", "FURY", "active", "Line Elite/MIX H da FURY."],
  ["FURY ROYAL / MIX (Line I)", "FURY", "FURY", "active", "Line Royal/MIX I da FURY."],

  // CMF
  ["CMF", "CMF", "CMF", "active", "Line principal da CMF."],
  ["CMF ATLANTIC", "CMF", "CMF", "active", "Line Atlantic da CMF."],
  ["CMF ASSALT", "CMF", "CMF", "active", "Line Assalt da CMF."],

  // RED
  ["RED", "RED", "RED", "active", "Line principal da RED."],
  ["RED Magic BR", "RED", "RED", "active", "Line Magic BR da RED."],
  ["REÐ Outlaws", "RED", "RED", "active", "Line Outlaws da RED."],
  ["RED INSS", "RED", "RED", "active", "Line INSS da RED."],

  // Outros clãs (1 line cada)
  ["Eternity", "ETE", "Eternity", "active", "Line principal da Eternity."],
  ["KOV", "KOV", "KOV", "active", "Line principal da KOV."],
  ["LMF", "LMF", "LMF", "active", "Line principal da LMF."],
  ["INF", "INF", "INF", "active", "Line principal da INF."],
  ["Λつつ", "Λつつ", "Lambda", "active", "Line principal da Lambda."],
  ["ODS", "ODS", "ODS", "active", "Line principal da ODS."],
  ["7KW_LHETAL", "7KW", "7KW", "active", "Line principal da 7KW."],
  ["K4F", "K4F", "K4F", "active", "Line principal da K4F."],
  ["Dev", "DEV", "Dev", "active", "Line da Dev Esports."],
  ["EmE", "EME", "EmE", "active", "Line principal da EmE."],
  ["VØID×STRIKE", "VOID", "VOID STRIKE", "active", "Line principal da VOID STRIKE."],
  ["CPF CANCELADO", "CPF", "CPF", "active", "Line principal da CPF."],
  ["CPF VILTRUMITE", "CPF", "CPF", "active", "Line Viltrumite da CPF."],
  ["Λ Ξ T H E R   F P S", "AET", null, "active", "Time avulso Aether FPS."],
  ["EXE", "EXE", null, "active", "Time avulso EXE."],
  ["RIVERS", "RIV", null, "active", "Time avulso RIVERS."],

  // Times avulsos (sem clã)
  ["Misturado", "MIX", null, "active", "Time misto de jogadores de diferentes clãs."],
  ["Time I", "TI", null, "active", "Time independente I."],
  ["Time E", "TE", null, "active", "Time independente E."],
  ["Randolinhas", "RND", null, "active", "Time avulso Randolinhas."],
  ["vengeance", "VNG", null, "active", "Time vengeance."],
  ["Equipe H", "TH", null, "active", "Time independente H."],
  ["Equipe K", "TK", null, "active", "Time independente K."],
  ["Equipe D", "TD", null, "active", "Time independente D."],
  ["Squad D", "SD", null, "active", "Time independente D (Squad)."],
  ["ODR", "ODR", null, "active", "Time avulso ODR."],
  ["KF", "KF", null, "active", "Time avulso KF."],
  ["FURY / EME", "F/E", null, "active", "Time misto FURY e EME."],
  ["HAVK'z", "HAV", null, "active", "Time avulso HAVK'z."],
];

// --- XTREINOS (lista base) ---
const XTREINOS_DATA: [string, string, "finalizado" | "aberto"][] = [
  ["XTreino Underground - 30/04", "2026-04-30", "finalizado"],
  ["XTreino Underground - 07/05", "2026-05-07", "finalizado"],
  ["XTreino Underground - 19/05", "2026-05-19", "finalizado"],
  ["XTreino Underground - 21/05", "2026-05-21", "finalizado"],
  ["XTreino Underground - 08/06", "2026-06-08", "finalizado"],
  ["XTreino Underground - 09/06", "2026-06-09", "finalizado"],
  ["XTreino Underground - 10/06", "2026-06-10", "finalizado"],
  ["XTreino Underground - 11/06", "2026-06-11", "finalizado"],
  ["XTreino Underground - 15/06", "2026-06-15", "finalizado"],
  ["XTreino Underground - 16/06", "2026-06-16", "finalizado"],
  ["XTreino Underground - 17/06", "2026-06-17", "finalizado"],
  ["XTreino Underground - 18/06", "2026-06-18", "finalizado"],
  ["XTreino Underground - 19/06", "2026-06-19", "finalizado"],
  ["XTreino Underground - 22/06", "2026-06-22", "finalizado"],
  ["XTreino Underground - 23/06", "2026-06-23", "finalizado"],
  ["XTreino Underground - 25/06", "2026-06-25", "finalizado"],
  ["XTreino Underground - 26/06", "2026-06-26", "finalizado"],
  ["XTreino Underground - 29/06", "2026-06-29", "finalizado"],
  ["XTreino Underground - 01/07", "2026-07-01", "finalizado"],
  ["XTreino Underground - 03/07", "2026-07-03", "finalizado"],
  ["XTreino Underground - 07/07", "2026-07-07", "finalizado"],
  ["XTreino Underground - 09/07", "2026-07-09", "finalizado"],
  ["XTreino Underground - 13/07", "2026-07-14", "finalizado"],
];

// ============================================================
// LÓGICA DO SEED
// ============================================================

export const DEFAULT_FIXED_TEAMS = [
  "UGD Threat",
  "UGD Light",
  "FURY ROYAL",
  "FURY ELITE",
  "CMF ATLANTIC",
];

export function seed() {
  const db = getDb();
  console.log("[SEED] Starting initial seed...");

  // 1. Admin
  const adminCreated = upsertAdmin(db, {
    username: "admin",
    passwordHash: hashSync("admin123", 10),
    role: "super",
  });
  console.log(`[SEED] Admin ${adminCreated ? "created" : "already exists"} (admin/admin123)`);

  // 2. Settings
  const settingsCreated = upsertSettings(db, {
    orgName: "𝙐𝙉𝘿𝙀𝙍𝙂𝙍𝙊𝙐𝙉𝘿",
    discordLink: "https://discord.gg/QpvaHxzPW",
    whatsappLink: "https://chat.whatsapp.com/Ks4fDFnA7eBHk9ULHuHyzm",
    defaultRules: "1. Respeitar todos os participantes\n2. Proibido uso de cheats/hacks\n3. Pontualidade obrigatoria\n4. Decisoes da staff sao finais\n5. SEM AUXILIO DE MIRA\n6. PROIBIDO LANCA GRANADA E LANCA CHAMAS",
    defaultTimesMx: "6:00",
    defaultTimesBr: "9:00",
    primaryColor: "#006400",
    whatsappTemplate: WHATSAPP_TEMPLATE,
    fixedTeamsList: JSON.stringify(DEFAULT_FIXED_TEAMS),
  });
  console.log(`[SEED] Settings ${settingsCreated ? "created" : "already exists"}`);

  // 3. Clans
  let clansCount = 0;
  for (const [name, tag, color, description] of CLANS_DATA) {
    if (upsertClan(db, { name, tag, description, color })) clansCount++;
  }
  console.log(`[SEED] ${clansCount} clans created`);

  // 4. Teams (precisa dos clans já inseridos)
  const allClans = db.select().from(clans).all();
  const clanIdMap = new Map(allClans.map(c => [c.name, c.id]));

  let teamsCount = 0;
  for (const [name, tag, clanName, status, description] of TEAMS_DATA) {
    const clanId = clanName ? clanIdMap.get(clanName) : null;
    if (clanName && !clanId) {
      console.warn(`[SEED] Clan not found for team ${name}: ${clanName}`);
      continue;
    }
    if (upsertTeam(db, { name, tag, clanId, status, description })) teamsCount++;
  }
  console.log(`[SEED] ${teamsCount} teams created`);

  // 5. Xtreinos (lista base)
  let xtreinosCount = 0;
  for (const [name, date, status] of XTREINOS_DATA) {
    if (upsertXtreino(db, { name, date, timeBr: "21:00", modality: "squad", maxTeams: 20, status })) xtreinosCount++;
  }
  console.log(`[SEED] ${xtreinosCount} xtreinos created`);

  // ⚠️ JOGADORES REMOVIDOS DAQUI!
  // Eles agora são gerenciados pelo seed-aliases.ts para permitir
  // a unificação correta de nicknames (ex: "K4F nine" e "Nine" viram a mesma pessoa).

  // Registra seed run
  const seedName = "initial-v2";
  const existingSeed = db.select().from(seedRuns).where(eq(seedRuns.seedName, seedName)).get();
  if (!existingSeed) {
    db.insert(seedRuns).values({ seedName }).run();
    console.log(`[SEED] Seed run '${seedName}' recorded`);
  }

  console.log("[SEED] Initial seed completed successfully!");
}