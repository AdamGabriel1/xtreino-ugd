// ============================================================
// xtreino-ousado.tsx (Puramente Visual)
// ============================================================

import {
  Zap,
  Trophy,
  Target,
  Swords,
} from "lucide-react";
import {
  EmptyState,
} from "@/components/shared";
import {
  usePredicoesOusadoTab,
  useMomentosCarousel,
  useCrossfireTab,
} from "@/hooks/xtreinos/useXtreinoTabs";
import { useState } from "react";

// ============================================================
// IDEIA #14: MODO COMPACTO VS DETALHADO
// ============================================================
export function useCompactMode() {
  const [isCompact, setIsCompact] = useState(false);
  const toggle = () => setIsCompact((prev) => !prev);
  return { isCompact, toggle };
}

// ============================================================
// TRADUTOR DE ÍCONES (Para não usar JSX dentro das regras de negócio)
// ============================================================
const IconMap: Record<string, React.FC<{ className?: string }>> = {
  target: Target,
  trophy: Trophy,
  zap: Zap,
  swords: Swords,
};

// ============================================================
// IDEIA #11: TAB "PREDIÇÕES"
// ============================================================
export function PredicoesTab() {
  const { isLoading, predictions } = usePredicoesOusadoTab();

  if (isLoading) return <EmptyState icon={<Zap className="w-12 h-12" />} title="Carregando predições..." />;

  return (
    <div className="space-y-6">
      <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
        <h3 className="text-lg font-bold text-[#f0f0f5] mb-2 flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-400" /> Projeto para o Próximo Mês (Top 5)
        </h3>
        <p className="text-sm text-[#5a5a6e] mb-6">Baseado na média móvel dos últimos 3 meses e na tendência de crescimento.</p>

        <div className="space-y-4">
          {predictions.length === 0 ? (
            <p className="text-[#5a5a6e] text-sm">Dados insuficientes (mínimo 3 meses de histórico).</p>
          ) : (
            predictions.map((p, i) => (
              <div key={p.teamName} className="bg-[#1a1a24] rounded-lg border border-[#2a2a3a] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black text-[#5a5a6e] w-8">#{i + 1}</span>
                  <div>
                    <h4 className="font-bold text-[#f0f0f5]">{p.teamName}</h4>
                    <span className="text-xs text-[#5a5a6e]">{p.trendLabel}</span>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="text-[#5a5a6e] text-xs">Mês Atual</p>
                    <p className="font-bold text-[#f0f0f5]">{p.currentPts}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-purple-400 text-xs">Projeção</p>
                    <p className="font-black text-2xl text-purple-400">{p.projectionPts}</p>
                  </div>
                  <div className="text-center text-xs text-[#5a5a6e]">
                    <p>Faixa esperada:</p>
                    <p>{p.minPts} — {p.maxPts}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// IDEIA #12: "MOMENTOS" (Highlights Automáticos)
// ============================================================
export function MomentosCarousel() {
  const { moments } = useMomentosCarousel();

  if (!moments.length) return null;

  return (
    <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
      <h3 className="text-sm font-bold text-[#f0f0f5] mb-3 flex items-center gap-2">
        <Zap className="w-4 h-4 text-yellow-400" /> Momentos Históricos
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {moments.map((m) => {
          const IconComponent = IconMap[m.iconId];
          return (
            <div key={m.id} className={`rounded-lg border p-4 ${m.color}`}>
              <div className="mb-2 opacity-80">{IconComponent && <IconComponent className="w-8 h-8" />}</div>
              <h4 className="font-bold text-lg">{m.title}</h4>
              <p className="text-sm opacity-80 mt-1">{m.subtitle}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// IDEIA #13: TAB "CROSSFIRE" (Histórico de Confrontos Diretos)
// ============================================================
export function CrossfireTab() {
  const { isLoading, matchups } = useCrossfireTab();

  if (isLoading) return <EmptyState icon={<Swords className="w-12 h-12" />} title="Calculando rivalidades..." />;

  return (
    <div className="space-y-6">
      <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#2a2a3a]">
          <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
            <Swords className="w-5 h-5 text-red-400" /> Maiores Rivalidades
          </h3>
          <p className="text-xs text-[#5a5a6e] mt-1">Confrontos diretos que aconteceram 2 ou mais vezes.</p>
        </div>

        <div className="divide-y divide-[#2a2a3a]">
          {matchups.length === 0 && <EmptyState icon={<Swords className="w-12 h-12" />} title="Nenhuma rivalidade encontrada" subtitle="Times precisam se enfrentar pelo menos 2 vezes." />}
          
          {matchups.map((m) => {
            const total = m.winsA + m.winsB + m.draws;
            const pctA = Math.round((m.winsA / total) * 100);
            const pctB = Math.round((m.winsB / total) * 100);

            return (
              <div key={`${m.teamA}-${m.teamB}`} className="px-6 py-4 hover:bg-[#1a1a24]/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1 text-right">
                    <span className="font-bold text-[#f0f0f5]">{m.teamA}</span>
                    <span className="ml-2 text-sm text-green-400 font-bold">{m.winsA} vitórias</span>
                  </div>
                  <span className="text-xs text-[#5a5a6e] mx-4">VS</span>
                  <div className="flex-1 text-left">
                    <span className="font-bold text-[#f0f0f5]">{m.teamB}</span>
                    <span className="ml-2 text-sm text-green-400 font-bold">{m.winsB} vitórias</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 h-3 rounded-full overflow-hidden bg-[#0a0a0f]">
                  <div className="bg-blue-500 h-full rounded-l-full transition-all" style={{ width: `${pctA}%` }} />
                  {m.draws > 0 && <div className="bg-[#5a5a6e] h-full" style={{ width: `${Math.round((m.draws / total) * 100)}%` }} />}
                  <div className="bg-red-500 h-full rounded-r-full transition-all" style={{ width: `${pctB}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-[#5a5a6e] mt-1">
                  <span>{pctA}%</span>
                  {m.draws > 0 && <span>{m.draws} empates</span>}
                  <span>{pctB}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}