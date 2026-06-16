"use client";

import { X, Trophy, Target, TrendingUp, BarChart3, Users, Flame, Award } from "lucide-react";
import { useMemo } from "react";
import { trpc } from "@/providers/trpc";

interface TeamStatsModalProps {
  teamName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function TeamStatsModal({ teamName, isOpen, onClose }: TeamStatsModalProps) {
  const { data: teamResults } = trpc.scrims.teamStatsByName.useQuery(
    { teamName },
    { enabled: isOpen && !!teamName }
  );

  const { data: allPlayerStats } = trpc.scrims.listPlayerStats.useQuery();

  if (!isOpen) return null;

  const stats = useMemo(() => {
    if (!teamResults || teamResults.length === 0) {
      return {
        totalScrims: 0,
        totalKills: 0,
        totalPoints: 0,
        wins: 0,
        top3Count: 0,
        bestPosition: 0,
        worstPosition: 0,
        avgPosition: 0,
        streak: 0,
        recentResults: [],
        topPlayers: [],
      };
    }

    // Calcular estatísticas dos resultados do time
    const totalScrims = teamResults.length;
    const wins = teamResults.reduce((sum, r) => {
      return sum + [r.q1Pos, r.q2Pos, r.q3Pos].filter(p => p === 1).length;
    }, 0);

    const positions: number[] = [];
    for (const r of teamResults) {
      if (r.q1Pos) positions.push(r.q1Pos);
      if (r.q2Pos) positions.push(r.q2Pos);
      if (r.q3Pos) positions.push(r.q3Pos);
    }

    const bestPosition = positions.length > 0 ? Math.min(...positions) : 0;
    const worstPosition = positions.length > 0 ? Math.max(...positions) : 0;
    const avgPosition = positions.length > 0
      ? positions.reduce((a, b) => a + b, 0) / positions.length
      : 0;

    // Top 3 (posições 1, 2, 3)
    const top3Count = positions.filter(p => p && p <= 3).length;

    // Calcular pontos baseado nas posições
    const totalPoints = positions.reduce((sum, pos) => sum + getPointsByPosition(pos), 0);

    // Jogadores do time (filtrar por teamName nas player stats)
    const teamPlayers = (allPlayerStats || []).filter(p => p.teamName === teamName);
    const playerMap = new Map<string, { name: string; kills: number; mvps: number }>();

    for (const p of teamPlayers) {
      const existing = playerMap.get(p.playerName);
      if (existing) {
        existing.kills += p.totalKills || 0;
        existing.mvps += p.totalMvp || 0;
      } else {
        playerMap.set(p.playerName, {
          name: p.playerName,
          kills: p.totalKills || 0,
          mvps: p.totalMvp || 0,
        });
      }
    }

    const topPlayers = Array.from(playerMap.values())
      .sort((a, b) => b.kills - a.kills)
      .slice(0, 5);

    // Resultados recentes
    const recentResults = teamResults
      .slice(0, 5)
      .map((r) => ({
        date: r.date || "—",
        position: r.q1Pos || 0,
        kills: 0, // Não temos kills por time diretamente, só por jogador
        map: "—",
      }));

    // Calcular streak (vitórias consecutivas)
    let streak = 0;
    for (let i = teamResults.length - 1; i >= 0; i--) {
      const r = teamResults[i];
      const hasWin = [r.q1Pos, r.q2Pos, r.q3Pos].some(p => p === 1);
      if (hasWin) streak++;
      else break;
    }

    return {
      totalScrims,
      totalKills: teamPlayers.reduce((sum, p) => sum + (p.totalKills || 0), 0),
      totalPoints,
      wins,
      top3Count,
      bestPosition,
      worstPosition,
      avgPosition,
      streak,
      recentResults,
      topPlayers,
    };
  }, [teamResults, allPlayerStats]);

  const winRate = useMemo(() =>
    stats.totalScrims > 0 ? Math.round((stats.wins / (stats.totalScrims * 3)) * 100) : 0,
    [stats]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a3a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#f0f0f5]">{teamName}</h2>
              <p className="text-xs text-[#5a5a6e]">Estatísticas detalhadas</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#5a5a6e] hover:text-[#f0f0f5] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Cards de resumo */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              icon={<Trophy className="w-4 h-4 text-yellow-400" />}
              label="Vitórias"
              value={stats.wins}
              sublabel={`${winRate}% win rate`}
            />
            <StatCard
              icon={<Target className="w-4 h-4 text-red-400" />}
              label="Kills Totais"
              value={stats.totalKills}
              sublabel={stats.totalScrims > 0 ? `${Math.round(stats.totalKills / stats.totalScrims)} média/scrim` : "0"}
            />
            <StatCard
              icon={<BarChart3 className="w-4 h-4 text-emerald-400" />}
              label="Pontos"
              value={stats.totalPoints}
              sublabel="Total acumulado"
            />
            <StatCard
              icon={<Flame className="w-4 h-4 text-orange-400" />}
              label="Streak"
              value={stats.streak}
              sublabel="Quedas vencidas seguidas"
            />
          </div>

          {/* Performance */}
          <div className="bg-[#1a1a24] rounded-xl border border-[#2a2a3a] p-4">
            <h3 className="text-sm font-bold text-[#f0f0f5] mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Performance
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-400">{stats.bestPosition > 0 ? `${stats.bestPosition}º` : "—"}</p>
                <p className="text-xs text-[#5a5a6e] mt-1">Melhor Posição</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-400">{stats.avgPosition > 0 ? stats.avgPosition.toFixed(1) : "—"}</p>
                <p className="text-xs text-[#5a5a6e] mt-1">Média</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-400">{stats.worstPosition > 0 ? `${stats.worstPosition}º` : "—"}</p>
                <p className="text-xs text-[#5a5a6e] mt-1">Pior Posição</p>
              </div>
            </div>
          </div>

          {/* Top Jogadores */}
          <div className="bg-[#1a1a24] rounded-xl border border-[#2a2a3a] p-4">
            <h3 className="text-sm font-bold text-[#f0f0f5] mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-400" />
              Top Jogadores
            </h3>
            {stats.topPlayers.length === 0 ? (
              <p className="text-sm text-[#5a5a6e] text-center py-4">Nenhum dado disponível</p>
            ) : (
              <div className="space-y-2">
                {stats.topPlayers.map((player, i) => (
                  <div key={player.name} className="flex items-center justify-between py-2 border-b border-[#2a2a3a]/50 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-bold w-6 ${i < 3 ? "text-yellow-400" : "text-[#5a5a6e]"}`}>
                        #{i + 1}
                      </span>
                      <span className="text-sm text-[#f0f0f5]">{player.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-[#8a8a9e]">{player.kills} kills</span>
                      {player.mvps > 0 && (
                        <span className="text-xs text-yellow-400 font-medium">{player.mvps} MVP</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Histórico recente */}
          <div className="bg-[#1a1a24] rounded-xl border border-[#2a2a3a] p-4">
            <h3 className="text-sm font-bold text-[#f0f0f5] mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              Histórico Recente
            </h3>
            {stats.recentResults.length === 0 ? (
              <p className="text-sm text-[#5a5a6e] text-center py-4">Nenhum dado disponível</p>
            ) : (
              <div className="space-y-2">
                {stats.recentResults.map((result, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-[#2a2a3a]/50 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-bold w-8 ${
                        result.position === 1 ? "text-yellow-400" :
                        result.position === 2 ? "text-gray-300" :
                        result.position === 3 ? "text-amber-500" : "text-[#5a5a6e]"
                      }`}>
                        {result.position > 0 ? `${result.position}º` : "—"}
                      </span>
                      <div>
                        <p className="text-sm text-[#f0f0f5]">{result.map}</p>
                        <p className="text-xs text-[#5a5a6e]">{result.date}</p>
                      </div>
                    </div>
                    <span className="text-sm text-emerald-400 font-medium">{result.kills} kills</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getPointsByPosition(pos: number | null): number {
  if (!pos) return 0;
  const points: Record<number, number> = {
    1: 15, 2: 12, 3: 10, 4: 9, 5: 8, 6: 7,
    7: 6, 8: 5, 9: 4, 10: 3, 11: 2, 12: 1,
    13: 1, 14: 0, 15: 0,
  };
  return points[pos] ?? 0;
}

function StatCard({ icon, label, value, sublabel }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  sublabel: string;
}) {
  return (
    <div className="bg-[#1a1a24] rounded-xl border border-[#2a2a3a] p-3">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-[#5a5a6e]">{label}</span>
      </div>
      <p className="text-xl font-bold text-[#f0f0f5]">{value}</p>
      <p className="text-[10px] text-[#5a5a6e] mt-1">{sublabel}</p>
    </div>
  );
}