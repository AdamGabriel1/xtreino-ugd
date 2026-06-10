import { getDb } from "../../api/queries/connection.js";
import { admins, settings, xtreinos, clans, teams, players, seedRuns } from "../schema.js";
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

function upsertClan(db: ReturnType<typeof getDb>, data: typeof clans.$inferInsert) {
  const existing = db.select().from(clans).where(eq(clans.name, data.name)).get();
  if (!existing) {
    db.insert(clans).values(data).run();
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

  // ============================================================
  // CLANS
  // ============================================================
  const clansData = [
    { name: "Underground", tag: "UGD", description: "Clã brasileiro de Free Fire fundado em 2020. Uma das maiores organizações do cenário underground com múltiplas lines competitivas.", color: "#006400" },
    { name: "FURY", tag: "FURY", description: "Clã competitivo com foco em torneios e xtreinos. Conhecido pela agressividade e determinação.", color: "#ff4444" },
    { name: "CMF", tag: "CMF", description: "Clã CMF com múltiplas lines competitivas no cenário brasileiro.", color: "#4444ff" },
    { name: "RED", tag: "RED", description: "Clã RED com forte presença nos xtreinos e campeonatos.", color: "#ff0000" },
    { name: "Eternity", tag: "ETE", description: "Clã Eternity, sempre presente nas competições.", color: "#ffd700" },
    { name: "KOV", tag: "KOV", description: "Clã KOV, time competitivo de Free Fire.", color: "#800080" },
    { name: "LMF", tag: "LMF", description: "Clã LMF com história no cenário competitivo.", color: "#ff8c00" },
    { name: "INF", tag: "INF", description: "Clã INF, organização competitiva de Free Fire.", color: "#00ced1" },
    { name: "Lambda", tag: "Λつつ", description: "Clã Lambda (Λつつ), time japonês-brasileiro de Free Fire.", color: "#ffffff" },
    { name: "ODS", tag: "ODS", description: "Clã ODS, organização de Free Fire.", color: "#228b22" },
    { name: "7KW", tag: "7KW", description: "Clã 7KW, time competitivo.", color: "#ffff00" },
    { name: "K4F", tag: "K4F", description: "Clã K4F, organização de Free Fire.", color: "#ff69b4" },
    { name: "Dev", tag: "DEV", description: "Line de desenvolvedores e amigos.", color: "#808080" },
    { name: "EmE", tag: "EME", description: "Clã EmE, time competitivo.", color: "#008080" },
    { name: "VOID STRIKE", tag: "VOID", description: "Clã VOID STRIKE, organização de Free Fire.", color: "#000000" },
  ];

  let clansCount = 0;
  for (const clanData of clansData) {
    if (upsertClan(db, clanData)) clansCount++;
  }
  console.log(`[SEED] ${clansCount} clans created`);

  // ============================================================
  // TEAMS (Lines)
  // ============================================================
  const allClans = db.select().from(clans).all();
  const clanIdMap = new Map(allClans.map(c => [c.name, c.id]));

  const teamsData = [
    // Underground lines (clanId: 1)
    { name: "UGD Threat", tag: "UGD", clanId: clanIdMap.get("Underground"), status: "active", description: "Line principal da Underground. A mais antiga e competitiva." },
    { name: "UGD Royal", tag: "UGD", clanId: clanIdMap.get("Underground"), status: "disbanded", description: "Line antiga da Underground. Desativada em 2025." },
    { name: "UGD Light", tag: "UGD", clanId: clanIdMap.get("Underground"), status: "active", description: "Line secundária da Underground. Foco em desenvolvimento de novos talentos." },
    { name: "UGD LEGENDS", tag: "UGD", clanId: clanIdMap.get("Underground"), status: "active", description: "Line de lendas da Underground. Jogadores experientes e consagrados." },
    { name: "UGD OLYMPIQUE", tag: "UGD", clanId: clanIdMap.get("Underground"), status: "active", description: "Line olímpica da Underground. Competições de alto nível." },

    // FURY lines (clanId: 2)
    { name: "FURY", tag: "FURY", clanId: clanIdMap.get("FURY"), status: "active", description: "Line principal da FURY." },
    { name: "FURY ELITE", tag: "FURY", clanId: clanIdMap.get("FURY"), status: "active", description: "Line elite da FURY. Jogadores de destaque." },
    { name: "FURY ROYAL", tag: "FURY", clanId: clanIdMap.get("FURY"), status: "active", description: "Line royal da FURY." },

    // CMF lines (clanId: 3)
    { name: "CMF", tag: "CMF", clanId: clanIdMap.get("CMF"), status: "active", description: "Line principal da CMF." },
    { name: "CMF ATLANTIC", tag: "CMF", clanId: clanIdMap.get("CMF"), status: "active", description: "Line Atlantic da CMF." },
    { name: "CMF ASSALT", tag: "CMF", clanId: clanIdMap.get("CMF"), status: "active", description: "Line Assalt da CMF." },

    // RED lines (clanId: 4)
    { name: "RED", tag: "RED", clanId: clanIdMap.get("RED"), status: "active", description: "Line principal da RED." },
    { name: "RED Magic BR", tag: "RED", clanId: clanIdMap.get("RED"), status: "active", description: "Line Magic BR da RED." },
    { name: "REÐ Outlaws", tag: "RED", clanId: clanIdMap.get("RED"), status: "active", description: "Line Outlaws da RED." },

    // Outros clãs com 1 line (sem clanId = times avulsos)
    { name: "Eternity", tag: "ETE", clanId: clanIdMap.get("Eternity"), status: "active", description: "Line principal da Eternity." },
    { name: "KOV", tag: "KOV", clanId: clanIdMap.get("KOV"), status: "active", description: "Line principal da KOV." },
    { name: "LMF", tag: "LMF", clanId: clanIdMap.get("LMF"), status: "active", description: "Line principal da LMF." },
    { name: "INF", tag: "INF", clanId: clanIdMap.get("INF"), status: "active", description: "Line principal da INF." },
    { name: "Λつつ", tag: "Λつつ", clanId: clanIdMap.get("Lambda"), status: "active", description: "Line principal da Lambda." },
    { name: "ODS", tag: "ODS", clanId: clanIdMap.get("ODS"), status: "active", description: "Line principal da ODS." },
    { name: "7KW_LHETAL", tag: "7KW", clanId: clanIdMap.get("7KW"), status: "active", description: "Line principal da 7KW." },
    { name: "K4F", tag: "K4F", clanId: clanIdMap.get("K4F"), status: "active", description: "Line principal da K4F." },
    { name: "Dev", tag: "DEV", clanId: clanIdMap.get("Dev"), status: "active", description: "Line de desenvolvedores." },
    { name: "EmE", tag: "EME", clanId: clanIdMap.get("EmE"), status: "active", description: "Line principal da EmE." },
    { name: "♱VØID×STRIKE♱", tag: "VOID", clanId: clanIdMap.get("VOID STRIKE"), status: "active", description: "Line principal da VOID STRIKE." },

    // Times avulsos (sem clanId)
    { name: "Misturado", tag: "MIX", clanId: null, status: "active", description: "Time misto de jogadores de diferentes clãs." },
    { name: "Time I", tag: "TI", clanId: null, status: "active", description: "Time independente I." },
    { name: "Time E", tag: "TE", clanId: null, status: "active", description: "Time independente E." },
  ];

  let teamsCount = 0;
  for (const teamData of teamsData) {
    if (upsertTeam(db, teamData)) teamsCount++;
  }
  console.log(`[SEED] ${teamsCount} teams created`);

  // ============================================================
  // XTREINOS
  // ============================================================
  const xtreinosData = [
    { name: "XTreino Underground - 30/04", date: "2026-04-30", timeBr: "21:00", modality: "squad", maxTeams: 20, status: "finalizado" },
    { name: "XTreino Underground - 07/05", date: "2026-05-07", timeBr: "21:00", modality: "squad", maxTeams: 20, status: "finalizado" },
    { name: "XTreino Underground - 19/05", date: "2026-05-19", timeBr: "21:00", modality: "squad", maxTeams: 20, status: "finalizado" },
    { name: "XTreino Underground - 21/05", date: "2026-05-21", timeBr: "21:00", modality: "squad", maxTeams: 20, status: "finalizado" },
    { name: "XTreino Underground - 08/06", date: "2026-06-08", timeBr: "21:00", modality: "squad", maxTeams: 20, status: "finalizado" },
    { name: "XTreino Underground - 09/06", date: "2026-06-09", timeBr: "21:00", modality: "squad", maxTeams: 20, status: "finalizado" },
  ];

  let xtreinosCount = 0;
  for (const xtData of xtreinosData) {
    if (upsertXtreino(db, xtData)) xtreinosCount++;
  }
  console.log(`[SEED] ${xtreinosCount} xtreinos created`);

  // ============================================================
  // PLAYERS
  // ============================================================
  const allTeams = db.select().from(teams).all();
  const teamIdMap = new Map(allTeams.map(t => [t.name, t.id]));

  const playersData = [
    // CMF
    { nickname: "CMF Leo", teamName: "CMF", role: "official" },
    { nickname: "CMF Lyx7", teamName: "CMF", role: "official" },
    { nickname: "CMF MOIZO", teamName: "CMF", role: "official" },
    { nickname: "CMF Stygian", teamName: "CMF", role: "official" },
    { nickname: "CMF Syx", teamName: "CMF", role: "captain" },
    { nickname: "CMF Léo", teamName: "CMF ATLANTIC", role: "captain" },
    { nickname: "CMF Kira", teamName: "CMF ATLANTIC", role: "official" },
    { nickname: "CMF Moizo", teamName: "CMF ATLANTIC", role: "official" },
    { nickname: "CMF Dnvy", teamName: "CMF ASSALT", role: "captain" },
    { nickname: "CMF Lynx7", teamName: "CMF ASSALT", role: "official" },
    { nickname: "CMF Max", teamName: "CMF ASSALT", role: "official" },
    { nickname: "CMF Thxxxz", teamName: "CMF ASSALT", role: "reserve" },

    // Eternity
    { nickname: "Black 永", teamName: "Eternity", role: "official" },
    { nickname: "Damøn.TTK", teamName: "Eternity", role: "official" },
    { nickname: "DamønTTK 永", teamName: "Eternity", role: "official" },
    { nickname: "Givas'xX 永", teamName: "Eternity", role: "official" },
    { nickname: "Kennedy", teamName: "Eternity", role: "captain" },
    { nickname: "Muggle", teamName: "Eternity", role: "official" },
    { nickname: "Muggle 永", teamName: "Eternity", role: "official" },
    { nickname: "Nofear", teamName: "Eternity", role: "official" },
    { nickname: "RED REZE", teamName: "Eternity", role: "official" },
    { nickname: "Shxrk", teamName: "Eternity", role: "reserve" },

    // FURY
    { nickname: "Creedz FURY", teamName: "FURY", role: "captain" },
    { nickname: "Diana FURY", teamName: "FURY", role: "official" },
    { nickname: "VN' FURY", teamName: "FURY", role: "official" },
    { nickname: "perfection z", teamName: "FURY", role: "official" },
    { nickname: "DIANA", teamName: "FURY ELITE", role: "captain" },
    { nickname: "RAUAN", teamName: "FURY ELITE", role: "official" },
    { nickname: "SUN", teamName: "FURY ELITE", role: "official" },
    { nickname: "DEX", teamName: "FURY ELITE", role: "official" },
    { nickname: "VN", teamName: "FURY ROYAL", role: "captain" },
    { nickname: "NG", teamName: "FURY ROYAL", role: "official" },
    { nickname: "EGOIST", teamName: "FURY ROYAL", role: "official" },
    { nickname: "MARTNA", teamName: "FURY ROYAL", role: "official" },
    { nickname: "OFF", teamName: "FURY ROYAL", role: "reserve" },

    // INF
    { nickname: "INF Noxz7", teamName: "INF", role: "official" },
    { nickname: "INF GOAT", teamName: "INF", role: "captain" },
    { nickname: "INF BARONI", teamName: "INF", role: "official" },
    { nickname: "INF RINNEGA", teamName: "INF", role: "official" },
    { nickname: "「INF」BLAZE", teamName: "INF", role: "official" },
    { nickname: "「INF」GOAT", teamName: "INF", role: "official" },
    { nickname: "「INF」Noxz7'", teamName: "INF", role: "official" },
    { nickname: "「INF」RINNEGA", teamName: "INF", role: "reserve" },

    // KOV
    { nickname: "AET Jentexz", teamName: "KOV", role: "official" },
    { nickname: "KOV ADAN", teamName: "KOV", role: "captain" },
    { nickname: "KOV ALONE", teamName: "KOV", role: "official" },
    { nickname: "KOV FushyX", teamName: "KOV", role: "official" },
    { nickname: "TTKKAIKE", teamName: "KOV", role: "official" },
    { nickname: "YoSurper", teamName: "KOV", role: "reserve" },

    // LMF
    { nickname: "LMF CALOP12", teamName: "LMF", role: "official" },
    { nickname: "LMF LACERDA", teamName: "LMF", role: "captain" },
    { nickname: "LMF XIT", teamName: "LMF", role: "official" },
    { nickname: "LMF mtfacil", teamName: "LMF", role: "official" },
    { nickname: "LMF_Boss", teamName: "LMF", role: "official" },
    { nickname: "LMF_LACERDA", teamName: "LMF", role: "official" },
    { nickname: "LMF_RICHIMO", teamName: "LMF", role: "reserve" },
    { nickname: "LMF_XIT", teamName: "LMF", role: "official" },
    { nickname: "LMF_mtfacil", teamName: "LMF", role: "official" },

    // Misturado
    { nickname: "INF BADBOY", teamName: "Misturado", role: "official" },
    { nickname: "INF RONY", teamName: "Misturado", role: "official" },
    { nickname: "REVERSE_", teamName: "Misturado", role: "captain" },
    { nickname: "TOP FreeKill", teamName: "Misturado", role: "official" },

    // ODS
    { nickname: "Az Aamon", teamName: "ODS", role: "captain" },
    { nickname: "[ODS] vantex", teamName: "ODS", role: "official" },
    { nickname: "[ODS].STROG", teamName: "ODS", role: "official" },

    // RED
    { nickname: "CF ALMEIDA", teamName: "RED", role: "official" },
    { nickname: "LMF Boss", teamName: "RED", role: "official" },
    { nickname: "RED APENAS", teamName: "RED", role: "captain" },
    { nickname: "RED snow777", teamName: "RED", role: "official" },
    { nickname: "RED- REZE", teamName: "RED", role: "official" },
    { nickname: "RED-Alemão", teamName: "RED", role: "official" },
    { nickname: "RED-MOREIRA", teamName: "RED", role: "official" },
    { nickname: "REÐ APENAS", teamName: "RED", role: "official" },
    { nickname: "REÐ LANGØ", teamName: "RED", role: "official" },
    { nickname: "REÐ M4RTINA", teamName: "RED", role: "official" },
    { nickname: "REÐ Sunraku", teamName: "RED", role: "official" },
    { nickname: "REÐ Zadock", teamName: "RED", role: "reserve" },
    { nickname: "REÐ snow777", teamName: "RED", role: "official" },

    // REÐ Outlaws
    { nickname: "REÐ MoraesBC", teamName: "REÐ Outlaws", role: "captain" },
    { nickname: "REÐ Felpz", teamName: "REÐ Outlaws", role: "official" },
    { nickname: "REÐ Skibidi", teamName: "REÐ Outlaws", role: "official" },
    { nickname: "REÐ Apenas", teamName: "REÐ Outlaws", role: "official" },

    // RED Magic BR
    { nickname: "LXELTINHO", teamName: "RED Magic BR", role: "captain" },
    { nickname: "MOL ADRIAN", teamName: "RED Magic BR", role: "official" },
    { nickname: "RED KENNZY", teamName: "RED Magic BR", role: "official" },
    { nickname: "RED LANGO", teamName: "RED Magic BR", role: "official" },

    // Time E
    { nickname: "ONE-Javi", teamName: "Time E", role: "captain" },
    { nickname: "PAIN SWAN", teamName: "Time E", role: "official" },
    { nickname: "Poindexter", teamName: "Time E", role: "official" },
    { nickname: "morqesb", teamName: "Time E", role: "official" },

    // Time I
    { nickname: "ASTRO", teamName: "Time I", role: "captain" },
    { nickname: "AimColor", teamName: "Time I", role: "official" },
    { nickname: "GzmAkaza", teamName: "Time I", role: "official" },
    { nickname: "Jtpe", teamName: "Time I", role: "official" },
    { nickname: "hcky", teamName: "Time I", role: "official" },
    { nickname: "iDiaasz", teamName: "Time I", role: "reserve" },

    // UGD Light
    { nickname: "DEATH", teamName: "UGD Light", role: "official" },
    { nickname: "I miss her", teamName: "UGD Light", role: "official" },
    { nickname: "UGD Kyz", teamName: "UGD Light", role: "captain" },
    { nickname: "UGD Psycho", teamName: "UGD Light", role: "official" },
    { nickname: "Kyz", teamName: "UGD Light", role: "official" },
    { nickname: "Zann", teamName: "UGD Light", role: "official" },
    { nickname: "Psycho", teamName: "UGD Light", role: "official" },
    { nickname: "Chino", teamName: "UGD Light", role: "reserve" },

    // UGD Royal (desativada - poucos jogadores)
    { nickname: "Dexz", teamName: "UGD Royal", role: "captain" },
    { nickname: "MayaZ", teamName: "UGD Royal", role: "official" },
    { nickname: "OFFz", teamName: "UGD Royal", role: "official" },

    // UGD LEGENDS
    { nickname: "Ohara", teamName: "UGD LEGENDS", role: "captain" },
    { nickname: "Rafa", teamName: "UGD LEGENDS", role: "official" },
    { nickname: "Xoxoto", teamName: "UGD LEGENDS", role: "official" },
    { nickname: "Buzeira", teamName: "UGD LEGENDS", role: "official" },

    // UGD OLYMPIQUE
    { nickname: "Weenot", teamName: "UGD OLYMPIQUE", role: "captain" },
    { nickname: "Duardin", teamName: "UGD OLYMPIQUE", role: "official" },
    { nickname: "Striker", teamName: "UGD OLYMPIQUE", role: "official" },
    { nickname: "Lorex", teamName: "UGD OLYMPIQUE", role: "official" },
    { nickname: "CANTS", teamName: "UGD OLYMPIQUE", role: "reserve" },

    // UGD Threat
    { nickname: "Rivers AR", teamName: "UGD Threat", role: "official" },
    { nickname: "UGD ARISE", teamName: "UGD Threat", role: "official" },
    { nickname: "UGD Ares", teamName: "UGD Threat", role: "official" },
    { nickname: "UGD Kaze", teamName: "UGD Threat", role: "captain" },
    { nickname: "UGD Neo", teamName: "UGD Threat", role: "official" },
    { nickname: "UGD Treon", teamName: "UGD Threat", role: "official" },
    { nickname: "UGD cool7", teamName: "UGD Threat", role: "official" },
    { nickname: "Cool", teamName: "UGD Threat", role: "official" },
    { nickname: "Treon", teamName: "UGD Threat", role: "official" },
    { nickname: "Kaze", teamName: "UGD Threat", role: "official" },
    { nickname: "Arise", teamName: "UGD Threat", role: "official" },
    { nickname: "Santz", teamName: "UGD Threat", role: "reserve" },

    // Lambda
    { nickname: "Striker71", teamName: "Λつつ", role: "official" },
    { nickname: "Striker81", teamName: "Λつつ", role: "official" },
    { nickname: "ØNE ???", teamName: "Λつつ", role: "captain" },
    { nickname: "ΛΞT Jentexz", teamName: "Λつつ", role: "official" },
    { nickname: "Λつつ Aninha", teamName: "Λつつ", role: "official" },
    { nickname: "Λつつ Unknown", teamName: "Λつつ", role: "official" },
    { nickname: "Λつつ_$CAVEIRA", teamName: "Λつつ", role: "official" },
    { nickname: "『PsS-KINN-ボ", teamName: "Λつつ", role: "reserve" },

    // Dev
    { nickname: "DevNexT★", teamName: "Dev", role: "captain" },
    { nickname: "DevBatata", teamName: "Dev", role: "official" },
    { nickname: "DevPisca", teamName: "Dev", role: "official" },
    { nickname: "DevThorfinn", teamName: "Dev", role: "official" },
    { nickname: "Dev_Guizin", teamName: "Dev", role: "official" },
    { nickname: "Dev_LTz", teamName: "Dev", role: "official" },
    { nickname: "Dev Ana", teamName: "Dev", role: "reserve" },

    // EmE
    { nickname: "Yeezy", teamName: "EmE", role: "captain" },
    { nickname: "geldeysito", teamName: "EmE", role: "official" },
    { nickname: "EME々Akaza", teamName: "EmE", role: "official" },
    { nickname: "EME々Lulu", teamName: "EmE", role: "official" },

    // VOID STRIKE
    { nickname: "♱Vøid♱.D_R", teamName: "♱VØID×STRIKE♱", role: "captain" },
    { nickname: "♱Vøid♱+gute", teamName: "♱VØID×STRIKE♱", role: "official" },
    { nickname: "♱Vøid♱.nino", teamName: "♱VØID×STRIKE♱", role: "official" },
    { nickname: "™VØID°⁷⁷⁷", teamName: "♱VØID×STRIKE♱", role: "official" },

    // 7KW
    { nickname: "(NTC)patrikm", teamName: "7KW_LHETAL", role: "captain" },
    { nickname: "_061_kakashi", teamName: "7KW_LHETAL", role: "official" },
    { nickname: "RL.MATADOR☠️", teamName: "7KW_LHETAL", role: "official" },
    { nickname: "Fefe_🎭🇧🇷", teamName: "7KW_LHETAL", role: "official" },

    // K4F
    { nickname: "k4F urso", teamName: "K4F", role: "captain" },
    { nickname: "K4F nine", teamName: "K4F", role: "official" },
    { nickname: "K4F gui", teamName: "K4F", role: "official" },
    { nickname: "Alek", teamName: "K4F", role: "official" },
  ];

  let playersCount = 0;
  for (const playerData of playersData) {
    const teamId = teamIdMap.get(playerData.teamName);
    if (teamId) {
      if (upsertPlayer(db, {
        nickname: playerData.nickname,
        teamId: teamId,
        role: playerData.role,
      })) playersCount++;
    } else {
      console.warn(`[SEED] Team not found for player ${playerData.nickname}: ${playerData.teamName}`);
    }
  }
  console.log(`[SEED] ${playersCount} players created`);

  // ============================================================
  // Atualizar captainId nos times
  // ============================================================
  const allPlayers = db.select().from(players).all();
  for (const player of allPlayers) {
    if (player.role === "captain" && player.teamId) {
      db.update(teams)
        .set({ captainId: player.id, captainName: player.nickname })
        .where(eq(teams.id, player.teamId))
        .run();
    }
  }
  console.log("[SEED] Captain IDs updated");

  const seedName = "clans-v1";
  const existingSeed = db.select().from(seedRuns).where(eq(seedRuns.seedName, seedName)).get();
  if (!existingSeed) {
    db.insert(seedRuns).values({ seedName }).run();
    console.log(`[SEED] Seed run '${seedName}' recorded`);
  }

  console.log("[SEED] Initial seed completed successfully!");
}