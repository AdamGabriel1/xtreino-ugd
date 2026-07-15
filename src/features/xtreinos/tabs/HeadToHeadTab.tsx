// HeadToHeadTab.tsx
import { Swords, Target, UserCircle, Dumbbell } from "lucide-react";
import { FilterBar, SearchInput, LoadingSpinner, EmptyState, Sparkline, BadgeIcon } from "@/components/shared";
import { useHeadToHeadTab } from "@/hooks/xtreinos/useXtreinoTabs";
import type { PlayerFullStats } from "@/types/xtreinos";

export default function HeadToHeadTab() {
  const {
    isLoading, mode, setMode, searchA, setSearchA, searchB, setSearchB,
    playerAName, playerBName, filteredA, filteredB, playerA, playerB,
    scrimStats, selectPlayerA, selectPlayerB, handleClear, hasFilters
  } = useHeadToHeadTab();

  return (
    <div className="space-y-6">
      <FilterBar hasFilters={hasFilters} onClear={handleClear}>
        <div className="flex bg-[#1a1a24] rounded-lg border border-[#2a2a3a] p-1">
          <button onClick={() => setMode("xtreino")} className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${mode === "xtreino" ? "bg-blue-500/20 text-blue-400" : "text-[#5a5a6e]"}`}><Dumbbell className="w-4 h-4 inline mr-1.5" />X-Treino</button>
          <button onClick={() => setMode("scrim")} className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${mode === "scrim" ? "bg-red-500/20 text-red-400" : "text-[#5a5a6e]"}`}><Swords className="w-4 h-4 inline mr-1.5" />Scrim</button>
        </div>
        <div className="flex-1 max-w-[300px]">
          <p className="text-xs text-yellow-400 font-bold mb-1">JOGADOR A</p>
          <SearchInput value={searchA} onChange={(v) => { setSearchA(v); if (v === "") selectPlayerA(""); }} placeholder="Buscar jogador/time..." minWidth="100%" />
          {searchA && !playerAName && <div className="absolute mt-1 w-full max-w-[300px] bg-[#1a1a24] border border-[#2a2a3a] rounded-lg max-h-40 overflow-y-auto z-20 shadow-xl">{filteredA.slice(0, 5).map((name) => (<button key={name} onClick={() => selectPlayerA(name)} className="w-full text-left px-3 py-2 text-sm text-[#f0f0f5] hover:bg-[#2a2a3a] flex items-center gap-2"><Target className="w-4 h-4 text-yellow-400" />{name}</button>))}</div>}
        </div>
        <Swords className="w-6 h-6 text-[#5a5a6e] mt-4" />
        <div className="flex-1 max-w-[300px]">
          <p className="text-xs text-gray-300 font-bold mb-1">JOGADOR B</p>
          <SearchInput value={searchB} onChange={(v) => { setSearchB(v); if (v === "") selectPlayerB(""); }} placeholder="Buscar jogador/time..." minWidth="100%" />
          {searchB && !playerBName && <div className="absolute mt-1 w-full max-w-[300px] bg-[#1a1a24] border border-[#2a2a3a] rounded-lg max-h-40 overflow-y-auto z-20 shadow-xl">{filteredB.slice(0, 5).map((name) => (<button key={name} onClick={() => selectPlayerB(name)} className="w-full text-left px-3 py-2 text-sm text-[#f0f0f5] hover:bg-[#2a2a3a] flex items-center gap-2"><Target className="w-4 h-4 text-gray-300" />{name}</button>))}</div>}
        </div>
      </FilterBar>

      {isLoading && <LoadingSpinner text="Carregando stats..." />}

      {!isLoading && mode === "xtreino" && playerA && playerB && (
        <div className="relative bg-[#12121a] rounded-2xl border border-[#2a2a3a] p-6">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-[#0a0a0f] border-2 border-[#2a2a3a] rounded-full w-14 h-14 flex items-center justify-center shadow-2xl"><span className="text-xl font-black text-[#5a5a6e]">VS</span></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
            <PlayerH2HCard data={playerA} opponentTotal={playerB.totalKills} colorClass="text-yellow-400" />
            <PlayerH2HCard data={playerB} opponentTotal={playerA.totalKills} colorClass="text-gray-300" />
          </div>
          <div className="mt-8 pt-6 border-t border-[#2a2a3a]">
            <H2HBarComparison label="Q1 Média" a={playerA.avgPerQuarter.q1} b={playerB.avgPerQuarter.q1} color="bg-red-500" />
            <H2HBarComparison label="Q2 Média" a={playerA.avgPerQuarter.q2} b={playerB.avgPerQuarter.q2} color="bg-orange-500" />
            <H2HBarComparison label="Q3 Média" a={playerA.avgPerQuarter.q3} b={playerB.avgPerQuarter.q3} color="bg-purple-500" />
            <H2HBarComparison label="Total Geral" a={playerA.totalKills} b={playerB.totalKills} color="bg-green-500" />
          </div>
        </div>
      )}

      {!isLoading && mode === "scrim" && playerA && playerB && (
        <div className="relative bg-[#12121a] rounded-2xl border border-[#2a2a3a] p-6">
          <div className="text-center mb-8 border-b border-[#2a2a3a] pb-6">
            <h2 className="text-xl font-bold text-[#f0f0f5] mb-2">Histórico de Confrontos Diretos</h2>
            {scrimStats && scrimStats.matches > 0 ? <p className="text-[#5a5a6e]">{scrimStats.matches} scrims disputados</p> : <p className="text-[#5a5a6e]">Nenhum histórico encontrado</p>}
          </div>
          {scrimStats && scrimStats.matches > 0 ? (
            <div className="space-y-8">
              <div className="grid grid-cols-3 gap-4 items-center text-center">
                <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-6"><p className="text-5xl font-black text-yellow-400">{scrimStats.winsA}</p><p className="text-sm text-[#8a8a9e] mt-2 font-medium">VITÓRIAS</p><p className="text-xs text-yellow-400 mt-1 truncate">{playerAName}</p></div>
                <div className="text-4xl font-black text-[#2a2a3a]">VS</div>
                <div className="bg-gray-300/5 border border-gray-300/20 rounded-xl p-6"><p className="text-5xl font-black text-gray-300">{scrimStats.winsB}</p><p className="text-sm text-[#8a8a9e] mt-2 font-medium">VITÓRIAS</p><p className="text-xs text-gray-300 mt-1 truncate">{playerBName}</p></div>
              </div>
              <div className="bg-[#1a1a24] rounded-xl border border-[#2a2a3a] p-5">
                <h4 className="text-sm font-medium text-[#8a8a9e] mb-4 text-center uppercase">Total de Rounds/Score</h4>
                <H2HBarComparison label="Score" a={scrimStats.totalRoundsA} b={scrimStats.totalRoundsB} color="bg-red-500" />
              </div>
            </div>
          ) : <EmptyState icon={<Swords className="w-12 h-12" />} title="Nenhum Scrim encontrado" subtitle="Nenhum confronto registrado." />}
        </div>
      )}

      {!isLoading && (!playerA || !playerB) && <EmptyState icon={<UserCircle className="w-12 h-12" />} title="Selecione dois jogadores" subtitle="Busque e clique nos nomes acima." />}
    </div>
  );
}

function PlayerH2HCard({ data, opponentTotal, colorClass }: { data: PlayerFullStats; opponentTotal: number; colorClass: string }) {
  const isWinner = data.totalKills > opponentTotal;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-2xl font-black ${colorClass}`}>{data.playerName}</h3>
          <p className="text-sm text-[#5a5a6e]">{data.teamName ?? "Sem time"}</p>
          {isWinner && <span className="text-xs font-bold text-yellow-400 mt-1 block">🏆 VENCEDOR</span>}
        </div>
        <p className="text-4xl font-black text-green-400">{data.totalKills}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <StatBox label="Participações" value={data.participations} />
        <StatBox label="Média/Kill" value={data.avgKills} />
        <StatBox label="Recorde" value={data.bestPerformance} color="text-yellow-400" />
      </div>
      {data.badges.length > 0 && <div className="flex flex-wrap gap-2">{data.badges.map((b) => (<span key={b} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#1a1a24] border border-[#2a2a3a] text-xs text-[#8a8a9e]"><BadgeIcon badge={b} /> {b}</span>))}</div>}
      {data.sparkline.length > 1 && <div className="bg-[#1a1a24] rounded-lg border border-[#2a2a3a] p-3"><p className="text-xs text-[#5a5a6e] mb-1">Evolução nos XTs</p><Sparkline data={data.sparkline} width={300} height={50} /></div>}
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (<div className="bg-[#1a1a24] rounded-lg p-3 border border-[#2a2a3a]"><p className="text-xs text-[#5a5a6e]">{label}</p><p className={`text-xl font-bold ${color || "text-[#f0f0f5]"}`}>{value}</p></div>);
}

function H2HBarComparison({ label, a, b, color }: { label: string; a: number; b: number; color: string }) {
  const max = Math.max(a, b, 1);
  return (
    <div className="flex items-center gap-4 mb-3">
      <span className="text-sm font-bold text-[#f0f0f5] w-16 text-right">{a}</span>
      <div className="flex-1 flex items-center h-6 rounded-full overflow-hidden bg-[#0a0a0f] border border-[#2a2a3a]">
        <div className={`${color} h-full transition-all duration-700`} style={{ width: `${(a / max) * 50}%` }} />
        <div className="w-20 flex items-center justify-center text-xs font-bold text-[#5a5a6e] bg-[#12121a] h-full border-x border-[#2a2a3a]">{label}</div>
        <div className={`${color} opacity-70 h-full transition-all duration-700`} style={{ width: `${(b / max) * 50}%` }} />
      </div>
      <span className="text-sm font-bold text-[#f0f0f5] w-16">{b}</span>
    </div>
  );
}