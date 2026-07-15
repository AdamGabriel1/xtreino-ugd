// db/seeds/seed-aliases.ts
// Adiciona jogadores e times no banco e cria os aliases para unificação
// ⚠️  Os nomes canônicos (nickname principal) e os times foram extraídos dos XTREINOS.

import { getDb } from "../../api/queries/connection.js";
import { players, teams, playerAliases, teamAliases, seedRuns } from "../schema.js";
import { eq } from "drizzle-orm";
import { normalizeNickname, normalizeTeamName } from "../utils/normalize.js";

// ============================================================
// MAPEAMENTO MANUAL: Jogadores → Times → Aliases (Base XTreinos)
// ============================================================
interface PlayerAliasEntry {
  canonicalNickname: string;
  canonicalTeam: string;
  role: "cap" | "off" | "res";
  knownAliases: string[];
}

const PLAYER_ALIASES_DATA: PlayerAliasEntry[] = [
  // ==========================================
  // UGD THREAT
  // ==========================================
  {
    canonicalNickname: "UGD Ares",
    canonicalTeam: "UGD Threat",
    role: "off",
    knownAliases: [
      "UGD Ares",
      "UGD cool7",
      "UGD cool⁷",
      "Cool",
      "Rivers AR"
    ],
  },
  {
    canonicalNickname: "UGD Kaze",
    canonicalTeam: "UGD Threat",
    role: "cap",
    knownAliases: [
      "UGD Kaze",
      "Kaze",
    ],
  },
  {
    canonicalNickname: "Treon",
    canonicalTeam: "UGD Threat",
    role: "off",
    knownAliases: [
      "UGD Treon",
      "Treon",
      "treon",
      "UGD treon",
    ],
  },
  {
    canonicalNickname: "UGD ARISE⁷",
    canonicalTeam: "UGD Threat",
    role: "off",
    knownAliases: [
      "UGD ARISE",
      "Arise",
      "ARISE",
      "UGD ARISE⁷",
    ],
  },
  {
    canonicalNickname: "UGD Sant⁷",
    canonicalTeam: "UGD Threat",
    role: "off",
    knownAliases: [
      "UGD Neo",
      "UGD Santz",
      "UGD Sant",
      "Sant",
      "Neo",
      "Santz",
      "UGD Santz⁷",
      "Santz⁷",
      "UGD Illusion",
      "Illusion",
      "UGD Sant⁷",
    ],
  },
  {
    canonicalNickname: "UGD LOREX",
    canonicalTeam: "UGD Threat",
    role: "off",
    knownAliases: [
      "Lorex",
      "LOREX",
      "UGD LOREX",
    ],
  },

  // ==========================================
  // UGD LIGHT
  // ==========================================
  {
    canonicalNickname: "Kyz",
    canonicalTeam: "UGD LIGHT",
    role: "off",
    knownAliases: [
      "UGD Kyz",
      "Kyz",
      "UGD Kyz`",
      "Dopped",
    ],
  },
  {
    canonicalNickname: "Zen",
    canonicalTeam: "UGD LIGHT",
    role: "off",
    knownAliases: [
      "Zann",
      "Xezn⁷",
      "Xezn'",
      "Xenz",
    ],
  },
  {
    canonicalNickname: "Psych",
    canonicalTeam: "UGD LIGHT",
    role: "off",
    knownAliases: [
      "UGD Psycho",
      "Psycho",
      "UGD Psych",
    ],
  },
  {
    canonicalNickname: "Sike",
    canonicalTeam: "UGD LIGHT",
    role: "off",
    knownAliases: [
      "UGD Sike",
      "Sike",
    ],
  },
  {
    canonicalNickname: "Chrisxz",
    canonicalTeam: "UGD LIGHT",
    role: "off",
    knownAliases: [
      "Chrisxz",
    ],
  },
  {
    canonicalNickname: "Chino",
    canonicalTeam: "UGD LIGHT",
    role: "off",
    knownAliases: [
      "Chino",
    ],
  },
  {
    canonicalNickname: "Hz",
    canonicalTeam: "UGD LIGHT",
    role: "off",
    knownAliases: [
      "Hz",
    ],
  },
  {
    canonicalNickname: "Jem",
    canonicalTeam: "UGD LIGHT",
    role: "off",
    knownAliases: [
      "UGD JEM",
    ],
  },
  {
    canonicalNickname: "UGD Psycho",
    canonicalTeam: "UGD LIGHT",
    role: "off",
    knownAliases: [
      "UGD Psycho",
    ],
  },
  {
    canonicalNickname: "UGD Zann",
    canonicalTeam: "UGD LIGHT",
    role: "off",
    knownAliases: [
      "UGD Zann",
    ],
  },
  {
    canonicalNickname: "Kyznpoo",
    canonicalTeam: "UGD LIGHT",
    role: "off",
    knownAliases: [
      "Kyznpoo",
    ],
  },
  {
    canonicalNickname: "Glock 5s",
    canonicalTeam: "UGD LIGHT",
    role: "off",
    knownAliases: [
      "Glock 5s",
    ],
  },
  {
    canonicalNickname: "death",
    canonicalTeam: "UGD LIGHT",
    role: "off",
    knownAliases: [
      "DEATH",
      "death"
    ],
  },
  {
    canonicalNickname: "I miss her",
    canonicalTeam: "UGD LIGHT",
    role: "off",
    knownAliases: ["I miss her"],
  },
  {
    canonicalNickname: "GEN.iDrxp_Wy",
    canonicalTeam: "UGD LIGHT",
    role: "off",
    knownAliases: ["GEN.iDrxp_Wy"],
  },
  {
    canonicalNickname: "『OKT』Lilith♡",
    canonicalTeam: "UGD LIGHT",
    role: "off",
    knownAliases: ["『OKT』Lilith♡", "Lilith♡"],
  },
  {
    canonicalNickname: "UGD Vexor",
    canonicalTeam: "UGD LIGHT",
    role: "off",
    knownAliases: ["UGD Vexor", "Vexor"],
  },
  
  // ==========================================
  // UGD LEGENDS
  // ==========================================
  {
    canonicalNickname: "Xoxoto",
    canonicalTeam: "UGD LEGENDS",
    role: "off",
    knownAliases: [
      "Xoxoto",
      "UGD Xoxoto",
      "UGD XOXOTO",
      "XOXOTO",
    ],
  },
  {
    canonicalNickname: "Buzeira",
    canonicalTeam: "UGD LEGENDS",
    role: "off",
    knownAliases: [
      "Buzeira",
      "UGD Buzeira",
    ],
  },
  {
    canonicalNickname: "Duardin",
    canonicalTeam: "UGD LEGENDS",
    role: "off",
    knownAliases: [
      "Duardin",
      "UGD Duardin",
    ],
  },
  {
    canonicalNickname: "Ohara",
    canonicalTeam: "UGD LEGENDS",
    role: "off",
    knownAliases: [
      "Ohara",
      "UGD Ohara",
    ],
  },
  {
    canonicalNickname: "qgc",
    canonicalTeam: "UGD LEGENDS",
    role: "off",
    knownAliases: [
      "qgc.",
      "Gabriel qgc",
      "qgc",
    ],
  },
  {
    canonicalNickname: "Blaze",
    canonicalTeam: "UGD LEGENDS",
    role: "off",
    knownAliases: [
      "CF BLAZE",
      "Blaze",
    ],
  },
  {
    canonicalNickname: "Hyuga",
    canonicalTeam: "UGD LEGENDS",
    role: "off",
    knownAliases: [
      "Hyuga⁷",
    ],
  },
  {
    canonicalNickname: "Daisy",
    canonicalTeam: "UGD LEGENDS",
    role: "off",
    knownAliases: [
      "Daisy",
    ],
  },
  {
    canonicalNickname: "UGD KITOZ",
    canonicalTeam: "UGD LEGENDS",
    role: "off",
    knownAliases: [
      "UGD KITOZ",
    ],
  },

  // ==========================================
  // UGD OLYMPIQUE
  // ==========================================
  {
    canonicalNickname: "Weenot",
    canonicalTeam: "UGD OLYMPIQUE",
    role: "off",
    knownAliases: [
      "Weenot",
      "UGD Weenot",
    ],
  },
  {
    canonicalNickname: "Cants",
    canonicalTeam: "UGD OLYMPIQUE",
    role: "off",
    knownAliases: [
      "Cants",
    ],
  },
  {
    canonicalNickname: "Striker",
    canonicalTeam: "UGD OLYMPIQUE",
    role: "off",
    knownAliases: [
      "Striker",
    ],
  },

  // ==========================================
  // UGD CASUAL
  // ==========================================
  {
    canonicalNickname: "UGD DRAKON",
    canonicalTeam: "UGD CASUAL",
    role: "off",
    knownAliases: [
      "UGD DRAKØN",
      "UGD DRAKON"
    ],
  },
  {
    canonicalNickname: "UGD judas",
    canonicalTeam: "UGD CASUAL",
    role: "off",
    knownAliases: [
      "UGD judas",
    ],
  },
  {
    canonicalNickname: "sean_021💤🐍",
    canonicalTeam: "UGD CASUAL",
    role: "off",
    knownAliases: [
      "UGD SEAN021",
      "sean_021",
      "sean_021💤🐍",
    ],
  },
  {
    canonicalNickname: "UGD Thz⁷",
    canonicalTeam: "UGD CASUAL",
    role: "off",
    knownAliases: [
      "UGD Thz⁷",
    ],
  },
  {
    canonicalNickname: "UGD A2",
    canonicalTeam: "UGD CASUAL",
    role: "off",
    knownAliases: [
      "UGD A2",
    ],
  },
  {
    canonicalNickname: "Noway_7",
    canonicalTeam: "UGD CASUAL",
    role: "off",
    knownAliases: ["Noway_7"],
  },
  {
    canonicalNickname: "yurizz FURY",
    canonicalTeam: "UGD CASUAL",
    role: "off",
    knownAliases: ["yurizz FURY"],
  },
  {
    canonicalNickname: "UGD hell⁷",
    canonicalTeam: "UGD CASUAL",
    role: "off",
    knownAliases: [
      "Hell",
      "hell",
      "UGD hell⁷",
    ],
  },

  // ==========================================
  // UGD ROYAL (X1 - XTreino 1)
  // ==========================================
  {
    canonicalNickname: "Z",
    canonicalTeam: "UGD Royal",
    role: "off",
    knownAliases: [
      "UGD Z",
    ],
  },
  {
    canonicalNickname: "Dexz",
    canonicalTeam: "UGD Royal",
    role: "off",
    knownAliases: [
      "Dexz",
    ],
  },
  {
    canonicalNickname: "MayaZ",
    canonicalTeam: "UGD Royal",
    role: "off",
    knownAliases: [
      "MayaZ",
    ],
  },
  {
    canonicalNickname: "OFFz",
    canonicalTeam: "UGD Royal",
    role: "off",
    knownAliases: [
      "OFFz",
      "OFF",
    ],
  },

  // ==========================================
  // FURY ROYAL
  // ==========================================
  {
    canonicalNickname: "MARTNA",
    canonicalTeam: "FURY ROYAL",
    role: "off",
    knownAliases: [
      "MARTNA",
      "M4RTNA FURY",
    ],
  },
  {
    canonicalNickname: "VN",
    canonicalTeam: "FURY ROYAL",
    role: "off",
    knownAliases: [
      "VN",
      "VN' FURY",
      "VN FURY",
    ],
  },
  {
    canonicalNickname: "EGOIST",
    canonicalTeam: "FURY ROYAL",
    role: "off",
    knownAliases: [
      "EGOIST",
      "Egoist",
      "Egoist FURY",
      "EGOIST FURY",
    ],
  },
  {
    canonicalNickname: "NOKI",
    canonicalTeam: "FURY ROYAL",
    role: "off",
    knownAliases: [
      "NOKI",
      "NOKI FURY",
    ],
  },
  {
    canonicalNickname: "NG",
    canonicalTeam: "FURY ROYAL",
    role: "off",
    knownAliases: [
      "NG",
      "NGLIFE FURY",
    ],
  },
  {
    canonicalNickname: "Sun FURY",
    canonicalTeam: "FURY ROYAL",
    role: "off",
    knownAliases: [
      "Sun FURY",
    ],
  },
  {
    canonicalNickname: "Noteskz",
    canonicalTeam: "FURY ROYAL",
    role: "off",
    knownAliases: [
      "Noteskz",
    ],
  },
  {
    canonicalNickname: "two'sguxta",
    canonicalTeam: "FURY ROYAL",
    role: "off",
    knownAliases: [
      "two'sguxta⁷",
    ],
  },

  // ==========================================
  // FURY ELITE
  // ==========================================
  {
    canonicalNickname: "it's FURY",
    canonicalTeam: "FURY ELITE",
    role: "off",
    knownAliases: ["it's FURY"],
  },
  {
    canonicalNickname: "DIANA",
    canonicalTeam: "FURY ELITE",
    role: "off",
    knownAliases: [
      "DIANA",
      "Diana FURY",
      "DIANA FURY",
    ],
  },
  {
    canonicalNickname: "RAUAN",
    canonicalTeam: "FURY ELITE",
    role: "off",
    knownAliases: [
      "RAUAN",
      "Rauan FURY",
    ],
  },
  {
    canonicalNickname: "Dexz FURY",
    canonicalTeam: "FURY ELITE",
    role: "off",
    knownAliases: [
      "DEXZ",
      "DEX",
      "Dexz⁷ᴿʸᴸ",
      "Dexz⁷RYL",
      "Dexz7RYL",
      "Dexz²RYL",
      "Dexz RYL",
      "Dexz FURY",
    ],
  },
  {
    canonicalNickname: "TRY",
    canonicalTeam: "FURY ELITE",
    role: "off",
    knownAliases: [
      "TRY",
      "try FURY",
    ],
  },
  {
    canonicalNickname: "SUN",
    canonicalTeam: "FURY ELITE",
    role: "off",
    knownAliases: [
      "SUN",
    ],
  },
  {
    canonicalNickname: "HLUYDEX",
    canonicalTeam: "FURY ELITE",
    role: "off",
    knownAliases: [
      "hluydex",
      "HLUYDEX",
    ],
  },
  {
    canonicalNickname: "B4RBOSA",
    canonicalTeam: "FURY ELITE",
    role: "off",
    knownAliases: [
      "B4RBOSA⁷",
    ],
  },
  {
    canonicalNickname: "SLUUG",
    canonicalTeam: "FURY ELITE",
    role: "off",
    knownAliases: [
      "SLUUG",
    ],
  },
  {
    canonicalNickname: "KAY",
    canonicalTeam: "FURY ELITE",
    role: "off",
    knownAliases: [
      "KAY",
    ],
  },
  {
    canonicalNickname: "V0XEN",
    canonicalTeam: "FURY ELITE",
    role: "off",
    knownAliases: [
      "V0XEN!",
    ],
  },
  {
    canonicalNickname: "TENEBR",
    canonicalTeam: "FURY ELITE",
    role: "off",
    knownAliases: [
      "TENEBR FURY",
    ],
  },
  {
    canonicalNickname: "Alpha FURY",
    canonicalTeam: "FURY ELITE",
    role: "off",
    knownAliases: ["Alpha FURY"],
  },
  {
    canonicalNickname: "AZRAEL FURY",
    canonicalTeam: "FURY ELITE",
    role: "off",
    knownAliases: ["AZRAEL FURY"],
  },

  // ==========================================
  // FURY CASUAL
  // ==========================================
  {
    canonicalNickname: "Akyra",
    canonicalTeam: "FURY CASUAL",
    role: "off",
    knownAliases: [
      "AM Akyra🥷",
    ],
  },
  {
    canonicalNickname: "zLAZY",
    canonicalTeam: "FURY CASUAL",
    role: "off",
    knownAliases: [
      "FURY zLAZY⁰¹",
      "FURY zLAZY",
    ],
  },
  {
    canonicalNickname: "LK NPC",
    canonicalTeam: "FURY CASUAL",
    role: "off",
    knownAliases: [
      "LK NPC",
    ],
  },
  {
    canonicalNickname: "zLORHAN",
    canonicalTeam: "FURY CASUAL",
    role: "off",
    knownAliases: [
      "FURY zLORHAN",
    ],
  },
  {
    canonicalNickname: "KILLUA",
    canonicalTeam: "FURY CASUAL",
    role: "off",
    knownAliases: [
      "KILLUA",
    ],
  },
  {
    canonicalNickname: "VELOZZO",
    canonicalTeam: "FURY CASUAL",
    role: "off",
    knownAliases: [
      "VELOZZO",
    ],
  },

  // ==========================================
  // FURY (X1 e X2 - Antes de dividir)
  // ==========================================
  {
    canonicalNickname: "Creedz",
    canonicalTeam: "FURY",
    role: "off",
    knownAliases: [
      "Creedz FURY",
    ],
  },
  {
    canonicalNickname: "perfection z",
    canonicalTeam: "FURY",
    role: "off",
    knownAliases: [
      "perfection z",
    ],
  },

  // ==========================================
  // CMF ATLANTIC
  // ==========================================
  {
    canonicalNickname: "CMF Syx",
    canonicalTeam: "CMF ATLANTIC",
    role: "off",
    knownAliases: [
      "CMF Syx",
      "CMF Syx⁷",
      "CMF Syx7",
    ],
  },
  {
    canonicalNickname: "CMF Léo",
    canonicalTeam: "CMF ATLANTIC",
    role: "off",
    knownAliases: [
      "CMF Leo",
      "CMF Léo",
      "CMF Teo",
    ],
  },
  {
    canonicalNickname: "CMF Moizo",
    canonicalTeam: "CMF ATLANTIC",
    role: "off",
    knownAliases: [
      "CMF MOIZO",
      "CMF M0IZO",
      "CMF Moizo",
    ],
  },
  {
    canonicalNickname: "CMF Kira",
    canonicalTeam: "CMF ATLANTIC",
    role: "off",
    knownAliases: [
      "CMF Kira",
      "CMF KIRA",
      "CMF KIRAΛ新神",
    ],
  },
  {
    canonicalNickname: "CMF Fallet",
    canonicalTeam: "CMF ATLANTIC",
    role: "off",
    knownAliases: [
      "CMF Fallet",
    ],
  },
  {
    canonicalNickname: "CMF Sant",
    canonicalTeam: "CMF ATLANTIC",
    role: "off",
    knownAliases: [
      "CMF Sant",
      "CMF SANT",
    ],
  },
  {
    canonicalNickname: "CMF MOZKA",
    canonicalTeam: "CMF ATLANTIC",
    role: "off",
    knownAliases: [
      "CMF MOZKA",
      "CMF MOZKAXR",
    ],
  },
  {
    canonicalNickname: "CMF Smoke",
    canonicalTeam: "CMF ATLANTIC",
    role: "off",
    knownAliases: [
      "CMF Smoke",
      "CMF SMOKE",
    ],
  },
  {
    canonicalNickname: "CMF Hisoka",
    canonicalTeam: "CMF ATLANTIC",
    role: "off",
    knownAliases: [
      "CMF HISOKA",
      "CMF Hisoka",
    ],
  },
  {
    canonicalNickname: "CMF MUUH",
    canonicalTeam: "CMF ATLANTIC",
    role: "off",
    knownAliases: ["CMF MUUH"],
  },

  // ==========================================
  // CMF ASSALT
  // ==========================================
  {
    canonicalNickname: "CMF Txxz",
    canonicalTeam: "CMF ASSALT",
    role: "off",
    knownAliases: [
      "CMF Txxz¹",
    ],
  },
  {
    canonicalNickname: "CMF xeW",
    canonicalTeam: "CMF ASSALT",
    role: "off",
    knownAliases: [
      "CMF xeW",
      "CMF xeM",
    ],
  },
  {
    canonicalNickname: "CMF BAELTTK",
    canonicalTeam: "CMF ASSALT",
    role: "off",
    knownAliases: [
      "CMF BAELTTK",
    ],
  },
  {
    canonicalNickname: "CMF Nyx",
    canonicalTeam: "CMF ASSALT",
    role: "off",
    knownAliases: [
      "CMF Lyx7",
      "cmflyx7",
      "lyx7",
      "CMF Nyx",
    ],
  },
  {
    canonicalNickname: "CMF Dnvy⁷",
    canonicalTeam: "CMF ASSALT",
    role: "off",
    knownAliases: [
      "CMF Dnvy",
      "CMF Dnvy⁷",
    ],
  },
  {
    canonicalNickname: "CMF Max",
    canonicalTeam: "CMF ASSALT",
    role: "off",
    knownAliases: [
      "CMF Max",
    ],
  },
  {
    canonicalNickname: "CMF Thxxxz",
    canonicalTeam: "CMF ASSALT",
    role: "off",
    knownAliases: [
      "CMF Thxxxz",
    ],
  },
  {
    canonicalNickname: "Artur",
    canonicalTeam: "CMF ASSALT",
    role: "off",
    knownAliases: [
      "Artur",
    ],
  },
  {
    canonicalNickname: "MacroSync",
    canonicalTeam: "CMF ASSALT",
    role: "off",
    knownAliases: [
      "MacroSync",
    ],
  },
  {
    canonicalNickname: "omar",
    canonicalTeam: "CMF ASSALT",
    role: "off",
    knownAliases: ["omar"],
  },
  {
    canonicalNickname: "CMF D2Efps",
    canonicalTeam: "CMF ASSALT",
    role: "off",
    knownAliases: ["CMF D2Efps"],
  },
  {
    canonicalNickname: "CMF OMAR",
    canonicalTeam: "CMF ASSALT",
    role: "off",
    knownAliases: ["CMF OMAR", "omar"],
  },
  {
    canonicalNickname: "CMF CLEUTIN",
    canonicalTeam: "CMF ASSALT",
    role: "off",
    knownAliases: ["CMF CLEUTIN"],
  },
  {
    canonicalNickname: "CMF SMOKE",
    canonicalTeam: "CMF ASSALT",
    role: "off",
    knownAliases: ["CMF SMOKE", "CMF Smoke"],
  },

  // ==========================================
  // CMF (Antes de dividir - X1 a X4)
  // ==========================================
  {
    canonicalNickname: "CMF Stygian",
    canonicalTeam: "CMF",
    role: "off",
    knownAliases: [
      "CMF Stygian",
    ],
  },

  // ==========================================
  // RED INSS
  // ==========================================
  {
    canonicalNickname: "RED snow777",
    canonicalTeam: "RED INSS",
    role: "off",
    knownAliases: [
      "REÐ snow777",
      "RED snow777",
      "REÐ Sunraku",
    ],
  },
  {
    canonicalNickname: "RED iVERONz",
    canonicalTeam: "HAVK'z",
    role: "off",
    knownAliases: [
      "REÐ APENAS",
      "RED APENAS",
      "REÐ Apenas",
      "RED- REZE",
      "RED iVERONz",
      "RED IVERON",
      "VERON",
      "veron",
    ],
  },
  {
    canonicalNickname: "RED Moraes",
    canonicalTeam: "RED INSS",
    role: "off",
    knownAliases: [
      "REÐ MoraesBC",
      "REÐ  MoraesBC",
      "RED moraesbc",
      "RED MORAES",
      "RED MoraesBC",
    ],
  },
  {
    canonicalNickname: "RED Felpz",
    canonicalTeam: "RED INSS",
    role: "off",
    knownAliases: [
      "REÐ Felpz",
      "REÐ  Felpz",
      "RED FELPZ",
    ],
  },
  {
    canonicalNickname: "RED Skibidi",
    canonicalTeam: "RED INSS",
    role: "off",
    knownAliases: [
      "REÐ Skibidi",
      "REÐ  Skibidi",
    ],
  },
  {
    canonicalNickname: "RED LΘRD",
    canonicalTeam: "RED INSS",
    role: "off",
    knownAliases: [
      "RED LORD",
      "RED LΘRD",
    ],
  },
  {
    canonicalNickname: "valha",
    canonicalTeam: "RED INSS",
    role: "off",
    knownAliases: [
      "valha",
    ],
  },
  {
    canonicalNickname: "trenzinxrc",
    canonicalTeam: "RED INSS",
    role: "off",
    knownAliases: [
      "trenzinxrc",
    ],
  },
  {
    canonicalNickname: "yKWIM¿",
    canonicalTeam: "RED INSS",
    role: "off",
    knownAliases: [
      "yKWIM¿",
      "yKWIM",
    ],
  },
  {
    canonicalNickname: "ATREUS",
    canonicalTeam: "RED INSS",
    role: "off",
    knownAliases: [
      "ATREUS",
    ],
  },
  {
    canonicalNickname: "RED Thaedus",
    canonicalTeam: "RED INSS",
    role: "off",
    knownAliases: [
      "RED Thaedus⁷",
    ],
  },
  {
    canonicalNickname: "RED MOREIRA",
    canonicalTeam: "RED INSS",
    role: "off",
    knownAliases: [
      "RED-MOREIRA",
    ],
  },
  {
    canonicalNickname: "RED Alemão",
    canonicalTeam: "RED INSS",
    role: "off",
    knownAliases: [
      "RED-Alemão",
    ],
  },
  {
    canonicalNickname: "RED marquesbc",
    canonicalTeam: "RED INSS",
    role: "off",
    knownAliases: [
      "RED marquesbc",
    ],
  },
  {
    canonicalNickname: "FUR next",
    canonicalTeam: "RED INSS",
    role: "off",
    knownAliases: [
      "FUR next",
    ],
  },
  {
    canonicalNickname: "RED GOAT",
    canonicalTeam: "RED INSS",
    role: "off",
    knownAliases: ["RED GOAT"],
  },
  {
    canonicalNickname: "AR TIAGO",
    canonicalTeam: "RED INSS",
    role: "off",
    knownAliases: ["AR TIAGO"],
  },
  {
    canonicalNickname: "ODR S4NTLEVS",
    canonicalTeam: "RED INSS",
    role: "off",
    knownAliases: ["ODR S4NTLEVS"],
  },

  // ==========================================
  // RED (Antes de virar INSS - X1 a X4)
  // ==========================================
  {
    canonicalNickname: "REÐ LANGØ",
    canonicalTeam: "RED",
    role: "off",
    knownAliases: [
      "REÐ LANGØ",
      "RED LANGO",
    ],
  },
  {
    canonicalNickname: "REÐ Zadock",
    canonicalTeam: "RED",
    role: "off",
    knownAliases: [
      "REÐ Zadock",
    ],
  },
  {
    canonicalNickname: "REÐ M4RTINA",
    canonicalTeam: "RED",
    role: "off",
    knownAliases: [
      "REÐ M4RTINA",
    ],
  },
  {
    canonicalNickname: "ASTRO",
    canonicalTeam: "RED",
    role: "off",
    knownAliases: [
      "ASTRO",
    ],
  },
  {
    canonicalNickname: "RED REZE",
    canonicalTeam: "RED",
    role: "off",
    knownAliases: [
      "RED REZE",
    ],
  },
  {
    canonicalNickname: "CF ALMEIDA",
    canonicalTeam: "RED",
    role: "off",
    knownAliases: [
      "CF ALMEIDA",
    ],
  },
  {
    canonicalNickname: "RED KENNZY",
    canonicalTeam: "RED",
    role: "off",
    knownAliases: [
      "RED KENNZY",
    ],
  },
  {
    canonicalNickname: "MOL ADRIAN",
    canonicalTeam: "RED",
    role: "off",
    knownAliases: [
      "MOL ADRIAN",
    ],
  },
  {
    canonicalNickname: "LXELTINHO",
    canonicalTeam: "RED",
    role: "off",
    knownAliases: [
      "LXELTINHO",
    ],
  },
  {
    canonicalNickname: "RED aces",
    canonicalTeam: "RED INSS",
    role: "off",
    knownAliases: ["RED aces"],
  },
  {
    canonicalNickname: "RED-Zenon",
    canonicalTeam: "RED INSS",
    role: "off",
    knownAliases: ["RED-Zenon"],
  },

  // ==========================================
  // K4F
  // ==========================================
  {
    canonicalNickname: "K4F Zaza",
    canonicalTeam: "K4F",
    role: "off",
    knownAliases: [
      "K4F  Zaza",
      "K4F zaza",
      "K4F ZAZA",
      "K4F Zaza",
      "Zaza",
      "zaza",
      "ZAZA",
    ],
  },
  {
    canonicalNickname: "K4F Nine",
    canonicalTeam: "K4F",
    role: "off",
    knownAliases: [
      "K4F nine",
      "K4F  Nine",
      "K4F NINE",
      "K4F Nine",
      "Nine",
      "nine",
      "NINE",
    ],
  },
  {
    canonicalNickname: "K4F Guilok07",
    canonicalTeam: "K4F",
    role: "off",
    knownAliases: [
      "K4F gui",
      "K4F  Gui",
      "K4F GUI",
      "Guilok07",
      "K4F Guilok07",
    ],
  },
  {
    canonicalNickname: "K4F ÉoUrso🐻",
    canonicalTeam: "K4F",
    role: "off",
    knownAliases: [
      "k4F urso",
      "K4F  Éourso",
      "K4F ÉoUrso",
      "K4F Éourso",
      "K4F ÉOurso",
      "Éourso",
      "K4F EruKramo",
      "K4F ExuKramo",
      "K4F ÉoUrso🐻",
    ],
  },
  {
    canonicalNickname: "K4F Wendxz",
    canonicalTeam: "K4F",
    role: "off",
    knownAliases: [
      "wend",
      "Wend",
      "NyE Wendxz",
      "Wendxz",
      "K4F Wendxz",
    ],
  },
  {
    canonicalNickname: "K4F KISE",
    canonicalTeam: "K4F",
    role: "off",
    knownAliases: ["K4F KISE", "KISE"],
  },
  {
    canonicalNickname: "K4F Alek",
    canonicalTeam: "K4F",
    role: "off",
    knownAliases: [
      "Alek",
      "aleke",
      "K4F Aleke",
      "K4F  Aleke",
    ],
  },
  {
    canonicalNickname: "K4F DUDU",
    canonicalTeam: "K4F",
    role: "off",
    knownAliases: [
      "K4F DUDU",
      "K4F Dudu",
      "DUDU",
      "dudu",
    ],
  },
  {
    canonicalNickname: "K4F KISE",
    canonicalTeam: "K4F",
    role: "off",
    knownAliases: [
      "K4F KISE",
      "KISE",
    ],
  },
  {
    canonicalNickname: "K4F LUCAO",
    canonicalTeam: "K4F",
    role: "off",
    knownAliases: [
      "K4F LUCAO",
      "LUCAO",
      "lucao",
    ],
  },
  {
    canonicalNickname: "K4F Lynx",
    canonicalTeam: "K4F",
    role: "off",
    knownAliases: ["K4F Lynx"],
  },
  {
    canonicalNickname: "K4F BOT?",
    canonicalTeam: "K4F",
    role: "off",
    knownAliases: ["K4F BOT?"],
  },

  // ==========================================
  // EME
  // ==========================================
  {
    canonicalNickname: "Yeezy",
    canonicalTeam: "EmE",
    role: "off",
    knownAliases: [
      "Yeezy",
    ],
  },
  {
    canonicalNickname: "geldeysito",
    canonicalTeam: "EmE",
    role: "off",
    knownAliases: [
      "geldeysito",
    ],
  },
  {
    canonicalNickname: "EME Akaza",
    canonicalTeam: "EmE",
    role: "off",
    knownAliases: [
      "EME々Akaza",
      "akaza",
    ],
  },
  {
    canonicalNickname: "EME Lulu",
    canonicalTeam: "EmE",
    role: "off",
    knownAliases: [
      "EME々Lulu",
      "lulu",
    ],
  },
  {
    canonicalNickname: "MK4",
    canonicalTeam: "EmE",
    role: "off",
    knownAliases: [
      "MK4",
    ],
  },
  {
    canonicalNickname: "Nofear",
    canonicalTeam: "EmE",
    role: "off",
    knownAliases: [
      "Nofear",
      "Nofear'",
      "Nofear⁷",
      "nofear",
    ],
  },
  {
    canonicalNickname: "EME々Notfear'",
    canonicalTeam: "EmE",
    role: "off",
    knownAliases: [
      "EME々Notfear'",
      "notfear",
    ],
  },
  {
    canonicalNickname: "EE々Drz7",
    canonicalTeam: "EmE",
    role: "off",
    knownAliases: [
      "EME々Drz7",
      "drz7",
    ],
  },
  {
    canonicalNickname: "LMF_Boy7",
    canonicalTeam: "EmE",
    role: "off",
    knownAliases: [
      "LMF_Boy7",
      "boy7",
    ],
  },
  {
    canonicalNickname: "EME々Swift7",
    canonicalTeam: "EmE",
    role: "off",
    knownAliases: [
      "EME々Swift7",
      "swift7",
    ],
  },
  {
    canonicalNickname: "Pain",
    canonicalTeam: "EME",
    role: "off",
    knownAliases: ["Pain"],
  },
  {
    canonicalNickname: "FROSTX",
    canonicalTeam: "EME",
    role: "off",
    knownAliases: ["FROSTX"],
  },
  {
    canonicalNickname: "Jtpe' ✞",
    canonicalTeam: "EME",
    role: "off",
    knownAliases: ["Jtpe' ✞"],
  },

  // ==========================================
  // INF
  // ==========================================
  {
    canonicalNickname: "INF Noxz7",
    canonicalTeam: "INF",
    role: "off",
    knownAliases: [
      "「INF」Noxz7'",
      "INF Noxz7",
    ],
  },
  {
    canonicalNickname: "INF RINNEGA",
    canonicalTeam: "INF",
    role: "off",
    knownAliases: [
      "「INF」RINNEGA",
      "INF RINNEGA",
    ],
  },
  {
    canonicalNickname: "INF BLAZE",
    canonicalTeam: "INF",
    role: "off",
    knownAliases: [
      "「INF」BLAZE",
      "INF BLAZE",
    ],
  },
  {
    canonicalNickname: "INF GOAT",
    canonicalTeam: "INF",
    role: "off",
    knownAliases: [
      "「INF」GOAT",
      "INF GOAT",
    ],
  },
  {
    canonicalNickname: "INF RONY",
    canonicalTeam: "INF",
    role: "off",
    knownAliases: [
      "INF RONY",
    ],
  },
  {
    canonicalNickname: "INF BADBOY",
    canonicalTeam: "INF",
    role: "off",
    knownAliases: [
      "INF BADBOY",
    ],
  },
  {
    canonicalNickname: "INF BARONI",
    canonicalTeam: "INF",
    role: "off",
    knownAliases: [
      "INF BARONI",
    ],
  },

  // ==========================================
  // LMF
  // ==========================================
  {
    canonicalNickname: "LMF_Boss",
    canonicalTeam: "LMF",
    role: "off",
    knownAliases: [
      "LMF_Boss",
      "LMF_BOSS",
      "LMF Boss",
    ],
  },
  {
    canonicalNickname: "LMF_mtfacil",
    canonicalTeam: "LMF",
    role: "off",
    knownAliases: [
      "LMF_mtfacil",
      "LMF mtfacil",
    ],
  },
  {
    canonicalNickname: "LMF_XIT",
    canonicalTeam: "LMF",
    role: "off",
    knownAliases: [
      "LMF_XIT",
      "LMF XIT",
    ],
  },
  {
    canonicalNickname: "LMF_RICHIMO",
    canonicalTeam: "LMF",
    role: "off",
    knownAliases: [
      "LMF_RICHIMO",
      "LMF RICHIMO",
    ],
  },
  {
    canonicalNickname: "LMF_LACERDA",
    canonicalTeam: "LMF",
    role: "off",
    knownAliases: [
      "LMF_LACERDA",
      "LMF LACERDA",
    ],
  },
  {
    canonicalNickname: "LMF CALOP12",
    canonicalTeam: "LMF",
    role: "off",
    knownAliases: [
      "LMF CALOP12",
    ],
  },
  {
    canonicalNickname: "CEIFADOR-ZXc",
    canonicalTeam: "LMF",
    role: "off",
    knownAliases: ["CEIFADOR-ZXc"],
  },

  // ==========================================
  // ETERNITY
  // ==========================================
  {
    canonicalNickname: "Muggle",
    canonicalTeam: "Eternity",
    role: "off",
    knownAliases: [
      "Muggle 永",
      "Muggle",
    ],
  },
  {
    canonicalNickname: "Damøn TTK",
    canonicalTeam: "Eternity",
    role: "off",
    knownAliases: [
      "DamønTTK 永",
      "Damøn.TTK",
    ],
  },
  {
    canonicalNickname: "Black",
    canonicalTeam: "Eternity",
    role: "off",
    knownAliases: [
      "Black 永",
    ],
  },
  {
    canonicalNickname: "Givas'xX",
    canonicalTeam: "Eternity",
    role: "off",
    knownAliases: [
      "Givas'xX 永",
    ],
  },
  {
    canonicalNickname: "Kennedy",
    canonicalTeam: "Eternity",
    role: "off",
    knownAliases: [
      "Kennedy",
    ],
  },
  {
    canonicalNickname: "Shxrk",
    canonicalTeam: "Eternity",
    role: "off",
    knownAliases: [
      "Shxrk",
    ],
  },

  // ==========================================
  // KOV
  // ==========================================
  {
    canonicalNickname: "KOV FushyX",
    canonicalTeam: "KOV",
    role: "off",
    knownAliases: [
      "KOV FushyX",
    ],
  },
  {
    canonicalNickname: "KOV ADAN",
    canonicalTeam: "KOV",
    role: "off",
    knownAliases: [
      "KOV ADAN",
    ],
  },
  {
    canonicalNickname: "TTKKAIKE",
    canonicalTeam: "KOV",
    role: "off",
    knownAliases: [
      "TTKKAIKE",
    ],
  },
  {
    canonicalNickname: "KOV ALONE",
    canonicalTeam: "KOV",
    role: "off",
    knownAliases: [
      "KOV ALONE",
    ],
  },
  {
    canonicalNickname: "YoSurper",
    canonicalTeam: "KOV",
    role: "off",
    knownAliases: [
      "YoSurper",
    ],
  },

  // ==========================================
  // CPF VILTRUMITE
  // ==========================================
  {
    canonicalNickname: "Ice",
    canonicalTeam: "CPF VILTRUMITE",
    role: "off",
    knownAliases: [
      "Ice",
      "CPF ICE KILER",
    ],
  },
  {
    canonicalNickname: "Biscoito",
    canonicalTeam: "CPF VILTRUMITE",
    role: "off",
    knownAliases: [
      "Biscoito",
      "CPF BISCOITO",
    ],
  },
  {
    canonicalNickname: "CPF gbzin",
    canonicalTeam: "CPF VILTRUMITE",
    role: "off",
    knownAliases: [
      "CPF gbzin",
      "CPF GBZIN",
    ],
  },
  {
    canonicalNickname: "CPF xitado",
    canonicalTeam: "CPF VILTRUMITE",
    role: "off",
    knownAliases: [
      "[CPF]xitado",
      "CPF XITADO",
    ],
  },
  {
    canonicalNickname: "CPF zkrw",
    canonicalTeam: "CPF VILTRUMITE",
    role: "off",
    knownAliases: [
      "CPF zkrw",
    ],
  },
  {
    canonicalNickname: "CPF BLAZE",
    canonicalTeam: "CPF VILTRUMITE",
    role: "off",
    knownAliases: [
      "CPF BLAZE",
    ],
  },
  {
    canonicalNickname: "CPF Ohara",
    canonicalTeam: "CPF VILTRUMITE",
    role: "off",
    knownAliases: [
      "CPF Ohara",
    ],
  },
  {
    canonicalNickname: "Vw",
    canonicalTeam: "CPF VILTRUMITE",
    role: "off",
    knownAliases: [
      "Vw",
    ],
  },
  {
    canonicalNickname: "CPF KROM",
    canonicalTeam: "CPF VILTRUMITE",
    role: "off",
    knownAliases: [
      "CPF KROM",
    ],
  },
  {
    canonicalNickname: "CPF LUIZ",
    canonicalTeam: "CPF VILTRUMITE",
    role: "off",
    knownAliases: [
      "CPF LUIZ",
    ],
  },
  {
    canonicalNickname: "CPF PICASSO",
    canonicalTeam: "CPF VILTRUMITE",
    role: "off",
    knownAliases: [
      "CPF PICASSO",
    ],
  },
  {
    canonicalNickname: "CPF SHOTTZZ",
    canonicalTeam: "CPF VILTRUMITE",
    role: "off",
    knownAliases: [
      "CPF SHOTTZZ",
    ],
  },
  {
    canonicalNickname: "CPF FLAX",
    canonicalTeam: "CPF VILTRUMITE",
    role: "off",
    knownAliases: [
      "CPF FLAX",
    ],
  },

  // ==========================================
  // TROPA DO XXX
  // ==========================================
  {
    canonicalNickname: "AMN Y2K",
    canonicalTeam: "TROPA DO XXX",
    role: "off",
    knownAliases: [
      "AMN Y2K",
    ],
  },
  {
    canonicalNickname: "Iagoperes",
    canonicalTeam: "TROPA DO XXX",
    role: "off",
    knownAliases: [
      "!Iagoperesㅤ🃏",
    ],
  },
  {
    canonicalNickname: "XXX Crinsom",
    canonicalTeam: "TROPA DO XXX",
    role: "off",
    knownAliases: [
      "XXX †Crinsom",
    ],
  },
  {
    canonicalNickname: "XXX Rip_sw",
    canonicalTeam: "TROPA DO XXX",
    role: "off",
    knownAliases: [
      "XXX Rip_sw🤫",
    ],
  },
  {
    canonicalNickname: "XXX Pedrozin",
    canonicalTeam: "TROPA DO XXX",
    role: "off",
    knownAliases: [
      "XXX Pedrozin",
    ],
  },
  {
    canonicalNickname: "XXX China",
    canonicalTeam: "TROPA DO XXX",
    role: "off",
    knownAliases: [
      "XXX China🇧🇷",
    ],
  },
  {
    canonicalNickname: "XXX invisivel",
    canonicalTeam: "TROPA DO XXX",
    role: "off",
    knownAliases: [
      "XXX 🪠🪠🪠",
    ],
  },

  // ==========================================
  // VØID STRIKE
  // ==========================================
  {
    canonicalNickname: "Vøid D_R",
    canonicalTeam: "VØID STRIKE",
    role: "off",
    knownAliases: [
      "Discípulo.Vøid.D_R",
    ],
  },
  {
    canonicalNickname: "Vøid gute",
    canonicalTeam: "VØID STRIKE",
    role: "off",
    knownAliases: [
      "Discípulo.Vøid.+gute",
    ],
  },
  {
    canonicalNickname: "Vøid nino",
    canonicalTeam: "VØID STRIKE",
    role: "off",
    knownAliases: [
      "Discípulo.Vøid.nino",
    ],
  },
  {
    canonicalNickname: "VØID 777",
    canonicalTeam: "VØID STRIKE",
    role: "off",
    knownAliases: [
      "™VØID°⁷⁷⁷",
    ],
  },
  {
    canonicalNickname: "Vøid T9",
    canonicalTeam: "VØID STRIKE",
    role: "off",
    knownAliases: [
      "√Vøid√T9",
    ],
  },

  // ==========================================
  // 7KW_LHETAL
  // ==========================================
  {
    canonicalNickname: "patrikm",
    canonicalTeam: "7KW_LHETAL",
    role: "off",
    knownAliases: [
      "(NTC)patrikm",
    ],
  },
  {
    canonicalNickname: "kakashi",
    canonicalTeam: "7KW_LHETAL",
    role: "off",
    knownAliases: [
      "_061_kakashi",
    ],
  },
  {
    canonicalNickname: "RL.MATADOR",
    canonicalTeam: "7KW_LHETAL",
    role: "off",
    knownAliases: [
      "RL.MATADOR☠️",
    ],
  },
  {
    canonicalNickname: "Fefe",
    canonicalTeam: "7KW_LHETAL",
    role: "off",
    knownAliases: [
      "Fefe_🎭🇧🇷",
    ],
  },

  // ==========================================
  // Λつつ (X1)
  // ==========================================
  {
    canonicalNickname: "CAVEIRA",
    canonicalTeam: "Λつつ",
    role: "off",
    knownAliases: [
      "Λつつ_$CAVEIRA",
    ],
  },
  {
    canonicalNickname: "Aninha",
    canonicalTeam: "Λつつ",
    role: "off",
    knownAliases: [
      "Λつつ Aninha",
    ],
  },
  {
    canonicalNickname: "ONE",
    canonicalTeam: "Λつつ",
    role: "off",
    knownAliases: [
      "ØNE ???",
    ],
  },
  {
    canonicalNickname: "Unknown",
    canonicalTeam: "Λつつ",
    role: "off",
    knownAliases: [
      "Λつつ Unknown",
    ],
  },
  {
    canonicalNickname: "Striker71",
    canonicalTeam: "Λつつ",
    role: "off",
    knownAliases: [
      "Striker71",
    ],
  },
  {
    canonicalNickname: "KINN",
    canonicalTeam: "Λつつ",
    role: "off",
    knownAliases: [
      "PsS-KINN-ボ",
    ],
  },
  {
    canonicalNickname: "Striker81",
    canonicalTeam: "Λつつ",
    role: "off",
    knownAliases: [
      "Striker81",
    ],
  },
  {
    canonicalNickname: "AET Jentexz",
    canonicalTeam: "Λつつ",
    role: "off",
    knownAliases: [
      "ΛΞT Jentexz",
    ],
  },

  // ==========================================
  // ODS (X1)
  // ==========================================
  {
    canonicalNickname: "STROG",
    canonicalTeam: "ODS",
    role: "off",
    knownAliases: [
      "[ODS].STROG",
    ],
  },
  {
    canonicalNickname: "vantex",
    canonicalTeam: "ODS",
    role: "off",
    knownAliases: [
      "[ODS] vantex",
    ],
  },
  {
    canonicalNickname: "Az Aamon",
    canonicalTeam: "ODS",
    role: "off",
    knownAliases: [
      "Az Aamon",
    ],
  },

  // ==========================================
  // MISTURADO (X2)
  // ==========================================
  {
    canonicalNickname: "REVERSE_",
    canonicalTeam: "Misturado",
    role: "off",
    knownAliases: [
      "REVERSE_",
    ],
  },
  {
    canonicalNickname: "TOP FreeKill",
    canonicalTeam: "Misturado",
    role: "off",
    knownAliases: [
      "TOP FreeKill",
    ],
  },

  // ==========================================
  // TIMES AVULSOS / RANDOLINHAS
  // ==========================================
  {
    canonicalNickname: "hcky",
    canonicalTeam: "Time I",
    role: "off",
    knownAliases: ["hcky"],
  },
  {
    canonicalNickname: "GzmAkaza",
    canonicalTeam: "Time I",
    role: "off",
    knownAliases: ["GzmAkaza"],
  },
  {
    canonicalNickname: "AimColor",
    canonicalTeam: "Time I",
    role: "off",
    knownAliases: ["AimColor"],
  },
  {
    canonicalNickname: "iDiaasz",
    canonicalTeam: "Time I",
    role: "off",
    knownAliases: ["iDiaasz"],
  },
  {
    canonicalNickname: "Jtpe",
    canonicalTeam: "Time I",
    role: "off",
    knownAliases: ["Jtpe"],
  },
  {
    canonicalNickname: "PAIN SWAN",
    canonicalTeam: "Time E",
    role: "off",
    knownAliases: ["PAIN SWAN"],
  },
  {
    canonicalNickname: "Poindexter",
    canonicalTeam: "Time E",
    role: "off",
    knownAliases: ["Poindexter"],
  },
  {
    canonicalNickname: "ONE-Javi",
    canonicalTeam: "Time E",
    role: "off",
    knownAliases: ["ONE-Javi"],
  },
  {
    canonicalNickname: "morqesb",
    canonicalTeam: "Time E",
    role: "off",
    knownAliases: ["morqesb"],
  },
  {
    canonicalNickname: "elbra",
    canonicalTeam: "randolinhas",
    role: "off",
    knownAliases: ["elbra"],
  },
  {
    canonicalNickname: "Felipe",
    canonicalTeam: "randolinhas",
    role: "off",
    knownAliases: ["Felipe"],
  },
  {
    canonicalNickname: "frajola",
    canonicalTeam: "randolinhas",
    role: "off",
    knownAliases: ["frajola"],
  },
  {
    canonicalNickname: "rayzer_bot",
    canonicalTeam: "randolinhas",
    role: "off",
    knownAliases: ["rayzer_bot"],
  },
  {
    canonicalNickname: "sinner boy",
    canonicalTeam: "Randolinhas",
    role: "off",
    knownAliases: ["sinner boy"],
  },
  {
    canonicalNickname: "Miag",
    canonicalTeam: "Randolinhas",
    role: "off",
    knownAliases: ["Miag"],
  },
  {
    canonicalNickname: "VAL Yzzi",
    canonicalTeam: "Randolinhas",
    role: "off",
    knownAliases: ["VAL Yzzi⁷"],
  },
  {
    canonicalNickname: "7xis Tilapia",
    canonicalTeam: "Randolinhas",
    role: "off",
    knownAliases: ["7xis ╲ Tilapia"],
  },
  {
    canonicalNickname: "VNG NEAR",
    canonicalTeam: "vengeance",
    role: "off",
    knownAliases: ["VNG NEAR★"],
  },
  {
    canonicalNickname: "Ti Pela",
    canonicalTeam: "vengeance",
    role: "off",
    knownAliases: ["Ti Pela"],
  },
  {
    canonicalNickname: "Caveira",
    canonicalTeam: "vengeance",
    role: "off",
    knownAliases: ["Caveira"],
  },
  {
    canonicalNickname: "ackerman",
    canonicalTeam: "vengeance",
    role: "off",
    knownAliases: ["ackerman"],
  },
  {
    canonicalNickname: "VNG SCAVEIRA",
    canonicalTeam: "vengeance",
    role: "off",
    knownAliases: ["VNG SCAVEIRA"],
  },
  {
    canonicalNickname: "VNG ???",
    canonicalTeam: "vengeance",
    role: "off",
    knownAliases: ["VNG ¿¿¿"],
  },
  {
    canonicalNickname: "A",
    canonicalTeam: "Equipe H",
    role: "off",
    knownAliases: ["A"],
  },
  {
    canonicalNickname: "elxt",
    canonicalTeam: "Equipe H",
    role: "off",
    knownAliases: ["elxt"],
  },
  {
    canonicalNickname: "wasse lindu",
    canonicalTeam: "Equipe H",
    role: "off",
    knownAliases: ["wasse lindu"],
  },
  {
    canonicalNickname: "Snzyx zp",
    canonicalTeam: "Equipe H",
    role: "off",
    knownAliases: ["Snzyx zp"],
  },
  {
    canonicalNickname: "Yuuky",
    canonicalTeam: "Equipe K",
    role: "off",
    knownAliases: ["Yuuky"],
  },
  {
    canonicalNickname: "User",
    canonicalTeam: "Squad D",
    role: "off",
    knownAliases: ["User"],
  },
  {
    canonicalNickname: "VGD TTKGENOS",
    canonicalTeam: "Squad D",
    role: "off",
    knownAliases: ["VGD TTKGENOS"],
  },
  {
    canonicalNickname: "AET THEKIL",
    canonicalTeam: "Λ Ξ T H E R   F P S",
    role: "off",
    knownAliases: ["AET THEKIL"],
  },
  {
    canonicalNickname: "Dacena",
    canonicalTeam: "Λ Ξ T H E R   F P S",
    role: "off",
    knownAliases: ["Dacena"],
  },
  {
    canonicalNickname: "AET HIZZEN",
    canonicalTeam: "Λ Ξ T H E R   F P S",
    role: "off",
    knownAliases: ["AET HIZZEN"],
  },
  {
    canonicalNickname: "BG mt7",
    canonicalTeam: "EXE",
    role: "off",
    knownAliases: ["BG mt7"],
  },
  {
    canonicalNickname: "BG chico",
    canonicalTeam: "EXE",
    role: "off",
    knownAliases: ["BG chico"],
  },
  {
    canonicalNickname: "BG XavierAim",
    canonicalTeam: "EXE",
    role: "off",
    knownAliases: ["BG XavierAim"],
  },
  {
    canonicalNickname: "BG TK T1",
    canonicalTeam: "EXE",
    role: "off",
    knownAliases: ["BG TK T1"],
  },
  {
    canonicalNickname: "BG B7 XIT",
    canonicalTeam: "EXE",
    role: "off",
    knownAliases: ["BG B7 XIT"],
  },
  {
    canonicalNickname: "Asmota",
    canonicalTeam: "FURY ROYAL",
    role: "off",
    knownAliases: ["Asmota"],
  },

  // RIVERS
  {
    canonicalNickname: "Rivers JN",
    canonicalTeam: "RIVERS",
    role: "off",
    knownAliases: ["Rivers JN"],
  },
  {
    canonicalNickname: "Rivers DJ",
    canonicalTeam: "RIVERS",
    role: "off",
    knownAliases: ["Rivers DJ"],
  },
  {
    canonicalNickname: "River____w",
    canonicalTeam: "RIVERS",
    role: "off",
    knownAliases: ["River____w"],
  },
  {
    canonicalNickname: "Buzeira 永",
    canonicalTeam: "RIVERS",
    role: "off",
    knownAliases: ["Buzeira 永"],  // ⚠️ Já existe em UGD LEGENDS! Precisa decidir
  },
  // ODR
  {
    canonicalNickname: "yurizz FURY",
    canonicalTeam: "ODR",
    role: "off",
    knownAliases: ["yurizz FURY"],
  },
  {
    canonicalNickname: "Mindweak",
    canonicalTeam: "ODR",
    role: "off",
    knownAliases: ["Mindweak"],
  },
  {
    canonicalNickname: "ODR S4NTLEVS",
    canonicalTeam: "ODR",
    role: "off",
    knownAliases: ["ODR S4NTLEVS"],
  },
  {
    canonicalNickname: "ODR Aisha",
    canonicalTeam: "ODR",
    role: "off",
    knownAliases: ["ODR Aisha"],
  },
  // KF
  {
    canonicalNickname: "KF ℛdot",
    canonicalTeam: "KF",
    role: "off",
    knownAliases: ["KF ℛdot"],
  },
  {
    canonicalNickname: "Zeniwt",
    canonicalTeam: "KF",
    role: "off",
    knownAliases: ["Zeniwt"],
  },
  {
    canonicalNickname: "KF A𝒦𝒰ℛA!?ツ",
    canonicalTeam: "KF",
    role: "off",
    knownAliases: ["KF A𝒦𝒰ℛA!?ツ"],
  },
  {
    canonicalNickname: "KF-Dexter",
    canonicalTeam: "KF",
    role: "off",
    knownAliases: ["KF-Dexter"],
  },

  // FURY / EME
  {
    canonicalNickname: "Asmita FURY",
    canonicalTeam: "FURY / EME",
    role: "off",
    knownAliases: ["Asmita FURY"],
  },
  {
    canonicalNickname: "perfection z",
    canonicalTeam: "FURY / EME",
    role: "off",
    knownAliases: ["perfection z"],
  },
  {
    canonicalNickname: "EME々Notfear`",
    canonicalTeam: "FURY / EME",
    role: "off",
    knownAliases: ["EME々Notfear`", "EME々Notfear'"],
  },
  {
    canonicalNickname: "EME々Orz⁷",
    canonicalTeam: "FURY / EME",
    role: "off",
    knownAliases: ["EME々Orz⁷"],
  },
  
  // HAVK'z
  {
    canonicalNickname: "ODR S4NTLEVS",
    canonicalTeam: "HAVK'z",
    role: "off",
    knownAliases: ["ODR S4NTLEVS"],
  },
  {
    canonicalNickname: "ODR Aisha",
    canonicalTeam: "HAVK'z",
    role: "off",
    knownAliases: ["ODR Aisha"],
  },
  {
    canonicalNickname: "Not Found",
    canonicalTeam: "HAVK'z",
    role: "off",
    knownAliases: ["Not Found"],
  },
  {
    canonicalNickname: "UGD 布力家",
    canonicalTeam: "UGD LIGHT",
    role: "off",
    knownAliases: ["UGD 布力家", "布力家"],
  },

];

