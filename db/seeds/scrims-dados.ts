// db/seeds/scrims-dados.ts
// ⚠️  SÓ EDITE ESTE ARQUIVO quando tiver uma nova scrim!
// NÃO precisa calcular totais, o seed faz isso automaticamente!

export interface ScrimRoundStats {
  kills: number;
  assists: number;
  deaths: number;
  damage: number;
  mvp: boolean;
  score: number; // Score do round (geralmente o resultado do time naquele round)
}

export interface ScrimPlayerRaw {
  playerName: string;
  teamName: string;
  rounds: ScrimRoundStats[]; // Basta adicionar os rounds aqui. Pode ter 3 ou 4 rounds!
}

export interface ScrimRaw {
  id: number;
  date: string;
  name: string;
  result: string;
  
  // Resultado dos times por round: [ValorTime1, ValorTime2]
  // Ex: [[7, 1], [7, 1], [7, 0]] significa que o Time1 fez 7, 7, 7 e o Time2 fez 1, 1, 0.
  roundResults: [number, number][]; 
  
  team1Name: string;
  team2Name: string;
  jogadores: ScrimPlayerRaw[];
}

export const scrimsRaw: ScrimRaw[] = [
  // ========================================
  // Scrim 1 — 2026-06-13 (UGD Threat vs K4F)
  // ========================================
  {
    id: 1,
    date: "2026-06-13",
    name: "Scrim 4v4 MME — UGD Threat vs K4F",
    result: "UGD Threat 3-0 K4F (Vale Deserto, Ilha do Medo, Ilha do Medo)",
    team1Name: "UGD Threat",
    team2Name: "K4F",
    roundResults: [[7, 1], [7, 1], [7, 0]],
    jogadores: [
      { playerName: "IGD⚡ Ares", teamName: "UGD Threat", rounds: [
        { kills: 11, assists: 5, deaths: 1, damage: 3100, mvp: true, score: 7 },
        { kills: 9, assists: 14, deaths: 2, damage: 3308, mvp: false, score: 7 },
        { kills: 11, assists: 4, deaths: 0, damage: 4442, mvp: true, score: 7 },
      ]},
      { playerName: "UGD⚡ Ohara", teamName: "UGD Threat", rounds: [
        { kills: 8, assists: 10, deaths: 1, damage: 3604, mvp: false, score: 7 },
        { kills: 12, assists: 7, deaths: 1, damage: 2732, mvp: true, score: 7 },
        { kills: 7, assists: 6, deaths: 1, damage: 2900, mvp: false, score: 7 },
      ]},
      { playerName: "Dexz⁷RYL", teamName: "UGD Threat", rounds: [
        { kills: 7, assists: 7, deaths: 1, damage: 2866, mvp: false, score: 7 },
        { kills: 4, assists: 9, deaths: 1, damage: 1595, mvp: false, score: 7 },
        { kills: 7, assists: 4, deaths: 1, damage: 2522, mvp: false, score: 7 },
      ]},
      { playerName: "GD⚡ A R", teamName: "UGD Threat", rounds: [
        { kills: 3, assists: 5, deaths: 2, damage: 2277, mvp: false, score: 7 },
        { kills: 4, assists: 3, deaths: 1, damage: 1042, mvp: false, score: 7 },
        { kills: 3, assists: 8, deaths: 2, damage: 1678, mvp: false, score: 7 },
      ]},
      { playerName: "K4F Zaza", teamName: "K4F", rounds: [
        { kills: 2, assists: 2, deaths: 7, damage: 1687, mvp: true, score: 1 },
        { kills: 2, assists: 1, deaths: 7, damage: 895, mvp: false, score: 1 },
        { kills: 1, assists: 1, deaths: 7, damage: 1451, mvp: false, score: 0 },
      ]},
      { playerName: "K4F NINE", teamName: "K4F", rounds: [
        { kills: 2, assists: 1, deaths: 7, damage: 1822, mvp: false, score: 1 },
        { kills: 1, assists: 0, deaths: 8, damage: 528, mvp: false, score: 1 },
        { kills: 1, assists: 0, deaths: 7, damage: 1416, mvp: false, score: 0 },
      ]},
      { playerName: "K4F Guilok07", teamName: "K4F", rounds: [
        { kills: 1, assists: 1, deaths: 7, damage: 957, mvp: false, score: 1 },
        { kills: 2, assists: 2, deaths: 7, damage: 1938, mvp: true, score: 1 },
        { kills: 2, assists: 2, deaths: 7, damage: 2156, mvp: true, score: 0 },
      ]},
      { playerName: "ÉouUrSo", teamName: "K4F", rounds: [
        { kills: 0, assists: 0, deaths: 8, damage: 525, mvp: false, score: 1 },
        { kills: 0, assists: 1, deaths: 7, damage: 1245, mvp: false, score: 1 },
        { kills: 0, assists: 0, deaths: 7, damage: 880, mvp: false, score: 0 },
      ]},
    ],
  },

  // ========================================
  // Scrim 2 — 2026-05-03 (Underground vs Dinasty Kingdom)
  // ========================================
  {
    id: 2,
    date: "2026-05-03",
    name: "Scrim 4v4 MME — Underground vs Dinasty Kingdom",
    result: "Underground 2-0 Dinasty Kingdom (Ilha do Medo, Ilha do Medo)",
    team1Name: "Underground",
    team2Name: "Dinasty Kingdom",
    roundResults: [[7, 0], [7, 0], [0, 0]], // Q3 não jogada
    jogadores: [
      { playerName: "OFfzrᴿʸᴸ", teamName: "Underground", rounds: [
        { kills: 10, assists: 9, deaths: 0, damage: 4503, mvp: true, score: 7 },
        { kills: 5, assists: 13, deaths: 1, damage: 3282, mvp: false, score: 7 },
        { kills: 0, assists: 0, deaths: 0, damage: 0, mvp: false, score: 7 }, // Não jogou
      ]},
      { playerName: "UGD⚡ Ares", teamName: "Underground", rounds: [
        { kills: 7, assists: 5, deaths: 2, damage: 2145, mvp: false, score: 7 },
        { kills: 8, assists: 4, deaths: 1, damage: 3283, mvp: false, score: 7 },
        { kills: 0, assists: 0, deaths: 0, damage: 0, mvp: false, score: 7 },
      ]},
      { playerName: "Mayazᴿʸᴸ✨", teamName: "Underground", rounds: [
        { kills: 7, assists: 4, deaths: 0, damage: 2228, mvp: false, score: 7 },
        { kills: 9, assists: 4, deaths: 1, damage: 3639, mvp: true, score: 7 },
        { kills: 0, assists: 0, deaths: 0, damage: 0, mvp: false, score: 7 },
      ]},
      { playerName: "GD⚡ A R I", teamName: "Underground", rounds: [
        { kills: 4, assists: 7, deaths: 0, damage: 1972, mvp: false, score: 7 },
        { kills: 0, assists: 0, deaths: 0, damage: 0, mvp: false, score: 7 },
        { kills: 0, assists: 0, deaths: 0, damage: 0, mvp: false, score: 7 },
      ]},
      { playerName: "⚡ R I S E 愛", teamName: "Underground", rounds: [
        { kills: 0, assists: 0, deaths: 0, damage: 0, mvp: false, score: 7 },
        { kills: 6, assists: 3, deaths: 1, damage: 1741, mvp: false, score: 7 },
        { kills: 0, assists: 0, deaths: 0, damage: 0, mvp: false, score: 7 },
      ]},
      { playerName: "⚡DK⚡STAN", teamName: "Dinasty Kingdom", rounds: [
        { kills: 1, assists: 0, deaths: 7, damage: 1695, mvp: true, score: 0 },
        { kills: 0, assists: 0, deaths: 0, damage: 0, mvp: false, score: 0 },
        { kills: 0, assists: 0, deaths: 0, damage: 0, mvp: false, score: 0 },
      ]},
      { playerName: "⚡DK⚡ DOUG", teamName: "Dinasty Kingdom", rounds: [
        { kills: 1, assists: 0, deaths: 7, damage: 1692, mvp: false, score: 0 },
        { kills: 0, assists: 0, deaths: 0, damage: 0, mvp: false, score: 0 },
        { kills: 0, assists: 0, deaths: 0, damage: 0, mvp: false, score: 0 },
      ]},
      { playerName: "⚡DK⚡ FROST愛", teamName: "Dinasty Kingdom", rounds: [
        { kills: 0, assists: 1, deaths: 7, damage: 969, mvp: false, score: 0 },
        { kills: 0, assists: 1, deaths: 7, damage: 885, mvp: false, score: 0 },
        { kills: 0, assists: 0, deaths: 0, damage: 0, mvp: false, score: 0 },
      ]},
      { playerName: "⚡DK⚡mask몭", teamName: "Dinasty Kingdom", rounds: [
        { kills: 0, assists: 1, deaths: 7, damage: 691, mvp: false, score: 0 },
        { kills: 0, assists: 2, deaths: 7, damage: 1190, mvp: false, score: 0 },
        { kills: 0, assists: 0, deaths: 0, damage: 0, mvp: false, score: 0 },
      ]},
      { playerName: "TANLEY👹", teamName: "Dinasty Kingdom", rounds: [
        { kills: 0, assists: 0, deaths: 0, damage: 0, mvp: false, score: 0 },
        { kills: 2, assists: 1, deaths: 7, damage: 2179, mvp: true, score: 0 },
        { kills: 0, assists: 0, deaths: 0, damage: 0, mvp: false, score: 0 },
      ]},
      { playerName: "⚡DK⚡ Aras", teamName: "Dinasty Kingdom", rounds: [
        { kills: 0, assists: 0, deaths: 0, damage: 0, mvp: false, score: 0 },
        { kills: 2, assists: 0, deaths: 7, damage: 888, mvp: false, score: 0 },
        { kills: 0, assists: 0, deaths: 0, damage: 0, mvp: false, score: 0 },
      ]},
    ],
  },

  // ========================================
  // Scrim 3 — 2026-05-02 (UGD Threat vs UGD LIGHT) - 4 ROUNDS!
  // ========================================
  {
    id: 3,
    date: "2026-05-02",
    name: "Scrim 4v4 MME — UGD Threat vs UGD LIGHT",
    result: "UGD Threat 2-2 UGD LIGHT (Ilha do Medo, Ilha do Medo, Ilha do Medo, Ilha do Medo)",
    team1Name: "UGD Threat",
    team2Name: "UGD LIGHT",
    roundResults: [[8, 7], [5, 8], [1, 8], [8, 2]], // Aqui tem 4 rounds!
    jogadores: [
      { playerName: "Rivers", teamName: "UGD Threat", rounds: [
        { kills: 12, assists: 4, deaths: 8, damage: 5695, mvp: true, score: 8 },
        { kills: 14, assists: 5, deaths: 8, damage: 5295, mvp: true, score: 5 },
        { kills: 2, assists: 1, deaths: 8, damage: 1791, mvp: false, score: 1 },
        { kills: 5, assists: 7, deaths: 5, damage: 3504, mvp: false, score: 8 },
      ]},
      { playerName: "GD⚡ Neo⁷", teamName: "UGD Threat", rounds: [
        { kills: 8, assists: 8, deaths: 7, damage: 5684, mvp: false, score: 8 },
        { kills: 10, assists: 5, deaths: 8, damage: 4651, mvp: false, score: 5 },
        { kills: 2, assists: 3, deaths: 8, damage: 2619, mvp: false, score: 1 },
        { kills: 8, assists: 10, deaths: 3, damage: 4158, mvp: false, score: 8 },
      ]},
      { playerName: "UGD⚡ Kaze", teamName: "UGD Threat", rounds: [
        { kills: 7, assists: 3, deaths: 8, damage: 3142, mvp: false, score: 8 },
        { kills: 1, assists: 7, deaths: 8, damage: 2547, mvp: false, score: 5 },
        { kills: 1, assists: 1, deaths: 8, damage: 1315, mvp: false, score: 1 },
        { kills: 7, assists: 3, deaths: 3, damage: 2727, mvp: false, score: 8 },
      ]},
      { playerName: "GD⚡ Ween", teamName: "UGD Threat", rounds: [
        { kills: 6, assists: 5, deaths: 8, damage: 3728, mvp: false, score: 8 },
        { kills: 4, assists: 12, deaths: 8, damage: 2976, mvp: false, score: 5 },
        { kills: 0, assists: 0, deaths: 0, damage: 0, mvp: false, score: 1 }, // Não jogou
        { kills: 0, assists: 0, deaths: 0, damage: 0, mvp: false, score: 8 }, // Não jogou
      ]},
      { playerName: "UGD⚡ Treon", teamName: "UGD Threat", rounds: [
        { kills: 0, assists: 0, deaths: 0, damage: 0, mvp: false, score: 8 }, // Não jogou
        { kills: 0, assists: 0, deaths: 0, damage: 0, mvp: false, score: 5 }, // Não jogou
        { kills: 4, assists: 1, deaths: 8, damage: 2961, mvp: true, score: 1 },
        { kills: 12, assists: 11, deaths: 2, damage: 3573, mvp: true, score: 8 },
      ]},
      { playerName: "UGD⚡ Kyz", teamName: "UGD LIGHT", rounds: [
        { kills: 10, assists: 6, deaths: 8, damage: 4960, mvp: true, score: 7 },
        { kills: 13, assists: 5, deaths: 7, damage: 3353, mvp: true, score: 8 },
        { kills: 7, assists: 8, deaths: 2, damage: 3539, mvp: false, score: 8 },
        { kills: 3, assists: 2, deaths: 8, damage: 1868, mvp: false, score: 2 },
      ]},
      { playerName: "Not¹ Zen", teamName: "UGD LIGHT", rounds: [
        { kills: 8, assists: 7, deaths: 9, damage: 4561, mvp: false, score: 7 },
        { kills: 5, assists: 7, deaths: 9, damage: 2709, mvp: false, score: 8 },
        { kills: 4, assists: 4, deaths: 3, damage: 1165, mvp: false, score: 8 },
        { kills: 3, assists: 2, deaths: 8, damage: 2141, mvp: false, score: 2 },
      ]},
      { playerName: "✧Sike", teamName: "UGD LIGHT", rounds: [
        { kills: 7, assists: 7, deaths: 8, damage: 4784, mvp: false, score: 7 },
        { kills: 9, assists: 10, deaths: 6, damage: 3649, mvp: false, score: 8 },
        { kills: 14, assists: 7, deaths: 2, damage: 4796, mvp: true, score: 8 },
        { kills: 3, assists: 3, deaths: 8, damage: 2832, mvp: false, score: 2 },
      ]},
      { playerName: "GD⚡ Psych", teamName: "UGD LIGHT", rounds: [
        { kills: 6, assists: 8, deaths: 8, damage: 3713, mvp: false, score: 7 },
        { kills: 5, assists: 11, deaths: 7, damage: 3917, mvp: false, score: 8 },
        { kills: 7, assists: 6, deaths: 2, damage: 2147, mvp: false, score: 8 },
        { kills: 4, assists: 3, deaths: 8, damage: 2032, mvp: true, score: 2 },
      ]},
    ],
  },

  // ========================================
  // NOVA SCRIM? Cole um bloco novo aqui embaixo!
  // Lembre-se: pode ter 3 rounds ou 4 rounds, o sistema se adapta!
  // ========================================
];