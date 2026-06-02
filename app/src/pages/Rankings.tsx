import { useState } from "react";
import { BarChart3, Trophy, UserCircle, Users, TrendingUp, Target, Award } from "lucide-react";
import { trpc } from "@/providers/trpc";
import MainLayout from "@/layout/MainLayout";

export default function Rankings() {
  const [tab, setTab] = useState<"teams" | "players">("teams");
  const { data: teamRankings } = trpc.rankings.teams.useQuery();
  const { data: playerRankings } = trpc.rankings.players.useQuery();

  const data = tab === "teams" ? teamRankings : playerRankings;

  const rankColors = [
    "border-l-yellow-400",
    "border-l-gray-300",
    "border-l-amber-600",
  ];

  const rankIcons = [
    <Trophy key="1" className="w-5 h-5 text-yellow-400" />,
    <Award key="2" className="w-5 h-5 text-gray-300" />,
    <Award key="3" className="w-5 h-5 text-amber-600" />,
  ];

  return (
    <MainLayout>
      <div className="bg-[#12121a] border-b border-[#2a2a3a]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-8 h-8 text-red-400" />
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#f0f0f5]">Rankings</h1>
          </div>
          <p className="text-[#8a8a9e]">Acompanhe o desempenho de equipes e jogadores</p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setTab("teams")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all ${
              tab === "teams"
                ? "bg-red-500 text-white"
                : "bg-[#1a1a24] text-[#8a8a9e] hover:text-[#f0f0f5] border border-[#2a2a3a]"
            }`}
          >
            <Users className="w-4 h-4" />
            Equipes
          </button>
          <button
            onClick={() => setTab("players")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all ${
              tab === "players"
                ? "bg-red-500 text-white"
                : "bg-[#1a1a24] text-[#8a8a9e] hover:text-[#f0f0f5] border border-[#2a2a3a]"
            }`}
          >
            <UserCircle className="w-4 h-4" />
            Jogadores
          </button>
        </div>

        {/* Rankings Table */}
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a2a3a]">
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#5a5a6e] uppercase w-16">Rank</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#5a5a6e] uppercase">
                    {tab === "teams" ? "Equipe" : "Jogador"}
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-[#5a5a6e] uppercase">
                    <span className="flex items-center justify-center gap-1"><TrendingUp className="w-3 h-3" /> Pontos</span>
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-[#5a5a6e] uppercase">
                    <span className="flex items-center justify-center gap-1"><Target className="w-3 h-3" /> Kills</span>
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-[#5a5a6e] uppercase">
                    <span className="flex items-center justify-center gap-1"><Trophy className="w-3 h-3" /> Wins</span>
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-[#5a5a6e] uppercase">Particip.</th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-[#5a5a6e] uppercase">K/D</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a3a]">
                {data?.map((r, i) => (
                  <tr
                    key={r.id}
                    className={`hover:bg-[#1a1a24] transition-colors ${i < 3 ? `border-l-4 ${rankColors[i]}` : ""}`}
                  >
                    <td className="px-6 py-4">
                      {i < 3 ? (
                        <div className="flex justify-center">{rankIcons[i]}</div>
                      ) : (
                        <span className="text-sm font-bold text-[#5a5a6e] text-center block">{i + 1}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-[#f0f0f5]">{r.entityName}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-bold text-red-400">{r.points}</span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-[#8a8a9e]">{r.kills}</td>
                    <td className="px-6 py-4 text-center text-sm text-[#8a8a9e]">{r.wins}</td>
                    <td className="px-6 py-4 text-center text-sm text-[#8a8a9e]">{r.participations}</td>
                    <td className="px-6 py-4 text-center text-sm text-[#8a8a9e]">{r.kdRatio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(!data || data.length === 0) && (
            <div className="text-center py-16 text-[#5a5a6e]">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>Nenhum dado de ranking disponivel</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
