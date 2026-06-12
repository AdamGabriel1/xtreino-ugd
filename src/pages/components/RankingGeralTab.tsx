import { useState, useMemo } from "react";
import {
  Trophy,
  Target,
  Swords,
  BarChart3,
  TrendingUp,
  ChevronDown,
  Crown,
  Award,
  Zap,
  Users,
  Calendar,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import {
  useXtreinoCalculations,
  POSITION_POINTS,
  KILL_POINTS,
} from "@/hooks/useXtreinoCalculations";

export default function RankingGeralTab() {
  const [sortBy, setSortBy] = useState("total");
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);

  const { data: allResults } = trpc.xtreinos.listResults.useQuery();
  const { data: allPlayerStats } = trpc.xtreinos.listPlayerStats.useQuery();

  const { teamRanking, playerXtreinoStats } = useXtreinoCalculations({
    results: allResults ?? [],
    playerStats: allPlayerStats ?? [],
  });

  const sortedRanking = useMemo(() => {
    const sorted = [...teamRanking];
    switch (sortBy) {
      case "kills":
        return sorted.sort((a, b) => b.totalKills - a.totalKills);
      case "pos":
        return sorted.sort((a, b) => b.totalPosPoints - a.totalPosPoints);
      case "xtreinos":
        return sorted.sort((a, b) => b.xtreinosPlayed - a.xtreinosPlayed);
      default:
        return sorted.sort((a, b) => b.totalPoints - a.totalPoints);
    }
  }, [teamRanking, sortBy]);

  const getTeamPlayers = (teamName: string) => {
    return playerXtreinoStats.filter((p) => p.teamName === teamName);
  };

  const getRankStyle = (index: number) => {
    if (index === 0) return "bg-yellow-500/5 border-l-2 border-yellow-500";
    if (index === 1) return "bg-gray-400/5 border-l-2 border-gray-400";
    if (index === 2) return "bg-amber-500/5 border-l-2 border-amber-500";
    return "border-l-2 border-transparent";
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (index === 1) return <Award className="w-5 h-5 text-gray-300" />;
    if (index === 2) return <Award className="w-5 h-5 text-amber-500" />;
    return <span className="text-sm font-bold text-[#5a5a6e]">{index + 1}</span>;
  };

  const getPosColor = (pos: number | null) => {
    if (!pos) return "text-[#5a5a6e]";
    if (pos === 1) return "text-yellow-400 font-bold";
    if (pos === 2) return "text-gray-300 font-bold";
    if (pos === 3) return "text-amber-500 font-bold";
    return "text-[#8a8a9e]";
  };

  const totals = useMemo(() => {
    return {
      totalTeams: teamRanking.length,
      totalKills: teamRanking.reduce((acc, t) => acc + t.totalKills, 0),
      totalPosPoints: teamRanking.reduce((acc, t) => acc + t.totalPosPoints, 0),
      totalPoints: teamRanking.reduce((acc, t) => acc + t.totalPoints, 0),
      totalXtreinos: teamRanking.reduce((acc, t) => acc + t.xtreinosPlayed, 0),
    };
  }, [teamRanking]);

  return (
    <div>
      {/* Cards de resumo */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-[#5a5a6e] uppercase">Equipes</span>
          </div>
          <p className="text-2xl font-bold text-[#f0f0f5]">{totals.totalTeams}</p>
        </div>
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Swords className="w-4 h-4 text-red-400" />
            <span className="text-xs text-[#5a5a6e] uppercase">Total Kills</span>
          </div>
          <p className="text-2xl font-bold text-red-400">{totals.totalKills}</p>
        </div>
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-[#5a5a6e] uppercase">Pts Posição</span>
          </div>
          <p className="text-2xl font-bold text-yellow-400">{totals.totalPosPoints}</p>
        </div>
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-green-400" />
            <span className="text-xs text-[#5a5a6e] uppercase">Total Geral</span>
          </div>
          <p className="text-2xl font-bold text-green-400">{totals.totalPoints}</p>
        </div>
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-[#5a5a6e] uppercase">X-Treinos</span>
          </div>
          <p className="text-2xl font-bold text-purple-400">{totals.totalXtreinos}</p>
        </div>
      </div>

      {/* Filtro de ordenação */}
      <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4 mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-4 h-4 text-[#5a5a6e]" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50 min-w-[160px]"
          >
            <option value="total">Ordenar: Total Geral</option>
            <option value="kills">Ordenar: Kills Totais</option>
            <option value="pos">Ordenar: Pts Posição</option>
            <option value="xtreinos">Ordenar: X-Treinos Jogados</option>
          </select>
        </div>
      </div>

      {/* Tabela Principal */}
      <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center justify-between">
          <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-400" />
            Ranking Geral — Histórico Completo
          </h3>
          <span className="text-xs text-[#5a5a6e]">
            {sortedRanking.length} equipes
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a2a3a] bg-[#0a0a0f]">
                <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase w-14">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Equipe</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">
                  <Zap className="w-3 h-3 inline mr-1 text-purple-400" />
                  X-Treinos
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">
                  🥇 🥈 🥉
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">
                  Melhor Pos
                </th>
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
                <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a3a]">
              {sortedRanking.map((team, index) => {
                const isExpanded = expandedTeam === team.teamName;
                const teamPlayers = getTeamPlayers(team.teamName);

                return (
                  <>
                    <tr
                      key={team.teamName}
                      className={`hover:bg-[#1a1a24] transition-colors cursor-pointer ${getRankStyle(index)}`}
                      onClick={() => setExpandedTeam(isExpanded ? null : team.teamName)}
                    >
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center">
                          {getRankIcon(index)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-bold text-[#f0f0f5]">{team.teamName}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-medium text-purple-400">{team.xtreinosPlayed}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2 text-xs">
                          {team.top1Count > 0 && (
                            <span className="text-yellow-400 font-bold">{team.top1Count}🥇</span>
                          )}
                          {team.top2Count > 0 && (
                            <span className="text-gray-300 font-bold">{team.top2Count}🥈</span>
                          )}
                          {team.top3Count > 0 && (
                            <span className="text-amber-500 font-bold">{team.top3Count}🥉</span>
                          )}
                          {team.top1Count === 0 && team.top2Count === 0 && team.top3Count === 0 && (
                            <span className="text-[#5a5a6e]">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-sm font-bold ${team.bestPosition && team.bestPosition <= 3 ? getPosColor(team.bestPosition) : "text-[#8a8a9e]"}`}>
                          {team.bestPosition ? `${team.bestPosition}º` : "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center bg-yellow-500/5">
                        <span className="text-sm font-bold text-yellow-400">{team.totalPosPoints}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm text-[#8a8a9e]">{team.totalKills}</span>
                      </td>
                      <td className="px-4 py-3 text-center bg-red-500/5">
                        <span className="text-sm font-bold text-red-400">{team.totalKillPoints}</span>
                      </td>
                      <td className="px-4 py-3 text-center bg-green-500/5">
                        <span className="text-lg font-bold text-green-400">{team.totalPoints}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <ChevronDown className={`w-4 h-4 text-[#5a5a6e] transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="bg-[#0a0a0f]">
                        <td colSpan={10} className="px-4 py-4">
                          <div className="ml-4 space-y-4">
                            {/* Histórico de X-Treinos */}
                            <div>
                              <h4 className="text-xs font-medium text-[#5a5a6e] mb-3 flex items-center gap-2">
                                <Calendar className="w-3 h-3" />
                                Histórico de X-Treinos ({team.xtreinos.length})
                              </h4>
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b border-[#2a2a3a]">
                                      <th className="px-3 py-2 text-left text-xs text-[#5a5a6e]">Data</th>
                                      <th className="px-3 py-2 text-center text-xs text-[#5a5a6e]">Q1</th>
                                      <th className="px-3 py-2 text-center text-xs text-[#5a5a6e]">Q2</th>
                                      <th className="px-3 py-2 text-center text-xs text-[#5a5a6e]">Q3</th>
                                      <th className="px-3 py-2 text-center text-xs text-[#5a5a6e]">Pts Pos</th>
                                      <th className="px-3 py-2 text-center text-xs text-[#5a5a6e]">Kills</th>
                                      <th className="px-3 py-2 text-center text-xs text-[#5a5a6e]">Total</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-[#2a2a3a]/50">
                                    {team.xtreinos
                                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                      .map((xt) => (
                                        <tr key={xt.date} className="hover:bg-[#1a1a24]/50">
                                          <td className="px-3 py-2 text-[#8a8a9e]">
                                            {xt.date.split("-")[2]}/{xt.date.split("-")[1]}
                                          </td>
                                          <td className="px-3 py-2 text-center">
                                            <span className={getPosColor(xt.q1Pos)}>{xt.q1Pos ?? "-"}</span>
                                          </td>
                                          <td className="px-3 py-2 text-center">
                                            <span className={getPosColor(xt.q2Pos)}>{xt.q2Pos ?? "-"}</span>
                                          </td>
                                          <td className="px-3 py-2 text-center">
                                            <span className={getPosColor(xt.q3Pos)}>{xt.q3Pos ?? "-"}</span>
                                          </td>
                                          <td className="px-3 py-2 text-center text-yellow-400 font-bold">{xt.totalPosPoints}</td>
                                          <td className="px-3 py-2 text-center text-[#8a8a9e]">{xt.totalKills}</td>
                                          <td className="px-3 py-2 text-center text-green-400 font-bold">{xt.totalPoints}</td>
                                        </tr>
                                      ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Jogadores do time */}
                            {teamPlayers.length > 0 && (
                              <div>
                                <h4 className="text-xs font-medium text-[#5a5a6e] mb-2 flex items-center gap-2">
                                  <Users className="w-3 h-3" />
                                  Jogadores ({teamPlayers.length})
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {teamPlayers.map((player) => (
                                    <div key={player.playerName} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a1a24] border border-[#2a2a3a]">
                                      <Target className="w-3 h-3 text-green-400" />
                                      <span className="text-sm text-[#f0f0f5]">{player.playerName}</span>
                                      <span className="text-xs text-green-400 font-bold">{player.totalKills}k</span>
                                      <span className="text-xs text-[#5a5a6e]">
                                        ({player.q1Kills}/{player.q2Kills}/{player.q3Kills})
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>

        {sortedRanking.length === 0 && (
          <div className="px-6 py-16 text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-[#2a2a3a]" />
            <p className="text-[#5a5a6e] text-lg font-medium">Nenhum dado disponível</p>
          </div>
        )}
      </div>

      {/* Legenda */}
      <div className="mt-6 grid md:grid-cols-3 gap-4 text-sm">
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
            Cada kill vale <span className="font-bold text-red-400">{KILL_POINTS} ponto</span>.
            <br />
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
  );
}