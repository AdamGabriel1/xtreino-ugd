import { getDb } from "../../api/queries/connection.js";
import { eq } from "drizzle-orm";
// import { championships, xtreinos, teams, players } from "@db/schema.js";

/**
 * Seed do dia {{DATE}}
 * Descricao: (adicione aqui o que este seed faz)
 *
 * IMPORTANTE: Este seed deve ser IDEMPOTENTE.
 * Use upsert (verificar se existe antes de inserir).
 */

export function seed() {
  const db = getDb();
  console.log("[SEED {{DATE}}] Starting...");

  // Exemplo: adicionar novo campeonato
  // const existing = db
  //   .select()
  //   .from(championships)
  //   .where(eq(championships.name, "Nome do Campeonato"))
  //   .get();
  //
  // if (!existing) {
  //   db.insert(championships).values({
  //     name: "Nome do Campeonato",
  //     modality: "squad",
  //     format: "mata_mata",
  //     status: "em_breve",
  //     startDate: "2026-06-XX",
  //     endDate: "2026-06-XX",
  //     rules: "Regras aqui",
  //     prizePool: "R$ 0,00",
  //     maxTeams: 16,
  //     registeredTeams: 0,
  //   }).run();
  //   console.log("[SEED {{DATE}}] Championship created");
  // } else {
  //   console.log("[SEED {{DATE}}] Championship already exists");
  // }

  console.log("[SEED {{DATE}}] Done!");
}