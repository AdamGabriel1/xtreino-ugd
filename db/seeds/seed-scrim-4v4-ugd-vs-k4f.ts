// db/seeds/seed-scrim-4v4-ugd-vs-k4f.ts
// Seed da scrim 4v4: UGD Threat vs K4F — 13/06/2026
// 3 partidas: Vale Deserto, Ilha do Medo, Ilha do Medo
// Dados atualizados com kills, assists, mortes, dano e MVP por queda

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
// Cada entrada: [playerName, teamName, q1Kills, q1Assists, q1Deaths, q1Damage, q1Mvp,
//                                      q2Kills, q2Assists, q2Deaths, q2Damage, q2Mvp,
//                                      q3Kills, q3Assists, q3Deaths, q3Damage, q3Mvp,
//                                      totalKills, totalAssists, totalDeaths, totalDamage, totalMvp]
const PLAYER_STATS: [string, string,
  number, number, number, number, boolean,
  number, number, number, number, boolean,
  number, number, number, number, boolean,
  number, number, number, number, number][] = [
  // UGD Threat
  ["IGD_ Ares",    "UGD Threat",
    11, 5,  1, 3100, true,   // Q1: Vale Deserto
     9, 14, 2, 3308, false,   // Q2: Ilha do Medo
    11, 4,  0, 4442, true,   // Q3: Ilha do Medo
    31, 23, 3, 10850, 2], // Totais
  ["UGD_ Ohara",   "UGD Threat",
     8, 10, 1, 3604, false,   // Q1: Vale Deserto
    12, 7,  1, 2732, true,   // Q2: Ilha do Medo
     7, 6,  1, 2900, false,   // Q3: Ilha do Medo
    27, 23, 3, 9236, 1],  // Totais
  ["Dexz7RYL",     "UGD Threat",
     7, 7,  1, 2866, false,   // Q1: Vale Deserto
     4, 9,  1, 1595, false,   // Q2: Ilha do Medo
     7, 4,  1, 2522, false,   // Q3: Ilha do Medo
    18, 20, 3, 6983, 0],  // Totais
  ["GD_ A R",      "UGD Threat",
     3, 5,  2, 2277, false,   // Q1: Vale Deserto
     4, 3,  1, 1042, false,   // Q2: Ilha do Medo
     3, 8,  2, 1678, false,   // Q3: Ilha do Medo
    10, 16, 5, 4997, 0],  // Totais
  // K4F
  ["K4F Zaza",     "K4F",
     2, 2,  7, 1687, true,   // Q1: Vale Deserto
     2, 1,  7, 895,  false,   // Q2: Ilha do Medo
     1, 1,  7, 1451, false,   // Q3: Ilha do Medo
     5, 4,  21, 4033, 1], // Totais
  ["K4F NINE",     "K4F",
     2, 1,  7, 1822, false,   // Q1: Vale Deserto
     1, 0,  8, 528,  false,   // Q2: Ilha do Medo
     1, 0,  7, 1416, false,   // Q3: Ilha do Medo
     4, 1,  22, 3766, 0], // Totais
  ["K4F Guilok07", "K4F",
     1, 1,  7, 957,  false,   // Q1: Vale Deserto
     2, 2,  7, 1938, true,   // Q2: Ilha do Medo
     2, 2,  7, 2156, true,   // Q3: Ilha do Medo
     5, 5,  21, 5051, 2], // Totais
  ["ÉoUrSo",       "K4F",
     0, 0,  8, 525,  false,   // Q1: Vale Deserto
     0, 1,  7, 1245, false,   // Q2: Ilha do Medo
     0, 0,  7, 880,  false,   // Q3: Ilha do Medo
     0, 1,  22, 2650, 0], // Totais
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
  for (const [
    playerName, teamName,
    q1Kills, q1Assists, q1Deaths, q1Damage, q1Mvp,
    q2Kills, q2Assists, q2Deaths, q2Damage, q2Mvp,
    q3Kills, q3Assists, q3Deaths, q3Damage, q3Mvp,
    totalKills, totalAssists, totalDeaths, totalDamage, totalMvp
  ] of PLAYER_STATS) {
    if (upsertScrimPlayerStat(db, scrimId, {
      scrimId,
      date: SCRIM_DATE,
      teamName,
      playerName,
      q1Kills,
      q1Assists,
      q1Deaths,
      q1Damage,
      q1Mvp,
      q2Kills,
      q2Assists,
      q2Deaths,
      q2Damage,
      q2Mvp,
      q3Kills,
      q3Assists,
      q3Deaths,
      q3Damage,
      q3Mvp,
      totalKills,
      totalAssists,
      totalDeaths,
      totalDamage,
      totalMvp,
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