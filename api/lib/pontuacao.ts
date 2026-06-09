// ============================================================
// PONTUAÇÃO DO XTREINO - Underground
// ============================================================
// Centralizado aqui para uso em routers, seeds e scripts

export const PONTOS_POR_POSICAO: Record<number, number> = {
  1: 15,
  2: 12,
  3: 10,
  4: 9,
  5: 8,
  6: 7,
  7: 6,
  8: 5,
  9: 4,
  10: 3,
  11: 2,
  12: 1,
  13: 1,
  14: 0,
  15: 0,
};

export function getPontosPosicao(pos: number | null | undefined): number {
  if (pos == null || pos < 1) return 0;
  return PONTOS_POR_POSICAO[pos] ?? 0;
}

export function calcularPontosXtreino(
  q1Pos: number | null | undefined,
  q2Pos: number | null | undefined,
  q3Pos: number | null | undefined
): number {
  return getPontosPosicao(q1Pos) + getPontosPosicao(q2Pos) + getPontosPosicao(q3Pos);
}
