import { createRouter, publicQuery } from "./middleware";
import { authRouter } from "./routers/auth";
import { settingsRouter } from "./routers/settings";
import { teamsRouter } from "./routers/teams";
import { playersRouter } from "./routers/players";
import { championshipsRouter } from "./routers/championships";
import { xtreinosRouter } from "./routers/xtreinos";
import { scrimsRouter } from "./routers/scrims";
import { registrationsRouter } from "./routers/registrations";
import { rankingsRouter } from "./routers/rankings";

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
