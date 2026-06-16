"use client";

import { X, Trophy, Target, TrendingUp, BarChart3, Users, Flame, Award } from "lucide-react";
import { useMemo } from "react";

interface TeamStatsModalProps {
  teamName: string;
  isOpen: boolean;
  onClose: () => void;
}

// Dados mockados para demonstração - na prática viriam de uma query
const MOCK_TEAM_STATS = {
  totalScrims: 12,
  totalKills: 342,
  totalPoints: 156,
  wins: 8,
  top3Count: 10,
  bestPosition: 1,
  worstPosition: 5,
  avgPosition: 2.3,
  streak: 5,
  recentResults: [
    { date: "2026-06-13", position: 1, kills: 29, map: "Vale Deserto" },
    { date: "2026-06-13", position: 1, kills: 29, map: "Ilha do Medo" },
    { date: "2026-06-13", position: 1, kills: 28, map: "Ilha do Medo" },
    { date: "2026-06-10", position: 2, kills: 24, map: "Bermuda" },
    { date: "2026-06-09", position: 3, kills: 31, map: "Kalahari" },
  ],
  topPlayers: [
    { name: "UGD_ Ares", kills: 124, mvps: 4 },
    { name: "UGD_ Ohara", kills: 98, mvps: 2 },
    { name: "Dexz7RYL", kills: 76, mvps: 1 },
    { name: "UGD_ A R", kills: 44, mvps: 0 },
  ],
};

export function TeamStatsModal({ teamName, isOpen, onClose }: TeamStatsModalProps) {
  if (!isOpen) return null;

  const stats = MOCK_TEAM_STATS;
  const winRate = useMemo(() => 
    stats.totalScrims > 0 ? Math.round((stats.wins / stats.totalScrims) * 100) : 0,
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
              sublabel={`${Math.round(stats.totalKills / stats.totalScrims)} média`}
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
              sublabel="Scrims seguidos"
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
                <p className="text-2xl font-bold text-yellow-400">{stats.bestPosition}º</p>
                <p className="text-xs text-[#5a5a6e] mt-1">Melhor Posição</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-400">{stats.avgPosition.toFixed(1)}</p>
                <p className="text-xs text-[#5a5a6e] mt-1">Média</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-400">{stats.worstPosition}º</p>
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
          </div>

          {/* Histórico recente */}
          <div className="bg-[#1a1a24] rounded-xl border border-[#2a2a3a] p-4">
            <h3 className="text-sm font-bold text-[#f0f0f5] mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              Histórico Recente
            </h3>
            <div className="space-y-2">
              {stats.recentResults.map((result, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-[#2a2a3a]/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold w-8 ${
                      result.position === 1 ? "text-yellow-400" :
                      result.position === 2 ? "text-gray-300" :
                      result.position === 3 ? "text-amber-500" : "text-[#5a5a6e]"
                    }`}>
                      {result.position}º
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
          </div>
        </div>
      </div>
    </div>
  );
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