import { getDb } from "../api/queries/connection.js";
import { seedRuns } from "./schema.js";
import { eq, inArray } from "drizzle-orm";

export type SeedFn = () => void;

export interface SeedDefinition {
  name: string;
  fn: SeedFn;
}

/**
 * Verifica se um seed já foi executado.
 */
export function wasSeedExecuted(seedName: string): boolean {
  const db = getDb();
  const record = db.select().from(seedRuns).where(eq(seedRuns.seedName, seedName)).get();
  return !!record;
}

/**
 * Marca um seed como executado no banco.
 */
export function markSeedExecuted(seedName: string): void {
  const db = getDb();
  db.insert(seedRuns).values({ seedName }).run();
}

/**
 * Executa um seed apenas se ainda não tiver sido executado.
 * Retorna true se executou, false se já tinha sido executado.
 */
export function runSeedIfNeeded(seedName: string, seedFn: SeedFn): boolean {
  if (wasSeedExecuted(seedName)) {
    console.log(`[SEED-RUNNER] "${seedName}" already executed, skipping`);
    return false;
  }

  console.log(`[SEED-RUNNER] Running "${seedName}"...`);
  seedFn();
  markSeedExecuted(seedName);
  console.log(`[SEED-RUNNER] "${seedName}" completed and recorded`);
  return true;
}

/**
 * Executa uma lista de seeds em ordem, pulando os já executados.
 */
export function runSeeds(seeds: SeedDefinition[]): void {
  for (const { name, fn } of seeds) {
    runSeedIfNeeded(name, fn);
  }
}

/**
 * 🆕 Limpa registros antigos de seed_runs para permitir re-execução.
 * Use durante migrações (ex: quando muda de seeds individuais para genérico).
 * Por padrão limpa os seeds de xtreino antigos + logos.
 * Passe um array customizado se precisar limpar outros.
 */
export function clearSeedRuns(seedNames?: string[]): void {
  const db = getDb();
  const defaultSeeds = [
    "xtreino_historico",
    "xtreino_08062026",
    "xtreino_09062026",
    "xtreino_10062026",
    "xtreinos_all",
    "logos",
  ];
  const toClear = seedNames ?? defaultSeeds;

  const result = db
    .delete(seedRuns)
    .where(inArray(seedRuns.seedName, toClear))
    .run();

  console.log(`[SEED-RUNNER] Cleared ${result.changes} seed run(s): ${toClear.join(", ")}`);
}

/**
 * 🆕 Reseta TODOS os seeds (⚠️ cuidado! Use só em dev).
 */
export function resetAllSeedRuns(): void {
  const db = getDb();
  const result = db.delete(seedRuns).run();
  console.log(`[SEED-RUNNER] ⚠️  ALL seed runs deleted (${result.changes} records)`);
}