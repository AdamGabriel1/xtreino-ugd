// DueloTab.tsx
import { Swords, Calendar, Trophy, BarChart3 } from "lucide-react";
import { FilterBar, SelectFilter, LoadingSpinner, EmptyState } from "@/components/shared";
import { getPosColor } from "@/hooks/xtreinos/xtreino-shared";
import { useDueloTab } from "@/hooks/xtreinos/useXtreinoTabs";
import type { TeamDuelData } from "@/types/xtreinos";

export default function DueloTab() {
  const {
    isLoading, selectedXtId, teamAName, teamBName, xtOptions, availableTeams,
    teamAData, teamBData, setTeamAName, setTeamBName, handleXtChange, handleClear, hasFilters
  } = useDueloTab();

  return (
    <div className="space-y-6">
      <FilterBar hasFilters={hasFilters} onClear={handleClear}>
        <SelectFilter icon={<Calendar className="w-4 h-4 text-[#5a5a6e]" />} value={selectedXtId} onChange={handleXtChange} placeholder="Selecione um X-Treino" options={xtOptions} minWidth="220px" />
        <SelectFilter icon={<Trophy className="w-4 h-4 text-yellow-400" />} value={teamAName} onChange={setTeamAName} placeholder="Time A" options={availableTeams.map((t: any) => ({ value: String(t), label: String(t) }))} disabled={!selectedXtId} minWidth="160px" />
        <SelectFilter icon={<Trophy className="w-4 h-4 text-gray-300" />} value={teamBName} onChange={setTeamBName} placeholder="Time B" options={availableTeams.filter((t: any) => t !== teamAName).map((t: any) => ({ value: String(t), label: String(t) }))} disabled={!selectedXtId || !teamAName} minWidth="160px" />
      </FilterBar>

      {isLoading && <LoadingSpinner text="Carregando dados do duelo..." />}

      {!isLoading && teamAData && teamBData && (
        <div className="relative bg-[#12121a] rounded-2xl border border-[#2a2a3a] p-6 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-[#0a0a0f] border-2 border-[#2a2a3a] rounded-full w-16 h-16 flex items-center justify-center shadow-2xl">
            <Swords className="w-7 h-7 text-red-400 rotate-45" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
            <DuelTeamSide data={teamAData} opponentPoints={teamBData.totalPoints} side="left" />
            <DuelTeamSide data={teamBData} opponentPoints={teamAData.totalPoints} side="right" />
          </div>
          <div className="mt-8 pt-6 border-t border-[#2a2a3a]">
            <h4 className="text-sm font-medium text-[#8a8a9e] mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-green-400" /> Comparativo de Quartos (Kills)
            </h4>
            <QuarterComparisonBar teamA={teamAData} teamB={teamBData} />
          </div>
        </div>
      )}

      {!isLoading && (!teamAData || !teamBData) && selectedXtId && (
        <EmptyState icon={<Swords className="w-12 h-12" />} title="Selecione dois times para o duelo" subtitle="Escolha o X-Treino e depois os dois times que deseja comparar." />
      )}
      {!isLoading && !selectedXtId && (
        <EmptyState icon={<Calendar className="w-12 h-12" />} title="Nenhum X-Treino selecionado" subtitle="Use o filtro acima para escolher um X-Treino e iniciar o duelo." />
      )}
    </div>
  );
}

