// db/seeds/seed-aliases.ts
import { getDb } from "../../api/queries/connection.js";
import { playerAliases, players } from "../schema.js";
import { eq } from "drizzle-orm";

function getPlayerIdByNick(db: any, nickname: string): number | null {
  const player = db
    .select()
    .from(players)
    .where(eq(players.nickname, nickname))
    .get();
  return player?.id ?? null;
}

export function seedAliases() {
  const db = getDb();

  // Verifica se já tem aliases
  const existing = db.select().from(playerAliases).all();
  if (existing.length > 0) {
    console.log("[SEED] Aliases already exist, skipping");
    return;
  }

  // Mapeamento: nick atual → [nicks antigos]
  const aliasMap: Record<string, string[]> = {
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
    "Apenas": ["REÐ APENAS, REÐ Apenas, RED APENAS"],
    "MARTNA": ["REÐ M4RTINA"],
    // Adicione mais aqui: "Nick Atual": ["antigo1", "antigo2"]
  };

  let inserted = 0;

  for (const [currentNick, aliases] of Object.entries(aliasMap)) {
    const playerId = getPlayerIdByNick(db, currentNick);

    if (!playerId) {
      console.log(`[SEED] ⚠️ Player "${currentNick}" not found, skipping aliases`);
      continue;
    }

    for (const alias of aliases) {
      try {
        db.insert(playerAliases).values({ playerId, alias }).run();
        console.log(`[SEED] ✅ "${alias}" → ${currentNick} (ID: ${playerId})`);
        inserted++;
      } catch (e) {
        console.log(`[SEED] ⚠️ Alias "${alias}" already exists`);
      }
    }
  }

  console.log(`[SEED] ${inserted} aliases inserted`);
}