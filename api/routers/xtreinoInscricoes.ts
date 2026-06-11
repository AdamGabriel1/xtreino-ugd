import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "../middleware.js";
import { verifyToken } from "../lib/auth.js";
import {
  listXtreinoEvents,
  getXtreinoEvent,
  createXtreinoEvent,
  updateXtreinoStatus,
  inscreverEquipe,
  removerEquipe,
  cancelarInscricao,
  reativarInscricao,
  getInscricoesPorXtreino,
  getResumoInscricoes,
  migrarEventosHistoricos,
} from "../../db/inscricoes.js";
import { getDb } from "../queries/connection.js";
import { settings, xtreinos, xtreinoTeams } from "../../db/schema.js";
import { eq, and, sql } from "drizzle-orm";

// ============================================================
// HELPERS
// ============================================================

function parseFixedTeams(fixedTeamsList: string | null | undefined): string[] {
  if (!fixedTeamsList) return [];
  try {
    const parsed = JSON.parse(fixedTeamsList);
    if (Array.isArray(parsed)) return parsed.map((t: string) => t.trim()).filter(Boolean);
  } catch { /* ignore */ }
  return fixedTeamsList.split(",").map((t) => t.trim()).filter(Boolean);
}

function formatTeamsList(
  teams: Array<{ position: number; name: string; isFixed: boolean }>,
  maxSlots: number = 12
): string {
  const filled = [...teams];
  for (let i = teams.length + 1; i <= maxSlots; i++) {
    filled.push({ position: i, name: "", isFixed: false });
  }
  return filled
    .map((t) => {
      const emoji = t.isFixed ? "📌" : "🎫";
      const pos = String(t.position).padStart(2, "0");
      const name = t.name || "";
      return `${emoji}${pos} - ${name}`;
    })
    .join("\n");
}

function parseTimeBr(timeBr: string): { brAr: string; boCl: string; coPe: string; mxNi: string; us: string } {
  const [hours, minutes] = timeBr.split(":").map(Number);
  if (isNaN(hours)) return { brAr: "21:00", boCl: "20:00", coPe: "19:00", mxNi: "18:00", us: "17:00" };
  return {
    brAr: `${String(hours).padStart(2, "0")}:${String(minutes || 0).padStart(2, "0")}`,
    boCl: `${String(hours - 1).padStart(2, "0")}:${String(minutes || 0).padStart(2, "0")}`,
    coPe: `${String(hours - 2).padStart(2, "0")}:${String(minutes || 0).padStart(2, "0")}`,
    mxNi: `${String(hours - 3).padStart(2, "0")}:${String(minutes || 0).padStart(2, "0")}`,
    us: `${String(hours - 4).padStart(2, "0")}:${String(minutes || 0).padStart(2, "0")}`,
  };
}

const WHATSAPP_TEMPLATE = `{{ORG_NAME}} - 𝙓𝙏𝙍𝙀𝙄𝙉𝙊𝙎 𝙈𝙊𝘽𝙄𝙇𝙀 ({{DATE}})


⚔️ 𝙈𝙊𝘿𝙊 {{MODALITY}} 
⛳ {{QUEDAS}} 𝙌𝙐𝙀𝘿𝘼𝙎 
🌴 𝙄𝙇𝙃𝘼 𝘿𝙊 𝙈𝙀𝘿𝙊


🇧🇷🇦🇷 {{TIME_BR_AR}}
🇧🇴🇨🇱 {{TIME_BO_CL}}
🇨🇴🇵🇪 {{TIME_CO_PE}}
🇲🇽🇳🇮 {{TIME_MX_NI}}
🇺🇸 {{TIME_US}} (GMT-7)

FIXO 📌
TEMPORÁRIO 🎫

{{TEAMS_LIST}}


🚨 SEM AUXÍLIO DE MIRA
🚫 LANÇA GRANADA E LANÇA CHAMAS


Grupo do Whatsapp: {{WHATSAPP}}`;

