import { useState } from "react";
import { UserCircle, Search, Target, TrendingUp, Gamepad2, Calendar, Award } from "lucide-react";
import { trpc } from "@/providers/trpc";
import MainLayout from "@/layout/MainLayout";

export default function Jogadores() {
  const [search, setSearch] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);

  const { data: playersList } = trpc.players.list.useQuery(search ? { search } : undefined);
  const { data: playerDetail } = trpc.players.getById.useQuery(
    { id: selectedPlayer! },
    { enabled: !!selectedPlayer }
  );

  const kd = (kills: number, deaths: number) => {
    if (deaths === 0) return kills > 0 ? kills.toString() : "0";
    return (kills / deaths).toFixed(2);
  };

  return (
    <MainLayout>
      <div className="bg-[#12121a] border-b border-[#2a2a3a]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-2">
            <UserCircle className="w-8 h-8 text-[#006400]" />
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#f0f0f5]">Jogadores</h1>
          </div>
          <p className="text-[#8a8a9e]">Estatisticas e perfis dos jogadores</p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
        {!selectedPlayer ? (
          <>
            {/* Search */}
            <div className="relative max-w-md mb-8">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5a6e]" />
              <input
                type="text"
                placeholder="Buscar jogador..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm placeholder-[#5a5a6e] focus:outline-none focus:border-[#006400]/50"
              />
            </div>

            {/* Players Table */}
            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2a2a3a]">
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#5a5a6e] uppercase">#</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#5a5a6e] uppercase">Nickname</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#5a5a6e] uppercase">Equipe</th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-[#5a5a6e] uppercase">K/D</th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-[#5a5a6e] uppercase">Kills</th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-[#5a5a6e] uppercase">Partidas</th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-[#5a5a6e] uppercase">XTreinos</th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-[#5a5a6e] uppercase">Kills XT</th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-[#5a5a6e] uppercase">Win Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2a2a3a]">
                    {playersList?.map((p, i) => {
                      const winRate = p.matches > 0 ? ((p.wins / p.matches) * 100).toFixed(1) : "0";
                      return (
                        <tr
                          key={p.id}
                          onClick={() => setSelectedPlayer(p.id)}
                          className="hover:bg-[#1a1a24] cursor-pointer transition-colors"
                        >
                          <td className="px-6 py-4 text-sm font-bold text-[#5a5a6e]">{i + 1}</td>
                          <td className="px-6 py-4 text-sm font-bold text-[#f0f0f5]">{p.nickname}</td>
                          <td className="px-6 py-4 text-sm text-[#8a8a9e]">{p.teamId ? `Equipe ${p.teamId}` : "Sem equipe"}</td>
                          <td className="px-6 py-4 text-sm text-center text-[#006400] font-medium">{kd(p.kills, p.deaths)}</td>
                          <td className="px-6 py-4 text-sm text-center text-[#8a8a9e]">{p.kills}</td>
                          <td className="px-6 py-4 text-sm text-center text-[#8a8a9e]">{p.matches}</td>
                          <td className="px-6 py-4 text-sm text-center text-[#8a8a9e]">{p.xtreinoParticipations ?? 0}</td>
                          <td className="px-6 py-4 text-sm text-center text-[#006400] font-medium">{p.xtreinoKills ?? 0}</td>
                          <td className="px-6 py-4 text-sm text-center text-green-400">{winRate}%</td>
                        </tr>
                      );
                    })}
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
              className="mb-6 text-sm text-[#8a8a9e] hover:text-[#f0f0f5] transition-colors"
            >
              &larr; Voltar
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
                    <p className="text-2xl font-bold text-[#f0f0f5]">{kd(playerDetail.kills, playerDetail.deaths)}</p>
                  </div>
                  <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-5 h-5 text-[#006400]" />
                      <span className="text-xs text-[#5a5a6e]">Kills</span>
                    </div>
                    <p className="text-2xl font-bold text-[#f0f0f5]">{playerDetail.kills}</p>
                  </div>
                  <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      <span className="text-xs text-[#5a5a6e]">Vitorias</span>
                    </div>
                    <p className="text-2xl font-bold text-[#f0f0f5]">{playerDetail.wins}</p>
                  </div>
                  <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Gamepad2 className="w-5 h-5 text-blue-400" />
                      <span className="text-xs text-[#5a5a6e]">Partidas</span>
                    </div>
                    <p className="text-2xl font-bold text-[#f0f0f5]">{playerDetail.matches}</p>
                  </div>
                </div>

                {/* XTreino Stats */}
                <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="w-5 h-5 text-[#006400]" />
                    <h3 className="font-bold text-[#f0f0f5]">Estatísticas de XTreino</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-[#1a1a24] rounded-lg p-4">
                      <p className="text-xs text-[#5a5a6e] mb-1">Participações</p>
                      <p className="text-xl font-bold text-[#f0f0f5]">{playerDetail.xtreinoParticipations ?? 0}</p>
                    </div>
                    <div className="bg-[#1a1a24] rounded-lg p-4">
                      <p className="text-xs text-[#5a5a6e] mb-1">Total Kills XT</p>
                      <p className="text-xl font-bold text-[#006400]">{playerDetail.totalXtreinoKills ?? 0}</p>
                    </div>
                    <div className="bg-[#1a1a24] rounded-lg p-4">
                      <p className="text-xs text-[#5a5a6e] mb-1">Melhor XT</p>
                      <p className="text-xl font-bold text-[#f0f0f5]">{playerDetail.bestXtreinoKills ?? 0} kills</p>
                      {playerDetail.bestXtreinoDate && (
                        <p className="text-xs text-[#5a5a6e] mt-1">{playerDetail.bestXtreinoDate}</p>
                      )}
                    </div>
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

                {/* Win Rate */}
                <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
                  <h3 className="font-bold text-[#f0f0f5] mb-4">Taxa de Vitoria</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-[#1a1a24] rounded-full h-4">
                      <div
                        className="bg-green-500 h-4 rounded-full transition-all"
                        style={{
                          width: `${playerDetail.matches > 0 ? (playerDetail.wins / playerDetail.matches) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-lg font-bold text-green-400">
                      {playerDetail.matches > 0 ? ((playerDetail.wins / playerDetail.matches) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-[#5a5a6e]">
                    <span>{playerDetail.wins} vitorias</span>
                    <span>{playerDetail.matches - playerDetail.wins} derrotas</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}