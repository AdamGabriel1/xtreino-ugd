import { getDb } from "../../api/queries/connection.js";
import { eq, and } from "drizzle-orm";
import {
  xtreinoResults,
  xtreinoPlayerStats,
  rankings,
} from "../schema.js";
import { calcularPontosXtreino } from "../../api/lib/pontuacao.js";

/**
 * Seed de dados históricos do XTREINO da Underground
 * Dados importados dos antigos xtreinos da Red Devils (Devils Mobile League)
 * Agora migrados para a Underground
 *
 * Xtreinos acontecem: Segunda a Sexta, 21h (BRT)
 * Datas históricas: Abril 30, Maio 7, Maio 19, Maio 21
 */

// Map de datas para xtreinoId (para dados históricos)
const dateToXtreinoId = {
  "2026-04-30": 1,
  "2026-05-07": 2,
  "2026-05-19": 3,
  "2026-05-21": 4,
};

export function seedXtreinoHistorico() {
  const db = getDb();
  console.log("[SEED XTREINO-HISTORICO] Starting...");

  // ============================================================
  // RESULTADOS POR EQUIPE (Colocações do Xtreino)
  // ============================================================
  const xtreinoColocacoesData = [
    { date: "2026-05-19", xtreinoId: 3, teamName: "UGD Threat", q1Pos: 1, q2Pos: 4, q3Pos: 1 },
    { date: "2026-05-19", xtreinoId: 3, teamName: "RED", q1Pos: 2, q2Pos: 7, q3Pos: 4 },
    { date: "2026-05-19", xtreinoId: 3, teamName: "RED Magic BR", q1Pos: 3, q2Pos: 1, q3Pos: 7 },
    { date: "2026-05-19", xtreinoId: 3, teamName: "LMF", q1Pos: 4, q2Pos: 6, q3Pos: 5 },
    { date: "2026-05-19", xtreinoId: 3, teamName: "KOV", q1Pos: 5, q2Pos: 5, q3Pos: 3 },
    { date: "2026-05-19", xtreinoId: 3, teamName: "CMF", q1Pos: 7, q2Pos: 3, q3Pos: 2 },
    { date: "2026-05-19", xtreinoId: 3, teamName: "Eternity", q1Pos: 6, q2Pos: 2, q3Pos: 6 },
    { date: "2026-05-21", xtreinoId: 4, teamName: "UGD Threat", q1Pos: 1, q2Pos: 3, q3Pos: 4 },
    { date: "2026-05-21", xtreinoId: 4, teamName: "Time I", q1Pos: 2, q2Pos: 6, q3Pos: 3 },
    { date: "2026-05-21", xtreinoId: 4, teamName: "CMF", q1Pos: 3, q2Pos: 4, q3Pos: 1 },
    { date: "2026-05-21", xtreinoId: 4, teamName: "RED", q1Pos: 4, q2Pos: 2, q3Pos: 2 },
    { date: "2026-05-21", xtreinoId: 4, teamName: "KOV", q1Pos: 5, q2Pos: 1, q3Pos: 6 },
    { date: "2026-05-21", xtreinoId: 4, teamName: "Time E", q1Pos: 6, q2Pos: 5, q3Pos: 5 },
    { date: "2026-05-07", xtreinoId: 2, teamName: "UGD Threat", q1Pos: 1, q2Pos: 1, q3Pos: 1 },
    { date: "2026-05-07", xtreinoId: 2, teamName: "CMF", q1Pos: 2, q2Pos: 4, q3Pos: 5 },
    { date: "2026-05-07", xtreinoId: 2, teamName: "INF", q1Pos: 3, q2Pos: 6, q3Pos: 4 },
    { date: "2026-05-07", xtreinoId: 2, teamName: "LMF", q1Pos: 4, q2Pos: 2, q3Pos: 6 },
    { date: "2026-05-07", xtreinoId: 2, teamName: "Misturado", q1Pos: 5, q2Pos: 6, q3Pos: 3 },
    { date: "2026-05-07", xtreinoId: 2, teamName: "Eternity", q1Pos: 6, q2Pos: 3, q3Pos: 6 },
    { date: "2026-05-07", xtreinoId: 2, teamName: "RED", q1Pos: 6, q2Pos: 5, q3Pos: 2 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "UGD Threat", q1Pos: 1, q2Pos: 1, q3Pos: 3 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "FURY", q1Pos: 2, q2Pos: 6, q3Pos: 6 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "RED", q1Pos: 3, q2Pos: 6, q3Pos: 6 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "UGD Royal", q1Pos: 4, q2Pos: 5, q3Pos: 6 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "Λつつ", q1Pos: 5, q2Pos: 2, q3Pos: 2 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "ODS", q1Pos: 6, q2Pos: 6, q3Pos: 6 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "INF", q1Pos: 6, q2Pos: 4, q3Pos: 6 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "CMF", q1Pos: 6, q2Pos: 3, q3Pos: 4 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "Eternity", q1Pos: 6, q2Pos: 6, q3Pos: 1 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "LMF", q1Pos: 6, q2Pos: 6, q3Pos: 5 },
  ];

  let colocacoesCount = 0;
  for (const data of xtreinoColocacoesData) {
    const existing = db
      .select()
      .from(xtreinoResults)
      .where(
        and(
          eq(xtreinoResults.xtreinoId, data.xtreinoId),
          eq(xtreinoResults.teamName, data.teamName)
        )
      )
      .get();

    if (!existing) {
      db.insert(xtreinoResults).values(data).run();
      colocacoesCount++;
    }
  }
  console.log(`[SEED XTREINO-HISTORICO] ${colocacoesCount} colocações inseridas`);

  // ============================================================
  // ESTATÍSTICAS DOS JOGADORES (Xtreino Underground)
  // ============================================================
  const xtreinoJogadoresData = [
    // 2026-05-19 (xtreinoId: 3)
    { date: "2026-05-19", xtreinoId: 3, teamName: "UGD Threat", playerName: "UGD Treon", q1Kills: 11, q2Kills: 12, q3Kills: 13, totalKills: 36 },
    { date: "2026-05-19", xtreinoId: 3, teamName: "UGD Threat", playerName: "UGD cool7", q1Kills: 8, q2Kills: 10, q3Kills: 6, totalKills: 24 },
    { date: "2026-05-19", xtreinoId: 3, teamName: "UGD Threat", playerName: "UGD Kaze", q1Kills: 13, q2Kills: 1, q3Kills: 8, totalKills: 22 },
    { date: "2026-05-19", xtreinoId: 3, teamName: "UGD Threat", playerName: "UGD ARISE", q1Kills: 8, q2Kills: 8, q3Kills: 4, totalKills: 20 },
    { date: "2026-05-19", xtreinoId: 3, teamName: "RED", playerName: "RED snow777", q1Kills: 3, q2Kills: 0, q3Kills: 1, totalKills: 4 },
    { date: "2026-05-19", xtreinoId: 3, teamName: "RED", playerName: "RED APENAS", q1Kills: 7, q2Kills: 0, q3Kills: 4, totalKills: 11 },
    { date: "2026-05-19", xtreinoId: 3, teamName: "RED", playerName: "CF ALMEIDA", q1Kills: 0, q2Kills: 0, q3Kills: 1, totalKills: 1 },
    { date: "2026-05-19", xtreinoId: 3, teamName: "RED", playerName: "LMF Boss", q1Kills: 5, q2Kills: 0, q3Kills: 3, totalKills: 8 },
    { date: "2026-05-19", xtreinoId: 3, teamName: "RED Magic BR", playerName: "RED LANGO", q1Kills: 4, q2Kills: 7, q3Kills: 0, totalKills: 11 },
    { date: "2026-05-19", xtreinoId: 3, teamName: "RED Magic BR", playerName: "RED KENNZY", q1Kills: 6, q2Kills: 6, q3Kills: 0, totalKills: 12 },
    { date: "2026-05-19", xtreinoId: 3, teamName: "RED Magic BR", playerName: "MOL ADRIAN", q1Kills: 2, q2Kills: 1, q3Kills: 0, totalKills: 3 },
    { date: "2026-05-19", xtreinoId: 3, teamName: "RED Magic BR", playerName: "LXELTINHO", q1Kills: 1, q2Kills: 5, q3Kills: 0, totalKills: 6 },
    { date: "2026-05-19", xtreinoId: 3, teamName: "LMF", playerName: "LMF LACERDA", q1Kills: 2, q2Kills: 0, q3Kills: 3, totalKills: 5 },
    { date: "2026-05-19", xtreinoId: 3, teamName: "LMF", playerName: "LMF CALOP12", q1Kills: 1, q2Kills: 0, q3Kills: 1, totalKills: 2 },
    { date: "2026-05-19", xtreinoId: 3, teamName: "LMF", playerName: "LMF mtfacil", q1Kills: 1, q2Kills: 0, q3Kills: 5, totalKills: 6 },
    { date: "2026-05-19", xtreinoId: 3, teamName: "LMF", playerName: "LMF XIT", q1Kills: 1, q2Kills: 0, q3Kills: 0, totalKills: 1 },
    { date: "2026-05-19", xtreinoId: 3, teamName: "KOV", playerName: "KOV FushyX", q1Kills: 5, q2Kills: 2, q3Kills: 2, totalKills: 9 },
    { date: "2026-05-19", xtreinoId: 3, teamName: "KOV", playerName: "KOV ADAN", q1Kills: 7, q2Kills: 5, q3Kills: 2, totalKills: 14 },
    { date: "2026-05-19", xtreinoId: 3, teamName: "KOV", playerName: "TTKKAIKE", q1Kills: 5, q2Kills: 2, q3Kills: 0, totalKills: 7 },
    { date: "2026-05-19", xtreinoId: 3, teamName: "KOV", playerName: "KOV ALONE", q1Kills: 0, q2Kills: 1, q3Kills: 5, totalKills: 6 },
    { date: "2026-05-19", xtreinoId: 3, teamName: "CMF", playerName: "CMF Syx", q1Kills: 0, q2Kills: 7, q3Kills: 7, totalKills: 14 },
    { date: "2026-05-19", xtreinoId: 3, teamName: "CMF", playerName: "CMF Lyx7", q1Kills: 0, q2Kills: 7, q3Kills: 3, totalKills: 10 },
    { date: "2026-05-19", xtreinoId: 3, teamName: "CMF", playerName: "CMF MOIZO", q1Kills: 0, q2Kills: 4, q3Kills: 5, totalKills: 9 },
    { date: "2026-05-19", xtreinoId: 3, teamName: "CMF", playerName: "CMF Stygian", q1Kills: 0, q2Kills: 3, q3Kills: 7, totalKills: 10 },
    { date: "2026-05-19", xtreinoId: 3, teamName: "Eternity", playerName: "RED REZE", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date: "2026-05-19", xtreinoId: 3, teamName: "Eternity", playerName: "Muggle", q1Kills: 0, q2Kills: 6, q3Kills: 0, totalKills: 6 },
    { date: "2026-05-19", xtreinoId: 3, teamName: "Eternity", playerName: "Shxrk", q1Kills: 0, q2Kills: 4, q3Kills: 0, totalKills: 4 },

    // 2026-05-21 (xtreinoId: 4)
    { date: "2026-05-21", xtreinoId: 4, teamName: "UGD Threat", playerName: "UGD Kaze", q1Kills: 5, q2Kills: 4, q3Kills: 6, totalKills: 15 },
    { date: "2026-05-21", xtreinoId: 4, teamName: "UGD Threat", playerName: "UGD cool7", q1Kills: 7, q2Kills: 7, q3Kills: 6, totalKills: 20 },
    { date: "2026-05-21", xtreinoId: 4, teamName: "UGD Threat", playerName: "UGD Treon", q1Kills: 14, q2Kills: 4, q3Kills: 3, totalKills: 21 },
    { date: "2026-05-21", xtreinoId: 4, teamName: "UGD Threat", playerName: "UGD ARISE", q1Kills: 9, q2Kills: 9, q3Kills: 1, totalKills: 19 },
    { date: "2026-05-21", xtreinoId: 4, teamName: "Time I", playerName: "hcky", q1Kills: 4, q2Kills: 0, q3Kills: 0, totalKills: 4 },
    { date: "2026-05-21", xtreinoId: 4, teamName: "Time I", playerName: "ASTRO", q1Kills: 8, q2Kills: 0, q3Kills: 8, totalKills: 16 },
    { date: "2026-05-21", xtreinoId: 4, teamName: "Time I", playerName: "GzmAkaza", q1Kills: 2, q2Kills: 0, q3Kills: 9, totalKills: 11 },
    { date: "2026-05-21", xtreinoId: 4, teamName: "Time I", playerName: "AimColor", q1Kills: 2, q2Kills: 0, q3Kills: 0, totalKills: 2 },
    { date: "2026-05-21", xtreinoId: 4, teamName: "Time I", playerName: "iDiaasz", q1Kills: 0, q2Kills: 0, q3Kills: 2, totalKills: 2 },
    { date: "2026-05-21", xtreinoId: 4, teamName: "Time I", playerName: "Jtpe", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date: "2026-05-21", xtreinoId: 4, teamName: "CMF", playerName: "CMF Leo", q1Kills: 8, q2Kills: 7, q3Kills: 11, totalKills: 26 },
    { date: "2026-05-21", xtreinoId: 4, teamName: "CMF", playerName: "CMF Stygian", q1Kills: 5, q2Kills: 6, q3Kills: 5, totalKills: 16 },
    { date: "2026-05-21", xtreinoId: 4, teamName: "CMF", playerName: "CMF Syx", q1Kills: 14, q2Kills: 10, q3Kills: 9, totalKills: 33 },
    { date: "2026-05-21", xtreinoId: 4, teamName: "CMF", playerName: "CMF MOIZO", q1Kills: 2, q2Kills: 3, q3Kills: 7, totalKills: 12 },
    { date: "2026-05-21", xtreinoId: 4, teamName: "RED", playerName: "RED APENAS", q1Kills: 7, q2Kills: 8, q3Kills: 7, totalKills: 22 },
    { date: "2026-05-21", xtreinoId: 4, teamName: "RED", playerName: "RED- REZE", q1Kills: 1, q2Kills: 5, q3Kills: 0, totalKills: 6 },
    { date: "2026-05-21", xtreinoId: 4, teamName: "RED", playerName: "RED-MOREIRA", q1Kills: 0, q2Kills: 2, q3Kills: 3, totalKills: 5 },
    { date: "2026-05-21", xtreinoId: 4, teamName: "RED", playerName: "RED-Alemão", q1Kills: 2, q2Kills: 3, q3Kills: 2, totalKills: 7 },
    { date: "2026-05-21", xtreinoId: 4, teamName: "KOV", playerName: "KOV FushyX", q1Kills: 1, q2Kills: 5, q3Kills: 0, totalKills: 6 },
    { date: "2026-05-21", xtreinoId: 4, teamName: "KOV", playerName: "KOV ADAN", q1Kills: 0, q2Kills: 7, q3Kills: 0, totalKills: 7 },
    { date: "2026-05-21", xtreinoId: 4, teamName: "KOV", playerName: "YoSurper", q1Kills: 7, q2Kills: 3, q3Kills: 0, totalKills: 10 },
    { date: "2026-05-21", xtreinoId: 4, teamName: "KOV", playerName: "AET Jentexz", q1Kills: 1, q2Kills: 11, q3Kills: 0, totalKills: 12 },
    { date: "2026-05-21", xtreinoId: 4, teamName: "Time E", playerName: "PAIN SWAN", q1Kills: 0, q2Kills: 0, q3Kills: 1, totalKills: 1 },
    { date: "2026-05-21", xtreinoId: 4, teamName: "Time E", playerName: "Poindexter", q1Kills: 0, q2Kills: 0, q3Kills: 2, totalKills: 2 },
    { date: "2026-05-21", xtreinoId: 4, teamName: "Time E", playerName: "ONE-Javi", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date: "2026-05-21", xtreinoId: 4, teamName: "Time E", playerName: "morqesb", q1Kills: 0, q2Kills: 0, q3Kills: 1, totalKills: 1 },

    // 2026-05-07 (xtreinoId: 2)
    { date: "2026-05-07", xtreinoId: 2, teamName: "UGD Threat", playerName: "UGD Ares", q1Kills: 9, q2Kills: 16, q3Kills: 14, totalKills: 39 },
    { date: "2026-05-07", xtreinoId: 2, teamName: "UGD Threat", playerName: "UGD Kaze", q1Kills: 11, q2Kills: 15, q3Kills: 8, totalKills: 34 },
    { date: "2026-05-07", xtreinoId: 2, teamName: "UGD Threat", playerName: "UGD ARISE", q1Kills: 5, q2Kills: 10, q3Kills: 8, totalKills: 23 },
    { date: "2026-05-07", xtreinoId: 2, teamName: "UGD Threat", playerName: "UGD Treon", q1Kills: 9, q2Kills: 12, q3Kills: 12, totalKills: 33 },
    { date: "2026-05-07", xtreinoId: 2, teamName: "CMF", playerName: "CMF Stygian", q1Kills: 7, q2Kills: 2, q3Kills: 6, totalKills: 15 },
    { date: "2026-05-07", xtreinoId: 2, teamName: "CMF", playerName: "CMF Lyx7", q1Kills: 12, q2Kills: 4, q3Kills: 7, totalKills: 23 },
    { date: "2026-05-07", xtreinoId: 2, teamName: "CMF", playerName: "CMF Leo", q1Kills: 9, q2Kills: 6, q3Kills: 4, totalKills: 19 },
    { date: "2026-05-07", xtreinoId: 2, teamName: "CMF", playerName: "CMF Syx", q1Kills: 7, q2Kills: 4, q3Kills: 6, totalKills: 17 },
    { date: "2026-05-07", xtreinoId: 2, teamName: "INF", playerName: "INF Noxz7", q1Kills: 6, q2Kills: 0, q3Kills: 3, totalKills: 9 },
    { date: "2026-05-07", xtreinoId: 2, teamName: "INF", playerName: "INF GOAT", q1Kills: 5, q2Kills: 0, q3Kills: 3, totalKills: 8 },
    { date: "2026-05-07", xtreinoId: 2, teamName: "INF", playerName: "INF BARONI", q1Kills: 5, q2Kills: 0, q3Kills: 5, totalKills: 10 },
    { date: "2026-05-07", xtreinoId: 2, teamName: "INF", playerName: "INF RINNEGA", q1Kills: 4, q2Kills: 0, q3Kills: 1, totalKills: 5 },
    { date: "2026-05-07", xtreinoId: 2, teamName: "LMF", playerName: "LMF_LACERDA", q1Kills: 4, q2Kills: 0, q3Kills: 0, totalKills: 4 },
    { date: "2026-05-07", xtreinoId: 2, teamName: "LMF", playerName: "LMF_RICHIMO", q1Kills: 3, q2Kills: 1, q3Kills: 0, totalKills: 4 },
    { date: "2026-05-07", xtreinoId: 2, teamName: "LMF", playerName: "LMF_mtfacil", q1Kills: 9, q2Kills: 2, q3Kills: 0, totalKills: 11 },
    { date: "2026-05-07", xtreinoId: 2, teamName: "LMF", playerName: "LMF_XIT", q1Kills: 4, q2Kills: 3, q3Kills: 0, totalKills: 7 },
    { date: "2026-05-07", xtreinoId: 2, teamName: "LMF", playerName: "LMF_Boss", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date: "2026-05-07", xtreinoId: 2, teamName: "Misturado", playerName: "REVERSE_", q1Kills: 0, q2Kills: 0, q3Kills: 6, totalKills: 6 },
    { date: "2026-05-07", xtreinoId: 2, teamName: "Misturado", playerName: "INF RONY", q1Kills: 3, q2Kills: 0, q3Kills: 4, totalKills: 7 },
    { date: "2026-05-07", xtreinoId: 2, teamName: "Misturado", playerName: "INF BADBOY", q1Kills: 2, q2Kills: 0, q3Kills: 0, totalKills: 2 },
    { date: "2026-05-07", xtreinoId: 2, teamName: "Misturado", playerName: "TOP FreeKill", q1Kills: 0, q2Kills: 0, q3Kills: 3, totalKills: 3 },
    { date: "2026-05-07", xtreinoId: 2, teamName: "Eternity", playerName: "Nofear", q1Kills: 0, q2Kills: 2, q3Kills: 0, totalKills: 2 },
    { date: "2026-05-07", xtreinoId: 2, teamName: "Eternity", playerName: "Damøn.TTK", q1Kills: 0, q2Kills: 5, q3Kills: 0, totalKills: 5 },
    { date: "2026-05-07", xtreinoId: 2, teamName: "Eternity", playerName: "Muggle", q1Kills: 0, q2Kills: 4, q3Kills: 0, totalKills: 4 },
    { date: "2026-05-07", xtreinoId: 2, teamName: "Eternity", playerName: "Kennedy", q1Kills: 0, q2Kills: 6, q3Kills: 0, totalKills: 6 },
    { date: "2026-05-07", xtreinoId: 2, teamName: "RED", playerName: "RED APENAS", q1Kills: 0, q2Kills: 5, q3Kills: 1, totalKills: 6 },
    { date: "2026-05-07", xtreinoId: 2, teamName: "RED", playerName: "ASTRO", q1Kills: 0, q2Kills: 6, q3Kills: 4, totalKills: 10 },
    { date: "2026-05-07", xtreinoId: 2, teamName: "RED", playerName: "REÐ snow777", q1Kills: 0, q2Kills: 2, q3Kills: 5, totalKills: 7 },
    { date: "2026-05-07", xtreinoId: 2, teamName: "RED", playerName: "REÐ Sunraku", q1Kills: 0, q2Kills: 3, q3Kills: 0, totalKills: 3 },

    // 2026-04-30 (xtreinoId: 1)
    { date: "2026-04-30", xtreinoId: 1, teamName: "UGD Threat", playerName: "UGD Ares", q1Kills: 7, q2Kills: 0, q3Kills: 0, totalKills: 7 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "UGD Threat", playerName: "UGD Kaze", q1Kills: 6, q2Kills: 2, q3Kills: 6, totalKills: 14 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "UGD Threat", playerName: "UGD Treon", q1Kills: 5, q2Kills: 12, q3Kills: 8, totalKills: 25 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "UGD Threat", playerName: "UGD ARISE", q1Kills: 6, q2Kills: 0, q3Kills: 0, totalKills: 6 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "UGD Threat", playerName: "UGD Neo", q1Kills: 0, q2Kills: 5, q3Kills: 8, totalKills: 13 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "UGD Threat", playerName: "Rivers AR", q1Kills: 0, q2Kills: 5, q3Kills: 9, totalKills: 14 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "FURY", playerName: "VN' FURY", q1Kills: 4, q2Kills: 0, q3Kills: 0, totalKills: 4 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "FURY", playerName: "Creedz FURY", q1Kills: 4, q2Kills: 0, q3Kills: 0, totalKills: 4 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "FURY", playerName: "perfection z", q1Kills: 3, q2Kills: 0, q3Kills: 0, totalKills: 3 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "FURY", playerName: "Diana FURY", q1Kills: 5, q2Kills: 0, q3Kills: 0, totalKills: 5 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "RED", playerName: "REÐ LANGØ", q1Kills: 9, q2Kills: 0, q3Kills: 0, totalKills: 9 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "RED", playerName: "REÐ Zadock", q1Kills: 2, q2Kills: 0, q3Kills: 0, totalKills: 2 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "RED", playerName: "REÐ M4RTINA", q1Kills: 8, q2Kills: 0, q3Kills: 0, totalKills: 8 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "RED", playerName: "REÐ APENAS", q1Kills: 3, q2Kills: 0, q3Kills: 0, totalKills: 3 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "UGD Royal", playerName: "UGD Z", q1Kills: 9, q2Kills: 0, q3Kills: 0, totalKills: 9 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "UGD Royal", playerName: "Dexz", q1Kills: 3, q2Kills: 0, q3Kills: 0, totalKills: 3 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "UGD Royal", playerName: "UGD Weenot", q1Kills: 8, q2Kills: 0, q3Kills: 0, totalKills: 8 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "UGD Royal", playerName: "OFFz", q1Kills: 0, q2Kills: 16, q3Kills: 0, totalKills: 16 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "UGD Royal", playerName: "MayaZ", q1Kills: 0, q2Kills: 8, q3Kills: 0, totalKills: 8 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "UGD Royal", playerName: "WenoTz", q1Kills: 0, q2Kills: 5, q3Kills: 0, totalKills: 5 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "UGD Light", playerName: "DEATH", q1Kills: 3, q2Kills: 3, q3Kills: 0, totalKills: 6 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "UGD Light", playerName: "UGD Psycho", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "UGD Light", playerName: "I miss her", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "UGD Light", playerName: "UGD Kyz", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "Λつつ", playerName: "Λつつ_$CAVEIRA", q1Kills: 3, q2Kills: 0, q3Kills: 0, totalKills: 3 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "Λつつ", playerName: "Λつつ Aninha", q1Kills: 4, q2Kills: 0, q3Kills: 0, totalKills: 4 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "Λつつ", playerName: "ØNE ???", q1Kills: 1, q2Kills: 0, q3Kills: 0, totalKills: 1 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "Λつつ", playerName: "Λつつ Unknown", q1Kills: 1, q2Kills: 0, q3Kills: 0, totalKills: 1 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "Λつつ", playerName: "Striker71", q1Kills: 0, q2Kills: 2, q3Kills: 2, totalKills: 4 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "Λつつ", playerName: "『PsS-KINN-ボ", q1Kills: 0, q2Kills: 2, q3Kills: 1, totalKills: 3 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "Λつつ", playerName: "Striker81", q1Kills: 0, q2Kills: 3, q3Kills: 4, totalKills: 7 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "Λつつ", playerName: "ΛΞT Jentexz", q1Kills: 0, q2Kills: 8, q3Kills: 9, totalKills: 17 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "ODS", playerName: "[ODS].STROG", q1Kills: 3, q2Kills: 0, q3Kills: 0, totalKills: 3 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "ODS", playerName: "[ODS] vantex", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "ODS", playerName: "Az Aamon", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "INF", playerName: "「INF」Noxz7'", q1Kills: 0, q2Kills: 3, q3Kills: 0, totalKills: 3 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "INF", playerName: "「INF」RINNEGA", q1Kills: 0, q2Kills: 4, q3Kills: 0, totalKills: 4 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "INF", playerName: "「INF」BLAZE", q1Kills: 0, q2Kills: 2, q3Kills: 0, totalKills: 2 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "INF", playerName: "「INF」GOAT", q1Kills: 0, q2Kills: 6, q3Kills: 0, totalKills: 6 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "CMF", playerName: "CMF Lyx7", q1Kills: 0, q2Kills: 3, q3Kills: 8, totalKills: 11 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "CMF", playerName: "CMF Leo", q1Kills: 0, q2Kills: 2, q3Kills: 8, totalKills: 10 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "CMF", playerName: "CMF Stygian", q1Kills: 0, q2Kills: 3, q3Kills: 4, totalKills: 7 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "CMF", playerName: "CMF Syx", q1Kills: 0, q2Kills: 5, q3Kills: 8, totalKills: 13 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "Eternity", playerName: "Muggle 永", q1Kills: 0, q2Kills: 0, q3Kills: 3, totalKills: 3 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "Eternity", playerName: "DamønTTK 永", q1Kills: 0, q2Kills: 0, q3Kills: 8, totalKills: 8 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "Eternity", playerName: "Black 永", q1Kills: 0, q2Kills: 0, q3Kills: 7, totalKills: 7 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "Eternity", playerName: "Givas'xX 永", q1Kills: 0, q2Kills: 0, q3Kills: 4, totalKills: 4 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "LMF", playerName: "LMF_mtfacil", q1Kills: 0, q2Kills: 0, q3Kills: 2, totalKills: 2 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "LMF", playerName: "LMF_XIT", q1Kills: 0, q2Kills: 0, q3Kills: 2, totalKills: 2 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "LMF", playerName: "LMF_Boss", q1Kills: 0, q2Kills: 0, q3Kills: 2, totalKills: 2 },
    { date: "2026-04-30", xtreinoId: 1, teamName: "LMF", playerName: "LMF_RICHIMO", q1Kills: 0, q2Kills: 0, q3Kills: 4, totalKills: 4 },
  ];

  let jogadoresCount = 0;
  for (const data of xtreinoJogadoresData) {
    const existing = db
      .select()
      .from(xtreinoPlayerStats)
      .where(
        and(
          eq(xtreinoPlayerStats.xtreinoId, data.xtreinoId),
          eq(xtreinoPlayerStats.playerName, data.playerName)
        )
      )
      .get();

    if (!existing) {
      db.insert(xtreinoPlayerStats).values(data).run();
      jogadoresCount++;
    }
  }
  console.log(`[SEED XTREINO-HISTORICO] ${jogadoresCount} estatísticas de jogadores inseridas`);

  console.log("[SEED XTREINO-HISTORICO] Done!");

  // Após inserir os dados, recalcula os rankings automaticamente
  console.log("[SEED XTREINO-HISTORICO] Recalculando rankings...");
  recalculateRankings();
}

