import { Hono } from "hono";
import { eq, sql } from "drizzle-orm";
import { getDb } from "../../api/queries/connection.js";
import { xtreinos, xtreinoTeams, xtreinoPlayers } from "../../db/schema.js";
import { inscreverEquipe } from "../../db/inscricoes.js";

// Cria uma mini-app do Hono só para o webhook
const webhookApp = new Hono();

webhookApp.post("/", async (c) => {
  try {
    // O Hono faz o parse do JSON perfeitamente
    const body = await c.req.json();

    // O Apps Script envia assim: { input: { json: { ...dados } } }
    const payload = body?.input?.json;

    if (!payload) {
      return c.json({ error: "Formato inválido. Esperado { input: { json: {...} } }" }, 400);
    }

    const { secret, teamName, players, coach } = payload;

    // 1. Valida Secret
    if (secret !== process.env.GOOGLE_FORMS_SECRET) {
      return c.json({ error: "Unauthorized: Chave inválida" }, 401);
    }

    // 2. Valida dados
    if (!teamName || !Array.isArray(players) || players.length === 0) {
      return c.json({ error: "Dados inválidos (faltou teamName ou players)" }, 400);
    }

    // 3. Busca xtreino aberto mais recente
    const db = getDb();
    const activeXtreino = db
      .select()
      .from(xtreinos)
      .where(eq(xtreinos.status, "aberto"))
      .orderBy(sql`date DESC`)
      .limit(1)
      .get();

    if (!activeXtreino) {
      return c.json({ error: "Nenhum xtreino aberto no momento" }, 400);
    }

    // 4. Verifica duplicata (idempotente)
    const existing = db
      .select()
      .from(xtreinoTeams)
      .where(
        sql`${xtreinoTeams.xtreinoId} = ${activeXtreino.id} AND ${xtreinoTeams.teamName} = ${teamName}`
      )
      .get();

    if (existing) {
      return c.json({ success: true, message: "Já inscrito, ignorado.", id: existing.id, duplicate: true });
    }

    // 5. Registra no banco
    const id = inscreverEquipe(activeXtreino.id, teamName, players);

    if (!id) {
      return c.json({ error: "Falha ao inscrever (xtreino cheio?)" }, 400);
    }

    if (coach) {
      console.log(`[GOOGLE-FORMS] Coach de "${teamName}": ${coach}`);
    }

    console.log(`[GOOGLE-FORMS] ✅ "${teamName}" inscrito no xtreino #${activeXtreino.id}`);

    return c.json({ success: true, id, xtreinoId: activeXtreino.id, duplicate: false });

  } catch (error: any) {
    console.error("[GOOGLE-FORMS] Erro:", error);
    return c.json({ error: error.message || "Erro interno no servidor" }, 500);
  }
});

export default webhookApp;