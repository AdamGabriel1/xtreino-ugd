import {
  sqliteTable,
  integer,
  text,
  real,
} from "drizzle-orm/sqlite-core";

export const seedRuns = sqliteTable("seed_runs", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  seedName: text("seed_name").notNull().unique(),
  executedAt: integer("executed_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const admins = sqliteTable("admins", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("admin"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const settings = sqliteTable("settings", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  orgName: text("org_name").notNull().default("Underground"),
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
  fixedTeamsList: text("fixed_teams_list"),
});

// ============================================================
// CLANS
// ============================================================
export const clans = sqliteTable("clans", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  tag: text("tag").notNull(),
  description: text("description"),
  logo: text("logo"),
  banner: text("banner"),
  discord: text("discord"),
  color: text("color").default("#ff3b3b"),
  foundedAt: text("founded_at"),
  status: text("status").notNull().default("active"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// ============================================================
// TEAMS
// ============================================================
export const teams = sqliteTable("teams", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  clanId: integer("clan_id", { mode: "number" }).references(() => clans.id),
  name: text("name").notNull(),
  tag: text("tag").notNull(),
  logo: text("logo"),
  description: text("description"),
  captainId: integer("captain_id", { mode: "number" }),
  captainName: text("captain_name"),
  captainDiscord: text("captain_discord"),
  whatsapp: text("whatsapp"),
  status: text("status").notNull().default("active"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// ============================================================
// PLAYERS
// ============================================================
export const players = sqliteTable("players", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  nickname: text("nickname").notNull(),
  uid: text("uid"),
  discord: text("discord"),
  teamId: integer("team_id", { mode: "number" }),
  role: text("role").notNull().default("official"),
  joinDate: text("join_date"),
  kills: integer("kills").notNull().default(0),
  deaths: integer("deaths").notNull().default(0),
  wins: integer("wins").notNull().default(0),
  matches: integer("matches").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// ============================================================
// CHAMPIONSHIPS
// ============================================================
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

// ============================================================
// XTREINOS
// ============================================================
export const xtreinos = sqliteTable("xtreinos", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  date: text("date").notNull(),
  timeMx: text("time_mx"),
  timeBr: text("time_br").notNull().default("21:00"),
  modality: text("modality").notNull().default("squad"),
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
  teamId: integer("team_id", { mode: "number" }),
  teamName: text("team_name").notNull(),
  isReserve: integer("is_reserve", { mode: "boolean" }).notNull().default(false),
  slotNumber: integer("slot_number", { mode: "number" }),
  isFixed: integer("is_fixed", { mode: "boolean" }).notNull().default(false),
  status: text("status").notNull().default("confirmed"),
  registeredAt: text("registered_at"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const xtreinoPlayers = sqliteTable("xtreino_players", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  xtreinoTeamId: integer("xtreino_team_id", { mode: "number" }).notNull(),
  playerName: text("player_name").notNull(),
  teamName: text("team_name").notNull(),
  q1Kills: integer("q1_kills").notNull().default(0),
  q2Kills: integer("q2_kills").notNull().default(0),
  q3Kills: integer("q3_kills").notNull().default(0),
  totalKills: integer("total_kills").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const xtreinoResults = sqliteTable("xtreino_results", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  xtreinoId: integer("xtreino_id", { mode: "number" }).notNull(),
  date: text("date").notNull(),
  teamName: text("team_name").notNull(),
  q1Pos: integer("q1_pos"),
  q2Pos: integer("q2_pos"),
  q3Pos: integer("q3_pos"),
  totalPoints: integer("total_points"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const xtreinoPlayerStats = sqliteTable("xtreino_player_stats", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  xtreinoId: integer("xtreino_id", { mode: "number" }).notNull(),
  date: text("date").notNull(),
  teamName: text("team_name").notNull(),
  playerName: text("player_name").notNull(),
  q1Kills: integer("q1_kills").notNull().default(0),
  q2Kills: integer("q2_kills").notNull().default(0),
  q3Kills: integer("q3_kills").notNull().default(0),
  totalKills: integer("total_kills").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const xtreinoSchedule = sqliteTable("xtreino_schedule", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  date: text("date").notNull().unique(),
  dayOfWeek: text("day_of_week").notNull(),
  timeBr: text("time_br").notNull().default("21:00"),
  status: text("status").notNull().default("scheduled"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// ============================================================
// SCRIMS — Agora com campo mode (br | mme)
// ============================================================
export const scrims = sqliteTable("scrims", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  team1Id: integer("team1_id", { mode: "number" }),
  team2Id: integer("team2_id", { mode: "number" }),
  date: text("date"),
  time: text("time"),
  modality: text("modality"),
  mode: text("mode").default("br"), // "br" = Battle Royale, "mme" = Mata-Mata em Equipe
  status: text("status").notNull().default("agendado"),
  result: text("result"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// ============================================================
// SCRIM RESULTS — Suporta BR (posições) e MME (scores de rounds)
// ============================================================
export const scrimResults = sqliteTable("scrim_results", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  scrimId: integer("scrim_id", { mode: "number" }),
  date: text("date").notNull(),
  teamName: text("team_name").notNull(),
  // BR: posições nas quedas
  q1Pos: integer("q1_pos"),
  q2Pos: integer("q2_pos"),
  q3Pos: integer("q3_pos"),
  // MME: placar de rounds por queda
  q1Score: integer("q1_score"),
  q2Score: integer("q2_score"),
  q3Score: integer("q3_score"),
  // MME extended: melhor de 5, 7, etc.
  q4Score: integer("q4_score"),
  q5Score: integer("q5_score"),
  q6Score: integer("q6_score"),
  q7Score: integer("q7_score"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// ============================================================
// SCRIM PLAYER STATS — Suporta até Q7 para MME extended
// ============================================================
export const scrimPlayerStats = sqliteTable("scrim_player_stats", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  scrimId: integer("scrim_id", { mode: "number" }),
  date: text("date").notNull(),
  teamName: text("team_name").notNull(),
  playerName: text("player_name").notNull(),
  // Q1
  q1Kills: integer("q1_kills").notNull().default(0),
  q1Assists: integer("q1_assists").notNull().default(0),
  q1Deaths: integer("q1_deaths").notNull().default(0),
  q1Damage: integer("q1_damage").notNull().default(0),
  q1Mvp: integer("q1_mvp", { mode: "boolean" }).notNull().default(false),
  q1Score: integer("q1_score").notNull().default(0),
  // Q2
  q2Kills: integer("q2_kills").notNull().default(0),
  q2Assists: integer("q2_assists").notNull().default(0),
  q2Deaths: integer("q2_deaths").notNull().default(0),
  q2Damage: integer("q2_damage").notNull().default(0),
  q2Mvp: integer("q2_mvp", { mode: "boolean" }).notNull().default(false),
  q2Score: integer("q2_score").notNull().default(0),
  // Q3
  q3Kills: integer("q3_kills").notNull().default(0),
  q3Assists: integer("q3_assists").notNull().default(0),
  q3Deaths: integer("q3_deaths").notNull().default(0),
  q3Damage: integer("q3_damage").notNull().default(0),
  q3Mvp: integer("q3_mvp", { mode: "boolean" }).notNull().default(false),
  q3Score: integer("q3_score").notNull().default(0),
  // Q4
  q4Kills: integer("q4_kills").notNull().default(0),
  q4Assists: integer("q4_assists").notNull().default(0),
  q4Deaths: integer("q4_deaths").notNull().default(0),
  q4Damage: integer("q4_damage").notNull().default(0),
  q4Mvp: integer("q4_mvp", { mode: "boolean" }).notNull().default(false),
  q4Score: integer("q4_score").notNull().default(0),
  // Q5
  q5Kills: integer("q5_kills").notNull().default(0),
  q5Assists: integer("q5_assists").notNull().default(0),
  q5Deaths: integer("q5_deaths").notNull().default(0),
  q5Damage: integer("q5_damage").notNull().default(0),
  q5Mvp: integer("q5_mvp", { mode: "boolean" }).notNull().default(false),
  q5Score: integer("q5_score").notNull().default(0),
  // Q6
  q6Kills: integer("q6_kills").notNull().default(0),
  q6Assists: integer("q6_assists").notNull().default(0),
  q6Deaths: integer("q6_deaths").notNull().default(0),
  q6Damage: integer("q6_damage").notNull().default(0),
  q6Mvp: integer("q6_mvp", { mode: "boolean" }).notNull().default(false),
  q6Score: integer("q6_score").notNull().default(0),
  // Q7
  q7Kills: integer("q7_kills").notNull().default(0),
  q7Assists: integer("q7_assists").notNull().default(0),
  q7Deaths: integer("q7_deaths").notNull().default(0),
  q7Damage: integer("q7_damage").notNull().default(0),
  q7Mvp: integer("q7_mvp", { mode: "boolean" }).notNull().default(false),
  q7Score: integer("q7_score").notNull().default(0),
  // Totais
  totalKills: integer("total_kills").notNull().default(0),
  totalAssists: integer("total_assists").notNull().default(0),
  totalDeaths: integer("total_deaths").notNull().default(0),
  totalDamage: integer("total_damage").notNull().default(0),
  totalMvp: integer("total_mvp").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// ============================================================
// CAMPEONATOS
// ============================================================
export const campeonatoResults = sqliteTable("campeonato_results", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  championshipId: integer("championship_id", { mode: "number" }).notNull(),
  date: text("date").notNull(),
  teamName: text("team_name").notNull(),
  q1Pos: integer("q1_pos"),
  q2Pos: integer("q2_pos"),
  q3Pos: integer("q3_pos"),
  finalPos: integer("final_pos"),
  totalPoints: integer("total_points"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const campeonatoPlayerStats = sqliteTable("campeonato_player_stats", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  championshipId: integer("championship_id", { mode: "number" }).notNull(),
  date: text("date").notNull(),
  teamName: text("team_name").notNull(),
  playerName: text("player_name").notNull(),
  q1Kills: integer("q1_kills").notNull().default(0),
  q2Kills: integer("q2_kills").notNull().default(0),
  q3Kills: integer("q3_kills").notNull().default(0),
  totalKills: integer("total_kills").notNull().default(0),
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

// ============================================================
// RANKINGS
// ============================================================
export const rankings = sqliteTable("rankings", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  entityType: text("entity_type").notNull(),
  entityId: integer("entity_id", { mode: "number" }).notNull(),
  entityName: text("entity_name").notNull(),
  rankType: text("rank_type").notNull().default("xtreino"),
  points: integer("points").notNull().default(0),
  kills: integer("kills").notNull().default(0),
  wins: integer("wins").notNull().default(0),
  participations: integer("participations").notNull().default(0),
  kdRatio: real("kd_ratio"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// ============================================================
// SALINHAS
// ============================================================
export const salinhas = sqliteTable("salinhas", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  date: text("date").notNull(),
  timeBr: text("time_br").notNull().default("19:00"),
  modality: text("modality").notNull().default("solo"),
  maxParticipants: integer("max_participants").notNull().default(50),
  prize1st: text("prize_1st").notNull(),
  prize2nd: text("prize_2nd").notNull(),
  prize3rd: text("prize_3rd").notNull(),
  specialPrize: text("special_prize"),
  hostName: text("host_name").notNull(),
  hostTiktok: text("host_tiktok"),
  hostInstagram: text("host_instagram"),
  hostYoutube: text("host_youtube"),
  roomId: text("room_id"),
  roomPassword: text("room_password"),
  bannerUrl: text("banner_url"),
  postUrl: text("post_url"),
  status: text("status").notNull().default("aberta"),
  winner1st: text("winner_1st"),
  winner2nd: text("winner_2nd"),
  winner3rd: text("winner_3rd"),
  specialWinner: text("special_winner"),
  rules: text("rules"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const playerMerges = sqliteTable("player_merges", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  masterPlayerId: integer("master_player_id", { mode: "number" }).notNull().references(() => players.id, { onDelete: "cascade" }),
  mergedPlayerId: integer("merged_player_id", { mode: "number" }).notNull().references(() => players.id, { onDelete: "cascade" }).unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});