import { useState, useMemo } from "react";
import {
  Target,
  Filter,
  Search,
  Calendar,
  TrendingUp,
  BarChart3,
  Swords,
  Users,
  ChevronDown,
  ChevronUp,
  Trophy,
  Medal,
  Award,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import {
  calcPlayerAccumulatedStats,
  type XtreinoPlayerStat,
} from "../../hooks/useXtreinoCalculations.js";

// ============================================================
// TIPOS LOCAIS
// ============================================================

interface XTreinoOption {
  id: number;
  name: string;
  date: string;
}

interface PlayerRankingRawStat {
  id: number;
  xtreinoId: number;
  date: string;
  teamName: string;
  playerName: string;
  q1Kills: number;
  q2Kills: number;
  q3Kills: number;
  totalKills: number;
}

interface PlayerRankingDisplay {
  playerName: string;
  teamName: string | null;
  totalKills: number;
  totalQ1Kills: number;
  totalQ2Kills: number;
  totalQ3Kills: number;
  participations: number;
  avgKills: number;
  xtreinoDates: string[];
}

type PlayerRankingStat = PlayerRankingRawStat | PlayerRankingDisplay;

type RankingSortField =
  | "totalKills"
  | "q1Kills"
  | "q2Kills"
  | "q3Kills"
  | "participations"
  | "avgKills"
  | "date";

interface RankingSummary {
  totalPlayers: number;
  totalKills: number;
  totalQ1: number;
  totalQ2: number;
  totalQ3: number;
  totalRecords: number;
}

// ============================================================
// FUNÇÕES DE CÁLCULO PURAS
// ============================================================

function calcPlayerRankingAccumulated(
  rawStats: PlayerRankingRawStat[]
): PlayerRankingDisplay[] {
  const accumulated = calcPlayerAccumulatedStats(rawStats as XtreinoPlayerStat[]);

  return accumulated.map((p) => ({
    playerName: p.playerName,
    teamName: p.teamName,
    totalKills: p.totalKills,
    totalQ1Kills: p.totalQ1Kills,
    totalQ2Kills: p.totalQ2Kills,
    totalQ3Kills: p.totalQ3Kills,
    participations: p.participations,
    avgKills: p.avgKills,
    xtreinoDates: p.xtreinoDates,
  }));
}

function filterStatsByXtreino(
  rawStats: PlayerRankingRawStat[],
  xtreinoId: number | null
): PlayerRankingRawStat[] {
  if (!xtreinoId) return rawStats;
  return rawStats.filter((s) => s.xtreinoId === xtreinoId);
}

function searchPlayerStats<T extends { playerName: string; teamName?: string | null }>(
  stats: T[],
  query: string
): T[] {
  if (!query.trim()) return stats;
  const q = query.toLowerCase();
  return stats.filter(
    (p) =>
      p.playerName.toLowerCase().includes(q) ||
      (p.teamName?.toLowerCase() ?? "").includes(q)
  );
}

function sortRankingStats(
  stats: PlayerRankingStat[],
  field: RankingSortField,
  direction: "asc" | "desc"
): PlayerRankingStat[] {
  return [...stats].sort((a, b) => {
    if (field === "date") {
      const aDate = "date" in a ? (a.date ?? "") : "";
      const bDate = "date" in b ? (b.date ?? "") : "";
      return direction === "desc" ? bDate.localeCompare(aDate) : aDate.localeCompare(bDate);
    }

    const aVal = (field in a ? (a as unknown as Record<string, number>)[field] : 0) ?? 0;
    const bVal = (field in b ? (b as unknown as Record<string, number>)[field] : 0) ?? 0;
    return direction === "desc" ? bVal - aVal : aVal - bVal;
  });
}

function calcRankingSummary(
  stats: PlayerRankingStat[]
): RankingSummary | null {
  if (!stats.length) return null;

  const first = stats[0];
  const isAccumulated = "participations" in first;

  return {
    totalPlayers: new Set(stats.map((p) => p.playerName)).size,
    totalKills: stats.reduce((sum, p) => sum + (p.totalKills || 0), 0),
    totalQ1: stats.reduce((sum, p) => {
      const val = "totalQ1Kills" in p ? p.totalQ1Kills : "q1Kills" in p ? p.q1Kills : 0;
      return sum + (val || 0);
    }, 0),
    totalQ2: stats.reduce((sum, p) => {
      const val = "totalQ2Kills" in p ? p.totalQ2Kills : "q2Kills" in p ? p.q2Kills : 0;
      return sum + (val || 0);
    }, 0),
    totalQ3: stats.reduce((sum, p) => {
      const val = "totalQ3Kills" in p ? p.totalQ3Kills : "q3Kills" in p ? p.q3Kills : 0;
      return sum + (val || 0);
    }, 0),
    totalRecords: isAccumulated
      ? (stats as PlayerRankingDisplay[]).reduce((sum, p) => sum + p.participations, 0)
      : stats.length,
  };
}

// ============================================================
// COMPONENTE
// ============================================================

export default function JogadoresTab() {
  const [search, setSearch] = useState("");
  const [selectedXt, setSelectedXt] = useState<number | null>(null);
  const [sortField, setSortField] = useState<RankingSortField>("totalKills");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // tRPC direto — igual o XTreinosTab faz
  const { data: xtreinosList } = trpc.players.listXtreinos.useQuery();
  const { data: rawStatsData } = trpc.players.rankingStats.useQuery();

  const rawStats = (rawStatsData ?? []) as PlayerRankingRawStat[];
  const isAccumulated = !selectedXt;
  const isLoading = !xtreinosList || !rawStatsData;

  // Cálculos com useMemo — igual o XTreinosTab faz
  const accumulatedStats = useMemo(
    () => calcPlayerRankingAccumulated(rawStats),
    [rawStats]
  );

  const singleXtreinoStats = useMemo(
    () => filterStatsByXtreino(rawStats, selectedXt),
    [rawStats, selectedXt]
  );

  const baseStats: PlayerRankingStat[] = isAccumulated
    ? accumulatedStats
    : singleXtreinoStats;

  const searchedStats = useMemo(
    () => searchPlayerStats(baseStats, search),
    [baseStats, search]
  );

  const displayStats = useMemo(
    () => sortRankingStats(searchedStats, sortField, sortDir),
    [searchedStats, sortField, sortDir]
  );

  const summary = useMemo(
    () => calcRankingSummary(displayStats),
    [displayStats]
  );

  const handleSort = (field: RankingSortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const SortHeader = ({ field, label }: { field: RankingSortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 text-xs font-medium text-[#5a5a6e] uppercase hover:text-[#f0f0f5] transition-colors justify-center"
    >
      {label}
      {sortField === field &&
        (sortDir === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />)}
    </button>
  );

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-5 h-5 text-yellow-400" />;
    if (index === 1) return <Medal className="w-5 h-5 text-gray-300" />;
    if (index === 2) return <Award className="w-5 h-5 text-amber-600" />;
    return (
      <span className="w-5 h-5 flex items-center justify-center text-xs font-bold text-[#5a5a6e]">
        {index + 1}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div className="flex items-center gap-2 text-[#8a8a9e]">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filtros:</span>
          </div>

          <div className="flex flex-wrap gap-3 flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5a6e]" />
              <input
                type="text"
                placeholder="Buscar jogador ou time..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm placeholder-[#5a5a6e] focus:outline-none focus:border-green-500/50 min-w-[220px]"
              />
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#5a5a6e]" />
              <select
                value={selectedXt ?? ""}
                onChange={(e) => setSelectedXt(e.target.value ? parseInt(e.target.value) : null)}
                className="px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50 min-w-[180px]"
              >
                <option value="">Todos os xtreinos (acumulado)</option>
                {xtreinosList?.map((x: XTreinoOption) => (
                  <option key={x.id} value={x.id}>
                    {x.name} ({x.date})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(search || selectedXt) && (
            <button
              onClick={() => {
                setSearch("");
                setSelectedXt(null);
              }}
              className="text-xs text-green-400 hover:text-green-300 transition-colors"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#5a5a6e]">Carregando estatísticas...</p>
        </div>
      )}

      {/* Cards de Resumo */}
      {summary && !isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-green-400" />
              <span className="text-xs text-[#5a5a6e] uppercase">Jogadores</span>
            </div>
            <p className="text-2xl font-bold text-[#f0f0f5]">{summary.totalPlayers}</p>
          </div>
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Swords className="w-4 h-4 text-green-400" />
              <span className="text-xs text-[#5a5a6e] uppercase">Total Kills</span>
            </div>
            <p className="text-2xl font-bold text-green-400">{summary.totalKills}</p>
          </div>
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-green-400" />
              <span className="text-xs text-[#5a5a6e] uppercase">Q1 + Q2 + Q3</span>
            </div>
            <p className="text-2xl font-bold text-[#f0f0f5]">
              {summary.totalQ1}/{summary.totalQ2}/{summary.totalQ3}
            </p>
          </div>
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-xs text-[#5a5a6e] uppercase">
                {isAccumulated ? "Participações" : "Registros"}
              </span>
            </div>
            <p className="text-2xl font-bold text-[#f0f0f5]">{summary.totalRecords}</p>
          </div>
        </div>
      )}

      {/* Tabela Principal */}
      {!isLoading && (
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center justify-between">
            <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              {selectedXt ? "Estatísticas do XTreino" : "Ranking Geral de Jogadores"}
              {selectedXt && xtreinosList?.find((x: XTreinoOption) => x.id === selectedXt) && (
                <span className="text-sm font-normal text-[#5a5a6e]">
                  — {xtreinosList.find((x: XTreinoOption) => x.id === selectedXt)?.date}
                </span>
              )}
            </h3>
            <span className="text-xs text-[#5a5a6e]">
              {displayStats.length} registros
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a2a3a] bg-[#0a0a0f]">
                  <th className="px-4 py-3 text-center w-12">
                    <span className="text-xs font-medium text-[#5a5a6e] uppercase">#</span>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">
                    Jogador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">
                    Time
                  </th>
                  {isAccumulated && (
                    <>
                      <th className="px-6 py-3 text-center">
                        <SortHeader field="participations" label="XTs" />
                      </th>
                      <th className="px-6 py-3 text-center">
                        <SortHeader field="avgKills" label="Média" />
                      </th>
                    </>
                  )}
                  <th className="px-6 py-3 text-center">
                    <SortHeader field="q1Kills" label="Q1" />
                  </th>
                  <th className="px-6 py-3 text-center">
                    <SortHeader field="q2Kills" label="Q2" />
                  </th>
                  <th className="px-6 py-3 text-center">
                    <SortHeader field="q3Kills" label="Q3" />
                  </th>
                  <th className="px-6 py-3 text-center bg-green-500/5">
                    <SortHeader field="totalKills" label="Total" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a3a]">
                {displayStats.map((p: PlayerRankingStat, index: number) => {
                  const isAcc = isAccumulated;
                  const acc = p as PlayerRankingDisplay;
                  const single = p as PlayerRankingRawStat;
                  return (
                    <tr
                      key={`${p.playerName}-${index}`}
                      className={`hover:bg-[#1a1a24] transition-colors ${
                        index === 0
                          ? "bg-gradient-to-r from-yellow-500/5 to-transparent border-l-2 border-yellow-400"
                          : index === 1
                          ? "bg-gradient-to-r from-gray-400/5 to-transparent border-l-2 border-gray-300"
                          : index === 2
                          ? "bg-gradient-to-r from-amber-700/5 to-transparent border-l-2 border-amber-600"
                          : ""
                      }`}
                    >
                      <td className="px-4 py-3 text-center">{getRankIcon(index)}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                            <Target className="w-4 h-4 text-green-400" />
                          </div>
                          <span className="text-sm font-bold text-[#f0f0f5]">
                            {p.playerName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm text-[#8a8a9e]">
                        {p.teamName ?? "—"}
                      </td>
                      {isAcc && (
                        <>
                          <td className="px-6 py-3 text-center text-sm text-[#8a8a9e]">
                            {acc.participations}
                          </td>
                          <td className="px-6 py-3 text-center text-sm text-[#8a8a9e]">
                            {acc.avgKills}
                          </td>
                        </>
                      )}
                      <td className="px-6 py-3 text-center text-sm text-[#8a8a9e]">
                        {isAcc ? acc.totalQ1Kills : single.q1Kills}
                      </td>
                      <td className="px-6 py-3 text-center text-sm text-[#8a8a9e]">
                        {isAcc ? acc.totalQ2Kills : single.q2Kills}
                      </td>
                      <td className="px-6 py-3 text-center text-sm text-[#8a8a9e]">
                        {isAcc ? acc.totalQ3Kills : single.q3Kills}
                      </td>
                      <td className="px-6 py-3 text-center bg-green-500/5">
                        <span className="text-sm font-bold text-green-400">
                          {p.totalKills}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {displayStats.length === 0 && (
            <div className="px-6 py-16 text-center">
              <Target className="w-12 h-12 mx-auto mb-4 text-[#2a2a3a]" />
              <p className="text-[#5a5a6e] text-lg font-medium">
                Nenhuma estatística encontrada
              </p>
              <p className="text-[#3a3a4e] text-sm mt-1">
                {search || selectedXt
                  ? "Tente ajustar os filtros"
                  : "Nenhum dado disponível"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}