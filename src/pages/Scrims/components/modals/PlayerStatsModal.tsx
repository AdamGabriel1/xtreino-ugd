"use client";

import { X, Target, TrendingUp, Award, BarChart3, Crosshair, Zap } from "lucide-react";
import { useMemo } from "react";

interface PlayerStatsModalProps {
  playerName: string;
  teamName: string;
  isOpen: boolean;
  onClose: () => void;
}

// Dados mockados para demonstração
const MOCK_PLAYER_STATS = {
  totalKills: 124,
  totalDeaths: 45,
  totalAssists: 67,
  totalDamage: 45230,
  totalScrims: 12,
  mvps: 4,
  bestGame: { kills: 15, map: "Vale Deserto", date: "2026-06-13" },
  avgKills: 10.3,
  kd: 2.76,
  recentGames: [
    { date: "2026-06-13", map: "Vale Deserto", kills: 11, deaths: 1, assists: 5, damage: 3100, mvp: true },
    { date: "2026-06-13", map: "Ilha do Medo", kills: 12, deaths: 1, assists: 7, damage: 2732, mvp: true },
    { date: "2026-06-13", map: "Ilha do Medo", kills: 11, deaths: 0, assists: 4, damage: 4442, mvp: true },
    { date: "2026-06-10", map: "Bermuda", kills: 8, deaths: 2, assists: 3, damage: 2100, mvp: false },
    { date: "2026-06-09", map: "Kalahari", kills: 9, deaths: 1, assists: 6, damage: 3200, mvp: false },
  ],
  weaponStats: [
    { weapon: "AK47", kills: 45 },
    { weapon: "MP40", kills: 32 },
    { weapon: "AWM", kills: 28 },
    { weapon: "M4A1", kills: 19 },
  ],
};

export function PlayerStatsModal({ playerName, teamName, isOpen, onClose }: PlayerStatsModalProps) {
  if (!isOpen) return null;

  const stats = MOCK_PLAYER_STATS;

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
              sublabel={`${Math.round((stats.mvps / stats.totalScrims) * 100)}% dos jogos`}
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
                <p className="text-xs text-[#5a5a6e] mt-1">Kills</p>
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

          {/* Armas mais usadas */}
          <div className="bg-[#1a1a24] rounded-xl border border-[#2a2a3a] p-4">
            <h3 className="text-sm font-bold text-[#f0f0f5] mb-4 flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-red-400" />
              Armas Favoritas
            </h3>
            <div className="space-y-3">
              {stats.weaponStats.map((weapon) => (
                <div key={weapon.weapon} className="flex items-center gap-3">
                  <span className="text-sm text-[#f0f0f5] w-16">{weapon.weapon}</span>
                  <div className="flex-1 h-2 bg-[#2a2a3a] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-400 rounded-full transition-all"
                      style={{
                        width: `${(weapon.kills / stats.weaponStats[0].kills) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-[#8a8a9e] w-10 text-right">{weapon.kills}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Histórico de partidas */}
          <div className="bg-[#1a1a24] rounded-xl border border-[#2a2a3a] p-4">
            <h3 className="text-sm font-bold text-[#f0f0f5] mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Últimas Partidas
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[#5a5a6e] border-b border-[#2a2a3a]">
                    <th className="text-left py-2">Data</th>
                    <th className="text-left py-2">Mapa</th>
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
                      <td className="py-2 text-[#f0f0f5]">{game.map}</td>
                      <td className="py-2 text-center text-red-400 font-medium">{game.kills}</td>
                      <td className="py-2 text-center text-[#8a8a9e]">{game.deaths}</td>
                      <td className="py-2 text-center text-[#8a8a9e]">{game.assists}</td>
                      <td className="py-2 text-center text-[#8a8a9e]">{game.damage}</td>
                      <td className="py-2 text-center">
                        {game.mvp && <Award className="w-4 h-4 text-yellow-400 mx-auto" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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