// ============================================================
// ROUTER
// ============================================================
export const xtreinoInscricoesRouter = createRouter({
  // ============================================================
  // LISTAR TODOS OS XTREINOS
  // ============================================================
  listXtreinos: publicQuery.query(() => {
    return listXtreinoEvents();
  }),

  // ============================================================
  // LISTAR INSCRIÇÕES POR XTREINO
  // ============================================================
  listByXtreino: publicQuery
    .input(z.object({ xtreinoId: z.number() }))
    .query(({ input }) => {
      return getInscricoesPorXtreino(input.xtreinoId);
    }),

  // ============================================================
  // RESUMO DE INSCRIÇÕES
  // ============================================================
  getResumo: publicQuery.query(() => {
    return getResumoInscricoes();
  }),

  // ============================================================
  // BUSCAR TIMES FIXOS
  // ============================================================
  getFixedTeams: publicQuery.query(() => {
    const db = getDb();
    const config = db.select().from(settings).limit(1).get();
    return parseFixedTeams(config?.fixedTeamsList);
  }),

  // ============================================================
  // REGISTRAR EQUIPE
  // ============================================================
  register: publicQuery
    .input(
      z.object({
        xtreinoId: z.number(),
        teamName: z.string().min(1),
        players: z.array(z.string().min(1)).min(1).max(6),
        isReserve: z.boolean().default(false),
      })
    )
    .mutation(({ input }) => {
      const id = inscreverEquipe(input.xtreinoId, input.teamName, input.players);
      if (id === null) throw new Error("Não foi possível inscrever a equipe");
      return { success: true, id };
    }),

  // ============================================================
  // REMOVER INSCRIÇÃO
  // ============================================================
  unregister: publicQuery
    .input(z.object({ xtreinoId: z.number(), teamName: z.string().min(1) }))
    .mutation(({ input }) => {
      const ok = removerEquipe(input.xtreinoId, input.teamName);
      if (!ok) throw new Error("Inscrição não encontrada");
      return { success: true };
    }),

  // ============================================================
  // CANCELAR INSCRIÇÃO
  // ============================================================
  cancel: publicQuery
    .input(z.object({ xtreinoId: z.number(), teamName: z.string().min(1) }))
    .mutation(({ input }) => {
      const ok = cancelarInscricao(input.xtreinoId, input.teamName);
      if (!ok) throw new Error("Inscrição não encontrada");
      return { success: true };
    }),

  // ============================================================
  // REATIVAR INSCRIÇÃO
  // ============================================================
  reactivate: publicQuery
    .input(z.object({ xtreinoId: z.number(), teamName: z.string().min(1) }))
    .mutation(({ input }) => {
      const ok = reativarInscricao(input.xtreinoId, input.teamName);
      if (!ok) throw new Error("Inscrição não encontrada");
      return { success: true };
    }),

  // ============================================================
  // ATUALIZAR STATUS DO XTREINO (admin)
  // ============================================================
  updateXtreinoStatus: adminQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["aberto", "fechado", "em_andamento", "finalizado"]),
      })
    )
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");
      updateXtreinoStatus(input.id, input.status);
      return { success: true, status: input.status };
    }),

  // ============================================================
  // CRIAR XTREINO (admin)
  // ============================================================
  createXtreino: adminQuery
    .input(
      z.object({
        date: z.string(),
        maxTeams: z.number().min(1).max(32).default(12),
        status: z.enum(["aberto", "fechado"]).default("aberto"),
        timeBr: z.string().default("21:00"),
        modality: z.string().default("squad"),
      })
    )
    .mutation(({ input, ctx }) => {
      const payload = verifyToken(ctx.adminToken as string);
      if (!payload) throw new Error("Invalid token");
      const id = createXtreinoEvent(input.date, input.maxTeams, input.status);
      return { success: true, id };
    }),

  // ============================================================
  // GERAR MENSAGEM WHATSAPP
  // ============================================================
  generateWhatsApp: publicQuery
    .input(z.object({ xtreinoId: z.number() }))
    .query(({ input }) => {
      const db = getDb();
      const config = db.select().from(settings).limit(1).get();
      const xtreino = db.select().from(xtreinos).where(eq(xtreinos.id, input.xtreinoId)).get();

      if (!xtreino) throw new Error("XTreino não encontrado");

      const fixedTeams = parseFixedTeams(config?.fixedTeamsList);
      const fixedSet = new Set(fixedTeams.map((t) => t.toLowerCase()));

      const inscricoes = db
        .select()
        .from(xtreinoTeams)
        .where(
          and(
            eq(xtreinoTeams.xtreinoId, input.xtreinoId),
            eq(xtreinoTeams.status, "confirmed")
          )
        )
        .orderBy(xtreinoTeams.slotNumber)
        .all();

      const confirmedTeams = inscricoes.map((insc, index) => ({
        position: index + 1,
        name: insc.teamName,
        isFixed: fixedSet.has(insc.teamName.toLowerCase()),
      }));

      const teamsList = formatTeamsList(confirmedTeams, xtreino.maxTeams || 12);
      const times = parseTimeBr(config?.defaultTimesBr || "21:00");
      const dateParts = xtreino.date.split("-");
      const formattedDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}` : xtreino.date;

      const message = WHATSAPP_TEMPLATE
        .replace(/{{ORG_NAME}}/g, config?.orgName || "𝙐𝙉𝘿𝙀𝙍𝙂𝙍𝙊𝙐𝙉𝘿")
        .replace(/{{DATE}}/g, formattedDate)
        .replace(/{{MODALITY}}/g, (xtreino.modality || "squad").toUpperCase())
        .replace(/{{QUEDAS}}/g, "3")
        .replace(/{{TIME_BR_AR}}/g, times.brAr)
        .replace(/{{TIME_BO_CL}}/g, times.boCl)
        .replace(/{{TIME_CO_PE}}/g, times.coPe)
        .replace(/{{TIME_MX_NI}}/g, times.mxNi)
        .replace(/{{TIME_US}}/g, times.us)
        .replace(/{{TEAMS_LIST}}/g, teamsList)
        .replace(/{{WHATSAPP}}/g, config?.whatsappLink || "");

      return { message, confirmedCount: confirmedTeams.length, maxTeams: xtreino.maxTeams };
    }),

  // ============================================================
  // MIGRAR HISTÓRICOS (admin)
  // ============================================================
  migrarHistoricos: adminQuery.mutation(({ ctx }) => {
    const payload = verifyToken(ctx.adminToken as string);
    if (!payload) throw new Error("Invalid token");
    migrarEventosHistoricos();
    return { success: true };
  }),
});