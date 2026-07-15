// ============================================================
// XTreinosTab.tsx
// ============================================================

import {
  Calendar, Clock, Trophy, Target, TrendingUp, Swords, Medal, BarChart3, Users,
  Flame, Crown, Award, BarChart2, CheckSquare, Square,
} from "lucide-react";
import {
  Sparkline, BadgeIcon, TrendIcon, RankBadge, SummaryCards, SortHeader,
  FilterBar, SearchInput, SelectFilter, EmptyState, LoadingSpinner, PodiumCard, ExpandableRow, ComparisonBar,
} from "@/components/shared";
import { getPosColor, getPosBg, getRankStyle } from "@/hooks/xtreinos/xtreino-shared"; 
import { XTREINO_POSITION_POINTS as POSITION_POINTS, XTREINO_KILL_POINTS as KILL_POINTS } from "@/constants/gameRules";
import { useXTreinosTab } from "@/hooks/xtreinos/useXtreinoTabs"; 

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function XTreinosTab() {
  // Pegamos TUDO de uma única chamada do hook.
  // Isso garante que o availableDates saiba qual é o selectedMonth
  const {
    isLoading, isAccumulated, sortBy, sortDir, handleSort, selectedMonth, setSelectedMonth,
    selectedDate, setSelectedDate, search, setSearch, compareMode, setCompareMode,
    selectedForCompare, expandedTeam, setExpandedTeam, sortedStats, top3,
    comparisonTeams, getTeamPlayers, scheduleList, periodSummary, clearFilters, hasFilters,
    availableMonths,
    availableDates,
    clearCompare,
  } = useXTreinosTab();

  const summaryCards = periodSummary ? [
    { icon: <Users className="w-4 h-4 text-blue-400" />, label: "Equipes", value: periodSummary.uniqueTeams },
    { icon: <Swords className="w-4 h-4 text-red-400" />, label: "Total Kills", value: periodSummary.totalKills, valueColor: "text-red-400" },
    { icon: <Trophy className="w-4 h-4 text-yellow-400" />, label: "Pts Posicao", value: periodSummary.totalPosPoints, valueColor: "text-yellow-400" },
    { icon: <BarChart3 className="w-4 h-4 text-green-400" />, label: "Total Geral", value: periodSummary.totalPoints, valueColor: "text-green-400" },
  ] : [];

  return (
    <div className={`space-y-6 ${comparisonTeams?.length >= 2 ? "pb-48" : ""}`}>
      {/* Filtros */}
      <FilterBar hasFilters={hasFilters} onClear={clearFilters}>
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar equipe..." minWidth="200px" />
        <SelectFilter 
          icon={<Calendar className="w-4 h-4" />} 
          value={selectedMonth} 
          onChange={(v) => { setSelectedMonth(v); setSelectedDate(""); }} 
          placeholder="Todos os meses" 
          options={availableMonths.map((m: string) => ({ value: m, label: `${m.split("-")[1]}/${m.split("-")[0]}` }))} 
          minWidth="140px" 
        />
        <SelectFilter 
          icon={<Clock className="w-4 h-4" />} 
          value={selectedDate} 
          onChange={setSelectedDate} 
          placeholder="Todos os dias" 
          options={availableDates.map((d: string) => ({ value: d, label: `${d.split("-")[2]}/${d.split("-")[1]}` }))} 
          disabled={!selectedMonth} 
          minWidth="140px" 
        />
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#5a5a6e]" />
          <select 
            value={sortBy} 
            onChange={(e) => handleSort(e.target.value as any)} 
            className="px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50 min-w-[160px]"
          >
            <option value="total">Ordenar: Total</option>
            <option value="kills">Ordenar: Kills</option>
            <option value="pos">Ordenar: Posicao</option>
            <option value="xtreinos">Ordenar: X-Treinos</option>
            <option value="avgPos">Ordenar: Media Pos</option>
            <option value="consistency">Ordenar: Consistencia</option>
            <option value="streak">Ordenar: Streak</option>
          </select>
        </div>
        <button 
          onClick={() => { setCompareMode((m: boolean) => !m); }} 
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${compareMode ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-[#1a1a24] border-[#2a2a3a] text-[#5a5a6e] hover:text-[#f0f0f5]"}`}
        >
          <BarChart2 className="w-4 h-4 inline mr-1.5" /> Comparar
        </button>
      </FilterBar>

      {isLoading && <LoadingSpinner text="Carregando estatisticas..." />}
      {summaryCards.length > 0 && !isLoading && <SummaryCards cards={summaryCards} columns={4} />}

      {/* Podio */}
      {isAccumulated && top3?.length === 3 && !isLoading && (
        <div>
          <h3 className="text-sm font-medium text-[#8a8a9e] mb-3 flex items-center gap-2">
            <Crown className="w-4 h-4 text-yellow-400" /> Podio
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {top3.map((t: any, i: number) => (
              <PodiumCard 
                key={t.teamName} 
                name={t.teamName} 
                rank={i} 
                stats={[
                  { label: "Kills", value: t.totalKills, color: "text-green-400" }, 
                  { label: "XTs", value: t.streak || 1 }, 
                  { label: "Media", value: t.avgPosition }
                ]} 
                streak={t.streak >= 3 ? t.streak : undefined} 
              />
            ))}
          </div>
        </div>
      )}

      {/* Tabela Principal */}
      {!isLoading && (
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center justify-between">
            <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
              <Medal className="w-5 h-5 text-yellow-400" /> Classificacao {selectedDate ? `— ${selectedDate.split("-")[2]}/${selectedDate.split("-")[1]}` : selectedMonth ? `— ${selectedMonth.split("-")[1]}/${selectedMonth.split("-")[0]}` : "— Todos os periodos"}
            </h3>
            <div className="flex items-center gap-3">
              {compareMode && <span className="text-xs text-green-400">{selectedForCompare?.size}/4 selecionados</span>}
              <span className="text-xs text-[#5a5a6e]">{sortedStats?.length} registros</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a2a3a] bg-[#0a0a0f]">
                  {compareMode && <th className="px-3 py-3 text-center w-10"><span className="text-xs font-medium text-[#5a5a6e]">#</span></th>}
                  <th className="px-4 py-3 text-center w-12"><span className="text-xs font-medium text-[#5a5a6e] uppercase">#</span></th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Equipe</th>
                  {!selectedDate && <th className="px-4 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Data</th>}
                  <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Q1 Pos</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Q2 Pos</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Q3 Pos</th>
                  <th className="px-4 py-3 text-center"><SortHeader field="xtreinos" label="XTs" currentField={sortBy} direction={sortDir} onSort={handleSort} /></th>
                  <th className="px-4 py-3 text-center"><SortHeader field="avgPos" label="Media Pos" currentField={sortBy} direction={sortDir} onSort={handleSort} /></th>
                  <th className="px-4 py-3 text-center"><span className="text-xs font-medium text-[#5a5a6e] uppercase">Evol.</span></th>
                  <th className="px-4 py-3 text-center bg-yellow-500/5"><SortHeader field="pos" label="Pts Pos" currentField={sortBy} direction={sortDir} onSort={handleSort} /></th>
                  <th className="px-4 py-3 text-center"><SortHeader field="kills" label="Kills" currentField={sortBy} direction={sortDir} onSort={handleSort} /></th>
                  <th className="px-4 py-3 text-center bg-red-500/5"><span className="text-xs font-medium text-[#5a5a6e] uppercase">Pts Kill</span></th>
                  <th className="px-4 py-3 text-center bg-green-500/5"><SortHeader field="total" label="Total" currentField={sortBy} direction={sortDir} onSort={handleSort} /></th>
                  <th className="px-4 py-3 text-center w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a3a]">
                {sortedStats?.map((teamBase: any, index: number) => {
                  const team = teamBase as any & { date: string; q1Pos: number; q2Pos: number; q3Pos: number };
                  return (
                  <ExpandableRow
                    key={`${team.date}-${team.teamName}`}
                    rowKey={`${team.date}-${team.teamName}`}
                    expandedKey={expandedTeam}
                    onToggle={setExpandedTeam}
                    rankStyle={getRankStyle(index)}
                    expandedContent={
                      <div className="ml-8 space-y-4">
                        {team.badges?.length > 0 && (
                          <div>
                            <h4 className="text-xs font-medium text-[#5a5a6e] mb-2 flex items-center gap-2"><Award className="w-3 h-3" /> Conquistas</h4>
                            <div className="flex flex-wrap gap-2">{team.badges.map((badge: string) => (<span key={badge} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#1a1a24] border border-[#2a2a3a] text-xs text-[#8a8a9e]"><BadgeIcon badge={badge} />{badge}</span>))}</div>
                          </div>
                        )}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="bg-[#1a1a24] rounded-lg border border-[#2a2a3a] p-3 text-center"><p className="text-xs text-[#5a5a6e] mb-1">Melhor</p><p className="text-lg font-bold text-green-400">{team.bestPerformance}</p></div>
                          <div className="bg-[#1a1a24] rounded-lg border border-[#2a2a3a] p-3 text-center"><p className="text-xs text-[#5a5a6e] mb-1">Pior</p><p className="text-lg font-bold text-red-400">{team.worstPerformance}</p></div>
                          <div className="bg-[#1a1a24] rounded-lg border border-[#2a2a3a] p-3 text-center"><p className="text-xs text-[#5a5a6e] mb-1">Consistencia</p><p className="text-lg font-bold text-[#f0f0f5]">{team.consistency}</p></div>
                          <div className="bg-[#1a1a24] rounded-lg border border-[#2a2a3a] p-3 text-center"><p className="text-xs text-[#5a5a6e] mb-1">Top 1s</p><p className="text-lg font-bold text-yellow-400">{team.top1Count}</p></div>
                        </div>
                        {team.sparkline?.length > 1 && (
                          <div><h4 className="text-xs font-medium text-[#5a5a6e] mb-2 flex items-center gap-2"><TrendingUp className="w-3 h-3" /> Evolucao</h4><div className="bg-[#1a1a24] rounded-lg border border-[#2a2a3a] p-3"><Sparkline data={team.sparkline} /></div></div>
                        )}
                        {getTeamPlayers(team.teamName, team.date)?.length > 0 && (
                          <div><h4 className="text-xs font-medium text-[#5a5a6e] mb-2">Jogadores</h4><div className="flex flex-wrap gap-2">
                            {getTeamPlayers(team.teamName, team.date).map((player: any) => (
                              <div key={player.playerName} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a1a24] border border-[#2a2a3a]">
                                <Target className="w-3 h-3 text-green-400" /><span className="text-sm text-[#f0f0f5]">{player.playerName}</span>
                                <span className="text-xs text-green-400 font-bold">{player.totalKills}k</span><span className="text-xs text-[#5a5a6e]">({player.q1Kills}/{player.q2Kills}/{player.q3Kills})</span>
                              </div>
                            ))}
                          </div></div>
                        )}
                      </div>
                    }
                  >
                    {compareMode && (
                      <td className="px-3 py-3 text-center">
                        <button onClick={(e) => { e.stopPropagation(); }} className="text-[#5a5a6e] hover:text-green-400 transition-colors">
                          {selectedForCompare?.has(team.teamName) ? <CheckSquare className="w-4 h-4 text-green-400" /> : <Square className="w-4 h-4" />}
                        </button>
                      </td>
                    )}
                    <td className="px-4 py-3 text-center"><RankBadge index={index} /></td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-[#f0f0f5]">{team.teamName}</span>
                        {team.badges?.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap">
                            {team.badges.slice(0, 2).map((badge: string) => (<span key={badge} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#1a1a24] border border-[#2a2a3a] text-[10px] text-[#8a8a9e]"><BadgeIcon badge={badge} />{badge}</span>))}
                            {team.badges.length > 2 && <span className="text-[10px] text-[#5a5a6e]">+{team.badges.length - 2}</span>}
                          </div>
                        )}
                      </div>
                    </td>
                    {!selectedDate && <td className="px-4 py-3 text-sm text-[#8a8a9e]">{team.date?.split("-")[2]}/{team.date?.split("-")[1]}</td>}
                    {[team.q1Pos, team.q2Pos, team.q3Pos].map((pos: number, i: number) => (
                      <td key={i} className={`px-4 py-3 text-center ${getPosBg(pos)}`}>
                        <span className={`text-sm font-medium ${getPosColor(pos)}`}>{pos ?? "-"}</span>
                        {pos && pos <= 3 && <span className="ml-1 text-xs">{pos === 1 ? "🥇" : pos === 2 ? "🥈" : "🥉"}</span>}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-center text-sm text-[#8a8a9e]">{team.streak > 0 ? <span className="inline-flex items-center gap-1">{team.streak >= 3 && <Flame className="w-3.5 h-3.5 text-orange-400" />}{team.streak}</span> : "-"}</td>
                    <td className="px-4 py-3 text-center text-sm text-[#8a8a9e]">{team.avgPosition > 0 ? team.avgPosition : "-"}</td>
                    <td className="px-4 py-3 text-center"><div className="flex flex-col items-center gap-1"><Sparkline data={team.sparkline} /><TrendIcon trend={team.trend} /></div></td>
                    <td className="px-4 py-3 text-center bg-yellow-500/5"><span className="text-sm font-bold text-yellow-400">{team.totalPosPoints}</span></td>
                    <td className="px-4 py-3 text-center"><span className="text-sm text-[#8a8a9e]">{team.totalKills}</span></td>
                    <td className="px-4 py-3 text-center bg-red-500/5"><span className="text-sm font-bold text-red-400">{team.totalKillPoints}</span></td>
                    <td className="px-4 py-3 text-center bg-green-500/5"><span className="text-lg font-bold text-green-400">{team.totalPoints}</span></td>
                  </ExpandableRow>
                )})}
              </tbody>
            </table>
          </div>
          {sortedStats?.length === 0 && <EmptyState icon={<BarChart3 className="w-12 h-12" />} title="Nenhum resultado encontrado" subtitle={selectedDate ? "Nenhum dado para esta data" : selectedMonth ? "Nenhum dado para este mes" : "Nenhum dado disponivel"} />}
        </div>
      )}

      {/* Legenda */}
      <div className="grid md:grid-cols-3 gap-4 text-sm">
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
          <h4 className="font-bold text-[#f0f0f5] mb-3 flex items-center gap-2"><Trophy className="w-4 h-4 text-yellow-400" /> Pontuacao por Posicao</h4>
          <div className="grid grid-cols-5 gap-x-2 gap-y-1 text-xs">{Object.entries(POSITION_POINTS).map(([pos, pts]) => (<div key={pos} className="flex justify-between text-[#8a8a9e]"><span>{pos}º</span><span className="font-bold text-yellow-400">{pts}pts</span></div>))}</div>
        </div>
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
          <h4 className="font-bold text-[#f0f0f5] mb-3 flex items-center gap-2"><Target className="w-4 h-4 text-red-400" /> Pontuacao por Kill</h4>
          <p className="text-[#8a8a9e] text-xs">Cada kill vale <span className="font-bold text-red-400">{KILL_POINTS} ponto</span>.<br />Total de kills do time × {KILL_POINTS} = Pontos de Kill</p>
        </div>
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
          <h4 className="font-bold text-[#f0f0f5] mb-3 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-green-400" /> Calculo do Total</h4>
          <p className="text-[#8a8a9e] text-xs"><span className="text-yellow-400">Pts Posicao</span> + <span className="text-red-400">Pts Kill</span> = <span className="text-green-400 font-bold">Total</span></p>
        </div>
      </div>

      {/* Agenda */}
      {scheduleList && scheduleList.length > 0 && (
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2a2a3a]"><h3 className="font-bold text-[#f0f0f5] flex items-center gap-2"><Calendar className="w-5 h-5 text-blue-400" /> Proximos Xtreinos</h3></div>
          <div className="divide-y divide-[#2a2a3a]">
            {scheduleList.filter((s: any) => s.status === "scheduled").slice(0, 5).map((s: any) => (
              <div key={s.id} className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-4"><span className="w-2 h-2 rounded-full bg-blue-400" /><span className="text-sm text-[#f0f0f5]">{s.date}</span><span className="text-xs text-[#5a5a6e]">{s.dayOfWeek}</span></div>
                <span className="text-sm text-[#8a8a9e] flex items-center gap-1"><Clock className="w-3 h-3" /> {s.timeBr}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <ComparisonBar players={comparisonTeams?.map((t: any) => ({ name: t.teamName, stats: [{ label: "Kills", value: t.totalKills, color: "text-green-400" }, { label: "Total", value: t.totalPoints, color: "text-green-400" }, { label: "Pos", value: t.totalPosPoints, color: "text-yellow-400" }] }))} onRemove={() => {}} onClear={clearCompare} />
    </div>
  );
}