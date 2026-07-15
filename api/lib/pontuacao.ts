// pontuacao.ts
import { XTREINO_POSITION_POINTS as POSITION_POINTS, XTREINO_KILL_POINTS as KILL_POINTS } from "@/constants/gameRules";
import { calcPosPoints } from "@/hooks/xtreinos/useXtreinoCalculations";

export { POSITION_POINTS as PONTOS_POR_POSICAO };
export const getPontosPosicao = calcPosPoints;

export function calcularPontosXtreino(
  q1Pos: number | null | undefined,
  q2Pos: number | null | undefined,
  q3Pos: number | null | undefined
): number {
  return (
    getPontosPosicao(q1Pos ?? null) +
    getPontosPosicao(q2Pos ?? null) +
    getPontosPosicao(q3Pos ?? null)
  );
}