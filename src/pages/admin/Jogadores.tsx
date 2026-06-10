import { useState, useMemo } from "react";
import {
  Trophy,
  Medal,
  Target,
  Calendar,
  Clock,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  X,
  BarChart3,
  Swords,
  TrendingUp,
  Users,
  Award,
  ArrowLeft,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import AdminLayout from "@/layout/AdminLayout";
import {
  useXtreinoCalculations,
  calcKillPoints,
} from "../../hooks/useXtreinoCalculations";

type SortField = "totalKills" | "participations" | "avgKills" | "q1Kills" | "q2Kills" | "q3Kills";
type SortDir = "asc" | "desc";

export default function Jogadores() {
  const [search, setSearch] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("totalKills");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Filtros de mês e dia do xtreino
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");

  // Queries
  const { data: playersList, isLoading: playersLoading } = trpc.players.list.useQuery(
    search ? { search } : undefined
  );
  const { data: teamsList } = trpc.teams.list.useQuery();
  const { data: allPlayerStats, isLoading: statsLoading } = trpc.xtreinos.listPlayerStats.useQuery();
  const { data: playerDetail } = trpc.players.getById.useQuery(
    { id: selectedPlayer ? parseInt(selectedPlayer) : 0 },
    { enabled: !!selectedPlayer && !isNaN(parseInt(selectedPlayer)) }
  );

  // Hook de cálculos
  const {
    playerAccumulated,
    playerXtreinoStats,
    availableMonths,
    availableDates,
    periodSummary,
  } = useXtreinoCalculations({
    playerStats: allPlayerStats ?? [],
    selectedMonth,
    selectedDate,
  });

  // Merge com dados do DB (times, etc)
  const enrichedPlayers = useMemo(() => {
    if (!playersList) return [];

    return playersList.map((p) => {
      const nameKey = p.nickname.trim().toLowerCase();
      const stats = playerAccumulated.find(
        (s) => s.playerName.trim().toLowerCase() === nameKey
      );

      return {
        id: p.id,
        nickname: p.nickname,
        teamId: p.teamId,
        teamName: teamsList?.find((t) => t.id === p.teamId)?.name ?? "Sem equipe",
        // Stats do período filtrado (ou do DB se não tem filtro)
        totalKills: stats?.totalKills ?? p.xtreinoKills ?? 0,
        q1Kills: stats?.totalQ1Kills ?? 0,
        q2Kills: stats?.totalQ2Kills ?? 0,
        q3Kills: stats?.totalQ3Kills ?? 0,
        participations: stats?.participations ?? p.xtreinoParticipations ?? 0,
        avgKills: stats?.avgKills ?? 0,
        killPoints: calcKillPoints(stats?.totalKills ?? p.xtreinoKills ?? 0),
        xtreinoDates: stats?.xtreinoDates ?? [],
      };
    });
  }, [playersList, playerAccumulated, teamsList]);

  // Ordenar
  const sortedPlayers = useMemo(() => {
    return [...enrichedPlayers].sort((a, b) => {
      const aVal = a[sortField] ?? 0;
      const bVal = b[sortField] ?? 0;
      return sortDir === "desc" ? bVal - aVal : aVal - bVal;
    });
  }, [enrichedPlayers, sortField, sortDir]);

  // Stats do jogador selecionado (do hook)
  const selectedPlayerStats = useMemo(() => {
    if (!selectedPlayer) return null;
    const nameKey = selectedPlayer.toLowerCase();
    return playerXtreinoStats.filter(
      (s) => s.playerName.toLowerCase() === nameKey
    );
  }, [selectedPlayer, playerXtreinoStats]);

  // ===== HELPERS =====
  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-5 h-5 text-green-400" />;
    if (index === 1) return <Medal className="w-5 h-5 text-green-300" />;
    if (index === 2) return <Medal className="w-5 h-5 text-green-500" />;
    return <span className="w-5 text-center text-sm font-bold text-[#5a5a6e]">{index + 1}</span>;
  };

  const getRankStyle = (index: number) => {
    if (index === 0) return "bg-gradient-to-r from-green-500/10 to-transparent border-l-2 border-green-400";
    if (index === 1) return "bg-gradient-to-r from-green-400/10 to-transparent border-l-2 border-green-300";
    if (index === 2) return "bg-gradient-to-r from-green-600/10 to-transparent border-l-2 border-green-500";
    return "hover:bg-[#1a1a24]";
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "desc" ? "asc" : "desc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const SortHeader = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 text-xs font-medium text-[#5a5a6e] uppercase hover:text-[#f0f0f5] transition-colors"
    >
      {label}
      {sortField === field && (
        sortDir === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
      )}
    </button>
  );

  const isLoading = playersLoading || statsLoading;

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#0a0a0f]">
        {/* Header */}
        <div className="bg-[#12121a] border-b border-[#2a2a3a]">
          <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-8 h-8 text-green-400" />
              <h1 className="text-3xl md:text-4xl font-extrabold text-[#f0f0f5]">
                Ranking de Jogadores
              </h1>
            </div>
            <p className="text-[#8a8a9e]">
              Estatísticas e classificação dos jogadores nos xtreinos
            </p>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6 space-y-6">
          {/* ===== FILTROS ===== */}
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
                    placeholder="Buscar jogador..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm placeholder-[#5a5a6e] focus:outline-none focus:border-green-500/50 min-w-[200px]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#5a5a6e]" />
                  <select
                    value={selectedMonth}
                    onChange={(e) => { setSelectedMonth(e.target.value); setSelectedDate(""); }}
                    className="px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50 min-w-[140px]"
                  >
                    <option value="">Todos os meses</option>
                    {availableMonths.map((m) => (
                      <option key={m} value={m}>
                        {m.split("-")[1]}/{m.split("-")[0]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#5a5a6e]" />
                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    disabled={!selectedMonth}
                    className="px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50 min-w-[140px] disabled:opacity-40"
                  >
                    <option value="">Todos os dias</option>
                    {availableDates.map((d) => (
                      <option key={d} value={d}>
                        {d.split("-")[2]}/{d.split("-")[1]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {(selectedMonth || selectedDate || search) && (
                <button
                  onClick={() => { setSelectedMonth(""); setSelectedDate(""); setSearch(""); }}
                  className="text-xs text-green-400 hover:text-green-300 transition-colors"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          </div>

          {/* ===== CARDS DE RESUMO ===== */}
          {periodSummary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Swords className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-[#5a5a6e] uppercase">Total Kills</span>
                </div>
                <p className="text-2xl font-bold text-green-400">{periodSummary.totalKills}</p>
              </div>
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-[#5a5a6e] uppercase">Jogadores</span>
                </div>
                <p className="text-2xl font-bold text-[#f0f0f5]">{periodSummary.uniquePlayers}</p>
              </div>
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-[#5a5a6e] uppercase">XTreinos</span>
                </div>
                <p className="text-2xl font-bold text-[#f0f0f5]">{periodSummary.uniqueDates}</p>
              </div>
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-[#5a5a6e] uppercase">Pts Kills</span>
                </div>
                <p className="text-2xl font-bold text-green-400">
                  {calcKillPoints(periodSummary.totalKills)}
                </p>
              </div>
            </div>
          )}

          {/* ===== LOADING ===== */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[#5a5a6e]">Carregando jogadores...</p>
            </div>
          )}

          {/* ===== DETALHE DO JOGADOR ===== */}
          {selectedPlayer && playerDetail && (
            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedPlayer(null)}
                    className="p-2 rounded-lg hover:bg-[#1a1a24] text-[#5a5a6e] hover:text-[#f0f0f5] transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Target className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#f0f0f5]">{playerDetail.nickname}</h2>
                    <p className="text-sm text-[#8a8a9e]">
                      {teamsList?.find((t) => t.id === playerDetail.teamId)?.name ?? "Sem equipe"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPlayer(null)}
                  className="p-2 rounded-lg hover:bg-[#1a1a24] text-[#5a5a6e] hover:text-[#f0f0f5] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-[#1a1a24] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-[#5a5a6e]">K/D</span>
                  </div>
                  <p className="text-xl font-bold text-[#f0f0f5]">
                    {playerDetail.deaths > 0 
                      ? (playerDetail.kills / playerDetail.deaths).toFixed(2) 
                      : playerDetail.kills}
                  </p>
                </div>
                <div className="bg-[#1a1a24] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Swords className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-[#5a5a6e]">Kills</span>
                  </div>
                  <p className="text-xl font-bold text-[#f0f0f5]">{playerDetail.kills}</p>
                </div>
                <div className="bg-[#1a1a24] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-[#5a5a6e]">XT Kills</span>
                  </div>
                  <p className="text-xl font-bold text-green-400">
                    {playerDetail.totalXtreinoKills ?? 0}
                  </p>
                </div>
                <div className="bg-[#1a1a24] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-[#5a5a6e]">XT Partic.</span>
                  </div>
                  <p className="text-xl font-bold text-[#f0f0f5]">
                    {playerDetail.xtreinoParticipations ?? 0}
                  </p>
                </div>
              </div>

              {/* Histórico de XTreinos do período filtrado */}
              {selectedPlayerStats && selectedPlayerStats.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-[#f0f0f5] mb-3 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-green-400" />
                    Histórico de XTreinos
                    {selectedMonth && (
                      <span className="text-xs font-normal text-[#5a5a6e]">
                        — {selectedMonth.split("-")[1]}/{selectedMonth.split("-")[0]}
                      </span>
                    )}
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#2a2a3a]">
                          <th className="px-4 py-2 text-left text-xs font-medium text-[#5a5a6e]">Data</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-[#5a5a6e]">Time</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-[#5a5a6e]">Q1</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-[#5a5a6e]">Q2</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-[#5a5a6e]">Q3</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-[#5a5a6e]">Total</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-[#5a5a6e]">Pts</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2a2a3a]">
                        {selectedPlayerStats.map((stat) => (
                          <tr key={`${stat.date}-${stat.xtreinoId}`} className="hover:bg-[#1a1a24]">
                            <td className="px-4 py-2 text-sm text-[#f0f0f5]">{stat.date}</td>
                            <td className="px-4 py-2 text-sm text-[#8a8a9e]">{stat.teamName}</td>
                            <td className="px-4 py-2 text-sm text-center text-[#8a8a9e]">{stat.q1Kills}</td>
                            <td className="px-4 py-2 text-sm text-center text-[#8a8a9e]">{stat.q2Kills}</td>
                            <td className="px-4 py-2 text-sm text-center text-[#8a8a9e]">{stat.q3Kills}</td>
                            <td className="px-4 py-2 text-sm text-center text-green-400 font-bold">{stat.totalKills}</td>
                            <td className="px-4 py-2 text-sm text-center text-green-400">{stat.killPoints}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===== TOP 3 PODIUM ===== */}
          {!selectedPlayer && sortedPlayers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sortedPlayers.slice(0, 3).map((p, i) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPlayer(p.nickname)}
                  className={`rounded-xl border border-[#2a2a3a] p-6 cursor-pointer transition-all hover:-translate-y-1 ${
                    i === 0
                      ? "bg-gradient-to-b from-green-500/10 to-[#12121a] border-green-400/30"
                      : i === 1
                      ? "bg-gradient-to-b from-green-400/10 to-[#12121a] border-green-300/30"
                      : "bg-gradient-to-b from-green-600/10 to-[#12121a] border-green-500/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                        i === 0
                          ? "bg-green-400/20 text-green-400"
                          : i === 1
                          ? "bg-green-300/20 text-green-300"
                          : "bg-green-500/20 text-green-500"
                      }`}
                    >
                      {i + 1}º
                    </div>
                    <Target
                      className={`w-8 h-8 ${
                        i === 0
                          ? "text-green-400/50"
                          : i === 1
                          ? "text-green-300/50"
                          : "text-green-500/50"
                      }`}
                    />
                  </div>
                  <h3 className="text-lg font-bold text-[#f0f0f5] mb-1">{p.nickname}</h3>
                  <p className="text-sm text-[#8a8a9e] mb-3">{p.teamName}</p>
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-xs text-[#5a5a6e]">Kills XT</p>
                      <p
                        className={`text-2xl font-bold ${
                          i === 0
                            ? "text-green-400"
                            : i === 1
                            ? "text-green-300"
                            : "text-green-500"
                        }`}
                      >
                        {p.totalKills}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#5a5a6e]">Partic.</p>
                      <p className="text-lg font-bold text-[#f0f0f5]">{p.participations}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#5a5a6e]">Média</p>
                      <p className="text-lg font-bold text-[#f0f0f5]">{p.avgKills}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ===== TABELA DE RANKING ===== */}
          {!selectedPlayer && (
            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center justify-between">
                <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Classificação Geral
                  {selectedMonth && (
                    <span className="text-sm font-normal text-[#5a5a6e]">
                      — {selectedMonth.split("-")[1]}/{selectedMonth.split("-")[0]}
                      {selectedDate && ` (${selectedDate.split("-")[2]}/${selectedDate.split("-")[1]})`}
                    </span>
                  )}
                </h3>
                <span className="text-xs text-[#5a5a6e]">
                  {sortedPlayers.length} jogadores
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2a2a3a] bg-[#0a0a0f]">
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase w-16">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">
                        Jogador
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">
                        Equipe
                      </th>
                      <th className="px-6 py-3 text-center">
                        <SortHeader field="totalKills" label="Kills XT" />
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
                      <th className="px-6 py-3 text-center">
                        <SortHeader field="participations" label="XTreinos" />
                      </th>
                      <th className="px-6 py-3 text-center">
                        <SortHeader field="avgKills" label="Média" />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2a2a3a]">
                    {sortedPlayers.map((p, i) => (
                      <tr
                        key={p.id}
                        className={`${getRankStyle(i)} cursor-pointer transition-colors`}
                        onClick={() => setSelectedPlayer(p.nickname)}
                      >
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">{getRankIcon(i)}</div>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                              <Target className="w-4 h-4 text-green-400" />
                            </div>
                            <span className="text-sm font-bold text-[#f0f0f5]">{p.nickname}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-sm text-[#8a8a9e]">{p.teamName}</td>
                        <td className="px-6 py-3 text-sm text-center font-bold text-green-400">
                          {p.totalKills}
                        </td>
                        <td className="px-6 py-3 text-sm text-center text-[#8a8a9e]">{p.q1Kills}</td>
                        <td className="px-6 py-3 text-sm text-center text-[#8a8a9e]">{p.q2Kills}</td>
                        <td className="px-6 py-3 text-sm text-center text-[#8a8a9e]">{p.q3Kills}</td>
                        <td className="px-6 py-3 text-sm text-center text-[#8a8a9e]">
                          {p.participations}
                        </td>
                        <td className="px-6 py-3 text-sm text-center text-[#8a8a9e]">
                          {p.avgKills}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {sortedPlayers.length === 0 && !isLoading && (
                <div className="px-6 py-16 text-center">
                  <Target className="w-12 h-12 mx-auto mb-4 text-[#2a2a3a]" />
                  <p className="text-[#5a5a6e] text-lg font-medium">Nenhum jogador encontrado</p>
                  <p className="text-[#3a3a4e] text-sm mt-1">
                    {search || selectedMonth
                      ? "Tente ajustar os filtros"
                      : "Nenhum dado disponível"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}