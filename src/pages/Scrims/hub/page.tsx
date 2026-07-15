import { useState, useMemo } from "react";
import { useParams, Link, Navigate, useLocation } from "react-router-dom";
import {
  Swords, Trophy, BarChart3, Users, Target, Shield, TrendingUp,
  Crosshair, Medal, Award, Calendar, Plus, AlertTriangle,
} from "lucide-react";

import MainLayout from "@/components/layout/MainLayout";
import { trpc } from "@/providers/trpc";

// ✅ UI Components migrados para shared
import {
  FilterBar,
  SearchInput,
  SelectFilter,
  EmptyState,
  LoadingSpinner,
  RankBadge,
  SummaryCards,
  SortHeader,
} from "@/components/shared";

// ✅ Error Boundary
import { ErrorBoundary, ErrorFallback } from "@/components/shared/ErrorBoundary";

// ✅ Tipos migrados para o arquivo de tipos do feature
import type { ScrimsTabKey, TabConfig, EnrichedScrimPlayer, EnrichedScrimTeam } from "@/features/scrims/types";

// ✅ Constantes (TABS) migradas para o arquivo de tipos
import { TABS } from "@/features/scrims/constants"; // ✅ Importando do arquivo .tsx

// ✅ Import relativo simples para a página de resultado
import MatchResult from "@/pages/Scrims/match/[id]/page";

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function ScrimsHub() {
  const { tab } = useParams<{ tab?: string }>();
  const location = useLocation();

  if (location.pathname.includes("/match/")) {
    return <MatchResult />;
  }

  if (!tab) {
    return <Navigate to="/scrims/agendados" replace />;
  }

  const activeTab: ScrimsTabKey = (TABS.find(t => t.key === tab)?.key) || "agendados";
  const activeTabConfig = TABS.find((t) => t.key === activeTab)!;
  const gestaoTabs = TABS.filter((t) => t.group === "gestao");
  const rankingTabs = TABS.filter((t) => t.group === "ranking");

  const renderTabButton = (tabConfig: TabConfig) => {
    const isActive = activeTab === tabConfig.key;
    const fullPath = `/scrims/hub/${tabConfig.key}`;

    if (isActive) {
      return (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-sm shadow-emerald-500/5">
          {tabConfig.icon}
          {tabConfig.label}
        </div>
      );
    }

    return (
      <Link to={fullPath} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-[#5a5a6e] hover:text-[#f0f0f5] hover:bg-[#1a1a24]">
        {tabConfig.icon}
        {tabConfig.label}
      </Link>
    );
  };

  return (
    <MainLayout>
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        {/* Header Dinâmico */}
        <div className="bg-[#12121a] border-b border-[#2a2a3a] -mx-4 lg:-mx-8 px-4 lg:px-8 py-12 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Swords className="w-8 h-8 text-emerald-400" />
                <h1 className="text-3xl md:text-4xl font-extrabold text-[#f0f0f5]">
                  Centro de Scrims
                </h1>
              </div>
              <p className="text-[#8a8a9e]">{activeTabConfig.label}</p>
            </div>
            
            {activeTab === "agendados" && (
              <Link to="/scrims/novo" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 w-fit">
                <Plus className="w-4 h-4" /> Nova Scrim
              </Link>
            )}
          </div>
        </div>

        {/* Tabs Agrupadas */}
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-2 mb-6 space-y-2">
          <div className="flex flex-wrap gap-1">{gestaoTabs.map((tabConfig) => renderTabButton(tabConfig))}</div>
          <div className="border-t border-[#2a2a3a] pt-2 flex flex-wrap gap-1">{rankingTabs.map((tabConfig) => renderTabButton(tabConfig))}</div>
        </div>

        {/* Tab Content com Error Boundary */}
        <ErrorBoundary fallback={<ErrorFallback />}>
          <div className="pb-12">
            {activeTab === "agendados" && <PartidasTab />}
            {activeTab === "ranking-jogadores" && <RankingJogadoresTab />}
            {activeTab === "ranking-times" && <RankingTimesTab />}
          </div>
        </ErrorBoundary>
      </div>
    </MainLayout>
  );
}

// ============================================================
// TAB: PARTIDAS AGENDADAS
// ============================================================

function PartidasTab() {
  const queryResult = trpc.unified.listScrims.useQuery();
  
  const isLoading = queryResult.isLoading;
  const isError = queryResult.isError;
  const error = queryResult.error;
  const scrimsList = queryResult.data;

  if (isLoading) return <LoadingSpinner text="Carregando partidas..." />;
  
  if (isError) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-red-400 mb-2">Erro ao buscar partidas</h2>
        <p className="text-sm text-red-300/80 max-w-lg mx-auto mb-2 bg-black/30 p-3 rounded-lg font-mono text-left">
          {error?.message || "Erro desconhecido no servidor"}
        </p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm font-medium transition-colors">
          Tentar Novamente
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="bg-[#1a1a24] rounded-xl border border-[#2a2a3a] p-6 text-center">
        <Swords className="w-12 h-12 text-[#5a5a6e] mx-auto mb-3" />
        <h3 className="text-lg font-bold text-[#f0f0f5] mb-2">Histórico de Scrims</h3>
        <p className="text-sm text-[#8a8a9e] max-w-md mx-auto mb-4">
          Clique em uma partida para ver a tela de resultado e as estatísticas detalhadas dos jogadores.
        </p>
        <div className="flex justify-center gap-4 text-sm text-[#8a8a9e]">
          <div className="bg-[#12121a] rounded-lg px-4 py-2 border border-[#2a2a3a]">
            Total de Scrims: <span className="text-emerald-400 font-bold ml-1">{scrimsList?.length || 0}</span>
          </div>
        </div>
      </div>

      {scrimsList && scrimsList.length > 0 && (
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2a2a3a]">
            <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" /> Últimas Partidas
            </h3>
          </div>
          <div className="divide-y divide-[#2a2a3a] max-h-[500px] overflow-y-auto">
            {scrimsList.slice(0, 20).map((scrim: any) => (
              <Link to={`/scrims/match/${scrim.id}`} key={scrim.id} className="flex items-center justify-between px-6 py-4 hover:bg-[#1a1a24] transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 group-hover:bg-red-500/20 flex items-center justify-center transition-colors">
                    <Swords className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#f0f0f5] group-hover:text-red-400 transition-colors">
                      {scrim.team1Name || "TBD"} <span className="text-[#5a5a6e] mx-2 font-normal">vs</span> {scrim.team2Name || "TBD"}
                    </p>
                    <p className="text-xs text-[#5a5a6e]">{scrim.date}</p>
                  </div>
                </div>
                <div className="text-xs text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  Ver Detalhes
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// TAB: RANKING JOGADORES
// ============================================================

function RankingJogadoresTab() {
  const [search, setSearch] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [sortField, setSortField] = useState<"scrimKills" | "scrimMvps" | "scrimKdRatio" | "totalMatches">("scrimKills");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const queryResult = trpc.unified.listPlayers.useQuery();

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSortField(field); setSortDir("desc"); }
  };

  const clearFilters = () => { setSearch(""); setSelectedTeam(null); };
  const hasFilters = !!search || !!selectedTeam;

  const playersList = queryResult.data;

  const filteredPlayers = useMemo(() => {
    if (!playersList) return [];
    let list = playersList as unknown as EnrichedScrimPlayer[];
    if (selectedTeam) list = list.filter((p) => p.teamName === selectedTeam);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.nickname.toLowerCase().includes(q) || (p.teamName?.toLowerCase() ?? "").includes(q));
    }
    return list;
  }, [playersList, selectedTeam, search]);

  const sortedPlayers = useMemo(() => {
    return [...filteredPlayers].sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[sortField] ?? 0;
      const bVal = (b as unknown as Record<string, unknown>)[sortField] ?? 0;
      return sortDir === "desc" ? (bVal as number) - (aVal as number) : (aVal as number) - (bVal as number);
    });
  }, [filteredPlayers, sortField, sortDir]);

  const allTeams = useMemo(() => {
    if (!playersList) return [];
    return [...new Set(playersList.map((p: any) => p.teamName).filter(Boolean))].sort();
  }, [playersList]);

  const summaryCards = [
    { icon: <Users className="w-4 h-4 text-red-400" />, label: "Jogadores", value: sortedPlayers.length },
    { icon: <Target className="w-4 h-4 text-red-400" />, label: "Total Kills", value: sortedPlayers.reduce((s, p) => s + (p.scrimKills || 0), 0), valueColor: "text-red-400" },
    { icon: <Crosshair className="w-4 h-4 text-orange-400" />, label: "Total Assists", value: sortedPlayers.reduce((s, p) => s + (p.scrimAssists || 0), 0), valueColor: "text-orange-400" },
    { icon: <Award className="w-4 h-4 text-yellow-400" />, label: "Total MVPs", value: sortedPlayers.reduce((s, p) => s + (p.scrimMvps || 0), 0), valueColor: "text-yellow-400" },
  ];

  if (queryResult.isLoading) return <LoadingSpinner text="Carregando ranking de scrims..." />;
  if (queryResult.isError) return <ErrorFallback />;

  return (
    <div className="space-y-6">
      <FilterBar hasFilters={hasFilters} onClear={clearFilters}>
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar jogador ou time..." minWidth="260px" />
        <SelectFilter icon={<Shield className="w-4 h-4 text-[#5a5a6e]" />} value={selectedTeam ?? ""} onChange={(v) => setSelectedTeam(v || null)} placeholder="Todos os times" options={allTeams.map((t: any) => ({ value: String(t), label: String(t) }))} minWidth="160px" />
      </FilterBar>

      {summaryCards.length > 0 && <SummaryCards cards={summaryCards} columns={4} />}

      <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center justify-between">
          <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2"><TrendingUp className="w-5 h-5 text-red-400" /> Ranking de Jogadores em Scrims</h3>
          <span className="text-xs text-[#5a5a6e]">{sortedPlayers.length} jogadores</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a2a3a] bg-[#0a0a0f]">
                <th className="px-4 py-3 text-center w-12"><span className="text-xs font-medium text-[#5a5a6e] uppercase">#</span></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Jogador</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Time</th>
                <th className="px-4 py-3 text-center"><SortHeader field="scrimKills" label="Kills" currentField={sortField} direction={sortDir} onSort={handleSort} /></th>
                <th className="px-4 py-3 text-center"><SortHeader field="scrimMvps" label="MVPs" currentField={sortField} direction={sortDir} onSort={handleSort} /></th>
                <th className="px-4 py-3 text-center"><SortHeader field="scrimKdRatio" label="K/D" currentField={sortField} direction={sortDir} onSort={handleSort} /></th>
                <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">V/D</th>
                <th className="px-6 py-3 text-center bg-red-500/5"><SortHeader field="totalMatches" label="Partidas" currentField={sortField} direction={sortDir} onSort={handleSort} /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a3a]">
              {sortedPlayers.map((p, index) => {
                const isTop3 = index < 3;
                return (
                  <tr key={p.nickname} className={`hover:bg-[#1a1a24] transition-colors group ${isTop3 ? "bg-gradient-to-r from-red-500/5 to-transparent border-l-2 border-red-400" : ""}`}>
                    <td className="px-4 py-3 text-center"><RankBadge index={index} /></td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors"><Target className="w-4 h-4 text-red-400" /></div>
                        <span className="text-sm font-bold text-[#f0f0f5] group-hover:text-red-400 transition-colors">{p.nickname}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm text-[#8a8a9e]">{p.teamName ?? "—"}</td>
                    <td className="px-4 py-3 text-center text-sm text-red-400/80 font-medium">{p.scrimKills}</td>
                    <td className="px-4 py-3 text-center text-sm text-yellow-400/80">{p.scrimMvps > 0 ? p.scrimMvps : "—"}</td>
                    <td className="px-4 py-3 text-center text-sm text-[#8a8a9e]">{p.scrimKdRatio > 0 ? p.scrimKdRatio : "—"}</td>
                    <td className="px-4 py-3 text-center text-sm">
                      <span className="text-green-400/80">{p.scrimWins}</span>
                      <span className="text-[#5a5a6e] mx-1">/</span>
                      <span className="text-red-400/50">{p.scrimLosses}</span>
                    </td>
                    <td className="px-6 py-3 text-center bg-red-500/5"><span className="text-sm font-bold text-red-400">{p.totalMatches}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {sortedPlayers.length === 0 && <EmptyState icon={<Target className="w-12 h-12" />} title="Nenhum jogador encontrado" subtitle="Tente ajustar os filtros" />}
      </div>
    </div>
  );
}

// ============================================================
// TAB: RANKING TIMES
// ============================================================

function RankingTimesTab() {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<"scrimKills" | "scrimWins" | "scrimMatches">("scrimWins");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const queryResult = trpc.unified.listTeams.useQuery();

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSortField(field); setSortDir("desc"); }
  };

  const clearFilters = () => { setSearch(""); };
  const hasFilters = !!search;

  const filteredTeams = useMemo(() => {
    if (!queryResult.data) return [];
    return (queryResult.data as unknown as Array<Record<string, any>>)
      .filter(t => (t.scrimMatches ?? 0) > 0)
      .map(t => ({
        name: t.name, tag: t.tag, scrimKills: t.scrimKills ?? 0, scrimWins: t.scrimWins ?? 0,
        scrimLosses: t.scrimLosses ?? 0, scrimMatches: t.scrimMatches ?? 0,
        winRate: (t.scrimMatches ?? 0) > 0 ? Math.round(((t.scrimWins ?? 0) / (t.scrimMatches ?? 0)) * 1000) / 10 : 0,
      })) as EnrichedScrimTeam[];
  }, [queryResult.data]);

  const sortedTeams = useMemo(() => {
    return [...filteredTeams].sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[sortField] ?? 0;
      const bVal = (b as unknown as Record<string, unknown>)[sortField] ?? 0;
      return sortDir === "desc" ? (bVal as number) - (aVal as number) : (aVal as number) - (bVal as number);
    });
  }, [filteredTeams, sortField, sortDir]);

  const summaryCards = [
    { icon: <Shield className="w-4 h-4 text-red-400" />, label: "Times", value: sortedTeams.length },
    { icon: <Target className="w-4 h-4 text-red-400" />, label: "Total Kills", value: sortedTeams.reduce((s, t) => s + (t.scrimKills || 0), 0), valueColor: "text-red-400" },
    { icon: <Trophy className="w-4 h-4 text-yellow-400" />, label: "Vitórias", value: sortedTeams.reduce((s, t) => s + (t.scrimWins || 0), 0), valueColor: "text-yellow-400" },
    { icon: <BarChart3 className="w-4 h-4 text-blue-400" />, label: "Partidas", value: sortedTeams.reduce((s, t) => s + (t.scrimMatches || 0), 0) },
  ];

  if (queryResult.isLoading) return <LoadingSpinner text="Carregando ranking de times..." />;
  if (queryResult.isError) return <ErrorFallback />;

  return (
    <div className="space-y-6">
      <FilterBar hasFilters={hasFilters} onClear={clearFilters}>
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar time ou tag..." minWidth="260px" />
      </FilterBar>

      {summaryCards.length > 0 && <SummaryCards cards={summaryCards} columns={4} />}

      <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center justify-between">
          <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2"><Medal className="w-5 h-5 text-yellow-400" /> Ranking de Times em Scrims</h3>
          <span className="text-xs text-[#5a5a6e]">{sortedTeams.length} times</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a2a3a] bg-[#0a0a0f]">
                <th className="px-4 py-3 text-center w-12"><span className="text-xs font-medium text-[#5a5a6e] uppercase">#</span></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Time</th>
                <th className="px-4 py-3 text-center"><SortHeader field="scrimKills" label="Kills" currentField={sortField} direction={sortDir} onSort={handleSort} /></th>
                <th className="px-4 py-3 text-center"><SortHeader field="scrimWins" label="Vitórias" currentField={sortField} direction={sortDir} onSort={handleSort} /></th>
                <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Derrotas</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Win Rate</th>
                <th className="px-6 py-3 text-center bg-red-500/5"><SortHeader field="scrimMatches" label="Partidas" currentField={sortField} direction={sortDir} onSort={handleSort} /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a3a]">
              {sortedTeams.map((t, index) => {
                const isTop3 = index < 3;
                return (
                  <tr key={t.name} className={`hover:bg-[#1a1a24] transition-colors group ${isTop3 ? "bg-gradient-to-r from-yellow-500/5 to-transparent border-l-2 border-yellow-400" : ""}`}>
                    <td className="px-4 py-3 text-center"><RankBadge index={index} /></td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors"><Shield className="w-4 h-4 text-red-400" /></div>
                        <div>
                          <span className="text-sm font-bold text-[#f0f0f5] group-hover:text-red-400 transition-colors">{t.name}</span>
                          {t.tag && <span className="text-[10px] text-[#5a5a6e] ml-2">[{t.tag}]</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-red-400/80 font-medium">{t.scrimKills}</td>
                    <td className="px-4 py-3 text-center text-sm text-yellow-400/80 font-bold">{t.scrimWins}</td>
                    <td className="px-4 py-3 text-center text-sm text-red-400/50">{t.scrimLosses}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm font-bold ${t.winRate >= 60 ? "text-green-400" : t.winRate >= 40 ? "text-yellow-400" : "text-red-400"}`}>{t.winRate}%</span>
                    </td>
                    <td className="px-6 py-3 text-center bg-red-500/5"><span className="text-sm font-bold text-red-400">{t.scrimMatches}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {sortedTeams.length === 0 && <EmptyState icon={<Shield className="w-12 h-12" />} title="Nenhum time encontrado" subtitle="Tente ajustar os filtros" />}
      </div>
    </div>
  );
}