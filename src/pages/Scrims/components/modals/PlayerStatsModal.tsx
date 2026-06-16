"use client";

import { X, Target, TrendingUp, Award, BarChart3, Crosshair, Zap, Shield, CrosshairIcon } from "lucide-react";
import { useMemo } from "react";
import { trpc } from "@/providers/trpc";

interface PlayerStatsModalProps {
  playerName: string;
  teamName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PlayerStatsModal({ playerName, teamName, isOpen, onClose }: PlayerStatsModalProps) {
  const { data: playerGames } = trpc.scrims.playerStatsByName.useQuery(
    { playerName },
    { enabled: isOpen && !!playerName }
  );

  if (!isOpen) return null;

  // Calcular estatísticas agregadas dos dados reais
  const stats = useMemo(() => {
    if (!playerGames || playerGames.length === 0) {
      return {
        totalKills: 0,
        totalDeaths: 0,
        totalAssists: 0,
        totalDamage: 0,
        totalScrims: 0,
        mvps: 0,
        bestGame: { kills: 0, map: "—", date: "—" },
        avgKills: 0,
        kd: 0,
        recentGames: [],
      };
    }

    const totalKills = playerGames.reduce((sum, g) => sum + (g.totalKills || 0), 0);
    const totalDeaths = playerGames.reduce((sum, g) => sum + (g.totalDeaths || 0), 0);
    const totalAssists = playerGames.reduce((sum, g) => sum + (g.totalAssists || 0), 0);
    const totalDamage = playerGames.reduce((sum, g) => sum + (g.totalDamage || 0), 0);
    const totalMvp = playerGames.reduce((sum, g) => sum + (g.totalMvp || 0), 0);

    // Encontrar melhor partida (mais kills em uma única queda)
    let bestKills = 0;
    let bestGame = { kills: 0, map: "—", date: "—" };
    for (const g of playerGames) {
      const qKills = [g.q1Kills || 0, g.q2Kills || 0, g.q3Kills || 0];
      const maxQ = Math.max(...qKills);
      if (maxQ > bestKills) {
        bestKills = maxQ;
        bestGame = { kills: maxQ, map: "—", date: g.date || "—" };
      }
    }

    const avgKills = playerGames.length > 0 ? totalKills / playerGames.length : 0;
    const kd = totalDeaths > 0 ? totalKills / totalDeaths : totalKills;

    // Jogos recentes (últimos 5)
    const recentGames = playerGames
      .slice(0, 5)
      .map((g) => ({
        date: g.date || "—",
        kills: g.totalKills || 0,
        deaths: g.totalDeaths || 0,
        assists: g.totalAssists || 0,
        damage: g.totalDamage || 0,
        mvp: (g.totalMvp || 0) > 0,
      }));

    return {
      totalKills,
      totalDeaths,
      totalAssists,
      totalDamage,
      totalScrims: playerGames.length,
      mvps: totalMvp,
      bestGame,
      avgKills: avgKills.toFixed(1),
      kd: kd.toFixed(2),
      recentGames,
    };
  }, [playerGames]);

  const kda = useMemo(() => {
    const d = stats.totalDeaths || 1;
    return ((stats.totalKills + stats.totalAssists) / d).toFixed(2);
  }, [stats]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a3a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Crosshair className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#f0f0f5]">{playerName}</h2>
              <p className="text-xs text-[#5a5a6e]">{teamName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#5a5a6e] hover:text-[#f0f0f5] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Cards principais */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              icon={<Target className="w-4 h-4 text-red-400" />}
              label="Kills"
              value={stats.totalKills}
              sublabel={`${stats.avgKills} média`}
            />
            <StatCard
              icon={<Zap className="w-4 h-4 text-yellow-400" />}
              label="K/D"
              value={stats.kd}
              sublabel={`KDA: ${kda}`}
            />
            <StatCard
              icon={<Award className="w-4 h-4 text-purple-400" />}
              label="MVPs"
              value={stats.mvps}
              sublabel={stats.totalScrims > 0 ? `${Math.round((stats.mvps / stats.totalScrims) * 100)}% dos jogos` : "0%"}
            />
            <StatCard
              icon={<BarChart3 className="w-4 h-4 text-emerald-400" />}
              label="Scrims"
              value={stats.totalScrims}
              sublabel="Total participado"
            />
          </div>

          {/* Melhor partida */}
          <div className="bg-gradient-to-r from-yellow-500/5 to-amber-500/5 rounded-xl border border-yellow-500/10 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-bold text-[#f0f0f5]">Melhor Partida</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-400">{stats.bestGame.kills}</p>
                <p className="text-xs text-[#5a5a6e] mt-1">Kills (queda)</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-[#f0f0f5]">{stats.bestGame.map}</p>
                <p className="text-xs text-[#5a5a6e] mt-1">Mapa</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-[#f0f0f5]">{stats.bestGame.date}</p>
                <p className="text-xs text-[#5a5a6e] mt-1">Data</p>
              </div>
            </div>
          </div>

          {/* Resumo por queda */}
          {playerGames && playerGames.length > 0 && (
            <div className="bg-[#1a1a24] rounded-xl border border-[#2a2a3a] p-4">
              <h3 className="text-sm font-bold text-[#f0f0f5] mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                Performance por Queda (última scrim)
              </h3>
              {playerGames.slice(0, 1).map((g, idx) => (
                <div key={idx} className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-red-400">{g.q1Kills || 0}K / {g.q1Assists || 0}A / {g.q1Deaths || 0}D</p>
                    <p className="text-xs text-[#5a5a6e] mt-1">Q1 {g.q1Mvp ? "⭐ MVP" : ""}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-red-400">{g.q2Kills || 0}K / {g.q2Assists || 0}A / {g.q2Deaths || 0}D</p>
                    <p className="text-xs text-[#5a5a6e] mt-1">Q2 {g.q2Mvp ? "⭐ MVP" : ""}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-red-400">{g.q3Kills || 0}K / {g.q3Assists || 0}A / {g.q3Deaths || 0}D</p>
                    <p className="text-xs text-[#5a5a6e] mt-1">Q3 {g.q3Mvp ? "⭐ MVP" : ""}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Histórico de partidas */}
          <div className="bg-[#1a1a24] rounded-xl border border-[#2a2a3a] p-4">
            <h3 className="text-sm font-bold text-[#f0f0f5] mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Últimas Scrims
            </h3>
            {stats.recentGames.length === 0 ? (
              <p className="text-sm text-[#5a5a6e] text-center py-4">Nenhum dado disponível</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[#5a5a6e] border-b border-[#2a2a3a]">
                      <th className="text-left py-2">Data</th>
                      <th className="text-center py-2">K</th>
                      <th className="text-center py-2">D</th>
                      <th className="text-center py-2">A</th>
                      <th className="text-center py-2">DMG</th>
                      <th className="text-center py-2">MVP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentGames.map((game, i) => (
                      <tr key={i} className="border-b border-[#2a2a3a]/50 last:border-0">
                        <td className="py-2 text-[#8a8a9e]">{game.date}</td>
                        <td className="py-2 text-center text-red-400 font-medium">{game.kills}</td>
                        <td className="py-2 text-center text-[#8a8a9e]">{game.deaths}</td>
                        <td className="py-2 text-center text-[#8a8a9e]">{game.assists}</td>
                        <td className="py-2 text-center text-[#8a8a9e]">{(game.damage).toLocaleString()}</td>
                        <td className="py-2 text-center">
                          {game.mvp && <Award className="w-4 h-4 text-yellow-400 mx-auto" />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sublabel }: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
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