import { useMemo } from "react";
import {
  X,
  Target,
  Tag,
  History,
  Calendar,
  TrendingUp,
  BarChart3,
  Award,
} from "lucide-react";
import { Sparkline } from "../ui/Sparkline";
import { BadgeIcon } from "../ui/BadgeIcon";

interface PlayerHistoryItem {
  date: string;
  q1Kills: number;
  q2Kills: number;
  q3Kills: number;
  totalKills: number;
}

interface PlayerDetail {
  playerName: string;
  teamName: string | null;
  totalKills: number;
  participations: number;
  avgKills: number;
  bestPerformance: number;
  badges: string[];
  previousNicks: string[];
  avgPerQuarter: { q1: number; q2: number; q3: number };
  sparkline: number[];
  history: PlayerHistoryItem[];
}

interface PlayerDetailModalProps {
  player: PlayerDetail;
  onClose: () => void;
}

export function PlayerDetailModal({ player, onClose }: PlayerDetailModalProps) {
  const historyByDate = useMemo(() => {
    const map = new Map<string, PlayerHistoryItem[]>();
    player.history.forEach((h) => {
      if (!map.has(h.date)) map.set(h.date, []);
      map.get(h.date)!.push(h);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [player.history]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#12121a] rounded-2xl border border-[#2a2a3a] w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-[#12121a]/95 backdrop-blur border-b border-[#2a2a3a] px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#f0f0f5]">{player.playerName}</h2>
              <p className="text-sm text-[#5a5a6e]">{player.teamName ?? "Sem time"}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[#2a2a3a] transition-colors"
          >
            <X className="w-5 h-5 text-[#5a5a6e]" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Nicks antigos */}
          {player.previousNicks.length > 0 && (
            <div className="bg-[#1a1a24] rounded-xl border border-[#2a2a3a] p-4">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4 text-[#5a5a6e]" />
                <h3 className="text-sm font-medium text-[#8a8a9e]">Nicks anteriores</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {player.previousNicks.map((nick) => (
                  <span
                    key={nick}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0a0a0f] border border-[#2a2a3a] text-xs text-[#8a8a9e]"
                  >
                    <History className="w-3 h-3 text-[#5a5a6e]" />
                    {nick}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[#1a1a24] rounded-xl p-3 border border-[#2a2a3a]">
              <p className="text-xs text-[#5a5a6e] uppercase mb-1">Total Kills</p>
              <p className="text-xl font-bold text-green-400">{player.totalKills}</p>
            </div>
            <div className="bg-[#1a1a24] rounded-xl p-3 border border-[#2a2a3a]">
              <p className="text-xs text-[#5a5a6e] uppercase mb-1">XTs</p>
              <p className="text-xl font-bold text-[#f0f0f5]">{player.participations}</p>
            </div>
            <div className="bg-[#1a1a24] rounded-xl p-3 border border-[#2a2a3a]">
              <p className="text-xs text-[#5a5a6e] uppercase mb-1">Média</p>
              <p className="text-xl font-bold text-[#f0f0f5]">{player.avgKills}</p>
            </div>
            <div className="bg-[#1a1a24] rounded-xl p-3 border border-[#2a2a3a]">
              <p className="text-xs text-[#5a5a6e] uppercase mb-1">Recorde</p>
              <p className="text-xl font-bold text-yellow-400">{player.bestPerformance}</p>
            </div>
          </div>

          {/* Badges */}
          {player.badges.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-[#8a8a9e] mb-3 flex items-center gap-2">
                <Award className="w-4 h-4" /> Conquistas
              </h3>
              <div className="flex flex-wrap gap-2">
                {player.badges.map((badge) => (
                  <span
                    key={badge}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1a1a24] border border-[#2a2a3a] text-xs font-medium text-[#f0f0f5]"
                  >
                    <BadgeIcon badge={badge} />
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Avg per Quarter */}
          <div>
            <h3 className="text-sm font-medium text-[#8a8a9e] mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> Média por Quarto
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#1a1a24] rounded-xl p-3 border border-[#2a2a3a] text-center">
                <p className="text-xs text-[#5a5a6e] mb-1">Q1</p>
                <p className="text-lg font-bold text-red-400">{player.avgPerQuarter.q1}</p>
              </div>
              <div className="bg-[#1a1a24] rounded-xl p-3 border border-[#2a2a3a] text-center">
                <p className="text-xs text-[#5a5a6e] mb-1">Q2</p>
                <p className="text-lg font-bold text-orange-400">{player.avgPerQuarter.q2}</p>
              </div>
              <div className="bg-[#1a1a24] rounded-xl p-3 border border-[#2a2a3a] text-center">
                <p className="text-xs text-[#5a5a6e] mb-1">Q3</p>
                <p className="text-lg font-bold text-purple-400">{player.avgPerQuarter.q3}</p>
              </div>
            </div>
          </div>

          {/* Sparkline grande */}
          <div>
            <h3 className="text-sm font-medium text-[#8a8a9e] mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Evolução
            </h3>
            <div className="bg-[#1a1a24] rounded-xl border border-[#2a2a3a] p-4">
              <Sparkline data={player.sparkline} width={600} height={80} color="#4ade80" />
              <div className="flex justify-between mt-2 text-xs text-[#5a5a6e]">
                <span>Início</span>
                <span>Atual</span>
              </div>
            </div>
          </div>

          {/* Histórico */}
          <div>
            <h3 className="text-sm font-medium text-[#8a8a9e] mb-3 flex items-center gap-2">
              <History className="w-4 h-4" /> Histórico de Participações
            </h3>
            <div className="space-y-2">
              {historyByDate.map(([date, stats]) => {
                const total = stats.reduce((s, x) => s + x.totalKills, 0);
                return (
                  <div
                    key={date}
                    className="flex items-center justify-between bg-[#1a1a24] rounded-lg border border-[#2a2a3a] px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-[#5a5a6e]" />
                      <span className="text-sm text-[#f0f0f5]">{date}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-[#5a5a6e]">
                        Q1: <span className="text-red-400">{stats[0]?.q1Kills ?? 0}</span>
                        {" / "}
                        Q2: <span className="text-orange-400">{stats[0]?.q2Kills ?? 0}</span>
                        {" / "}
                        Q3: <span className="text-purple-400">{stats[0]?.q3Kills ?? 0}</span>
                      </span>
                      <span className="text-sm font-bold text-green-400">{total} kills</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlayerDetailModal;