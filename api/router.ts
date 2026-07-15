import { createRouter, publicQuery } from "./middleware.js";
import { authRouter } from "./routers/auth.js";
import { settingsRouter } from "./routers/settings.js";
import { clansRouter, teamsRouter } from "./routers/clans.js";
import { playersRouter } from "./routers/players.js";
import { championshipsRouter } from "./routers/championships.js";
import { xtreinosRouter } from "./routers/xtreinos.js";
import { scrimsRouter } from "./routers/scrims.js";
import { xtreinoInscricoesRouter } from "./routers/xtreinoInscricoes.js";
import { rankingsRouter } from "./routers/rankings.js";
import { salinhasRouter } from "./routers/salinhas.js";
import { unifiedRouter } from "./routers/unified-stats.js";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  settings: settingsRouter,
  clans: clansRouter,
  teams: teamsRouter,
  players: playersRouter,
  championships: championshipsRouter,
  xtreinos: xtreinosRouter,
  scrims: scrimsRouter,
  xtreinoInscricoes: xtreinoInscricoesRouter,
  rankings: rankingsRouter,
  salinhas: salinhasRouter,
  unified: unifiedRouter,
});

export type AppRouter = typeof appRouter;