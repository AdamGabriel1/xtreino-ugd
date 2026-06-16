// src/app/scrims/index.ts
// Exporta todos os tipos e componentes do módulo de scrims

export * from "./types";
export { useScrimData } from "./hooks/useScrimData";
export { formatDate, getRankStyle, getPosColor, getPosBg } from "./utils/formatters";

// Components
export { EmptyState } from "./components/EmptyState";
export { RankBadge } from "./components/RankBadge";
export { DateFilter } from "./components/DateFilter";
export { HistorySummary } from "./components/HistorySummary";
export { LoadingState } from "./components/LoadingState";
export { ScrimTable } from "./components/tables/ScrimTable";

// Tabs
export { AgendadosTab } from "./components/tabs/AgendadosTab";
export { HistoricoTimesTab } from "./components/tabs/HistoricoTimesTab";
export { HistoricoJogadoresTab } from "./components/tabs/HistoricoJogadoresTab";

// Modals
export { ScrimDetailModal } from "./components/modals/ScrimDetailModal";
export { TeamStatsModal } from "./components/modals/TeamStatsModal";
export { PlayerStatsModal } from "./components/modals/PlayerStatsModal";