import { Loader2, BarChart3, Crown } from "lucide-react";

export default function RankList({
  rankings, type, isLoading, isError,
}: {
  rankings: Array<{ id: number; entityName: string; points: number; kills?: number; wins?: number }> | undefined;
  type: "team" | "player"; isLoading: boolean; isError: boolean;
}) {
  if (isLoading) return (
    <div className="px-6 py-8 flex items-center justify-center gap-2 text-[#5a5a6e] text-sm">
      <Loader2 className="w-4 h-4 animate-spin" />Carregando ranking...
    </div>
  );
  if (isError) return (
    <div className="px-6 py-8 text-center text-red-400 text-sm">Erro ao carregar ranking.</div>
  );
  if (!rankings || rankings.length === 0) return (
    <div className="px-6 py-8 text-center">
      <div className="w-16 h-16 rounded-full bg-[#1a1a24] flex items-center justify-center mx-auto mb-4">
        <BarChart3 className="w-8 h-8 text-[#3a3a4e]" />
      </div>
      <p className="text-[#5a5a6e] text-sm mb-2">Sem dados para este modo</p>
      <p className="text-[#5a5a6e] text-xs">Adicione resultados para gerar o ranking.</p>
    </div>
  );

  // MELHORIA 3: Calcula a pontuação máxima para a barra de poder
  const maxPoints = Math.max(...rankings.map(r => r.points), 1);

  return (
    <div className="divide-y divide-white/5 max-h-[380px] overflow-y-auto custom-scrollbar">
      {rankings.map((r, i) => {
        const widthPercentage = (r.points / maxPoints) * 100;
        
        return (
          <div key={r.id} className="relative flex items-center gap-4 px-6 py-3 hover:bg-[#1a1a24]/80 transition-colors group overflow-hidden">
            
            {/* MELHORIA 3: BARRA DE PODER NO FUNDO */}
            <div 
              className="absolute left-0 top-0 bottom-0 bg-emerald-500/5 transition-all duration-700 group-hover:bg-emerald-500/10" 
              style={{ width: `${widthPercentage}%` }} 
            />

            <span className={`relative z-10 w-8 text-center font-bold flex items-center justify-center ${
              i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-amber-600" : "text-[#5a5a6e]"
            }`}>
              {i < 3 ? <Crown className="w-4 h-4" /> : <span className="text-sm">{i + 1}</span>}
            </span>
            <span className="relative z-10 flex-1 text-[#f0f0f5] font-medium text-sm group-hover:text-emerald-400 transition-colors truncate">{r.entityName}</span>
            <span className="relative z-10 text-emerald-400 text-sm font-semibold tabular-nums">{r.points} pts</span>
            {type === "team" && <span className="relative z-10 text-[#5a5a6e] text-xs tabular-nums">{r.wins ?? 0}V</span>}
            {type === "player" && <span className="relative z-10 text-[#5a5a6e] text-xs tabular-nums">{r.kills ?? 0}K</span>}
          </div>
        );
      })}
    </div>
  );
}