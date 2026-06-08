import { getDb } from "../../api/queries/connection.js";
import { teams } from "../schema.js";
import { eq } from "drizzle-orm";

/**
 * Mapeamento manual: nome da equipe → caminho da logo em /public
 * 
 * Adicione ou remova entradas conforme necessário.
 * O caminho deve ser relativo à pasta public (ex: "/logos/ugd.jpg")
 */
const LOGO_MAP: Record<string, string> = {
  "UGD Threat": "/logos/ugd-threat.jpg",
  "UGD Royal": "/logos/ugd-royal.jpg",
  "UGD Light": "/logos/ugd-light.jpg",
  "RED": "/logos/red.jpg",
  "RED Magic BR": "/logos/red-magic-br.jpg",
  "CMF": "/logos/cmf.jpg",
  "KOV": "/logos/kov.jpg",
  "LMF": "/logos/lmf.jpg",
  "INF": "/logos/inf.jpg",
  "Eternity": "/logos/eternity.jpg",
  "FURY": "/logos/fury.jpg",
  "Λつつ": "/logos/lambda.jpg",
  "ODS": "/logos/ods.jpg",
  "Misturado": "/logos/misturado.jpg",
  "Time I": "/logos/time-i.jpg",
  "Time E": "/logos/time-e.jpg",
  "Dev": "/logos/dev.jpg",
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