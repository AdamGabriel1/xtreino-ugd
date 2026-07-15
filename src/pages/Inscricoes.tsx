import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { toast } from "sonner";
import { useInscricoes } from "@/hooks/useInscricoes";
import { InscricoesManager } from "./InscricoesManager";
import {
  Copy,
  MessageCircle,
  FileCode,
  ClipboardList,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function InscricoesPage() {
  const [searchParams] = useSearchParams();
  const xtreinoId = Number(searchParams.get("xtreinoId")) || 0;

  const {
    xtreino,
    inscricoes,
    fixedTeams,
    allTeams,
    confirmedTeams,
    cancelledTeams,
    isLoading,
    isPending,
    loadData,
    register,
    cancel,
    reactivate,
    remove,
    generateWhatsAppMessage,
    generateInscricoesMessage,
    generateSeed,
  } = useInscricoes(xtreinoId);

  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
  const [copiedInscricoes, setCopiedInscricoes] = useState(false);
  const [copiedSeed, setCopiedSeed] = useState(false);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [showInscricoes, setShowInscricoes] = useState(false);
  const [showSeed, setShowSeed] = useState(false);

  useEffect(() => {
    if (xtreinoId > 0) loadData();
  }, [xtreinoId, loadData]);

  const handleCopy = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copiado para a área de transferência!");
    setTimeout(() => setCopied(false), 2000);
  };

  const seedData = generateSeed();
  const seedCode = seedData
    ? `  // ========================================
  // XTreino ${seedData.id} — ${seedData.date}
  // ========================================
  {
    id: ${seedData.id},
    date: "${seedData.date}",
    colocacoes: [
${seedData.colocacoes.map(c => `      ["${c[0]}", ${c[1]}, ${c[2]}, ${c[3]}],`).join("\n")}
    ],
    jogadores: [
${seedData.jogadores.map(j => `      ["${j[0]}", "${j[1]}", ${j[2]}, ${j[3]}, ${j[4]}],`).join("\n")}
    ],
  },`
    : "";

  if (xtreinoId === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-[#8a8a9e]">
        <div className="text-center">
          <p className="text-lg mb-2">Nenhum xtreino selecionado</p>
          <p className="text-sm text-[#5a5a6e]">Adicione ?xtreinoId=ID na URL</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-[#8a8a9e]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Carregando inscrições...</p>
        </div>
      </div>
    );
  }

  if (!xtreino) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-[#8a8a9e]">
        <div className="text-center">
          <p className="text-lg mb-2">Xtreino não encontrado</p>
          <p className="text-sm text-[#5a5a6e]">Verifique o ID na URL</p>
        </div>
      </div>
    );
  }

  const whatsappMsg = generateWhatsAppMessage();
  const inscricoesMsg = generateInscricoesMessage();

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#f0f0f5]">
            Inscrições — {xtreino.name}
          </h1>
          <p className="text-sm text-[#5a5a6e] mt-1">
            Data: {xtreino.date} | Status: <span className={xtreino.status === "aberto" ? "text-green-400" : "text-amber-400"}>{xtreino.status}</span> | Máx: {xtreino.maxTeams} equipes | Confirmados: {confirmedTeams.length}
          </p>
        </div>

        {/* Geradores de Mensagem */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* WhatsApp */}
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
            <button
              onClick={() => setShowWhatsApp(!showWhatsApp)}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[#1a1a24] transition-colors"
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-[#f0f0f5]">Mensagem WhatsApp</span>
              </div>
              {showWhatsApp ? <ChevronUp className="w-4 h-4 text-[#5a5a6e]" /> : <ChevronDown className="w-4 h-4 text-[#5a5a6e]" />}
            </button>
            {showWhatsApp && (
              <div className="px-4 pb-4">
                <pre className="bg-[#0a0a0f] rounded-lg p-3 text-xs text-[#8a8a9e] whitespace-pre-wrap max-h-64 overflow-y-auto mb-3 border border-[#2a2a3a]">
                  {whatsappMsg}
                </pre>
                <button
                  onClick={() => handleCopy(whatsappMsg, setCopiedWhatsApp)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm hover:bg-green-500/20 transition-all"
                >
                  {copiedWhatsApp ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedWhatsApp ? "Copiado!" : "Copiar mensagem"}
                </button>
              </div>
            )}
          </div>

          {/* Inscrições */}
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
            <button
              onClick={() => setShowInscricoes(!showInscricoes)}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[#1a1a24] transition-colors"
            >
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-[#f0f0f5]">Template Inscrições</span>
              </div>
              {showInscricoes ? <ChevronUp className="w-4 h-4 text-[#5a5a6e]" /> : <ChevronDown className="w-4 h-4 text-[#5a5a6e]" />}
            </button>
            {showInscricoes && (
              <div className="px-4 pb-4">
                <pre className="bg-[#0a0a0f] rounded-lg p-3 text-xs text-[#8a8a9e] whitespace-pre-wrap max-h-64 overflow-y-auto mb-3 border border-[#2a2a3a]">
                  {inscricoesMsg}
                </pre>
                <button
                  onClick={() => handleCopy(inscricoesMsg, setCopiedInscricoes)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm hover:bg-amber-500/20 transition-all"
                >
                  {copiedInscricoes ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedInscricoes ? "Copiado!" : "Copiar template"}
                </button>
              </div>
            )}
          </div>

          {/* Seed */}
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
            <button
              onClick={() => setShowSeed(!showSeed)}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[#1a1a24] transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-[#f0f0f5]">Gerar Seed</span>
              </div>
              {showSeed ? <ChevronUp className="w-4 h-4 text-[#5a5a6e]" /> : <ChevronDown className="w-4 h-4 text-[#5a5a6e]" />}
            </button>
            {showSeed && (
              <div className="px-4 pb-4">
                <pre className="bg-[#0a0a0f] rounded-lg p-3 text-xs text-[#8a8a9e] whitespace-pre-wrap max-h-64 overflow-y-auto mb-3 border border-[#2a2a3a]">
                  {seedCode || "Nenhum time confirmado ainda"}
                </pre>
                <button
                  onClick={() => handleCopy(seedCode, setCopiedSeed)}
                  disabled={!seedCode}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm hover:bg-blue-500/20 transition-all disabled:opacity-30"
                >
                  {copiedSeed ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedSeed ? "Copiado!" : "Copiar seed"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Manager de Inscrições */}
        <InscricoesManager
          xtreino={xtreino}
          inscricoes={inscricoes}
          fixedTeams={fixedTeams}
          allTeams={allTeams}
          onRegister={register}
          onCancel={({ teamName }) => cancel(teamName)}
          onReactivate={({ teamName }) => reactivate(teamName)}
          onRemove={({ teamName }) => remove(teamName)}
          isPending={isPending}
        />
      </div>
    </div>
  );
}