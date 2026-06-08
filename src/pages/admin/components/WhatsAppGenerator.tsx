import { useState, useMemo } from "react";
import { Copy, Check, MessageCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import type { InscricaoEquipe, XtreinoEvento } from "../../../types/inscricoes";

interface WhatsAppGeneratorProps {
  xtreino: XtreinoEvento;
  inscricoes: InscricaoEquipe[];
  fixedTeams: string[];
  settings: {
    orgName?: string | null;
    whatsappLink?: string | null;
    defaultTimesBr?: string | null;
    defaultTimesMx?: string | null;
  } | null | undefined;
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

export function WhatsAppGenerator({ xtreino, inscricoes, fixedTeams, settings }: WhatsAppGeneratorProps) {
  const [copied, setCopied] = useState(false);
  const [customQuedas, setCustomQuedas] = useState(3);
  const [customDate, setCustomDate] = useState(
    xtreino.date ? xtreino.date.split("-")[2] + "/" + xtreino.date.split("-")[1] : ""
  );
  const [customModality, setCustomModality] = useState("SQUAD");

  const fixedSet = useMemo(() => new Set(fixedTeams), [fixedTeams]);

  const confirmedTeams = useMemo(() => {
    return inscricoes
      .filter((r) => r.status === "confirmada")
      .map((r, index) => ({
        position: index + 1,
        name: r.teamName,
        isFixed: fixedSet.has(r.teamName),
      }));
  }, [inscricoes, fixedSet]);

  const times = useMemo(() => {
    return parseTimeBr(settings?.defaultTimesBr || "21:00");
  }, [settings]);

  const generatedMessage = useMemo(() => {
    const teamsList = formatTeamsList(confirmedTeams, xtreino.maxTeams || 12);

    return WHATSAPP_TEMPLATE
      .replace(/{{ORG_NAME}}/g, settings?.orgName || "𝙐𝙉𝘿𝙀𝙍𝙂𝙍𝙊𝙐𝙉𝘿")
      .replace(/{{DATE}}/g, customDate)
      .replace(/{{MODALITY}}/g, customModality)
      .replace(/{{QUEDAS}}/g, String(customQuedas))
      .replace(/{{TIME_BR_AR}}/g, times.brAr)
      .replace(/{{TIME_BO_CL}}/g, times.boCl)
      .replace(/{{TIME_CO_PE}}/g, times.coPe)
      .replace(/{{TIME_MX_NI}}/g, times.mxNi)
      .replace(/{{TIME_US}}/g, times.us)
      .replace(/{{TEAMS_LIST}}/g, teamsList)
      .replace(/{{WHATSAPP}}/g, settings?.whatsappLink || "");
  }, [confirmedTeams, xtreino, settings, customQuedas, customDate, customModality, times]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedMessage);
      setCopied(true);
      toast.success("Mensagem copiada!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Erro ao copiar");
    }
  };

  const handleRegenerate = () => {
    toast.success("Mensagem atualizada!");
  };

  return (
    <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-green-400" />
          <h3 className="font-bold text-[#f0f0f5]">Gerar Mensagem WhatsApp</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRegenerate}
            className="p-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#8a8a9e] hover:text-[#f0f0f5] transition-all"
            title="Atualizar"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              copied
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-green-500 hover:bg-green-600 text-white"
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copiado!" : "Copiar"}
          </button>
        </div>
      </div>

      {/* Configurações rápidas */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-[#8a8a9e] mb-1">Data do Evento</label>
          <input
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
            placeholder="08/06"
            className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50"
          />
        </div>
        <div>
          <label className="block text-sm text-[#8a8a9e] mb-1">Número de Quedas</label>
          <input
            type="number"
            value={customQuedas}
            onChange={(e) => setCustomQuedas(parseInt(e.target.value) || 3)}
            min={1}
            max={10}
            className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50"
          />
        </div>
        <div>
          <label className="block text-sm text-[#8a8a9e] mb-1">Modalidade</label>
          <select
            value={customModality}
            onChange={(e) => setCustomModality(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50"
          >
            <option value="SQUAD">SQUAD</option>
            <option value="DUO">DUO</option>
            <option value="SOLO">SOLO</option>
          </select>
        </div>
      </div>

      {/* Preview */}
      <div className="relative">
        <label className="block text-sm text-[#8a8a9e] mb-1">Preview da Mensagem</label>
        <pre className="w-full p-4 rounded-lg bg-[#0a0a12] border border-[#2a2a3a] text-[#f0f0f5] text-sm whitespace-pre-wrap font-mono leading-relaxed min-h-[200px] max-h-[400px] overflow-y-auto">
          {generatedMessage}
        </pre>
      </div>

      {/* Info */}
      <div className="flex items-center gap-4 text-xs text-[#5a5a6e]">
        <span>📌 {confirmedTeams.filter((t) => t.isFixed).length} fixos</span>
        <span>🎫 {confirmedTeams.filter((t) => !t.isFixed).length} temporários</span>
        <span>{confirmedTeams.length}/{xtreino.maxTeams || 12} confirmados</span>
      </div>
    </div>
  );
}