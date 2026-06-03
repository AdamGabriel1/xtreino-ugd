import { useState } from "react";
import { UserCircle, Search, Trophy, Medal, Target, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { trpc } from "@/providers/trpc";
import MainLayout from "@/layout/MainLayout";

type SortField = "xtreinoKills" | "xtreinoParticipations" | "avgKills";
type SortDir = "asc" | "desc";

interface PlayerWithStats {
  id: number;
  nickname: string;
  uid: string | null;
  discord: string | null;
  teamId: number | null;
  kills: number;
  deaths: number;
  wins: number;
  matches: number;
  xtreinoKills: number | null;
  xtreinoParticipations: number | null;
  avgKills: number;
  createdAt: Date;
  updatedAt: Date;
}

export default function Jogadores() {
  const [search, setSearch] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [sortField, setSortField] = useState<SortField>("xtreinoKills");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const { data: playersList } = trpc.players.list.useQuery(search ? { search } : undefined);
  const { data: playerDetail } = trpc.players.getById.useQuery(
    { id: selectedPlayer! },
    { enabled: !!selectedPlayer }
  );
  const { data: teamsList } = trpc.teams.list.useQuery();

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "desc" ? "asc" : "desc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const enrichedPlayers: PlayerWithStats[] = (playersList ?? []).map(p => {
    const avgKills = p.xtreinoParticipations && p.xtreinoParticipations > 0
      ? Math.round((p.xtreinoKills ?? 0) / p.xtreinoParticipations)
      : 0;
    return {
      ...p,
      avgKills,
    };
  });

  const sortedPlayers = [...enrichedPlayers].sort((a, b) => {
    const aVal = a[sortField] ?? 0;
    const bVal = b[sortField] ?? 0;
    return sortDir === "desc" ? bVal - aVal : aVal - bVal;
  });

  const getTeamName = (teamId: number | null) => {
    if (!teamId) return "Sem equipe";
    return teamsList?.find(t => t.id === teamId)?.name ?? "Sem equipe";
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-5 h-5 text-yellow-400" />;
    if (index === 1) return <Medal className="w-5 h-5 text-gray-300" />;
    if (index === 2) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 text-center text-sm font-bold text-[#5a5a6e]">{index + 1}</span>;
  };

  const getRankStyle = (index: number) => {
    if (index === 0) return "bg-gradient-to-r from-yellow-500/10 to-transparent border-l-2 border-yellow-400";
    if (index === 1) return "bg-gradient-to-r from-gray-400/10 to-transparent border-l-2 border-gray-300";
    if (index === 2) return "bg-gradient-to-r from-amber-600/10 to-transparent border-l-2 border-amber-600";
    return "hover:bg-[#1a1a24]";
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

  return (
    <MainLayout>
      <div className="bg-[#12121a] border-b border-[#2a2a3a]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-[#006400]" />
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#f0f0f5]">Ranking de Jogadores</h1>
          </div>
          <p className="text-[#8a8a9e]">Estatísticas dos xtreinos da Underground</p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
        {!selectedPlayer ? (
          <>
            {/* Search */}
            <div className="relative max-w-md mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5a6e]" />
              <input
                type="text"
                placeholder="Buscar jogador..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm placeholder-[#5a5a6e] focus:outline-none focus:border-[#006400]/50"
              />
            </div>

            {/* Top 3 Podium */}
            {sortedPlayers.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {sortedPlayers.slice(0, 3).map((p, i) => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPlayer(p.id)}
                    className={`rounded-xl border border-[#2a2a3a] p-6 cursor-pointer transition-all hover:-translate-y-1 ${
                      i === 0 ? "bg-gradient-to-b from-yellow-500/10 to-[#12121a] border-yellow-400/30" :
                      i === 1 ? "bg-gradient-to-b from-gray-400/10 to-[#12121a] border-gray-300/30" :
                      "bg-gradient-to-b from-amber-600/10 to-[#12121a] border-amber-600/30"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                        i === 0 ? "bg-yellow-400/20 text-yellow-400" :
                        i === 1 ? "bg-gray-300/20 text-gray-300" :
                        "bg-amber-600/20 text-amber-600"
                      }`}>
                        {i + 1}º
                      </div>
                      <UserCircle className={`w-8 h-8 ${
                        i === 0 ? "text-yellow-400/50" :
                        i === 1 ? "text-gray-300/50" :
                        "text-amber-600/50"
                      }`} />
                    </div>
                    <h3 className="text-lg font-bold text-[#f0f0f5] mb-1">{p.nickname}</h3>
                    <p className="text-sm text-[#8a8a9e] mb-3">{getTeamName(p.teamId)}</p>
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-xs text-[#5a5a6e]">Kills XT</p>
                        <p className={`text-2xl font-bold ${
                          i === 0 ? "text-yellow-400" :
                          i === 1 ? "text-gray-300" :
                          "text-amber-600"
                        }`}>{p.xtreinoKills ?? 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#5a5a6e]">Partic.</p>
                        <p className="text-lg font-bold text-[#f0f0f5]">{p.xtreinoParticipations ?? 0}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Ranking Table */}
            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2a2a3a]">
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#5a5a6e] uppercase">Rank</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#5a5a6e] uppercase">Jogador</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#5a5a6e] uppercase">Equipe</th>
                      <th className="px-6 py-4 text-center">
                        <SortHeader field="xtreinoKills" label="Kills XT" />
                      </th>
                      <th className="px-6 py-4 text-center">
                        <SortHeader field="xtreinoParticipations" label="XTreinos" />
                      </th>
                      <th className="px-6 py-4 text-center">
                        <SortHeader field="avgKills" label="Média" />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2a2a3a]">
                    {sortedPlayers.map((p, i) => (
                      <tr
                        key={p.id}
                        onClick={() => setSelectedPlayer(p.id)}
                        className={`cursor-pointer transition-colors ${getRankStyle(i)}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {getRankIcon(i)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#006400]/10 flex items-center justify-center">
                              <UserCircle className="w-4 h-4 text-[#006400]" />
                            </div>
                            <span className="text-sm font-bold text-[#f0f0f5]">{p.nickname}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#8a8a9e]">{getTeamName(p.teamId)}</td>
                        <td className="px-6 py-4 text-sm text-center font-bold text-[#006400]">{p.xtreinoKills ?? 0}</td>
                        <td className="px-6 py-4 text-sm text-center text-[#8a8a9e]">{p.xtreinoParticipations ?? 0}</td>
                        <td className="px-6 py-4 text-sm text-center text-[#8a8a9e]">{p.avgKills}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          /* Player Detail */
          <div>
            <button
              onClick={() => setSelectedPlayer(null)}
              className="mb-6 text-sm text-[#8a8a9e] hover:text-[#f0f0f5] transition-colors flex items-center gap-2"
            >
              <ChevronDown className="w-4 h-4 rotate-90" /> Voltar ao ranking
            </button>

            {playerDetail && (
              <div className="space-y-6">
                {/* Header */}
                <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#006400]/30 to-[#004d00]/10 flex items-center justify-center shrink-0">
                      <UserCircle className="w-10 h-10 text-[#006400]/50" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-[#f0f0f5] mb-1">{playerDetail.nickname}</h2>
                      {playerDetail.teamName && (
                        <p className="text-[#8a8a9e] text-sm">Equipe: <span className="text-[#f0f0f5]">{playerDetail.teamName}</span></p>
                      )}
                      {playerDetail.uid && (
                        <p className="text-[#5a5a6e] text-sm font-mono">UID: {playerDetail.uid}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-5 h-5 text-[#006400]" />
                      <span className="text-xs text-[#5a5a6e]">K/D Ratio</span>
                    </div>
                    <p className="text-2xl font-bold text-[#f0f0f5]">
                      {playerDetail.deaths > 0 ? (playerDetail.kills / playerDetail.deaths).toFixed(2) : playerDetail.kills}
                    </p>
                  </div>
                  <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-5 h-5 text-[#006400]" />
                      <span className="text-xs text-[#5a5a6e]">Kills Geral</span>
                    </div>
                    <p className="text-2xl font-bold text-[#f0f0f5]">{playerDetail.kills}</p>
                  </div>
                  <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="w-5 h-5 text-[#006400]" />
                      <span className="text-xs text-[#5a5a6e]">Kills XT</span>
                    </div>
                    <p className="text-2xl font-bold text-[#006400]">{playerDetail.totalXtreinoKills ?? 0}</p>
                  </div>
                  <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-[#006400]" />
                      <span className="text-xs text-[#5a5a6e]">XTreinos</span>
                    </div>
                    <p className="text-2xl font-bold text-[#f0f0f5]">{playerDetail.xtreinoParticipations ?? 0}</p>
                  </div>
                </div>

                {/* XTreino History */}
                {playerDetail.xtreinoStats && playerDetail.xtreinoStats.length > 0 && (
                  <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
                    <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-[#006400]" />
                      <h3 className="font-bold text-[#f0f0f5]">Histórico de XTreinos</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-[#2a2a3a]">
                            <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Data</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Time</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Q1</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Q2</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Q3</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2a2a3a]">
                          {playerDetail.xtreinoStats.map((stat) => (
                            <tr key={stat.id} className="hover:bg-[#1a1a24]">
                              <td className="px-6 py-3 text-sm text-[#f0f0f5]">{stat.date}</td>
                              <td className="px-6 py-3 text-sm text-[#8a8a9e]">{stat.teamName}</td>
                              <td className="px-6 py-3 text-sm text-center text-[#8a8a9e]">{stat.q1Kills}</td>
                              <td className="px-6 py-3 text-sm text-center text-[#8a8a9e]">{stat.q2Kills}</td>
                              <td className="px-6 py-3 text-sm text-center text-[#8a8a9e]">{stat.q3Kills}</td>
                              <td className="px-6 py-3 text-sm text-center text-[#006400] font-bold">{stat.totalKills}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}