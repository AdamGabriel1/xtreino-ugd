import { Rocket, Sparkles } from "lucide-react";

const timeline = [
  { title: "O Início", description: "Grupo de amigos começou a organizar salinhas competitivas.", phase: "Fase 1" },
  { title: "Fundação da UGD", description: "A Underground foi oficialmente criada com estrutura e regras.", phase: "Fase 2" },
  { title: "Primeiros XTreinos", description: "Início dos xtreinos regulares com tabelas e resultados.", phase: "Fase 3" },
  { title: "Expansão", description: "Novos clãs parceiros e crescimento da comunidade.", phase: "Fase 4" },
  { title: "Temporada 2026", description: "Campeonatos, site próprio e profissionalização total.", phase: "Atual" },
];

export default function HistoryTimeline() {
  return (
    <div className="group relative bg-[#12121a] rounded-2xl border border-[#2a2a3a] p-8 overflow-hidden hover:border-emerald-500/30 transition-all duration-500 hover:shadow-[0_0_25px_rgba(16,185,129,0.1)]">
      {/* Efeito Shine */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent skew-x-12 z-0 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Rocket className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-[#f0f0f5]">Nossa Jornada</h3>
        </div>
        <div className="space-y-0">
          {timeline.map((item, idx) => {
            const isLast = idx === timeline.length - 1;
            const isCurrent = item.phase === "Atual";
            return (
              <div key={idx} className="flex gap-4 group/item">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    isCurrent
                      ? "bg-emerald-500/20 border-2 border-emerald-500 shadow-lg shadow-emerald-500/20"
                      : "bg-[#1a1a24] border-2 border-[#2a2a3a] group-hover/item:border-emerald-500/30"
                  }`}>
                    {isCurrent ? (
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <span className="text-xs font-bold text-[#5a5a6e] group-hover/item:text-emerald-400 transition-colors">{idx + 1}</span>
                    )}
                  </div>
                  {!isLast && <div className={`w-px flex-1 my-1 min-h-[24px] ${isCurrent ? "bg-emerald-500/30" : "bg-[#2a2a3a]"}`} />}
                </div>
                <div className={`pb-6 ${isLast ? "pb-0" : ""}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-bold text-sm ${isCurrent ? "text-emerald-400" : "text-[#f0f0f5] group-hover/item:text-emerald-400"} transition-colors`}>{item.title}</h4>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isCurrent ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-[#1a1a24] text-[#5a5a6e] border border-[#2a2a3a]"
                    }`}>
                      {item.phase}
                    </span>
                  </div>
                  <p className="text-[#5a5a6e] text-sm leading-relaxed">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}