import { getDb } from "../api/queries/connection.js";
import { admins, settings, teams, players, championships, xtreinos, rankings } from "./schema.js";
import { seedRuns } from "./schema.js";
import { eq, and } from "drizzle-orm";
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
    return db.insert(teams).values(data).returning().get();
  }
  return existing;
}

function upsertPlayer(db: ReturnType<typeof getDb>, data: typeof players.$inferInsert) {
  const existing = db.select().from(players).where(eq(players.nickname, data.nickname)).get();
  if (!existing) {
    return db.insert(players).values(data).returning().get();
  }
  return existing;
}

function upsertChampionship(db: ReturnType<typeof getDb>, data: typeof championships.$inferInsert) {
  const existing = db.select().from(championships).where(eq(championships.name, data.name)).get();
  if (!existing) {
    return db.insert(championships).values(data).returning().get();
  }
  return existing;
}

function upsertXtreino(db: ReturnType<typeof getDb>, data: typeof xtreinos.$inferInsert) {
  const existing = db.select().from(xtreinos).where(eq(xtreinos.name, data.name)).get();
  if (!existing) {
    return db.insert(xtreinos).values(data).returning().get();
  }
  return existing;
}

function upsertRanking(db: ReturnType<typeof getDb>, data: typeof rankings.$inferInsert) {
  const existing = db
    .select()
    .from(rankings)
    .where(
      and(
        eq(rankings.entityName, data.entityName),
        eq(rankings.entityType, data.entityType)
      )
    )
    .get();
  if (!existing) {
    return db.insert(rankings).values(data).returning().get();
  }
  return existing;
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
    discordLink: "https://discord.gg/devils",
    whatsappLink: "https://wa.me/5511999999999",
    defaultRules: "1. Respeitar todos os participantes\n2. Proibido uso de cheats/hacks\n3. Pontualidade obrigatoria\n4. Decisoes da staff sao finais",
    defaultTimesMx: "5:00 PM",
    defaultTimesBr: "8:00 PM",
    primaryColor: "#ff3b3b",
    whatsappTemplate: "{{ORG_NAME}} \n\nPLATAFORMA: MOBILE \n\nMODO: {{MODALITY}} \n\n{{DATE}}\n\nHORARIOS:\nMX {{TIME_MX}}\nBR {{TIME_BR}}\n\nSLOTS | EQUIPES:\n{{TEAMS_LIST}}\n\nRESERVAS:\n{{RESERVES_LIST}}\n\nDISCORD: {{DISCORD}}\nWHATSAPP: {{WHATSAPP}}\n\n@todos",
  });
  console.log(`[SEED] Settings ${settingsCreated ? "created" : "already exists"}`);

  // --- Teams ---
  const teamsData = [
    { name: "Red Devils", tag: "RD", captainName: "DevilKing", captainDiscord: "devilking#1234", whatsapp: "5511988881111" },
    { name: "Underground", tag: "UG", captainName: "Shadow", captainDiscord: "shadow#5678", whatsapp: "5511977772222" },
    { name: "Black Dragons", tag: "BD", captainName: "DragonX", captainDiscord: "dragonx#9012", whatsapp: "5511966663333" },
    { name: "Toxic Squad", tag: "TX", captainName: "ToxicKing", captainDiscord: "toxicking#3456", whatsapp: "5511955554444" },
    { name: "Elite Mobile", tag: "EM", captainName: "ElitePro", captainDiscord: "elitepro#7890", whatsapp: "5511944445555" },
    { name: "Night Wolves", tag: "NW", captainName: "WolfLeader", captainDiscord: "wolf#1357", whatsapp: "5511933336666" },
    { name: "Fire Squad", tag: "FS", captainName: "FireLord", captainDiscord: "firelord#2468", whatsapp: "5511922227777" },
    { name: "Ghost Team", tag: "GT", captainName: "GhostRider", captainDiscord: "ghost#9753", whatsapp: "5511911118888" },
  ];
  let teamsCount = 0;
  for (const team of teamsData) {
    const created = upsertTeam(db, team);
    if (created.id === teamsCount + 1 || created.id) teamsCount++;
  }
  console.log(`[SEED] ${teamsCount} teams ensured`);

  // --- Players ---
  const playersData = [
    { nickname: "DevilKing", uid: "123456789", discord: "devilking#1234", teamId: 1, kills: 450, deaths: 320, wins: 28, matches: 45 },
    { nickname: "DevilPro", uid: "123456790", discord: "devilpro#1234", teamId: 1, kills: 380, deaths: 290, wins: 25, matches: 42 },
    { nickname: "DevilSnipe", uid: "123456791", discord: "devilsnipe#1234", teamId: 1, kills: 520, deaths: 310, wins: 28, matches: 45 },
    { nickname: "Shadow", uid: "123456792", discord: "shadow#5678", teamId: 2, kills: 410, deaths: 280, wins: 30, matches: 48 },
    { nickname: "ShadowX", uid: "123456793", discord: "shadowx#5678", teamId: 2, kills: 360, deaths: 300, wins: 27, matches: 44 },
    { nickname: "ShadowKill", uid: "123456794", discord: "shadowkill#5678", teamId: 2, kills: 440, deaths: 270, wins: 30, matches: 48 },
    { nickname: "DragonX", uid: "123456795", discord: "dragonx#9012", teamId: 3, kills: 480, deaths: 260, wins: 32, matches: 50 },
    { nickname: "DragonFire", uid: "123456796", discord: "dragonfire#9012", teamId: 3, kills: 390, deaths: 310, wins: 26, matches: 43 },
    { nickname: "ToxicKing", uid: "123456797", discord: "toxicking#3456", teamId: 4, kills: 350, deaths: 340, wins: 22, matches: 40 },
    { nickname: "ToxicPro", uid: "123456798", discord: "toxicpro#3456", teamId: 4, kills: 420, deaths: 290, wins: 29, matches: 46 },
    { nickname: "ElitePro", uid: "123456799", discord: "elitepro#7890", teamId: 5, kills: 460, deaths: 250, wins: 33, matches: 51 },
    { nickname: "EliteKill", uid: "123456800", discord: "elitekill#7890", teamId: 5, kills: 340, deaths: 320, wins: 24, matches: 41 },
    { nickname: "WolfLeader", uid: "123456801", discord: "wolf#1357", teamId: 6, kills: 400, deaths: 300, wins: 26, matches: 44 },
    { nickname: "WolfHunter", uid: "123456802", discord: "wolfhunter#1357", teamId: 6, kills: 370, deaths: 280, wins: 28, matches: 45 },
    { nickname: "FireLord", uid: "123456803", discord: "firelord#2468", teamId: 7, kills: 430, deaths: 270, wins: 31, matches: 47 },
    { nickname: "FireStorm", uid: "123456804", discord: "firestorm#2468", teamId: 7, kills: 310, deaths: 350, wins: 20, matches: 38 },
    { nickname: "GhostRider", uid: "123456805", discord: "ghost#9753", teamId: 8, kills: 390, deaths: 290, wins: 27, matches: 43 },
    { nickname: "GhostSniper", uid: "123456806", discord: "ghostsniper#9753", teamId: 8, kills: 450, deaths: 240, wins: 34, matches: 49 },
  ];
  let playersCount = 0;
  for (const player of playersData) {
    const created = upsertPlayer(db, player);
    if (created) playersCount++;
  }
  console.log(`[SEED] ${playersCount} players ensured`);

  // --- Championships ---
  const championshipsData = [
    {
      name: "Devils Mobile Cup #1",
      modality: "squad",
      format: "mata_mata",
      status: "ativo",
      startDate: "2026-06-01",
      endDate: "2026-06-30",
      rules: "Formato Squad\nPontuacao: 1 kill = 1 ponto\nBooyah = 12 pontos\nTop 2 = 9 pontos\nTop 3 = 7 pontos",
      prizePool: "R$ 1.000,00",
      maxTeams: 16,
      registeredTeams: 8,
    },
    {
      name: "Underground League",
      modality: "duo",
      format: "grupos",
      status: "em_breve",
      startDate: "2026-07-01",
      endDate: "2026-07-15",
      rules: "Formato Duo\nFase de grupos + Mata-mata\nPontuacao padrao",
      prizePool: "R$ 500,00",
      maxTeams: 20,
      registeredTeams: 5,
    },
    {
      name: "Free Fire Pro Series",
      modality: "squad",
      format: "eliminacao_dupla",
      status: "encerrado",
      startDate: "2026-05-01",
      endDate: "2026-05-20",
      rules: "Eliminacao dupla\nTodos contra todos",
      prizePool: "R$ 2.000,00",
      maxTeams: 32,
      registeredTeams: 32,
    },
  ];
  let champsCount = 0;
  for (const champ of championshipsData) {
    const created = upsertChampionship(db, champ);
    if (created) champsCount++;
  }
  console.log(`[SEED] ${champsCount} championships ensured`);

  // --- XTreinos ---
  const xtreinosData = [
    {
      name: "XTreino Devils - Semana 1",
      date: "2026-06-05",
      timeMx: "5:00 PM",
      timeBr: "8:00 PM",
      modality: "squad",
      maxTeams: 12,
      rules: "Sala privada\nPontuacao competitiva\nStream obrigatoria",
      discordLink: "https://discord.gg/devils",
      whatsappLink: "https://wa.me/5511999999999",
      status: "aberto",
    },
    {
      name: "XTreino Devils - Semana 2",
      date: "2026-06-12",
      timeMx: "5:00 PM",
      timeBr: "8:00 PM",
      modality: "squad",
      maxTeams: 12,
      rules: "Sala privada\nPontuacao competitiva",
      discordLink: "https://discord.gg/devils",
      whatsappLink: "https://wa.me/5511999999999",
      status: "aberto",
    },
    {
      name: "XTreino Duo - Especial",
      date: "2026-06-08",
      timeMx: "6:00 PM",
      timeBr: "9:00 PM",
      modality: "duo",
      maxTeams: 16,
      rules: "Formato duo\nMapa Bermuda",
      discordLink: "https://discord.gg/devils",
      whatsappLink: "https://wa.me/5511999999999",
      status: "aberto",
    },
  ];
  let xtCount = 0;
  for (const xt of xtreinosData) {
    const created = upsertXtreino(db, xt);
    if (created) xtCount++;
  }
  console.log(`[SEED] ${xtCount} xtreinos ensured`);

  // --- Rankings ---
  const rankingsData = [
    { entityType: "team", entityId: 3, entityName: "Black Dragons", points: 2850, kills: 420, wins: 32, participations: 15, kdRatio: 1.85 },
    { entityType: "team", entityId: 5, entityName: "Elite Mobile", points: 2720, kills: 400, wins: 33, participations: 14, kdRatio: 1.84 },
    { entityType: "team", entityId: 2, entityName: "Underground", points: 2680, kills: 410, wins: 30, participations: 16, kdRatio: 1.46 },
    { entityType: "team", entityId: 1, entityName: "Red Devils", points: 2540, kills: 390, wins: 28, participations: 13, kdRatio: 1.41 },
    { entityType: "team", entityId: 7, entityName: "Fire Squad", points: 2410, kills: 370, wins: 31, participations: 14, kdRatio: 1.59 },
    { entityType: "team", entityId: 6, entityName: "Night Wolves", points: 2380, kills: 385, wins: 26, participations: 15, kdRatio: 1.33 },
    { entityType: "team", entityId: 8, entityName: "Ghost Team", points: 2290, kills: 420, wins: 34, participations: 16, kdRatio: 1.63 },
    { entityType: "team", entityId: 4, entityName: "Toxic Squad", points: 2150, kills: 385, wins: 22, participations: 12, kdRatio: 1.03 },
    { entityType: "player", entityId: 7, entityName: "DragonX", points: 1480, kills: 480, wins: 32, participations: 15, kdRatio: 1.85 },
    { entityType: "player", entityId: 11, entityName: "ElitePro", points: 1420, kills: 460, wins: 33, participations: 14, kdRatio: 1.84 },
    { entityType: "player", entityId: 18, entityName: "GhostSniper", points: 1390, kills: 450, wins: 34, participations: 16, kdRatio: 1.88 },
    { entityType: "player", entityId: 3, entityName: "DevilSnipe", points: 1350, kills: 520, wins: 28, participations: 13, kdRatio: 1.68 },
    { entityType: "player", entityId: 15, entityName: "FireLord", points: 1320, kills: 430, wins: 31, participations: 14, kdRatio: 1.59 },
    { entityType: "player", entityId: 6, entityName: "ShadowKill", points: 1280, kills: 440, wins: 30, participations: 16, kdRatio: 1.63 },
    { entityType: "player", entityId: 4, entityName: "Shadow", points: 1250, kills: 410, wins: 30, participations: 15, kdRatio: 1.46 },
    { entityType: "player", entityId: 1, entityName: "DevilKing", points: 1220, kills: 450, wins: 28, participations: 13, kdRatio: 1.41 },
  ];
  let ranksCount = 0;
  for (const rank of rankingsData) {
    const created = upsertRanking(db, rank);
    if (created) ranksCount++;
  }
  console.log(`[SEED] ${ranksCount} rankings ensured`);

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
    orgName: "Devils Mobile League",
    primaryColor: "#ff3b3b",
  });
  console.log(`[SEED-MINIMAL] Settings ${settingsCreated ? "created" : "already exists"}`);

  console.log("[SEED-MINIMAL] Done!");
}