// ============================================================
// MAPEAMENTO DE TIMES (Base XTreinos)
// ============================================================
interface TeamAliasEntry {
  canonicalName: string;
  knownAliases: string[];
}

const TEAM_ALIASES_DATA: TeamAliasEntry[] = [
  {
    canonicalName: "UGD Threat",
    knownAliases: ["UGD Threat", "UGD Threat + Olympique"],
  },
  {
    canonicalName: "UGD LIGHT",
    knownAliases: ["UGD LIGHT", "UGD Light", "UGD light"],
  },
  {
    canonicalName: "UGD LEGENDS",
    knownAliases: ["UGD LEGENDS", "UGD Legends", "UGD legends"],
  },
  {
    canonicalName: "UGD OLYMPIQUE",
    knownAliases: [
      "UGD OLYMPIQUE",
      "UGD OLYMPIQUE / LEGENDS",
      "UGD Threat + Olympique",
    ],
  },
  {
    canonicalName: "UGD CASUAL",
    knownAliases: ["UGD CASUAL"],
  },
  {
    canonicalName: "UGD Royal",
    knownAliases: ["UGD Royal"],
  },
  {
    canonicalName: "FURY ROYAL",
    knownAliases: [
      "FURY ROYAL",
      "FURY ROYAL / MIX (Line I)",
      "FURY MIX (ELITE / ROYAL)",
    ],
  },
  {
    canonicalName: "FURY ELITE",
    knownAliases: [
      "FURY ELITE",
      "FURY ELITE / MIX (Line H)",
      "FURY MIX (ELITE / ROYAL)",
    ],
  },
  {
    canonicalName: "FURY CASUAL",
    knownAliases: ["FURY CASUAL"],
  },
  {
    canonicalName: "FURY",
    knownAliases: ["FURY"],
  },
  {
    canonicalName: "CMF ATLANTIC",
    knownAliases: ["CMF ATLANTIC"],
  },
  {
    canonicalName: "CMF ASSALT",
    knownAliases: ["CMF ASSALT"],
  },
  {
    canonicalName: "CMF",
    knownAliases: ["CMF"],
  },
  {
    canonicalName: "RED INSS",
    knownAliases: ["RED INSS", "REÐ Outlaws"],
  },
  {
    canonicalName: "RED",
    knownAliases: ["RED", "RED Magic BR"],
  },
  {
    canonicalName: "K4F",
    knownAliases: ["K4F", "k4F"],
  },
  {
    canonicalName: "EmE",
    knownAliases: ["EmE", "EME"],
  },
  {
    canonicalName: "INF",
    knownAliases: ["INF"],
  },
  {
    canonicalName: "LMF",
    knownAliases: ["LMF"],
  },
  {
    canonicalName: "Eternity",
    knownAliases: ["Eternity"],
  },
  {
    canonicalName: "KOV",
    knownAliases: ["KOV"],
  },
  {
    canonicalName: "CPF VILTRUMITE",
    knownAliases: ["CPF VILTRUMITE"],
  },
  {
    canonicalName: "TROPA DO XXX",
    knownAliases: ["TROPA DO XXX"],
  },
  {
    canonicalName: "VØID STRIKE",
    knownAliases: ["Discípulos VØID×STRIKE ANGEL"],
  },
  {
    canonicalName: "7KW_LHETAL",
    knownAliases: ["7KW_LHETAL"],
  },
  {
    canonicalName: "Λつつ",
    knownAliases: ["Λつつ"],
  },
  {
    canonicalName: "ODS",
    knownAliases: ["ODS"],
  },
  {
    canonicalName: "Misturado",
    knownAliases: ["Misturado"],
  },
  {
    canonicalName: "Time I",
    knownAliases: ["Time I"],
  },
  {
    canonicalName: "Time E",
    knownAliases: ["Time E"],
  },
  {
    canonicalName: "randolinhas",
    knownAliases: ["randolinhas", "Randolinhas"],
  },
  {
    canonicalName: "vengeance",
    knownAliases: ["vengeance"],
  },
  {
    canonicalName: "Equipe H",
    knownAliases: ["Equipe H"],
  },
  {
    canonicalName: "Equipe K",
    knownAliases: ["Equipe K"],
  },
  {
    canonicalName: "Squad D",
    knownAliases: ["Squad D", "Time D"],
  },
  {
    canonicalName: "Λ Ξ T H E R   F P S",
    knownAliases: ["Λ Ξ T H E R   F P S"],
  },
  {
    canonicalName: "EXE",
    knownAliases: ["EXE"],
  },
  {
    canonicalName: "RIVERS",
    knownAliases: ["RIVERS"],
  },
  {
    canonicalName: "ODR",
    knownAliases: ["ODR"],
  },
  {
    canonicalName: "KF",
    knownAliases: ["KF"],
  },
  {
    canonicalName: "FURY / EME",
    knownAliases: ["FURY / EME"],
  },
  {
    canonicalName: "HAVK'z",
    knownAliases: ["HAVK'z"],
  },
];

