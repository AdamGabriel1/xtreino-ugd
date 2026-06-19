// db/seeds/seed-player.ts
// Seed unificado: trata todos os nicks (antigos/atuais) como a mesma pessoa
// O master é o nick atual. Todos os outros são merged (somem da listagem, stats vão pro master).

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

export function seedPlayerUnified() {
  const db = getDb();

  // Verifica se já foi rodado
  const existing = db.select().from(playerMerges).all();
  if (existing.length > 0) {
    console.log("[SEED] Player unified already seeded, skipping");
    return;
  }

  // ============================================================
  // MAPEAMENTO: Nick Atual (Master) → [Nicks Antigos/Duplicados]
  // Todos os nicks listados aqui serão tratados como a mesma pessoa.
  // O master fica visível na listagem. Os outros somem e viram "histórico".
  // ============================================================
  const unifiedMap: Record<string, string[]> = {
    // Underground
    "Cool": ["UGD cool7", "Rivers AR", "UGD Ares", "cool", "UGD cool⁷"],
    "Santz": ["UGD Sant", "UGD Neo"],
    "Kaze": ["UGD Kaze"],
    "Treon": ["UGD Treon"],
    "Arise": ["UGD Arise"],
    "Lorex": ["Lorex"], // Mesmo nick, times diferentes (OLYMPIQUE → Threat)

    // CMF
    "CMF Moizo": ["CMF MOIZO"],
    "CMF Léo": ["CMF Leo"],

    // FURY
    "VN": ["VN' FURY"],
    "DEX": ["Dexz"],
    "OFF": ["OFFz"],
    "NG": ["MayaZ"],
    "NOKI": ["Noki"],
    "Diana FURY": ["Diana FURY"], // Mesmo nick, times diferentes (FURY → MIX)

    // RED
    "snow777": ["RED snow777", "REÐ snow777"],
    "Lango": ["REÐ LANGØ", "RED LANGO"],
    "Apenas": ["REÐ APENAS", "REÐ Apenas", "RED APENAS"],
    "MARTNA": ["REÐ M4RTINA"],

    // EmE
    "EME々Akaza": ["GzmAkaza"],

    // CPF — Mesmos nicks em times diferentes (CANCELADO → VILTRUMITE)
    "CPF BISCOITO": ["CPF BISCOITO"],
    "CPF FLAX": ["CPF FLAX"],
    "CPF GBZIN": ["CPF GBZIN"],
    "CPF KROM": ["CPF KROM"],
    "CPF LUIZ": ["CPF LUIZ"],
    "CPF XITADO": ["CPF XITADO"],

    // Adicione mais: "Nick Atual": ["antigo1", "antigo2", "antigo3"],
  };

  let inserted = 0;
  let skipped = 0;

  for (const [masterNick, otherNicks] of Object.entries(unifiedMap)) {
    const masterId = getPlayerIdByNick(db, masterNick);

    if (!masterId) {
      console.log(`[SEED] ⚠️ Master "${masterNick}" not found in database`);
      skipped += otherNicks.length;
      continue;
    }

    for (const otherNick of otherNicks) {
      const otherId = getPlayerIdByNick(db, otherNick);

      if (!otherId) {
        // Nick não existe como jogador cadastrado — é só um nick antigo nos xtreinos
        // Não precisa de merge, o router já busca pelo nome nos xtreinos
        console.log(`[SEED] ℹ️ "${otherNick}" not a registered player — will be found via xtreino stats`);
        continue;
      }

      if (masterId === otherId) {
        console.log(`[SEED] ℹ️ "${otherNick}" is the same ID as master — skipping`);
        continue;
      }

      try {
        db.insert(playerMerges).values({
          masterPlayerId: masterId,
          mergedPlayerId: otherId,
        }).run();
        console.log(`[SEED] ✅ "${otherNick}" (ID:${otherId}) → "${masterNick}" (ID:${masterId})`);
        inserted++;
      } catch (e) {
        console.log(`[SEED] ⚠️ "${otherNick}" already merged or error`);
      }
    }
  }

  console.log(`[SEED] ${inserted} merges inserted, ${skipped} skipped`);
}