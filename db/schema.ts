import {
  sqliteTable,
  integer,
  text,
  real,
} from "drizzle-orm/sqlite-core";

export const admins = sqliteTable("admins", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("admin"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const settings = sqliteTable("settings", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  orgName: text("org_name").notNull().default("Devils Mobile League"),
  orgLogo: text("org_logo"),
  orgBanner: text("org_banner"),
  discordLink: text("discord_link"),
  whatsappLink: text("whatsapp_link"),
  defaultRules: text("default_rules"),
  defaultTimesMx: text("default_times_mx"),
  defaultTimesBr: text("default_times_br"),
  primaryColor: text("primary_color").notNull().default("#ff3b3b"),
  whatsappTemplate: text("whatsapp_template"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const teams = sqliteTable("teams", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  tag: text("tag").notNull(),
  logo: text("logo"),
  captainName: text("captain_name"),
  captainDiscord: text("captain_discord"),
  whatsapp: text("whatsapp"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const players = sqliteTable("players", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  nickname: text("nickname").notNull(),
  uid: text("uid"),
  discord: text("discord"),
  teamId: integer("team_id", { mode: "number" }),
  kills: integer("kills").notNull().default(0),
  deaths: integer("deaths").notNull().default(0),
  wins: integer("wins").notNull().default(0),
  matches: integer("matches").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const championships = sqliteTable("championships", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  modality: text("modality").notNull(),
  format: text("format").notNull(),
  status: text("status").notNull().default("em_breve"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  rules: text("rules"),
  prizePool: text("prize_pool"),
  maxTeams: integer("max_teams").notNull().default(16),
  registeredTeams: integer("registered_teams").notNull().default(0),
  bracketData: text("bracket_data"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const championshipTeams = sqliteTable("championship_teams", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  championshipId: integer("championship_id", { mode: "number" }).notNull(),
  teamId: integer("team_id", { mode: "number" }).notNull(),
  groupName: text("group_name"),
  points: integer("points").notNull().default(0),
  kills: integer("kills").notNull().default(0),
  wins: integer("wins").notNull().default(0),
  matchesPlayed: integer("matches_played").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const matches = sqliteTable("matches", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  championshipId: integer("championship_id", { mode: "number" }).notNull(),
  team1Id: integer("team1_id", { mode: "number" }),
  team2Id: integer("team2_id", { mode: "number" }),
  round: integer("round").notNull().default(1),
  bracketType: text("bracket_type").default("winners"),
  team1Score: integer("team1_score").notNull().default(0),
  team2Score: integer("team2_score").notNull().default(0),
  status: text("status").notNull().default("pendente"),
  scheduledDate: text("scheduled_date"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const xtreinos = sqliteTable("xtreinos", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  date: text("date").notNull(),
  timeMx: text("time_mx"),
  timeBr: text("time_br"),
  modality: text("modality").notNull(),
  maxTeams: integer("max_teams").notNull().default(20),
  rules: text("rules"),
  discordLink: text("discord_link"),
  whatsappLink: text("whatsapp_link"),
  status: text("status").notNull().default("aberto"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const xtreinoTeams = sqliteTable("xtreino_teams", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  xtreinoId: integer("xtreino_id", { mode: "number" }).notNull(),
  teamId: integer("team_id", { mode: "number" }).notNull(),
  isReserve: integer("is_reserve", { mode: "boolean" }).notNull().default(false),
  slotNumber: integer("slot_number", { mode: "number" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const scrims = sqliteTable("scrims", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  team1Id: integer("team1_id", { mode: "number" }),
  team2Id: integer("team2_id", { mode: "number" }),
  date: text("date"),
  time: text("time"),
  modality: text("modality"),
  status: text("status").notNull().default("agendado"),
  result: text("result"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const registrations = sqliteTable("registrations", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  type: text("type").notNull(),
  teamName: text("team_name").notNull(),
  teamTag: text("team_tag"),
  captainName: text("captain_name"),
  captainDiscord: text("captain_discord"),
  whatsapp: text("whatsapp"),
  teamLogo: text("team_logo"),
  eventType: text("event_type").notNull(),
  eventId: integer("event_id", { mode: "number" }).notNull(),
  playersData: text("players_data"),
  reservesData: text("reserves_data"),
  status: text("status").notNull().default("pendente"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const rankings = sqliteTable("rankings", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  entityType: text("entity_type").notNull(),
  entityId: integer("entity_id", { mode: "number" }).notNull(),
  entityName: text("entity_name").notNull(),
  points: integer("points").notNull().default(0),
  kills: integer("kills").notNull().default(0),
  wins: integer("wins").notNull().default(0),
  participations: integer("participations").notNull().default(0),
  kdRatio: real("kd_ratio"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});