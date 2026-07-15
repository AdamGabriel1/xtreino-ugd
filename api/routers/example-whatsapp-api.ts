// ============================================================
// EXEMPLO: Gerar mensagem WhatsApp para XTreino
// Coloque isso na sua API/route do painel admin
// ============================================================

import { getDb } from "../../api/queries/connection.js";
import { settings, xtreinos, teams } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { 
  WHATSAPP_TEMPLATE, 
  formatTeamsList, 
  parseFixedTeams,
  fillEmptySlots 
} from "../../db/seeds/whatsapp-template.js";

/**
 * Gera a mensagem completa do WhatsApp para um xtreino
 * Use no painel admin ao clicar "Gerar Mensagem"
 */
export function generateWhatsAppMessage(xtreinoId: number) {
  const db = getDb();

  // 1. Buscar configurações (incluindo times fixos)
  const config = db.select().from(settings).limit(1).get();
  if (!config) throw new Error("Settings não encontrado");

  // 2. Buscar dados do xtreino
  const xtreino = db.select().from(xtreinos).where(eq(xtreinos.id, xtreinoId)).get();
  if (!xtreino) throw new Error("XTreino não encontrado");

  // 3. Parsear times fixos do settings (editável pelo admin!)
  const fixedTeams = parseFixedTeams(config.fixedTeamsList);

  // 4. Buscar times confirmados neste xtreino
  // (Aqui você busca da tabela de confirmações do xtreino)
  const confirmedTeams = [
    { position: 1, name: "UGD Threat" },
    { position: 2, name: "UGD Royal" },
    { position: 3, name: "UGD Light" },
    { position: 4, name: "FURY ROYAL" },
    { position: 5, name: "RED" },
  ];

  // 5. Completar slots vazios (até 10)
  const allSlots = fillEmptySlots(confirmedTeams, 10);

  // 6. Formatar lista com 📌 e 🎫
  const teamsList = formatTeamsList(allSlots, fixedTeams);

  // 7. Substituir variáveis no template
  const message = WHATSAPP_TEMPLATE
    .replace(/{{ORG_NAME}}/g, config.orgName || "𝙐𝙉𝘿𝙀𝙍𝙂𝙍𝙊𝙐𝙉𝘿")
    .replace(/{{DATE}}/g, xtreino.date || "08/06")
    .replace(/{{MODALITY}}/g, xtreino.modality?.toUpperCase() || "𝙎𝙌𝙐𝘼𝘿")
    .replace(/{{QUEDAS}}/g, "3")
    .replace(/{{TIME_BR_AR}}/g, config.defaultTimesBr || "9:00")
    .replace(/{{TIME_BO_CL}}/g, "8:00")
    .replace(/{{TIME_CO_PE}}/g, "7:00")
    .replace(/{{TIME_MX_NI}}/g, config.defaultTimesMx || "6:00")
    .replace(/{{TIME_US}}/g, "5:00")
    .replace(/{{TEAMS_LIST}}/g, teamsList)
    .replace(/{{WHATSAPP}}/g, config.whatsappLink || "");

  return message;
}

/**
 * Atualizar times fixos pelo painel admin
 * Endpoint: PUT /api/admin/settings/fixed-teams
 */
export function updateFixedTeams(teamNames: string[]) {
  const db = getDb();

  // Validação básica
  const validTeams = teamNames
    .map(t => t.trim())
    .filter(t => t.length > 0);

  // Atualiza no banco
  db.update(settings)
    .set({ fixedTeamsList: JSON.stringify(validTeams) })
    .run();

  return { success: true, fixedTeams: validTeams };
}

/**
 * Buscar times fixos atuais (para mostrar no painel)
 * Endpoint: GET /api/admin/settings/fixed-teams
 */
export function getFixedTeams() {
  const db = getDb();
  const config = db.select().from(settings).limit(1).get();

  return {
    fixedTeams: parseFixedTeams(config?.fixedTeamsList),
    allTeams: db.select({ name: teams.name }).from(teams).all().map(t => t.name),
  };
}