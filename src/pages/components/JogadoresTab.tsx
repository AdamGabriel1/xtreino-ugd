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
  Tag,
  History,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import {
  useXtreinoCalculations,
  calcKillPoints,
} from "@/hooks/useXtreinoCalculations";

type SortField = "totalKills" | "participations" | "avgKills" | "q1Kills" | "q2Kills" | "q3Kills";
type SortDir = "asc" | "desc";

export default function JogadoresTab() {
  const [search, setSearch] = useState("");
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [sortField, setSortField] = useState<SortField>("totalKills");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");

  const { data: playersList, isLoading: playersLoading } = trpc.players.list.useQuery(
    search ? { search } : undefined
  );
  const { data: teamsList } = trpc.teams.list.useQuery();
  const { data: allResults } = trpc.xtreinos.listResults.useQuery();
  const { data: allPlayerStats, isLoading: statsLoading } = trpc.xtreinos.listPlayerStats.useQuery();

  const { data: playerDetail, isLoading: detailLoading } = trpc.players.getById.useQuery(
    { id: selectedPlayerId ?? 0 },
    { enabled: !!selectedPlayerId && selectedPlayerId > 0 }
  );

  const {
    playerAccumulated,
    playerXtreinoStats,
    availableMonths,
    availableDates,
    periodSummary,
  } = useXtreinoCalculations({
    results: allResults ?? [],
    playerStats: allPlayerStats ?? [],
    selectedMonth,
    selectedDate,
  });

  const isSingleXtreino = !!selectedDate;

  // Enriched players com aliases
  const enrichedPlayers = useMemo(() => {
    if (!playersList) return [];

    return playersList.map((p) => {
      const nameKey = p.nickname.trim().toLowerCase();
      const aliasKeys = (p.aliases ?? []).map((a: string) => a.trim().toLowerCase());
      const allNicks = [nameKey, ...aliasKeys];

      if (isSingleXtreino) {
        const dayStats = playerXtreinoStats.find(
          (s) => allNicks.includes(s.playerName.trim().toLowerCase()) && s.date === selectedDate
        );

        if (dayStats) {
          return {
            id: p.id,
            nickname: p.nickname,
            aliases: p.aliases ?? [],
            teamId: p.teamId,
            teamName: teamsList?.find((t) => t.id === p.teamId)?.name ?? "Sem equipe",
            totalKills: dayStats.totalKills,
            q1Kills: dayStats.q1Kills,
            q2Kills: dayStats.q2Kills,
            q3Kills: dayStats.q3Kills,
            participations: 1,
            avgKills: dayStats.totalKills,
            killPoints: dayStats.killPoints,
            xtreinoDates: [selectedDate],
          };
        }
        return {
          id: p.id,
          nickname: p.nickname,
          aliases: p.aliases ?? [],
          teamId: p.teamId,
          teamName: teamsList?.find((t) => t.id === p.teamId)?.name ?? "Sem equipe",
          totalKills: 0,
          q1Kills: 0,
          q2Kills: 0,
          q3Kills: 0,
          participations: 0,
          avgKills: 0,
          killPoints: 0,
          xtreinoDates: [],
        };
      }

      // Modo acumulado: busca stats por qualquer nick (atual ou alias)
      const allStats = playerAccumulated.filter(
        (s) => allNicks.includes(s.playerName.trim().toLowerCase())
      );

      // Soma stats de todos os nicks
      const totalKills = allStats.reduce((sum, s) => sum + (s.totalKills ?? 0), 0);
      const totalQ1 = allStats.reduce((sum, s) => sum + (s.totalQ1Kills ?? 0), 0);
      const totalQ2 = allStats.reduce((sum, s) => sum + (s.totalQ2Kills ?? 0), 0);
      const totalQ3 = allStats.reduce((sum, s) => sum + (s.totalQ3Kills ?? 0), 0);
      const totalPart = allStats.reduce((sum, s) => sum + (s.participations ?? 0), 0);
      const allDates = [...new Set(allStats.flatMap((s) => s.xtreinoDates ?? []))];

      return {
        id: p.id,
        nickname: p.nickname,
        aliases: p.aliases ?? [],
        teamId: p.teamId,
        teamName: teamsList?.find((t) => t.id === p.teamId)?.name ?? "Sem equipe",
        totalKills: totalKills || (p.xtreinoKills ?? 0),
        q1Kills: totalQ1,
        q2Kills: totalQ2,
        q3Kills: totalQ3,
        participations: totalPart || (p.xtreinoParticipations ?? 0),
        avgKills: totalPart > 0 ? Number((totalKills / totalPart).toFixed(1)) : 0,
        killPoints: calcKillPoints(totalKills || (p.xtreinoKills ?? 0)),
        xtreinoDates: allDates,
      };
    });
  }, [playersList, playerAccumulated, playerXtreinoStats, teamsList, isSingleXtreino, selectedDate]);

  const sortedPlayers = useMemo(() => {
    return [...enrichedPlayers].sort((a, b) => {
      const aVal = a[sortField] ?? 0;
      const bVal = b[sortField] ?? 0;
      return sortDir === "desc" ? bVal - aVal : aVal - bVal;
    });
  }, [enrichedPlayers, sortField, sortDir]);

  const selectedPlayerXtreinoHistory = useMemo(() => {
    if (!playerDetail) return [];
    const allNicks = [playerDetail.nickname, ...(playerDetail.aliases ?? [])];
    return playerXtreinoStats.filter(
      (s) => allNicks.includes(s.playerName)
    );
  }, [playerDetail, playerXtreinoStats]);

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

  // ===== VIEW: DETALHE DO JOGADOR =====
  if (selectedPlayerId !== null) {
    if (detailLoading) {
      return (
        <div className="space-y-6">
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setSelectedPlayerId(null)}
                className="p-2 rounded-lg hover:bg-[#1a1a24] text-[#5a5a6e] hover:text-[#f0f0f5] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-12 h-12 rounded-full bg-green-500/10 animate-pulse" />
              <div className="space-y-2">
                <div className="w-32 h-5 bg-[#2a2a3a] rounded animate-pulse" />
                <div className="w-20 h-3 bg-[#2a2a3a] rounded animate-pulse" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-[#1a1a24] rounded-lg p-4">
                  <div className="w-16 h-3 bg-[#2a2a3a] rounded animate-pulse mb-2" />
                  <div className="w-12 h-6 bg-[#2a2a3a] rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (!playerDetail) {
      return (
        <div className="space-y-6">
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
            <button
              onClick={() => setSelectedPlayerId(null)}
              className="flex items-center gap-2 text-[#5a5a6e] hover:text-[#f0f0f5] transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Voltar</span>
            </button>
            <div className="text-center py-12">
              <Target className="w-12 h-12 mx-auto mb-4 text-[#2a2a3a]" />
              <p className="text-[#5a5a6e] text-lg font-medium">Jogador não encontrado</p>
              <p className="text-[#3a3a4e] text-sm mt-1">ID: {selectedPlayerId}</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedPlayerId(null)}
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
                  {playerDetail.teamName ?? teamsList?.find((t) => t.id === playerDetail.teamId)?.name ?? "Sem equipe"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedPlayerId(null)}
              className="p-2 rounded-lg hover:bg-[#1a1a24] text-[#5a5a6e] hover:text-[#f0f0f5] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Aliases / Nicks antigos */}
          {(playerDetail.aliases ?? []).length > 0 && (
            <div className="mb-6 bg-[#0a0a0f] rounded-lg border border-[#2a2a3a] p-4">
              <div className="flex items-center gap-2 mb-2">
                <History className="w-4 h-4 text-[#5a5a6e]" />
                <span className="text-xs text-[#5a5a6e] uppercase font-medium">Nicks Anteriores</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {playerDetail.aliases.map((alias: string) => (
                  <span
                    key={alias}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#1a1a24] border border-[#2a2a3a] text-sm text-[#8a8a9e]"
                  >
                    <Tag className="w-3 h-3 text-[#5a5a6e]" />
                    {alias}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stats Cards */}
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

          {/* Melhor performance */}
          {playerDetail.bestXtreinoKills && playerDetail.bestXtreinoKills > 0 && (
            <div className="bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/20 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-4 h-4 text-green-400" />
                <span className="text-xs text-green-400 font-medium uppercase">Melhor XTreino</span>
              </div>
              <p className="text-lg font-bold text-[#f0f0f5]">
                {playerDetail.bestXtreinoKills} kills
                {playerDetail.bestXtreinoDate && (
                  <span className="text-sm font-normal text-[#8a8a9e] ml-2">
                    em {playerDetail.bestXtreinoDate.split("-")[2]}/{playerDetail.bestXtreinoDate.split("-")[1]}/{playerDetail.bestXtreinoDate.split("-")[0]}
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Histórico de XTreinos */}
          {selectedPlayerXtreinoHistory.length > 0 && (
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
                    {selectedPlayerXtreinoHistory.map((stat) => (
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

          {selectedPlayerXtreinoHistory.length === 0 && (
            <div className="text-center py-8">
              <BarChart3 className="w-10 h-10 mx-auto mb-3 text-[#2a2a3a]" />
              <p className="text-[#5a5a6e] text-sm">Nenhum histórico de xtreino encontrado</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===== VIEW: LISTAGEM / RANKING =====
  return (
    <div className="space-y-6">
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
          {!isSingleXtreino && (
            <>
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
            </>
          )}
          {isSingleXtreino && (
            <>
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-[#5a5a6e] uppercase">Q1 Kills</span>
                </div>
                <p className="text-2xl font-bold text-[#f0f0f5]">
                  {sortedPlayers.reduce((sum, p) => sum + (p.q1Kills || 0), 0)}
                </p>
              </div>
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-[#5a5a6e] uppercase">Q2 Kills</span>
                </div>
                <p className="text-2xl font-bold text-[#f0f0f5]">
                  {sortedPlayers.reduce((sum, p) => sum + (p.q2Kills || 0), 0)}
                </p>
              </div>
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-[#5a5a6e] uppercase">Q3 Kills</span>
                </div>
                <p className="text-2xl font-bold text-[#f0f0f5]">
                  {sortedPlayers.reduce((sum, p) => sum + (p.q3Kills || 0), 0)}
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* ===== LOADING ===== */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#5a5a6e]">Carregando jogadores...</p>
        </div>
      )}

      {/* ===== TOP 3 PODIUM ===== */}
      {!isLoading && sortedPlayers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sortedPlayers.slice(0, 3).map((p, i) => (
            <div
              key={p.id}
              onClick={() => setSelectedPlayerId(p.id)}
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
              <p className="text-sm text-[#8a8a9e] mb-2">{p.teamName}</p>
              {(p.aliases ?? []).length > 0 && (
                <p className="text-xs text-[#5a5a6e] mb-3 truncate">
                  aka {p.aliases.join(", ")}
                </p>
              )}
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
                {!isSingleXtreino && (
                  <>
                    <div>
                      <p className="text-xs text-[#5a5a6e]">Partic.</p>
                      <p className="text-lg font-bold text-[#f0f0f5]">{p.participations}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#5a5a6e]">Média</p>
                      <p className="text-lg font-bold text-[#f0f0f5]">{p.avgKills}</p>
                    </div>
                  </>
                )}
                {isSingleXtreino && (
                  <div>
                    <p className="text-xs text-[#5a5a6e]">Q1/Q2/Q3</p>
                    <p className="text-sm font-bold text-[#f0f0f5]">{p.q1Kills}/{p.q2Kills}/{p.q3Kills}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== TABELA DE RANKING ===== */}
      {!isLoading && (
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center justify-between">
            <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              {isSingleXtreino 
                ? `Classificação do XTreino — ${selectedDate.split("-")[2]}/${selectedDate.split("-")[1]}/${selectedDate.split("-")[0]}`
                : "Classificação Geral"
              }
              {selectedMonth && !isSingleXtreino && (
                <span className="text-sm font-normal text-[#5a5a6e]">
                  — {selectedMonth.split("-")[1]}/{selectedMonth.split("-")[0]}
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
                  {!isSingleXtreino && (
                    <>
                      <th className="px-6 py-3 text-center">
                        <SortHeader field="participations" label="XTreinos" />
                      </th>
                      <th className="px-6 py-3 text-center">
                        <SortHeader field="avgKills" label="Média" />
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a3a]">
                {sortedPlayers.map((p, i) => (
                  <tr
                    key={p.id}
                    className={`${getRankStyle(i)} cursor-pointer transition-colors`}
                    onClick={() => setSelectedPlayerId(p.id)}
                  >
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">{getRankIcon(i)}</div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                            <Target className="w-4 h-4 text-green-400" />
                          </div>
                          <span className="text-sm font-bold text-[#f0f0f5]">{p.nickname}</span>
                        </div>
                        {(p.aliases ?? []).length > 0 && (
                          <span className="text-xs text-[#5a5a6e] ml-11">
                            aka {p.aliases.join(", ")}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm text-[#8a8a9e]">{p.teamName}</td>
                    <td className="px-6 py-3 text-sm text-center font-bold text-green-400">
                      {p.totalKills}
                    </td>
                    <td className="px-6 py-3 text-sm text-center text-[#8a8a9e]">{p.q1Kills}</td>
                    <td className="px-6 py-3 text-sm text-center text-[#8a8a9e]">{p.q2Kills}</td>
                    <td className="px-6 py-3 text-sm text-center text-[#8a8a9e]">{p.q3Kills}</td>
                    {!isSingleXtreino && (
                      <>
                        <td className="px-6 py-3 text-sm text-center text-[#8a8a9e]">
                          {p.participations}
                        </td>
                        <td className="px-6 py-3 text-sm text-center text-[#8a8a9e]">
                          {p.avgKills}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sortedPlayers.length === 0 && (
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
  );
}