import { getDb } from "../../api/queries/connection.js";
import { teams } from "../schema.js";
import { eq } from "drizzle-orm";

const LOGO_EXT = ".jpg";

const LOGO_MAP: Record<string, string> = {
  "UGD Threat":     "ugd-threat",
  "UGD Royal":      "ugd-royal",
  "UGD Light":      "ugd-light",
  "UGD LEGENDS":    "ugd-legends",
  "UGD OLYMPIQUE":  "ugd-olympique",
  "RED":            "red",
  "RED Magic BR":   "red-magic-br",
  "REÐ Outlaws":    "red-outlaws",
  "CMF":            "cmf",
  "CMF ATLANTIC":   "cmf-atlantic",
  "CMF ASSALT":     "cmf-assalt",
  "KOV":            "kov",
  "LMF":            "lmf",
  "INF":            "inf",
  "Eternity":       "eternity",
  "FURY":           "fury",
  "FURY ELITE":     "fury-elite",
  "FURY ROYAL":     "fury-royal",
  "Λつつ":          "lambda",
  "ODS":            "ods",
  "Misturado":      "misturado",
  "Time I":         "time-i",
  "Time E":         "time-e",
  "Dev":            "dev",
  "EmE":            "eme",
  "♱VØID×STRIKE♱":  "void-strike",
  "7KW_LHETAL":     "7kw-lhetal",
  "K4F":            "k4f",
  "CPF CANCELADO":  "cpf-viltrumite",
};

function buildLogoPath(filename: string): string {
  return `/logos/${filename}${LOGO_EXT}`;
}

export function seedLogos(force = false) {
  const db = getDb();
  console.log(`[SEED-LOGOS] Starting logo population (ext: ${LOGO_EXT})...`);

  const allTeams = db.select().from(teams).all();
  let updated = 0;
  let skipped = 0;
  let notFound = 0;

  for (const team of allTeams) {
    const filename = LOGO_MAP[team.name];

    if (!filename) {
      console.warn(`[SEED-LOGOS] No logo mapped for team: "${team.name}"`);
      notFound++;
      continue;
    }

    const logoPath = buildLogoPath(filename);

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
    /\.(jpg|jpeg|png|webp|gif)$/i.test(f)
  );

  const allTeams = db.select().from(teams).all();
  let updated = 0;
  let skipped = 0;
  let notFound = 0;

  for (const team of allTeams) {
    const normalizedName = team.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    const match = files.find((f: string) => {
      const normalizedFile = f
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .replace(/\.(jpg|jpeg|png|webp|gif)$/, "");
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