// ============================================================
// TEMPLATE WHATSAPP - XTreino Underground (v3)
// Arquivo dedicado para facilitar edição do template
// ============================================================

export const WHATSAPP_TEMPLATE = `{{ORG_NAME}} - 𝙓𝙏𝙍𝙀𝙄𝙉𝙊𝙎 𝙈𝙊𝘽𝙄𝙇𝙀 ({{DATE}})


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
// HELPERS PARA FORMATAR LISTA DE TIMES
// ============================================================

/**
 * Formata lista de times com emojis de fixo (📌) ou temporário (🎫)
 * @param teams - Array de times confirmados [{ position, name }]
 * @param fixedTeams - Set ou Array com nomes dos times fixos
 * @returns String formatada para o template
 * 
 * Exemplo de uso:
 * ```ts
 * const confirmedTeams = [
 *   { position: 1, name: "UGD Threat" },
 *   { position: 2, name: "FURY ROYAL" },
 * ];
 * const fixed = ["UGD Threat", "UGD Royal"]; // vindo do settings.fixedTeamsList
 * 
 * const list = formatTeamsList(confirmedTeams, fixed);
 * // 📌01 - UGD Threat
 * // 🎫02 - FURY ROYAL
 * ```
 */
export function formatTeamsList(
  teams: Array<{ position: number; name: string }>,
  fixedTeams: string[] | Set<string>
): string {
  const fixedSet = fixedTeams instanceof Set ? fixedTeams : new Set(fixedTeams);

  return teams
    .map(t => {
      const emoji = fixedSet.has(t.name) ? "📌" : "🎫";
      const pos = String(t.position).padStart(2, "0");
      return `${emoji}${pos} - ${t.name}`;
    })
    .join("\n");
}

/**
 * Parser para converter fixedTeamsList do banco (JSON string) para Array
 * @param jsonString - JSON vindo do settings.fixedTeamsList
 * @returns Array de nomes dos times fixos
 * 
 * Exemplo de uso na API:
 * ```ts
 * const settings = db.select().from(settingsTable).get();
 * const fixedTeams = parseFixedTeams(settings?.fixedTeamsList);
 * ```
 */
export function parseFixedTeams(jsonString: string | null | undefined): string[] {
  if (!jsonString) return [];
  try {
    const parsed = JSON.parse(jsonString);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

/**
 * Gera slots vazios até completar o máximo de times
 * @param currentTeams - Times já confirmados
 * @param maxSlots - Total de slots (padrão 10)
 * @returns Array com slots preenchidos + vazios
 */
export function fillEmptySlots(
  currentTeams: Array<{ position: number; name: string }>,
  maxSlots: number = 10
): Array<{ position: number; name: string }> {
  const result = [...currentTeams];
  for (let i = currentTeams.length + 1; i <= maxSlots; i++) {
    result.push({ position: i, name: "" });
  }
  return result;
}