import { useState, useMemo } from "react";
import {
  Users,
  Search,
  Shield,
  UserCircle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  X,
  TrendingUp,
  Target,
  Filter,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import MainLayout from "@/layout/MainLayout";

type SortField = "name" | "captainName";
type SortDir = "asc" | "desc";

export default function Equipes() {
  const [search, setSearch] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // Queries
  const { data: teamsList, isLoading: teamsLoading } = trpc.teams.list.useQuery(
    search ? { search } : undefined
  );
  const { data: teamDetail } = trpc.teams.getById.useQuery(
    { id: selectedTeam! },
    { enabled: !!selectedTeam }
  );

  // Ordenação
  const sortedTeams = useMemo(() => {
    if (!teamsList) return [];
    const filtered = teamsList.filter((t) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return t.name.toLowerCase().includes(q) || t.tag?.toLowerCase().includes(q);
    });
    
    return [...filtered].sort((a, b) => {
      if (sortField === "name") {
        const aVal = a.name;
        const bVal = b.name;
        return sortDir === "desc" 
          ? bVal.localeCompare(aVal) 
          : aVal.localeCompare(bVal);
      }
      
      // captainName
      const aVal = a.captainName ?? "";
      const bVal = b.captainName ?? "";
      return sortDir === "desc" 
        ? bVal.localeCompare(aVal) 
        : aVal.localeCompare(bVal);
    });
  }, [teamsList, search, sortField, sortDir]);

  // Stats gerais
  const stats = useMemo(() => {
    if (!teamsList) return null;
    return {
      totalTeams: teamsList.length,
      withCaptain: teamsList.filter((t) => t.captainName).length,
      withLogo: teamsList.filter((t) => t.logo).length,
    };
  }, [teamsList]);

  // Helpers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "desc" ? "asc" : "desc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const SortHeader = ({ field, label, align = "left" }: { field: SortField; label: string; align?: "left" | "center" }) => (
    <button
      onClick={() => handleSort(field)}
      className={`flex items-center gap-1 text-xs font-medium text-[#5a5a6e] uppercase hover:text-[#f0f0f5] transition-colors ${align === "center" ? "justify-center w-full" : ""}`}
    >
      {label}
      {sortField === field && (
        sortDir === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
      )}
    </button>
  );

  const isLoading = teamsLoading;

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#0a0a0f]">
        {/* Header */}
        <div className="bg-[#12121a] border-b border-[#2a2a3a]">
          <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-8 h-8 text-red-400" />
              <h1 className="text-3xl md:text-4xl font-extrabold text-[#f0f0f5]">
                Equipes
              </h1>
            </div>
            <p className="text-[#8a8a9e]">
              Conheça todas as equipes registradas no sistema
            </p>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6 space-y-6">
          {/* ===== FILTROS ===== */}
          {!selectedTeam && (
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
                      placeholder="Buscar equipe..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 pr-4 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm placeholder-[#5a5a6e] focus:outline-none focus:border-red-500/50 min-w-[250px]"
                    />
                  </div>
                </div>

                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ===== CARDS DE RESUMO ===== */}
          {!selectedTeam && stats && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-red-400" />
                  <span className="text-xs text-[#5a5a6e] uppercase">Total Equipes</span>
                </div>
                <p className="text-2xl font-bold text-red-400">{stats.totalTeams}</p>
              </div>
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-[#5a5a6e] uppercase">Com Capitão</span>
                </div>
                <p className="text-2xl font-bold text-blue-400">{stats.withCaptain}</p>
              </div>
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-[#5a5a6e] uppercase">Com Logo</span>
                </div>
                <p className="text-2xl font-bold text-green-400">{stats.withLogo}</p>
              </div>
            </div>
          )}

          {/* ===== LOADING ===== */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-red-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[#5a5a6e]">Carregando equipes...</p>
            </div>
          )}

          {/* ===== DETALHE DO TIME ===== */}
          {selectedTeam && teamDetail && (
            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedTeam(null)}
                    className="p-2 rounded-lg hover:bg-[#1a1a24] text-[#5a5a6e] hover:text-[#f0f0f5] transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-900/30 to-red-600/10 flex items-center justify-center shrink-0">
                    {teamDetail.logo ? (
                      <img src={teamDetail.logo} alt={teamDetail.name} className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <Shield className="w-6 h-6 text-red-400/50" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-[#f0f0f5]">{teamDetail.name}</h2>
                      {teamDetail.tag && (
                        <span className="px-2 py-0.5 rounded bg-[#1a1a24] text-[#8a8a9e] text-xs font-medium border border-[#2a2a3a]">
                          [{teamDetail.tag}]
                        </span>
                      )}
                    </div>
                    {teamDetail.captainName && (
                      <p className="text-sm text-[#8a8a9e]">
                        Capitão: <span className="text-[#f0f0f5]">{teamDetail.captainName}</span>
                        {teamDetail.captainDiscord && ` • Discord: ${teamDetail.captainDiscord}`}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTeam(null)}
                  className="p-2 rounded-lg hover:bg-[#1a1a24] text-[#5a5a6e] hover:text-[#f0f0f5] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Players Table */}
              <div className="bg-[#0a0a0f] rounded-xl border border-[#2a2a3a] overflow-hidden">
                <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center gap-2">
                  <UserCircle className="w-5 h-5 text-red-400" />
                  <h3 className="font-bold text-[#f0f0f5]">
                    Jogadores ({teamDetail.players?.length ?? 0})
                  </h3>
                </div>
                
                {teamDetail.players && teamDetail.players.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#2a2a3a] bg-[#0a0a0f]">
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
                          const kd = p.deaths > 0 
                            ? (p.kills / p.deaths).toFixed(2) 
                            : p.kills > 0 ? p.kills.toString() : "0";
                          return (
                            <tr key={p.id} className="hover:bg-[#1a1a24] transition-colors">
                              <td className="px-6 py-3 text-sm font-medium text-[#f0f0f5]">{p.nickname}</td>
                              <td className="px-6 py-3 text-sm text-[#8a8a9e] font-mono">{p.uid}</td>
                              <td className="px-6 py-3 text-sm text-center text-[#8a8a9e]">{p.kills}</td>
                              <td className="px-6 py-3 text-sm text-center text-[#8a8a9e]">{p.deaths}</td>
                              <td className="px-6 py-3 text-sm text-center text-green-400 font-medium">{p.wins}</td>
                              <td className="px-6 py-3 text-sm text-center text-[#8a8a9e]">{p.matches}</td>
                              <td className="px-6 py-3 text-sm text-center text-red-400 font-bold">{kd}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="px-6 py-12 text-center">
                    <UserCircle className="w-12 h-12 mx-auto mb-4 text-[#2a2a3a]" />
                    <p className="text-[#5a5a6e] text-lg font-medium">Nenhum jogador registrado</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===== TABELA DE EQUIPES ===== */}
          {!selectedTeam && (
            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center justify-between">
                <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-red-400" />
                  Lista de Equipes
                </h3>
                <span className="text-xs text-[#5a5a6e]">
                  {sortedTeams.length} equipes
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2a2a3a] bg-[#0a0a0f]">
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase w-16">
                        #
                      </th>
                      <th className="px-6 py-3 text-left">
                        <SortHeader field="name" label="Equipe" />
                      </th>
                      <th className="px-6 py-3 text-left">
                        <SortHeader field="captainName" label="Capitão" />
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">
                        Ação
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2a2a3a]">
                    {sortedTeams.map((team, i) => (
                      <tr
                        key={team.id}
                        className="hover:bg-[#1a1a24] cursor-pointer transition-colors group"
                        onClick={() => setSelectedTeam(team.id)}
                      >
                        <td className="px-6 py-4">
                          <span className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-sm font-bold text-red-400">
                            {i + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-900/30 to-red-600/10 flex items-center justify-center shrink-0">
                              {team.logo ? (
                                <img src={team.logo} alt={team.name} className="w-8 h-8 rounded object-cover" />
                              ) : (
                                <Shield className="w-5 h-5 text-red-400/50" />
                              )}
                            </div>
                            <div>
                              <span className="text-sm font-bold text-[#f0f0f5] group-hover:text-red-400 transition-colors">
                                {team.name}
                              </span>
                              {team.tag && (
                                <span className="text-xs text-[#5a5a6e] ml-2">[{team.tag}]</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {team.captainName ? (
                            <div className="flex items-center gap-2">
                              <UserCircle className="w-4 h-4 text-[#5a5a6e]" />
                              <span className="text-sm text-[#8a8a9e]">{team.captainName}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-[#3a3a4e]">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1 text-red-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            Ver <ChevronRight className="w-4 h-4" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {sortedTeams.length === 0 && !isLoading && (
                <div className="px-6 py-16 text-center">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-[#2a2a3a]" />
                  <p className="text-[#5a5a6e] text-lg font-medium">Nenhuma equipe encontrada</p>
                  <p className="text-[#3a3a4e] text-sm mt-1">
                    {search ? "Tente ajustar a busca" : "Nenhuma equipe registrada"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}