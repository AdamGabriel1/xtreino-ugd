// ============================================================
// PredicoesTab.tsx
// ============================================================

import {
  Brain,
  Shield,
  TrendingUp,
  Target,
  AlertTriangle,
} from "lucide-react";
import {
  FilterBar,
  SearchInput,
  LoadingSpinner,
  EmptyState,
} from "@/components/shared";
import { usePredicoesTab } from "@/hooks/xtreinos/useXtreinoTabs";
import type { PredictionReason } from "@/hooks/xtreinos/useXtreinoTabs";

// Mapeamento que transforma a string do Hook no Componente Visual
const IconMap: Record<PredictionReason["iconId"], React.FC<{ className?: string }>> = {
  "trending-up": TrendingUp,
  "target": Target,
  "shield": Shield,
  "alert-triangle": AlertTriangle,
};

const IconColorMap: Record<PredictionReason["iconId"], string> = {
  "trending-up": "text-green-400",
  "target": "text-red-400",
  "shield": "text-blue-400",
  "alert-triangle": "text-yellow-400",
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function PredicoesTab() {
  const {
    isLoading,
    searchA, setSearchA,
    searchB, setSearchB,
    teamA, teamB,
    filteredA, filteredB,
    prediction, powerA, powerB,
    showDetails, setShowDetails,
    selectTeamA, selectTeamB,
    handleClear,
    hasFilters,
  } = usePredicoesTab();

  return (
    <div className="space-y-6">
      <FilterBar hasFilters={hasFilters} onClear={handleClear}>
        <div className="flex-1 max-w-[300px]">
          <p className="text-xs text-yellow-400 font-bold mb-1">TIME A</p>
          <SearchInput 
            value={searchA} 
            onChange={(v) => { setSearchA(v); if (v === "") selectTeamA(""); }} 
            placeholder="Buscar time..." 
            minWidth="100%" 
          />
          {searchA && !teamA && (
            <div className="absolute mt-1 w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-lg max-h-40 overflow-y-auto z-20 shadow-xl">
              {filteredA.slice(0, 5).map((name) => (
                <button 
                  key={name} 
                  onClick={() => selectTeamA(name)} 
                  className="w-full text-left px-3 py-2 text-sm text-[#f0f0f5] hover:bg-[#2a2a3a] flex items-center gap-2"
                >
                  <Shield className="w-4 h-4 text-yellow-400" />{name}
                </button>
              ))}
            </div>
          )}
        </div>

        <Brain className="w-6 h-6 text-purple-400 mt-4" />

        <div className="flex-1 max-w-[300px]">
          <p className="text-xs text-gray-300 font-bold mb-1">TIME B</p>
          <SearchInput 
            value={searchB} 
            onChange={(v) => { setSearchB(v); if (v === "") selectTeamB(""); }} 
            placeholder="Buscar time..." 
            minWidth="100%" 
          />
          {searchB && !teamB && (
            <div className="absolute mt-1 w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-lg max-h-40 overflow-y-auto z-20 shadow-xl">
              {filteredB.slice(0, 5).map((name) => (
                <button 
                  key={name} 
                  onClick={() => selectTeamB(name)} 
                  className="w-full text-left px-3 py-2 text-sm text-[#f0f0f5] hover:bg-[#2a2a3a] flex items-center gap-2"
                >
                  <Shield className="w-4 h-4 text-gray-300" />{name}
                </button>
              ))}
            </div>
          )}
        </div>
      </FilterBar>

      {isLoading && <LoadingSpinner text="Calculando Power Ratings..." />}

      {!isLoading && prediction && powerA && powerB && (
        <div className="space-y-6">
          {/* Card de Predição Principal */}
          <div className="bg-[#12121a] rounded-2xl border border-purple-500/20 p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />
            <h2 className="text-lg font-bold text-[#8a8a9e] mb-6 relative z-10">PROBABILIDADE DE VITÓRIA</h2>
            
            <div className="flex items-center justify-center gap-6 relative z-10">
              <div className="text-center">
                <p className="text-5xl font-black text-yellow-400">{prediction.probA}%</p>
                <p className="text-sm text-[#f0f0f5] mt-2 font-medium">{teamA}</p>
              </div>
              <div className="text-2xl font-black text-[#2a2a3a]">VS</div>
              <div className="text-center">
                <p className="text-5xl font-black text-gray-300">{prediction.probB}%</p>
                <p className="text-sm text-[#f0f0f5] mt-2 font-medium">{teamB}</p>
              </div>
            </div>

            <div className="max-w-lg mx-auto mt-8 h-4 rounded-full overflow-hidden bg-[#0a0a0f] border border-[#2a2a3a] flex relative z-10">
              <div className="bg-yellow-400 h-full transition-all duration-1000" style={{ width: `${prediction.probA}%` }} />
              <div className="bg-gray-400 h-full transition-all duration-1000" style={{ width: `${prediction.probB}%` }} />
            </div>
            
            <p className="text-xs text-purple-400 mt-4 relative z-10">
              *Baseado no algoritmo de Power Rating (Pontuação, Kills e Consistência)
            </p>
          </div>

          {/* Fatores Análisados */}
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
            <button 
              onClick={() => setShowDetails(!showDetails)} 
              className="w-full flex items-center justify-between text-[#f0f0f5] font-bold"
            >
              <span className="flex items-center gap-2"><Brain className="w-5 h-5 text-purple-400" /> Fatores da Análise</span>
              <span className="text-[#5a5a6e]">{showDetails ? '▲' : '▼'}</span>
            </button>
            
            {showDetails && (
              <div className="mt-4 space-y-3 border-t border-[#2a2a3a] pt-4">
                {prediction.reasons.map((r, i) => {
                  const IconComponent = IconMap[r.iconId];
                  const iconColor = IconColorMap[r.iconId];
                  return (
                    <div 
                      key={i} 
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        r.winner === "A" ? "bg-yellow-500/5 border-yellow-500/20 text-yellow-400" : 
                        r.winner === "B" ? "bg-gray-300/5 border-gray-300/20 text-gray-300" : 
                        "bg-yellow-500/5 border-yellow-500/10 text-[#8a8a9e]"
                      }`}
                    >
                      {IconComponent && <IconComponent className={`w-4 h-4 ${iconColor}`} />}
                      <span className="text-sm font-medium">{r.text}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Stats Comparativas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCompCard label="Power Rating" a={powerA.rating} b={powerB.rating} isHigherBetter />
            <StatCompCard label="Média de Pontos/XT" a={powerA.avgPoints} b={powerB.avgPoints} isHigherBetter />
            <StatCompCard label="Média de Kills/XT" a={powerA.avgKills} b={powerB.avgKills} isHigherBetter />
            <StatCompCard label="Consistência Top 3 (%)" a={powerA.consistency} b={powerB.consistency} isHigherBetter suffix="%" />
          </div>
        </div>
      )}

      {!isLoading && (!teamA || !teamB) && (
        <EmptyState 
          icon={<Brain className="w-12 h-12" />} 
          title="Simulador de Confrontos" 
          subtitle="Selecione dois times para gerar uma predição matemática baseada nos dados reais." 
        />
      )}
    </div>
  );
}

// ============================================================
// COMPONENTES AUXILIARES PURAMENTE VISUAIS
// ============================================================

function StatCompCard({ label, a, b, isHigherBetter, suffix = "" }: { label: string; a: number; b: number; isHigherBetter: boolean; suffix?: string }) {
  const aWins = isHigherBetter ? a > b : a < b;
  const bWins = isHigherBetter ? b > a : b < a;
  return (
    <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4 flex items-center justify-between">
      <span className={`text-lg font-bold ${aWins ? 'text-yellow-400' : 'text-[#5a5a6e]'}`}>{a}{suffix}</span>
      <span className="text-xs text-[#5a5a6e] text-center flex-1 px-2">{label}</span>
      <span className={`text-lg font-bold ${bWins ? 'text-gray-300' : 'text-[#5a5a6e]'}`}>{b}{suffix}</span>
    </div>
  );
}