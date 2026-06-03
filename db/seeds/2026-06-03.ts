import { getDb } from "../../api/queries/connection.js";
import { championships, xtreinos } from "../schema.js";

/**
 * Seed do dia 03/06/2026
 * Adiciona novos campeonatos e xtreinos.
 *
 * IMPORTANTE: Este seed deve ser IDEMPOTENTE.
 * Use upsert (verificar se existe antes de inserir).
 */

export function seed() {
  const db = getDb();
  console.log("[SEED 2026-06-03] Adding daily data...");

  // --- Novo campeonato ---
  const existing = db
    .select()
    .from(championships)
    .where(eq(championships.name, "Summer Showdown 2026"))
    .get();

  if (!existing) {
    db.insert(championships).values({
      name: "Summer Showdown 2026",
      modality: "squad",
      format: "mata_mata",
      status: "em_breve",
      startDate: "2026-06-15",
      endDate: "2026-06-25",
      rules: "Formato Squad\nPontuacao padrao competitiva",
      prizePool: "R$ 3.000,00",
      maxTeams: 24,
      registeredTeams: 0,
    }).run();
    console.log("[SEED 2026-06-03] Championship 'Summer Showdown 2026' created");
  } else {
    console.log("[SEED 2026-06-03] Championship 'Summer Showdown 2026' already exists");
  }

  // --- Novo xtreino ---
  const existingXt = db
    .select()
    .from(xtreinos)
    .where(eq(xtreinos.name, "XTreino Devils - Semana 3"))
    .get();

  if (!existingXt) {
    db.insert(xtreinos).values({
      name: "XTreino Devils - Semana 3",
      date: "2026-06-19",
      timeMx: "5:00 PM",
      timeBr: "8:00 PM",
      modality: "squad",
      maxTeams: 12,
      rules: "Sala privada\nPontuacao competitiva",
      discordLink: "https://discord.gg/devils",
      whatsappLink: "https://wa.me/5511999999999",
      status: "aberto",
    }).run();
    console.log("[SEED 2026-06-03] XTreino 'Semana 3' created");
  } else {
    console.log("[SEED 2026-06-03] XTreino 'Semana 3' already exists");
  }

  console.log("[SEED 2026-06-03] Done!");
}
