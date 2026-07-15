// db/utils/normalize.ts

/**
 * "Normaliza" um nickname apenas removendo espaços nas pontas.
 * 
 * ⚠️  REMOVEMOS as regex complexas porque:
 * 1. Elas apagavam letras acentuadas legítimas (Ex: "Éourso" virava "").
 * 2. Elas causavam colisões (Ex: "UGD Xoxoto" e "Xoxoto" viravam o mesmo valor).
 * 
 * A resolução de quem é quem agora é 100% feita pela tabela de ALIASES 
 * mapeada manualmente no seed-aliases.ts.
 */
export function normalizeNickname(raw: string): string {
  return raw.trim();
}

/**
 * "Normaliza" nome de time apenas removendo espaços nas pontas.
 * A resolução de times misturados (ex: "FURY ELITE / MIX") também é 
 * feita 100% pela tabela de ALIASES no seed-aliases.ts.
 */
export function normalizeTeamName(raw: string): string {
  return raw.trim();
}