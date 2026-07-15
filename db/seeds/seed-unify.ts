// db/seeds/seed-unify.ts
import { getDb } from "../../api/queries/connection.js";
import { players, playerAliases, teamAliases, unifiedPlayerStats, unifiedTeamStats, seedRuns, teams } from "../schema.js";
import { eq } from "drizzle-orm";
import { xtreinosRaw } from "./xtreinos-dados.js";
import { scrimsRaw } from "./scrims-dados.js";
// import { campeonatosRaw } from "./campeonatos-dados.js"; // quando tiver

// ============================================================
// RESOLVER ALIAS → ID (Busca 100% Exata)
// ============================================================

function resolvePlayerAlias(db: ReturnType<typeof getDb>, rawName: string): number | null {
  if (!rawName || rawName.trim() === "") return null;
  
  const name = rawName.trim();

  // 1. Busca exata pelo NOME CANÔNICO do jogador
  const directPlayer = db.select()
    .from(players)
    .where(eq(players.nickname, name))
    .get();
  if (directPlayer) return directPlayer.id;

  // 2. Busca exata na tabela de ALIASES
  const exact = db.select()
    .from(playerAliases)
    .where(eq(playerAliases.alias, name))
    .get();
  if (exact) return exact.playerId;

  return null; // Não resolveu — será reportado como "órfão"
}

function resolveTeamAlias(db: ReturnType<typeof getDb>, rawName: string): number | null {
  if (!rawName || rawName.trim() === "") return null;
  
  const name = rawName.trim();

  // 1. Busca exata pelo NOME CANÔNICO do time
  const directTeam = db.select()
    .from(teams)
    .where(eq(teams.name, name))
    .get();
  if (directTeam) return directTeam.id;

  // 2. Busca exata na tabela de ALIASES
  const exact = db.select()
    .from(teamAliases)
    .where(eq(teamAliases.alias, name))
    .get();
  if (exact) return exact.teamId;

  return null; // Não resolveu — será reportado como "órfão"
}

// ============================================================
// LÓGICA PRINCIPAL
// ============================================================

