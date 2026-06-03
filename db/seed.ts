import { getDb } from "../api/queries/connection.js";
import { admins, settings, xtreinos, teams, players, seedRuns } from "./schema.js";
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

function upsertTeam(db: ReturnType<typeof getDb>, data: typeof teams.$inferInsert) {
  const existing = db.select().from(teams).where(eq(teams.name, data.name)).get();
  if (!existing) {
    db.insert(teams).values(data).run();
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

function upsertPlayer(db: ReturnType<typeof getDb>, data: typeof players.$inferInsert) {
  const existing = db.select().from(players).where(eq(players.nickname, data.nickname)).get();
  if (!existing) {
    db.insert(players).values(data).run();
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

  // --- Teams ---
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

  // --- Players (extraídos dos dados dos xtreinos históricos) ---
  // Mapeamento: teamName -> teamId (será resolvido após inserção dos times)
  const allTeams = db.select().from(teams).all();
  const teamIdMap = new Map(allTeams.map(t => [t.name, t.id]));

  const playersData = [
    // CMF
    { nickname: "CMF Leo", teamName: "CMF" },
    { nickname: "CMF Lyx7", teamName: "CMF" },
    { nickname: "CMF MOIZO", teamName: "CMF" },
    { nickname: "CMF Stygian", teamName: "CMF" },
    { nickname: "CMF Syx", teamName: "CMF" },
    // Eternity
    { nickname: "Black 永", teamName: "Eternity" },
    { nickname: "Damøn.TTK", teamName: "Eternity" },
    { nickname: "DamønTTK 永", teamName: "Eternity" },
    { nickname: "Givas'xX 永", teamName: "Eternity" },
    { nickname: "Kennedy", teamName: "Eternity" },
    { nickname: "Muggle", teamName: "Eternity" },
    { nickname: "Muggle 永", teamName: "Eternity" },
    { nickname: "Nofear", teamName: "Eternity" },
    { nickname: "RED REZE", teamName: "Eternity" },
    { nickname: "Shxrk", teamName: "Eternity" },
    // FURY
    { nickname: "Creedz FURY", teamName: "FURY" },
    { nickname: "Diana FURY", teamName: "FURY" },
    { nickname: "VN' FURY", teamName: "FURY" },
    { nickname: "perfection z", teamName: "FURY" },
    // INF
    { nickname: "INF BARONI", teamName: "INF" },
    { nickname: "INF GOAT", teamName: "INF" },
    { nickname: "INF Noxz7", teamName: "INF" },
    { nickname: "INF RINNEGA", teamName: "INF" },
    { nickname: "「INF」BLAZE", teamName: "INF" },
    { nickname: "「INF」GOAT", teamName: "INF" },
    { nickname: "「INF」Noxz7'", teamName: "INF" },
    { nickname: "「INF」RINNEGA", teamName: "INF" },
    // KOV
    { nickname: "AET Jentexz", teamName: "KOV" },
    { nickname: "KOV ADAN", teamName: "KOV" },
    { nickname: "KOV ALONE", teamName: "KOV" },
    { nickname: "KOV FushyX", teamName: "KOV" },
    { nickname: "TTKKAIKE", teamName: "KOV" },
    { nickname: "YoSurper", teamName: "KOV" },
    // LMF
    { nickname: "LMF CALOP12", teamName: "LMF" },
    { nickname: "LMF LACERDA", teamName: "LMF" },
    { nickname: "LMF XIT", teamName: "LMF" },
    { nickname: "LMF mtfacil", teamName: "LMF" },
    { nickname: "LMF_Boss", teamName: "LMF" },
    { nickname: "LMF_LACERDA", teamName: "LMF" },
    { nickname: "LMF_RICHIMO", teamName: "LMF" },
    { nickname: "LMF_XIT", teamName: "LMF" },
    { nickname: "LMF_mtfacil", teamName: "LMF" },
    // Misturado
    { nickname: "INF BADBOY", teamName: "Misturado" },
    { nickname: "INF RONY", teamName: "Misturado" },
    { nickname: "REVERSE_", teamName: "Misturado" },
    { nickname: "TOP FreeKill", teamName: "Misturado" },
    // ODS
    { nickname: "Az Aamon", teamName: "ODS" },
    { nickname: "[ODS] vantex", teamName: "ODS" },
    { nickname: "[ODS].STROG", teamName: "ODS" },
    // RED
    { nickname: "CF ALMEIDA", teamName: "RED" },
    { nickname: "LMF Boss", teamName: "RED" },
    { nickname: "RED APENAS", teamName: "RED" },
    { nickname: "RED snow777", teamName: "RED" },
    { nickname: "RED- REZE", teamName: "RED" },
    { nickname: "RED-Alemão", teamName: "RED" },
    { nickname: "RED-MOREIRA", teamName: "RED" },
    { nickname: "REÐ APENAS", teamName: "RED" },
    { nickname: "REÐ LANGØ", teamName: "RED" },
    { nickname: "REÐ M4RTINA", teamName: "RED" },
    { nickname: "REÐ Sunraku", teamName: "RED" },
    { nickname: "REÐ Zadock", teamName: "RED" },
    { nickname: "REÐ snow777", teamName: "RED" },
    // RED Magic BR
    { nickname: "LXELTINHO", teamName: "RED Magic BR" },
    { nickname: "MOL ADRIAN", teamName: "RED Magic BR" },
    { nickname: "RED KENNZY", teamName: "RED Magic BR" },
    { nickname: "RED LANGO", teamName: "RED Magic BR" },
    // Time E
    { nickname: "ONE-Javi", teamName: "Time E" },
    { nickname: "PAIN SWAN", teamName: "Time E" },
    { nickname: "Poindexter", teamName: "Time E" },
    { nickname: "morqesb", teamName: "Time E" },
    // Time I
    { nickname: "ASTRO", teamName: "Time I" },
    { nickname: "AimColor", teamName: "Time I" },
    { nickname: "GzmAkaza", teamName: "Time I" },
    { nickname: "Jtpe", teamName: "Time I" },
    { nickname: "hcky", teamName: "Time I" },
    { nickname: "iDiaasz", teamName: "Time I" },
    // UGD Light
    { nickname: "DEATH", teamName: "UGD Light" },
    { nickname: "I miss her", teamName: "UGD Light" },
    { nickname: "UGD Kyz", teamName: "UGD Light" },
    { nickname: "UGD Psycho", teamName: "UGD Light" },
    // UGD Royal
    { nickname: "Dexz", teamName: "UGD Royal" },
    { nickname: "MayaZ", teamName: "UGD Royal" },
    { nickname: "OFFz", teamName: "UGD Royal" },
    { nickname: "UGD Weenot", teamName: "UGD Royal" },
    { nickname: "UGD Z", teamName: "UGD Royal" },
    { nickname: "WenoTz", teamName: "UGD Royal" },
    // UGD Threat
    { nickname: "Rivers AR", teamName: "UGD Threat" },
    { nickname: "UGD ARISE", teamName: "UGD Threat" },
    { nickname: "UGD Ares", teamName: "UGD Threat" },
    { nickname: "UGD Kaze", teamName: "UGD Threat" },
    { nickname: "UGD Neo", teamName: "UGD Threat" },
    { nickname: "UGD Treon", teamName: "UGD Threat" },
    { nickname: "UGD cool7", teamName: "UGD Threat" },
    // Λつつ
    { nickname: "Striker71", teamName: "Λつつ" },
    { nickname: "Striker81", teamName: "Λつつ" },
    { nickname: "ØNE ???", teamName: "Λつつ" },
    { nickname: "ΛΞT Jentexz", teamName: "Λつつ" },
    { nickname: "Λつつ Aninha", teamName: "Λつつ" },
    { nickname: "Λつつ Unknown", teamName: "Λつつ" },
    { nickname: "Λつつ_$CAVEIRA", teamName: "Λつつ" },
    { nickname: "『PsS-KINN-ボ", teamName: "Λつつ" },
  ];

  let playersCount = 0;
  for (const playerData of playersData) {
    const teamId = teamIdMap.get(playerData.teamName);
    if (teamId) {
      if (upsertPlayer(db, {
        nickname: playerData.nickname,
        teamId: teamId,
      })) playersCount++;
    } else {
      console.warn(`[SEED] Team not found for player ${playerData.nickname}: ${playerData.teamName}`);
    }
  }
  console.log(`[SEED] ${playersCount} players created`);

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