// Re-exporta os tipos do seu sistema existente
export type {
  XtreinoPlayerStat,
  PlayerAccumulatedStats,
  TeamAccumulatedStats,
} from "../../hooks/useXtreinoCalculations.js";

// Tipos específicos da tab (só o que não existe)
export interface XTreinoOption {
  id: number;
  name: string;
  date: string;
}