import { useState } from "react";
import { Copy, Check, MessageCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";

interface WhatsAppGeneratorProps {
  xtreinoId: number;
}

export function WhatsAppGenerator({ xtreinoId }: WhatsAppGeneratorProps) {
  const [copied, setCopied] = useState(false);
  const [customQuedas, setCustomQuedas] = useState(3);
  const [customModality, setCustomModality] = useState("SQUAD");

  const { data, refetch, isFetching } = trpc.xtreinoInscricoes.generateWhatsApp.useQuery(
    { xtreinoId },
    { enabled: xtreinoId > 0 }
  );

  const handleCopy = async () => {
    if (!data?.message) return;
    try {
      await navigator.clipboard.writeText(data.message);
      setCopied(true);
      toast.success("Mensagem copiada!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Erro ao copiar");
    }
  };

  const handleRegenerate = () => {
    refetch();
    toast.success("Mensagem atualizada!");
  };

  const displayMessage = data?.message || "Selecione um xtreino para gerar a mensagem...";

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
            disabled={isFetching}
            className="p-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#8a8a9e] hover:text-[#f0f0f5] transition-all"
            title="Atualizar"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleCopy}
            disabled={!data?.message}
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
      <div className="grid sm:grid-cols-2 gap-4">
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
          {displayMessage}
        </pre>
      </div>

      {/* Info */}
      {data && (
        <div className="flex items-center gap-4 text-xs text-[#5a5a6e]">
          <span>{data.confirmedCount}/{data.maxTeams} confirmados</span>
        </div>
      )}
    </div>
  );
}