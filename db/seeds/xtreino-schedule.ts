import { getDb } from "../../api/queries/connection.js";
import { eq } from "drizzle-orm";
import { xtreinoSchedule } from "../schema.js";

/**
 * Seed do agendamento de xtreinos da Underground
 * Xtreinos: Segunda a Sexta, 21h BRT
 * Gera agendamento para o mês atual + próximo mês
 */

export function seed() {
  const db = getDb();
  console.log("[SEED XTREINO-SCHEDULE] Starting...");

  const diasSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Gera para o mês atual e próximo
  const monthsToGenerate = [currentMonth, currentMonth + 1 > 12 ? 1 : currentMonth + 1];
  const yearsForMonths = [
    currentYear,
    currentMonth + 1 > 12 ? currentYear + 1 : currentYear,
  ];

  let count = 0;

  for (let m = 0; m < monthsToGenerate.length; m++) {
    const month = monthsToGenerate[m];
    const year = yearsForMonths[m];
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let dia = 1; dia <= daysInMonth; dia++) {
      const data = new Date(year, month - 1, dia);
      const diaSemana = data.getDay();

      // Segunda(1) a Sexta(5)
      if (diaSemana >= 1 && diaSemana <= 5) {
        const dataStr = `${year}-${month.toString().padStart(2, "0")}-${dia.toString().padStart(2, "0")}`;

        // Verifica se já existe
        const existing = db
          .select()
          .from(xtreinoSchedule)
          .where(eq(xtreinoSchedule.date, dataStr))
          .get();

        if (!existing) {
          db.insert(xtreinoSchedule).values({
            date: dataStr,
            dayOfWeek: diasSemana[diaSemana],
            timeBr: "21:00",
            status: data < now ? "completed" : "scheduled",
            notes: diaSemana === 5 ? "Último xtreino da semana" : null,
          }).run();
          count++;
        }
      }
    }
  }

  console.log(`[SEED XTREINO-SCHEDULE] ${count} xtreinos agendados`);
  console.log("[SEED XTREINO-SCHEDULE] Done!");
}
