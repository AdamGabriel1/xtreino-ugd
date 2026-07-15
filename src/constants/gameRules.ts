// constants/gameRules.ts

/**
 * Pontuação por posição no Xtreino (Q1, Q2, Q3)
 */
export const XTREINO_POSITION_POINTS: Record<number, number> = {
  1: 15, 2: 12, 3: 10, 4: 9, 5: 8, 6: 7, 7: 6, 8: 5,
  9: 4, 10: 3, 11: 2, 12: 1, 13: 1, 14: 0, 15: 0,
};

/**
 * Pontuação por kill no Xtreino
 */
export const XTREINO_KILL_POINTS = 1;

/**
 * Pontuação por posição no Scrim (Modo BR)
 */
export const SCRIM_BR_POSITION_POINTS: Record<number, number> = {
  1: 15, 2: 12, 3: 10, 4: 9, 5: 8, 6: 7, 7: 6, 8: 5, 
  9: 4, 10: 3, 11: 2, 12: 1, 13: 1, 14: 0, 15: 0,
};

/**
 * Regras de Badges dos Jogadores
 */
export const PLAYER_BADGE_RULES = [
  // ==========================================
  // KILLS GERAIS (Progressão Vermelha)
  // ==========================================
  { label: "100 Kills", type: 'kills' as const, threshold: 100 },
  { label: "300 Kills", type: 'kills' as const, threshold: 300 },
  { label: "500 Kills", type: 'kills' as const, threshold: 500 },
  { label: "1000 Kills", type: 'kills' as const, threshold: 1000 },

  // ==========================================
  // PARTICIPAÇÕES EM XTREINOS (Progressão Azul)
  // ==========================================
  { label: "5 XTs", type: 'xtreinoMatches' as const, threshold: 5 },
  { label: "10 XTs", type: 'xtreinoMatches' as const, threshold: 10 },
  { label: "20 XTs", type: 'xtreinoMatches' as const, threshold: 20 },
  { label: "50 XTs", type: 'xtreinoMatches' as const, threshold: 50 },

  // ==========================================
  // PARTICIPAÇÕES EM SCRIMS (Progressão Ciano)
  // ==========================================
  { label: "5 Scrims", type: 'scrimMatches' as const, threshold: 5 },
  { label: "10 Scrims", type: 'scrimMatches' as const, threshold: 10 },
  { label: "20 Scrims", type: 'scrimMatches' as const, threshold: 20 },
  { label: "50 Scrims", type: 'scrimMatches' as const, threshold: 50 },

  // ==========================================
  // MVPS EM SCRIMS (Progressão Dourada)
  // ==========================================
  { label: "5 MVPs", type: 'scrimMvps' as const, threshold: 5 },
  { label: "10 MVPs", type: 'scrimMvps' as const, threshold: 10 },
  { label: "20 MVPs", type: 'scrimMvps' as const, threshold: 20 },

  // ==========================================
  // MESTRES DE QUARTERS (XTreinos)
  // ==========================================
  { label: "Q1 Master", type: 'xtreinoBestQ1' as const, threshold: 8 },
  { label: "Q2 Master", type: 'xtreinoBestQ2' as const, threshold: 8 },
  { label: "Q3 Master", type: 'xtreinoBestQ3' as const, threshold: 8 },
  
  // ==========================================
  // MAESTRIA DE ARMAS (Combina Q1, Q2 e Q3)
  // (Lógica especial aplicada na página)
  // ==========================================
  { label: "Full Weapon Master", type: 'fullMaster' as const, threshold: 1 },

  // ==========================================
  // TÍTULOS ESPECIAIS (Baseados na Média)
  // ==========================================
  { label: "Sniper", type: 'avg' as const, threshold: 8 },
  { label: "Elite", type: 'avg' as const, threshold: 12 },
  { label: "Imortal", type: 'avg' as const, threshold: 15 },
  
  // ==========================================
  // CONSISTÊNCIA E LONGEVIDADE
  // ==========================================
  { label: "Veterano", type: 'totalMatches' as const, threshold: 30 },
  { label: "Lenda", type: 'totalMatches' as const, threshold: 50 },
];

/**
 * Calcula as badges baseado nas regras definidas
 */
export function calculatePlayerBadges(stats: {
  totalKills: number;
  xtreinoMatches: number;
  scrimMatches: number;
  scrimMvps: number;
  xtreinoBestQ1: number;
  xtreinoBestQ2: number;
  xtreinoBestQ3: number;
  avg: number;
  totalMatches: number;
}): string[] {
  return PLAYER_BADGE_RULES
    .filter((rule) => {
      // Regra especial: Full Weapon Master (precisa ser master nos 3 quartos)
      if (rule.type === 'fullMaster') {
        return (
          stats.xtreinoBestQ1 >= 8 &&
          stats.xtreinoBestQ2 >= 8 &&
          stats.xtreinoBestQ3 >= 8
        );
      }

      // ✅ CORREÇÃO: Acessa o valor diretamente sem usar 'as Record'
      const value = stats[rule.type as keyof typeof stats];
      
      return typeof value === 'number' && value >= rule.threshold;
    })
    .map((rule) => rule.label);
}