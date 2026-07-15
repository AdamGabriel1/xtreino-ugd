import { relations } from "drizzle-orm";
import {
  teams,
  players,
  clans,
  championships,
  championshipTeams,
  matches,
  xtreinos,
  xtreinoTeams,
  xtreinoPlayers,
  xtreinoResults,
  xtreinoSchedule, // Mantido caso use no futuro
  scrims,
  scrimResults,
  scrimResultRounds, // NOVO
  scrimPlayerStats,
  scrimPlayerStatRounds, // NOVO
  campeonatoResults,
  campeonatoPlayerStats,
  rankings,
  registrations,
  unifiedPlayerStats, // NOVO
  unifiedTeamStats, // NOVO
  playerAliases, // NOVO
  teamAliases, // NOVO
  playerMerges, // NOVO
} from "./schema.js";

// ============================================================
// BASE (Clans, Teams, Players)
// ============================================================
export const clansRelations = relations(clans, ({ many }) => ({
  teams: many(teams),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  clan: one(clans, {
    fields: [teams.clanId],
    references: [clans.id],
  }),
  players: many(players),
  championshipTeams: many(championshipTeams),
  xtreinoTeams: many(xtreinoTeams),
  scrimsAsTeam1: many(scrims, { relationName: "scrimTeam1" }),
  scrimsAsTeam2: many(scrims, { relationName: "scrimTeam2" }),
  unifiedTeamStat: one(unifiedTeamStats),
  teamAliases: many(teamAliases),
}));

export const playersRelations = relations(players, ({ one, many }) => ({
  team: one(teams, {
    fields: [players.teamId],
    references: [teams.id],
  }),
  primaryTeam: one(teams, {
    fields: [players.primaryTeamId],
    references: [teams.id],
    relationName: "playerPrimaryTeam",
  }),
  unifiedPlayerStat: one(unifiedPlayerStats),
  playerAliases: many(playerAliases),
  mergesAsMaster: many(playerMerges, { relationName: "mergeMaster" }),
  mergesAsMerged: many(playerMerges, { relationName: "mergeTarget" }),
}));

// ============================================================
// CHAMPIONSHIPS
// ============================================================
export const championshipsRelations = relations(championships, ({ many }) => ({
  championshipTeams: many(championshipTeams),
  matches: many(matches),
  campeonatoResults: many(campeonatoResults),
  campeonatoPlayerStats: many(campeonatoPlayerStats),
}));

export const championshipTeamsRelations = relations(championshipTeams, ({ one }) => ({
  championship: one(championships, {
    fields: [championshipTeams.championshipId],
    references: [championships.id],
  }),
  team: one(teams, {
    fields: [championshipTeams.teamId],
    references: [teams.id],
  }),
}));

export const matchesRelations = relations(matches, ({ one }) => ({
  championship: one(championships, {
    fields: [matches.championshipId],
    references: [championships.id],
  }),
  team1: one(teams, {
    fields: [matches.team1Id],
    references: [teams.id],
    relationName: "matchTeam1",
  }),
  team2: one(teams, {
    fields: [matches.team2Id],
    references: [teams.id],
    relationName: "matchTeam2",
  }),
}));

export const campeonatoResultsRelations = relations(campeonatoResults, ({ one }) => ({
  championship: one(championships, {
    fields: [campeonatoResults.championshipId],
    references: [championships.id],
  }),
}));

export const campeonatoPlayerStatsRelations = relations(campeonatoPlayerStats, ({ one }) => ({
  championship: one(championships, {
    fields: [campeonatoPlayerStats.championshipId],
    references: [championships.id],
  }),
}));

// ============================================================
// XTREINOS
// ============================================================
export const xtreinosRelations = relations(xtreinos, ({ many }) => ({
  xtreinoTeams: many(xtreinoTeams),
  xtreinoResults: many(xtreinoResults),
  // xtreinoSchedule: many(xtreinoSchedule), // Descomente se adicionar xtreinoId na tabela de agendamento
}));

export const xtreinoTeamsRelations = relations(xtreinoTeams, ({ one, many }) => ({
  xtreino: one(xtreinos, {
    fields: [xtreinoTeams.xtreinoId],
    references: [xtreinos.id],
  }),
  team: one(teams, {
    fields: [xtreinoTeams.teamId],
    references: [teams.id],
  }),
  players: many(xtreinoPlayers),
}));

