// db/seeds/seed-scrim-players-4v4.ts
// Adiciona jogadores novos da scrim 4v4 ao registro de players

import { getDb } from "../../api/queries/connection.js";
import { players, teams, seedRuns } from "../schema.js";
import { eq } from "drizzle-orm";

// ============================================================
// JOGADORES NOVOS DA SCRIM 4v4
// ============================================================

// [nickname, teamName, role]
// role: "cap" = captain | "off" = official | "res" = reserve
const NEW_PLAYERS: [string, string, "cap" | "off" | "res"][] = [
  // UGD Threat (novos nicknames para scrim)
  ["UGD_ Ares",    "UGD Threat", "off"],   // Variante do UGD Ares
  ["UGD_ Ohara",   "UGD Threat", "off"],   // Variante do Ohara
  ["Dexz7RYL",     "UGD Threat", "off"],   // Variante do Dexz
  ["UGD_ A R",     "UGD Threat", "off"],   // Novo jogador

  // K4F (novos jogadores)
  ["K4F Zaza",     "K4F", "off"],
  ["K4F NINE",     "K4F", "off"],          // Variante do K4F nine
  ["K4F Guilok07", "K4F", "off"],          // Variante do K4F gui
  ["ÉoUrSo",       "K4F", "off"],
];

// ============================================================
// HELPERS
// ============================================================

function upsertPlayer(db: ReturnType<typeof getDb>, data: typeof players.$inferInsert) {
  const existing = db.select().from(players).where(eq(players.nickname, data.nickname)).get();
  if (!existing) { db.insert(players).values(data).run(); return true; }
  return false;
}

// ============================================================
// LÓGICA DO SEED
// ============================================================

export function seed() {
  const db = getDb();
  console.log("[SEED] Starting scrim players seed...");

  // Buscar times existentes
  const allTeams = db.select().from(teams).all();
  const teamIdMap = new Map(allTeams.map(t => [t.name, t.id]));

  let playersCount = 0;
  for (const [nickname, teamName, roleShort] of NEW_PLAYERS) {
    const teamId = teamIdMap.get(teamName);
    if (!teamId) {
      console.warn(`[SEED] Team not found for player ${nickname}: ${teamName}`);
      continue;
    }

    const roleMap = { cap: "captain", off: "official", res: "reserve" } as const;

    if (upsertPlayer(db, { 
      nickname, 
      teamId, 
      role: roleMap[roleShort] 
    })) {
      playersCount++;
      console.log(`[SEED] Player created: ${nickname} (${teamName})`);
    } else {
      console.log(`[SEED] Player already exists: ${nickname}`);
    }
  }

  console.log(`[SEED] ${playersCount} new players created`);

  // Registrar seed run
  const seedName = "scrim-players-4v4";
  const existingSeed = db.select().from(seedRuns).where(eq(seedRuns.seedName, seedName)).get();
  if (!existingSeed) {
    db.insert(seedRuns).values({ seedName }).run();
    console.log(`[SEED] Seed run '${seedName}' recorded`);
  }

  console.log("[SEED] Scrim players seed completed!");
}