import { relations } from "drizzle-orm";
import { teams, players, championships, championshipTeams, matches, xtreinos, xtreinoTeams, scrims } from "./schema.js";

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
}));

export const xtreinoTeamsRelations = relations(xtreinoTeams, ({ one }) => ({
  xtreino: one(xtreinos, {
    fields: [xtreinoTeams.xtreinoId],
    references: [xtreinos.id],
  }),
  team: one(teams, {
    fields: [xtreinoTeams.teamId],
    references: [teams.id],
  }),
}));

export const scrimsRelations = relations(scrims, ({ one }) => ({
  team1: one(teams, {
    fields: [scrims.team1Id],
    references: [teams.id],
  }),
  team2: one(teams, {
    fields: [scrims.team2Id],
    references: [teams.id],
  }),
}));
