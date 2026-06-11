// pontuacao.ts
import { POSITION_POINTS, calcPosPoints } from '../../src/hooks/useXtreinoCalculations';

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