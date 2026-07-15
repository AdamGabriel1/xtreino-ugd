// db/seeds/seed-aliases.ts
import { getDb } from "../../api/queries/connection.js";
import { players, teams, playerAliases, teamAliases, seedRuns } from "../schema.js";
import { eq } from "drizzle-orm";
import { normalizeNickname, normalizeTeamName } from "../utils/normalize.js";

// ============================================================
// MAPEAMENTO MANUAL: nickname canonical → lista de aliases conhecidos
// Este é o arquivo que VOCÊ edita quando um jogador novo aparece
// ============================================================

interface PlayerAliasEntry {
  canonicalNickname: string;
  canonicalTeam: string;
  role: "cap" | "off" | "res";
  knownAliases: string[]; // TODAS as variações já vistas
}

const PLAYER_ALIASES_DATA: PlayerAliasEntry[] = [
  // ===== UGD THREAT =====
  {
    canonicalNickname: "Ares",
    canonicalTeam: "UGD Threat",
    role: "off",
    knownAliases: [
      "UGD⚡ Ares", "UGD Ares", "UGD_ Ares", "IGD⚡ Ares",
      "Ares", "UGD cool⁷", "Cool", "UGD cool7", "UGD cool",
    ],
  },
  {
    canonicalNickname: "Kaze",
    canonicalTeam: "UGD Threat",
    role: "off",
    knownAliases: [
      "UGD Kaze", "UGD⚡ Kaze", "Kaze", "UGD⚡ Kaze",
    ],
  },
  {
    canonicalNickname: "Treon",
    canonicalTeam: "UGD Threat",
    role: "cap",
    knownAliases: [
      "UGD Treon", "UGD⚡ Treon", "Treon", "Rivers", "Rivers AR",
    ],
  },
  {
    canonicalNickname: "Arise",
    canonicalTeam: "UGD Threat",
    role: "off",
    knownAliases: [
      "UGD ARISE", "UGD⚡ ARISE", "Arise", "ARISE", "GD⚡ A R", "GD⚡ A R I",
    ],
  },
  {
    canonicalNickname: "Neo",
    canonicalTeam: "UGD Threat",
    role: "off",
    knownAliases: [
      "UGD Neo", "GD⚡ Neo⁷", "Neo",
    ],
  },
  {
    canonicalNickname: "Ween",
    canonicalTeam: "UGD Threat",
    role: "res",
    knownAliases: [
      "GD⚡ Ween", "Ween", "Weenot", "UGD Weenot", "UGD Weenotz", "WenoTz",
    ],
  },
  {
    canonicalNickname: "Ohara",
    canonicalTeam: "UGD Threat",
    role: "off",
    knownAliases: [
      "UGD⚡ Ohara", "UGD Ohara", "Ohara", "UGD Ohara",
    ],
  },
  {
    canonicalNickname: "Dexz",
    canonicalTeam: "UGD Threat",
    role: "off",
    knownAliases: [
      "Dexz", "Dexz⁷RYL", "Dexz⁷ᴿʸᴸ", "Dexz7RYL", "Dexz²RYL",
      "DEXZ", "DEX", "Dexz RYL",
    ],
  },

  // ===== UGD LIGHT =====
  {
    canonicalNickname: "Kyz",
    canonicalTeam: "UGD LIGHT",
    role: "off",
    knownAliases: [
      "UGD⚡ Kyz", "UGD Kyz", "Kyz", "UGD Kyz`",
    ],
  },
  {
    canonicalNickname: "Zen",
    canonicalTeam: "UGD LIGHT",
    role: "off",
    knownAliases: [
      "Not¹ Zen", "Zen", "Zann",
    ],
  },
  {
    canonicalNickname: "Sike",
    canonicalTeam: "UGD LIGHT",
    role: "off",
    knownAliases: [
      "✧Sike", "Sike", "UGD Sike",
    ],
  },
  {
    canonicalNickname: "Psych",
    canonicalTeam: "UGD LIGHT",
    role: "off",
    knownAliases: [
      "GD⚡ Psych", "Psych", "Psycho", "UGD Psycho", "UGD Psych",
    ],
  },

  // ===== K4F =====
  {
    canonicalNickname: "Zaza",
    canonicalTeam: "K4F",
    role: "off",
    knownAliases: [
      "K4F Zaza", "K4F  Zaza", "K4F ZAZA", "K4F zaza",
    ],
  },
  {
    canonicalNickname: "Nine",
    canonicalTeam: "K4F",
    role: "off",
    knownAliases: [
      "K4F NINE", "K4F nine", "K4F  Nine", "K4F NINE",
    ],
  },
  {
    canonicalNickname: "Guilok07",
    canonicalTeam: "K4F",
    role: "off",
    knownAliases: [
      "K4F Guilok07", "K4F gui", "K4F  Gui", "K4F GUI",
      "Guilok07", "K4F Guilok07",
    ],
  },
  {
    canonicalNickname: "Éourso",
    canonicalTeam: "K4F",
    role: "off",
    knownAliases: [
      "ÉoUrSo", "Éourso", "K4F  Éourso", "K4F ÉoUrso", "K4F Éourso", "K4F EruKramo",
      "K4F ExuKramo",
    ],
  },
  {
    canonicalNickname: "Wendxz",
    canonicalTeam: "K4F",
    role: "off",
    knownAliases: [
      "NyE Wendxz", "wend", "Wend", "NyE Wendxz",
    ],
  },
  {
    canonicalNickname: "Alek",
    canonicalTeam: "K4F",
    role: "off",
    knownAliases: [
      "Alek", "aleke", "K4F Aleke", "K4F  Aleke",
    ],
  },

  // ===== FURY ROYAL =====
  {
    canonicalNickname: "MARTNA",
    canonicalTeam: "FURY ROYAL",
    role: "off",
    knownAliases: [
      "M4RTNA FURY", "MARTNA FURY", "Diana FURY", "Diana FURY",
    ],
  },
  // ... (continue para TODOS os jogadores que você reconhece)

  // ===== CMF ATLANTIC =====
  {
    canonicalNickname: "CMF Syx",
    canonicalTeam: "CMF ATLANTIC",
    role: "off",
    knownAliases: [
      "CMF Syx", "CMF Syx⁷", "CMF Syx7", "CMFSYX",
    ],
  },
  {
    canonicalNickname: "CMF Léo",
    canonicalTeam: "CMF ATLANTIC",
    role: "off",
    knownAliases: [
      "CMF Léo", "CMF Leo", "CMF Teo", "CMF Fallet",
    ],
  },
  {
    canonicalNickname: "CMF Moizo",
    canonicalTeam: "CMF ATLANTIC",
    role: "off",
    knownAliases: [
      "CMF MOIZO", "CMF M0IZO", "CMF Moizo", "CMF MOZKAXR",
    ],
  },
  // ... (continue)

  // ===== RED INSS =====
  {
    canonicalNickname: "RED snow777",
    canonicalTeam: "RED INSS",
    role: "off",
    knownAliases: [
      "REÐ snow777", "RED snow777", "REÐ Sunraku",
    ],
  },
  {
    canonicalNickname: "RED APENAS",
    canonicalTeam: "RED INSS",
    role: "off",
    knownAliases: [
      "RED APENAS", "REÐ APENAS", "REÐ Apenas", "RED- REZE",
    ],
  },
  {
    canonicalNickname: "RED Moraes",
    canonicalTeam: "RED INSS",
    role: "off",
    knownAliases: [
      "REÐ MoraesBC", "REÐ  MoraesBC", "RED moraesbc", "RED MORAES",
      "RED moraesbc", "RED MoraesBC",
    ],
  },
  // ... (continue)

  // ===== UGD LEGENDS =====
  {
    canonicalNickname: "Xoxoto",
    canonicalTeam: "UGD LEGENDS",
    role: "off",
    knownAliases: [
      "Xoxoto", "UGD Xoxoto", "UGD XOXOTO", "XOXOTO",
    ],
  },
  {
    canonicalNickname: "Santz",
    canonicalTeam: "UGD LEGENDS",
    role: "off",
    knownAliases: [
      "Santz", "UGD Santz", "UGD Santz⁷", "Sant", "Sant",
    ],
  },
  {
    canonicalNickname: "Buzeira",
    canonicalTeam: "UGD LEGENDS",
    role: "off",
    knownAliases: [
      "Buzeira", "UGD Buzeira",
    ],
  },
  {
    canonicalNickname: "Duardin",
    canonicalTeam: "UGD LEGENDS",
    role: "off",
    knownAliases: [
      "Duardin", "UGD Duardin",
    ],
  },
  {
    canonicalNickname: "Hell",
    canonicalTeam: "UGD LEGENDS",
    role: "off",
    knownAliases: [
      "Hell", "hell",
    ],
  },

  // ===== CPF VILTRUMITE =====
  {
    canonicalNickname: "Ice",
    canonicalTeam: "CPF VILTRUMITE",
    role: "off",
    knownAliases: [
      "Ice", "CPF ICE KILER",
    ],
  },
  {
    canonicalNickname: "Biscoito",
    canonicalTeam: "CPF VILTRUMITE",
    role: "off",
    knownAliases: [
      "Biscoito", "CPF BISCOITO",
    ],
  },
  // ... (continue para TODOS)
];

