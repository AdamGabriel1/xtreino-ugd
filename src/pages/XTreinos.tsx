import { useState, useMemo } from "react";
import {
  Dumbbell,
  Calendar,
  Clock,
  Trophy,
  Target,
  Filter,
  TrendingUp,
  Swords,
  Medal,
  BarChart3,
  Users,
  CalendarDays,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import MainLayout from "@/layout/MainLayout";
import { useXTreinos } from "../hooks/useXTreinos.js";
import type {
  AdminTab,
  Modality,
  XTreinoStatus,
  ScheduleStatus,
} from "../pages/admin/types.js";

// Tabs (agora com suporte a usuário normal)
import { XTreinosList } from "../tabs/XTreinosList";
import { ResultsTab } from "../tabs/ResultsTab";
import { PlayersTab } from "../tabs/PlayersTab";
import { ScheduleTab } from "../tabs/ScheduleTab";
import { InscricoesTab } from "../tabs/InscricoesTab";

// Sistema de pontuação por posição
const POSITION_POINTS: Record<number, number> = {
  1: 15, 2: 12, 3: 10, 4: 9, 5: 8, 6: 7, 7: 6, 8: 5,
  9: 4, 10: 3, 11: 2, 12: 1, 13: 1, 14: 0, 15: 0,
};

const KILL_POINTS = 1;

interface TeamStats {
  teamName: string;
  date: string;
  q1Pos: number | null;
  q2Pos: number | null;
  q3Pos: number | null;
  q1Kills: number;
  q2Kills: number;
  q3Kills: number;
  totalKills: number;
  posPoints: number;
  killPoints: number;
  totalPoints: number;
}

export default function XTreinos() {
  // ===== ABA PRINCIPAL (Classificação) =====
  const [selectedMonth, setSelectedMonth] = useState<string>("2026-05");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [sortBy, setSortBy] = useState<"total" | "kills" | "pos">("total");

  // ===== TABS SECUNDÁRIAS =====
  const [activeTab, setActiveTab] = useState<AdminTab | "ranking">("ranking");

  const {
    xtreinosList,
    allResults,
    allPlayerStats,
    scheduleList,
    settings,
    allTeams,
    registrationsList,
    registerTeam,
    unregisterTeam,
    isLoading,
  } = useXTreinos();

  // Selected xtreino para tabs
  const [selectedXtForResults, setSelectedXtForResults] = useState<number | null>(null);
  const [selectedXtForPlayers, setSelectedXtForPlayers] = useState<number | null>(null);
  const [selectedXtForInscricoes, setSelectedXtForInscricoes] = useState<number | null>(null);

  // Buscar detalhes do xtreino selecionado
  const { data: xtDetailResults } = trpc.xtreinos.getById.useQuery(
    { id: selectedXtForResults ?? 0 },
    { enabled: selectedXtForResults !== null }
  );
  const { data: xtDetailPlayers } = trpc.xtreinos.getById.useQuery(
    { id: selectedXtForPlayers ?? 0 },
    { enabled: selectedXtForPlayers !== null }
  );

  // ===== HELPERS DE CAST =====
  const castXTreinos = (data: typeof xtreinosList): import("../pages/admin/types").XTreino[] | undefined => {
    if (!data) return undefined;
    return data.map((x) => ({
      ...x,
      modality: x.modality as Modality,
      status: x.status as XTreinoStatus,
    }));
  };

  const castResults = (data: typeof allResults): import("../pages/admin/types").XTreinoResult[] | undefined => {
    if (!data) return undefined;
    return data.map((r) => ({
      ...r,
      xtreinoId: r.xtreinoId ?? 0,
    }));
  };

  const castPlayerStats = (data: typeof allPlayerStats): import("../pages/admin/types").PlayerStat[] | undefined => {
    if (!data) return undefined;
    return data.map((p) => ({
      ...p,
      xtreinoId: p.xtreinoId ?? 0,
    }));
  };

  const castSchedule = (data: typeof scheduleList): import("../pages/admin/types").ScheduleItem[] | undefined => {
    if (!data) return undefined;
    return data.map((s) => ({
      ...s,
      status: s.status as ScheduleStatus,
    }));
  };

  const castXtDetail = (data: typeof xtDetailResults): import("../pages/admin/types").XTreino | null => {
    if (!data) return null;
    return {
      ...data,
      modality: (data as any).modality as Modality,
      status: (data as any).status as XTreinoStatus,
      results: (data as any).results,
      playerStats: (data as any).playerStats,
      registrations: (data as any).registrations,
    };
  };

  // ===== FIXED TEAMS =====
  const fixedTeams = (() => {
    try {
      const raw = settings?.fixedTeamsList;
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();

  // ===== CLASSIFICAÇÃO (Ranking) =====
  const availableMonths = useMemo(() => {
    if (!allResults) return [];
    const months = new Set<string>();
    allResults.forEach((r) => {
      if (r.date) months.add(r.date.substring(0, 7));
    });
    return Array.from(months).sort();
  }, [allResults]);

  const availableDates = useMemo(() => {
    if (!allResults || !selectedMonth) return [];
    const dates = new Set<string>();
    allResults.forEach((r) => {
      if (r.date && r.date.startsWith(selectedMonth)) dates.add(r.date);
    });
    return Array.from(dates).sort();
  }, [allResults, selectedMonth]);

  const teamStats: TeamStats[] = useMemo(() => {
    if (!allResults || !allPlayerStats) return [];

    const statsMap = new Map<string, TeamStats>();

    allResults.forEach((r) => {
      if (selectedMonth && !r.date?.startsWith(selectedMonth)) return;
      if (selectedDate && r.date !== selectedDate) return;

      const key = `${r.date}-${r.teamName}`;
      const q1Pos = r.q1Pos ?? 0;
      const q2Pos = r.q2Pos ?? 0;
      const q3Pos = r.q3Pos ?? 0;

      const posPoints =
        (POSITION_POINTS[q1Pos] || 0) +
        (POSITION_POINTS[q2Pos] || 0) +
        (POSITION_POINTS[q3Pos] || 0);

      statsMap.set(key, {
        teamName: r.teamName,
        date: r.date,
        q1Pos: r.q1Pos,
        q2Pos: r.q2Pos,
        q3Pos: r.q3Pos,
        q1Kills: 0,
        q2Kills: 0,
        q3Kills: 0,
        totalKills: 0,
        posPoints,
        killPoints: 0,
        totalPoints: posPoints,
      });
    });

    allPlayerStats.forEach((p) => {
      if (selectedMonth && !p.date?.startsWith(selectedMonth)) return;
      if (selectedDate && p.date !== selectedDate) return;

      const key = `${p.date}-${p.teamName}`;
      const existing = statsMap.get(key);
      const killPoints = (p.totalKills || 0) * KILL_POINTS;

      if (existing) {
        existing.q1Kills += p.q1Kills || 0;
        existing.q2Kills += p.q2Kills || 0;
        existing.q3Kills += p.q3Kills || 0;
        existing.totalKills += p.totalKills || 0;
        existing.killPoints += killPoints;
        existing.totalPoints = existing.posPoints + existing.killPoints;
      } else {
        statsMap.set(key, {
          teamName: p.teamName,
          date: p.date,
          q1Pos: null,
          q2Pos: null,
          q3Pos: null,
          q1Kills: p.q1Kills || 0,
          q2Kills: p.q2Kills || 0,
          q3Kills: p.q3Kills || 0,
          totalKills: p.totalKills || 0,
          posPoints: 0,
          killPoints,
          totalPoints: killPoints,
        });
      }
    });

    return Array.from(statsMap.values());
  }, [allResults, allPlayerStats, selectedMonth, selectedDate]);

  const sortedStats = useMemo(() => {
    return [...teamStats].sort((a, b) => {
      if (sortBy === "total") return b.totalPoints - a.totalPoints;
      if (sortBy === "kills") return b.totalKills - a.totalKills;
      if (sortBy === "pos") return b.posPoints - a.posPoints;
      return 0;
    });
  }, [teamStats, sortBy]);

  const monthStats = useMemo(() => {
    if (!teamStats.length) return null;
    return {
      totalTeams: new Set(teamStats.map((s) => s.teamName)).size,
      totalKills: teamStats.reduce((sum, s) => sum + s.totalKills, 0),
      totalPosPoints: teamStats.reduce((sum, s) => sum + s.posPoints, 0),
      totalKillPoints: teamStats.reduce((sum, s) => sum + s.killPoints, 0),
      totalPoints: teamStats.reduce((sum, s) => sum + s.totalPoints, 0),
    };
  }, [teamStats]);

  // ===== STYLES =====
  const getPosColor = (pos: number | null) => {
    if (!pos) return "text-[#5a5a6e]";
    if (pos === 1) return "text-yellow-400 font-bold";
    if (pos === 2) return "text-gray-300 font-bold";
    if (pos === 3) return "text-amber-500 font-bold";
    return "text-[#8a8a9e]";
  };

  const getPosBg = (pos: number | null) => {
    if (!pos) return "";
    if (pos === 1) return "bg-yellow-500/10";
    if (pos === 2) return "bg-gray-400/10";
    if (pos === 3) return "bg-amber-500/10";
    return "";
  };

  const getRankStyle = (index: number) => {
    if (index === 0) return "bg-yellow-500/5 border-l-2 border-yellow-500";
    if (index === 1) return "bg-gray-400/5 border-l-2 border-gray-400";
    if (index === 2) return "bg-amber-500/5 border-l-2 border-amber-500";
    return "border-l-2 border-transparent";
  };

  // ===== TABS CONFIG =====
  const tabs = [
    { key: "ranking" as const, label: "Classificação", icon: Trophy },
    { key: "inscricoes" as AdminTab, label: "Inscrições", icon: Users },
    { key: "list" as AdminTab, label: "Xtreinos", icon: CalendarDays },
    { key: "results" as AdminTab, label: "Resultados", icon: BarChart3 },
    { key: "players" as AdminTab, label: "Jogadores", icon: Target },
    { key: "schedule" as AdminTab, label: "Agenda", icon: Calendar },
  ];

  const safeXTreinos = castXTreinos(xtreinosList);
  const safeResults = castResults(allResults);
  const safePlayerStats = castPlayerStats(allPlayerStats);
  const safeSchedule = castSchedule(scheduleList);

  const safeXtDetailResults = castXtDetail(xtDetailResults);
  const safeXtDetailPlayers = castXtDetail(xtDetailPlayers);

  const resultsTabDetail = selectedXtForResults
    ? (safeXtDetailResults ? { results: safeXtDetailResults.results ?? [] } : undefined)
    : undefined;

  const playersTabDetail = selectedXtForPlayers
    ? (safeXtDetailPlayers ? { playerStats: safeXtDetailPlayers.playerStats ?? [] } : undefined)
    : undefined;

  const normalizeRegistrations = (arr: any[] | undefined) => {
    if (!arr) return [];
    return arr.map((r) => ({
      ...r,
      position: (r as any).position ?? 0,
    }));
  };

  const inscricoesRegistrations = normalizeRegistrations(registrationsList);

  return (
    <MainLayout>
      {/* Header */}
      <div className="bg-[#12121a] border-b border-[#2a2a3a]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Dumbbell className="w-8 h-8 text-red-400" />
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#f0f0f5]">XTreinos Underground</h1>
          </div>
          <p className="text-[#8a8a9e]">Classificação, inscrições, resultados e agenda dos xtreinos</p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6">
        {/* Tabs Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                  isActive
                    ? "bg-red-500/10 text-red-400 border border-red-500/20"
                    : "bg-[#1a1a24] text-[#8a8a9e] border border-[#2a2a3a] hover:text-[#f0f0f5]"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ===== TAB: CLASSIFICAÇÃO (Ranking) ===== */}
        {activeTab === "ranking" && (
          <div className="space-y-6">
            {/* Filtros */}
            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                <div className="flex items-center gap-2 text-[#8a8a9e]">
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-medium">Filtros:</span>
                </div>

                <div className="flex flex-wrap gap-3 flex-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#5a5a6e]" />
                    <select
                      value={selectedMonth}
                      onChange={(e) => { setSelectedMonth(e.target.value); setSelectedDate(""); }}
                      className="px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50 min-w-[140px]"
                    >
                      {availableMonths.map((m) => (
                        <option key={m} value={m}>
                          {m.split("-")[1]}/{m.split("-")[0]}
                        </option>
                      ))}
                      {!availableMonths.length && <option value="">Carregando...</option>}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#5a5a6e]" />
                    <select
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50 min-w-[140px]"
                    >
                      <option value="">Todos os dias</option>
                      {availableDates.map((d) => (
                        <option key={d} value={d}>
                          {d.split("-")[2]}/{d.split("-")[1]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#5a5a6e]" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as "total" | "kills" | "pos")}
                      className="px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50 min-w-[160px]"
                    >
                      <option value="total">Ordenar: Total</option>
                      <option value="kills">Ordenar: Kills</option>
                      <option value="pos">Ordenar: Posição</option>
                    </select>
                  </div>
                </div>

                {(selectedDate || sortBy !== "total") && (
                  <button
                    onClick={() => { setSelectedDate(""); setSortBy("total"); }}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            </div>

            {/* Cards de resumo */}
            {monthStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-[#5a5a6e] uppercase">Equipes</span>
                  </div>
                  <p className="text-2xl font-bold text-[#f0f0f5]">{monthStats.totalTeams}</p>
                </div>
                <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Swords className="w-4 h-4 text-red-400" />
                    <span className="text-xs text-[#5a5a6e] uppercase">Total Kills</span>
                  </div>
                  <p className="text-2xl font-bold text-red-400">{monthStats.totalKills}</p>
                </div>
                <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs text-[#5a5a6e] uppercase">Pts Posição</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-400">{monthStats.totalPosPoints}</p>
                </div>
                <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-[#5a5a6e] uppercase">Total Geral</span>
                  </div>
                  <p className="text-2xl font-bold text-green-400">{monthStats.totalPoints}</p>
                </div>
              </div>
            )}

            {/* Tabela Principal */}
            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center justify-between">
                <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
                  <Medal className="w-5 h-5 text-yellow-400" />
                  Classificação {selectedDate ? `— ${selectedDate.split("-")[2]}/${selectedDate.split("-")[1]}` : `— ${selectedMonth.split("-")[1]}/${selectedMonth.split("-")[0]}`}
                </h3>
                <span className="text-xs text-[#5a5a6e]">
                  {sortedStats.length} registros
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2a2a3a] bg-[#0a0a0f]">
                      <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase w-12">#</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Equipe</th>
                      {!selectedDate && (
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Data</th>
                      )}
                      <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Q1 Pos</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Q2 Pos</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Q3 Pos</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase bg-yellow-500/5">
                        <Trophy className="w-3 h-3 inline mr-1 text-yellow-400" />
                        Pts Pos
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">
                        <Target className="w-3 h-3 inline mr-1 text-red-400" />
                        Kills
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase bg-red-500/5">
                        <Swords className="w-3 h-3 inline mr-1 text-red-400" />
                        Pts Kill
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase bg-green-500/5">
                        <BarChart3 className="w-3 h-3 inline mr-1 text-green-400" />
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2a2a3a]">
                    {sortedStats.map((team, index) => (
                      <tr
                        key={`${team.date}-${team.teamName}`}
                        className={`hover:bg-[#1a1a24] transition-colors ${getRankStyle(index)}`}
                      >
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                            index === 0 ? "bg-yellow-500/20 text-yellow-400" :
                            index === 1 ? "bg-gray-400/20 text-gray-300" :
                            index === 2 ? "bg-amber-500/20 text-amber-500" :
                            "text-[#5a5a6e]"
                          }`}>
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-bold text-[#f0f0f5]">{team.teamName}</p>
                        </td>
                        {!selectedDate && (
                          <td className="px-4 py-3 text-sm text-[#8a8a9e]">
                            {team.date.split("-")[2]}/{team.date.split("-")[1]}
                          </td>
                        )}
                        <td className={`px-4 py-3 text-center ${getPosBg(team.q1Pos)}`}>
                          <span className={`text-sm font-medium ${getPosColor(team.q1Pos)}`}>
                            {team.q1Pos ?? "-"}
                          </span>
                          {team.q1Pos && team.q1Pos <= 3 && (
                            <span className="ml-1 text-xs">
                              {team.q1Pos === 1 ? "🥇" : team.q1Pos === 2 ? "🥈" : "🥉"}
                            </span>
                          )}
                        </td>
                        <td className={`px-4 py-3 text-center ${getPosBg(team.q2Pos)}`}>
                          <span className={`text-sm font-medium ${getPosColor(team.q2Pos)}`}>
                            {team.q2Pos ?? "-"}
                          </span>
                          {team.q2Pos && team.q2Pos <= 3 && (
                            <span className="ml-1 text-xs">
                              {team.q2Pos === 1 ? "🥇" : team.q2Pos === 2 ? "🥈" : "🥉"}
                            </span>
                          )}
                        </td>
                        <td className={`px-4 py-3 text-center ${getPosBg(team.q3Pos)}`}>
                          <span className={`text-sm font-medium ${getPosColor(team.q3Pos)}`}>
                            {team.q3Pos ?? "-"}
                          </span>
                          {team.q3Pos && team.q3Pos <= 3 && (
                            <span className="ml-1 text-xs">
                              {team.q3Pos === 1 ? "🥇" : team.q3Pos === 2 ? "🥈" : "🥉"}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center bg-yellow-500/5">
                          <span className="text-sm font-bold text-yellow-400">{team.posPoints}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm text-[#8a8a9e]">{team.totalKills}</span>
                        </td>
                        <td className="px-4 py-3 text-center bg-red-500/5">
                          <span className="text-sm font-bold text-red-400">{team.killPoints}</span>
                        </td>
                        <td className="px-4 py-3 text-center bg-green-500/5">
                          <span className="text-lg font-bold text-green-400">{team.totalPoints}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {sortedStats.length === 0 && (
                <div className="px-6 py-16 text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-[#2a2a3a]" />
                  <p className="text-[#5a5a6e] text-lg font-medium">Nenhum resultado encontrado</p>
                  <p className="text-[#3a3a4e] text-sm mt-1">
                    {selectedDate
                      ? "Nenhum dado para esta data"
                      : "Nenhum dado para este mês"}
                  </p>
                </div>
              )}
            </div>

            {/* Legenda */}
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                <h4 className="font-bold text-[#f0f0f5] mb-3 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  Pontuação por Posição
                </h4>
                <div className="grid grid-cols-5 gap-x-2 gap-y-1 text-xs">
                  {Object.entries(POSITION_POINTS).map(([pos, pts]) => (
                    <div key={pos} className="flex justify-between text-[#8a8a9e]">
                      <span>{pos}º</span>
                      <span className="font-bold text-yellow-400">{pts}pts</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                <h4 className="font-bold text-[#f0f0f5] mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-red-400" />
                  Pontuação por Kill
                </h4>
                <p className="text-[#8a8a9e] text-xs">
                  Cada kill vale <span className="font-bold text-red-400">{KILL_POINTS} ponto</span>.<br />
                  Total de kills do time × {KILL_POINTS} = Pontos de Kill
                </p>
              </div>
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                <h4 className="font-bold text-[#f0f0f5] mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-green-400" />
                  Cálculo do Total
                </h4>
                <p className="text-[#8a8a9e] text-xs">
                  <span className="text-yellow-400">Pts Posição</span> + <span className="text-red-400">Pts Kill</span> = <span className="text-green-400 font-bold">Total</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ===== TAB: INSCRIÇÕES ===== */}
        {activeTab === "inscricoes" && (
          <InscricoesTab
            xtreinosList={safeXTreinos}
            registrations={inscricoesRegistrations}
            fixedTeams={fixedTeams}
            allTeams={allTeams as Array<{ id: number; name: string; tag: string }> | undefined}
            settings={settings}
            selectedXt={selectedXtForInscricoes}
            onSelectXt={setSelectedXtForInscricoes}
            onRegister={({ xtreinoId, teamName, players, isReserve }) => {
              registerTeam.mutate({ xtreinoId, teamName, players, isReserve });
            }}
            onUnregister={({ xtreinoId, teamName }) => {
              unregisterTeam.mutate({ xtreinoId, teamName });
            }}
            onCancel={({ xtreinoId, teamName }) => {
              unregisterTeam.mutate({ xtreinoId, teamName });
            }}
            onToggleFixed={() => {}}
            isPending={registerTeam.isPending || unregisterTeam.isPending}
            isAdmin={false}
          />
        )}

        {/* ===== TAB: LISTA DE XTREINOS ===== */}
        {activeTab === "list" && (
          <XTreinosList
            xtreinosList={safeXTreinos}
            showForm={false}
            editing={null}
            form={{
              name: "",
              date: "",
              timeMx: "",
              timeBr: "21:00",
              modality: "squad" as Modality,
              maxTeams: 20,
              rules: "",
              discordLink: "",
              whatsappLink: "",
              status: "aberto" as XTreinoStatus,
            }}
            isPending={isLoading}
            onShowForm={() => {}}
            onCloseForm={() => {}}
            onEdit={() => {}}
            onSubmit={() => {}}
            onDelete={() => {}}
            onFormChange={() => {}}
            isAdmin={false}
          />
        )}

        {/* ===== TAB: RESULTADOS ===== */}
        {activeTab === "results" && (
          <ResultsTab
            xtreinosList={safeXTreinos}
            allResults={safeResults}
            xtDetail={resultsTabDetail}
            selectedXt={selectedXtForResults}
            showForm={false}
            form={{
              xtreinoId: 0,
              date: "",
              teamName: "",
              q1Pos: 0,
              q2Pos: 0,
              q3Pos: 0,
              totalPoints: 0,
            }}
            isPending={false}
            onSelectXt={setSelectedXtForResults}
            onShowForm={() => {}}
            onCloseForm={() => {}}
            onSubmit={() => {}}
            onFormChange={() => {}}
            isAdmin={false}
          />
        )}

        {/* ===== TAB: JOGADORES ===== */}
        {activeTab === "players" && (
          <PlayersTab
            xtreinosList={safeXTreinos}
            allPlayerStats={safePlayerStats}
            xtDetail={playersTabDetail}
            selectedXt={selectedXtForPlayers}
            showForm={false}
            form={{
              xtreinoId: 0,
              date: "",
              teamName: "",
              playerName: "",
              q1Kills: 0,
              q2Kills: 0,
              q3Kills: 0,
              totalKills: 0,
            }}
            isPending={false}
            onSelectXt={setSelectedXtForPlayers}
            onShowForm={() => {}}
            onCloseForm={() => {}}
            onSubmit={() => {}}
            onFormChange={() => {}}
            isAdmin={false}
          />
        )}

        {/* ===== TAB: AGENDA ===== */}
        {activeTab === "schedule" && (
          <ScheduleTab
            scheduleList={safeSchedule}
            showForm={false}
            form={{
              date: "",
              dayOfWeek: "",
              timeBr: "21:00",
              status: "scheduled" as ScheduleStatus,
              notes: "",
            }}
            isPending={false}
            isGenerating={false}
            onShowForm={() => {}}
            onCloseForm={() => {}}
            onSubmit={() => {}}
            onGenerateMonth={() => {}}
            onFormChange={() => {}}
            isAdmin={false}
          />
        )}
      </div>
    </MainLayout>
  );
}