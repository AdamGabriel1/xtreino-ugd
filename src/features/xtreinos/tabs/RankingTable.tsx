// ============================================================
// RankingTable.tsx — Tabela reutilizável (Puramente Visual)
// ============================================================

import { Link } from "react-router-dom";
import {
  Crown,
  Target,
  Calendar,
  Tag,
  History,
  Users,
  Flame,
  Award,
  CheckSquare,
  Square,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Swords,
} from "lucide-react";
import {
  RankBadge,
  SortHeader,
  Sparkline,
  EmptyState,
} from "@/components/shared";
import {
  type EnrichedTeam,
  type MergedPlayer,
  type SortField,
  getPosColor,
  getRankStyle,
} from "@/hooks/xtreinos/xtreino-shared";
import { TrendIcon, BadgeIcon } from "./xtreino-shared-components";
import { getPlayerBadges } from "@/utils/xtreino"; // NOVO
import React from "react";

interface RankingTableProps {
  isCompact?: boolean;
  teams: EnrichedTeam[];
  compareMode: boolean;
  selectedForCompare: Set<string>;
  onToggleCompare: (name: string) => void;
  expandedTeam: string | null;
  onToggleExpand: (key: string | null) => void;
  sortBy: SortField;
  sortDir: "asc" | "desc";
  onSort: (field: SortField) => void;
  getTeamPlayers: (teamName: string) => MergedPlayer[];
  title: string;
  subtitle?: string;
  flameThreshold?: number;
  clanNameToIdMap?: Map<string, number>;
  teamNameToIdMap?: Map<string, number>;
}

