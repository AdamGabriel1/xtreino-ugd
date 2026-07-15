// ============================================================
// RankingLegend.tsx
// ============================================================

import { Trophy, Target, BarChart3 } from "lucide-react";
import { XTREINO_POSITION_POINTS as POSITION_POINTS, XTREINO_KILL_POINTS as KILL_POINTS } from "@/constants/gameRules";

export function RankingLegend() {
  return (
    <div className="grid md:grid-cols-3 gap-4 text-sm">
      <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
        <h4 className="font-bold text-[#f0f0f5] mb-3 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-400" /> Pontuacao
          por Posicao
        </h4>
        <div className="grid grid-cols-5 gap-x-2 gap-y-1 text-xs">
          {Object.entries(POSITION_POINTS).map(([pos, pts]) => (
            <div
              key={pos}
              className="flex justify-between text-[#8a8a9e]"
            >
              <span>{pos}º</span>
              <span className="font-bold text-yellow-400">
                {pts}pts
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
        <h4 className="font-bold text-[#f0f0f5] mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-red-400" /> Pontuacao por
          Kill
        </h4>
        <p className="text-[#8a8a9e] text-xs">
          Cada kill vale{" "}
          <span className="font-bold text-red-400">
            {KILL_POINTS} ponto
          </span>
          .
          <br />
          Total de kills do time × {KILL_POINTS} = Pontos de Kill
        </p>
      </div>
      <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
        <h4 className="font-bold text-[#f0f0f5] mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-green-400" /> Calculo do
          Total
        </h4>
        <p className="text-[#8a8a9e] text-xs">
          <span className="text-yellow-400">Pts Posicao</span> +{" "}
          <span className="text-red-400">Pts Kill</span> ={" "}
          <span className="text-green-400 font-bold">Total</span>
        </p>
      </div>
    </div>
  );
}