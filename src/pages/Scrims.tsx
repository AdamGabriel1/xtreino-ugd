import { useState, useMemo } from "react";
import { Swords, Calendar, Clock, Shield, Trophy, Target, BarChart3, Filter, Award } from "lucide-react";
import { trpc } from "@/providers/trpc";
import MainLayout from "@/layout/MainLayout";

const statusColors: Record<string, string> = {
  agendado: "bg-blue-500/10 text-blue-400",
  em_andamento: "bg-yellow-500/10 text-yellow-400",
  concluido: "bg-green-500/10 text-green-400",
  cancelado: "bg-red-500/10 text-red-400",
};

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

type TabType = "agendados" | "historico-times" | "historico-jogadores";

export default function Scrims() {
  const [tab, setTab] = useState<TabType>("agendados");
  const [filterModality, setFilterModality] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>("all");

  // Queries originais
  const { data: scrimsList } = trpc.scrims.list.useQuery();

  // Queries de dados historicos (sempre buscar para evitar problemas de cache/condicional)
  const { data: availableDates } = trpc.scrims.dates.useQuery();
  const { data: scrimTeamResults } = trpc.scrims.teamResults.useQuery(
    { date: selectedDate === "all" ? undefined : selectedDate }
  );
  const { data: scrimPlayerStats } = trpc.scrims.playerStats.useQuery(
    { date: selectedDate === "all" ? undefined : selectedDate }
  );
  const { data: scrimPlayerAllTime } = trpc.scrims.playerStatsAllTime.useQuery();
  const { data: scrimTeamAllTime } = trpc.scrims.teamResultsAllTime.useQuery();

  const modalities = ["", "solo", "duo", "squad", "4v4"];

  const filtered = scrimsList?.filter((s) =>
    !filterModality || s.modality === filterModality
  );

  const isHistoricoTab = tab.startsWith("historico-");
  const isAllTime = selectedDate === "all";

  // ============================================================
  // CALCULAR DADOS DO HISTORICO COM PONTOS CORRETOS
  // ============================================================

  const historicoTimes = useMemo(() => {
    if (tab !== "historico-times") return [];

    // Funcao para calcular kills de um time a partir dos jogadores
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
      points: t.totalPoints || 0,
      kills: t.totalKills || 0,
      wins: t.wins || 0,
      participations: t.matches || 0,
      q1Pos: t.avgQ1,
      q2Pos: t.avgQ2,
      q3Pos: t.avgQ3,
      q1Points: 0,
      q2Points: 0,
      q3Points: 0,
    }));
  }, [tab, isAllTime, scrimTeamResults, scrimPlayerStats, scrimTeamAllTime]);

  const historicoJogadores = useMemo(() => {
    if (tab !== "historico-jogadores") return [];

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

  const data = tab === "historico-times" ? historicoTimes : historicoJogadores;

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
    if (tab === "agendados") return "Scrims Agendados";
    if (tab === "historico-times") return `Historico — Times ${isAllTime ? "(Todos os Tempos)" : formatDate(selectedDate)}`;
    if (tab === "historico-jogadores") return `Historico — Jogadores ${isAllTime ? "(Todos os Tempos)" : formatDate(selectedDate)}`;
    return "Scrims";
  };

  return (
    <MainLayout>
      <div className="bg-[#12121a] border-b border-[#2a2a3a]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-2">
            <Swords className="w-8 h-8 text-red-400" />
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#f0f0f5]">Scrims</h1>
          </div>
          <p className="text-[#8a8a9e]">{getTitle()}</p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => { setTab("agendados"); setSelectedDate("all"); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              tab === "agendados"
                ? "bg-red-500 text-white"
                : "bg-[#1a1a24] text-[#8a8a9e] hover:text-[#f0f0f5] border border-[#2a2a3a]"
            }`}
          >
            <Calendar className="w-4 h-4" />
            Agendados
          </button>
          <button
            onClick={() => { setTab("historico-times"); setSelectedDate("all"); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              tab === "historico-times"
                ? "bg-red-500 text-white"
                : "bg-[#1a1a24] text-[#8a8a9e] hover:text-[#f0f0f5] border border-[#2a2a3a]"
            }`}
          >
            <Trophy className="w-4 h-4" />
            Historico — Times
          </button>
          <button
            onClick={() => { setTab("historico-jogadores"); setSelectedDate("all"); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              tab === "historico-jogadores"
                ? "bg-red-500 text-white"
                : "bg-[#1a1a24] text-[#8a8a9e] hover:text-[#f0f0f5] border border-[#2a2a3a]"
            }`}
          >
            <Target className="w-4 h-4" />
            Historico — Jogadores
          </button>
        </div>

        {/* ABA: AGENDADOS */}
        {tab === "agendados" && (
          <>
            <div className="flex gap-2 mb-8">
              {modalities.map((m) => (
                <button
                  key={m}
                  onClick={() => setFilterModality(m)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filterModality === m
                      ? "bg-red-500 text-white"
                      : "bg-[#1a1a24] text-[#8a8a9e] hover:text-[#f0f0f5] border border-[#2a2a3a]"
                  }`}
                >
                  {m === "" ? "Todos" : m.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {filtered?.map((scrim) => (
                <div
                  key={scrim.id}
                  className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6 hover:border-[#3a3a4e] transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-center min-w-[100px]">
                        <p className="text-lg font-bold text-[#f0f0f5]">{scrim.team1Name ?? "TBD"}</p>
                        {scrim.team1Tag && <p className="text-xs text-[#5a5a6e]">[{scrim.team1Tag}]</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-[#1a1a24] border border-[#2a2a3a] flex items-center justify-center">
                          <Swords className="w-5 h-5 text-red-400" />
                        </div>
                      </div>
                      <div className="text-center min-w-[100px]">
                        <p className="text-lg font-bold text-[#f0f0f5]">{scrim.team2Name ?? "TBD"}</p>
                        {scrim.team2Tag && <p className="text-xs text-[#5a5a6e]">[{scrim.team2Tag}]</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-sm text-[#8a8a9e]">
                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {scrim.date}</span>
                      </div>
                      <div className="text-sm text-[#8a8a9e]">
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {scrim.time}</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[scrim.status] ?? "bg-gray-500/10 text-gray-400"}`}>
                        {scrim.status === "agendado" ? "Agendado" : scrim.status === "em_andamento" ? "Ao Vivo" : scrim.status === "concluido" ? "Concluido" : scrim.status}
                      </span>
                      {scrim.modality && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#1a1a24] text-[#8a8a9e] border border-[#2a2a3a]">
                          {scrim.modality.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>

                  {scrim.result && (
                    <div className="mt-4 pt-4 border-t border-[#2a2a3a]">
                      <p className="text-sm text-[#8a8a9e]">
                        <span className="text-green-400 font-medium">Resultado:</span> {scrim.result}
                      </p>
                    </div>
                  )}
                </div>
              ))}

              {filtered?.length === 0 && (
                <div className="text-center py-16 text-[#5a5a6e]">
                  <Shield className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">Nenhum scrim encontrado</p>
                  <p className="text-sm mt-1">Nao ha scrims com os filtros selecionados</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* ABA: HISTORICO */}
        {isHistoricoTab && (
          <>
            {/* Filtro de Data */}
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

            {/* Tabela */}
            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2a2a3a]">
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase w-14">Rank</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">
                        {tab === "historico-jogadores" ? "Jogador" : "Equipe"}
                      </th>
                      {tab === "historico-jogadores" && (
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Time</th>
                      )}
                      <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">
                        <span className="flex items-center justify-center gap-1"><BarChart3 className="w-3 h-3" /> Pontos</span>
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">
                        <span className="flex items-center justify-center gap-1"><Target className="w-3 h-3" /> Kills</span>
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">
                        <span className="flex items-center justify-center gap-1"><Trophy className="w-3 h-3" /> Wins</span>
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Scrims</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">
                        {tab === "historico-times" ? "Q1 / Q2 / Q3 (pts)" : "Q1 / Q2 / Q3 (kills)"}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2a2a3a]">
                    {data?.map((r: any, i: number) => (
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
                        {tab === "historico-jogadores" && (
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
                          {tab === "historico-times" && !isAllTime
                            ? `${r.q1Pos}(${r.q1Points}) / ${r.q2Pos}(${r.q2Points}) / ${r.q3Pos}(${r.q3Points})`
                            : tab === "historico-times" && isAllTime
                            ? `${r.q1Pos?.toFixed(1) || "-"} / ${r.q2Pos?.toFixed(1) || "-"} / ${r.q3Pos?.toFixed(1) || "-"}`
                            : `${r.q1Kills ?? 0} / ${r.q2Kills ?? 0} / ${r.q3Kills ?? 0}`
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
          </>
        )}
      </div>
    </MainLayout>
  );
}