export function RankingTable({
  isCompact = false,
  teams,
  compareMode,
  selectedForCompare,
  onToggleCompare,
  expandedTeam,
  onToggleExpand,
  sortBy,
  sortDir,
  onSort,
  getTeamPlayers,
  title,
  subtitle,
  flameThreshold = 10,
  clanNameToIdMap,
  teamNameToIdMap,
}: RankingTableProps) {
  
  const baseCols = 6;
  const dynamicCols = isCompact ? 0 : 6;
  const compareCol = compareMode ? 1 : 0;
  const totalCols = baseCols + dynamicCols + compareCol;

  return (
    <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center justify-between">
        <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-400" />
          {title}
          {subtitle && (
            <span className="text-xs font-normal text-[#5a5a6e] ml-2">
              ({subtitle})
            </span>
          )}
        </h3>
        <div className="flex items-center gap-3">
          {compareMode && (
            <span className="text-xs text-green-400">
              {selectedForCompare.size}/4 selecionados
            </span>
          )}
          <span className="text-xs text-[#5a5a6e]">
            {teams.length} equipes
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2a2a3a] bg-[#0a0a0f]">
              {compareMode && (
                <th className="px-3 py-3 text-center w-10">
                  <span className="text-xs font-medium text-[#5a5a6e]">#</span>
                </th>
              )}
              <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase w-14">#</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Equipe</th>
              <th className="px-4 py-3 text-center">
                <SortHeader field="xtreinos" label="X-Treinos" currentField={sortBy} direction={sortDir} onSort={onSort} />
              </th>
              {!isCompact && (
                <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">🥇 🥈 🥉</th>
              )}
              {!isCompact && (
                <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Melhor Pos</th>
              )}
              <th className="px-4 py-3 text-center">
                <SortHeader field="avgPos" label="Media Pos" currentField={sortBy} direction={sortDir} onSort={onSort} />
              </th>
              {!isCompact && (
                <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Evol.</th>
              )}
              {!isCompact && (
                <th className="px-4 py-3 text-center bg-yellow-500/5">
                  <SortHeader field="pos" label="Pts Pos" currentField={sortBy} direction={sortDir} onSort={onSort} />
                </th>
              )}
              <th className="px-4 py-3 text-center">
                <SortHeader field="kills" label="Kills" currentField={sortBy} direction={sortDir} onSort={onSort} />
              </th>
              {!isCompact && (
                <th className="px-4 py-3 text-center bg-red-500/5">
                  <span className="text-xs font-medium text-[#5a5a6e] uppercase">Pts Kill</span>
                </th>
              )}
              <th className="px-4 py-3 text-center bg-green-500/5">
                <SortHeader field="total" label="Total" currentField={sortBy} direction={sortDir} onSort={onSort} />
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2a3a]">
            {teams.map((team, index) => {
              const rowKey = team.teamName;
              const isExpanded = expandedTeam === rowKey;
              const teamPlayers = getTeamPlayers(team.teamName);

              return (
                <React.Fragment key={rowKey}>
                  <tr
                    className={`${getRankStyle(index)} hover:bg-[#1a1a24]/50 transition-colors cursor-pointer`}
                    onClick={() => onToggleExpand(isExpanded ? null : rowKey)}
                  >
                    {compareMode && (
                      <td className="px-3 py-3 text-center">
                        <button
                          onClick={(e) => { e.stopPropagation(); onToggleCompare(team.teamName); }}
                          className="text-[#5a5a6e] hover:text-green-400 transition-colors"
                        >
                          {selectedForCompare.has(team.teamName) ? <CheckSquare className="w-4 h-4 text-green-400" /> : <Square className="w-4 h-4" />}
                        </button>
                      </td>
                    )}
                    <td className="px-4 py-3 text-center"><RankBadge index={index} /></td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          {clanNameToIdMap?.get(team.teamName.trim().toLowerCase()) ? (
                            <Link to={`/clans/${clanNameToIdMap.get(team.teamName.trim().toLowerCase())}`} onClick={(e) => e.stopPropagation()} className="text-sm font-bold text-[#f0f0f5] hover:text-emerald-400 transition-colors">{team.teamName}</Link>
                          ) : teamNameToIdMap?.get(team.teamName.trim().toLowerCase()) ? (
                            <Link to={`/clans/${teamNameToIdMap.get(team.teamName.trim().toLowerCase())}/line/${teamNameToIdMap.get(team.teamName.trim().toLowerCase())}`} onClick={(e) => e.stopPropagation()} className="text-sm font-bold text-[#f0f0f5] hover:text-emerald-400 transition-colors">{team.teamName}</Link>
                          ) : (
                            <span className="text-sm font-bold text-[#f0f0f5]">{team.teamName}</span>
                          )}
                          
                          {team.pointsVsPrevMonth !== null && team.pointsVsPrevMonth !== 0 && (
                            <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded ${team.pointsVsPrevMonth > 0 ? "text-green-400 bg-green-500/10" : "text-red-400 bg-red-500/10"}`}>
                              {team.pointsVsPrevMonth > 0 ? "↑" : "↓"} {Math.abs(team.pointsVsPrevMonth)} pts
                            </span>
                          )}
                        </div>
                        
                        {!isCompact && team.badges.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap">
                            {team.badges.slice(0, 2).map((badge) => (
                              <span key={badge} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#1a1a24] border border-[#2a2a3a] text-[10px] text-[#8a8a9e]">
                                <BadgeIcon badge={badge} /> {badge}
                              </span>
                            ))}
                            {team.badges.length > 2 && <span className="text-[10px] text-[#5a5a6e]">+{team.badges.length - 2}</span>}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-purple-400">
                        {team.xtreinosPlayed >= flameThreshold && <Flame className="w-3.5 h-3.5 text-orange-400" />}
                        {team.xtreinosPlayed}
                      </span>
                    </td>
                    {!isCompact && (
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2 text-xs">
                          {team.top1Count > 0 && <span className="text-yellow-400 font-bold">{team.top1Count}🥇</span>}
                          {team.top2Count > 0 && <span className="text-gray-300 font-bold">{team.top2Count}🥈</span>}
                          {team.top3Count > 0 && <span className="text-amber-500 font-bold">{team.top3Count}🥉</span>}
                          {team.top1Count === 0 && team.top2Count === 0 && team.top3Count === 0 && <span className="text-[#5a5a6e]">-</span>}
                        </div>
                      </td>
                    )}
                    {!isCompact && (
                      <td className="px-4 py-3 text-center">
                        <span className={`text-sm font-bold ${team.bestPosition && team.bestPosition <= 3 ? getPosColor(team.bestPosition) : "text-[#8a8a9e]"}`}>
                          {team.bestPosition ? `${team.bestPosition}º` : "-"}
                        </span>
                      </td>
                    )}
                    <td className="px-4 py-3 text-center text-sm text-[#8a8a9e]">{team.avgPosition > 0 ? team.avgPosition : "-"}</td>
                    {!isCompact && (
                      <td className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <Sparkline data={team.sparkline} />
                          <TrendIcon trend={team.trend} />
                        </div>
                      </td>
                    )}
                    {!isCompact && (
                      <td className="px-4 py-3 text-center bg-yellow-500/5">
                        <span className="text-sm font-bold text-yellow-400">{team.totalPosPoints}</span>
                      </td>
                    )}
                    <td className="px-4 py-3 text-center"><span className="text-sm text-[#8a8a9e]">{team.totalKills}</span></td>
                    {!isCompact && (
                      <td className="px-4 py-3 text-center bg-red-500/5">
                        <span className="text-sm font-bold text-red-400">{team.totalKillPoints}</span>
                      </td>
                    )}
                    <td className="px-4 py-3 text-center bg-green-500/5">
                      <span className="text-lg font-bold text-green-400">{team.totalPoints}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-[#5a5a6e]" /> : <ChevronDown className="w-4 h-4 text-[#5a5a6e]" />}
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className="bg-[#0a0a0f]/50">
                      <td colSpan={totalCols} className="px-6 py-4">
                        <ExpandedTeamContent team={team} players={teamPlayers} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {teams.length === 0 && (
        <EmptyState icon={<Swords className="w-12 h-12" />} title="Nenhum dado disponivel" />
      )}
    </div>
  );
}

// ============================================================
// SUB-COMPONENTES PURAMENTE VISUAIS
// ============================================================

function ExpandedTeamContent({ team, players }: { team: EnrichedTeam; players: MergedPlayer[] }) {
  return (
    <div className="ml-4 space-y-4">
      {team.badges.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-[#5a5a6e] mb-2 flex items-center gap-2"><Award className="w-3 h-3" /> Conquistas do Time</h4>
          <div className="flex flex-wrap gap-2">
            {team.badges.map((badge) => (
              <span key={badge} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#1a1a24] border border-[#2a2a3a] text-xs text-[#8a8a9e]">
                <BadgeIcon badge={badge} /> {badge}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Melhor" value={team.bestPerformance} color="text-green-400" />
        <StatCard label="Pior" value={team.worstPerformance} color="text-red-400" />
        <StatCard label="Consistencia" value={team.consistency} color="text-[#f0f0f5]" />
        <StatCard label="Top 1s" value={team.top1Count} color="text-yellow-400" />
      </div>

      {team.sparkline.length > 1 && (
        <div>
          <h4 className="text-xs font-medium text-[#5a5a6e] mb-2 flex items-center gap-2"><TrendingUp className="w-3 h-3" /> Evolucao do Time</h4>
          <div className="bg-[#1a1a24] rounded-lg border border-[#2a2a3a] p-3">
            <Sparkline data={team.sparkline} width={300} height={40} />
          </div>
        </div>
      )}

      <div>
        <h4 className="text-xs font-medium text-[#5a5a6e] mb-3 flex items-center gap-2"><Calendar className="w-3 h-3" /> Historico de X-Treinos ({team.xtreinos.length})</h4>
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
              {team.xtreinos.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((xt) => (
                <tr key={xt.date} className="hover:bg-[#1a1a24]/50">
                  <td className="px-3 py-2 text-[#8a8a9e]">{xt.date.split("-")[2]}/{xt.date.split("-")[1]}</td>
                  <td className="px-3 py-2 text-center"><span className={getPosColor(xt.q1Pos)}>{xt.q1Pos ?? "-"}</span></td>
                  <td className="px-3 py-2 text-center"><span className={getPosColor(xt.q2Pos)}>{xt.q2Pos ?? "-"}</span></td>
                  <td className="px-3 py-2 text-center"><span className={getPosColor(xt.q3Pos)}>{xt.q3Pos ?? "-"}</span></td>
                  <td className="px-3 py-2 text-center text-yellow-400 font-bold">{xt.totalPosPoints}</td>
                  <td className="px-3 py-2 text-center text-[#8a8a9e]">{xt.totalKills}</td>
                  <td className="px-3 py-2 text-center text-green-400 font-bold">{xt.totalPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {players.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-[#5a5a6e] mb-3 flex items-center gap-2"><Users className="w-3 h-3" /> Jogadores ({players.length})</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a2a3a]">
                  <th className="px-3 py-2 text-left text-xs text-[#5a5a6e] w-8">#</th>
                  <th className="px-3 py-2 text-left text-xs text-[#5a5a6e]">Jogador</th>
                  <th className="px-3 py-2 text-center text-xs text-[#5a5a6e]">Partic.</th>
                  <th className="px-3 py-2 text-center text-xs text-[#5a5a6e]">Q1</th>
                  <th className="px-3 py-2 text-center text-xs text-[#5a5a6e]">Q2</th>
                  <th className="px-3 py-2 text-center text-xs text-[#5a5a6e]">Q3</th>
                  <th className="px-3 py-2 text-center text-xs text-[#5a5a6e]">Media</th>
                  <th className="px-3 py-2 text-center text-xs text-[#5a5a6e]">Evol.</th>
                  <th className="px-3 py-2 text-center text-xs text-[#5a5a6e] bg-green-500/5">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a3a]/50">
                {players.map((player, idx) => {
                  // Lógica de cálculo extraída para o utils
                  const playerBadges = getPlayerBadges(player.totalKills, player.participations, player.avgKills);
                  const playerTrend: "up" | "down" | "same" = player.avgKills >= 7 ? "up" : player.avgKills < 4 ? "down" : "same";

                  return (
                    <tr key={player.id} className="hover:bg-[#1a1a24]/50">
                      <td className="px-3 py-2 text-[#5a5a6e] text-xs">{idx + 1}</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center"><Target className="w-3 h-3 text-green-400" /></div>
                            <div className="flex flex-col">
                              {player.id > 0 ? (
                                <Link to={`/jogador/${player.id}`} className="text-sm font-medium text-[#f0f0f5] hover:text-emerald-400 transition-colors">{player.nickname}</Link>
                              ) : (
                                <span className="text-sm font-medium text-[#f0f0f5]">{player.nickname}</span>
                              )}
                              <span className="text-[10px] text-[#5a5a6e]">ID: {player.id}</span>
                            </div>
                          </div>
                          
                          {playerBadges.length > 0 && (
                            <div className="flex items-center gap-1 ml-8 flex-wrap">
                              {playerBadges.slice(0, 3).map((badge) => (
                                <span key={badge} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#1a1a24] border border-[#2a2a3a] text-[10px] text-[#8a8a9e]">
                                  <BadgeIcon badge={badge} /> {badge}
                                </span>
                              ))}
                              {playerBadges.length > 3 && <span className="text-[10px] text-[#5a5a6e]">+{playerBadges.length - 3}</span>}
                            </div>
                          )}

                          {player.previousNicks.length > 0 && (
                            <div className="flex items-center gap-1 ml-8">
                              <History className="w-3 h-3 text-[#5a5a6e]" />
                              <div className="flex flex-wrap gap-1">
                                {player.previousNicks.map((nick) => (
                                  <span key={nick} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#1a1a24] border border-[#2a2a3a] text-[10px] text-[#8a8a9e]">
                                    <Tag className="w-2 h-2 text-[#5a5a6e]" /> {nick}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-3 py-2 text-center text-[#8a8a9e]">{player.participations}</td>
                      <td className="px-3 py-2 text-center text-red-400/80">{player.totalQ1Kills}</td>
                      <td className="px-3 py-2 text-center text-orange-400/80">{player.totalQ2Kills}</td>
                      <td className="px-3 py-2 text-center text-purple-400/80">{player.totalQ3Kills}</td>
                      <td className="px-3 py-2 text-center text-[#8a8a9e]">{player.avgKills}</td>
                      <td className="px-3 py-2 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xs text-[#5a5a6e]">—</span> 
                          <TrendIcon trend={playerTrend} />
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center text-green-400 font-bold bg-green-500/5">{player.totalKills}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-[#1a1a24] rounded-lg border border-[#2a2a3a] p-3 text-center">
      <p className="text-xs text-[#5a5a6e] mb-1">{label}</p>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
  );
}