/**
 * Atualiza xtreinoId dos registros antigos (xtreinoId = 0) baseado na data
 * Rode esta função uma vez para migrar dados antigos
 */
export function migrateOldXtreinoIds() {
  const db = getDb();
  console.log("[MIGRATE] Atualizando xtreinoId dos registros antigos...");

  for (const [date, xtreinoId] of Object.entries(dateToXtreinoId)) {
    // Atualiza xtreinoResults
    const resultsUpdated = db
      .update(xtreinoResults)
      .set({ xtreinoId })
      .where(eq(xtreinoResults.date, date))
      .run();
    console.log(`[MIGRATE] xtreinoResults: ${date} -> xtreinoId ${xtreinoId} (${resultsUpdated.changes} registros)`);

    // Atualiza xtreinoPlayerStats
    const statsUpdated = db
      .update(xtreinoPlayerStats)
      .set({ xtreinoId })
      .where(eq(xtreinoPlayerStats.date, date))
      .run();
    console.log(`[MIGRATE] xtreinoPlayerStats: ${date} -> xtreinoId ${xtreinoId} (${statsUpdated.changes} registros)`);
  }

  console.log("[MIGRATE] Migração concluída!");
}

/**
 * Recalcula os rankings baseado nos dados de xtreino, campeonato e scrim
 * Esta função pode ser chamada manualmente ou após inserir dados
 */
