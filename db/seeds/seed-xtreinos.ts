// db/seed/seed-xtreinos.ts
// 🚀 SEED GENÉRICO — NUNCA mais edite este arquivo!
// Ele lê os dados de xtreinos-dados.ts e insere no banco automaticamente.

import { getDb } from "../../api/queries/connection.js";
import { eq, and } from "drizzle-orm";
import { xtreinos, xtreinoResults, xtreinoPlayerStats } from "@db/schema.js";
import { calcularPontosXtreino } from "../../api/lib/pontuacao.js";
import { xtreinosRaw } from "./xtreinos-dados.js";
//import { xtreinosRawNovo } from "./xtreinos-dados-novo.js"; // 🆕

// Junta tudo
//const allXtreinos = [...xtreinosRaw, ...xtreinosRawNovo];

export function seedAllXtreinos() {
  const db = getDb();
  console.log("[SEED XTREINOS] Starting generic seed...");

  let totalColocacoes = 0;
  let totalJogadores = 0;
  let totalXtreinos = 0;


  for (const xt of xtreinosRaw) {
    // 1. Cria o registro do xtreino (se não existir)
    const existingXt = db
      .select()
      .from(xtreinos)
      .where(eq(xtreinos.id, xt.id))
      .get();

    if (!existingXt) {
      db.insert(xtreinos).values({
        id: xt.id,
        name: `XTreino Underground - ${xt.date.split("-").reverse().join("/")}`,
        date: xt.date,
        timeBr: "21:00",
        modality: "squad",
        maxTeams: 20,
        status: "finalizado",
      }).run();
      console.log(`[SEED] XTreino ${xt.id} (${xt.date}) criado`);
      totalXtreinos++;
    }

    // 2. Insere colocações das equipes
    for (const [teamName, q1Pos, q2Pos, q3Pos] of xt.colocacoes) {
      const existing = db
        .select()
        .from(xtreinoResults)
        .where(
          and(
            eq(xtreinoResults.xtreinoId, xt.id),
            eq(xtreinoResults.teamName, teamName)
          )
        )
        .get();

      if (!existing) {
        const totalPoints = calcularPontosXtreino(q1Pos, q2Pos, q3Pos);
        db.insert(xtreinoResults).values({
          date: xt.date,
          xtreinoId: xt.id,
          teamName,
          q1Pos,
          q2Pos,
          q3Pos,
          totalPoints,
        }).run();
        totalColocacoes++;
      }
    }

    // 3. Insere estatísticas dos jogadores
    for (const [teamName, playerName, q1Kills, q2Kills, q3Kills] of xt.jogadores) {
      const existing = db
        .select()
        .from(xtreinoPlayerStats)
        .where(
          and(
            eq(xtreinoPlayerStats.xtreinoId, xt.id),
            eq(xtreinoPlayerStats.playerName, playerName)
          )
        )
        .get();

      if (!existing) {
        db.insert(xtreinoPlayerStats).values({
          date: xt.date,
          xtreinoId: xt.id,
          teamName,
          playerName,
          q1Kills,
          q2Kills,
          q3Kills,
          totalKills: q1Kills + q2Kills + q3Kills, // ✅ calculado automatico!
        }).run();
        totalJogadores++;
      }
    }
  }

  console.log(`[SEED XTREINOS] ${totalXtreinos} xtreinos criados`);
  console.log(`[SEED XTREINOS] ${totalColocacoes} colocações inseridas`);
  console.log(`[SEED XTREINOS] ${totalJogadores} estatísticas de jogadores inseridas`);
  console.log("[SEED XTREINOS] Done!");
}