// ============================================================
// MAPEAMENTO DE TIMES
// ============================================================
interface TeamAliasEntry {
  canonicalName: string;
  knownAliases: string[];
}

const TEAM_ALIASES_DATA: TeamAliasEntry[] = [
  {
    canonicalName: "UGD Threat",
    knownAliases: [
      "UGD Threat", "UGD threat",
    ],
  },
  {
    canonicalName: "UGD LIGHT",
    knownAliases: [
      "UGD LIGHT", "UGD Light", "UGD light",
    ],
  },
  {
    canonicalName: "UGD LEGENDS",
    knownAliases: [
      "UGD Legends", "UGD LEGENDS", "UGD legends",
    ],
  },
  {
    canonicalName: "UGD OLYMPIQUE",
    knownAliases: [
      "UGD OLYMPIQUE", "UGD Olympique",
      "UGD Threat + Olympique",
      "UGD OLYMPIQUE / LEGENDS",
    ],
  },
  {
    canonicalName: "K4F",
    knownAliases: [
      "K4F", "k4F",
    ],
  },
  {
    canonicalName: "FURY ROYAL",
    knownAliases: [
      "FURY ROYAL", "FURY Royal", "FURY ROYAL / MIX (Line I)",
      "FURY MIX (ELITE / ROYAL)",
    ],
  },
  {
    canonicalName: "FURY ELITE",
    knownAliases: [
      "FURY ELITE", "FURY Elite",
      "FURY ELITE / MIX (Line H)",
    ],
  },
  {
    canonicalName: "FURY CASUAL",
    knownAliases: [
      "FURY CASUAL",
    ],
  },
  {
    canonicalName: "CMF ATLANTIC",
    knownAliases: [
      "CMF ATLANTIC", "CMF Atlantic",
    ],
  },
  {
    canonicalName: "CMF ASSALT",
    knownAliases: [
      "CMF ASSALT", "CMF Assalt",
    ],
  },
  {
    canonicalName: "RED INSS",
    knownAliases: [
      "RED INSS", "RED Inss", "RED", "REÐ", "REÐ Outlaws",
      "RED Magic BR",
    ],
  },
  {
    canonicalName: "CPF VILTRUMITE",
    knownAliases: [
      "CPF VILTRUMITE", "CPF Viltrumite",
    ],
  },
  {
    canonicalName: "Underground",
    knownAliases: [
      "Underground",
    ],
  },
  {
    canonicalName: "Dinasty Kingdom",
    knownAliases: [
      "Dinasty Kingdom",
    ],
  },
  {
    canonicalName: "EmE",
    knownAliases: [
      "EmE", "EME",
    ],
  },
  {
    canonicalName: "INF",
    knownAliases: [
      "INF", "「INF」",
    ],
  },
  {
    canonicalName: "LMF",
    knownAliases: [
      "LMF",
    ],
  },
  {
    canonicalName: "TROPA DO XXX",
    knownAliases: [
      "TROPA DO XXX", "TROPA DO XXX",
    ],
  },
  {
    canonicalName: "Eternity",
    knownAliases: [
      "Eternity",
    ],
  },
  {
    canonicalName: "KOV",
    knownAliases: [
      "KOV",
    ],
  },
  {
    canonicalName: "VØID STRIKE",
    knownAliases: [
      "♱VØID×STRIKE ANGEL",
    ],
  },
];

