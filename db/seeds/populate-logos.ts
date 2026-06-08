// scripts/populate-logos.ts
import { getDb } from "../../api/queries/connection.js";
import { teams } from "../schema.js";
import { eq } from "drizzle-orm";

const db = getDb();

const logoMap = [
  { name: "Red Devils", logo: "/uploads/red-devils-logo.png" },
  { name: "Underground", logo: "/uploads/underground-logo.png" },
  { name: "Toxic", logo: "/uploads/toxic-logo.png" },
  // adicione todas as equipes
];

for (const item of logoMap) {
  db.update(teams)
    .set({ logo: item.logo })
    .where(eq(teams.name, item.name))
    .run();
  
  console.log(`✅ Logo atualizada: ${item.name}`);
}