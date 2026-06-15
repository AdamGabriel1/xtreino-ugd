import { useState, useMemo } from "react";
import {
  Target,
  Filter,
  Search,
  Calendar,
  TrendingUp,
  BarChart3,
  Swords,
  Users,
  ChevronDown,
  ChevronUp,
  Trophy,
  Medal,
  Award,
  X,
  Zap,
  Flame,
  Star,
  ArrowUp,
  ArrowDown,
  Minus,
  History,
  BarChart2,
  XCircle,
  CheckSquare,
  Square,
  Crown,
  TrendingDown,
  Shield,
  Sparkles,
  Crosshair,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import {
  calcPlayerAccumulatedStats,
  type XtreinoPlayerStat,
} from "../../hooks/useXtreinoCalculations.js";

// ============================================================
// TIPOS LOCAIS
// ============================================================

interface XTreinoOption {
  id: number;
  name: string;
  date: string;
}

interface PlayerRankingRawStat {
  id: number;
  xtreinoId: number;
  date: string;
  teamName: string;
  playerName: string;
  q1Kills: number;
  q2Kills: number;
  q3Kills: number;
  totalKills: number;
}

interface PlayerRankingDisplay {
  playerName: string;
  teamName: string | null;
  totalKills: number;
  totalQ1Kills: number;
  totalQ2Kills: number;
  totalQ3Kills: number;
  participations: number;
  avgKills: number;
  xtreinoDates: string[];
}

type PlayerRankingStat = PlayerRankingRawStat | PlayerRankingDisplay;

type RankingSortField =
  | "totalKills"
  | "q1Kills"
  | "q2Kills"
  | "q3Kills"
  | "participations"
  | "avgKills"
  | "date"
  | "streak"
  | "bestPerformance"
  | "teamContribution";

interface RankingSummary {
  totalPlayers: number;
  totalKills: number;
  totalQ1: number;
  totalQ2: number;
  totalQ3: number;
  totalRecords: number;
}

interface EnrichedPlayer extends PlayerRankingDisplay {
  sparkline: number[];
  streak: number;
  badges: string[];
  avgPerQuarter: { q1: number; q2: number; q3: number };
  bestPerformance: number;
  teamContribution: number;
  trend: "up" | "down" | "same";
  isNewbie: boolean;
  currentRank: number;
}

// ============================================================
// FUNÇÕES DE CÁLCULO PURAS
// ============================================================

function calcPlayerRankingAccumulated(
  rawStats: PlayerRankingRawStat[]
): PlayerRankingDisplay[] {
  const accumulated = calcPlayerAccumulatedStats(rawStats as XtreinoPlayerStat[]);

  return accumulated.map((p) => ({
    playerName: p.playerName,
    teamName: p.teamName,
    totalKills: p.totalKills,
    totalQ1Kills: p.totalQ1Kills,
    totalQ2Kills: p.totalQ2Kills,
    totalQ3Kills: p.totalQ3Kills,
    participations: p.participations,
    avgKills: p.avgKills,
    xtreinoDates: p.xtreinoDates,
  }));
}

function filterStatsByXtreino(
  rawStats: PlayerRankingRawStat[],
  xtreinoId: number | null
): PlayerRankingRawStat[] {
  if (!xtreinoId) return rawStats;
  return rawStats.filter((s) => s.xtreinoId === xtreinoId);
}

function filterStatsByTeam<T extends { teamName?: string | null }>(
  stats: T[],
  team: string | null
): T[] {
  if (!team) return stats;
  return stats.filter((s) => (s.teamName ?? "").toLowerCase() === team.toLowerCase());
}

function searchPlayerStats<T extends { playerName: string; teamName?: string | null }>(
  stats: T[],
  query: string
): T[] {
  if (!query.trim()) return stats;
  const q = query.toLowerCase();
  return stats.filter(
    (p) =>
      p.playerName.toLowerCase().includes(q) ||
      (p.teamName?.toLowerCase() ?? "").includes(q)
  );
}

function sortRankingStats(
  stats: PlayerRankingStat[],
  field: RankingSortField,
  direction: "asc" | "desc"
): PlayerRankingStat[] {
  return [...stats].sort((a, b) => {
    if (field === "date") {
      const aDate = "date" in a ? (a.date ?? "") : "";
      const bDate = "date" in b ? (b.date ?? "") : "";
      return direction === "desc" ? bDate.localeCompare(aDate) : aDate.localeCompare(bDate);
    }

    const aVal = (field in a ? (a as unknown as Record<string, number>)[field] : 0) ?? 0;
    const bVal = (field in b ? (b as unknown as Record<string, number>)[field] : 0) ?? 0;
    return direction === "desc" ? bVal - aVal : aVal - bVal;
  });
}

function calcRankingSummary(
  stats: PlayerRankingStat[]
): RankingSummary | null {
  if (!stats.length) return null;

  const first = stats[0];
  const isAccumulated = "participations" in first;

  return {
    totalPlayers: new Set(stats.map((p) => p.playerName)).size,
    totalKills: stats.reduce((sum, p) => sum + (p.totalKills || 0), 0),
    totalQ1: stats.reduce((sum, p) => {
      const val = "totalQ1Kills" in p ? p.totalQ1Kills : "q1Kills" in p ? p.q1Kills : 0;
      return sum + (val || 0);
    }, 0),
    totalQ2: stats.reduce((sum, p) => {
      const val = "totalQ2Kills" in p ? p.totalQ2Kills : "q2Kills" in p ? p.q2Kills : 0;
      return sum + (val || 0);
    }, 0),
    totalQ3: stats.reduce((sum, p) => {
      const val = "totalQ3Kills" in p ? p.totalQ3Kills : "q3Kills" in p ? p.q3Kills : 0;
      return sum + (val || 0);
    }, 0),
    totalRecords: isAccumulated
      ? (stats as PlayerRankingDisplay[]).reduce((sum, p) => sum + p.participations, 0)
      : stats.length,
  };
}

// --- NOVAS FUNÇÕES DE CÁLCULO ---

function calcPlayerSparkline(
  rawStats: PlayerRankingRawStat[],
  playerName: string
): number[] {
  const playerStats = rawStats
    .filter((s) => s.playerName === playerName)
    .sort((a, b) => a.date.localeCompare(b.date));
  const dateMap = new Map<string, number>();
  playerStats.forEach((s) => {
    dateMap.set(s.date, (dateMap.get(s.date) || 0) + s.totalKills);
  });
  const dates = Array.from(dateMap.keys()).sort();
  return dates.map((d) => dateMap.get(d) || 0);
}

function calcPlayerStreak(
  rawStats: PlayerRankingRawStat[],
  playerName: string
): number {
  const allDates = [...new Set(rawStats.map((s) => s.date))].sort();
  const playerDates = new Set(
    rawStats.filter((s) => s.playerName === playerName).map((s) => s.date)
  );
  let streak = 0;
  for (let i = allDates.length - 1; i >= 0; i--) {
    if (playerDates.has(allDates[i])) streak++;
    else break;
  }
  return streak;
}

function calcPlayerBadges(acc: PlayerRankingDisplay): string[] {
  const badges: string[] = [];
  if (acc.totalKills >= 100) badges.push("100 Kills");
  if (acc.totalKills >= 300) badges.push("300 Kills");
  if (acc.totalKills >= 500) badges.push("500 Kills");
  if (acc.participations >= 5) badges.push("5 XTs");
  if (acc.participations >= 10) badges.push("10 XTs");
  if (acc.participations >= 20) badges.push("20 XTs");
  if (acc.totalQ1Kills >= 50) badges.push("Q1 Master");
  if (acc.totalQ2Kills >= 50) badges.push("Q2 Master");
  if (acc.totalQ3Kills >= 50) badges.push("Q3 Master");
  if (acc.avgKills >= 8) badges.push("Sniper");
  if (acc.avgKills >= 12) badges.push("Elite");
  return badges;
}

function calcAvgPerQuarter(acc: PlayerRankingDisplay) {
  return {
    q1: acc.participations > 0 ? Math.round((acc.totalQ1Kills / acc.participations) * 10) / 10 : 0,
    q2: acc.participations > 0 ? Math.round((acc.totalQ2Kills / acc.participations) * 10) / 10 : 0,
    q3: acc.participations > 0 ? Math.round((acc.totalQ3Kills / acc.participations) * 10) / 10 : 0,
  };
}

function calcBestPerformance(
  rawStats: PlayerRankingRawStat[],
  playerName: string
): number {
  const stats = rawStats.filter((s) => s.playerName === playerName);
  if (!stats.length) return 0;
  return Math.max(...stats.map((s) => s.totalKills));
}

function calcTeamContribution(
  rawStats: PlayerRankingRawStat[],
  playerName: string,
  teamName: string | null
): number {
  if (!teamName) return 0;
  const playerStats = rawStats.filter((s) => s.playerName === playerName);
  const playerDates = new Set(playerStats.map((s) => s.date));
  const teamStats = rawStats.filter(
    (s) => s.teamName === teamName && playerDates.has(s.date)
  );
  const playerKills = playerStats.reduce((sum, s) => sum + s.totalKills, 0);
  const teamKills = teamStats.reduce((sum, s) => sum + s.totalKills, 0);
  return teamKills > 0 ? Math.round((playerKills / teamKills) * 1000) / 10 : 0;
}

function calcTrend(
  rawStats: PlayerRankingRawStat[],
  playerName: string,
  currentRank: number
): "up" | "down" | "same" {
  const allDates = [...new Set(rawStats.map((s) => s.date))].sort();
  if (allDates.length < 2) return "same";
  const lastDate = allDates[allDates.length - 1];
  const prevDate = allDates[allDates.length - 2];

  const lastStats = rawStats.filter((s) => s.date === lastDate);
  const prevStats = rawStats.filter((s) => s.date === prevDate);

  const lastRank = [...lastStats]
    .sort((a, b) => b.totalKills - a.totalKills)
    .findIndex((s) => s.playerName === playerName);
  const prevRank = [...prevStats]
    .sort((a, b) => b.totalKills - a.totalKills)
    .findIndex((s) => s.playerName === playerName);

  if (lastRank === -1 || prevRank === -1) return "same";
  if (lastRank < prevRank) return "up";
  if (lastRank > prevRank) return "down";
  return "same";
}

function extractTeams(stats: PlayerRankingRawStat[]): string[] {
  return [...new Set(stats.map((s) => s.teamName).filter(Boolean))].sort();
}

// ============================================================
// SUB-COMPONENTES
// ============================================================

function Sparkline({ data, width = 70, height = 24, color = "#4ade80" }: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}) {
  if (data.length < 2) return <span className="text-xs text-[#5a5a6e]">—</span>;
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${height} ${points} ${width},${height}`}
        fill="url(#sparklineGrad)"
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.map((v, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((v - min) / range) * height;
        return <circle key={i} cx={x} cy={y} r="2" fill={color} />;
      })}
    </svg>
  );
}

function BadgeIcon({ badge }: { badge: string }) {
  if (badge.includes("Kills")) return <Zap className="w-3 h-3 text-yellow-400" />;
  if (badge.includes("XTs")) return <Calendar className="w-3 h-3 text-blue-400" />;
  if (badge.includes("Q1")) return <Crosshair className="w-3 h-3 text-red-400" />;
  if (badge.includes("Q2")) return <Crosshair className="w-3 h-3 text-orange-400" />;
  if (badge.includes("Q3")) return <Crosshair className="w-3 h-3 text-purple-400" />;
  if (badge === "Sniper") return <Target className="w-3 h-3 text-green-400" />;
  if (badge === "Elite") return <Crown className="w-3 h-3 text-amber-400" />;
  return <Star className="w-3 h-3 text-gray-400" />;
}

function TrendIcon({ trend }: { trend: "up" | "down" | "same" }) {
  if (trend === "up") return <ArrowUp className="w-3.5 h-3.5 text-green-400" />;
  if (trend === "down") return <ArrowDown className="w-3.5 h-3.5 text-red-400" />;
  return <Minus className="w-3.5 h-3.5 text-[#5a5a6e]" />;
}

function PlayerDetailModal({
  player,
  rawStats,
  onClose,
}: {
  player: EnrichedPlayer;
  rawStats: PlayerRankingRawStat[];
  onClose: () => void;
}) {
  const history = useMemo(() => {
    return rawStats
      .filter((s) => s.playerName === player.playerName)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [rawStats, player.playerName]);

  const historyByDate = useMemo(() => {
    const map = new Map<string, PlayerRankingRawStat[]>();
    history.forEach((h) => {
      if (!map.has(h.date)) map.set(h.date, []);
      map.get(h.date)!.push(h);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [history]);

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

function PodiumCard({
  player,
  rank,
  onClick,
}: {
  player: EnrichedPlayer;
  rank: number;
  onClick: () => void;
}) {
  const gradients = [
    "from-yellow-500/10 via-yellow-500/5 to-transparent border-yellow-500/20",
    "from-gray-300/10 via-gray-300/5 to-transparent border-gray-300/20",
    "from-amber-600/10 via-amber-600/5 to-transparent border-amber-600/20",
  ];
  const iconColors = ["text-yellow-400", "text-gray-300", "text-amber-600"];
  const icons = [
    <Trophy key={0} className={`w-8 h-8 ${iconColors[0]}`} />,
    <Medal key={1} className={`w-8 h-8 ${iconColors[1]}`} />,
    <Award key={2} className={`w-8 h-8 ${iconColors[2]}`} />,
  ];

  return (
    <button
      onClick={onClick}
      className={`relative bg-gradient-to-br ${gradients[rank]} rounded-2xl border p-5 text-left hover:scale-[1.02] transition-transform cursor-pointer`}
    >
      <div className="absolute top-3 right-3">{icons[rank]}</div>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-[#1a1a24] border border-[#2a2a3a] flex items-center justify-center text-xl font-bold text-[#f0f0f5]">
          {rank + 1}
        </div>
        <div>
          <h4 className="font-bold text-[#f0f0f5] text-lg">{player.playerName}</h4>
          <p className="text-sm text-[#5a5a6e]">{player.teamName ?? "Sem time"}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-green-400">{player.totalKills}</p>
          <p className="text-xs text-[#5a5a6e] uppercase">Kills</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-[#f0f0f5]">{player.participations}</p>
          <p className="text-xs text-[#5a5a6e] uppercase">XTs</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-[#f0f0f5]">{player.avgKills}</p>
          <p className="text-xs text-[#5a5a6e] uppercase">Média</p>
        </div>
      </div>
      {player.streak >= 3 && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-orange-400">
          <Flame className="w-3.5 h-3.5" />
          <span>Streak de {player.streak} XTs</span>
        </div>
      )}
    </button>
  );
}

function ComparisonBar({
  players,
  rawStats,
  onRemove,
  onClear,
}: {
  players: EnrichedPlayer[];
  rawStats: PlayerRankingRawStat[];
  onRemove: (name: string) => void;
  onClear: () => void;
}) {
  if (players.length < 2) return null;

  const maxKills = Math.max(...players.map((p) => p.totalKills), 1);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#12121a]/95 backdrop-blur border-t border-[#2a2a3a] p-4 shadow-2xl">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-[#f0f0f5] flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-green-400" />
            Comparação ({players.length} jogadores)
          </h4>
          <button
            onClick={onClear}
            className="text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            Limpar comparação
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {players.map((p) => (
            <div key={p.playerName} className="bg-[#1a1a24] rounded-xl border border-[#2a2a3a] p-3 relative">
              <button
                onClick={() => onRemove(p.playerName)}
                className="absolute top-2 right-2 p-1 hover:bg-[#2a2a3a] rounded transition-colors"
              >
                <XCircle className="w-3.5 h-3.5 text-[#5a5a6e]" />
              </button>
              <p className="text-xs text-[#5a5a6e] truncate pr-5">{p.playerName}</p>
              <div className="mt-2 space-y-1.5">
                <div>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="text-[#5a5a6e]">Kills</span>
                    <span className="text-green-400 font-bold">{p.totalKills}</span>
                  </div>
                  <div className="h-1.5 bg-[#2a2a3a] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-400 rounded-full transition-all"
                      style={{ width: `${(p.totalKills / maxKills) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#5a5a6e]">Média</span>
                  <span className="text-[#f0f0f5]">{p.avgKills}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#5a5a6e]">XTs</span>
                  <span className="text-[#f0f0f5]">{p.participations}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#5a5a6e]">Recorde</span>
                  <span className="text-yellow-400">{p.bestPerformance}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function JogadoresTab() {
  const [search, setSearch] = useState("");
  const [selectedXt, setSelectedXt] = useState<number | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [sortField, setSortField] = useState<RankingSortField>("totalKills");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<Set<string>>(new Set());
  const [modalPlayer, setModalPlayer] = useState<EnrichedPlayer | null>(null);

  // tRPC direto
  const { data: xtreinosList } = trpc.players.listXtreinos.useQuery();
  const { data: rawStatsData } = trpc.players.rankingStats.useQuery();

  const rawStats = (rawStatsData ?? []) as PlayerRankingRawStat[];
  const isAccumulated = !selectedXt;
  const isLoading = !xtreinosList || !rawStatsData;

  // Cálculos com useMemo
  const accumulatedStats = useMemo(
    () => calcPlayerRankingAccumulated(rawStats),
    [rawStats]
  );

  const singleXtreinoStats = useMemo(
    () => filterStatsByXtreino(rawStats, selectedXt),
    [rawStats, selectedXt]
  );

  const baseStats: PlayerRankingStat[] = isAccumulated
    ? accumulatedStats
    : singleXtreinoStats;

  const teamFilteredStats = useMemo(
    () => filterStatsByTeam(baseStats, selectedTeam),
    [baseStats, selectedTeam]
  );

  const searchedStats = useMemo(
    () => searchPlayerStats(teamFilteredStats, search),
    [teamFilteredStats, search]
  );

  const sortedStats = useMemo(
    () => sortRankingStats(searchedStats, sortField, sortDir),
    [searchedStats, sortField, sortDir]
  );

  // Enriquecer stats no modo acumulado
  const enrichedStats: EnrichedPlayer[] = useMemo(() => {
    if (!isAccumulated) return sortedStats as unknown as EnrichedPlayer[];

    return (sortedStats as PlayerRankingDisplay[]).map((p, idx) => {
      const sparkline = calcPlayerSparkline(rawStats, p.playerName);
      const streak = calcPlayerStreak(rawStats, p.playerName);
      const badges = calcPlayerBadges(p);
      const avgPerQuarter = calcAvgPerQuarter(p);
      const bestPerformance = calcBestPerformance(rawStats, p.playerName);
      const teamContribution = calcTeamContribution(rawStats, p.playerName, p.teamName);
      const trend = calcTrend(rawStats, p.playerName, idx);

      return {
        ...p,
        sparkline,
        streak,
        badges,
        avgPerQuarter,
        bestPerformance,
        teamContribution,
        trend,
        isNewbie: p.participations < 3,
        currentRank: idx,
      };
    });
  }, [sortedStats, isAccumulated, rawStats]);

  const displayStats = isAccumulated ? enrichedStats : (sortedStats as PlayerRankingStat[]);

  const summary = useMemo(
    () => calcRankingSummary(displayStats),
    [displayStats]
  );

  const allTeams = useMemo(() => extractTeams(rawStats), [rawStats]);

  const top3 = useMemo(() => {
    if (!isAccumulated || displayStats.length < 3) return [];
    return (displayStats as EnrichedPlayer[]).slice(0, 3);
  }, [displayStats, isAccumulated]);

  const comparisonPlayers = useMemo(() => {
    if (!isAccumulated) return [];
    return (displayStats as EnrichedPlayer[]).filter((p) =>
      selectedForCompare.has(p.playerName)
    );
  }, [displayStats, selectedForCompare, isAccumulated]);

  const handleSort = (field: RankingSortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const toggleCompare = (playerName: string) => {
    setSelectedForCompare((prev) => {
      const next = new Set(prev);
      if (next.has(playerName)) next.delete(playerName);
      else if (next.size < 4) next.add(playerName);
      return next;
    });
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedXt(null);
    setSelectedTeam(null);
    setSelectedForCompare(new Set());
    setCompareMode(false);
  };

  const hasFilters = search || selectedXt || selectedTeam || compareMode;

  const SortHeader = ({ field, label, className = "" }: { field: RankingSortField; label: string; className?: string }) => (
    <button
      onClick={() => handleSort(field)}
      className={`flex items-center gap-1 text-xs font-medium text-[#5a5a6e] uppercase hover:text-[#f0f0f5] transition-colors justify-center ${className}`}
    >
      {label}
      {sortField === field &&
        (sortDir === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />)}
    </button>
  );

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-5 h-5 text-yellow-400" />;
    if (index === 1) return <Medal className="w-5 h-5 text-gray-300" />;
    if (index === 2) return <Award className="w-5 h-5 text-amber-600" />;
    return (
      <span className="w-5 h-5 flex items-center justify-center text-xs font-bold text-[#5a5a6e]">
        {index + 1}
      </span>
    );
  };

  return (
    <div className={`space-y-6 ${comparisonPlayers.length >= 2 ? "pb-48" : ""}`}>
      {/* Filtros */}
      <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div className="flex items-center gap-2 text-[#8a8a9e]">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filtros:</span>
          </div>

          <div className="flex flex-wrap gap-3 flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5a6e]" />
              <input
                type="text"
                placeholder="Buscar jogador ou time..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm placeholder-[#5a5a6e] focus:outline-none focus:border-green-500/50 min-w-[220px]"
              />
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#5a5a6e]" />
              <select
                value={selectedXt ?? ""}
                onChange={(e) => setSelectedXt(e.target.value ? parseInt(e.target.value) : null)}
                className="px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50 min-w-[180px]"
              >
                <option value="">Todos os xtreinos (acumulado)</option>
                {xtreinosList?.map((x: XTreinoOption) => (
                  <option key={x.id} value={x.id}>
                    {x.name} ({x.date})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#5a5a6e]" />
              <select
                value={selectedTeam ?? ""}
                onChange={(e) => setSelectedTeam(e.target.value || null)}
                className="px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50 min-w-[160px]"
              >
                <option value="">Todos os times</option>
                {allTeams.map((team) => (
                  <option key={team} value={team}>
                    {team}
                  </option>
                ))}
              </select>
            </div>

            {isAccumulated && (
              <button
                onClick={() => {
                  setCompareMode((m) => !m);
                  setSelectedForCompare(new Set());
                }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  compareMode
                    ? "bg-green-500/10 border-green-500/30 text-green-400"
                    : "bg-[#1a1a24] border-[#2a2a3a] text-[#5a5a6e] hover:text-[#f0f0f5]"
                }`}
              >
                <BarChart2 className="w-4 h-4 inline mr-1.5" />
                Comparar
              </button>
            )}
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-green-400 hover:text-green-300 transition-colors"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#5a5a6e]">Carregando estatísticas...</p>
        </div>
      )}

      {/* Cards de Resumo */}
      {summary && !isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-green-400" />
              <span className="text-xs text-[#5a5a6e] uppercase">Jogadores</span>
            </div>
            <p className="text-2xl font-bold text-[#f0f0f5]">{summary.totalPlayers}</p>
          </div>
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Swords className="w-4 h-4 text-green-400" />
              <span className="text-xs text-[#5a5a6e] uppercase">Total Kills</span>
            </div>
            <p className="text-2xl font-bold text-green-400">{summary.totalKills}</p>
          </div>
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-green-400" />
              <span className="text-xs text-[#5a5a6e] uppercase">Q1 + Q2 + Q3</span>
            </div>
            <p className="text-2xl font-bold text-[#f0f0f5]">
              {summary.totalQ1}/{summary.totalQ2}/{summary.totalQ3}
            </p>
          </div>
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-xs text-[#5a5a6e] uppercase">
                {isAccumulated ? "Participações" : "Registros"}
              </span>
            </div>
            <p className="text-2xl font-bold text-[#f0f0f5]">{summary.totalRecords}</p>
          </div>
        </div>
      )}

      {/* Pódio - Top 3 (modo acumulado apenas) */}
      {isAccumulated && top3.length === 3 && !isLoading && (
        <div>
          <h3 className="text-sm font-medium text-[#8a8a9e] mb-3 flex items-center gap-2">
            <Crown className="w-4 h-4 text-yellow-400" /> Pódio
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {top3.map((p, i) => (
              <PodiumCard
                key={p.playerName}
                player={p}
                rank={i}
                onClick={() => setModalPlayer(p)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tabela Principal */}
      {!isLoading && (
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center justify-between">
            <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              {selectedXt ? "Estatísticas do XTreino" : "Ranking Geral de Jogadores"}
              {selectedXt && xtreinosList?.find((x: XTreinoOption) => x.id === selectedXt) && (
                <span className="text-sm font-normal text-[#5a5a6e]">
                  — {xtreinosList.find((x: XTreinoOption) => x.id === selectedXt)?.date}
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
                {displayStats.length} registros
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a2a3a] bg-[#0a0a0f]">
                  {isAccumulated && compareMode && (
                    <th className="px-3 py-3 text-center w-10">
                      <span className="text-xs font-medium text-[#5a5a6e]">#</span>
                    </th>
                  )}
                  <th className="px-4 py-3 text-center w-12">
                    <span className="text-xs font-medium text-[#5a5a6e] uppercase">#</span>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">
                    Jogador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">
                    Time
                  </th>
                  {isAccumulated && (
                    <>
                      <th className="px-4 py-3 text-center">
                        <SortHeader field="participations" label="XTs" />
                      </th>
                      <th className="px-4 py-3 text-center">
                        <SortHeader field="avgKills" label="Média" />
                      </th>
                      <th className="px-4 py-3 text-center">
                        <SortHeader field="streak" label="Streak" />
                      </th>
                      <th className="px-4 py-3 text-center">
                        <span className="text-xs font-medium text-[#5a5a6e] uppercase">Q1</span>
                      </th>
                      <th className="px-4 py-3 text-center">
                        <span className="text-xs font-medium text-[#5a5a6e] uppercase">Q2</span>
                      </th>
                      <th className="px-4 py-3 text-center">
                        <span className="text-xs font-medium text-[#5a5a6e] uppercase">Q3</span>
                      </th>
                      <th className="px-4 py-3 text-center">
                        <SortHeader field="bestPerformance" label="Recorde" />
                      </th>
                      <th className="px-4 py-3 text-center">
                        <SortHeader field="teamContribution" label="Time %" />
                      </th>
                      <th className="px-4 py-3 text-center">
                        <span className="text-xs font-medium text-[#5a5a6e] uppercase">Evol.</span>
                      </th>
                    </>
                  )}
                  {!isAccumulated && (
                    <>
                      <th className="px-6 py-3 text-center">
                        <SortHeader field="q1Kills" label="Q1" />
                      </th>
                      <th className="px-6 py-3 text-center">
                        <SortHeader field="q2Kills" label="Q2" />
                      </th>
                      <th className="px-6 py-3 text-center">
                        <SortHeader field="q3Kills" label="Q3" />
                      </th>
                    </>
                  )}
                  <th className="px-6 py-3 text-center bg-green-500/5">
                    <SortHeader field="totalKills" label="Total" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a3a]">
                {displayStats.map((p: PlayerRankingStat, index: number) => {
                  const isAcc = isAccumulated;
                  const acc = p as EnrichedPlayer;
                  const single = p as PlayerRankingRawStat;
                  const isTop3 = index < 3 && isAcc;

                  return (
                    <tr
                      key={`${p.playerName}-${index}`}
                      className={`hover:bg-[#1a1a24] transition-colors group ${
                        isTop3
                          ? index === 0
                            ? "bg-gradient-to-r from-yellow-500/5 to-transparent border-l-2 border-yellow-400"
                            : index === 1
                            ? "bg-gradient-to-r from-gray-400/5 to-transparent border-l-2 border-gray-300"
                            : "bg-gradient-to-r from-amber-700/5 to-transparent border-l-2 border-amber-600"
                          : ""
                      }`}
                    >
                      {isAccumulated && compareMode && (
                        <td className="px-3 py-3 text-center">
                          <button
                            onClick={() => toggleCompare(acc.playerName)}
                            className="text-[#5a5a6e] hover:text-green-400 transition-colors"
                          >
                            {selectedForCompare.has(acc.playerName) ? (
                              <CheckSquare className="w-4 h-4 text-green-400" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      )}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center">
                          {getRankIcon(index)}
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <button
                          onClick={() => isAcc && setModalPlayer(acc)}
                          className="flex items-center gap-3 text-left w-full group/player"
                        >
                          <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center group-hover/player:bg-green-500/20 transition-colors">
                            <Target className="w-4 h-4 text-green-400" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-[#f0f0f5] group-hover/player:text-green-400 transition-colors">
                                {p.playerName}
                              </span>
                              {isAcc && acc.isNewbie && (
                                <span className="px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] font-medium text-blue-400">
                                  NOVATO
                                </span>
                              )}
                            </div>
                            {isAcc && acc.badges.length > 0 && (
                              <div className="flex items-center gap-1 mt-1 flex-wrap">
                                {acc.badges.slice(0, 3).map((badge) => (
                                  <span
                                    key={badge}
                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#1a1a24] border border-[#2a2a3a] text-[10px] text-[#8a8a9e]"
                                  >
                                    <BadgeIcon badge={badge} />
                                    {badge}
                                  </span>
                                ))}
                                {acc.badges.length > 3 && (
                                  <span className="text-[10px] text-[#5a5a6e]">
                                    +{acc.badges.length - 3}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </button>
                      </td>
                      <td className="px-6 py-3 text-sm text-[#8a8a9e]">
                        {p.teamName ?? "—"}
                      </td>
                      {isAcc && (
                        <>
                          <td className="px-4 py-3 text-center text-sm text-[#8a8a9e]">
                            {acc.participations}
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-[#8a8a9e]">
                            {acc.avgKills}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {acc.streak >= 3 ? (
                              <span className="inline-flex items-center gap-1 text-sm text-orange-400">
                                <Flame className="w-3.5 h-3.5" />
                                {acc.streak}
                              </span>
                            ) : (
                              <span className="text-sm text-[#8a8a9e]">{acc.streak}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-red-400/80">
                            {acc.avgPerQuarter.q1}
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-orange-400/80">
                            {acc.avgPerQuarter.q2}
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-purple-400/80">
                            {acc.avgPerQuarter.q3}
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-yellow-400/80">
                            {acc.bestPerformance}
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-[#8a8a9e]">
                            {acc.teamContribution > 0 ? `${acc.teamContribution}%` : "—"}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <Sparkline data={acc.sparkline} />
                              <TrendIcon trend={acc.trend} />
                            </div>
                          </td>
                        </>
                      )}
                      {!isAcc && (
                        <>
                          <td className="px-6 py-3 text-center text-sm text-[#8a8a9e]">
                            {single.q1Kills}
                          </td>
                          <td className="px-6 py-3 text-center text-sm text-[#8a8a9e]">
                            {single.q2Kills}
                          </td>
                          <td className="px-6 py-3 text-center text-sm text-[#8a8a9e]">
                            {single.q3Kills}
                          </td>
                        </>
                      )}
                      <td className="px-6 py-3 text-center bg-green-500/5">
                        <span className="text-sm font-bold text-green-400">
                          {p.totalKills}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {displayStats.length === 0 && (
            <div className="px-6 py-16 text-center">
              <Target className="w-12 h-12 mx-auto mb-4 text-[#2a2a3a]" />
              <p className="text-[#5a5a6e] text-lg font-medium">
                Nenhuma estatística encontrada
              </p>
              <p className="text-[#3a3a4e] text-sm mt-1">
                {search || selectedXt || selectedTeam
                  ? "Tente ajustar os filtros"
                  : "Nenhum dado disponível"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal de Detalhes */}
      {modalPlayer && (
        <PlayerDetailModal
          player={modalPlayer}
          rawStats={rawStats}
          onClose={() => setModalPlayer(null)}
        />
      )}

      {/* Barra de Comparação */}
      <ComparisonBar
        players={comparisonPlayers}
        rawStats={rawStats}
        onRemove={(name) => toggleCompare(name)}
        onClear={() => setSelectedForCompare(new Set())}
      />
    </div>
  );
}