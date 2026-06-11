import { useState, useMemo } from "react";
import {
  Users,
  Search,
  Shield,
  UserCircle,
  ChevronRight,
  ArrowLeft,
  Filter,
  Crown,
  Target,
  ExternalLink,
  Layers,
  Star,
  RotateCcw,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import MainLayout from "@/layout/MainLayout";

type SortField = "name" | "teamsCount" | "playersCount";
type SortDir = "asc" | "desc";

interface ClanItem {
  id: number;
  name: string;
  tag: string;
  description: string | null;
  logo: string | null;
  color: string | null;
  status: string;
  discord: string | null;
  teams: TeamItem[];
}

interface TeamItem {
  id: number;
  name: string;
  tag: string;
  logo: string | null;
  description: string | null;
  status: string;
  captainName: string | null;
  captainId: number | null;
  players: PlayerItem[];
}

interface PlayerItem {
  id: number;
  nickname: string;
  uid: string | null;
  role: string;
  kills: number;
  deaths: number;
  wins: number;
  matches: number;
}

export default function Clans() {
  const [search, setSearch] = useState("");
  const [selectedClan, setSelectedClan] = useState<number | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [showDisbanded, setShowDisbanded] = useState(false);

  // Queries
  const { data: clansList, isLoading: clansLoading } = trpc.clans.list.useQuery(
    search ? { search } : undefined
  );
  const { data: clanDetail } = trpc.clans.getById.useQuery(
    { id: selectedClan! },
    { enabled: !!selectedClan }
  );
  const { data: teamDetail } = trpc.teams.getById.useQuery(
    { id: selectedTeam! },
    { enabled: !!selectedTeam }
  );

  // Enrich data with stats
  const enrichedClans = useMemo(() => {
    if (!clansList) return [];
    return clansList.map((clan: ClanItem) => {
      const activeLines = clan.teams?.filter((t: TeamItem) => t.status === "active").length ?? 0;
      const totalPlayers = clan.teams?.reduce((acc: number, t: TeamItem) => acc + (t.players?.length ?? 0), 0) ?? 0;
      return {
        ...clan,
        totalPlayers,
        activeLines,
      };
    });
  }, [clansList]);

  // Ordenação
  const sortedClans = useMemo(() => {
    const filtered = enrichedClans.filter((clan: ClanItem & { totalPlayers: number; activeLines: number }) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        clan.name.toLowerCase().includes(q) ||
        clan.tag.toLowerCase().includes(q) ||
        (clan.description?.toLowerCase().includes(q) ?? false)
      );
    }).filter((clan: ClanItem & { activeLines: number }) => {
      if (showDisbanded) return true;
      return clan.activeLines > 0 || (clan.teams?.length ?? 0) === 0;
    });

    return [...filtered].sort((a: ClanItem & { totalPlayers: number }, b: ClanItem & { totalPlayers: number }) => {
      if (sortField === "name") {
        return sortDir === "desc" ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name);
      }
      if (sortField === "teamsCount") {
        const aVal = a.teams?.length ?? 0;
        const bVal = b.teams?.length ?? 0;
        return sortDir === "desc" ? bVal - aVal : aVal - bVal;
      }
      const aVal = a.totalPlayers;
      const bVal = b.totalPlayers;
      return sortDir === "desc" ? bVal - aVal : aVal - bVal;
    });
  }, [enrichedClans, search, sortField, sortDir, showDisbanded]);

  // Stats gerais
  const stats = useMemo(() => {
    if (!clansList) return null;
    const allTeams = clansList.flatMap((c: ClanItem) => c.teams ?? []);
    const allPlayers = allTeams.flatMap((t: TeamItem) => t.players ?? []);
    return {
      totalClans: clansList.length,
      totalTeams: allTeams.length,
      totalPlayers: allPlayers.length,
      activeClans: clansList.filter((c: ClanItem) => c.teams?.some((t: TeamItem) => t.status === "active")).length,
    };
  }, [clansList]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "desc" ? "asc" : "desc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "captain": return <Crown className="w-3.5 h-3.5 text-yellow-400" />;
      case "official": return <Target className="w-3.5 h-3.5 text-blue-400" />;
      case "reserve": return <RotateCcw className="w-3.5 h-3.5 text-[#5a5a6e]" />;
      default: return null;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "captain": return "Capitão";
      case "official": return "Titular";
      case "reserve": return "Reserva";
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "captain": return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "official": return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      case "reserve": return "text-[#5a5a6e] bg-[#1a1a24] border-[#2a2a3a]";
      default: return "text-[#5a5a6e]";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500/10 text-green-400 border-green-500/20";
      case "disbanded": return "bg-red-500/10 text-red-400 border-red-500/20";
      case "inactive": return "bg-[#1a1a24] text-[#5a5a6e] border-[#2a2a3a]";
      default: return "bg-[#1a1a24] text-[#5a5a6e] border-[#2a2a3a]";
    }
  };

  const isLoading = clansLoading;

  // ===== DETALHE DO TIME (LINE) =====
  if (selectedTeam && teamDetail) {
    const teamPlayers: PlayerItem[] = teamDetail.players ?? [];
    const officialPlayers = teamPlayers.filter((p: PlayerItem) => p.role === "official" || p.role === "captain");
    const reservePlayers = teamPlayers.filter((p: PlayerItem) => p.role === "reserve");
    const captain = teamPlayers.find((p: PlayerItem) => p.role === "captain");

    return (
      <MainLayout>
        <div className="min-h-screen bg-[#0a0a0f]">
          <div className="bg-[#12121a] border-b border-[#2a2a3a]">
            <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6">
              <button
                onClick={() => setSelectedTeam(null)}
                className="flex items-center gap-2 text-[#5a5a6e] hover:text-[#f0f0f5] transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Voltar para {clanDetail?.name ?? "Clã"}</span>
              </button>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-900/30 to-red-600/10 flex items-center justify-center shrink-0 border border-[#2a2a3a]">
                  {teamDetail.logo ? (
                    <img src={teamDetail.logo} alt={teamDetail.name} className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    <Shield className="w-8 h-8 text-red-400/50" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-[#f0f0f5]">{teamDetail.name}</h1>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusBadge(teamDetail.status)}`}>
                      {teamDetail.status === "active" ? "Ativa" : teamDetail.status === "disbanded" ? "Desativada" : "Inativa"}
                    </span>
                  </div>
                  <p className="text-sm text-[#8a8a9e] mt-1">
                    Line do clã <span className="text-[#f0f0f5] font-medium">{clanDetail?.name ?? "—"}</span>
                  </p>
                  {teamDetail.description && (
                    <p className="text-sm text-[#5a5a6e] mt-1">{teamDetail.description}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6 space-y-6">
            {/* Info Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs text-[#5a5a6e] uppercase">Capitão</span>
                </div>
                <p className="text-lg font-bold text-[#f0f0f5]">{captain?.nickname ?? "—"}</p>
              </div>
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-[#5a5a6e] uppercase">Titulares</span>
                </div>
                <p className="text-2xl font-bold text-blue-400">{officialPlayers.length}</p>
              </div>
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <RotateCcw className="w-4 h-4 text-[#5a5a6e]" />
                  <span className="text-xs text-[#5a5a6e] uppercase">Reservas</span>
                </div>
                <p className="text-2xl font-bold text-[#5a5a6e]">{reservePlayers.length}</p>
              </div>
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-[#5a5a6e] uppercase">Total Jogadores</span>
                </div>
                <p className="text-2xl font-bold text-green-400">{teamPlayers.length}</p>
              </div>
            </div>

            {/* Elenco */}
            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#2a2a3a]">
                <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
                  <Users className="w-5 h-5 text-red-400" />
                  Elenco Completo
                </h3>
              </div>

              {teamPlayers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#2a2a3a] bg-[#0a0a0f]">
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Jogador</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">UID</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Kills</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Deaths</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Wins</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Matches</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">K/D</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2a2a3a]">
                      {teamPlayers
                        .sort((a: PlayerItem, b: PlayerItem) => {
                          const order: Record<string, number> = { captain: 0, official: 1, reserve: 2 };
                          return (order[a.role] ?? 3) - (order[b.role] ?? 3);
                        })
                        .map((p: PlayerItem) => {
                          const kd = p.deaths > 0 ? (p.kills / p.deaths).toFixed(2) : p.kills > 0 ? p.kills.toString() : "0";
                          return (
                            <tr key={p.id} className="hover:bg-[#1a1a24] transition-colors">
                              <td className="px-6 py-3">
                                <div className="flex items-center gap-2">
                                  {getRoleIcon(p.role)}
                                  <span className={`text-sm font-medium ${p.role === "captain" ? "text-yellow-400" : "text-[#f0f0f5]"}`}>
                                    {p.nickname}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-3">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${getRoleColor(p.role)}`}>
                                  {getRoleLabel(p.role)}
                                </span>
                              </td>
                              <td className="px-6 py-3 text-sm text-[#8a8a9e] font-mono">{p.uid ?? "—"}</td>
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
        </div>
      </MainLayout>
    );
  }

  // ===== DETALHE DO CLÃ =====
  if (selectedClan && clanDetail) {
    const clanTeams: TeamItem[] = clanDetail.teams ?? [];
    const activeTeams = clanTeams.filter((t: TeamItem) => t.status === "active");
    const disbandedTeams = clanTeams.filter((t: TeamItem) => t.status === "disbanded");

    return (
      <MainLayout>
        <div className="min-h-screen bg-[#0a0a0f]">
          {/* Header do Clã */}
          <div className="bg-[#12121a] border-b border-[#2a2a3a]">
            <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
              <button
                onClick={() => setSelectedClan(null)}
                className="flex items-center gap-2 text-[#5a5a6e] hover:text-[#f0f0f5] transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Voltar para Clãs</span>
              </button>

              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 border border-[#2a2a3a]"
                  style={{
                    background: clanDetail.color
                      ? `linear-gradient(135deg, ${clanDetail.color}30, ${clanDetail.color}10)`
                      : "linear-gradient(135deg, rgba(255,59,59,0.2), rgba(255,59,59,0.05))",
                  }}
                >
                  {clanDetail.logo ? (
                    <img src={clanDetail.logo} alt={clanDetail.name} className="w-16 h-16 rounded-xl object-cover" />
                  ) : (
                    <Shield className="w-10 h-10" style={{ color: clanDetail.color ?? "#ff3b3b" }} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-3xl font-extrabold text-[#f0f0f5]">{clanDetail.name}</h1>
                    <span className="px-2 py-0.5 rounded bg-[#1a1a24] text-[#8a8a9e] text-sm font-medium border border-[#2a2a3a]">
                      [{clanDetail.tag}]
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusBadge(clanDetail.status)}`}>
                      {clanDetail.status === "active" ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                  {clanDetail.description && (
                    <p className="text-[#8a8a9e] mt-2 max-w-2xl">{clanDetail.description}</p>
                  )}
                  {clanDetail.discord && (
                    <a
                      href={clanDetail.discord}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 mt-2 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Discord do Clã
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6 space-y-6">
            {/* Stats do Clã */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Layers className="w-4 h-4 text-red-400" />
                  <span className="text-xs text-[#5a5a6e] uppercase">Lines</span>
                </div>
                <p className="text-2xl font-bold text-red-400">{clanTeams.length}</p>
                <p className="text-xs text-[#5a5a6e] mt-1">{activeTeams.length} ativas</p>
              </div>
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-[#5a5a6e] uppercase">Jogadores</span>
                </div>
                <p className="text-2xl font-bold text-blue-400">
                  {clanTeams.reduce((acc: number, t: TeamItem) => acc + (t.players?.length ?? 0), 0)}
                </p>
              </div>
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs text-[#5a5a6e] uppercase">Capitões</span>
                </div>
                <p className="text-2xl font-bold text-yellow-400">
                  {clanTeams.filter((t: TeamItem) => t.captainName).length}
                </p>
              </div>
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-[#5a5a6e] uppercase">Lines Ativas</span>
                </div>
                <p className="text-2xl font-bold text-green-400">{activeTeams.length}</p>
              </div>
            </div>

            {/* Lines Ativas */}
            {activeTeams.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-[#f0f0f5] mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-green-400" />
                  Lines Ativas ({activeTeams.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeTeams.map((team: TeamItem) => {
                    const officialCount = team.players?.filter((p: PlayerItem) => p.role === "official" || p.role === "captain").length ?? 0;
                    const reserveCount = team.players?.filter((p: PlayerItem) => p.role === "reserve").length ?? 0;
                    const captain = team.players?.find((p: PlayerItem) => p.role === "captain");
                    return (
                      <div
                        key={team.id}
                        onClick={() => setSelectedTeam(team.id)}
                        className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-5 cursor-pointer hover:border-red-500/30 hover:bg-[#1a1a24] transition-all group"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-900/30 to-red-600/10 flex items-center justify-center shrink-0 border border-[#2a2a3a]">
                              {team.logo ? (
                                <img src={team.logo} alt={team.name} className="w-9 h-9 rounded-lg object-cover" />
                              ) : (
                                <Shield className="w-6 h-6 text-red-400/50" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-bold text-[#f0f0f5] group-hover:text-red-400 transition-colors">
                                {team.name}
                              </h4>
                              <span className="text-xs text-[#5a5a6e]">[{team.tag}]</span>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-[#2a2a3a] group-hover:text-red-400 transition-colors" />
                        </div>

                        {team.description && (
                          <p className="text-sm text-[#5a5a6e] mb-3 line-clamp-2">{team.description}</p>
                        )}

                        <div className="space-y-2">
                          {captain && (
                            <div className="flex items-center gap-2 text-sm">
                              <Crown className="w-3.5 h-3.5 text-yellow-400" />
                              <span className="text-[#8a8a9e]">Cap:</span>
                              <span className="text-yellow-400 font-medium">{captain.nickname}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3 text-blue-400" />
                              <span className="text-[#8a8a9e]">{officialCount} titulares</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <RotateCcw className="w-3 h-3 text-[#5a5a6e]" />
                              <span className="text-[#5a5a6e]">{reserveCount} reservas</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Lines Desativadas */}
            {disbandedTeams.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-[#f0f0f5] mb-4 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#5a5a6e]" />
                  Lines Desativadas ({disbandedTeams.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
                  {disbandedTeams.map((team: TeamItem) => (
                    <div
                      key={team.id}
                      onClick={() => setSelectedTeam(team.id)}
                      className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-5 cursor-pointer hover:border-red-500/30 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <Shield className="w-6 h-6 text-[#5a5a6e]" />
                        <div>
                          <h4 className="font-bold text-[#5a5a6e]">{team.name}</h4>
                          <span className="text-xs text-[#3a3a4e]">Desativada</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </MainLayout>
    );
  }

  // ===== LISTAGEM DE CLÃS =====
  return (
    <MainLayout>
      <div className="min-h-screen bg-[#0a0a0f]">
        {/* Header */}
        <div className="bg-[#12121a] border-b border-[#2a2a3a]">
          <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8 text-red-400" />
              <h1 className="text-3xl md:text-4xl font-extrabold text-[#f0f0f5]">Clãs</h1>
            </div>
            <p className="text-[#8a8a9e]">
              Conheça todas as organizações e suas lines registradas no sistema
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
                    placeholder="Buscar clã..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm placeholder-[#5a5a6e] focus:outline-none focus:border-red-500/50 min-w-[250px]"
                  />
                </div>

                <label className="flex items-center gap-2 text-sm text-[#8a8a9e] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showDisbanded}
                    onChange={(e) => setShowDisbanded(e.target.checked)}
                    className="w-4 h-4 rounded border-[#2a2a3a] bg-[#1a1a24] text-red-500 focus:ring-red-500/20"
                  />
                  Mostrar clãs inativos
                </label>
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

          {/* ===== CARDS DE RESUMO ===== */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-red-400" />
                  <span className="text-xs text-[#5a5a6e] uppercase">Total Clãs</span>
                </div>
                <p className="text-2xl font-bold text-red-400">{stats.totalClans}</p>
              </div>
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-[#5a5a6e] uppercase">Total Lines</span>
                </div>
                <p className="text-2xl font-bold text-blue-400">{stats.totalTeams}</p>
              </div>
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-[#5a5a6e] uppercase">Jogadores</span>
                </div>
                <p className="text-2xl font-bold text-green-400">{stats.totalPlayers}</p>
              </div>
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs text-[#5a5a6e] uppercase">Clãs Ativos</span>
                </div>
                <p className="text-2xl font-bold text-yellow-400">{stats.activeClans}</p>
              </div>
            </div>
          )}

          {/* ===== LOADING ===== */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-red-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[#5a5a6e]">Carregando clãs...</p>
            </div>
          )}

          {/* ===== GRID DE CLÃS ===== */}
          {!isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedClans.map((clan: ClanItem & { totalPlayers: number; activeLines: number }) => (
                <div
                  key={clan.id}
                  onClick={() => setSelectedClan(clan.id)}
                  className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-5 cursor-pointer hover:border-red-500/30 hover:bg-[#1a1a24] transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 border border-[#2a2a3a]"
                        style={{
                          background: clan.color
                            ? `linear-gradient(135deg, ${clan.color}30, ${clan.color}10)`
                            : "linear-gradient(135deg, rgba(255,59,59,0.2), rgba(255,59,59,0.05))",
                        }}
                      >
                        {clan.logo ? (
                          <img src={clan.logo} alt={clan.name} className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <Shield className="w-7 h-7" style={{ color: clan.color ?? "#ff3b3b" }} />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-[#f0f0f5] group-hover:text-red-400 transition-colors">
                          {clan.name}
                        </h3>
                        <span className="text-xs text-[#5a5a6e]">[{clan.tag}]</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#2a2a3a] group-hover:text-red-400 transition-colors" />
                  </div>

                  {clan.description && (
                    <p className="text-sm text-[#5a5a6e] mb-4 line-clamp-2">{clan.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-[#8a8a9e]">{clan.teams?.length ?? 0} lines</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-[#8a8a9e]">{clan.totalPlayers} jogadores</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-yellow-400" />
                      <span className="text-[#8a8a9e]">{clan.activeLines} ativas</span>
                    </div>
                  </div>

                  {/* Preview das lines */}
                  {clan.teams && clan.teams.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[#2a2a3a]">
                      <div className="flex flex-wrap gap-1.5">
                        {clan.teams.slice(0, 4).map((team: TeamItem) => (
                          <span
                            key={team.id}
                            className={`px-2 py-0.5 rounded text-xs font-medium border ${
                              team.status === "active"
                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                : "bg-[#1a1a24] text-[#5a5a6e] border-[#2a2a3a]"
                            }`}
                          >
                            {team.name}
                          </span>
                        ))}
                        {clan.teams.length > 4 && (
                          <span className="px-2 py-0.5 rounded text-xs text-[#5a5a6e]">
                            +{clan.teams.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {sortedClans.length === 0 && !isLoading && (
            <div className="text-center py-16">
              <Shield className="w-12 h-12 mx-auto mb-4 text-[#2a2a3a]" />
              <p className="text-[#5a5a6e] text-lg font-medium">Nenhum clã encontrado</p>
              <p className="text-[#3a3a4e] text-sm mt-1">
                {search ? "Tente ajustar a busca" : "Nenhum clã registrado"}
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}