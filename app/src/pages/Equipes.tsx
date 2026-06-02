import { useState } from "react";
import { Users, Search, Shield, UserCircle, ChevronRight } from "lucide-react";
import { trpc } from "@/providers/trpc";
import MainLayout from "@/layout/MainLayout";

export default function Equipes() {
  const [search, setSearch] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);

  const { data: teamsList } = trpc.teams.list.useQuery(search ? { search } : undefined);
  const { data: teamDetail } = trpc.teams.getById.useQuery(
    { id: selectedTeam! },
    { enabled: !!selectedTeam }
  );

  return (
    <MainLayout>
      <div className="bg-[#12121a] border-b border-[#2a2a3a]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-red-400" />
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#f0f0f5]">Equipes</h1>
          </div>
          <p className="text-[#8a8a9e]">Conheca todas as equipes registradas</p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
        {!selectedTeam ? (
          <>
            {/* Search */}
            <div className="relative max-w-md mb-8">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5a6e]" />
              <input
                type="text"
                placeholder="Buscar equipe..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm placeholder-[#5a5a6e] focus:outline-none focus:border-red-500/50"
              />
            </div>

            {/* Teams Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {teamsList?.map((team) => (
                <button
                  key={team.id}
                  onClick={() => setSelectedTeam(team.id)}
                  className="text-left bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6 hover:border-[#3a3a4e] hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-900/30 to-red-600/10 flex items-center justify-center mx-auto mb-4">
                    {team.logo ? (
                      <img src={team.logo} alt={team.name} className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <Shield className="w-8 h-8 text-red-400/50" />
                    )}
                  </div>
                  <h3 className="text-center font-bold text-[#f0f0f5] mb-1">{team.name}</h3>
                  {team.tag && <p className="text-center text-xs text-[#5a5a6e] mb-3">[{team.tag}]</p>}
                  {team.captainName && (
                    <p className="text-center text-xs text-[#8a8a9e] mb-3">Capitao: {team.captainName}</p>
                  )}
                  <div className="flex items-center justify-center gap-1 text-red-400 text-sm font-medium">
                    Ver equipe <ChevronRight className="w-4 h-4" />
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          /* Team Detail */
          <div>
            <button
              onClick={() => setSelectedTeam(null)}
              className="mb-6 text-sm text-[#8a8a9e] hover:text-[#f0f0f5] transition-colors"
            >
              &larr; Voltar
            </button>

            {teamDetail && (
              <div className="space-y-6">
                {/* Header */}
                <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-red-900/30 to-red-600/10 flex items-center justify-center shrink-0">
                      {teamDetail.logo ? (
                        <img src={teamDetail.logo} alt={teamDetail.name} className="w-16 h-16 rounded-lg object-cover" />
                      ) : (
                        <Shield className="w-10 h-10 text-red-400/50" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-2xl font-bold text-[#f0f0f5]">{teamDetail.name}</h2>
                        {teamDetail.tag && (
                          <span className="px-2 py-0.5 rounded bg-[#1a1a24] text-[#8a8a9e] text-xs font-medium border border-[#2a2a3a]">
                            [{teamDetail.tag}]
                          </span>
                        )}
                      </div>
                      {teamDetail.captainName && (
                        <p className="text-[#8a8a9e] text-sm">
                          Capitao: <span className="text-[#f0f0f5]">{teamDetail.captainName}</span>
                        </p>
                      )}
                      {teamDetail.captainDiscord && (
                        <p className="text-[#8a8a9e] text-sm">Discord: {teamDetail.captainDiscord}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Players */}
                <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center gap-2">
                    <UserCircle className="w-5 h-5 text-red-400" />
                    <h3 className="font-bold text-[#f0f0f5]">Jogadores ({teamDetail.players?.length ?? 0})</h3>
                  </div>
                  {teamDetail.players && teamDetail.players.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-[#2a2a3a]">
                            <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Nickname</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">UID</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Kills</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Deaths</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Wins</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Matches</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">K/D</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2a2a3a]">
                          {teamDetail.players.map((p) => {
                            const kd = p.deaths > 0 ? (p.kills / p.deaths).toFixed(2) : p.kills > 0 ? p.kills.toString() : "0";
                            return (
                              <tr key={p.id} className="hover:bg-[#1a1a24]">
                                <td className="px-6 py-3 text-sm font-medium text-[#f0f0f5]">{p.nickname}</td>
                                <td className="px-6 py-3 text-sm text-[#8a8a9e] font-mono">{p.uid}</td>
                                <td className="px-6 py-3 text-sm text-center text-[#8a8a9e]">{p.kills}</td>
                                <td className="px-6 py-3 text-sm text-center text-[#8a8a9e]">{p.deaths}</td>
                                <td className="px-6 py-3 text-sm text-center text-green-400">{p.wins}</td>
                                <td className="px-6 py-3 text-sm text-center text-[#8a8a9e]">{p.matches}</td>
                                <td className="px-6 py-3 text-sm text-center text-red-400 font-medium">{kd}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="px-6 py-8 text-center text-[#5a5a6e] text-sm">Nenhum jogador registrado</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
