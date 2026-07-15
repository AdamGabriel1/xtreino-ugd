"use client";

import { X, Target, TrendingUp, Award, BarChart3, Zap, Crosshair } from "lucide-react";
import { useMemo } from "react";
import { trpc } from "@/providers/trpc";

interface PlayerStatsModalProps {
  playerName: string;
  teamName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PlayerStatsModal({ playerName, teamName, isOpen, onClose }: PlayerStatsModalProps) {
  const { data: playerGames } = trpc.scrims.playerStatsByName.useQuery({ playerName }, { enabled: isOpen && !!playerName });

  if (!isOpen) return null;

  const stats = useMemo(() => {
    if (!playerGames || playerGames.length === 0) return { totalKills: 0, totalDeaths: 0, totalAssists: 0, totalDamage: 0, totalScrims: 0, mvps: 0, bestGame: { kills: 0, date: "—" }, avgKills: "0", kd: "0", recentGames: [], lastGameRounds: [] };

    const totalKills = playerGames.reduce((sum, g) => sum + (g.totalKills || 0), 0);
    const totalDeaths = playerGames.reduce((sum, g) => sum + (g.totalDeaths || 0), 0);
    const totalAssists = playerGames.reduce((sum, g) => sum + (g.totalAssists || 0), 0);
    const totalDamage = playerGames.reduce((sum, g) => sum + (g.totalDamage || 0), 0);
    const totalMvp = playerGames.reduce((sum, g) => sum + (g.totalMvp || 0), 0);

    let bestKills = 0;
    let bestGame = { kills: 0, date: "—" };
    for (const g of playerGames) {
      const rounds = (g as any).rounds || [];
      const maxKills = Math.max(...rounds.map((r: any) => r.kills || 0), 0);
      if (maxKills > bestKills) { bestKills = maxKills; bestGame = { kills: maxKills, date: g.date || "—" }; }
    }

    const avgKills = (playerGames.length > 0 ? totalKills / playerGames.length : 0).toFixed(1);
    const kd = (totalDeaths > 0 ? totalKills / totalDeaths : totalKills).toFixed(2);

    const recentGames = playerGames.slice(0, 5).map((g) => ({ date: g.date || "—", kills: g.totalKills || 0, deaths: g.totalDeaths || 0, assists: g.totalAssists || 0, damage: g.totalDamage || 0, mvp: (g.totalMvp || 0) > 0 }));

    // Pega as rodadas do último jogo para mostrar detalhadamente
    const lastGameRounds = (playerGames[0] as any).rounds || [];

    return { totalKills, totalDeaths, totalAssists, totalDamage, totalScrims: playerGames.length, mvps: totalMvp, bestGame, avgKills, kd, recentGames, lastGameRounds };
  }, [playerGames]);

  const kda = ((stats.totalKills + stats.totalAssists) / (stats.totalDeaths || 1)).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a3a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center"><Crosshair className="w-5 h-5 text-blue-400" /></div>
            <div><h2 className="text-xl font-bold text-[#f0f0f5]">{playerName}</h2><p className="text-xs text-[#5a5a6e]">{teamName}</p></div>
          </div>
          <button onClick={onClose} className="text-[#5a5a6e] hover:text-[#f0f0f5]"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={<Target className="w-4 h-4 text-red-400" />} label="Kills" value={stats.totalKills} sublabel={`${stats.avgKills} média`} />
            <StatCard icon={<Zap className="w-4 h-4 text-yellow-400" />} label="K/D" value={stats.kd} sublabel={`KDA: ${kda}`} />
            <StatCard icon={<Award className="w-4 h-4 text-purple-400" />} label="MVPs" value={stats.mvps} sublabel={stats.totalScrims > 0 ? `${Math.round((stats.mvps / stats.totalScrims) * 100)}% dos jogos` : "0%"} />
            <StatCard icon={<BarChart3 className="w-4 h-4 text-emerald-400" />} label="Scrims" value={stats.totalScrims} sublabel="Total participado" />
          </div>

          <div className="bg-gradient-to-r from-yellow-500/5 to-amber-500/5 rounded-xl border border-yellow-500/10 p-4">
            <div className="flex items-center gap-2 mb-3"><Award className="w-4 h-4 text-yellow-400" /><span className="text-sm font-bold text-[#f0f0f5]">Melhor Queda</span></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center"><p className="text-2xl font-bold text-yellow-400">{stats.bestGame.kills}</p><p className="text-xs text-[#5a5a6e] mt-1">Kills</p></div>
              <div className="text-center"><p className="text-lg font-bold text-[#f0f0f5]">{stats.bestGame.date}</p><p className="text-xs text-[#5a5a6e] mt-1">Data</p></div>
            </div>
          </div>

          {/* PERFORMANCE DINÂMICA POR QUEDA */}
          {stats.lastGameRounds.length > 0 && (
            <div className="bg-[#1a1a24] rounded-xl border border-[#2a2a3a] p-4">
              <h3 className="text-sm font-bold text-[#f0f0f5] mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-blue-400" /> Performance por Queda (Última Scrim)</h3>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {stats.lastGameRounds.map((r: any, i: number) => (
                  <div key={i} className="text-center bg-[#12121a] p-2 rounded-lg border border-[#2a2a3a]">
                    <p className="text-xs text-[#5a5a6e] mb-1">Q{i + 1} {r.mvp ? "⭐" : ""}</p>
                    <p className="text-sm font-bold text-red-400">{r.kills}K</p>
                    <p className="text-[10px] text-[#8a8a9e]">{r.assists}A / {r.deaths}D</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-[#1a1a24] rounded-xl border border-[#2a2a3a] p-4">
            <h3 className="text-sm font-bold text-[#f0f0f5] mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-400" /> Últimas Scrims</h3>
            {stats.recentGames.length === 0 ? (<p className="text-sm text-[#5a5a6e] text-center py-4">Nenhum dado disponível</p>) : (
              <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-[#5a5a6e] border-b border-[#2a2a3a]"><th className="text-left py-2">Data</th><th className="text-center py-2">K</th><th className="text-center py-2">D</th><th className="text-center py-2">A</th><th className="text-center py-2">DMG</th><th className="text-center py-2">MVP</th></tr></thead><tbody>
                {stats.recentGames.map((game, i) => (<tr key={i} className="border-b border-[#2a2a3a]/50 last:border-0"><td className="py-2 text-[#8a8a9e]">{game.date}</td><td className="py-2 text-center text-red-400 font-medium">{game.kills}</td><td className="py-2 text-center text-[#8a8a9e]">{game.deaths}</td><td className="py-2 text-center text-[#8a8a9e]">{game.assists}</td><td className="py-2 text-center text-[#8a8a9e]">{game.damage.toLocaleString()}</td><td className="py-2 text-center">{game.mvp && <Award className="w-4 h-4 text-yellow-400 mx-auto" />}</td></tr>))}
              </tbody></table></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sublabel }: { icon: React.ReactNode; label: string; value: number | string; sublabel: string }) {
  return (<div className="bg-[#1a1a24] rounded-xl border border-[#2a2a3a] p-3"><div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs text-[#5a5a6e]">{label}</span></div><p className="text-xl font-bold text-[#f0f0f5]">{value}</p><p className="text-[10px] text-[#5a5a6e] mt-1">{sublabel}</p></div>);
}