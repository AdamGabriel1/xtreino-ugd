import { useState } from "react";
import { Trophy, Search, Calendar, Users } from "lucide-react";
import { trpc } from "@/providers/trpc";
import MainLayout from "@/components/layout/MainLayout";

const statusLabels: Record<string, { text: string; class: string }> = {
  ativo: { text: "Ativo", class: "bg-emerald-500/10 text-emerald-400" },
  em_breve: { text: "Em Breve", class: "bg-blue-500/10 text-blue-400" },
  encerrado: { text: "Encerrado", class: "bg-red-500/10 text-red-400" },
};

const formatLabels: Record<string, string> = {
  grupos: "Fase de Grupos",
  mata_mata: "Mata-Mata",
  eliminacao_simples: "Eliminacao Simples",
  eliminacao_dupla: "Eliminacao Dupla",
};

export default function Campeonatos() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [selectedChamp, setSelectedChamp] = useState<number | null>(null);

  const { data: championships } = trpc.championships.list.useQuery(
    statusFilter ? { status: statusFilter } : undefined
  );
  const { data: champDetail } = trpc.championships.getById.useQuery(
    { id: selectedChamp! },
    { enabled: !!selectedChamp }
  );

  const filtered = championships?.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <MainLayout>
      {/* Page Header */}
      <div className="bg-[#12121a] border-b border-[#2a2a3a]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-emerald-400" />
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#f0f0f5]">Campeonatos</h1>
          </div>
          <p className="text-[#8a8a9e]">Gerencie e acompanhe todos os campeonatos</p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex gap-2">
            {["", "ativo", "em_breve", "encerrado"].map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setSelectedChamp(null); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  statusFilter === s
                    ? "bg-emerald-500 text-white"
                    : "bg-[#1a1a24] text-[#8a8a9e] hover:text-[#f0f0f5] border border-[#2a2a3a]"
                }`}
              >
                {s === "" ? "Todos" : statusLabels[s]?.text ?? s}
              </button>
            ))}
          </div>
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5a6e]" />
            <input
              type="text"
              placeholder="Buscar campeonato..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm placeholder-[#5a5a6e] focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>

        {/* Championship Grid */}
        {!selectedChamp ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered?.map((champ) => (
              <button
                key={champ.id}
                onClick={() => setSelectedChamp(champ.id)}
                className="text-left bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6 hover:border-[#3a3a4e] hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="h-24 rounded-lg bg-gradient-to-br from-emerald-900/30 to-emerald-600/10 mb-4 flex items-center justify-center">
                  <Trophy className="w-10 h-10 text-emerald-400/50" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusLabels[champ.status]?.class ?? "bg-gray-500/10 text-gray-400"}`}>
                    {statusLabels[champ.status]?.text ?? champ.status}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#1a1a24] text-[#8a8a9e] border border-[#2a2a3a]">
                    {champ.modality?.toUpperCase()}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#f0f0f5] mb-2">{champ.name}</h3>
                <div className="flex items-center gap-4 text-sm text-[#8a8a9e] mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {champ.startDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {champ.registeredTeams}/{champ.maxTeams}
                  </span>
                </div>
                <p className="text-sm text-[#5a5a6e]">{formatLabels[champ.format] ?? champ.format}</p>
                {champ.prizePool && (
                  <p className="text-sm text-yellow-400 font-medium mt-1">{champ.prizePool}</p>
                )}
              </button>
            ))}
          </div>
        ) : (
          /* Championship Detail */
          <div>
            <button
              onClick={() => setSelectedChamp(null)}
              className="mb-6 text-sm text-[#8a8a9e] hover:text-[#f0f0f5] transition-colors"
            >
              &larr; Voltar
            </button>

            {champDetail && (
              <div className="space-y-6">
                {/* Header */}
                <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusLabels[champDetail.status]?.class}`}>
                      {statusLabels[champDetail.status]?.text}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#1a1a24] text-[#8a8a9e] border border-[#2a2a3a]">
                      {champDetail.modality?.toUpperCase()}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#1a1a24] text-[#8a8a9e] border border-[#2a2a3a]">
                      {formatLabels[champDetail.format]}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-[#f0f0f5] mb-2">{champDetail.name}</h2>
                  <div className="flex flex-wrap gap-6 text-sm text-[#8a8a9e]">
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {champDetail.startDate} - {champDetail.endDate}</span>
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {champDetail.registeredTeams}/{champDetail.maxTeams} equipes</span>
                    {champDetail.prizePool && <span className="text-yellow-400 font-medium">{champDetail.prizePool}</span>}
                  </div>
                </div>

                {/* Rules */}
                {champDetail.rules && (
                  <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
                    <h3 className="text-lg font-bold text-[#f0f0f5] mb-3">Regras</h3>
                    <pre className="text-sm text-[#8a8a9e] whitespace-pre-wrap font-sans">{champDetail.rules}</pre>
                  </div>
                )}

                {/* Standings */}
                {champDetail.teams && champDetail.teams.length > 0 && (
                  <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
                    <div className="px-6 py-4 border-b border-[#2a2a3a]">
                      <h3 className="text-lg font-bold text-[#f0f0f5]">Classificacao</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-[#2a2a3a]">
                            <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">#</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Equipe</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">PTS</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Kills</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Wins</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Jogos</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2a2a3a]">
                          {champDetail.teams
                            .sort((a, b) => b.points - a.points)
                            .map((t, i) => (
                            <tr key={t.id} className="hover:bg-[#1a1a24]">
                              <td className="px-6 py-3 text-sm font-bold text-[#f0f0f5]">{i + 1}</td>
                              <td className="px-6 py-3 text-sm text-[#f0f0f5]">{t.teamName}</td>
                              <td className="px-6 py-3 text-sm text-center text-emerald-400 font-bold">{t.points}</td>
                              <td className="px-6 py-3 text-sm text-center text-[#8a8a9e]">{t.kills}</td>
                              <td className="px-6 py-3 text-sm text-center text-[#8a8a9e]">{t.wins}</td>
                              <td className="px-6 py-3 text-sm text-center text-[#8a8a9e]">{t.matchesPlayed}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Matches */}
                {champDetail.matches && champDetail.matches.length > 0 && (
                  <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
                    <div className="px-6 py-4 border-b border-[#2a2a3a]">
                      <h3 className="text-lg font-bold text-[#f0f0f5]">Partidas</h3>
                    </div>
                    <div className="divide-y divide-[#2a2a3a]">
                      {champDetail.matches.map((m) => (
                        <div key={m.id} className="px-6 py-4 flex items-center justify-between hover:bg-[#1a1a24]">
                          <div className="flex items-center gap-4 flex-1">
                            <span className="text-xs text-[#5a5a6e]">Rodada {m.round}</span>
                            <span className="text-sm text-[#f0f0f5] font-medium flex-1 text-right">{m.team1Name ?? "TBD"}</span>
                            <span className="px-3 py-1 bg-[#1a1a24] rounded text-sm font-bold text-[#f0f0f5]">
                              {m.team1Score} - {m.team2Score}
                            </span>
                            <span className="text-sm text-[#f0f0f5] font-medium flex-1">{m.team2Name ?? "TBD"}</span>
                          </div>
                          <span className={`ml-4 px-2 py-0.5 rounded-full text-xs ${
                            m.status === "concluido" ? "bg-emerald-500/10 text-emerald-400" :
                            m.status === "em_andamento" ? "bg-yellow-500/10 text-yellow-400" :
                            "bg-gray-500/10 text-gray-400"
                          }`}>
                            {m.status === "concluido" ? "Concluido" : m.status === "em_andamento" ? "Ao vivo" : "Pendente"}
                          </span>
                        </div>
                      ))}
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