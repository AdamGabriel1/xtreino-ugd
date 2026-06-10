import { useState, useMemo } from "react";
import {
  Plus,
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
} from "lucide-react";
import type { XTreino, PlayerStat, PlayerFormData } from "../pages/admin/types";
import { PlayerForm } from "../pages/admin/components/PlayerForm";

interface PlayersTabProps {
  xtreinosList: XTreino[] | undefined;
  allPlayerStats: PlayerStat[] | undefined;
  xtDetail: { playerStats?: PlayerStat[] } | null | undefined;
  selectedXt: number | null;
  showForm: boolean;
  form: PlayerFormData;
  isPending: boolean;
  onSelectXt: (id: number | null) => void;
  onShowForm: () => void;
  onCloseForm: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFormChange: (form: PlayerFormData) => void;
  isAdmin?: boolean;
}

export function PlayersTab({
  xtreinosList,
  allPlayerStats,
  xtDetail,
  selectedXt,
  showForm,
  form,
  isPending,
  onSelectXt,
  onShowForm,
  onCloseForm,
  onSubmit,
  onFormChange,
  isAdmin = false,
}: PlayersTabProps) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<"totalKills" | "q1Kills" | "q2Kills" | "q3Kills" | "date">("totalKills");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const stats = selectedXt
    ? (xtDetail?.playerStats ?? allPlayerStats?.filter((p) => p.xtreinoId === selectedXt) ?? [])
    : (allPlayerStats ?? []);

  const filteredStats = useMemo(() => {
    if (!search.trim()) return stats;
    const q = search.toLowerCase();
    return stats.filter(
      (p) =>
        p.playerName.toLowerCase().includes(q) ||
        p.teamName.toLowerCase().includes(q)
    );
  }, [stats, search]);

  const sortedStats = useMemo(() => {
    return [...filteredStats].sort((a, b) => {
      if (sortField === "date") {
        return sortDir === "desc"
          ? b.date.localeCompare(a.date)
          : a.date.localeCompare(b.date);
      }

      const aVal = a[sortField] ?? 0;
      const bVal = b[sortField] ?? 0;
      return sortDir === "desc" ? bVal - aVal : aVal - bVal;
    });
  }, [filteredStats, sortField, sortDir]);

  const summary = useMemo(() => {
    if (!stats.length) return null;
    return {
      totalPlayers: new Set(stats.map((p) => p.playerName)).size,
      totalKills: stats.reduce((sum, p) => sum + (p.totalKills || 0), 0),
      totalQ1: stats.reduce((sum, p) => sum + (p.q1Kills || 0), 0),
      totalQ2: stats.reduce((sum, p) => sum + (p.q2Kills || 0), 0),
      totalQ3: stats.reduce((sum, p) => sum + (p.q3Kills || 0), 0),
    };
  }, [stats]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "desc" ? "asc" : "desc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const SortHeader = ({
    field,
    label,
    align = "center",
  }: {
    field: typeof sortField;
    label: string;
    align?: "left" | "center";
  }) => (
    <button
      onClick={() => handleSort(field)}
      className={`flex items-center gap-1 text-xs font-medium text-[#5a5a6e] uppercase hover:text-[#f0f0f5] transition-colors ${
        align === "left" ? "justify-start" : "justify-center"
      }`}
    >
      {label}
      {sortField === field &&
        (sortDir === "desc" ? (
          <ChevronDown className="w-3 h-3" />
        ) : (
          <ChevronUp className="w-3 h-3" />
        ))}
    </button>
  );

  const isLoading = !allPlayerStats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#12121a] border-b border-[#2a2a3a]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-8 h-8 text-green-400" />
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#f0f0f5]">
              Estatísticas de Jogadores
            </h1>
          </div>
          <p className="text-[#8a8a9e]">
            {selectedXt
              ? `Dados do xtreino selecionado`
              : "Visualize e gerencie as estatísticas de todos os jogadores"}
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6 space-y-6">
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
                  onChange={(e) => onSelectXt(e.target.value ? parseInt(e.target.value) : null)}
                  className="px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50 min-w-[180px]"
                >
                  <option value="">Todos os xtreinos</option>
                  {xtreinosList?.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.name} ({x.date})
                    </option>
                  ))}
                </select>
              </div>

              {isAdmin && (
                <button
                  onClick={onShowForm}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-all"
                >
                  <Plus className="w-4 h-4" /> Add Jogador
                </button>
              )}
            </div>

            {(search || selectedXt) && (
              <button
                onClick={() => {
                  setSearch("");
                  onSelectXt(null);
                }}
                className="text-xs text-green-400 hover:text-green-300 transition-colors"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>

        {/* Form de adicionar jogador */}
        {isAdmin && showForm && (
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
            <h3 className="font-bold text-[#f0f0f5] mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-green-400" />
              Adicionar Jogador
            </h3>
            <PlayerForm
              form={form}
              isPending={isPending}
              selectedXtId={selectedXt}
              onChange={onFormChange}
              onSubmit={onSubmit}
              onClose={onCloseForm}
            />
          </div>
        )}

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
                <span className="text-xs text-[#5a5a6e] uppercase">Registros</span>
              </div>
              <p className="text-2xl font-bold text-[#f0f0f5]">{sortedStats.length}</p>
            </div>
          </div>
        )}

        {/* Tabela Principal */}
        {!isLoading && (
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center justify-between">
              <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                {selectedXt
                  ? `Estatísticas do XTreino`
                  : "Todas as Estatísticas"}
                {selectedXt && xtreinosList?.find((x) => x.id === selectedXt) && (
                  <span className="text-sm font-normal text-[#5a5a6e]">
                    — {xtreinosList.find((x) => x.id === selectedXt)?.date}
                  </span>
                )}
              </h3>
              <span className="text-xs text-[#5a5a6e]">
                {sortedStats.length} registros
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2a2a3a] bg-[#0a0a0f]">
                    <th className="px-6 py-3 text-left">
                      <SortHeader field="date" label="Data" align="left" />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">
                      Jogador
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">
                      Time
                    </th>
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
                  {sortedStats.map((p, index) => (
                    <tr
                      key={p.id}
                      className={`hover:bg-[#1a1a24] transition-colors ${
                        index === 0
                          ? "bg-gradient-to-r from-green-500/5 to-transparent border-l-2 border-green-400"
                          : index === 1
                          ? "bg-gradient-to-r from-green-400/5 to-transparent border-l-2 border-green-300"
                          : index === 2
                          ? "bg-gradient-to-r from-green-600/5 to-transparent border-l-2 border-green-500"
                          : ""
                      }`}
                    >
                      <td className="px-6 py-3 text-sm text-[#8a8a9e]">{p.date}</td>
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
                      <td className="px-6 py-3 text-sm text-[#8a8a9e]">{p.teamName}</td>
                      <td className="px-6 py-3 text-center text-sm text-[#8a8a9e]">
                        {p.q1Kills}
                      </td>
                      <td className="px-6 py-3 text-center text-sm text-[#8a8a9e]">
                        {p.q2Kills}
                      </td>
                      <td className="px-6 py-3 text-center text-sm text-[#8a8a9e]">
                        {p.q3Kills}
                      </td>
                      <td className="px-6 py-3 text-center bg-green-500/5">
                        <span className="text-sm font-bold text-green-400">
                          {p.totalKills}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {sortedStats.length === 0 && (
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
    </div>
  );
}