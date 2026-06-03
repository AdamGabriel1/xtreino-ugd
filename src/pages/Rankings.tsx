import { useState } from "react";
import { BarChart3, Trophy, UserCircle, Users, TrendingUp, Target, Award, Calendar, Filter } from "lucide-react";
import { trpc } from "@/providers/trpc";
import MainLayout from "@/layout/MainLayout";

type TabType = "teams" | "players" | "scrims-teams" | "scrims-players";

export default function Rankings() {
  const [tab, setTab] = useState<TabType>("teams");
  const [selectedDate, setSelectedDate] = useState<string>("all");

  // Queries originais
  const { data: teamRankings } = trpc.rankings.teams.useQuery();
  const { data: playerRankings } = trpc.rankings.players.useQuery();

  // Queries de scrims
  const { data: availableDates } = trpc.scrims.dates.useQuery();
  const { data: scrimTeamResults } = trpc.scrims.teamResults.useQuery(
    { date: selectedDate === "all" ? undefined : selectedDate },
    { enabled: tab === "scrims-teams" }
  );
  const { data: scrimPlayerStats } = trpc.scrims.playerStats.useQuery(
    { date: selectedDate === "all" ? undefined : selectedDate },
    { enabled: tab === "scrims-players" }
  );
  const { data: scrimPlayerAllTime } = trpc.scrims.playerStatsAllTime.useQuery(
    undefined,
    { enabled: tab === "scrims-players" && selectedDate === "all" }
  );
  const { data: scrimTeamAllTime } = trpc.scrims.teamResultsAllTime.useQuery(
    undefined,
    { enabled: tab === "scrims-teams" && selectedDate === "all" }
  );

  // Determinar dados atuais
  const isScrimTab = tab.startsWith("scrims-");
  const isAllTime = selectedDate === "all";

  let data: any[] = [];
  if (tab === "teams") data = teamRankings || [];
  else if (tab === "players") data = playerRankings || [];
  else if (tab === "scrims-teams") {
    data = isAllTime
      ? (scrimTeamAllTime || []).map((t: any, i: number) => ({
          id: i,
          entityName: t.teamName,
          points: 0,
          kills: 0,
          wins: 0,
          participations: t.matches,
          kdRatio: `${t.avgQ1?.toFixed(1) || "-"} / ${t.avgQ2?.toFixed(1) || "-"} / ${t.avgQ3?.toFixed(1) || "-"}`,
          q1Pos: t.avgQ1,
          q2Pos: t.avgQ2,
          q3Pos: t.avgQ3,
        }))
      : (scrimTeamResults || []).map((t: any) => ({
          id: t.id,
          entityName: t.teamName,
          points: 0,
          kills: 0,
          wins: 0,
          participations: 1,
          kdRatio: `${t.q1Pos || "-"} / ${t.q2Pos || "-"} / ${t.q3Pos || "-"}`,
          q1Pos: t.q1Pos,
          q2Pos: t.q2Pos,
          q3Pos: t.q3Pos,
        }));
  } else if (tab === "scrims-players") {
    data = isAllTime
      ? (scrimPlayerAllTime || []).map((p: any, i: number) => ({
          id: i,
          entityName: p.playerName,
          points: 0,
          kills: p.totalKills,
          wins: 0,
          participations: p.matches,
          kdRatio: `${p.totalQ1 || 0} / ${p.totalQ2 || 0} / ${p.totalQ3 || 0}`,
          teamName: p.teamName,
        }))
      : (scrimPlayerStats || []).map((p: any) => ({
          id: p.id,
          entityName: p.playerName,
          points: 0,
          kills: p.totalKills,
          wins: 0,
          participations: 1,
          kdRatio: `${p.q1Kills || 0} / ${p.q2Kills || 0} / ${p.q3Kills || 0}`,
          teamName: p.teamName,
        }));
  }

  const rankColors = [
    "border-l-yellow-400",
    "border-l-gray-300",
    "border-l-amber-600",
  ];

  const rankIcons = [
    <Trophy key="1" className="w-5 h-5 text-yellow-400" />,
    <Award key="2" className="w-5 h-5 text-gray-300" />,
    <Award key="3" className="w-5 h-5 text-amber-600" />,
  ];

  // Format date for display
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    const monthNames = ["", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return `${day} ${monthNames[parseInt(month)]}`;
  };

  const getTitle = () => {
    if (tab === "teams") return "Rankings Gerais — Equipes";
    if (tab === "players") return "Rankings Gerais — Jogadores";
    if (tab === "scrims-teams") return `Scrims — Colocações ${isAllTime ? "(Todos os Tempos)" : formatDate(selectedDate)}`;
    if (tab === "scrims-players") return `Scrims — Kills ${isAllTime ? "(Todos os Tempos)" : formatDate(selectedDate)}`;
    return "Rankings";
  };

  return (
    <MainLayout>
      <div className="bg-[#12121a] border-b border-[#2a2a3a]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-8 h-8 text-red-400" />
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#f0f0f5]">Rankings</h1>
          </div>
          <p className="text-[#8a8a9e]">{getTitle()}</p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => { setTab("teams"); setSelectedDate("all"); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              tab === "teams"
                ? "bg-red-500 text-white"
                : "bg-[#1a1a24] text-[#8a8a9e] hover:text-[#f0f0f5] border border-[#2a2a3a]"
            }`}
          >
            <Users className="w-4 h-4" />
            Equipes
          </button>
          <button
            onClick={() => { setTab("players"); setSelectedDate("all"); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              tab === "players"
                ? "bg-red-500 text-white"
                : "bg-[#1a1a24] text-[#8a8a9e] hover:text-[#f0f0f5] border border-[#2a2a3a]"
            }`}
          >
            <UserCircle className="w-4 h-4" />
            Jogadores
          </button>
          <button
            onClick={() => { setTab("scrims-teams"); setSelectedDate("all"); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              tab === "scrims-teams"
                ? "bg-red-500 text-white"
                : "bg-[#1a1a24] text-[#8a8a9e] hover:text-[#f0f0f5] border border-[#2a2a3a]"
            }`}
          >
            <Trophy className="w-4 h-4" />
            Scrims — Times
          </button>
          <button
            onClick={() => { setTab("scrims-players"); setSelectedDate("all"); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              tab === "scrims-players"
                ? "bg-red-500 text-white"
                : "bg-[#1a1a24] text-[#8a8a9e] hover:text-[#f0f0f5] border border-[#2a2a3a]"
            }`}
          >
            <Target className="w-4 h-4" />
            Scrims — Jogadores
          </button>
        </div>

        {/* Filtro de Data (apenas para abas de scrims) */}
        {isScrimTab && (
          <div className="flex items-center gap-3 mb-6 p-4 bg-[#1a1a24] rounded-xl border border-[#2a2a3a]">
            <Filter className="w-4 h-4 text-[#5a5a6e]" />
            <span className="text-sm text-[#8a8a9e]">Filtrar por data:</span>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-[#12121a] text-[#f0f0f5] text-sm px-4 py-2 rounded-lg border border-[#2a2a3a] focus:outline-none focus:border-red-500 transition-colors"
            >
              <option value="all">Todos os tempos</option>
              {availableDates?.map((date) => (
                <option key={date} value={date}>
                  {formatDate(date)}
                </option>
              ))}
            </select>
            {selectedDate !== "all" && (
              <button
                onClick={() => setSelectedDate("all")}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                Limpar filtro
              </button>
            )}
          </div>
        )}

        {/* Rankings Table */}
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a2a3a]">
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#5a5a6e] uppercase w-16">Rank</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#5a5a6e] uppercase">
                    {tab === "players" || tab === "scrims-players" ? "Jogador" : "Equipe"}
                  </th>
                  {isScrimTab && tab === "scrims-players" && (
                    <th className="px-6 py-4 text-left text-xs font-medium text-[#5a5a6e] uppercase">Time</th>
                  )}
                  <th className="px-6 py-4 text-center text-xs font-medium text-[#5a5a6e] uppercase">
                    <span className="flex items-center justify-center gap-1"><TrendingUp className="w-3 h-3" /> Pontos</span>
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-[#5a5a6e] uppercase">
                    <span className="flex items-center justify-center gap-1"><Target className="w-3 h-3" /> Kills</span>
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-[#5a5a6e] uppercase">
                    <span className="flex items-center justify-center gap-1"><Trophy className="w-3 h-3" /> Wins</span>
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-[#5a5a6e] uppercase">Particip.</th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-[#5a5a6e] uppercase">
                    {isScrimTab ? "Q1 / Q2 / Q3" : "K/D"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a3a]">
                {data?.map((r, i) => (
                  <tr
                    key={r.id ?? i}
                    className={`hover:bg-[#1a1a24] transition-colors ${i < 3 ? `border-l-4 ${rankColors[i]}` : ""}`}
                  >
                    <td className="px-6 py-4">
                      {i < 3 ? (
                        <div className="flex justify-center">{rankIcons[i]}</div>
                      ) : (
                        <span className="text-sm font-bold text-[#5a5a6e] text-center block">{i + 1}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-[#f0f0f5]">{r.entityName}</span>
                    </td>
                    {isScrimTab && tab === "scrims-players" && (
                      <td className="px-6 py-4">
                        <span className="text-xs text-[#5a5a6e]">{r.teamName || "—"}</span>
                      </td>
                    )}
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-bold text-red-400">{r.points || 0}</span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-[#8a8a9e]">{r.kills ?? 0}</td>
                    <td className="px-6 py-4 text-center text-sm text-[#8a8a9e]">{r.wins ?? 0}</td>
                    <td className="px-6 py-4 text-center text-sm text-[#8a8a9e]">{r.participations ?? 0}</td>
                    <td className="px-6 py-4 text-center text-sm text-[#8a8a9e] font-mono">{r.kdRatio ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(!data || data.length === 0) && (
            <div className="text-center py-16 text-[#5a5a6e]">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>Nenhum dado disponivel para o filtro selecionado</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}