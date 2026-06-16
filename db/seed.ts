// db/seed.ts
// Ponto único de exportação de todos os seeds

import { seed } from "./seeds/seed-initial.js";
import { seedMinimal } from "./seeds/seed-minimal.js";
import { seedLogos, seedLogosAuto } from "./seeds/seed-logos.js";
import { seedAllXtreinos } from "./seeds/seed-xtreinos.js";
import { seedPlayerUnified } from "./seeds/seed-player.js";
import { seed as seedScrimPlayers } from "./seeds/seed-scrim-players-4v4";
import { seed as seedScrim4v4 } from "./seeds/seed-scrim-4v4-mme-ugd-vs-k4f.js";

export {
  seed,           // seed inicial (admins, settings, clans, teams, players)
  seedMinimal,    // fallback minimal
  seedLogos,      // seed manual de logos
  seedLogosAuto,  // seed automático de logos (escaneia pasta)
  seedAllXtreinos,// 🆕 seed genérico de TODOS os xtreinos
  seedPlayerUnified,
  seedScrimPlayers,  // Primeiro (garante jogadores no registry)
  seedScrim4v4,      // Depois (insere dados da scrim)
};