// ============================================================
// LÓGICA DO SEED
// ============================================================
export function seed() {
  const db = getDb();
  console.log("[SEED] Starting aliases seed...");

  // 1. Garantir que todos os times existam
  const allTeams = db.select().from(teams).all();
  const teamIdMap = new Map(allTeams.map(t => [t.name, t.id]));

  for (const teamEntry of TEAM_ALIASES_DATA) {
    let teamId = teamIdMap.get(teamEntry.canonicalName);
    if (!teamId) {
      // Criar o time se não existe
      const result = db.insert(teams).values({
        name: teamEntry.canonicalName,
        tag: teamEntry.canonicalName.substring(0, 3).toUpperCase(),
        status: "active",
      }).run();
      teamId = Number(result.lastInsertRowid);
      teamIdMap.set(teamEntry.canonicalName, teamId);
      console.log(`[SEED] Team created: ${teamEntry.canonicalName}`);
    }

    // Inserir aliases do time
    for (const alias of teamEntry.knownAliases) {
      const normalized = normalizeTeamName(alias);
      const existing = db.select().from(teamAliases)
        .where(eq(teamAliases.normalizedAlias, normalized)).get();
      if (!existing) {
        db.insert(teamAliases).values({
          teamId,
          alias,
          normalizedAlias: normalized,
          source: "manual",
        }).run();
      }
    }
  }

  // 2. Garantir que todos os jogadores existam
  const allPlayers = db.select().from(players).all();
  const playerIdMap = new Map(allPlayers.map(p => [p.nickname, p.id]));

  let playersCreated = 0;
  let aliasesCreated = 0;

  for (const entry of PLAYER_ALIASES_DATA) {
    const teamId = teamIdMap.get(entry.canonicalTeam);
    if (!teamId) {
      console.warn(`[SEED] Team not found: ${entry.canonicalTeam}`);
      continue;
    }

    const roleMap = { cap: "captain", off: "official", res: "reserve" } as const;

    // Criar jogador canonical se não existe
    let playerId = playerIdMap.get(entry.canonicalNickname);
    if (!playerId) {
      const result = db.insert(players).values({
        nickname: entry.canonicalNickname,
        teamId,
        role: roleMap[entry.role],
        isUnified: false,
      }).run();
      playerId = Number(result.lastInsertRowid);
      playerIdMap.set(entry.canonicalNickname, playerId);
      playersCreated++;
      console.log(`[SEED] Player created: ${entry.canonicalNickname} (${entry.canonicalTeam})`);
    }

    // Inserir aliases do jogador
    for (const alias of entry.knownAliases) {
      const normalized = normalizeNickname(alias);
      if (!normalized) continue; // Skip empty

      const existing = db.select().from(playerAliases)
        .where(eq(playerAliases.normalizedAlias, normalized)).get();
      if (!existing) {
        db.insert(playerAliases).values({
          playerId,
          alias,
          normalizedAlias: normalized,
          source: "manual",
          confidence: 100,
        }).run();
        aliasesCreated++;
      }
    }
  }

  console.log(`[SEED] ${playersCreated} players created, ${aliasesCreated} aliases created`);

  // Registrar seed run
  const seedName = "aliases-v1";
  const existingSeed = db.select().from(seedRuns).where(eq(seedRuns.seedName, seedName)).get();
  if (!existingSeed) {
    db.insert(seedRuns).values({ seedName }).run();
  }

  console.log("[SEED] Aliases seed completed!");
}