export function seed() {
  const db = getDb();
  console.log("[UNIFY] Starting data unification...");

  const orphanPlayers = new Set<string>();
  const orphanTeams = new Set<string>();

  // =============================================
  // FASE 1: Processar XTREINOS
  // =============================================
  console.log("[UNIFY] Processing xtreinos...");
  
  for (const xtreino of xtreinosRaw) {
    // Processar colocações de times
    for (const [teamName, q1, q2, q3] of xtreino.colocacoes) {
      const teamId = resolveTeamAlias(db, teamName);
      if (!teamId) {
        orphanTeams.add(teamName);
        continue;
      }

      // Upsert unified team stats
      const existing = db.select().from(unifiedTeamStats).where(eq(unifiedTeamStats.teamId, teamId)).get();
      if (existing) {
        db.update(unifiedTeamStats).set({
          xtreinoMatches: existing.xtreinoMatches + 1,
          xtreinoWins: existing.xtreinoWins + (q1 === 1 ? 1 : 0),
          xtreinoTotalPoints: existing.xtreinoTotalPoints + getPointsFromPosition(q1) + getPointsFromPosition(q2) + getPointsFromPosition(q3),
          updatedAt: new Date(),
        }).where(eq(unifiedTeamStats.teamId, teamId)).run();
      } else {
        db.insert(unifiedTeamStats).values({
          teamId,
          xtreinoMatches: 1,
          xtreinoWins: q1 === 1 ? 1 : 0,
          xtreinoTotalPoints: getPointsFromPosition(q1) + getPointsFromPosition(q2) + getPointsFromPosition(q3),
        }).run();
      }
    }

    // Processar jogadores
    for (const [teamName, playerName, q1, q2, q3] of xtreino.jogadores) {
      const playerId = resolvePlayerAlias(db, playerName);
      if (!playerId) {
        orphanPlayers.add(playerName);
        continue;
      }

      const totalKills = q1 + q2 + q3;
      const teamId = resolveTeamAlias(db, teamName);

      // ---------------------------------------------------------
      // REGRA DO "EMPRESTIMO" / JOGAR POR OUTRA LINE
      // ---------------------------------------------------------
      // O jogador SEMPRE recebe suas kills individuais.
      // Mas só somamos as kills no placar do TIME se o time que 
      // ele está jogando naquele momento for o time CANÔNICO dele.
      // ---------------------------------------------------------
      const playerData = db.select().from(players).where(eq(players.id, playerId)).get();
      const isPlayingForCanonicalTeam = playerData && teamId && playerData.teamId === teamId;

      if (isPlayingForCanonicalTeam && teamId) {
        const teamStats = db.select().from(unifiedTeamStats).where(eq(unifiedTeamStats.teamId, teamId)).get();
        if (teamStats) {
          db.update(unifiedTeamStats).set({
            xtreinoKills: teamStats.xtreinoKills + totalKills,
            updatedAt: new Date(),
          }).where(eq(unifiedTeamStats.teamId, teamId)).run();
        }
      }

      // Atualizar stats INDIVIDUAIS do jogador (independente da line)
      const existing = db.select().from(unifiedPlayerStats).where(eq(unifiedPlayerStats.playerId, playerId)).get();
      if (existing) {
        db.update(unifiedPlayerStats).set({
          xtreinoMatches: existing.xtreinoMatches + 1,
          xtreinoKills: existing.xtreinoKills + totalKills,
          xtreinoBestQ1: Math.max(existing.xtreinoBestQ1, q1),
          xtreinoBestQ2: Math.max(existing.xtreinoBestQ2, q2),
          xtreinoBestQ3: Math.max(existing.xtreinoBestQ3, q3),
          totalMatches: existing.totalMatches + 1,
          totalKills: existing.totalKills + totalKills,
          updatedAt: new Date(),
        }).where(eq(unifiedPlayerStats.playerId, playerId)).run();
      } else {
        db.insert(unifiedPlayerStats).values({
          playerId,
          xtreinoMatches: 1,
          xtreinoKills: totalKills,
          xtreinoBestQ1: q1,
          xtreinoBestQ2: q2,
          xtreinoBestQ3: q3,
          totalMatches: 1,
          totalKills: totalKills,
        }).run();
      }
    }
  }

  // =============================================
  // FASE 2: Processar SCRIMS
  // =============================================
  console.log("[UNIFY] Processing scrims...");

  for (const scrim of scrimsRaw) {
    const team1Id = resolveTeamAlias(db, scrim.team1Name);
    const team2Id = resolveTeamAlias(db, scrim.team2Name);
    if (!team1Id) orphanTeams.add(scrim.team1Name);
    if (!team2Id) orphanTeams.add(scrim.team2Name);

    // Determinar vencedor
    let team1RoundWins = 0;
    let team2RoundWins = 0;
    for (const [s1, s2] of scrim.roundResults) {
      if (s1 > s2) team1RoundWins++;
      else if (s2 > s1) team2RoundWins++;
    }

    // Atualizar stats dos times
    for (const [tId, rWins, rLosses] of [
      [team1Id, team1RoundWins, team2RoundWins] as const,
      [team2Id, team2RoundWins, team1RoundWins] as const,
    ]) {
      if (!tId) continue;
      const existing = db.select().from(unifiedTeamStats).where(eq(unifiedTeamStats.teamId, tId)).get();
      if (existing) {
        db.update(unifiedTeamStats).set({
          scrimMatches: existing.scrimMatches + 1,
          scrimWins: existing.scrimWins + (rWins > rLosses ? 1 : 0),
          scrimLosses: existing.scrimLosses + (rWins < rLosses ? 1 : 0),
          scrimRoundsWon: existing.scrimRoundsWon + rWins,
          scrimRoundsLost: existing.scrimRoundsLost + rLosses,
          totalMatches: existing.totalMatches + 1,
          totalWins: existing.totalWins + (rWins > rLosses ? 1 : 0),
          updatedAt: new Date(),
        }).where(eq(unifiedTeamStats.teamId, tId)).run();
      } else {
        db.insert(unifiedTeamStats).values({
          teamId: tId,
          scrimMatches: 1,
          scrimWins: rWins > rLosses ? 1 : 0,
          scrimLosses: rWins < rLosses ? 1 : 0,
          scrimRoundsWon: rWins,
          scrimRoundsLost: rLosses,
          totalMatches: 1,
          totalWins: rWins > rLosses ? 1 : 0,
        }).run();
      }
    }

    // Processar jogadores da scrim
    for (const player of scrim.jogadores) {
      const playerId = resolvePlayerAlias(db, player.playerName);
      if (!playerId) {
        orphanPlayers.add(player.playerName);
        continue;
      }

      // Calcular totais do jogador nesta scrim
      const pKills = player.rounds.reduce((s, r) => s + r.kills, 0);
      const pAssists = player.rounds.reduce((s, r) => s + r.assists, 0);
      const pDeaths = player.rounds.reduce((s, r) => s + r.deaths, 0);
      const pDamage = player.rounds.reduce((s, r) => s + r.damage, 0);
      const pMvps = player.rounds.filter(r => r.mvp).length;
      const roundsPlayed = player.rounds.filter(r => !(r.kills === 0 && r.deaths === 0 && r.damage === 0)).length;

      // Determinar se o time do jogador venceu
      const isTeam1 = player.teamName === scrim.team1Name;
      const playerTeamWon = isTeam1 ? team1RoundWins > team2RoundWins : team2RoundWins > team1RoundWins;

      // Stats INDIVIDUAIS sempre sobem
      const existing = db.select().from(unifiedPlayerStats).where(eq(unifiedPlayerStats.playerId, playerId)).get();
      if (existing) {
        const newScrimKills = existing.scrimKills + pKills;
        const newScrimDeaths = existing.scrimDeaths + pDeaths;
        db.update(unifiedPlayerStats).set({
          scrimMatches: existing.scrimMatches + 1,
          scrimRounds: existing.scrimRounds + roundsPlayed,
          scrimKills: newScrimKills,
          scrimAssists: existing.scrimAssists + pAssists,
          scrimDeaths: newScrimDeaths,
          scrimDamage: existing.scrimDamage + pDamage,
          scrimMvps: existing.scrimMvps + pMvps,
          scrimWins: existing.scrimWins + (playerTeamWon ? 1 : 0),
          scrimLosses: existing.scrimLosses + (playerTeamWon ? 0 : 1),
          totalMatches: existing.totalMatches + 1,
          totalKills: existing.totalKills + pKills,
          scrimKdRatio: newScrimDeaths > 0 ? Math.round((newScrimKills / newScrimDeaths) * 100) / 100 : newScrimKills,
          updatedAt: new Date(),
        }).where(eq(unifiedPlayerStats.playerId, playerId)).run();
      } else {
        db.insert(unifiedPlayerStats).values({
          playerId,
          scrimMatches: 1,
          scrimRounds: roundsPlayed,
          scrimKills: pKills,
          scrimAssists: pAssists,
          scrimDeaths: pDeaths,
          scrimDamage: pDamage,
          scrimMvps: pMvps,
          scrimWins: playerTeamWon ? 1 : 0,
          scrimLosses: playerTeamWon ? 0 : 1,
          totalMatches: 1,
          totalKills: pKills,
          scrimKdRatio: pDeaths > 0 ? Math.round((pKills / pDeaths) * 100) / 100 : pKills,
        }).run();
      }
    }
  }

  // =============================================
  // FASE 3: Processar CAMPEONATOS (quando tiver dados)
  // =============================================
  // ... mesma lógica dos xtreinos (BR = kills por queda)

  // =============================================
  // FASE 4: Calcular totais finais e marcar como unificado
  // =============================================
  console.log("[UNIFY] Finalizing...");

  const allPlayerStats = db.select().from(unifiedPlayerStats).all();
  for (const ps of allPlayerStats) {
    db.update(unifiedPlayerStats).set({
      totalMatches: ps.xtreinoMatches + ps.scrimMatches + ps.campeonatoMatches,
      totalKills: ps.xtreinoKills + ps.scrimKills + ps.campeonatoKills,
      updatedAt: new Date(),
    }).where(eq(unifiedPlayerStats.playerId, ps.playerId)).run();

    // Marcar player como unificado
    db.update(players).set({ isUnified: true }).where(eq(players.id, ps.playerId)).run();
  }

  const allTeamStats = db.select().from(unifiedTeamStats).all();
  for (const ts of allTeamStats) {
    db.update(unifiedTeamStats).set({
      totalMatches: ts.xtreinoMatches + ts.scrimMatches + ts.campeonatoMatches,
      totalKills: ts.xtreinoKills + ts.scrimKills + ts.campeonatoKills,
      totalWins: ts.xtreinoWins + ts.scrimWins + ts.campeonatoWins,
      updatedAt: new Date(),
    }).where(eq(unifiedTeamStats.teamId, ts.teamId)).run();
  }

  // =============================================
  // RELATÓRIO DE ÓRFÃOS
  // =============================================
  console.log("\n[UNIFY] === ORPHAN REPORT ===");
  console.log(`[UNIFY] Orphan players (${orphanPlayers.size}):`);
  for (const p of [...orphanPlayers].sort()) {
    console.log(`  ❌ "${p}"`);
  }
  console.log(`[UNIFY] Orphan teams (${orphanTeams.size}):`);
  for (const t of [...orphanTeams].sort()) {
    console.log(`  ❌ "${t}"`);
  }
  console.log("[UNIFY] === END REPORT ===\n");

  console.log("[UNIFY] Unification completed!");
}

function getPointsFromPosition(pos: number): number {
  if (pos <= 0 || pos > 20) return 0;
  // Sistema de pontos invertido: 1º = 20pts, 2º = 18pts, etc
  const points = [0, 20, 18, 16, 14, 12, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0, 0, 0, 0];
  return points[pos] || 0;
}