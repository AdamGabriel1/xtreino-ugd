// db/seeds/seed-scrims.ts
// 🚀 SEED GENÉRICO — NUNCA mais edite este arquivo!
// Ele lê os dados de scrims-dados.ts, calcula os totais e insere no banco.

import { getDb } from "../../api/queries/connection.js";
import { scrims, scrimResults, scrimResultRounds, scrimPlayerStats, scrimPlayerStatRounds } from "../schema.js";
import { eq, inArray } from "drizzle-orm";
import { scrimsRaw } from "./scrims-dados.js";

export function seedAllScrims() {
  const db = getDb();
  console.log("[SEED SCRIMS] Starting generic seed...");

  let totalScrims = 0;
  let totalJogadores = 0;

  for (const s of scrimsRaw) {
    // 1. Limpa dados antigos do ID para poder re-rodar
    db.delete(scrimPlayerStatRounds).where(
      inArray(
        scrimPlayerStatRounds.scrimPlayerStatId, 
        db.select({ id: scrimPlayerStats.id }).from(scrimPlayerStats).where(eq(scrimPlayerStats.scrimId, s.id))
      )
    ).run();

    db.delete(scrimPlayerStats).where(eq(scrimPlayerStats.scrimId, s.id)).run();

    db.delete(scrimResultRounds).where(
      inArray(
        scrimResultRounds.scrimResultId, 
        db.select({ id: scrimResults.id }).from(scrimResults).where(eq(scrimResults.scrimId, s.id))
      )
    ).run();

    db.delete(scrimResults).where(eq(scrimResults.scrimId, s.id)).run();
    
    const existingScrim = db.select().from(scrims).where(eq(scrims.id, s.id)).get();
    if (existingScrim) {
      db.delete(scrims).where(eq(scrims.id, s.id)).run();
    }

    // 2. Cria o registro da scrim
    db.insert(scrims).values({
      id: s.id,
      name: s.name,
      date: s.date,
      time: "21:00",
      modality: "4v4",
      mode: "mme",
      status: "concluido",
      result: s.result,
    }).run();
    totalScrims++;

    // 3. Insere resultados dos times baseado no roundResults
    const res1 = db.insert(scrimResults).values({
      scrimId: s.id,
      date: s.date,
      teamName: s.team1Name,
    }).run();
    
    db.insert(scrimResultRounds).values(
      s.roundResults.map(([valueT1, valueT2], index) => ({ 
        scrimResultId: Number(res1.lastInsertRowid), 
        roundNumber: index + 1, 
        value: valueT1 
      }))
    ).run();

    const res2 = db.insert(scrimResults).values({
      scrimId: s.id,
      date: s.date,
      teamName: s.team2Name,
    }).run();

    db.insert(scrimResultRounds).values(
      s.roundResults.map(([valueT1, valueT2], index) => ({ 
        scrimResultId: Number(res2.lastInsertRowid), 
        roundNumber: index + 1, 
        value: valueT2 
      }))
    ).run();

    // 4. Insere estatísticas dos jogadores (Calculando Tudo Automaticamente)
    for (const player of s.jogadores) {
      
      // MATH MÁGICO AQUI: Soma todos os kills, assists, deaths, damage e conta os MVPs (true = 1)
      const totalKills = player.rounds.reduce((sum, r) => sum + r.kills, 0);
      const totalAssists = player.rounds.reduce((sum, r) => sum + r.assists, 0);
      const totalDeaths = player.rounds.reduce((sum, r) => sum + r.deaths, 0);
      const totalDamage = player.rounds.reduce((sum, r) => sum + r.damage, 0);
      const totalMvp = player.rounds.reduce((sum, r) => sum + (r.mvp ? 1 : 0), 0);

      const res = db.insert(scrimPlayerStats).values({
        scrimId: s.id,
        date: s.date,
        teamName: player.teamName,
        playerName: player.playerName,
        totalKills,
        totalAssists,
        totalDeaths,
        totalDamage,
        totalMvp,
      }).run();
      const statId = Number(res.lastInsertRowid);

      // Cria os registros de round dinamicamente (serve para 3 ou 4 rounds!)
      const dynamicRounds = player.rounds.map((r, index) => ({
        scrimPlayerStatId: statId,
        roundNumber: index + 1,
        kills: r.kills,
        assists: r.assists,
        deaths: r.deaths,
        damage: r.damage,
        mvp: r.mvp,
        score: r.score,
      }));

      db.insert(scrimPlayerStatRounds).values(dynamicRounds).run();
      totalJogadores++;
    }
  }

  console.log(`[SEED SCRIMS] ${totalScrims} scrims criados`);
  console.log(`[SEED SCRIMS] ${totalJogadores} estatísticas de jogadores inseridas (Totais calculados auto)`);
  console.log("[SEED SCRIMS] Done!");
}