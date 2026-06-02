import { createRouter, publicQuery } from "./middleware.js";
import { authRouter } from "./routers/auth.js";
import { settingsRouter } from "./routers/settings.js";
import { teamsRouter } from "./routers/teams.js";
import { playersRouter } from "./routers/players.js";
import { championshipsRouter } from "./routers/championships.js";
import { xtreinosRouter } from "./routers/xtreinos.js";
import { scrimsRouter } from "./routers/scrims.js";
import { registrationsRouter } from "./routers/registrations.js";
import { rankingsRouter } from "./routers/rankings.js";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  settings: settingsRouter,
  teams: teamsRouter,
  players: playersRouter,
  championships: championshipsRouter,
  xtreinos: xtreinosRouter,
  scrims: scrimsRouter,
  registrations: registrationsRouter,
  rankings: rankingsRouter,
});

export type AppRouter = typeof appRouter;
