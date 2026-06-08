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
  fixedTeamsList: text("fixed_teams_list"),  // <-- ADICIONAR ISSO
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

// ============================================================
// XTREINOS - Treinos da Underground (Seg-Sex, 21h BRT)
// ============================================================
export const xtreinos = sqliteTable("xtreinos", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  date: text("date").notNull(),
  timeMx: text("time_mx"),
  timeBr: text("time_br").notNull().default("21:00"),
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
  xtreinoId: integer("xtreino_id", { mode: "number" }),
  teamId: integer("team_id", { mode: "number" }).notNull(),
  isReserve: integer("is_reserve", { mode: "boolean" }).notNull().default(false),
  slotNumber: integer("slot_number", { mode: "number" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// ============================================================
// RESULTADOS DO XTREINO (Colocações por time/quadrimestre)
// ============================================================
export const xtreinoResults = sqliteTable("xtreino_results", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  xtreinoId: integer("xtreino_id", { mode: "number" }),
  date: text("date").notNull(),
  teamName: text("team_name").notNull(),
  q1Pos: integer("q1_pos"),
  q2Pos: integer("q2_pos"),
  q3Pos: integer("q3_pos"),
  totalPoints: integer("total_points"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// ============================================================
// ESTATÍSTICAS DOS JOGADORES NO XTREINO
// ============================================================
export const xtreinoPlayerStats = sqliteTable("xtreino_player_stats", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  xtreinoId: integer("xtreino_id", { mode: "number" }),
  date: text("date").notNull(),
  teamName: text("team_name").notNull(),
  playerName: text("player_name").notNull(),
  q1Kills: integer("q1_kills").notNull().default(0),
  q2Kills: integer("q2_kills").notNull().default(0),
  q3Kills: integer("q3_kills").notNull().default(0),
  totalKills: integer("total_kills").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// ============================================================
// AGENDAMENTO DE XTREINOS (Recorrente Seg-Sex, 21h BRT)
// ============================================================
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
// SCRIMS - Dados separados (ainda sem dados)
// ============================================================
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

export const scrimResults = sqliteTable("scrim_results", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  scrimId: integer("scrim_id", { mode: "number" }),
  date: text("date").notNull(),
  teamName: text("team_name").notNull(),
  q1Pos: integer("q1_pos"),
  q2Pos: integer("q2_pos"),
  q3Pos: integer("q3_pos"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const scrimPlayerStats = sqliteTable("scrim_player_stats", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  scrimId: integer("scrim_id", { mode: "number" }),
  date: text("date").notNull(),
  teamName: text("team_name").notNull(),
  playerName: text("player_name").notNull(),
  q1Kills: integer("q1_kills").notNull().default(0),
  q2Kills: integer("q2_kills").notNull().default(0),
  q3Kills: integer("q3_kills").notNull().default(0),
  totalKills: integer("total_kills").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// ============================================================
// CAMPEONATOS - Resultados separados
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
// RANKINGS - Separados por tipo (xtreino, campeonato, scrim)
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

// --- 🆕 NOVO: Tabela de inscrições de times ---
export const teamRegistrations = sqliteTable("team_registrations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  xtreinoId: integer("xtreino_id", { mode: "number" }),
  teamName: text("team_name").notNull(),
  isFixed: integer("is_fixed", { mode: "boolean" }).default(false),
  position: integer("position").default(0),
  status: text("status").default("confirmed"), // "confirmed" | "reserve" | "cancelled"
  registeredAt: text("registered_at"),
});

export const xtreinoEventos = sqliteTable("xtreino_eventos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(),
  status: text("status", {
    enum: ["aberto", "fechado", "em_andamento", "finalizado"],
  }).notNull().default("aberto"),
  maxTeams: integer("max_teams").notNull().default(12),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});

export const xtreinoInscricoes = sqliteTable("xtreino_inscricoes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  xtreinoId: integer("xtreino_id")
    .notNull()
    .references(() => xtreinoEventos.id, { onDelete: "cascade" }),
  teamName: text("team_name").notNull(),
  status: text("status", {
    enum: ["confirmada", "pendente", "cancelada"],
  }).notNull().default("confirmada"),
  registeredBy: text("registered_by"),
  registeredAt: text("registered_at"),
});

export const xtreinoInscricoesJogadores = sqliteTable("xtreino_inscricoes_jogadores", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  inscricaoId: integer("inscricao_id")
    .notNull()
    .references(() => xtreinoInscricoes.id, { onDelete: "cascade" }),
  playerName: text("player_name").notNull(),
});