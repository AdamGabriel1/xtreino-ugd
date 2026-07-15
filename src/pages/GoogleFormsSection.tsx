import { useState } from "react";
import {
  ExternalLink,
  Globe,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  ImageOff,
} from "lucide-react";

interface GoogleFormsSectionProps {
  xtreinoStatus: string;
  googleFormsUrl?: string;
}

export function GoogleFormsSection({
  xtreinoStatus,
  googleFormsUrl = "https://forms.gle/yyTkC8nczQw32A5d6",
}: GoogleFormsSectionProps) {
  const [showEmbed, setShowEmbed] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const isAberto = xtreinoStatus === "aberto";

  return (
    <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
            <Globe className="w-4 h-4 text-green-400" />
          </div>
          <div>
            <h3 className="font-bold text-[#f0f0f5] text-sm">
              Inscrições via Google Forms
            </h3>
            <p className="text-xs text-[#5a5a6e] mt-0.5">
              Comunidade UGD — 4x4
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAberto ? (
            <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400">
              <CheckCircle2 className="w-3 h-3" />
              Sincronizando
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <AlertCircle className="w-3 h-3" />
              Xtreino fechado
            </span>
          )}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-6 space-y-4">
        {/* Ações rápidas */}
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={googleFormsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-all disabled:opacity-40"
            style={!isAberto ? { pointerEvents: "none", opacity: 0.4 } : undefined}
          >
            <ExternalLink className="w-4 h-4" />
            Abrir Formulário de Inscrição
          </a>

          <button
            onClick={() => setShowEmbed(!showEmbed)}
            disabled={!isAberto}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#8a8a9e] text-sm hover:text-[#f0f0f5] transition-all disabled:opacity-30"
          >
            {showEmbed ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
            {showEmbed ? "Ocultar formulário" : "Preencher aqui"}
          </button>
        </div>

        {/* Embed do Google Forms */}
        {showEmbed && isAberto && (
          <div className="rounded-lg overflow-hidden border border-[#2a2a3a] bg-[#0a0a0f]">
            <iframe
              src={googleFormsUrl}
              width="100%"
              height="700"
              frameBorder="0"
              marginHeight={0}
              marginWidth={0}
              title="Formulário de Inscrição UGD"
              className="w-full"
            >
              Carregando…
            </iframe>
          </div>
        )}

        {/* Info sobre como funciona */}
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="w-full text-left text-xs text-[#5a5a6e] hover:text-[#8a8a9e] transition-colors flex items-center gap-1"
        >
          Como funciona a sincronização do Forms?
          {showInfo ? (
            <ChevronUp className="w-3 h-3 ml-1" />
          ) : (
            <ChevronDown className="w-3 h-3 ml-1" />
          )}
        </button>

        {showInfo && (
          <div className="bg-[#0a0a0f] rounded-lg border border-[#2a2a3a] p-4 text-xs text-[#8a8a9e] space-y-2">
            <p>
              <span className="text-[#f0f0f5] font-medium">Fluxo automático:</span>{" "}
              Quando alguém preenche o Forms, o sistema registra a Line automaticamente aqui.
            </p>
            <div className="flex items-start gap-2 text-green-400/80">
              <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0" />
              <span>
                <strong className="text-green-400">NOME DA LINE</strong> é usado como
                nome da equipe aqui no sistema
              </span>
            </div>
            <div className="flex items-start gap-2 text-green-400/80">
              <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0" />
              <span>
                <strong className="text-green-400">CAPITÃO ao PLAYER 4</strong> são
                adicionados como jogadores titulares
              </span>
            </div>
            <div className="flex items-start gap-2 text-green-400/80">
              <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0" />
              <span>
                <strong className="text-green-400">RESERVA 1 e 2</strong> são
                adicionados na lista de jogadores
              </span>
            </div>
            <div className="flex items-start gap-2 text-amber-400/80">
              <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
              <span>
                <strong className="text-amber-400">COACH</strong> é registrado
                no log do servidor
              </span>
            </div>
            <div className="flex items-start gap-2 text-red-400/80">
              <ImageOff className="w-3 h-3 mt-0.5 shrink-0" />
              <span>
                <strong className="text-red-400">LOGO TEAM</strong> não é sincronizada 
                (vai para o Drive do Forms). Faça o upload da logo pela área administrativa do time.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}