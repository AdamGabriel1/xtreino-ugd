import { useState, useMemo } from "react";
import { Shield, Search, Filter, Layers, Users, Star } from "lucide-react";
import type { ClanItem, ClanWithStats, StatsSummary } from "@/types/clans";
import ClanCard from "./ClanCard";
import StatsCards from "./StatsCards";

interface ClanListProps {
  clans: ClanItem[];
  isLoading: boolean;
  onClanClick: (clanId: number) => void;
}

type SortField = "name" | "teamsCount" | "playersCount";
type SortDir = "asc" | "desc";

export default function ClanList({ clans, isLoading, onClanClick }: ClanListProps) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [showDisbanded, setShowDisbanded] = useState(false);

  const enrichedClans = useMemo((): ClanWithStats[] => {
    return clans.map((clan) => {
      const activeLines = clan.teams?.filter((t) => t.status === "active").length ?? 0;
      const totalPlayers = clan.teams?.reduce((acc, t) => acc + (t.players?.length ?? 0), 0) ?? 0;
      return { ...clan, totalPlayers, activeLines };
    });
  }, [clans]);

  const sortedClans = useMemo(() => {
    const filtered = enrichedClans.filter((clan) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        clan.name.toLowerCase().includes(q) ||
        clan.tag.toLowerCase().includes(q) ||
        (clan.description?.toLowerCase().includes(q) ?? false)
      );
    }).filter((clan) => {
      if (showDisbanded) return true;
      return clan.activeLines > 0 || (clan.teams?.length ?? 0) === 0;
    });

    return [...filtered].sort((a, b) => {
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

  const stats: StatsSummary | null = useMemo(() => {
    if (!clans.length) return null;
    const allTeams = clans.flatMap((c) => c.teams ?? []);
    const allPlayers = allTeams.flatMap((t) => t.players ?? []);
    return {
      totalClans: clans.length,
      totalTeams: allTeams.length,
      totalPlayers: allPlayers.length,
      activeClans: clans.filter((c) => c.teams?.some((t) => t.status === "active")).length,
    };
  }, [clans]);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="bg-[#12121a] border-b border-[#2a2a3a]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-emerald-400" />
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#f0f0f5]">Clãs</h1>
          </div>
          <p className="text-[#8a8a9e]">
            Conheça todas as organizações e suas lines registradas no sistema
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6 space-y-6">
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
                  className="pl-10 pr-4 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm placeholder-[#5a5a6e] focus:outline-none focus:border-emerald-500/50 min-w-[250px]"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-[#8a8a9e] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showDisbanded}
                  onChange={(e) => setShowDisbanded(e.target.checked)}
                  className="w-4 h-4 rounded border-[#2a2a3a] bg-[#1a1a24] text-emerald-500 focus:ring-emerald-500/20"
                />
                Mostrar clãs inativos
              </label>
            </div>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>

        {stats && (
          <StatsCards
            stats={[
              { icon: <Shield className="w-4 h-4 text-emerald-400" />, label: "Total Clãs", value: stats.totalClans, color: "#10b981" },
              { icon: <Layers className="w-4 h-4 text-blue-400" />, label: "Total Lines", value: stats.totalTeams, color: "#3b82f6" },
              { icon: <Users className="w-4 h-4 text-emerald-400" />, label: "Jogadores", value: stats.totalPlayers, color: "#10b981" },
              { icon: <Star className="w-4 h-4 text-yellow-400" />, label: "Clãs Ativos", value: stats.activeClans, color: "#fbbf24" },
            ]}
          />
        )}

        {isLoading && (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[#5a5a6e]">Carregando clãs...</p>
          </div>
        )}

        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedClans.map((clan) => (
              <ClanCard key={clan.id} clan={clan} onClick={() => onClanClick(clan.id)} />
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
  );
}