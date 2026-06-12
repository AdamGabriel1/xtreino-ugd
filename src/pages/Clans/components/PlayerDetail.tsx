import { ArrowLeft, Target, Swords, Award, Calendar, BarChart3 } from "lucide-react";
import type { XtreinoStats } from "../types/clans";

interface PlayerDetailProps {
  nickname: string;
  player: {
    id: number;
    nickname: string;
    kills: number;
    deaths: number;
    totalXtreinoKills?: number;
    xtreinoParticipations?: number;
  } | null;
  clanName: string;
  teamName: string;
  xtreinoHistory: XtreinoStats[];
  selectedMonth: string;
  onBack: () => void;
}

export default function PlayerDetail({
  nickname,
  player,
  clanName,
  teamName,
  xtreinoHistory,
  selectedMonth,
  onBack,
}: PlayerDetailProps) {
  if (!player) return null;

  const kd = player.deaths > 0 
    ? (player.kills / player.deaths).toFixed(2) 
    : player.kills;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <div className="bg-[#12121a] border-b border-[#2a2a3a]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#5a5a6e] hover:text-[#f0f0f5] transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Voltar</span>
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-900/30 to-emerald-600/10 flex items-center justify-center shrink-0 border border-[#2a2a3a]">
              <Target className="w-8 h-8 text-emerald-400/50" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#f0f0f5]">{player.nickname}</h1>
              <p className="text-sm text-[#8a8a9e] mt-1">
                {clanName} / {teamName}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-[#5a5a6e] uppercase">K/D Geral</span>
            </div>
            <p className="text-xl font-bold text-[#f0f0f5]">{kd}</p>
          </div>
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Swords className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-[#5a5a6e] uppercase">Kills Geral</span>
            </div>
            <p className="text-xl font-bold text-[#f0f0f5]">{player.kills}</p>
          </div>
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-[#5a5a6e] uppercase">XT Kills</span>
            </div>
            <p className="text-xl font-bold text-emerald-400">
              {player.totalXtreinoKills ?? 0}
            </p>
          </div>
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-[#5a5a6e] uppercase">XT Partic.</span>
            </div>
            <p className="text-xl font-bold text-[#f0f0f5]">
              {player.xtreinoParticipations ?? 0}
            </p>
          </div>
        </div>

        {/* Histórico de XTreinos */}
        {xtreinoHistory.length > 0 && (
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#2a2a3a]">
              <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
                Histórico de XTreinos
                {selectedMonth && (
                  <span className="text-sm font-normal text-[#5a5a6e]">
                    — {selectedMonth.split("-")[1]}/{selectedMonth.split("-")[0]}
                  </span>
                )}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2a2a3a] bg-[#0a0a0f]">
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Data</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Time</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Q1</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Q2</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Q3</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Total</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2a3a]">
                  {xtreinoHistory.map((stat) => (
                    <tr key={`${stat.date}-${stat.xtreinoId}`} className="hover:bg-[#1a1a24]">
                      <td className="px-4 py-3 text-sm text-[#f0f0f5]">{stat.date}</td>
                      <td className="px-4 py-3 text-sm text-[#8a8a9e]">{stat.teamName}</td>
                      <td className="px-4 py-3 text-sm text-center text-[#8a8a9e]">{stat.q1Kills}</td>
                      <td className="px-4 py-3 text-sm text-center text-[#8a8a9e]">{stat.q2Kills}</td>
                      <td className="px-4 py-3 text-sm text-center text-[#8a8a9e]">{stat.q3Kills}</td>
                      <td className="px-4 py-3 text-sm text-center text-emerald-400 font-bold">{stat.totalKills}</td>
                      <td className="px-4 py-3 text-sm text-center text-emerald-400">{stat.killPoints}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}