// Sub-componentes puramente visuais mantidos no mesmo arquivo ou podem ser movidos para ui/DueloTabUI.tsx
function DuelTeamSide({ data, opponentPoints, side }: { data: TeamDuelData; opponentPoints: number; side: "left" | "right" }) {
  const isWinner = data.totalPoints > opponentPoints;
  const isTie = data.totalPoints === opponentPoints;
  const bgGradient = side === "left" ? "bg-gradient-to-br from-yellow-500/5 via-transparent to-transparent border-yellow-500/20" : "bg-gradient-to-bl from-gray-300/5 via-transparent to-transparent border-gray-300/20";

  return (
    <div className={`rounded-xl border p-5 ${bgGradient}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-[#f0f0f5]">{data.teamName}</h3>
          <div className="flex items-center gap-2 mt-1">
            {isWinner && <span className="text-xs font-bold text-yellow-400">🏆 VENCEDOR</span>}
            {isTie && <span className="text-xs font-bold text-[#5a5a6e]">⚡ EMPATE</span>}
            {!isWinner && !isTie && <span className="text-xs font-bold text-red-400/70">DERROTADO</span>}
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black text-green-400">{data.totalPoints}</p>
          <p className="text-xs text-[#5a5a6e] uppercase">Pontos</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {["q1Pos", "q2Pos", "q3Pos"].map((q, i) => (
          <div key={q} className="bg-[#1a1a24] rounded-lg p-3 border border-[#2a2a3a] text-center">
            <p className="text-xs text-[#5a5a6e] mb-1">Q{i + 1}</p>
            <p className={`text-2xl font-bold ${getPosColor(data[q as keyof TeamDuelData] as number | null)}`}>
              {data[q as keyof TeamDuelData] ? `${data[q as keyof TeamDuelData]}º` : "-"}
            </p>
          </div>
        ))}
      </div>
      <div className="space-y-2 mb-6">
        <div className="flex justify-between text-sm"><span className="text-[#8a8a9e]">Pts Posição</span><span className="font-bold text-yellow-400">{data.totalPosPoints}</span></div>
        <div className="flex justify-between text-sm"><span className="text-[#8a8a9e]">Kills ({data.totalKills})</span><span className="font-bold text-red-400">{data.totalKillPoints}</span></div>
      </div>
      <div>
        <h4 className="text-xs font-medium text-[#5a5a6e] mb-3 flex items-center gap-2">Jogadores</h4>
        <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
          {data.players.map((player, idx) => (
            <div key={player.playerName} className={`flex items-center justify-between p-2.5 rounded-lg border ${idx === 0 && data.players.length > 1 ? "bg-yellow-500/5 border-yellow-500/20" : "bg-[#1a1a24] border-[#2a2a3a]"}`}>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center text-[10px] font-bold text-[#8a8a9e]">{idx + 1}</div>
                <span className="text-sm text-[#f0f0f5]">{player.playerName}</span>
                {idx === 0 && data.players.length > 1 && <span className="text-[10px] text-yellow-400 font-bold">MVP</span>}
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-red-400/80">{player.q1Kills}</span>
                <span className="text-orange-400/80">{player.q2Kills}</span>
                <span className="text-purple-400/80">{player.q3Kills}</span>
                <span className="text-green-400 font-bold w-8 text-right">{player.totalKills}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuarterComparisonBar({ teamA, teamB }: { teamA: TeamDuelData; teamB: TeamDuelData }) {
  const quarters = [
    { label: "Q1", a: teamA.players.reduce((s, p) => s + p.q1Kills, 0), b: teamB.players.reduce((s, p) => s + p.q1Kills, 0), colorA: "bg-red-500", colorB: "bg-red-400" },
    { label: "Q2", a: teamA.players.reduce((s, p) => s + p.q2Kills, 0), b: teamB.players.reduce((s, p) => s + p.q2Kills, 0), colorA: "bg-orange-500", colorB: "bg-orange-400" },
    { label: "Q3", a: teamA.players.reduce((s, p) => s + p.q3Kills, 0), b: teamB.players.reduce((s, p) => s + p.q3Kills, 0), colorA: "bg-purple-500", colorB: "bg-purple-400" },
  ];
  return (
    <div className="space-y-4">
      {quarters.map((q) => {
        const maxVal = Math.max(q.a, q.b, 1);
        return (
          <div key={q.label} className="flex items-center gap-4">
            <span className="text-sm font-bold text-[#f0f0f5] w-16 text-right">{q.a}</span>
            <div className="flex-1 flex items-center gap-1 h-6">
              <div className={`h-full ${q.colorA} rounded-l-full transition-all duration-500`} style={{ width: `${(q.a / maxVal) * 50}%` }} />
              <div className="w-8 flex items-center justify-center text-xs font-bold text-[#5a5a6e] bg-[#0a0a0f] h-full">{q.label}</div>
              <div className={`h-full ${q.colorB} rounded-r-full transition-all duration-500`} style={{ width: `${(q.b / maxVal) * 50}%` }} />
            </div>
            <span className="text-sm font-bold text-[#f0f0f5] w-16">{q.b}</span>
          </div>
        );
      })}
      <div className="flex items-center justify-center gap-6 pt-2 text-xs text-[#5a5a6e]">
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-red-500/80" /> {teamA.teamName}</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-red-400/80" /> {teamB.teamName}</div>
      </div>
    </div>
  );
}