export const xtreinoPlayersRelations = relations(xtreinoPlayers, ({ one }) => ({
  xtreinoTeam: one(xtreinoTeams, {
    fields: [xtreinoPlayers.xtreinoTeamId],
    references: [xtreinoTeams.id],
  }),
}));

export const xtreinoResultsRelations = relations(xtreinoResults, ({ one }) => ({
  xtreino: one(xtreinos, {
    fields: [xtreinoResults.xtreinoId],
    references: [xtreinos.id],
  }),
}));

// REMOVIDO: xtreinoScheduleRelations apontando para date. 
// Se precisar relacionar, adicione um campo `xtreinoId` na tabela `xtreinoSchedule` no schema primeiro.

// ============================================================
// SCRIMS (Agora com as rounds dinâmicas)
// ============================================================
export const scrimsRelations = relations(scrims, ({ one, many }) => ({
  team1: one(teams, {
    fields: [scrims.team1Id],
    references: [teams.id],
    relationName: "scrimTeam1", // Necessário porque o time aparece em duas FKs
  }),
  team2: one(teams, {
    fields: [scrims.team2Id],
    references: [teams.id],
    relationName: "scrimTeam2",
  }),
  scrimResults: many(scrimResults),
  scrimPlayerStats: many(scrimPlayerStats),
}));

export const scrimResultsRelations = relations(scrimResults, ({ one, many }) => ({
  scrim: one(scrims, {
    fields: [scrimResults.scrimId],
    references: [scrims.id],
  }),
  rounds: many(scrimResultRounds), // NOVO: Relação dinâmica
}));

export const scrimResultRoundsRelations = relations(scrimResultRounds, ({ one }) => ({
  scrimResult: one(scrimResults, {
    fields: [scrimResultRounds.scrimResultId],
    references: [scrimResults.id],
  }),
}));

export const scrimPlayerStatsRelations = relations(scrimPlayerStats, ({ one, many }) => ({
  scrim: one(scrims, {
    fields: [scrimPlayerStats.scrimId],
    references: [scrims.id],
  }),
  rounds: many(scrimPlayerStatRounds), // NOVO: Relação dinâmica
}));

export const scrimPlayerStatRoundsRelations = relations(scrimPlayerStatRounds, ({ one }) => ({
  scrimPlayerStat: one(scrimPlayerStats, {
    fields: [scrimPlayerStatRounds.scrimPlayerStatId],
    references: [scrimPlayerStats.id],
  }),
}));

// ============================================================
// UNIFIED STATS, ALIASES E MERGES
// ============================================================
export const unifiedPlayerStatsRelations = relations(unifiedPlayerStats, ({ one }) => ({
  player: one(players, {
    fields: [unifiedPlayerStats.playerId],
    references: [players.id],
  }),
}));

export const unifiedTeamStatsRelations = relations(unifiedTeamStats, ({ one }) => ({
  team: one(teams, {
    fields: [unifiedTeamStats.teamId],
    references: [teams.id],
  }),
}));

export const playerAliasesRelations = relations(playerAliases, ({ one }) => ({
  player: one(players, {
    fields: [playerAliases.playerId],
    references: [players.id],
  }),
}));

export const teamAliasesRelations = relations(teamAliases, ({ one }) => ({
  team: one(teams, {
    fields: [teamAliases.teamId],
    references: [teams.id],
  }),
}));

export const playerMergesRelations = relations(playerMerges, ({ one }) => ({
  masterPlayer: one(players, {
    fields: [playerMerges.masterPlayerId],
    references: [players.id],
    relationName: "mergeMaster",
  }),
  mergedPlayer: one(players, {
    fields: [playerMerges.mergedPlayerId],
    references: [players.id],
    relationName: "mergeTarget",
  }),
}));

// ============================================================
// RANKINGS & REGISTRATIONS
// ============================================================
// ATENÇÃO: Como rankings é polimórfico (aceita time ou jogador),
// não é possível criar uma relation forte aqui no Drizzle.
// Você deve fazer a resolução no código da aplicação.
// export const rankingsRelations = relations(rankings, ({ one }) => ({ ... }));

// ATENÇÃO: registrations não tem FKs válidas no schema para apontar aqui.
// export const registrationsRelations = relations(registrations, ({ one }) => ({ ... }));