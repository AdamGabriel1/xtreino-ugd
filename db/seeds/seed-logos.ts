import { getDb } from "../../api/queries/connection.js";
import { teams } from "../schema.js";
import { eq } from "drizzle-orm";

/**
 * Mapeamento manual: nome da equipe → caminho da logo em /public
 * 
 * Adicione ou remova entradas conforme necessário.
 * O caminho deve ser relativo à pasta public (ex: "/logos/ugd.png")
 */
const LOGO_MAP: Record<string, string> = {
  "UGD Threat": "/logos/ugd-threat.png",
  "UGD Royal": "/logos/ugd-royal.png",
  "UGD Light": "/logos/ugd-light.png",
  "RED": "/logos/red.png",
  "RED Magic BR": "/logos/red-magic-br.png",
  "CMF": "/logos/cmf.png",
  "KOV": "/logos/kov.png",
  "LMF": "/logos/lmf.png",
  "INF": "/logos/inf.png",
  "Eternity": "/logos/eternity.png",
  "FURY": "/logos/fury.png",
  "Λつつ": "/logos/lambda.png",
  "ODS": "/logos/ods.png",
  "Misturado": "/logos/misturado.png",
  "Time I": "/logos/time-i.png",
  "Time E": "/logos/time-e.png",
  "Dev": "/logos/dev.png",
};

/**
 * Popula o campo logo das equipes baseado no mapeamento manual.
 * Idempotente: só atualiza se a logo ainda estiver vazia.
 */
export function seedLogos(force = false) {
  const db = getDb();
  console.log("[SEED-LOGOS] Starting logo population...");

  const allTeams = db.select().from(teams).all();
  let updated = 0;
  let skipped = 0;
  let notFound = 0;

  for (const team of allTeams) {
    const logoPath = LOGO_MAP[team.name];

    if (!logoPath) {
      console.warn(`[SEED-LOGOS] No logo mapped for team: "${team.name}"`);
      notFound++;
      continue;
    }

    // Só atualiza se não tiver logo ou se force=true
    if (!team.logo || force) {
      db.update(teams)
        .set({ logo: logoPath })
        .where(eq(teams.id, team.id))
        .run();

      console.log(`[SEED-LOGOS] ✅ "${team.name}" → ${logoPath}`);
      updated++;
    } else {
      console.log(`[SEED-LOGOS] ⏭️ "${team.name}" already has logo, skipping (use force=true to override)`);
      skipped++;
    }
  }

  console.log(`[SEED-LOGOS] Done! Updated: ${updated}, Skipped: ${skipped}, Not mapped: ${notFound}`);
  return { updated, skipped, notFound };
}

/**
 * Versão automática: tenta encontrar logos escaneando /public/logos/
 * Útil quando os nomes de arquivo seguem um padrão.
 */
export function seedLogosAuto(publicDir = "public") {
  const { readdirSync, existsSync } = require("fs");
  const path = require("path");

  const db = getDb();
  const logosDir = path.join(process.cwd(), publicDir, "logos");

  if (!existsSync(logosDir)) {
    console.error(`[SEED-LOGOS] Directory not found: ${logosDir}`);
    return { updated: 0, skipped: 0, notFound: 0, error: "Directory not found" };
  }

  const files = readdirSync(logosDir).filter((f: string) =>
    /\.(png|jpg|jpeg|webp|gif)$/i.test(f)
  );

  const allTeams = db.select().from(teams).all();
  let updated = 0;
  let skipped = 0;
  let notFound = 0;

  for (const team of allTeams) {
    // Normaliza nome da equipe para matching
    const normalizedName = team.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    // Tenta encontrar arquivo que contenha o nome normalizado
    const match = files.find((f: string) => {
      const normalizedFile = f
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .replace(/\.(png|jpg|jpeg|webp|gif)$/, "");
      return normalizedFile.includes(normalizedName) ||
             normalizedName.includes(normalizedFile);
    });

    if (match) {
      const logoPath = `/logos/${match}`;

      if (!team.logo) {
        db.update(teams)
          .set({ logo: logoPath })
          .where(eq(teams.id, team.id))
          .run();

        console.log(`[SEED-LOGOS] ✅ "${team.name}" → ${logoPath} (auto)`);
        updated++;
      } else {
        console.log(`[SEED-LOGOS] ⏭️ "${team.name}" already has logo`);
        skipped++;
      }
    } else {
      console.warn(`[SEED-LOGOS] ⚠️ No logo file found for: "${team.name}"`);
      notFound++;
    }
  }

  console.log(`[SEED-LOGOS] Auto done! Updated: ${updated}, Skipped: ${skipped}, Not found: ${notFound}`);
  return { updated, skipped, notFound };
}