export function recalculateRankings() {
  const db = getDb();
  console.log("[RECALCULATE] Iniciando recálculo dos rankings...");

  // Delete existing rankings
  db.delete(rankings).run();

  // --- XTreino Rankings ---
  const xtResults = db.select().from(xtreinoResults).all();
  const xtPlayerStats = db.select().from(xtreinoPlayerStats).all();

  const xtTeamMap = new Map<
    string,
    { points: number; kills: number; wins: number; participations: number }
  >();
  const xtPlayerMap = new Map<
    string,
    { points: number; kills: number; wins: number; participations: number }
  >();

  for (const r of xtResults) {
    const pts = r.totalPoints ?? calcularPontosXtreino(r.q1Pos, r.q2Pos, r.q3Pos);
    const existing = xtTeamMap.get(r.teamName) ?? {
      points: 0,
      kills: 0,
      wins: 0,
      participations: 0,
    };
    xtTeamMap.set(r.teamName, {
      points: existing.points + pts,
      kills: existing.kills,
      wins: existing.wins,
      participations: existing.participations + 1,
    });
  }

  for (const p of xtPlayerStats) {
    const pts = (p.totalKills ?? 0) * 2;
    const existing = xtPlayerMap.get(p.playerName) ?? {
      points: 0,
      kills: 0,
      wins: 0,
      participations: 0,
    };
    xtPlayerMap.set(p.playerName, {
      points: existing.points + pts,
      kills: existing.kills + (p.totalKills ?? 0),
      wins: existing.wins,
      participations: existing.participations + 1,
    });
  }

  const generateRankingEntityId = (entityType: "team" | "player", entityName: string) =>
    (Math.abs(
      `${entityType}:${entityName}`.split("").reduce((acc, char) => acc * 31 + char.charCodeAt(0), 0)
    ) % 1_000_000_000) + 1;

  // Insert XTreino rankings
  for (const [name, data] of xtTeamMap) {
    try {
      db.insert(rankings).values({
        entityType: "team",
        entityId: generateRankingEntityId("team", name),
        rankType: "xtreino",
        entityName: name,
        points: data.points,
        kills: data.kills,
        wins: data.wins,
        participations: data.participations,
        kdRatio: data.kills > 0 ? parseFloat((data.kills / Math.max(data.participations, 1)).toFixed(2)) : 0,
      }).run();
    } catch (e) {
      console.error(`[RECALCULATE] Erro ao inserir team xtreino ${name}:`, e);
    }
  }

  for (const [name, data] of xtPlayerMap) {
    try {
      db.insert(rankings).values({
        entityType: "player",
        entityId: generateRankingEntityId("player", name),
        rankType: "xtreino",
        entityName: name,
        points: data.points,
        kills: data.kills,
        wins: data.wins,
        participations: data.participations,
        kdRatio: data.kills > 0 ? parseFloat((data.kills / Math.max(data.participations, 1)).toFixed(2)) : 0,
      }).run();
    } catch (e) {
      console.error(`[RECALCULATE] Erro ao inserir player xtreino ${name}:`, e);
    }
  }

  console.log(`[RECALCULATE] ${xtTeamMap.size} equipes e ${xtPlayerMap.size} jogadores de xtreino inseridos`);
  console.log("[RECALCULATE] Rankings recalculados com sucesso!");
}