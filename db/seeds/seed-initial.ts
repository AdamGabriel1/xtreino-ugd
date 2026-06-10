import { getDb } from "../../api/queries/connection.js";
import { admins, settings, xtreinos, teams, players, seedRuns } from "../schema.js";
import { eq } from "drizzle-orm";
import { hashSync } from "bcryptjs";
import { WHATSAPP_TEMPLATE } from "./whatsapp-template.js";

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

export const DEFAULT_FIXED_TEAMS = [
  "UGD Threat",
  "UGD Royal",
  "UGD LEGENDS",
  "UGD OLYMPIQUE",
];

export function seed() {
  const db = getDb();
  console.log("[SEED] Starting initial seed...");

  const adminCreated = upsertAdmin(db, {
    username: "admin",
    passwordHash: hashSync("admin123", 10),
    role: "super",
  });
  console.log(`[SEED] Admin ${adminCreated ? "created" : "already exists"} (admin/admin123)`);

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

  const teamsData = [
    { name: "UGD Threat", tag: "UGD" },
    { name: "UGD Royal", tag: "UGD" },
    { name: "UGD Light", tag: "UGD" },
    { name: "UGD LEGENDS", tag: "UGD" },
    { name: "UGD OLYMPIQUE", tag: "UGD" },
    { name: "RED", tag: "RED" },
    { name: "RED Magic BR", tag: "RED" },
    { name: "REÐ Outlaws", tag: "RED" },
    { name: "CMF", tag: "CMF" },
    { name: "CMF ATLANTIC", tag: "CMF" },
    { name: "CMF ASSALT", tag: "CMF" },
    { name: "KOV", tag: "KOV" },
    { name: "LMF", tag: "LMF" },
    { name: "INF", tag: "INF" },
    { name: "Eternity", tag: "ETE" },
    { name: "FURY", tag: "FURY" },
    { name: "FURY ELITE", tag: "FURY" },
    { name: "FURY ROYAL", tag: "FURY" },
    { name: "Λつつ", tag: "Λつつ" },
    { name: "ODS", tag: "ODS" },
    { name: "Misturado", tag: "MIX" },
    { name: "Time I", tag: "TI" },
    { name: "Time E", tag: "TE" },
    { name: "Dev", tag: "DEV" },
    { name: "EmE", tag: "EME" },
    { name: "♱VØID×STRIKE♱", tag: "VOID" },
    { name: "7KW_LHETAL", tag: "7KW" },
    { name: "K4F", tag: "K4F" },
  ];

  let teamsCount = 0;
  for (const teamData of teamsData) {
    if (upsertTeam(db, teamData)) teamsCount++;
  }
  console.log(`[SEED] ${teamsCount} teams created`);

  const xtreinosData = [
    { name: "XTreino Underground - 30/04", date: "2026-04-30", timeBr: "21:00", modality: "squad", maxTeams: 20, status: "finalizado" },
    { name: "XTreino Underground - 07/05", date: "2026-05-07", timeBr: "21:00", modality: "squad", maxTeams: 20, status: "finalizado" },
    { name: "XTreino Underground - 19/05", date: "2026-05-19", timeBr: "21:00", modality: "squad", maxTeams: 20, status: "finalizado" },
    { name: "XTreino Underground - 21/05", date: "2026-05-21", timeBr: "21:00", modality: "squad", maxTeams: 20, status: "finalizado" },
    { name: "XTreino Underground - 08/06", date: "2026-06-08", timeBr: "21:00", modality: "squad", maxTeams: 20, status: "finalizado" },
  ];

  let xtreinosCount = 0;
  for (const xtData of xtreinosData) {
    if (upsertXtreino(db, xtData)) xtreinosCount++;
  }
  console.log(`[SEED] ${xtreinosCount} xtreinos created`);

  const allTeams = db.select().from(teams).all();
  const teamIdMap = new Map(allTeams.map(t => [t.name, t.id]));

  const playersData = [
    { nickname: "CMF Leo", teamName: "CMF" },
    { nickname: "CMF Lyx7", teamName: "CMF" },
    { nickname: "CMF MOIZO", teamName: "CMF" },
    { nickname: "CMF Stygian", teamName: "CMF" },
    { nickname: "CMF Syx", teamName: "CMF" },
    { nickname: "CMF Léo", teamName: "CMF ATLANTIC" },
    { nickname: "CMF Kira", teamName: "CMF ATLANTIC" },
    { nickname: "CMF Moizo", teamName: "CMF ATLANTIC" },
    { nickname: "CMF Dnvy", teamName: "CMF ASSALT" },
    { nickname: "CMF Lynx7", teamName: "CMF ASSALT" },
    { nickname: "CMF Max", teamName: "CMF ASSALT" },
    { nickname: "CMF Thxxxz", teamName: "CMF ASSALT" },
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
    { nickname: "Creedz FURY", teamName: "FURY" },
    { nickname: "Diana FURY", teamName: "FURY" },
    { nickname: "VN' FURY", teamName: "FURY" },
    { nickname: "perfection z", teamName: "FURY" },
    { nickname: "DIANA", teamName: "FURY ELITE" },
    { nickname: "RAUAN", teamName: "FURY ELITE" },
    { nickname: "SUN", teamName: "FURY ELITE" },
    { nickname: "DEX", teamName: "FURY ELITE" },
    { nickname: "VN", teamName: "FURY ROYAL" },
    { nickname: "NG", teamName: "FURY ROYAL" },
    { nickname: "EGOIST", teamName: "FURY ROYAL" },
    { nickname: "MARTNA", teamName: "FURY ROYAL" },
    { nickname: "OFF", teamName: "FURY ROYAL"},
    { nickname: "INF Noxz7", teamName: "INF" },
    { nickname: "INF GOAT", teamName: "INF" },
    { nickname: "INF BARONI", teamName: "INF" },
    { nickname: "INF RINNEGA", teamName: "INF" },
    { nickname: "「INF」BLAZE", teamName: "INF" },
    { nickname: "「INF」GOAT", teamName: "INF" },
    { nickname: "「INF」Noxz7'", teamName: "INF" },
    { nickname: "「INF」RINNEGA", teamName: "INF" },
    { nickname: "AET Jentexz", teamName: "KOV" },
    { nickname: "KOV ADAN", teamName: "KOV" },
    { nickname: "KOV ALONE", teamName: "KOV" },
    { nickname: "KOV FushyX", teamName: "KOV" },
    { nickname: "TTKKAIKE", teamName: "KOV" },
    { nickname: "YoSurper", teamName: "KOV" },
    { nickname: "LMF CALOP12", teamName: "LMF" },
    { nickname: "LMF LACERDA", teamName: "LMF" },
    { nickname: "LMF XIT", teamName: "LMF" },
    { nickname: "LMF mtfacil", teamName: "LMF" },
    { nickname: "LMF_Boss", teamName: "LMF" },
    { nickname: "LMF_LACERDA", teamName: "LMF" },
    { nickname: "LMF_RICHIMO", teamName: "LMF" },
    { nickname: "LMF_XIT", teamName: "LMF" },
    { nickname: "LMF_mtfacil", teamName: "LMF" },
    { nickname: "INF BADBOY", teamName: "Misturado" },
    { nickname: "INF RONY", teamName: "Misturado" },
    { nickname: "REVERSE_", teamName: "Misturado" },
    { nickname: "TOP FreeKill", teamName: "Misturado" },
    { nickname: "Az Aamon", teamName: "ODS" },
    { nickname: "[ODS] vantex", teamName: "ODS" },
    { nickname: "[ODS].STROG", teamName: "ODS" },
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
    { nickname: "REÐ MoraesBC", teamName: "REÐ Outlaws" },
    { nickname: "REÐ Felpz", teamName: "REÐ Outlaws" },
    { nickname: "REÐ Skibidi", teamName: "REÐ Outlaws" },
    { nickname: "REÐ Apenas", teamName: "REÐ Outlaws" },
    { nickname: "LXELTINHO", teamName: "RED Magic BR" },
    { nickname: "MOL ADRIAN", teamName: "RED Magic BR" },
    { nickname: "RED KENNZY", teamName: "RED Magic BR" },
    { nickname: "RED LANGO", teamName: "RED Magic BR" },
    { nickname: "ONE-Javi", teamName: "Time E" },
    { nickname: "PAIN SWAN", teamName: "Time E" },
    { nickname: "Poindexter", teamName: "Time E" },
    { nickname: "morqesb", teamName: "Time E" },
    { nickname: "ASTRO", teamName: "Time I" },
    { nickname: "AimColor", teamName: "Time I" },
    { nickname: "GzmAkaza", teamName: "Time I" },
    { nickname: "Jtpe", teamName: "Time I" },
    { nickname: "hcky", teamName: "Time I" },
    { nickname: "iDiaasz", teamName: "Time I" },
    { nickname: "DEATH", teamName: "UGD Light" },
    { nickname: "I miss her", teamName: "UGD Light" },
    { nickname: "UGD Kyz", teamName: "UGD Light" },
    { nickname: "UGD Psycho", teamName: "UGD Light" },
    { nickname: "Kyz", teamName: "UGD LIGHT" },
    { nickname: "Zann", teamName: "UGD LIGHT" },
    { nickname: "Psycho", teamName: "UGD LIGHT" },
    { nickname: "Chino", teamName: "UGD LIGHT" },
    { nickname: "Dexz", teamName: "UGD Royal" },
    { nickname: "MayaZ", teamName: "UGD Royal" },
    { nickname: "OFFz", teamName: "UGD Royal" },
    { nickname: "UGD Weenot", teamName: "UGD Royal" },
    { nickname: "UGD Z", teamName: "UGD Royal" },
    { nickname: "WenoTz", teamName: "UGD Royal" },
    { nickname: "Ohara", teamName: "UGD LEGENDS" },
    { nickname: "Rafa", teamName: "UGD LEGENDS" },
    { nickname: "Xoxoto", teamName: "UGD LEGENDS" },
    { nickname: "Buzeira", teamName: "UGD LEGENDS" },
    { nickname: "Weenot", teamName: "UGD OLYMPIQUE" },
    { nickname: "Duardin", teamName: "UGD OLYMPIQUE" },
    { nickname: "Striker", teamName: "UGD OLYMPIQUE" },
    { nickname: "Lorex", teamName: "UGD OLYMPIQUE" },
    { nickname: "Rivers AR", teamName: "UGD Threat" },
    { nickname: "UGD ARISE", teamName: "UGD Threat" },
    { nickname: "UGD Ares", teamName: "UGD Threat" },
    { nickname: "UGD Kaze", teamName: "UGD Threat" },
    { nickname: "UGD Neo", teamName: "UGD Threat" },
    { nickname: "UGD Treon", teamName: "UGD Threat" },
    { nickname: "UGD cool7", teamName: "UGD Threat" },
    { nickname: "Cool", teamName: "UGD Threat" },
    { nickname: "Treon", teamName: "UGD Threat" },
    { nickname: "Kaze", teamName: "UGD Threat" },
    { nickname: "Arise", teamName: "UGD Threat" },
    { nickname: "Striker71", teamName: "Λつつ" },
    { nickname: "Striker81", teamName: "Λつつ" },
    { nickname: "ØNE ???", teamName: "Λつつ" },
    { nickname: "ΛΞT Jentexz", teamName: "Λつつ" },
    { nickname: "Λつつ Aninha", teamName: "Λつつ" },
    { nickname: "Λつつ Unknown", teamName: "Λつつ" },
    { nickname: "Λつつ_$CAVEIRA", teamName: "Λつつ" },
    { nickname: "『PsS-KINN-ボ", teamName: "Λつつ" },
    { nickname: "DevNexT★", teamName: "Dev" },
    { nickname: "DevBatata", teamName: "Dev" },
    { nickname: "DevPisca", teamName: "Dev" },
    { nickname: "DevThorfinn", teamName: "Dev" },
    { nickname: "Dev_Guizin", teamName: "Dev" },
    { nickname: "Dev_LTz", teamName: "Dev" },
    { nickname: "Dev Ana", teamName: "Dev" },
    { nickname: "Yeezy", teamName: "EmE" },
    { nickname: "geldeysito", teamName: "EmE" },
    { nickname: "EME々Akaza", teamName: "EmE" },
    { nickname: "EME々Lulu", teamName: "EmE" },
    { nickname: "♱Vøid♱.D_R", teamName: "♱VØID×STRIKE♱" },
    { nickname: "♱Vøid♱+gute", teamName: "♱VØID×STRIKE♱" },
    { nickname: "♱Vøid♱.nino", teamName: "♱VØID×STRIKE♱" },
    { nickname: "™VØID°⁷⁷⁷", teamName: "♱VØID×STRIKE♱" },
    { nickname: "(NTC)patrikm", teamName: "7KW_LHETAL" },
    { nickname: "_061_kakashi", teamName: "7KW_LHETAL" },
    { nickname: "RL.MATADOR☠️", teamName: "7KW_LHETAL" },
    { nickname: "Fefe_🎭🇧🇷", teamName: "7KW_LHETAL" },
    { nickname: "k4F urso", teamName: "K4F" },
    { nickname: "K4F nine", teamName: "K4F" },
    { nickname: "K4F gui", teamName: "K4F" },
    { nickname: "Alek", teamName: "K4F" },
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

  const seedName = "initial-v1";
  const existingSeed = db.select().from(seedRuns).where(eq(seedRuns.seedName, seedName)).get();
  if (!existingSeed) {
    db.insert(seedRuns).values({ seedName }).run();
    console.log(`[SEED] Seed run '${seedName}' recorded`);
  }

  console.log("[SEED] Initial seed completed successfully!");
}