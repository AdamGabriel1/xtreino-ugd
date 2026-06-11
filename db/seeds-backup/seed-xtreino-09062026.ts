import { getDb } from "../../api/queries/connection.js";
import { eq, and } from "drizzle-orm";
import {
  xtreinoResults,
  xtreinoPlayerStats,
} from "../schema.js";
import { calcularPontosXtreino } from "../../api/lib/pontuacao.js";

/**
 * Seed de dados do XTREINO da Underground
 * Data: 09/06/2026 (xtreinoId: 6)
 */

export function seedXtreino09062026() {
  const db = getDb();
  console.log("[SEED XTREINO-09062026] Starting...");

  const xtreinoId = 6;
  const date = "2026-06-09";

  const xtreinoColocacoesData = [
    { date, xtreinoId, teamName: "FURY ELITE", q1Pos: 1, q2Pos: 2, q3Pos: 5 },
    { date, xtreinoId, teamName: "EmE", q1Pos: 2, q2Pos: 3, q3Pos: 12 },
    { date, xtreinoId, teamName: "CMF ATLANTIC", q1Pos: 3, q2Pos: 6, q3Pos: 6 },
    { date, xtreinoId, teamName: "UGD OLYMPIQUE", q1Pos: 4, q2Pos: 7, q3Pos: 4 },
    { date, xtreinoId, teamName: "UGD LIGHT", q1Pos: 5, q2Pos: 5, q3Pos: 9 },
    { date, xtreinoId, teamName: "♱VØID×STRIKE♱", q1Pos: 6, q2Pos: 10, q3Pos: 11 },
    { date, xtreinoId, teamName: "FURY ROYAL", q1Pos: 7, q2Pos: 1, q3Pos: 3 },
    { date, xtreinoId, teamName: "REÐ Outlaws", q1Pos: 8, q2Pos: 9, q3Pos: 2 },
    { date, xtreinoId, teamName: "K4F", q1Pos: 9, q2Pos: 8, q3Pos: 10 },
    { date, xtreinoId, teamName: "UGD Threat", q1Pos: 10, q2Pos: 4, q3Pos: 1 },
    { date, xtreinoId, teamName: "CMF ASSALT", q1Pos: 11, q2Pos: 11, q3Pos: 7 },
    { date, xtreinoId, teamName: "TROPA DO XXX", q1Pos: 12, q2Pos: 12, q3Pos: 8 },
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
  console.log(`[SEED XTREINO-09062026] ${colocacoesCount} colocações inseridas`);

  const xtreinoJogadoresData = [
    { date, xtreinoId, teamName: "FURY ROYAL", playerName: "VN", q1Kills: 3, q2Kills: 11, q3Kills: 8, totalKills: 22 },
    { date, xtreinoId, teamName: "FURY ROYAL", playerName: "EGOIST", q1Kills: 4, q2Kills: 20, q3Kills: 4, totalKills: 28 },
    { date, xtreinoId, teamName: "FURY ROYAL", playerName: "MARTNA", q1Kills: 6, q2Kills: 10, q3Kills: 12, totalKills: 28 },
    { date, xtreinoId, teamName: "FURY ROYAL", playerName: "OFF", q1Kills: 3, q2Kills: 10, q3Kills: 7, totalKills: 20 },
    { date, xtreinoId, teamName: "EmE", playerName: "Yeezy", q1Kills: 6, q2Kills: 4, q3Kills: 0, totalKills: 10 },
    { date, xtreinoId, teamName: "EmE", playerName: "EME々Akaza", q1Kills: 6, q2Kills: 0, q3Kills: 0, totalKills: 6 },
    { date, xtreinoId, teamName: "EmE", playerName: "MK4", q1Kills: 6, q2Kills: 8, q3Kills: 0, totalKills: 14 },
    { date, xtreinoId, teamName: "EmE", playerName: "EME々Lulu", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date, xtreinoId, teamName: "UGD OLYMPIQUE", playerName: "Weenot", q1Kills: 5, q2Kills: 6, q3Kills: 4, totalKills: 15 },
    { date, xtreinoId, teamName: "UGD OLYMPIQUE", playerName: "Duardin", q1Kills: 5, q2Kills: 0, q3Kills: 1, totalKills: 6 },
    { date, xtreinoId, teamName: "UGD OLYMPIQUE", playerName: "Lorex", q1Kills: 4, q2Kills: 0, q3Kills: 3, totalKills: 7 },
    { date, xtreinoId, teamName: "UGD OLYMPIQUE", playerName: "Cants", q1Kills: 8, q2Kills: 1, q3Kills: 4, totalKills: 13 },
    { date, xtreinoId, teamName: "UGD OLYMPIQUE", playerName: "Striker", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date, xtreinoId, teamName: "UGD OLYMPIQUE", playerName: "Sant", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date, xtreinoId, teamName: "CMF ATLANTIC", playerName: "CMF Léo", q1Kills: 6, q2Kills: 9, q3Kills: 4, totalKills: 19 },
    { date, xtreinoId, teamName: "CMF ATLANTIC", playerName: "CMF Syx", q1Kills: 7, q2Kills: 5, q3Kills: 8, totalKills: 20 },
    { date, xtreinoId, teamName: "CMF ATLANTIC", playerName: "CMF Kira", q1Kills: 5, q2Kills: 0, q3Kills: 0, totalKills: 5 },
    { date, xtreinoId, teamName: "CMF ATLANTIC", playerName: "CMF Moizo", q1Kills: 5, q2Kills: 4, q3Kills: 2, totalKills: 11 },
    { date, xtreinoId, teamName: "CMF ATLANTIC", playerName: "CMF Sant", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date, xtreinoId, teamName: "CMF ASSALT", playerName: "CMF Dnvy", q1Kills: 0, q2Kills: 0, q3Kills: 3, totalKills: 3 },
    { date, xtreinoId, teamName: "CMF ASSALT", playerName: "CMF Lynx7", q1Kills: 2, q2Kills: 2, q3Kills: 4, totalKills: 8 },
    { date, xtreinoId, teamName: "CMF ASSALT", playerName: "CMF Max", q1Kills: 3, q2Kills: 0, q3Kills: 3, totalKills: 6 },
    { date, xtreinoId, teamName: "CMF ASSALT", playerName: "CMF Thxxxz", q1Kills: 2, q2Kills: 2, q3Kills: 5, totalKills: 9 },
    { date, xtreinoId, teamName: "♱VØID×STRIKE♱", playerName: "♱Vøid♱.D_R", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date, xtreinoId, teamName: "♱VØID×STRIKE♱", playerName: "♱Vøid♱+gute", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date, xtreinoId, teamName: "♱VØID×STRIKE♱", playerName: "♱Vøid♱.nino", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date, xtreinoId, teamName: "♱VØID×STRIKE♱", playerName: "™VØID°⁷⁷⁷", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date, xtreinoId, teamName: "♱VØID×STRIKE♱", playerName: "√Vøid√T9", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date, xtreinoId, teamName: "FURY ELITE", playerName: "DIANA", q1Kills: 4, q2Kills: 2, q3Kills: 2, totalKills: 8 },
    { date, xtreinoId, teamName: "FURY ELITE", playerName: "RAUAN", q1Kills: 11, q2Kills: 2, q3Kills: 1, totalKills: 14 },
    { date, xtreinoId, teamName: "FURY ELITE", playerName: "HLUYDEX", q1Kills: 5, q2Kills: 3, q3Kills: 1, totalKills: 9 },
    { date, xtreinoId, teamName: "FURY ELITE", playerName: "DEX", q1Kills: 5, q2Kills: 4, q3Kills: 1, totalKills: 10 },
    { date, xtreinoId, teamName: "FURY ELITE", playerName: "KAY", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date, xtreinoId, teamName: "FURY ELITE", playerName: "TRY", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date, xtreinoId, teamName: "TROPA DO XXX", playerName: "XXX Pedrozin", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date, xtreinoId, teamName: "TROPA DO XXX", playerName: "!Iagoperesㅤ🃏", q1Kills: 1, q2Kills: 1, q3Kills: 0, totalKills: 2 },
    { date, xtreinoId, teamName: "TROPA DO XXX", playerName: "XXX †Crinsom", q1Kills: 0, q2Kills: 0, q3Kills: 2, totalKills: 2 },
    { date, xtreinoId, teamName: "TROPA DO XXX", playerName: "XXX 🪠🪠🪠", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date, xtreinoId, teamName: "TROPA DO XXX", playerName: "XXX Rip_sw🤫", q1Kills: 0, q2Kills: 6, q3Kills: 2, totalKills: 8 },
    { date, xtreinoId, teamName: "K4F", playerName: "K4F  Éourso", q1Kills: 2, q2Kills: 0, q3Kills: 0, totalKills: 2 },
    { date, xtreinoId, teamName: "K4F", playerName: "K4F  Gui", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date, xtreinoId, teamName: "K4F", playerName: "K4F  Zaza", q1Kills: 2, q2Kills: 6, q3Kills: 0, totalKills: 8 },
    { date, xtreinoId, teamName: "K4F", playerName: "K4F  Nine", q1Kills: 0, q2Kills: 5, q3Kills: 0, totalKills: 5 },
    { date, xtreinoId, teamName: "K4F", playerName: "wend", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date, xtreinoId, teamName: "K4F", playerName: "aleke", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date, xtreinoId, teamName: "UGD LIGHT", playerName: "Kyz", q1Kills: 4, q2Kills: 0, q3Kills: 2, totalKills: 6 },
    { date, xtreinoId, teamName: "UGD LIGHT", playerName: "Zann", q1Kills: 4, q2Kills: 1, q3Kills: 3, totalKills: 8 },
    { date, xtreinoId, teamName: "UGD LIGHT", playerName: "Psycho", q1Kills: 8, q2Kills: 3, q3Kills: 1, totalKills: 12 },
    { date, xtreinoId, teamName: "UGD LIGHT", playerName: "Chino", q1Kills: 8, q2Kills: 0, q3Kills: 3, totalKills: 11 },
    { date, xtreinoId, teamName: "UGD LIGHT", playerName: "Sant", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date, xtreinoId, teamName: "REÐ Outlaws", playerName: "REÐ  MoraesBC", q1Kills: 2, q2Kills: 0, q3Kills: 0, totalKills: 2 },
    { date, xtreinoId, teamName: "REÐ Outlaws", playerName: "REÐ  Felpz", q1Kills: 0, q2Kills: 1, q3Kills: 1, totalKills: 2 },
    { date, xtreinoId, teamName: "REÐ Outlaws", playerName: "REÐ  Skibidi", q1Kills: 4, q2Kills: 0, q3Kills: 3, totalKills: 7 },
    { date, xtreinoId, teamName: "REÐ Outlaws", playerName: "REÐ  Apenas", q1Kills: 2, q2Kills: 2, q3Kills: 6, totalKills: 10 },
    { date, xtreinoId, teamName: "UGD Threat", playerName: "Cool", q1Kills: 1, q2Kills: 10, q3Kills: 4, totalKills: 15 },
    { date, xtreinoId, teamName: "UGD Threat", playerName: "Treon", q1Kills: 3, q2Kills: 8, q3Kills: 5, totalKills: 16 },
    { date, xtreinoId, teamName: "UGD Threat", playerName: "Kaze", q1Kills: 1, q2Kills: 6, q3Kills: 3, totalKills: 10 },
    { date, xtreinoId, teamName: "UGD Threat", playerName: "Arise", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date, xtreinoId, teamName: "UGD Threat", playerName: "LMF_BOSS", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date, xtreinoId, teamName: "UGD Threat", playerName: "Santz", q1Kills: 2, q2Kills: 4, q3Kills: 5, totalKills: 11 },
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
  console.log(`[SEED XTREINO-09062026] ${jogadoresCount} estatísticas de jogadores inseridas`);
  console.log("[SEED XTREINO-09062026] Done!");
}
