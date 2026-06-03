import { getDb } from "../api/queries/connection.js";
import { seedRuns } from "./schema.js";
import { eq } from "drizzle-orm";

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