// ============================================================
// LÓGICA DO SEED
// ============================================================
export function seed() {
  const db = getDb();
  console.log("[SEED] Starting xtreinos aliases seed...");

  // 1. Garantir que todos os times existam
  const allTeams = db.select().from(teams).all();
  const teamIdMap = new Map(allTeams.map(t => [t.name, t.id]));

  for (const teamEntry of TEAM_ALIASES_DATA) {
    let teamId = teamIdMap.get(teamEntry.canonicalName);
    if (!teamId) {
      const result = db.insert(teams).values({
        name: teamEntry.canonicalName,
        tag: teamEntry.canonicalName.substring(0, 3).toUpperCase(),
        status: "active",
      }).run();
      teamId = Number(result.lastInsertRowid);
      teamIdMap.set(teamEntry.canonicalName, teamId);
      console.log(`[SEED] Team created: ${teamEntry.canonicalName}`);
    }

    for (const alias of teamEntry.knownAliases) {
      const normalized = normalizeTeamName(alias);
      if (!normalized) continue;
      const existing = db.select().from(teamAliases)
        .where(eq(teamAliases.normalizedAlias, normalized)).get();
      if (!existing) {
        db.insert(teamAliases).values({
          teamId,
          alias,
          normalizedAlias: normalized,
          source: "xtreino",
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

    for (const alias of entry.knownAliases) {
      const normalized = normalizeNickname(alias);
      if (!normalized) continue;

      const existing = db.select().from(playerAliases)
        .where(eq(playerAliases.normalizedAlias, normalized)).get();
      if (!existing) {
        db.insert(playerAliases).values({
          playerId,
          alias,
          normalizedAlias: normalized,
          source: "xtreino",
          confidence: 100,
        }).run();
        aliasesCreated++;
      }
    }
  }

  console.log(`[SEED] ${playersCreated} players created, ${aliasesCreated} aliases created`);

  // Registrar seed run
  //const seedName = "aliases-xtreinos-v1";
  //const existingSeed = db.select().from(seedRuns).where(eq(seedRuns.seedName, seedName)).get();
  //if (!existingSeed) {
  //  db.insert(seedRuns).values({ seedName }).run();
  //}

  console.log("[SEED] Xtreinos aliases seed completed!");
}
