"use client";

import { X, Trophy, Target, TrendingUp, BarChart3, Users, Flame, Award, Zap } from "lucide-react";
import { useMemo } from "react";
import { trpc } from "@/providers/trpc";

interface TeamStatsModalProps {
  teamName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function TeamStatsModal({ teamName, isOpen, onClose }: TeamStatsModalProps) {
  const { data: teamResults } = trpc.scrims.teamStatsByName.useQuery({ teamName }, { enabled: isOpen && !!teamName });
  const { data: allPlayerStats } = trpc.scrims.playerStats.useQuery({});

  if (!isOpen) return null;

  const stats = useMemo(() => {
    if (!teamResults || teamResults.length === 0) return { totalScrims: 0, totalKills: 0, totalPoints: 0, totalRoundWins: 0, wins: 0, top3Count: 0, bestPosition: 0, worstPosition: 0, avgPosition: 0, streak: 0, recentResults: [], topPlayers: [] };

    const positions: number[] = [];
    let totalPoints = 0;
    let totalRoundWins = 0;

    for (const r of teamResults) {
      // LEITURA DINÂMICA DAS RODADAS
      const rounds = (r as any).rounds || [];
      for (const round of rounds) {
        if (round.value > 0) {
          positions.push(round.value);
          totalPoints += getPointsByPosition(round.value); // Se for BR, soma pontos
        }
        totalRoundWins += round.value; // Se for MME, soma rounds ganhos
      }
    }

    const wins = positions.filter(p => p === 1).length;
    const bestPosition = positions.length > 0 ? Math.min(...positions) : 0;
    const worstPosition = positions.length > 0 ? Math.max(...positions) : 0;
    const avgPosition = positions.length > 0 ? positions.reduce((a, b) => a + b, 0) / positions.length : 0;
    const top3Count = positions.filter(p => p <= 3).length;

    const teamPlayers = (allPlayerStats || []).filter((p: any) => p.teamName === teamName);
    const playerMap = new Map<string, { name: string; kills: number; mvps: number }>();
    let totalKills = 0;

    for (const p of teamPlayers) {
      totalKills += p.totalKills || 0;
      const existing = playerMap.get(p.playerName);
      if (existing) { existing.kills += p.totalKills || 0; existing.mvps += p.totalMvp || 0; }
      else { playerMap.set(p.playerName, { name: p.playerName, kills: p.totalKills || 0, mvps: p.totalMvp || 0 }); }
    }

    const topPlayers = Array.from(playerMap.values()).sort((a, b) => b.kills - a.kills).slice(0, 5);

    const recentResults = teamResults.slice(0, 5).map((r) => {
      const rounds = (r as any).rounds || [];
      return { date: r.date || "—", rounds, totalValue: rounds.reduce((sum: number, rd: any) => sum + rd.value, 0) };
    });

    let streak = 0;
    for (let i = teamResults.length - 1; i >= 0; i--) {
      const rounds = (teamResults[i] as any).rounds || [];
      if (rounds.some((rd: any) => rd.value === 1)) streak++; else break;
    }

    return { totalScrims: teamResults.length, totalKills, totalPoints, totalRoundWins, wins, top3Count, bestPosition, worstPosition, avgPosition, streak, recentResults, topPlayers };
  }, [teamResults, allPlayerStats, teamName]);

  const hasBRData = stats.bestPosition > 0;
  const hasMMEData = stats.totalRoundWins > 0;
  const winRate = stats.totalScrims > 0 ? Math.round((stats.wins / (stats.totalScrims * 3)) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a3a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center"><Users className="w-5 h-5 text-emerald-400" /></div>
            <div><h2 className="text-xl font-bold text-[#f0f0f5]">{teamName}</h2><p className="text-xs text-[#5a5a6e]">Estatísticas detalhadas</p></div>
          </div>
          <button onClick={onClose} className="text-[#5a5a6e] hover:text-[#f0f0f5]"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex gap-2">
            {hasBRData && (<span className="px-2 py-1 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">Battle Royale</span>)}
            {hasMMEData && (<span className="px-2 py-1 rounded-lg text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">Mata-Mata em Equipe</span>)}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={<Trophy className="w-4 h-4 text-yellow-400" />} label="Vitórias" value={stats.wins} sublabel={`${winRate}% win rate`} />
            <StatCard icon={<Target className="w-4 h-4 text-red-400" />} label="Kills Totais" value={stats.totalKills} sublabel={stats.totalScrims > 0 ? `${Math.round(stats.totalKills / stats.totalScrims)} média/scrim` : "0"} />
            {hasMMEData && <StatCard icon={<BarChart3 className="w-4 h-4 text-emerald-400" />} label="Rounds Gan" value={stats.totalRoundWins} sublabel="Total acumulado" />}
            {hasBRData && <StatCard icon={<Zap className="w-4 h-4 text-blue-400" />} label="Top 3" value={stats.top3Count} sublabel="Quedas no pódio" />}
            <StatCard icon={<Flame className="w-4 h-4 text-orange-400" />} label="Streak" value={stats.streak} sublabel="Quedas vencidas seguidas" />
          </div>

          {hasBRData && (
            <div className="bg-[#1a1a24] rounded-xl border border-[#2a2a3a] p-4">
              <h3 className="text-sm font-bold text-[#f0f0f5] mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-blue-400" /> Performance BR</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center"><p className="text-2xl font-bold text-yellow-400">{stats.bestPosition > 0 ? `${stats.bestPosition}º` : "—"}</p><p className="text-xs text-[#5a5a6e] mt-1">Melhor Posição</p></div>
                <div className="text-center"><p className="text-2xl font-bold text-emerald-400">{stats.avgPosition > 0 ? stats.avgPosition.toFixed(1) : "—"}</p><p className="text-xs text-[#5a5a6e] mt-1">Média</p></div>
                <div className="text-center"><p className="text-2xl font-bold text-red-400">{stats.worstPosition > 0 ? `${stats.worstPosition}º` : "—"}</p><p className="text-xs text-[#5a5a6e] mt-1">Pior Posição</p></div>
              </div>
            </div>
          )}

          <div className="bg-[#1a1a24] rounded-xl border border-[#2a2a3a] p-4">
            <h3 className="text-sm font-bold text-[#f0f0f5] mb-4 flex items-center gap-2"><Award className="w-4 h-4 text-yellow-400" /> Top Jogadores</h3>
            {stats.topPlayers.length === 0 ? (<p className="text-sm text-[#5a5a6e] text-center py-4">Nenhum dado disponível</p>) : (
              <div className="space-y-2">{stats.topPlayers.map((player, i) => (
                <div key={player.name} className="flex items-center justify-between py-2 border-b border-[#2a2a3a]/50 last:border-0">
                  <div className="flex items-center gap-3"><span className={`text-sm font-bold w-6 ${i < 3 ? "text-yellow-400" : "text-[#5a5a6e]"}`}>#{i + 1}</span><span className="text-sm text-[#f0f0f5]">{player.name}</span></div>
                  <div className="flex items-center gap-4"><span className="text-xs text-[#8a8a9e]">{player.kills} kills</span>{player.mvps > 0 && <span className="text-xs text-yellow-400 font-medium">{player.mvps} MVP</span>}</div>
                </div>
              ))}</div>
            )}
          </div>

          <div className="bg-[#1a1a24] rounded-xl border border-[#2a2a3a] p-4">
            <h3 className="text-sm font-bold text-[#f0f0f5] mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-blue-400" /> Histórico Recente (Valores por Queda)</h3>
            {stats.recentResults.length === 0 ? (<p className="text-sm text-[#5a5a6e] text-center py-4">Nenhum dado disponível</p>) : (
              <div className="space-y-2">{stats.recentResults.map((result, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-[#2a2a3a]/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-[#f0f0f5]">{result.date}</span>
                  </div>
                  {/* Renderização dinâmica das quedas */}
                  <span className="text-sm text-emerald-400 font-mono">{result.rounds.map((r: any) => r.value).join(" / ")}</span>
                </div>
              ))}</div>
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

function getPointsByPosition(pos: number): number {
  if (!pos) return 0;
  const points: Record<number, number> = { 1: 15, 2: 12, 3: 10, 4: 9, 5: 8, 6: 7, 7: 6, 8: 5, 9: 4, 10: 3, 11: 2, 12: 1, 13: 1, 14: 0, 15: 0 };
  return points[pos] ?? 0;
}