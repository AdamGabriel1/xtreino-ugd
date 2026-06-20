// db/seeds/seed-initial.ts
// Seed inicial: admins, settings, clans, teams, players
// 🎯 Formato compacto — fácil de adicionar/mover/alterar

import { getDb } from "../../api/queries/connection.js";
import { admins, settings, xtreinos, clans, teams, players, seedRuns } from "../schema.js";
import { eq } from "drizzle-orm";
import { hashSync } from "bcryptjs";
import { WHATSAPP_TEMPLATE } from "../seeds-backup/whatsapp-template.js";

// ============================================================
// HELPERS (não precisa mexer aqui)
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

function upsertPlayer(db: ReturnType<typeof getDb>, data: typeof players.$inferInsert) {
  const existing = db.select().from(players).where(eq(players.nickname, data.nickname)).get();
  if (!existing) { db.insert(players).values(data).run(); return true; }
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
// [nome, tag, cor, descrição]
const CLANS_DATA: [string, string, string, string][] = [
  ["Underground", "UGD", "#006400", "Clã Underground."],
  ["FURY", "FURY", "#ff4444", "Clã FURY Rising"],
  ["CMF", "CMF", "#4444ff", "Clã Comando Anfibrios."],
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
// [nome, tag, clanName, status, descrição]
// clanName = null → time avulso (sem clã)
const TEAMS_DATA: [string, string, string | null, "active" | "disbanded", string][] = [
  // Underground
  ["UGD Threat", "UGD", "Underground", "active", "Line Threat da Underground."],
  ["UGD Royal", "UGD", "Underground", "disbanded", "Line antiga da Underground. Desativada em 2026."],
  ["UGD Light", "UGD", "Underground", "active", "Line dos Manitos da Underground."],
  ["UGD LEGENDS", "UGD", "Underground", "active", "Line Legends da Underground."],
  ["UGD OLYMPIQUE", "UGD", "Underground", "active", "Line Olympique da Underground."],

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
  ["♱VØID×STRIKE♱", "VOID", "VOID STRIKE", "active", "Line principal da VOID STRIKE."],
  ["CPF CANCELADO", "CPF", "CPF", "active", "Line principal da CPF."],
  ["CPF VILTRUMITE", "CPF", "CPF", "active", "Line Viltrumite da CPF."],

  // Times avulsos (sem clã)
  ["Misturado", "MIX", null, "active", "Time misto de jogadores de diferentes clãs."],
  ["Time I", "TI", null, "active", "Time independente I."],
  ["Time E", "TE", null, "active", "Time independente E."],
  ["Randolinhas", "RND", null, "active", "Time avulso Randolinhas."],
  ["vengeance", "VNG", null, "active", "Time vengeance."],
];

// --- PLAYERS ---
// [nickname, teamName, role]
// role: "cap" = captain | "off" = official | "res" = reserve
const PLAYERS_DATA: [string, string, "cap" | "off" | "res"][] = [
  // CMF
  ["CMF Leo", "CMF", "off"],
  ["CMF Lyx7", "CMF", "off"],
  ["CMF MOIZO", "CMF", "off"],
  ["CMF Stygian", "CMF", "off"],
  ["CMF Syx", "CMF", "cap"],

  // CMF ATLANTIC
  ["CMF Léo", "CMF ATLANTIC", "cap"],
  ["CMF Kira", "CMF ATLANTIC", "off"],
  ["CMF Moizo", "CMF ATLANTIC", "off"],
  ["CMF MOZKAXR", "CMF ATLANTIC", "off"],
  ["CMF Smoke", "CMF ATLANTIC", "off"],
  ["CMF SANT", "CMF ATLANTIC", "off"],
  ["CMF Fallet", "CMF ATLANTIC", "off"],
  ["CMF Syx⁷", "CMF ATLANTIC", "off"],
  ["CMF M0IZO", "CMF ATLANTIC", "off"],
  ["CMF MOZKA", "CMF ATLANTIC", "off"],
  ["CMF Teo", "CMF ATLANTIC", "off"],
  ["CMF Syx7", "CMF ATLANTIC", "off"],
  ["CMF KIRA", "CMF ATLANTIC", "off"],
  ["CMF Sant", "CMF ATLANTIC", "off"],
  ["CMF HISOKA", "CMF ATLANTIC", "off"],

  // CMF ASSALT
  ["CMF Dnvy", "CMF ASSALT", "cap"],
  ["CMF Lynx7", "CMF ASSALT", "off"],
  ["CMF Max", "CMF ASSALT", "off"],
  ["CMF Thxxxz", "CMF ASSALT", "res"],
  ["Artur", "CMF ASSALT", "off"],
  ["CMF Txxz¹", "CMF ASSALT", "off"],
  ["CMF xeW", "CMF ASSALT", "off"],
  ["CMF BAELTTK", "CMF ASSALT", "off"],
  ["MacroSync", "CMF ASSALT", "off"],

  // Eternity
  ["Black 永", "Eternity", "off"],
  ["Damøn.TTK", "Eternity", "off"],
  ["DamønTTK 永", "Eternity", "off"],
  ["Givas'xX 永", "Eternity", "off"],
  ["Kennedy", "Eternity", "cap"],
  ["Muggle", "Eternity", "off"],
  ["Muggle 永", "Eternity", "off"],
  ["Nofear", "Eternity", "off"],
  ["RED REZE", "Eternity", "off"],
  ["Shxrk", "Eternity", "res"],

  // FURY
  ["Creedz FURY", "FURY", "cap"],
  ["Diana FURY", "FURY", "off"],
  ["VN' FURY", "FURY", "off"],
  ["perfection z", "FURY", "off"],

  // FURY ELITE
  ["DIANA", "FURY ELITE", "cap"],
  ["RAUAN", "FURY ELITE", "off"],
  ["SUN", "FURY ELITE", "off"],
  ["DEX", "FURY ELITE", "off"],
  ["Dexz7RYL", "FURY ELITE", "off"],
  ["try FURY", "FURY ELITE", "off"],

  // FURY ROYAL
  ["VN", "FURY ROYAL", "cap"],
  ["NG", "FURY ROYAL", "off"],
  ["EGOIST", "FURY ROYAL", "off"],
  ["MARTNA", "FURY ROYAL", "off"],
  ["OFF", "FURY ROYAL", "res"],
  ["NOKI", "FURY ROYAL", "res"],
  ["NGLIFE FURY", "FURY ROYAL", "off"],
  ["Egoist FURY", "FURY ROYAL", "off"],

  // FURY CASUAL
  ["AM Akyra🥷", "FURY CASUAL", "off"],
  ["FURY zLAZY⁰¹", "FURY CASUAL", "off"],
  ["LK NPC", "FURY CASUAL", "off"],
  ["FURY zLORHAN", "FURY CASUAL", "off"],
  ["KILLUA", "FURY CASUAL", "off"],
  ["VELOZZO", "FURY CASUAL", "off"],

  // FURY MIX (ELITE / ROYAL)
  ["Diana FURY", "FURY MIX (ELITE / ROYAL)", "off"],
  ["Dexz⁷ᴿʸᴸ", "FURY MIX (ELITE / ROYAL)", "off"],
  ["B4RBOSA⁷", "FURY MIX (ELITE / ROYAL)", "off"],
  ["NOKI FURY", "FURY MIX (ELITE / ROYAL)", "off"],

  // FURY ELITE / MIX (Line H)
  ["Rauan FURY", "FURY ELITE / MIX (Line H)", "off"],

  // FURY ROYAL / MIX (Line I)
  ["M4RTNA FURY", "FURY ROYAL / MIX (Line I)", "off"],
  ["Sun FURY", "FURY ROYAL / MIX (Line I)", "off"],

  // INF
  ["INF Noxz7", "INF", "off"],
  ["INF GOAT", "INF", "cap"],
  ["INF BARONI", "INF", "off"],
  ["INF RINNEGA", "INF", "off"],
  ["「INF」BLAZE", "INF", "off"],
  ["「INF」GOAT", "INF", "off"],
  ["「INF」Noxz7'", "INF", "off"],
  ["「INF」RINNEGA", "INF", "res"],

  // KOV
  ["AET Jentexz", "KOV", "off"],
  ["KOV ADAN", "KOV", "cap"],
  ["KOV ALONE", "KOV", "off"],
  ["KOV FushyX", "KOV", "off"],
  ["TTKKAIKE", "KOV", "off"],
  ["YoSurper", "KOV", "res"],

  // LMF
  ["LMF CALOP12", "LMF", "off"],
  ["LMF LACERDA", "LMF", "cap"],
  ["LMF XIT", "LMF", "off"],
  ["LMF mtfacil", "LMF", "off"],
  ["LMF_Boss", "LMF", "off"],
  ["LMF_LACERDA", "LMF", "off"],
  ["LMF_RICHIMO", "LMF", "res"],
  ["LMF_XIT", "LMF", "off"],
  ["LMF_mtfacil", "LMF", "off"],

  // Misturado
  ["INF BADBOY", "Misturado", "off"],
  ["INF RONY", "Misturado", "off"],
  ["REVERSE_", "Misturado", "cap"],
  ["TOP FreeKill", "Misturado", "off"],

  // ODS
  ["Az Aamon", "ODS", "cap"],
  ["[ODS] vantex", "ODS", "off"],
  ["[ODS].STROG", "ODS", "off"],

  // RED
  ["CF ALMEIDA", "RED", "off"],
  ["LMF Boss", "RED", "off"],
  ["RED APENAS", "RED", "cap"],
  ["RED snow777", "RED", "off"],
  ["RED- REZE", "RED", "off"],
  ["RED-Alemão", "RED", "off"],
  ["RED-MOREIRA", "RED", "off"],
  ["REÐ APENAS", "RED", "off"],
  ["REÐ LANGØ", "RED", "off"],
  ["REÐ M4RTINA", "RED", "off"],
  ["REÐ Sunraku", "RED", "off"],
  ["REÐ Zadock", "RED", "res"],
  ["REÐ snow777", "RED", "off"],

  // REÐ Outlaws
  ["REÐ MoraesBC", "REÐ Outlaws", "cap"],
  ["REÐ Felpz", "REÐ Outlaws", "off"],
  ["REÐ Skibidi", "REÐ Outlaws", "off"],
  ["REÐ Apenas", "REÐ Outlaws", "off"],

  // RED Magic BR
  ["LXELTINHO", "RED Magic BR", "cap"],
  ["MOL ADRIAN", "RED Magic BR", "off"],
  ["RED KENNZY", "RED Magic BR", "off"],
  ["RED LANGO", "RED Magic BR", "off"],

  // RED INSS
  ["RED Thaedus⁷", "RED INSS", "off"],
  ["RED LORD", "RED INSS", "off"],
  ["VERON", "RED INSS", "off"],
  ["ATREUS", "RED INSS", "off"],
  ["RED FELPZ", "RED INSS", "off"],

  // Time E
  ["ONE-Javi", "Time E", "cap"],
  ["PAIN SWAN", "Time E", "off"],
  ["Poindexter", "Time E", "off"],
  ["morqesb", "Time E", "off"],

  // Time I
  ["ASTRO", "Time I", "cap"],
  ["AimColor", "Time I", "off"],
  ["GzmAkaza", "Time I", "off"],
  ["Jtpe", "Time I", "off"],
  ["hcky", "Time I", "off"],
  ["iDiaasz", "Time I", "res"],

  // UGD Light
  ["DEATH", "UGD Light", "off"],
  ["I miss her", "UGD Light", "off"],
  ["UGD Kyz", "UGD Light", "cap"],
  ["UGD Psycho", "UGD Light", "off"],
  ["Kyz", "UGD Light", "off"],
  ["Zann", "UGD Light", "off"],
  ["Psycho", "UGD Light", "off"],
  ["Chino", "UGD Light", "res"],
  ["Xezn⁷", "UGD Light", "off"],
  ["Chrisxz", "UGD Light", "off"],
  ["Nofear'", "UGD Light", "off"],
  ["Xezn'", "UGD Light", "off"],
  ["UGD JEM", "UGD Light", "off"],
  ["UGD Kyz`", "UGD Light", "off"],

  // UGD Royal
  ["Dexz", "UGD Royal", "cap"],
  ["MayaZ", "UGD Royal", "off"],
  ["OFFz", "UGD Royal", "off"],

  // UGD LEGENDS
  ["Ohara", "UGD LEGENDS", "cap"],
  ["Rafa", "UGD LEGENDS", "off"],
  ["Xoxoto", "UGD LEGENDS", "off"],
  ["Buzeira", "UGD LEGENDS", "off"],
  ["qgc.", "UGD LEGENDS", "off"],
  ["CF BLAZE", "UGD LEGENDS", "off"],
  ["UGD Santz⁷", "UGD LEGENDS", "off"],
  ["UGD Weenot", "UGD LEGENDS", "off"],
  ["UGD XOXOTO", "UGD LEGENDS", "off"],
  ["Sant", "UGD LEGENDS", "off"],
  ["Gabriel qgc", "UGD LEGENDS", "off"],
  ["Blaze", "UGD LEGENDS", "off"],

  // UGD OLYMPIQUE
  ["Weenot", "UGD OLYMPIQUE", "cap"],
  ["Duardin", "UGD OLYMPIQUE", "off"],
  ["Striker", "UGD OLYMPIQUE", "off"],
  ["Lorex", "UGD OLYMPIQUE", "off"],
  ["CANTS", "UGD OLYMPIQUE", "res"],

  // UGD Threat
  ["Lorex", "UGD Threat", "off"],
  ["Rivers AR", "UGD Threat", "off"],
  ["UGD ARISE", "UGD Threat", "off"],
  ["UGD Ares", "UGD Threat", "off"],
  ["UGD Kaze", "UGD Threat", "cap"],
  ["UGD Neo", "UGD Threat", "off"],
  ["UGD Treon", "UGD Threat", "off"],
  ["UGD cool7", "UGD Threat", "off"],
  ["Cool", "UGD Threat", "off"],
  ["Treon", "UGD Threat", "off"],
  ["Kaze", "UGD Threat", "off"],
  ["Arise", "UGD Threat", "off"],
  ["Santz", "UGD Threat", "res"],

  // Λつつ
  ["Striker71", "Λつつ", "off"],
  ["Striker81", "Λつつ", "off"],
  ["ØNE ???", "Λつつ", "cap"],
  ["ΛΞT Jentexz", "Λつつ", "off"],
  ["Λつつ Aninha", "Λつつ", "off"],
  ["Λつつ Unknown", "Λつつ", "off"],
  ["Λつつ_$CAVEIRA", "Λつつ", "off"],
  ["『PsS-KINN-ボ", "Λつつ", "res"],

  // Dev
  ["DevNexT★", "Dev", "cap"],
  ["DevBatata", "Dev", "off"],
  ["DevPisca", "Dev", "off"],
  ["DevThorfinn", "Dev", "off"],
  ["Dev_Guizin", "Dev", "off"],
  ["Dev_LTz", "Dev", "off"],
  ["Dev Ana", "Dev", "res"],

  // EmE
  ["Yeezy", "EmE", "cap"],
  ["geldeysito", "EmE", "off"],
  ["EME々Akaza", "EmE", "off"],
  ["EME々Lulu", "EmE", "off"],

  // ♱VØID×STRIKE♱
  ["♱Vøid♱.D_R", "♱VØID×STRIKE♱", "cap"],
  ["♱Vøid♱+gute", "♱VØID×STRIKE♱", "off"],
  ["♱Vøid♱.nino", "♱VØID×STRIKE♱", "off"],
  ["™VØID°⁷⁷⁷", "♱VØID×STRIKE♱", "off"],

  // 7KW_LHETAL
  ["(NTC)patrikm", "7KW_LHETAL", "cap"],
  ["_061_kakashi", "7KW_LHETAL", "off"],
  ["RL.MATADOR☠️", "7KW_LHETAL", "off"],
  ["Fefe_🎭🇧🇷", "7KW_LHETAL", "off"],

  // K4F
  ["k4F urso", "K4F", "cap"],
  ["K4F nine", "K4F", "off"],
  ["K4F gui", "K4F", "off"],
  ["Alek", "K4F", "off"],
  ["K4F DUDU", "K4F", "off"],
  ["K4F ExuKramo", "K4F", "off"],
  ["K4F NINE", "K4F", "off"],
  ["Guilok07", "K4F", "off"],
  ["NyE Wendxz", "K4F", "off"],
  ["K4F ÉOurso", "K4F", "off"],
  ["K4F GUI", "K4F", "off"],
  ["K4F Aleke", "K4F", "off"],
  ["K4F Dudu", "K4F", "off"],

  // CPF CANCELADO
  ["CPF FLAX", "CPF CANCELADO", "cap"],
  ["CPF GBZIN", "CPF CANCELADO", "off"],
  ["CPF KROM", "CPF CANCELADO", "off"],
  ["CPF PHAX", "CPF CANCELADO", "off"],
  ["CPF BISCOITO", "CPF CANCELADO", "res"],
  ["CPF LCZ", "CPF CANCELADO", "res"],
  ["CPF LUIZ", "CPF CANCELADO", "res"],
  ["CPF XITADO", "CPF CANCELADO", "res"],
  ["CPF ICE!", "CPF CANCELADO", "res"],

  // CPF VILTRUMITE
  ["CPF FLAX", "CPF VILTRUMITE", "off"],
  ["CPF GBZIN", "CPF VILTRUMITE", "off"],
  ["CPF KROM", "CPF VILTRUMITE", "off"],
  ["CPF BISCOITO", "CPF VILTRUMITE", "off"],
  ["CPF LUIZ", "CPF VILTRUMITE", "off"],
  ["CPF XITADO", "CPF VILTRUMITE", "off"],
  ["CPF gbzin", "CPF VILTRUMITE", "off"],
  ["CPF zkrw", "CPF VILTRUMITE", "off"],
  ["Ice", "CPF VILTRUMITE", "off"],
  ["Biscoito", "CPF VILTRUMITE", "off"],
  ["[CPF]xitado", "CPF VILTRUMITE", "off"],
  ["CPF ICE KILER", "CPF VILTRUMITE", "off"],
  ["CPF PICASSO", "CPF VILTRUMITE", "off"],
  ["CPF SHOTTZZ", "CPF VILTRUMITE", "off"],
  ["CPF Ohara", "CPF VILTRUMITE", "off"],
  ["qgc", "CPF VILTRUMITE", "off"],
  ["Vw", "CPF VILTRUMITE", "off"],

  // Randolinhas
  ["sinner boy", "Randolinhas", "off"],
  ["Miag", "Randolinhas", "off"],
  ["VAL Yzzi⁷", "Randolinhas", "off"],
  ["7xis ╲ Tilapia", "Randolinhas", "off"],

  // vengeance
  ["VNG NEAR★", "vengeance", "cap"],
  ["RED moraesbc", "vengeance", "off"],
  ["Ti Pela", "vengeance", "off"],
  ["Caveira", "vengeance", "off"],
  ["ackerman", "vengeance", "off"],
  ["VNG ¿¿¿", "vengeance", "off"],
  ["VNG SCAVEIRA", "vengeance", "off"],
];

// --- XTREINOS (lista base, sem dados de jogadores) ---
// [nome, data, status]
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
];

// ============================================================
// LÓGICA DO SEED (não precisa mexer daqui pra baixo)
// ============================================================

export const DEFAULT_FIXED_TEAMS = [
  "UGD Threat",
  "UGD Royal",
  "UGD LEGENDS",
  "UGD OLYMPIQUE",
];

export function seed() {
  const db = getDb();
  console.log("[SEED] Starting initial seed...");

  // Admin
  const adminCreated = upsertAdmin(db, {
    username: "admin",
    passwordHash: hashSync("admin123", 10),
    role: "super",
  });
  console.log(`[SEED] Admin ${adminCreated ? "created" : "already exists"} (admin/admin123)`);

  // Settings
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

  // Clans
  let clansCount = 0;
  for (const [name, tag, color, description] of CLANS_DATA) {
    if (upsertClan(db, { name, tag, description, color })) clansCount++;
  }
  console.log(`[SEED] ${clansCount} clans created`);

  // Teams (precisa dos clans já inseridos)
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

  // Xtreinos (lista base)
  let xtreinosCount = 0;
  for (const [name, date, status] of XTREINOS_DATA) {
    if (upsertXtreino(db, { name, date, timeBr: "21:00", modality: "squad", maxTeams: 20, status })) xtreinosCount++;
  }
  console.log(`[SEED] ${xtreinosCount} xtreinos created`);

  // Players (precisa dos teams já inseridos)
  const allTeams = db.select().from(teams).all();
  const teamIdMap = new Map(allTeams.map(t => [t.name, t.id]));
  const roleMap = { cap: "captain", off: "official", res: "reserve" } as const;

  let playersCount = 0;
  for (const [nickname, teamName, roleShort] of PLAYERS_DATA) {
    const teamId = teamIdMap.get(teamName);
    if (!teamId) {
      console.warn(`[SEED] Team not found for player ${nickname}: ${teamName}`);
      continue;
    }
    if (upsertPlayer(db, { nickname, teamId, role: roleMap[roleShort] })) playersCount++;
  }
  console.log(`[SEED] ${playersCount} players created`);

  // Atualiza captainId nos times
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

  // Registra seed run
  const seedName = "clans-v1";
  const existingSeed = db.select().from(seedRuns).where(eq(seedRuns.seedName, seedName)).get();
  if (!existingSeed) {
    db.insert(seedRuns).values({ seedName }).run();
    console.log(`[SEED] Seed run '${seedName}' recorded`);
  }

  console.log("[SEED] Initial seed completed successfully!");
}