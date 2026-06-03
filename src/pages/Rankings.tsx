import { useState, useMemo } from "react";
import { BarChart3, Trophy, UserCircle, Users, TrendingUp, Target, Award, Filter } from "lucide-react";
import { trpc } from "@/providers/trpc";
import MainLayout from "@/layout/MainLayout";

/** Tabela de pontos por colocação */
const POSITION_POINTS: Record<number, number> = {
  1: 15, 2: 12, 3: 10, 4: 9, 5: 8, 6: 7,
  7: 6, 8: 5, 9: 4, 10: 3, 11: 2, 12: 1,
  13: 1, 14: 0, 15: 0,
};

function getPointsByPosition(pos: number | null): number {
  if (!pos) return 0;
  return POSITION_POINTS[pos] ?? 0;
}

type TabType = "teams" | "players" | "scrims-teams" | "scrims-players";

export default function Rankings() {
  const [tab, setTab] = useState<TabType>("teams");
  const [selectedDate, setSelectedDate] = useState<string>("all");

  // Queries originais
  const { data: teamRankings } = trpc.rankings.teams.useQuery();
  const { data: playerRankings } = trpc.rankings.players.useQuery();

  // Queries de scrims (sempre buscar para evitar problemas de cache/condicional)
  const { data: availableDates } = trpc.scrims.dates.useQuery();
  const { data: scrimTeamResults } = trpc.scrims.teamResults.useQuery(
    { date: selectedDate === "all" ? undefined : selectedDate }
  );
  const { data: scrimPlayerStats } = trpc.scrims.playerStats.useQuery(
    { date: selectedDate === "all" ? undefined : selectedDate }
  );
  const { data: scrimPlayerAllTime } = trpc.scrims.playerStatsAllTime.useQuery();
  const { data: scrimTeamAllTime } = trpc.scrims.teamResultsAllTime.useQuery();

  const isScrimTab = tab.startsWith("scrims-");
  const isAllTime = selectedDate === "all";

  // ============================================================
  // CALCULAR DADOS DOS SCRIMS COM PONTOS CORRETOS
  // ============================================================

  const scrimsTeamsData = useMemo(() => {
    if (tab !== "scrims-teams") return [];

    // Calcular kills por time a partir dos dados dos jogadores
    const calcTeamKills = (teamName: string) => {
      const playerData = (scrimPlayerStats || []).filter((p: any) => p.teamName === teamName);
      return playerData.reduce((sum: number, p: any) => sum + (p.totalKills || 0), 0);
    };

    if (!isAllTime) {
      // Dados de uma data especifica
      const teamsWithPoints = (scrimTeamResults || []).map((t: any) => {
        const q1Points = getPointsByPosition(t.q1Pos);
        const q2Points = getPointsByPosition(t.q2Pos);
        const q3Points = getPointsByPosition(t.q3Pos);
        const positionPoints = q1Points + q2Points + q3Points;
        const teamKills = calcTeamKills(t.teamName);

        return {
          id: t.id,
          entityName: t.teamName,
          points: positionPoints + teamKills,
          positionPoints,
          kills: teamKills,
          wins: [t.q1Pos, t.q2Pos, t.q3Pos].filter((p: number) => p === 1).length,
          participations: 1,
          q1Pos: t.q1Pos,
          q2Pos: t.q2Pos,
          q3Pos: t.q3Pos,
          q1Points,
          q2Points,
          q3Points,
        };
      });

      return teamsWithPoints.sort((a: any, b: any) => b.points - a.points);
    }

    // Todos os tempos: usar dados ja calculados pelo backend
    return (scrimTeamAllTime || []).map((t: any, i: number) => ({
      id: i,
      entityName: t.teamName,
      points: t.totalPoints ?? 0,
      kills: t.totalKills ?? 0,
      wins: t.wins ?? 0,
      participations: t.matches ?? 0,
      q1Pos: t.avgQ1,
      q2Pos: t.avgQ2,
      q3Pos: t.avgQ3,
      q1Points: 0,
      q2Points: 0,
      q3Points: 0,
    }));
  }, [tab, isAllTime, scrimTeamResults, scrimPlayerStats, scrimTeamAllTime]);

  const scrimsPlayersData = useMemo(() => {
    if (tab !== "scrims-players") return [];

    if (!isAllTime) {
      return (scrimPlayerStats || []).map((p: any) => ({
        id: p.id,
        entityName: p.playerName,
        points: p.totalKills || 0,
        kills: p.totalKills || 0,
        wins: 0,
        participations: 1,
        q1Kills: p.q1Kills || 0,
        q2Kills: p.q2Kills || 0,
        q3Kills: p.q3Kills || 0,
        teamName: p.teamName,
      })).sort((a: any, b: any) => b.points - a.points);
    }

    return (scrimPlayerAllTime || []).map((p: any, i: number) => ({
      id: i,
      entityName: p.playerName,
      points: p.totalKills || 0,
      kills: p.totalKills || 0,
      wins: 0,
      participations: p.matches || 0,
      q1Kills: p.totalQ1 || 0,
      q2Kills: p.totalQ2 || 0,
      q3Kills: p.totalQ3 || 0,
      teamName: p.teamName,
    })).sort((a: any, b: any) => b.points - a.points);
  }, [tab, isAllTime, scrimPlayerStats, scrimPlayerAllTime]);

  // Determinar dados finais
  let data: any[] = [];
  if (tab === "teams") data = teamRankings || [];
  else if (tab === "players") data = playerRankings || [];
  else if (tab === "scrims-teams") data = scrimsTeamsData;
  else if (tab === "scrims-players") data = scrimsPlayersData;

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

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    const monthNames = ["", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return `${day} ${monthNames[parseInt(month)]}`;
  };

  const getTitle = () => {
    if (tab === "teams") return "Rankings Gerais — Equipes";
    if (tab === "players") return "Rankings Gerais — Jogadores";
    if (tab === "scrims-teams") return `Scrims — Times ${isAllTime ? "(Todos os Tempos)" : formatDate(selectedDate)}`;
    if (tab === "scrims-players") return `Scrims — Jogadores ${isAllTime ? "(Todos os Tempos)" : formatDate(selectedDate)}`;
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase w-14">Rank</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">
                    {tab === "players" || tab === "scrims-players" ? "Jogador" : "Equipe"}
                  </th>
                  {isScrimTab && tab === "scrims-players" && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Time</th>
                  )}
                  <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">
                    <span className="flex items-center justify-center gap-1"><TrendingUp className="w-3 h-3" /> Pontos</span>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">
                    <span className="flex items-center justify-center gap-1"><Target className="w-3 h-3" /> Kills</span>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">
                    <span className="flex items-center justify-center gap-1"><Trophy className="w-3 h-3" /> Wins</span>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Scrims</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">
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
                    <td className="px-4 py-3">
                      {i < 3 ? (
                        <div className="flex justify-center">{rankIcons[i]}</div>
                      ) : (
                        <span className="text-sm font-bold text-[#5a5a6e] text-center block">{i + 1}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold text-[#f0f0f5]">{r.entityName}</span>
                    </td>
                    {isScrimTab && tab === "scrims-players" && (
                      <td className="px-4 py-3">
                        <span className="text-xs text-[#5a5a6e]">{r.teamName || "—"}</span>
                      </td>
                    )}
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-bold text-red-400">{r.points ?? 0}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-[#8a8a9e]">{r.kills ?? 0}</td>
                    <td className="px-4 py-3 text-center text-sm text-[#8a8a9e]">{r.wins ?? 0}</td>
                    <td className="px-4 py-3 text-center text-sm text-[#8a8a9e]">{r.participations ?? 0}</td>
                    <td className="px-4 py-3 text-center text-sm text-[#8a8a9e] font-mono">
                      {tab === "scrims-teams" && !isAllTime
                        ? `${r.q1Pos}(${r.q1Points}) / ${r.q2Pos}(${r.q2Points}) / ${r.q3Pos}(${r.q3Points})`
                        : tab === "scrims-teams" && isAllTime
                        ? `${r.q1Pos?.toFixed(1) || "-"} / ${r.q2Pos?.toFixed(1) || "-"} / ${r.q3Pos?.toFixed(1) || "-"}`
                        : tab === "scrims-players"
                        ? `${r.q1Kills ?? 0} / ${r.q2Kills ?? 0} / ${r.q3Kills ?? 0}`
                        : r.kdRatio ?? "—"
                      }
                    </td>
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