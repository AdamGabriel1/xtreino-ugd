import { relations } from "drizzle-orm";
import {
  teams,
  players,
  championships,
  championshipTeams,
  matches,
  xtreinos,
  xtreinoTeams,
  xtreinoPlayers,
  xtreinoResults,
  xtreinoSchedule,
  scrims,
  scrimResults,
  scrimPlayerStats,
  campeonatoResults,
  campeonatoPlayerStats,
  rankings,
  registrations,
} from "./schema.js";

export const teamsRelations = relations(teams, ({ many }) => ({
  players: many(players),
  championshipTeams: many(championshipTeams),
  xtreinoTeams: many(xtreinoTeams),
}));

export const playersRelations = relations(players, ({ one }) => ({
  team: one(teams, {
    fields: [players.teamId],
    references: [teams.id],
  }),
}));

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
}));

export const xtreinosRelations = relations(xtreinos, ({ many }) => ({
  xtreinoTeams: many(xtreinoTeams),
  xtreinoResults: many(xtreinoResults),
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

export const xtreinoScheduleRelations = relations(xtreinoSchedule, ({ one }) => ({
  xtreino: one(xtreinos, {
    fields: [xtreinoSchedule.date],
    references: [xtreinos.date],
  }),
}));

export const scrimsRelations = relations(scrims, ({ one, many }) => ({
  team1: one(teams, {
    fields: [scrims.team1Id],
    references: [teams.id],
  }),
  team2: one(teams, {
    fields: [scrims.team2Id],
    references: [teams.id],
  }),
  scrimResults: many(scrimResults),
  scrimPlayerStats: many(scrimPlayerStats),
}));

export const scrimResultsRelations = relations(scrimResults, ({ one }) => ({
  scrim: one(scrims, {
    fields: [scrimResults.scrimId],
    references: [scrims.id],
  }),
}));

export const scrimPlayerStatsRelations = relations(scrimPlayerStats, ({ one }) => ({
  scrim: one(scrims, {
    fields: [scrimPlayerStats.scrimId],
    references: [scrims.id],
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

export const rankingsRelations = relations(rankings, ({ one }) => ({
  team: one(teams, {
    fields: [rankings.entityId],
    references: [teams.id],
  }),
}));

export const registrationsRelations = relations(registrations, ({ one }) => ({
  team: one(teams, {
    fields: [registrations.eventId],
    references: [teams.id],
  }),
}));