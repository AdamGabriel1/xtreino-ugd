// src/hooks/useXtreinoTabs.ts
export { useRankingGeralTab, useRankingMensalTab, useRankingSemanalTab, useRankingClasTab } from './tabs/useXtreinoRankings';

// Adicionado o useXTreinosTab aqui:
export { useDueloTab, useEvolucaoTab, useHeadToHeadTab, usePredicoesTab, useHistoricoGeralTab, usePredicoesOusadoTab, useMomentosCarousel, useCrossfireTab, useXTreinosTab } from './tabs/useXtreinoAnalysis';

export type { TeamPowerStats, PredictionReason, PredictionData } from './tabs/useXtreinoAnalysis';

export { useScrimPlayersRankingTab, useScrimTeamsRankingTab } from './tabs/useScrimRankings';
export type { ScrimSummaryCard } from './tabs/useScrimRankings';