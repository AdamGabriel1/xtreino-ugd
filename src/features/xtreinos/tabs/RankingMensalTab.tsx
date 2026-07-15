// ============================================================
// RankingMensalTab.tsx
// ============================================================

import {
  Calendar,
  TrendingUp,
  BarChart2,
  Minimize2,
  Maximize2,
} from "lucide-react";
import {
  SummaryCards,
  FilterBar,
  SearchInput,
  LoadingSpinner,
  ComparisonBar,
  PodiumCard,
} from "@/components/shared";
import { getMonthName, type SortField } from "@/hooks/xtreinos/xtreino-shared";
import { buildSummaryCards } from "./xtreino-shared-components";
import { RankingTable } from "./RankingTable";
import { RankingLegend } from "./RankingLegend";
import { useCompactMode } from "./xtreino-ousado";
import { useRankingMensalTab } from "@/hooks/xtreinos/useXtreinoTabs";

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function RankingMensalTab() {
  const {
    isLoading, sortBy, sortDir, handleSort, search, setSearch, selectedMonth, setSelectedMonth,
    compareMode, setCompareMode, selectedForCompare, toggleCompare, clearCompare, expandedTeam, setExpandedTeam,
    availableMonths, filteredResults, finalRanking, top3, comparisonTeams, totalXtreinosUnicos,
    teamNameToIdMap, getTeamPlayers, monthTeamRanking, clearFilters, hasFilters,
  } = useRankingMensalTab();

  const { isCompact, toggle: toggleCompact } = useCompactMode();
  const summaryCards = buildSummaryCards(monthTeamRanking, totalXtreinosUnicos);

  return (
    <div className={`space-y-6 ${comparisonTeams.length >= 2 ? "pb-48" : ""}`}>
      <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-emerald-400" />
          <label className="text-sm font-medium text-[#f0f0f5]">Selecionar Mes:</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-emerald-500/50 min-w-[200px]"
          >
            {availableMonths.map((m) => (
              <option key={m} value={m}>{getMonthName(m)}</option>
            ))}
          </select>
          {selectedMonth && (
            <span className="text-xs text-[#5a5a6e]">{filteredResults.length} resultados</span>
          )}
        </div>
      </div>

      <FilterBar hasFilters={hasFilters} onClear={clearFilters}>
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar equipe..." minWidth="200px" />
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#5a5a6e]" />
          <select
            value={sortBy}
            onChange={(e) => handleSort(e.target.value as SortField)}
            className="px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50 min-w-[160px]"
          >
            <option value="total">Ordenar: Total Geral</option>
            <option value="kills">Ordenar: Kills Totais</option>
            <option value="pos">Ordenar: Pts Posicao</option>
            <option value="xtreinos">Ordenar: X-Treinos Jogados</option>
            <option value="avgPos">Ordenar: Media Pos</option>
            <option value="consistency">Ordenar: Consistencia</option>
            <option value="streak">Ordenar: Streak</option>
          </select>
        </div>
        
        <button
          onClick={toggleCompact}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
            isCompact ? "bg-purple-500/10 border-purple-500/30 text-purple-400" : "bg-[#1a1a24] border-[#2a2a3a] text-[#5a5a6e] hover:text-[#f0f0f5]"
          }`}
        >
          {isCompact ? <Maximize2 className="w-4 h-4 inline mr-1.5" /> : <Minimize2 className="w-4 h-4 inline mr-1.5" />}
          {isCompact ? "Detalhado" : "Compacto"}
        </button>

        <button
          onClick={() => { setCompareMode((m) => !m); clearCompare(); }}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
            compareMode ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-[#1a1a24] border-[#2a2a3a] text-[#5a5a6e] hover:text-[#f0f0f5]"
          }`}
        >
          <BarChart2 className="w-4 h-4 inline mr-1.5" /> Comparar
        </button>
      </FilterBar>

      {isLoading && <LoadingSpinner text="Carregando ranking mensal..." />}
      {!isLoading && selectedMonth && <SummaryCards cards={summaryCards} columns={5} />}

      {!isLoading && selectedMonth && top3.length === 3 && (
        <div>
          <h3 className="text-sm font-medium text-[#8a8a9e] mb-3 flex items-center gap-2">🏆 Podio</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {top3.map((t, i) => (
              <PodiumCard
                key={t.teamName}
                name={t.teamName}
                rank={i}
                stats={[
                  { label: "Kills", value: t.totalKills, color: "text-green-400" },
                  { label: "XTs", value: t.xtreinosPlayed },
                  { label: "Media", value: t.avgPosition },
                ]}
                streak={t.streak >= 5 ? t.streak : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {!isLoading && selectedMonth && (
        <RankingTable
          isCompact={isCompact}
          teams={finalRanking}
          compareMode={compareMode}
          selectedForCompare={selectedForCompare}
          onToggleCompare={toggleCompare}
          expandedTeam={expandedTeam}
          onToggleExpand={setExpandedTeam}
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSort}
          getTeamPlayers={getTeamPlayers}
          title={`Ranking Mensal — ${getMonthName(selectedMonth)}`}
          flameThreshold={5}
          teamNameToIdMap={new Map(Array.from(teamNameToIdMap.entries()).map(([k, v]) => [k, v.teamId]))}
          clanNameToIdMap={undefined}
        />
      )}

      <RankingLegend />

      <ComparisonBar
        players={comparisonTeams.map((t) => ({
          name: t.teamName,
          stats: [
            { label: "Kills", value: t.totalKills, color: "text-green-400" },
            { label: "Total", value: t.totalPoints, color: "text-green-400" },
            { label: "Pos", value: t.totalPosPoints, color: "text-yellow-400" },
          ],
        }))}
        onRemove={toggleCompare}
        onClear={() => clearCompare()}
      />
    </div>
  );
}