import { getDb } from "../../api/queries/connection.js";
import { eq, and } from "drizzle-orm";
import {
  xtreinoResults,
  xtreinoPlayerStats,
} from "../schema.js";
import { calcularPontosXtreino } from "../../api/lib/pontuacao.js";

/**
 * Seed de dados do XTREINO da Underground
 * Data: 08/06/2026 (xtreinoId: 5)
 */

export function seedXtreino08062026() {
  const db = getDb();
  console.log("[SEED XTREINO-08062026] Starting...");

  const xtreinoId = 5;
  const date = "2026-06-08";

  const xtreinoColocacoesData = [
    { date, xtreinoId, teamName: "CMF ATLANTIC", q1Pos: 1, q2Pos: 2, q3Pos: 1 },
    { date, xtreinoId, teamName: "EmE", q1Pos: 2, q2Pos: 4, q3Pos: 3 },
    { date, xtreinoId, teamName: "FURY ELITE", q1Pos: 3, q2Pos: 1, q3Pos: 4 },
    { date, xtreinoId, teamName: "UGD OLYMPIQUE", q1Pos: 4, q2Pos: 10, q3Pos: 12 },
    { date, xtreinoId, teamName: "REÐ Outlaws", q1Pos: 5, q2Pos: 9, q3Pos: 7 },
    { date, xtreinoId, teamName: "UGD Threat", q1Pos: 6, q2Pos: 11, q3Pos: 5 },
    { date, xtreinoId, teamName: "UGD LIGHT", q1Pos: 7, q2Pos: 3, q3Pos: 11 },
    { date, xtreinoId, teamName: "♱VØID×STRIKE♱", q1Pos: 8, q2Pos: 13, q3Pos: 6 },
    { date, xtreinoId, teamName: "7KW_LHETAL", q1Pos: 9, q2Pos: 7, q3Pos: 8 },
    { date, xtreinoId, teamName: "FURY ROYAL", q1Pos: 10, q2Pos: 8, q3Pos: 2 },
    { date, xtreinoId, teamName: "UGD LEGENDS", q1Pos: 11, q2Pos: 6, q3Pos: 9 },
    { date, xtreinoId, teamName: "K4F", q1Pos: 12, q2Pos: 5, q3Pos: 10 },
    { date, xtreinoId, teamName: "CMF ASSALT", q1Pos: 13, q2Pos: 12, q3Pos: 13 },
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
      const totalPoints = calcularPontosXtreino(data.q1Pos, data.q2Pos, data.q3Pos);
      db.insert(xtreinoResults).values({ ...data, totalPoints }).run();
      colocacoesCount++;
    }
  }
  console.log(`[SEED XTREINO-08062026] ${colocacoesCount} colocações inseridas`);

  const xtreinoJogadoresData = [
    { date, xtreinoId, teamName: "UGD OLYMPIQUE", playerName: "Weenot", q1Kills: 4, q2Kills: 4, q3Kills: 0, totalKills: 8 },
    { date, xtreinoId, teamName: "UGD LEGENDS", playerName: "Santz", q1Kills: 3, q2Kills: 11, q3Kills: 10, totalKills: 24 },
    { date, xtreinoId, teamName: "UGD OLYMPIQUE", playerName: "Duardin", q1Kills: 1, q2Kills: 0, q3Kills: 2, totalKills: 3 },
    { date, xtreinoId, teamName: "UGD OLYMPIQUE", playerName: "Striker", q1Kills: 3, q2Kills: 0, q3Kills: 0, totalKills: 3 },
    { date, xtreinoId, teamName: "UGD OLYMPIQUE", playerName: "Lorex", q1Kills: 4, q2Kills: 1, q3Kills: 1, totalKills: 6 },
    { date, xtreinoId, teamName: "UGD LEGENDS", playerName: "hell", q1Kills: 4, q2Kills: 3, q3Kills: 6, totalKills: 9 },
    { date, xtreinoId, teamName: "UGD LIGHT", playerName: "Kyz", q1Kills: 5, q2Kills: 1, q3Kills: 2, totalKills: 8 },
    { date, xtreinoId, teamName: "UGD LIGHT", playerName: "Zann", q1Kills: 6, q2Kills: 1, q3Kills: 3, totalKills: 10 },
    { date, xtreinoId, teamName: "UGD LIGHT", playerName: "Psycho", q1Kills: 5, q2Kills: 1, q3Kills: 0, totalKills: 6 },
    { date, xtreinoId, teamName: "UGD LIGHT", playerName: "Chino", q1Kills: 5, q2Kills: 3, q3Kills: 5, totalKills: 13 },
    { date, xtreinoId, teamName: "UGD LEGENDS", playerName: "Ohara", q1Kills: 2, q2Kills: 0, q3Kills: 0, totalKills: 2 },
    { date, xtreinoId, teamName: "UGD LEGENDS", playerName: "Rafa", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date, xtreinoId, teamName: "UGD LEGENDS", playerName: "Xoxoto", q1Kills: 0, q2Kills: 9, q3Kills: 4, totalKills: 13 },
    { date, xtreinoId, teamName: "UGD LEGENDS", playerName: "Buzeira", q1Kills: 1, q2Kills: 1, q3Kills: 2, totalKills: 4 },
    { date, xtreinoId, teamName: "FURY ROYAL", playerName: "VN", q1Kills: 9, q2Kills: 6, q3Kills: 11, totalKills: 26 },
    { date, xtreinoId, teamName: "FURY ROYAL", playerName: "NOKI", q1Kills: 4, q2Kills: 4, q3Kills: 4, totalKills: 12 },
    { date, xtreinoId, teamName: "FURY ROYAL", playerName: "EGOIST", q1Kills: 4, q2Kills: 6, q3Kills: 6, totalKills: 16 },
    { date, xtreinoId, teamName: "FURY ROYAL", playerName: "MARTNA", q1Kills: 9, q2Kills: 5, q3Kills: 2, totalKills: 16 },
    { date, xtreinoId, teamName: "FURY ELITE", playerName: "DIANA", q1Kills: 2, q2Kills: 1, q3Kills: 3, totalKills: 6 },
    { date, xtreinoId, teamName: "FURY ELITE", playerName: "hluydex", q1Kills: 2, q2Kills: 3, q3Kills: 2, totalKills: 7 },
    { date, xtreinoId, teamName: "FURY ELITE", playerName: "TRY", q1Kills: 4, q2Kills: 7, q3Kills: 4, totalKills: 15 },
    { date, xtreinoId, teamName: "FURY ELITE", playerName: "DEXZ", q1Kills: 5, q2Kills: 4, q3Kills: 3, totalKills: 12 },
    { date, xtreinoId, teamName: "CMF ATLANTIC", playerName: "CMF Léo", q1Kills: 18, q2Kills: 19, q3Kills: 17, totalKills: 54 },
    { date, xtreinoId, teamName: "CMF ATLANTIC", playerName: "CMF Syx", q1Kills: 10, q2Kills: 12, q3Kills: 23, totalKills: 45 },
    { date, xtreinoId, teamName: "CMF ATLANTIC", playerName: "CMF Kira", q1Kills: 8, q2Kills: 6, q3Kills: 11, totalKills: 25 },
    { date, xtreinoId, teamName: "CMF ATLANTIC", playerName: "CMF Moizo", q1Kills: 13, q2Kills: 6, q3Kills: 7, totalKills: 26 },
    { date, xtreinoId, teamName: "CMF ASSALT", playerName: "CMF Dnvy", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date, xtreinoId, teamName: "CMF ASSALT", playerName: "CMF Lynx7", q1Kills: 0, q2Kills: 1, q3Kills: 0, totalKills: 1 },
    { date, xtreinoId, teamName: "CMF ASSALT", playerName: "CMF Max", q1Kills: 0, q2Kills: 3, q3Kills: 0, totalKills: 3 },
    { date, xtreinoId, teamName: "CMF ASSALT", playerName: "CMF Thxxxz", q1Kills: 3, q2Kills: 1, q3Kills: 0, totalKills: 4 },
    { date, xtreinoId, teamName: "♱VØID×STRIKE♱", playerName: "♱Vøid♱.D_R", q1Kills: 0, q2Kills: 0, q3Kills: 1, totalKills: 1 },
    { date, xtreinoId, teamName: "♱VØID×STRIKE♱", playerName: "♱Vøid♱+gute", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date, xtreinoId, teamName: "♱VØID×STRIKE♱", playerName: "♱Vøid♱.nino", q1Kills: 2, q2Kills: 0, q3Kills: 1, totalKills: 3 },
    { date, xtreinoId, teamName: "♱VØID×STRIKE♱", playerName: "™VØID°⁷⁷⁷", q1Kills: 1, q2Kills: 0, q3Kills: 0, totalKills: 1 },
    { date, xtreinoId, teamName: "REÐ Outlaws", playerName: "REÐ MoraesBC", q1Kills: 4, q2Kills: 3, q3Kills: 2, totalKills: 9 },
    { date, xtreinoId, teamName: "REÐ Outlaws", playerName: "REÐ Felpz", q1Kills: 4, q2Kills: 3, q3Kills: 5, totalKills: 12 },
    { date, xtreinoId, teamName: "REÐ Outlaws", playerName: "REÐ Skibidi", q1Kills: 3, q2Kills: 3, q3Kills: 0, totalKills: 6 },
    { date, xtreinoId, teamName: "REÐ Outlaws", playerName: "REÐ Apenas", q1Kills: 8, q2Kills: 0, q3Kills: 6, totalKills: 14 },
    { date, xtreinoId, teamName: "K4F", playerName: "k4F urso", q1Kills: 2, q2Kills: 1, q3Kills: 2, totalKills: 5 },
    { date, xtreinoId, teamName: "K4F", playerName: "K4F nine", q1Kills: 4, q2Kills: 1, q3Kills: 0, totalKills: 5 },
    { date, xtreinoId, teamName: "K4F", playerName: "K4F gui", q1Kills: 3, q2Kills: 9, q3Kills: 4, totalKills: 16 },
    { date, xtreinoId, teamName: "K4F", playerName: "Alek", q1Kills: 2, q2Kills: 0, q3Kills: 1, totalKills: 3 },
    { date, xtreinoId, teamName: "7KW_LHETAL", playerName: "(NTC)patrikm", q1Kills: 6, q2Kills: 8, q3Kills: 0, totalKills: 14 },
    { date, xtreinoId, teamName: "7KW_LHETAL", playerName: "_061_kakashi", q1Kills: 4, q2Kills: 17, q3Kills: 8, totalKills: 29 },
    { date, xtreinoId, teamName: "7KW_LHETAL", playerName: "RL.MATADOR☠️", q1Kills: 10, q2Kills: 11, q3Kills: 5, totalKills: 26 },
    { date, xtreinoId, teamName: "7KW_LHETAL", playerName: "Fefe_🎭🇧🇷", q1Kills: 4, q2Kills: 12, q3Kills: 7, totalKills: 23 },
    { date, xtreinoId, teamName: "EmE", playerName: "Yeezy", q1Kills: 2, q2Kills: 7, q3Kills: 4, totalKills: 13 },
    { date, xtreinoId, teamName: "EmE", playerName: "geldeysito", q1Kills: 9, q2Kills: 9, q3Kills: 17, totalKills: 35 },
    { date, xtreinoId, teamName: "EmE", playerName: "EME々Akaza", q1Kills: 4, q2Kills: 5, q3Kills: 10, totalKills: 19 },
    { date, xtreinoId, teamName: "EmE", playerName: "EME々Lulu", q1Kills: 3, q2Kills: 10, q3Kills: 8, totalKills: 21 },
    { date, xtreinoId, teamName: "UGD Threat", playerName: "Cool", q1Kills: 4, q2Kills: 6, q3Kills: 6, totalKills: 16 },
    { date, xtreinoId, teamName: "UGD Threat", playerName: "Treon", q1Kills: 6, q2Kills: 4, q3Kills: 8, totalKills: 18 },
    { date, xtreinoId, teamName: "UGD Threat", playerName: "Kaze", q1Kills: 1, q2Kills: 1, q3Kills: 4, totalKills: 6 },
    { date, xtreinoId, teamName: "UGD Threat", playerName: "LMF_BOSS", q1Kills: 2, q2Kills: 1, q3Kills: 1, totalKills: 4 },
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
  console.log(`[SEED XTREINO-08062026] ${jogadoresCount} estatísticas de jogadores inseridas`);
  console.log("[SEED XTREINO-08062026] Done!");
}