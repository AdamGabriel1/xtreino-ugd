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
  nickname: text("nickname").notNull(),        // ← Mantém (nickname "oficial")
  uid: text("uid"),
  discord: text("discord"),
  teamId: integer("team_id", { mode: "number" }),
  role: text("role").notNull().default("official"),
  joinDate: text("join_date"),
  kills: integer("kills").notNull().default(0), // ← Pode DEPRECAR depois
  deaths: integer("deaths").notNull().default(0),
  wins: integer("wins").notNull().default(0),
  matches: integer("matches").notNull().default(0),
  // NOVOS:
  isUnified: integer("is_unified", { mode: "boolean" }).notNull().default(false), // Já foi processado?
  primaryTeamId: integer("primary_team_id", { mode: "number" }), // Time principal (mais jogado)
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
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
  id: integer("id", { mode: "number" }).primaryKey(),
  name: text("name").notNull(),
  team1Id: integer("team1_id", { mode: "number" }),
  team2Id: integer("team2_id", { mode: "number" }),
  date: text("date"),
  time: text("time"),
  modality: text("modality"),
  mode: text("mode").default("br"), 
  status: text("status").notNull().default("agendado"),
  result: text("result"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// ============================================================
// SCRIM RESULTS (Times) — LIMPO (Sem Q1-Q7)
// ============================================================
export const scrimResults = sqliteTable("scrim_results", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  scrimId: integer("scrim_id", { mode: "number" }),
  date: text("date").notNull(),
  teamName: text("team_name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ============================================================
// NOVA TABELA: SCRIM RESULT ROUNDS (Dinâmica para Times)
// ============================================================
export const scrimResultRounds = sqliteTable("scrim_result_rounds", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  scrimResultId: integer("scrim_result_id", { mode: "number" }).notNull().references(() => scrimResults.id, { onDelete: "cascade" }),
  roundNumber: integer("round_number").notNull(),
  value: integer("value").notNull().default(0), // Posição (BR) ou Score (MME)
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ============================================================
// SCRIM PLAYER STATS — LIMPO (Sem Q1-Q7)
// ============================================================
export const scrimPlayerStats = sqliteTable("scrim_player_stats", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  scrimId: integer("scrim_id", { mode: "number" }),
  date: text("date").notNull(),
  teamName: text("team_name").notNull(),
  playerName: text("player_name").notNull(),
  totalKills: integer("total_kills").notNull().default(0),
  totalAssists: integer("total_assists").notNull().default(0),
  totalDeaths: integer("total_deaths").notNull().default(0),
  totalDamage: integer("total_damage").notNull().default(0),
  totalMvp: integer("total_mvp").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ============================================================
// NOVA TABELA: SCRIM PLAYER STAT ROUNDS (Dinâmica para Jogadores)
// ============================================================
export const scrimPlayerStatRounds = sqliteTable("scrim_player_stat_rounds", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  scrimPlayerStatId: integer("scrim_player_stat_id", { mode: "number" }).notNull().references(() => scrimPlayerStats.id, { onDelete: "cascade" }),
  roundNumber: integer("round_number").notNull(),
  kills: integer("kills").notNull().default(0),
  assists: integer("assists").notNull().default(0),
  deaths: integer("deaths").notNull().default(0),
  damage: integer("damage").notNull().default(0),
  mvp: integer("mvp", { mode: "boolean" }).notNull().default(false),
  score: integer("score").notNull().default(0), // Rounds ganhos pelo time na queda (MME)
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
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

// ============================================================
// ALIASES DE JOGADORES — Resolve o problema de nicknames
// ============================================================
export const playerAliases = sqliteTable("player_aliases", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  playerId: integer("player_id", { mode: "number" }).notNull().references(() => players.id, { onDelete: "cascade" }),
  alias: text("alias").notNull().unique(), // Cada alias único no sistema
  normalizedAlias: text("normalized_alias").notNull(), // Versão limpa para busca
  source: text("source").notNull().default("manual"), // "manual" | "xtreino" | "scrim" | "campeonato"
  confidence: integer("confidence", { mode: "number" }).notNull().default(100), // 100=manual, menor=auto
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const teamAliases = sqliteTable("team_aliases", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  teamId: integer("team_id", { mode: "number" }).notNull().references(() => teams.id, { onDelete: "cascade" }),
  alias: text("alias").notNull(),
  normalizedAlias: text("normalized_alias").notNull(),
  source: text("source").notNull().default("manual"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ============================================================
// ESTATÍSTICAS UNIFICADAS DO JOGADOR — Agregado de TODAS as fontes
// ============================================================
export const unifiedPlayerStats = sqliteTable("unified_player_stats", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  playerId: integer("player_id", { mode: "number" }).notNull().unique().references(() => players.id, { onDelete: "cascade" }),
  
  // XTreinos (BR - Só kills por queda)
  xtreinoMatches: integer("xtreino_matches").notNull().default(0),
  xtreinoKills: integer("xtreino_kills").notNull().default(0),
  xtreinoBestQ1: integer("xtreino_best_q1").notNull().default(0),
  xtreinoBestQ2: integer("xtreino_best_q2").notNull().default(0),
  xtreinoBestQ3: integer("xtreino_best_q3").notNull().default(0),
  
  // Scrims (MME - kills, assists, deaths, damage, MVPs)
  scrimMatches: integer("scrim_matches").notNull().default(0),
  scrimRounds: integer("scrim_rounds").notNull().default(0),
  scrimKills: integer("scrim_kills").notNull().default(0),
  scrimAssists: integer("scrim_assists").notNull().default(0),
  scrimDeaths: integer("scrim_deaths").notNull().default(0),
  scrimDamage: integer("scrim_damage").notNull().default(0),
  scrimMvps: integer("scrim_mvps").notNull().default(0),
  scrimWins: integer("scrim_wins").notNull().default(0),
  scrimLosses: integer("scrim_losses").notNull().default(0),
  
  // Campeonatos (BR - Só kills por queda)
  campeonatoMatches: integer("campeonato_matches").notNull().default(0),
  campeonatoKills: integer("campeonato_kills").notNull().default(0),
  
  // Totais calculados
  totalMatches: integer("total_matches").notNull().default(0),
  totalKills: integer("total_kills").notNull().default(0),
  
  // K/D apenas de scrims (onde tem deaths)
  scrimKdRatio: real("scrim_kd_ratio"),
  
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const unifiedTeamStats = sqliteTable("unified_team_stats", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  teamId: integer("team_id", { mode: "number" }).notNull().unique().references(() => teams.id, { onDelete: "cascade" }),
  
  // XTreinos
  xtreinoMatches: integer("xtreino_matches").notNull().default(0),
  xtreinoWins: integer("xtreino_wins").notNull().default(0),
  xtreinoTotalPoints: integer("xtreino_total_points").notNull().default(0),
  xtreinoKills: integer("xtreino_kills").notNull().default(0),
  
  // Scrims
  scrimMatches: integer("scrim_matches").notNull().default(0),
  scrimWins: integer("scrim_wins").notNull().default(0),
  scrimLosses: integer("scrim_losses").notNull().default(0),
  scrimRoundsWon: integer("scrim_rounds_won").notNull().default(0),
  scrimRoundsLost: integer("scrim_rounds_lost").notNull().default(0),
  scrimKills: integer("scrim_kills").notNull().default(0), // <--- ESSE CAMPO AQUI
  
  // Campeonatos
  campeonatoMatches: integer("campeonato_matches").notNull().default(0),
  campeonatoKills: integer("campeonato_kills").notNull().default(0),
  campeonatoWins: integer("campeonato_wins").notNull().default(0),
  
  // Totais
  totalMatches: integer("total_matches").notNull().default(0),
  totalKills: integer("total_kills").notNull().default(0),
  totalWins: integer("total_wins").notNull().default(0),
  
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

