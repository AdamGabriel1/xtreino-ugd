// db/seeds/seed-scrim-4v4-ugd-vs-k4f.ts
// Seed da scrim 4v4: UGD Threat vs K4F — 13/06/2026
// 3 partidas: Vale Deserto, Ilha do Medo, Ilha do Medo

import { getDb } from "../../api/queries/connection.js";
import { scrims, scrimResults, scrimPlayerStats, seedRuns } from "../schema.js";
import { eq, and } from "drizzle-orm";

// ============================================================
// DADOS DA SCRIM
// ============================================================

const SCRIM_DATE = "2026-06-13";
const SCRIM_NAME = "Scrim 4v4 — UGD Threat vs K4F";
const SCRIM_TIME = "21:00";
const SCRIM_MODALITY = "4v4";
const SCRIM_STATUS = "concluido";
const SCRIM_RESULT = "UGD Threat 3-0 K4F (Vale Deserto, Ilha do Medo, Ilha do Medo)";

// --- RESULTADOS DOS TIMES (posicoes por partida) ---
// Para 4v4, cada partida = uma "queda" (Q1, Q2, Q3)
// UGD Threat venceu todas (pos 1), K4F perdeu todas (pos 2)
const TEAM_RESULTS = [
  {
    teamName: "UGD Threat",
    q1Pos: 1,
    q2Pos: 1,
    q3Pos: 1,
  },
  {
    teamName: "K4F",
    q1Pos: 2,
    q2Pos: 2,
    q3Pos: 2,
  },
];

// --- ESTATISTICAS DOS JOGADORES ---
// Cada entrada: [playerName, teamName, q1Kills, q2Kills, q3Kills, totalKills]
const PLAYER_STATS: [string, string, number, number, number, number][] = [
  // UGD Threat
  ["UGD_ Ares",    "UGD Threat", 11, 9,  11, 31],
  ["UGD_ Ohara",   "UGD Threat", 8,  12, 7,  27],
  ["Dexz7RYL",     "UGD Threat", 7,  4,  7,  18],
  ["UGD_ A R",     "UGD Threat", 3,  4,  3,  10],
  // K4F
  ["K4F Zaza",     "K4F",        2,  2,  1,  5],
  ["K4F NINE",     "K4F",        2,  1,  1,  4],
  ["K4F Guilok07", "K4F",        1,  2,  2,  5],
  ["ÉoUrSo",       "K4F",        0,  0,  0,  0],
];

// ============================================================
// HELPERS
// ============================================================

function upsertScrim(db: ReturnType<typeof getDb>, data: typeof scrims.$inferInsert) {
  const existing = db.select().from(scrims).where(eq(scrims.name, data.name)).get();
  if (!existing) {
    const result = db.insert(scrims).values(data).run();
    return { created: true, id: Number(result.lastInsertRowid) };
  }
  return { created: false, id: existing.id };
}

function upsertScrimResult(db: ReturnType<typeof getDb>, scrimId: number, data: typeof scrimResults.$inferInsert) {
  const existing = db
    .select()
    .from(scrimResults)
    .where(
      and(
        eq(scrimResults.scrimId, scrimId),
        eq(scrimResults.teamName, data.teamName)
      )
    )
    .get();
  if (!existing) {
    db.insert(scrimResults).values(data).run();
    return true;
  }
  return false;
}

function upsertScrimPlayerStat(db: ReturnType<typeof getDb>, scrimId: number, data: typeof scrimPlayerStats.$inferInsert) {
  const existing = db
    .select()
    .from(scrimPlayerStats)
    .where(
      and(
        eq(scrimPlayerStats.scrimId, scrimId),
        eq(scrimPlayerStats.playerName, data.playerName)
      )
    )
    .get();
  if (!existing) {
    db.insert(scrimPlayerStats).values(data).run();
    return true;
  }
  return false;
}

// ============================================================
// LÓGICA DO SEED
// ============================================================

export function seed() {
  const db = getDb();
  console.log("[SEED] Starting scrim 4v4 seed: UGD Threat vs K4F...");

  // 1. Inserir o scrim na tabela scrims
  const scrimResult = upsertScrim(db, {
    name: SCRIM_NAME,
    date: SCRIM_DATE,
    time: SCRIM_TIME,
    modality: SCRIM_MODALITY,
    status: SCRIM_STATUS,
    result: SCRIM_RESULT,
  });

  const scrimId = scrimResult.id;
  console.log(`[SEED] Scrim ${scrimResult.created ? "created" : "already exists"} (id=${scrimId})`);

  // 2. Inserir resultados dos times
  let teamResultsCount = 0;
  for (const tr of TEAM_RESULTS) {
    if (upsertScrimResult(db, scrimId, {
      scrimId,
      date: SCRIM_DATE,
      teamName: tr.teamName,
      q1Pos: tr.q1Pos,
      q2Pos: tr.q2Pos,
      q3Pos: tr.q3Pos,
    })) {
      teamResultsCount++;
    }
  }
  console.log(`[SEED] ${teamResultsCount} team results created`);

  // 3. Inserir estatísticas dos jogadores
  let playerStatsCount = 0;
  for (const [playerName, teamName, q1Kills, q2Kills, q3Kills, totalKills] of PLAYER_STATS) {
    if (upsertScrimPlayerStat(db, scrimId, {
      scrimId,
      date: SCRIM_DATE,
      teamName,
      playerName,
      q1Kills,
      q2Kills,
      q3Kills,
      totalKills,
    })) {
      playerStatsCount++;
    }
  }
  console.log(`[SEED] ${playerStatsCount} player stats created`);

  // 4. Registrar seed run
  const seedName = "scrim-4v4-ugd-vs-k4f";
  const existingSeed = db.select().from(seedRuns).where(eq(seedRuns.seedName, seedName)).get();
  if (!existingSeed) {
    db.insert(seedRuns).values({ seedName }).run();
    console.log(`[SEED] Seed run '${seedName}' recorded`);
  }

  console.log("[SEED] Scrim 4v4 seed completed successfully!");
}