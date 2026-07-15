import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "../../api/middleware.js";
import { getDb } from "../../api/queries/connection.js";
import {
  players,
  teams,
  clans,
  xtreinos,
  xtreinoPlayerStats,
  scrims,
  scrimPlayerStats,
  scrimPlayerStatRounds,
  scrimResults,
  scrimResultRounds,
  unifiedPlayerStats,
  unifiedTeamStats,
  playerAliases,
  teamAliases,
} from "../../db/schema.js";
import { eq, desc, and, sql, inArray } from "drizzle-orm";
import { verifyToken } from "../../api/lib/auth.js";

export const unifiedRouter = createRouter({
  // ============================================================
  // PLAYERS UNIFICADO
  // ============================================================

  listPlayers: publicQuery
    .input(
      z.object({
        search: z.string().optional(),
        teamId: z.number().optional(),
        // CORREÇÃO: Adicionado "scrimKdRatio" no enum para permitir ordenar por essa coluna no frontend
        sortBy: z.enum(["totalKills", "xtreinoKills", "scrimKills", "scrimMvps", "scrimKdRatio", "totalMatches"]).optional(),
        limit: z.number().optional(),
      }).optional()
    )
    .query(({ input }) => {
      const db = getDb();
      
      const stats = db.select().from(unifiedPlayerStats).all();
      const playerIds = stats.map(s => s.playerId);

      if (playerIds.length === 0) return [];

      let playersList = db.select().from(players)
        .where(inArray(players.id, playerIds))
        .all();

      if (input?.search) {
        const q = input.search.toLowerCase();
        playersList = playersList.filter(p => p.nickname.toLowerCase().includes(q));
      }
      if (input?.teamId) {
        playersList = playersList.filter(p => p.teamId === input.teamId);
      }

      const teamCache = new Map<number, { name: string; tag: string; clanId: number | null }>();
      const getTeam = (id: number) => {
        if (teamCache.has(id)) return teamCache.get(id)!;
        const t = db.select().from(teams).where(eq(teams.id, id)).get();
        if (t) teamCache.set(id, { name: t.name, tag: t.tag, clanId: t.clanId });
        return t ? { name: t.name, tag: t.tag, clanId: t.clanId } : { name: "Sem Time", tag: "", clanId: null };
      };

      const enriched = playersList.map(p => {
        const s = stats.find(st => st.playerId === p.id);
        const team = p.teamId ? getTeam(p.teamId) : null;
        
        const aliases = db.select().from(playerAliases)
          .where(eq(playerAliases.playerId, p.id))
          .all()
          .map(a => a.alias)
          .filter(a => a !== p.nickname);

        const playerData = {
          id: p.id,
          nickname: p.nickname,
          role: p.role,
          teamName: team?.name ?? "Sem Time",
          teamTag: team?.tag ?? "",
          clanId: team?.clanId ?? null,
          aliases,
          xtreinoMatches: s?.xtreinoMatches ?? 0,
          xtreinoKills: s?.xtreinoKills ?? 0,
          xtreinoBestQ1: s?.xtreinoBestQ1 ?? 0,
          xtreinoBestQ2: s?.xtreinoBestQ2 ?? 0,
          xtreinoBestQ3: s?.xtreinoBestQ3 ?? 0,
          scrimMatches: s?.scrimMatches ?? 0,
          scrimRounds: s?.scrimRounds ?? 0,
          scrimKills: s?.scrimKills ?? 0,
          scrimAssists: s?.scrimAssists ?? 0,
          scrimDeaths: s?.scrimDeaths ?? 0,
          scrimDamage: s?.scrimDamage ?? 0,
          scrimMvps: s?.scrimMvps ?? 0,
          scrimWins: s?.scrimWins ?? 0,
          scrimLosses: s?.scrimLosses ?? 0,
          scrimKdRatio: s?.scrimKdRatio ?? 0,
          totalMatches: s?.totalMatches ?? 0,
          totalKills: s?.totalKills ?? 0,
        };

        return playerData;
      });

      const sort = (input?.sortBy || "totalKills") as keyof typeof enriched[0];
      enriched.sort((a, b) => (Number(b[sort]) || 0) - (Number(a[sort]) || 0));

      if (input?.limit) return enriched.slice(0, input.limit);
      return enriched;
    }),

  getPlayerDetails: publicQuery
    .input(z.object({ id: z.number() }))
    .query(({ input }) => {
      const db = getDb();
      const player = db.select().from(players).where(eq(players.id, input.id)).get();
      if (!player) return null;

      const team = player.teamId ? db.select().from(teams).where(eq(teams.id, player.teamId)).get() : null;
      const aliases = db.select().from(playerAliases).where(eq(playerAliases.playerId, input.id)).all();
      const stats = db.select().from(unifiedPlayerStats).where(eq(unifiedPlayerStats.playerId, input.id)).get();

      const allNicks = [player.nickname, ...aliases.map(a => a.alias)];
      const xtreinoHistory = db.select().from(xtreinoPlayerStats)
        .where(sql`${xtreinoPlayerStats.playerName} IN (${sql.join(allNicks, sql`, `)})`)
        .orderBy(desc(xtreinoPlayerStats.date))
        .all();

      const scrimHistoryRaw = db.select().from(scrimPlayerStats)
        .where(sql`${scrimPlayerStats.playerName} IN (${sql.join(allNicks, sql`, `)})`)
        .orderBy(desc(scrimPlayerStats.date))
        .all();

      const scrimHistory = scrimHistoryRaw.map(sh => {
        const rounds = db.select().from(scrimPlayerStatRounds)
          .where(eq(scrimPlayerStatRounds.scrimPlayerStatId, sh.id))
          .all();
        return { ...sh, rounds };
      });

      return {
        ...player,
        teamName: team?.name ?? null,
        teamTag: team?.tag ?? null,
        aliases,
        stats,
        xtreinoHistory,
        scrimHistory,
      };
    }),

  // ============================================================
  // TEAMS UNIFICADO
  // ============================================================

  listTeams: publicQuery
    .input(
      z.object({
        search: z.string().optional(),
        clanId: z.number().optional(),
        sortBy: z.enum(["totalMatches", "totalKills", "totalWins"]).optional(),
      }).optional()
    )
    .query(({ input }) => {
      const db = getDb();
      let query = db.select().from(teams);

      if (input?.clanId) {
        query = db.select().from(teams).where(eq(teams.clanId, input.clanId)) as typeof query;
      }
      
      let allTeams = query.all();

      if (input?.search) {
        const q = input.search.toLowerCase();
        allTeams = allTeams.filter(t => t.name.toLowerCase().includes(q) || t.tag.toLowerCase().includes(q));
      }

      const stats = db.select().from(unifiedTeamStats).all();
      const statsMap = new Map(stats.map(s => [s.teamId, s]));

      const enriched = allTeams.map(t => {
        const s = statsMap.get(t.id);
        const aliases = db.select().from(teamAliases).where(eq(teamAliases.teamId, t.id)).all().map(a => a.alias);
        return {
          ...t,
          aliases,
          xtreinoMatches: s?.xtreinoMatches ?? 0,
          xtreinoKills: s?.xtreinoKills ?? 0,
          scrimMatches: s?.scrimMatches ?? 0,
          scrimWins: s?.scrimWins ?? 0,
          scrimLosses: s?.scrimLosses ?? 0,
          totalMatches: s?.totalMatches ?? 0,
          totalKills: s?.totalKills ?? 0,
          totalWins: s?.totalWins ?? 0,
        };
      });

      const sort = (input?.sortBy || "totalMatches") as keyof typeof enriched[0];
      enriched.sort((a, b) => (Number(b[sort]) || 0) - (Number(a[sort]) || 0));
      
      return enriched;
    }),

  getTeamDetails: publicQuery
    .input(z.object({ id: z.number() }))
    .query(({ input }) => {
      const db = getDb();
      const team = db.select().from(teams).where(eq(teams.id, input.id)).get();
      if (!team) return null;

      const clan = team.clanId ? db.select().from(clans).where(eq(clans.id, team.clanId)).get() : null;
      const teamAliasesList = db.select().from(teamAliases).where(eq(teamAliases.teamId, input.id)).all();
      const stats = db.select().from(unifiedTeamStats).where(eq(unifiedTeamStats.teamId, input.id)).get();
      const roster = db.select().from(players).where(eq(players.teamId, input.id)).all();

      return {
        ...team,
        clanName: clan?.name ?? null,
        clanColor: clan?.color ?? null,
        aliases: teamAliasesList,
        stats,
        roster,
      };
    }),

  // ============================================================
  // SCRIMS UNIFICADO
  // ============================================================

  listScrims: publicQuery.query(() => {
    const db = getDb();
    const allScrims = db.select().from(scrims).orderBy(desc(scrims.date)).all();
    
    const teamCache = new Map<number, { name: string; tag: string }>();
    const getTeam = (id: number | null) => {
      if (!id) return null;
      if (teamCache.has(id)) return teamCache.get(id)!;
      const t = db.select().from(teams).where(eq(teams.id, id)).get();
      if (t) teamCache.set(id, { name: t.name, tag: t.tag });
      return t ? { name: t.name, tag: t.tag } : null;
    };

    return allScrims.map(s => {
      const t1 = getTeam(s.team1Id);
      const t2 = getTeam(s.team2Id);
      
      return { 
        ...s, 
        team1Name: t1?.name ?? null, 
        team2Name: t2?.name ?? null,
        team1Tag: t1?.tag ?? null, 
        team2Tag: t2?.tag ?? null 
      };
    });
  }),

  getScrimDetails: publicQuery
    .input(z.object({ id: z.number() }))
    .query(({ input }) => {
      const db = getDb();
      const scrim = db.select().from(scrims).where(eq(scrims.id, input.id)).get();
      if (!scrim) return null;

      const results = db.select().from(scrimResults).where(eq(scrimResults.scrimId, input.id)).all();
      const resultsWithRounds = results.map(r => {
        const rounds = db.select().from(scrimResultRounds)
          .where(eq(scrimResultRounds.scrimResultId, r.id))
          .orderBy(scrimResultRounds.roundNumber)
          .all();
        return { ...r, rounds };
      });

      const playerStats = db.select().from(scrimPlayerStats).where(eq(scrimPlayerStats.scrimId, input.id)).all();
      const playerStatsWithRounds = playerStats.map(ps => {
        const rounds = db.select().from(scrimPlayerStatRounds)
          .where(eq(scrimPlayerStatRounds.scrimPlayerStatId, ps.id))
          .orderBy(scrimPlayerStatRounds.roundNumber)
          .all();
        return { ...ps, rounds };
      });

      const t1 = scrim.team1Id ? db.select().from(teams).where(eq(teams.id, scrim.team1Id)).get() : null;
      const t2 = scrim.team2Id ? db.select().from(teams).where(eq(teams.id, scrim.team2Id)).get() : null;

      return {
        ...scrim,
        team1Name: t1?.name ?? null,
        team2Name: t2?.name ?? null,
        teamResults: resultsWithRounds,
        playerStats: playerStatsWithRounds,
      };
    }),

  // ============================================================
  // RANKINGS UNIFICADOS
  // ============================================================

  getTeamRankings: publicQuery
    .input(z.object({
      type: z.enum(["xtreino", "scrim", "overall"]).optional(),
      limit: z.number().optional(),
    }).optional())
    .query(({ input }) => {
      const db = getDb();
      const stats = db.select().from(unifiedTeamStats).all();
      const teamCache = new Map<number, { name: string; tag: string; clanId: number | null }>();

      const getTeamInfo = (id: number) => {
        if (teamCache.has(id)) return teamCache.get(id)!;
        const t = db.select().from(teams).where(eq(teams.id, id)).get();
        const info = t ? { name: t.name, tag: t.tag, clanId: t.clanId } : { name: "Desconhecido", tag: "", clanId: null };
        teamCache.set(id, info);
        return info;
      };

      const ranked = stats.map(s => {
        const team = getTeamInfo(s.teamId);
        let points = 0;
        
        if (input?.type === 'xtreino' || !input?.type) {
          points += (s.xtreinoTotalPoints ?? 0) + (s.xtreinoKills * 2);
        }
        if (input?.type === 'scrim' || !input?.type) {
          points += (s.scrimWins * 50) + (s.scrimRoundsWon * 10) + (s.scrimKills * 2);
        }

        return {
          teamId: s.teamId,
          teamName: team.name,
          teamTag: team.tag,
          clanId: team.clanId,
          points,
          xtreinoMatches: s.xtreinoMatches,
          xtreinoWins: s.xtreinoWins,
          xtreinoKills: s.xtreinoKills,
          scrimMatches: s.scrimMatches,
          scrimWins: s.scrimWins,
          scrimLosses: s.scrimLosses,
          scrimKills: s.scrimKills,
          totalMatches: s.totalMatches,
          totalWins: s.totalWins,
        };
      });

      ranked.sort((a, b) => b.points - a.points);
      if (input?.limit) return ranked.slice(0, input.limit);
      return ranked;
    }),

  getPlayerRankings: publicQuery
    .input(z.object({
      type: z.enum(["xtreino", "scrim", "overall"]).optional(),
      limit: z.number().optional(),
    }).optional())
    .query(({ input }) => {
      const db = getDb();
      const stats = db.select().from(unifiedPlayerStats).all();
      const playerCache = new Map<number, { nickname: string; teamName: string; teamId: number | null }>();

      const getPlayerInfo = (id: number) => {
        if (playerCache.has(id)) return playerCache.get(id)!;
        const p = db.select().from(players).where(eq(players.id, id)).get();
        let teamName = "Sem Time";
        if (p?.teamId) {
          const t = db.select().from(teams).where(eq(teams.id, p.teamId)).get();
          if (t) teamName = t.name;
        }
        const info = p ? { nickname: p.nickname, teamName, teamId: p.teamId } : { nickname: "Desconhecido", teamName: "Sem Time", teamId: null };
        playerCache.set(id, info);
        return info;
      };

      const ranked = stats.map(s => {
        const player = getPlayerInfo(s.playerId);
        let points = 0;

        if (input?.type === 'xtreino' || !input?.type) {
          points += (s.xtreinoKills * 2) + (s.xtreinoBestQ1 * 5) + (s.xtreinoBestQ2 * 3) + (s.xtreinoBestQ3 * 3);
        }
        if (input?.type === 'scrim' || !input?.type) {
          points += (s.scrimKills * 2) + (s.scrimAssists) + (s.scrimMvps * 15) + (s.scrimDamage / 100);
        }

        return {
          playerId: s.playerId,
          nickname: player.nickname,
          teamName: player.teamName,
          points: Math.round(points),
          xtreinoMatches: s.xtreinoMatches,
          xtreinoKills: s.xtreinoKills,
          scrimMatches: s.scrimMatches,
          scrimKills: s.scrimKills,
          scrimAssists: s.scrimAssists,
          scrimDeaths: s.scrimDeaths,
          scrimKdRatio: s.scrimKdRatio,
          scrimMvps: s.scrimMvps,
          totalMatches: s.totalMatches,
          totalKills: s.totalKills,
        };
      });

      ranked.sort((a, b) => b.points - a.points);
      if (input?.limit) return ranked.slice(0, input.limit);
      return ranked;
    }),

  // ============================================================
  // HISTÓRICO GERAL UNIFICADO
  // ============================================================
  listGeneralHistory: publicQuery
    .input(
      z.object({
        limit: z.number().optional(),
      }).optional()
    )
    .query(({ input }) => {
      const db = getDb();
      
      // 1. Busca todos os X-Treinos ordenados por data
      // (Renomeado para xtList para não conflitar com a importação da tabela 'xtreinos')
      const xtList = db.select().from(xtreinos).orderBy(desc(xtreinos.date)).all();
      
      // 2. Busca todos os Scrims ordenados por data
      // (Renomeado para scList para não conflitar com a importação da tabela 'scrims')
      const scList = db.select().from(scrims).orderBy(desc(scrims.date)).all();

      // 3. Busca todos os times para popular os nomes de forma rápida
      const allTeams = db.select().from(teams).all();
      const teamMap = new Map(allTeams.map((t: any) => [t.id, t.name]));

      // 4. Formata os eventos de XT
      const xtEvents = xtList.map((xt: any) => ({
        id: xt.id,
        type: "xtreino" as const,
        date: xt.date,
        title: xt.name || `XT #${xt.id}`,
        team1Name: null as string | null,
        team2Name: null as string | null,
        details: "X-Treino",
      }));

      // 5. Formata os eventos de Scrim
      const scrimEvents = scList.map((sc: any) => ({
        id: sc.id,
        type: "scrim" as const,
        date: sc.date,
        title: `Scrim MME`,
        team1Name: teamMap.get(sc.team1Id) ?? null,
        team2Name: teamMap.get(sc.team2Id) ?? null,
        details: `${teamMap.get(sc.team1Id) ?? "?"} vs ${teamMap.get(sc.team2Id) ?? "?"}`,
      }));

      // 6. Junta tudo, ordena pela data mais recente e limita se necessário
      const combined = [...xtEvents, ...scrimEvents].sort((a, b) => b.date.localeCompare(a.date));
      
      if (input?.limit) return combined.slice(0, input.limit);
      return combined;
    }),

  // ============================================================
  // ADMIN
  // ============================================================
  recalculateStats: adminQuery.mutation(({ ctx }) => {
    const payload = verifyToken(ctx.adminToken as string);
    if (!payload) throw new Error("Invalid token");
    
    return { 
      success: false, 
      message: "O cálculo unificado agora é feito via Seed (seed-unify.ts). Use o terminal para rodar o seed se precisar recalcular." 
    };
  }),
});