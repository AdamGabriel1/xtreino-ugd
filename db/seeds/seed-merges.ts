// db/seeds/seed-merges.ts
// Seed inteligente: merge de jogadores duplicados (mesma pessoa, IDs diferentes)

import { getDb } from "../../api/queries/connection.js";
import { playerMerges, players } from "../schema.js";
import { eq } from "drizzle-orm";

function getPlayerIdByNick(db: ReturnType<typeof getDb>, nickname: string): number | null {
  const player = db
    .select()
    .from(players)
    .where(eq(players.nickname, nickname))
    .get();
  return player?.id ?? null;
}

export function seedMerges() {
  const db = getDb();

  // Verifica se já tem merges cadastrados
  const existing = db.select().from(playerMerges).all();
  if (existing.length > 0) {
    console.log("[SEED] Merges already exist, skipping");
    return;
  }

  // ============================================================
  // MAPEAMENTO: Nick Master → [Nicks Duplicados]
  // O master é o jogador que fica visível na listagem.
  // Os duplicados somem da listagem e seus stats vão pro master.
  // ============================================================
  const mergeMap: Record<string, string[]> = {
    "Cool": ["UGD cool7", "Rivers AR", "UGD Ares", "cool"],
    "Santz": ["UGD Sant", "UGD Neo"],
    "CMF Moizo": ["CMF MOIZO"],
    "Kaze": ["UGD Kaze"],
    "Treon": ["UGD Treon"],
    "CMF Léo": ["CMF Leo"],
    "VN": ["VN' FURY"],
    "Arise": ["UGD Arise"],
    "snow777": ["RED snow777", "REÐ snow777"],
    "Lango": ["REÐ LANGØ", "RED LANGO"],
    "DEX": ["Dexz"],
    "OFF": ["OFFz"],
    "NG": ["MayaZ"],
    "Apenas": ["REÐ APENAS", "REÐ Apenas", "RED APENAS"],
    "MARTNA": ["REÐ M4RTINA"],
    "EME々Akaza": ["GzmAkaza"],

    // Adicione seus merges aqui:
    // "Nick Master": ["Duplicado 1", "Duplicado 2"],
  };

  let inserted = 0;
  let skipped = 0;

  for (const [masterNick, mergedNicks] of Object.entries(mergeMap)) {
    const masterId = getPlayerIdByNick(db, masterNick);

    if (!masterId) {
      console.log(`[SEED] ⚠️ Master "${masterNick}" not found in database`);
      skipped += mergedNicks.length;
      continue;
    }

    for (const mergedNick of mergedNicks) {
      const mergedId = getPlayerIdByNick(db, mergedNick);

      if (!mergedId) {
        console.log(`[SEED] ⚠️ Merged "${mergedNick}" not found`);
        skipped++;
        continue;
      }

      try {
        db.insert(playerMerges).values({
          masterPlayerId: masterId,
          mergedPlayerId: mergedId,
        }).run();
        console.log(`[SEED] ✅ Merged "${mergedNick}" (ID:${mergedId}) → "${masterNick}" (ID:${masterId})`);
        inserted++;
      } catch (e) {
        console.log(`[SEED] ⚠️ Merge already exists or error`);
      }
    }
  }

  console.log(`[SEED] ${inserted} merges inserted, ${skipped} skipped`);
}
