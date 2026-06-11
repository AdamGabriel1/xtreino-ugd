import { getDb } from "../../api/queries/connection.js";
import { eq, and } from "drizzle-orm";
import {
  xtreinoResults,
  xtreinoPlayerStats,
} from "../schema.js";
import { calcularPontosXtreino } from "../../api/lib/pontuacao.js";

/**
 * Seed de dados do XTREINO da Underground
 * Data: 10/06/2026 (xtreinoId: 7)
 */

export function seedXtreino10062026() {
  const db = getDb();
  console.log("[SEED XTREINO-10062026] Starting...");

  const xtreinoId = 7;
  const date = "2026-06-10";

  const xtreinoColocacoesData = [
    { date, xtreinoId, teamName: "CMF ATLANTIC", q1Pos: 1, q2Pos: 7, q3Pos: 3 },
    { date, xtreinoId, teamName: "UGD Threat + Olympique", q1Pos: 6, q2Pos: 5, q3Pos: 4 },
    { date, xtreinoId, teamName: "FURY ROYAL", q1Pos: 3, q2Pos: 3, q3Pos: 1 },
    { date, xtreinoId, teamName: "EmE", q1Pos: 4, q2Pos: 2, q3Pos: 10 },
    { date, xtreinoId, teamName: "UGD Legends", q1Pos: 2, q2Pos: 1, q3Pos: 6 },
    { date, xtreinoId, teamName: "CMF ASSALT", q1Pos: 7, q2Pos: 10, q3Pos: 7 },
    { date, xtreinoId, teamName: "FURY ELITE", q1Pos: 8, q2Pos: 4, q3Pos: 5 },
    { date, xtreinoId, teamName: "UGD LIGHT", q1Pos: 9, q2Pos: 8, q3Pos: 2 },
    { date, xtreinoId, teamName: "K4F", q1Pos: 10, q2Pos: 9, q3Pos: 8 },
    { date, xtreinoId, teamName: "♱VØID×STRIKE♱", q1Pos: 11, q2Pos: 11, q3Pos: 10 },
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
  console.log(`[SEED XTREINO-10062026] ${colocacoesCount} colocações inseridas`);

  const xtreinoJogadoresData = [
    { date, xtreinoId, teamName: "FURY ROYAL", playerName: "VN", q1Kills: 5, q2Kills: 11, q3Kills: 9, totalKills: 25 },
    { date, xtreinoId, teamName: "FURY ROYAL", playerName: "Egoist", q1Kills: 8, q2Kills: 5, q3Kills: 7, totalKills: 20 },
    { date, xtreinoId, teamName: "FURY ROYAL", playerName: "NG", q1Kills: 12, q2Kills: 6, q3Kills: 13, totalKills: 31 },
    { date, xtreinoId, teamName: "FURY ROYAL", playerName: "MARTNA", q1Kills: 11, q2Kills: 15, q3Kills: 8, totalKills: 34 },
    { date, xtreinoId, teamName: "FURY ROYAL", playerName: "Noki", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date, xtreinoId, teamName: "FURY ROYAL", playerName: "OFF", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date, xtreinoId, teamName: "TROPA DO XXX", playerName: "AMN Y2K", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date, xtreinoId, teamName: "TROPA DO XXX", playerName: "!Iagoperesㅤ🃏", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date, xtreinoId, teamName: "TROPA DO XXX", playerName: "XXX †Crinsom", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date, xtreinoId, teamName: "TROPA DO XXX", playerName: "XXX Rip_sw🤫", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date, xtreinoId, teamName: "TROPA DO XXX", playerName: "XXX Pedrozin", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date, xtreinoId, teamName: "TROPA DO XXX", playerName: "XXX China🇨🇳", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date, xtreinoId, teamName: "♱VØID×STRIKE♱", playerName: "♱Vøid♱.D_R", q1Kills: 1, q2Kills: 0, q3Kills: 0, totalKills: 1 },
    { date, xtreinoId, teamName: "♱VØID×STRIKE♱", playerName: "♱Vøid♱+gute", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date, xtreinoId, teamName: "♱VØID×STRIKE♱", playerName: "♱Vøid♱.nino", q1Kills: 1, q2Kills: 0, q3Kills: 0, totalKills: 1 },
    { date, xtreinoId, teamName: "♱VØID×STRIKE♱", playerName: "™VØID°⁷⁷⁷", q1Kills: 1, q2Kills: 0, q3Kills: 0, totalKills: 1 },
    { date, xtreinoId, teamName: "♱VØID×STRIKE♱", playerName: "√Vøid√T9", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date, xtreinoId, teamName: "FURY ELITE", playerName: "DIANA", q1Kills: 1, q2Kills: 1, q3Kills: 7, totalKills: 9 },
    { date, xtreinoId, teamName: "FURY ELITE", playerName: "DEX", q1Kills: 3, q2Kills: 2, q3Kills: 1, totalKills: 6 },
    { date, xtreinoId, teamName: "FURY ELITE", playerName: "SUN", q1Kills: 6, q2Kills: 9, q3Kills: 3, totalKills: 18 },
    { date, xtreinoId, teamName: "FURY ELITE", playerName: "TRY", q1Kills: 0, q2Kills: 5, q3Kills: 5, totalKills: 10 },
    { date, xtreinoId, teamName: "FURY ELITE", playerName: "SLUUG", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date, xtreinoId, teamName: "FURY ELITE", playerName: "RAUAN", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date, xtreinoId, teamName: "K4F", playerName: "K4F  Éourso", q1Kills: 1, q2Kills: 1, q3Kills: 0, totalKills: 2 },
    { date, xtreinoId, teamName: "K4F", playerName: "aleke", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date, xtreinoId, teamName: "K4F", playerName: "K4F  Zaza", q1Kills: 0, q2Kills: 1, q3Kills: 1, totalKills: 2 },
    { date, xtreinoId, teamName: "K4F", playerName: "K4F  Nine", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date, xtreinoId, teamName: "K4F", playerName: "wend", q1Kills: 2, q2Kills: 2, q3Kills: 2, totalKills: 6 },
    { date, xtreinoId, teamName: "UGD Threat + Olympique", playerName: "Treon", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date, xtreinoId, teamName: "UGD Threat + Olympique", playerName: "Kaze", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date, xtreinoId, teamName: "UGD Threat + Olympique", playerName: "Arise", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date, xtreinoId, teamName: "UGD Threat + Olympique", playerName: "LMF_BOSS", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date, xtreinoId, teamName: "UGD Legends", playerName: "Buzeira", q1Kills: 3, q2Kills: 2, q3Kills: 1, totalKills: 6 },
    { date, xtreinoId, teamName: "UGD Threat + Olympique", playerName: "Sant", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date, xtreinoId, teamName: "UGD Legends", playerName: "Hell", q1Kills: 3, q2Kills: 8, q3Kills: 4, totalKills: 15 },
    { date, xtreinoId, teamName: "UGD Legends", playerName: "Xoxoto", q1Kills: 14, q2Kills: 13, q3Kills: 4, totalKills: 31 },
    { date, xtreinoId, teamName: "UGD Threat + Olympique", playerName: "Waze", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date, xtreinoId, teamName: "UGD LIGHT", playerName: "Kyz", q1Kills: 2, q2Kills: 1, q3Kills: 4, totalKills: 7 },
    { date, xtreinoId, teamName: "UGD LIGHT", playerName: "Zann", q1Kills: 1, q2Kills: 0, q3Kills: 0, totalKills: 1 },
    { date, xtreinoId, teamName: "UGD LIGHT", playerName: "Psycho", q1Kills: 3, q2Kills: 1, q3Kills: 1, totalKills: 5 },
    { date, xtreinoId, teamName: "UGD LIGHT", playerName: "Chino", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date, xtreinoId, teamName: "UGD LIGHT", playerName: "Sant", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date, xtreinoId, teamName: "UGD LIGHT", playerName: "Cool", q1Kills: 0, q2Kills: 0, q3Kills: 6, totalKills: 6 },
    { date, xtreinoId, teamName: "CMF ATLANTIC", playerName: "CMF Léo", q1Kills: 14, q2Kills: 4, q3Kills: 7, totalKills: 25 },
    { date, xtreinoId, teamName: "CMF ATLANTIC", playerName: "CMF Syx", q1Kills: 14, q2Kills: 7, q3Kills: 3, totalKills: 24 },
    { date, xtreinoId, teamName: "CMF ATLANTIC", playerName: "CMF Kira", q1Kills: 13, q2Kills: 2, q3Kills: 4, totalKills: 19 },
    { date, xtreinoId, teamName: "CMF ATLANTIC", playerName: "CMF Moizo", q1Kills: 9, q2Kills: 4, q3Kills: 4, totalKills: 17 },
    { date, xtreinoId, teamName: "CMF ATLANTIC", playerName: "CMF Sant", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date, xtreinoId, teamName: "CMF ASSALT", playerName: "CMF Dnvy", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date, xtreinoId, teamName: "CMF ASSALT", playerName: "CMF Lynx7", q1Kills: 0, q2Kills: 1, q3Kills: 0, totalKills: 1 },
    { date, xtreinoId, teamName: "CMF ASSALT", playerName: "CMF Max", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date, xtreinoId, teamName: "CMF ASSALT", playerName: "CMF Thxxxz", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date, xtreinoId, teamName: "UGD Threat + Olympique", playerName: "Weenot", q1Kills: 3, q2Kills: 9, q3Kills: 3, totalKills: 15 },
    { date, xtreinoId, teamName: "UGD Legends", playerName: "Duardin", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date, xtreinoId, teamName: "UGD Legends", playerName: "Lorex", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date, xtreinoId, teamName: "UGD Legends", playerName: "Cants", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date, xtreinoId, teamName: "UGD Legends", playerName: "Santz", q1Kills: 10, q2Kills: 7, q3Kills: 5, totalKills: 13 },
    { date, xtreinoId, teamName: "UGD Threat + Olympique", playerName: "Waze", q1Kills: 2, q2Kills: 7, q3Kills: 3, totalKills: 12 },
    { date, xtreinoId, teamName: "UGD Threat + Olympique", playerName: "Kaze", q1Kills: 5, q2Kills: 4, q3Kills: 1, totalKills: 10 },
    { date, xtreinoId, teamName: "UGD Threat + Olympique", playerName: "Treon", q1Kills: 7, q2Kills: 6, q3Kills: 11, totalKills: 24 },
    { date, xtreinoId, teamName: "EmE", playerName: "Nofear", q1Kills: 4, q2Kills: 6, q3Kills: 0, totalKills: 10 },
    { date, xtreinoId, teamName: "EmE", playerName: "geldeysito", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
    { date, xtreinoId, teamName: "EmE", playerName: "EME々Akaza", q1Kills: 4, q2Kills: 14, q3Kills: 0, totalKills: 18 },
    { date, xtreinoId, teamName: "EmE", playerName: "MK4", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 },
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
  console.log(`[SEED XTREINO-10062026] ${jogadoresCount} estatísticas de jogadores inseridas`);
  console.log("[SEED XTREINO-10062026] Done!");
}