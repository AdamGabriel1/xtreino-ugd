// db/seed.ts
// Ponto único de exportação de todos os seeds

import { seed } from "./seeds/seed-initial.js";
import { seedMinimal } from "./seeds/seed-minimal.js";
import { seedLogos, seedLogosAuto } from "./seeds/seed-logos.js";
import { seedAllXtreinos } from "./seeds/seed-xtreinos.js";
import { seedAllScrims } from "./seeds/seed-scrims.js";

// 🆕 Novo sistema de unificação (Substitui seed-player e seed-scrim-players)
import { seed as seedAliases } from "./seeds/seed-aliases.js";
import { seed as seedUnify } from "./seeds/seed-unify.js";

export {
  seed,           // seed inicial (admins, settings, clans, teams)
  seedMinimal,    // fallback minimal
  seedLogos,      // seed manual de logos
  seedLogosAuto,  // seed automático de logos (escaneia pasta)
  seedAllXtreinos,// seed genérico de TODOS os xtreinos (stats detalhados por queda)
  seedAllScrims,  // seed genérico de TODAS as scrims (stats detalhados por round)
  seedAliases,    // 🆕 Cria jogadores canônicos e mapeia variações de nick/times
  seedUnify,      // 🆕 Calcula estatísticas unificadas cruzando todos os eventos
};