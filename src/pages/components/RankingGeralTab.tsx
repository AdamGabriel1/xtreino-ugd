import { useState, useMemo } from "react";
import {
  Trophy,
  Target,
  Swords,
  BarChart3,
  TrendingUp,
  Crown,
  Zap,
  Users,
  Calendar,
  Tag,
  History,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import {
  useXtreinoCalculations,
  POSITION_POINTS,
  KILL_POINTS,
} from "@/hooks/useXtreinoCalculations";

// Componentes reutilizaveis
import {
  RankBadge,
  SummaryCards,
  SortHeader,
  FilterBar,
  SearchInput,
  SelectFilter,
  EmptyState,
  LoadingSpinner,
  PreviousNicksTooltip,
  ExpandableRow,
} from "./xtreino";

// ============================================================
// TIPOS
// ============================================================

interface MergedPlayer {
  id: number;
  nickname: string;
  playerName: string;
  totalKills: number;
  totalQ1Kills: number;
  totalQ2Kills: number;
  totalQ3Kills: number;
  participations: number;
  previousNicks: string[];
  avgKills: number;
}

type SortField = "total" | "kills" | "pos" | "xtreinos";

// ============================================================
// FUNCOES PURAS
// ============================================================

function getPosColor(pos: number | null): string {
  if (!pos) return "text-[#5a5a6e]";
  if (pos === 1) return "text-yellow-400 font-bold";
  if (pos === 2) return "text-gray-300 font-bold";
  if (pos === 3) return "text-amber-500 font-bold";
  return "text-[#8a8a9e]";
}

function getRankStyle(index: number): string {
  if (index === 0) return "bg-yellow-500/5 border-l-2 border-yellow-500";
  if (index === 1) return "bg-gray-400/5 border-l-2 border-gray-400";
  if (index === 2) return "bg-amber-500/5 border-l-2 border-amber-500";
  return "border-l-2 border-transparent";
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function RankingGeralTab() {
  const [sortBy, setSortBy] = useState<SortField>("total");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { data: allResults } = trpc.xtreinos.listResults.useQuery();
  const { data: allPlayerStats } = trpc.xtreinos.listPlayerStats.useQuery();
  const { data: playersList } = trpc.players.list.useQuery();

  const { teamRanking, teamPlayersGrouped } = useXtreinoCalculations({
    results: allResults ?? [],
    playerStats: allPlayerStats ?? [],
  });

  const isLoading = !allResults || !allPlayerStats;

  // Conta xtreinos unicos
  const totalXtreinosUnicos = useMemo(() => {
    const uniqueXtreinoIds = new Set<number>();
    allResults?.forEach((r) => uniqueXtreinoIds.add(r.xtreinoId));
    return uniqueXtreinoIds.size;
  }, [allResults]);

  // Map de jogadores por nome
  const playersByName = useMemo(() => {
    const map = new Map<string, { id: number; nickname: string; previousNicks: string[] }>();
    if (!playersList) return map;

    for (const p of playersList) {
      const key = p.nickname.trim().toLowerCase();
      map.set(key, {
        id: p.id,
        nickname: p.nickname,
        previousNicks: p.previousNicks ?? [],
      });
      for (const nick of (p.previousNicks ?? [])) {
        map.set(nick.trim().toLowerCase(), {
          id: p.id,
          nickname: p.nickname,
          previousNicks: p.previousNicks ?? [],
        });
      }
    }
    return map;
  }, [playersList]);

  // Merge jogadores por ID
  const mergePlayersById = (
    players: Array<{
      playerName: string;
      totalKills: number;
      totalQ1Kills: number;
      totalQ2Kills: number;
      totalQ3Kills: number;
      participations: number;
      avgKills: number;
    }>
  ): MergedPlayer[] => {
    const mergedMap = new Map<
      number,
      {
        id: number;
        nickname: string;
        playerName: string;
        totalKills: number;
        totalQ1Kills: number;
        totalQ2Kills: number;
        totalQ3Kills: number;
        participations: number;
        previousNicks: string[];
      }
    >();

    for (const player of players) {
      const playerInfo = playersByName.get(player.playerName.trim().toLowerCase());

      if (playerInfo) {
        const existing = mergedMap.get(playerInfo.id);
        if (existing) {
          existing.totalKills += player.totalKills;
          existing.totalQ1Kills += player.totalQ1Kills;
          existing.totalQ2Kills += player.totalQ2Kills;
          existing.totalQ3Kills += player.totalQ3Kills;
          existing.participations += player.participations;
        } else {
          mergedMap.set(playerInfo.id, {
            id: playerInfo.id,
            nickname: playerInfo.nickname,
            playerName: playerInfo.nickname,
            totalKills: player.totalKills,
            totalQ1Kills: player.totalQ1Kills,
            totalQ2Kills: player.totalQ2Kills,
            totalQ3Kills: player.totalQ3Kills,
            participations: player.participations,
            previousNicks: playerInfo.previousNicks,
          });
        }
      } else {
        const tempId = -Math.abs(
          player.playerName.toLowerCase().split("").reduce((a, b) => a + b.charCodeAt(0), 0)
        );
        const existing = mergedMap.get(tempId);
        if (existing) {
          existing.totalKills += player.totalKills;
          existing.totalQ1Kills += player.totalQ1Kills;
          existing.totalQ2Kills += player.totalQ2Kills;
          existing.totalQ3Kills += player.totalQ3Kills;
          existing.participations += player.participations;
        } else {
          mergedMap.set(tempId, {
            id: tempId,
            nickname: player.playerName,
            playerName: player.playerName,
            totalKills: player.totalKills,
            totalQ1Kills: player.totalQ1Kills,
            totalQ2Kills: player.totalQ2Kills,
            totalQ3Kills: player.totalQ3Kills,
            participations: player.participations,
            previousNicks: [],
          });
        }
      }
    }

    return Array.from(mergedMap.values())
      .map((p) => ({
        ...p,
        avgKills: p.participations > 0 ? Math.round((p.totalKills / p.participations) * 10) / 10 : 0,
      }))
      .sort((a, b) => b.totalKills - a.totalKills);
  };

  // Ordenar ranking
  const sortedRanking = useMemo(() => {
    return [...teamRanking].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "kills":
          comparison = a.totalKills - b.totalKills;
          break;
        case "pos":
          comparison = a.totalPosPoints - b.totalPosPoints;
          break;
        case "xtreinos":
          comparison = a.xtreinosPlayed - b.xtreinosPlayed;
          break;
        default:
          comparison = a.totalPoints - b.totalPoints;
          break;
      }
      return sortDir === "desc" ? -comparison : comparison;
    });
  }, [teamRanking, sortBy, sortDir]);

  // Filtro por busca
  const filteredRanking = useMemo(() => {
    if (!search.trim()) return sortedRanking;
    const q = search.toLowerCase();
    return sortedRanking.filter((t) => t.teamName.toLowerCase().includes(q));
  }, [sortedRanking, search]);

  // Busca jogadores do time e merge por ID
  const getTeamPlayers = (teamName: string): MergedPlayer[] => {
    const teamKey = teamName.trim().toLowerCase();
    const players = teamPlayersGrouped.get(teamKey) ?? [];
    return mergePlayersById(players);
  };

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortBy(field);
      setSortDir("desc");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setSortBy("total");
    setSortDir("desc");
  };

  const hasFilters = search.trim().length > 0 || sortBy !== "total";

  // Cards de resumo
  const summaryCards = [
    {
      icon: <Users className="w-4 h-4 text-blue-400" />,
      label: "Equipes",
      value: teamRanking.length,
    },
    {
      icon: <Swords className="w-4 h-4 text-red-400" />,
      label: "Total Kills",
      value: teamRanking.reduce((acc, t) => acc + t.totalKills, 0),
      valueColor: "text-red-400",
    },
    {
      icon: <Trophy className="w-4 h-4 text-yellow-400" />,
      label: "Pts Posicao",
      value: teamRanking.reduce((acc, t) => acc + t.totalPosPoints, 0),
      valueColor: "text-yellow-400",
    },
    {
      icon: <BarChart3 className="w-4 h-4 text-green-400" />,
      label: "Total Geral",
      value: teamRanking.reduce((acc, t) => acc + t.totalPoints, 0),
      valueColor: "text-green-400",
    },
    {
      icon: <Zap className="w-4 h-4 text-purple-400" />,
      label: "X-Treinos",
      value: totalXtreinosUnicos,
      valueColor: "text-purple-400",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <FilterBar hasFilters={hasFilters} onClear={clearFilters}>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar equipe..."
          minWidth="200px"
        />

        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#5a5a6e]" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortField)}
            className="px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50 min-w-[160px]"
          >
            <option value="total">Ordenar: Total Geral</option>
            <option value="kills">Ordenar: Kills Totais</option>
            <option value="pos">Ordenar: Pts Posicao</option>
            <option value="xtreinos">Ordenar: X-Treinos Jogados</option>
          </select>
        </div>
      </FilterBar>

      {/* Loading */}
      {isLoading && <LoadingSpinner text="Carregando ranking..." />}

      {/* Cards de Resumo */}
      {!isLoading && <SummaryCards cards={summaryCards} columns={5} />}

      {/* Tabela Principal */}
      {!isLoading && (
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center justify-between">
            <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-400" />
              Ranking Geral — Historico Completo
            </h3>
            <span className="text-xs text-[#5a5a6e]">
              {filteredRanking.length} equipes
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a2a3a] bg-[#0a0a0f]">
                  <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase w-14">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">
                    Equipe
                  </th>
                  <th className="px-4 py-3 text-center">
                    <SortHeader
                      field="xtreinos"
                      label="X-Treinos"
                      currentField={sortBy}
                      direction={sortDir}
                      onSort={handleSort}
                    />
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">
                    🥇 🥈 🥉
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">
                    Melhor Pos
                  </th>
                  <th className="px-4 py-3 text-center bg-yellow-500/5">
                    <SortHeader
                      field="pos"
                      label="Pts Pos"
                      currentField={sortBy}
                      direction={sortDir}
                      onSort={handleSort}
                    />
                  </th>
                  <th className="px-4 py-3 text-center">
                    <SortHeader
                      field="kills"
                      label="Kills"
                      currentField={sortBy}
                      direction={sortDir}
                      onSort={handleSort}
                    />
                  </th>
                  <th className="px-4 py-3 text-center bg-red-500/5">
                    <span className="text-xs font-medium text-[#5a5a6e] uppercase">Pts Kill</span>
                  </th>
                  <th className="px-4 py-3 text-center bg-green-500/5">
                    <SortHeader
                      field="total"
                      label="Total"
                      currentField={sortBy}
                      direction={sortDir}
                      onSort={handleSort}
                    />
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a3a]">
                {filteredRanking.map((team, index) => {
                  const rowKey = team.teamName;
                  const isExpanded = expandedTeam === rowKey;
                  const teamPlayers = getTeamPlayers(team.teamName);

                  return (
                    <ExpandableRow
                      key={rowKey}
                      rowKey={rowKey}
                      expandedKey={expandedTeam}
                      onToggle={setExpandedTeam}
                      rankStyle={getRankStyle(index)}
                      expandedContent={
                        <div className="ml-4 space-y-4">
                          {/* Historico de X-Treinos */}
                          <div>
                            <h4 className="text-xs font-medium text-[#5a5a6e] mb-3 flex items-center gap-2">
                              <Calendar className="w-3 h-3" />
                              Historico de X-Treinos ({team.xtreinos.length})
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
                                        <td className="px-3 py-2 text-center text-yellow-400 font-bold">
                                          {xt.totalPosPoints}
                                        </td>
                                        <td className="px-3 py-2 text-center text-[#8a8a9e]">{xt.totalKills}</td>
                                        <td className="px-3 py-2 text-center text-green-400 font-bold">
                                          {xt.totalPoints}
                                        </td>
                                      </tr>
                                    ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Jogadores do time — UNIFICADOS POR ID */}
                          {teamPlayers.length > 0 && (
                            <div>
                              <h4 className="text-xs font-medium text-[#5a5a6e] mb-3 flex items-center gap-2">
                                <Users className="w-3 h-3" />
                                Jogadores ({teamPlayers.length})
                              </h4>
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b border-[#2a2a3a]">
                                      <th className="px-3 py-2 text-left text-xs text-[#5a5a6e]">#</th>
                                      <th className="px-3 py-2 text-left text-xs text-[#5a5a6e]">Jogador</th>
                                      <th className="px-3 py-2 text-center text-xs text-[#5a5a6e]">Q1</th>
                                      <th className="px-3 py-2 text-center text-xs text-[#5a5a6e]">Q2</th>
                                      <th className="px-3 py-2 text-center text-xs text-[#5a5a6e]">Q3</th>
                                      <th className="px-3 py-2 text-center text-xs text-[#5a5a6e]">Total</th>
                                      <th className="px-3 py-2 text-center text-xs text-[#5a5a6e]">Partic.</th>
                                      <th className="px-3 py-2 text-center text-xs text-[#5a5a6e]">Media</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-[#2a2a3a]/50">
                                    {teamPlayers.map((player, idx) => {
                                      const hasPreviousNicks = player.previousNicks.length > 0;

                                      return (
                                        <tr key={player.id} className="hover:bg-[#1a1a24]/50">
                                          <td className="px-3 py-2 text-[#5a5a6e] text-xs">{idx + 1}</td>
                                          <td className="px-3 py-2">
                                            <div className="flex flex-col gap-1">
                                              <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center">
                                                  <Target className="w-3 h-3 text-green-400" />
                                                </div>
                                                <div className="flex flex-col">
                                                  <span className="text-sm font-medium text-[#f0f0f5]">
                                                    {player.nickname}
                                                  </span>
                                                  {player.id > 0 && (
                                                    <span className="text-[10px] text-[#5a5a6e]">
                                                      ID: {player.id}
                                                    </span>
                                                  )}
                                                </div>
                                              </div>
                                              {hasPreviousNicks && (
                                                <div className="flex items-center gap-1 ml-8">
                                                  <History className="w-3 h-3 text-[#5a5a6e]" />
                                                  <div className="flex flex-wrap gap-1">
                                                    {player.previousNicks.map((nick) => (
                                                      <span
                                                        key={nick}
                                                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#1a1a24] border border-[#2a2a3a] text-[10px] text-[#8a8a9e]"
                                                      >
                                                        <Tag className="w-2 h-2 text-[#5a5a6e]" />
                                                        {nick}
                                                      </span>
                                                    ))}
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          </td>
                                          <td className="px-3 py-2 text-center text-[#8a8a9e]">{player.totalQ1Kills}</td>
                                          <td className="px-3 py-2 text-center text-[#8a8a9e]">{player.totalQ2Kills}</td>
                                          <td className="px-3 py-2 text-center text-[#8a8a9e]">{player.totalQ3Kills}</td>
                                          <td className="px-3 py-2 text-center text-green-400 font-bold">{player.totalKills}</td>
                                          <td className="px-3 py-2 text-center text-[#5a5a6e]">{player.participations}</td>
                                          <td className="px-3 py-2 text-center text-[#8a8a9e]">{player.avgKills}</td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      }
                    >
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center">
                          <RankBadge index={index} />
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
                        <span
                          className={`text-sm font-bold ${
                            team.bestPosition && team.bestPosition <= 3
                              ? getPosColor(team.bestPosition)
                              : "text-[#8a8a9e]"
                          }`}
                        >
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
                    </ExpandableRow>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredRanking.length === 0 && (
            <EmptyState
              icon={<BarChart3 className="w-12 h-12" />}
              title="Nenhum dado disponivel"
            />
          )}
        </div>
      )}

      {/* Legenda */}
      <div className="grid md:grid-cols-3 gap-4 text-sm">
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
          <h4 className="font-bold text-[#f0f0f5] mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            Pontuacao por Posicao
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
            Pontuacao por Kill
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
            Calculo do Total
          </h4>
          <p className="text-[#8a8a9e] text-xs">
            <span className="text-yellow-400">Pts Posicao</span> +{" "}
            <span className="text-red-400">Pts Kill</span> ={" "}
            <span className="text-green-400 font-bold">Total</span>
          </p>
        </div>
      </div>
    </div>
  );
}