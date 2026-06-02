import { RefreshCw, Trophy, UserCircle } from "lucide-react";
import { trpc } from "@/providers/trpc";
import AdminLayout from "@/layout/AdminLayout";
import { toast } from "sonner";

export default function AdminRankings() {
  const utils = trpc.useUtils();
  const { data: teamRankings } = trpc.rankings.teams.useQuery();
  const { data: playerRankings } = trpc.rankings.players.useQuery();

  const recalculate = trpc.rankings.recalculate.useMutation({
    onSuccess: () => {
      utils.rankings.teams.invalidate();
      utils.rankings.players.invalidate();
      toast.success("Rankings recalculados!");
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#f0f0f5] mb-1">Rankings</h1>
            <p className="text-[#8a8a9e] text-sm">Visualize e gerencie os rankings</p>
          </div>
          <button
            onClick={() => recalculate.mutate()}
            disabled={recalculate.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${recalculate.isPending ? "animate-spin" : ""}`} />
            {recalculate.isPending ? "Recalculando..." : "Recalcular Rankings"}
          </button>
        </div>

        {/* Team Rankings */}
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center gap-2">
            <Trophy className="w-5 h-5 text-red-400" />
            <h2 className="font-bold text-[#f0f0f5]">Ranking de Equipes</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a2a3a]">
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Pos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Equipe</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Pontos</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Kills</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Wins</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Particip.</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">K/D</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a3a]">
                {teamRankings?.map((r, i) => (
                  <tr key={r.id} className="hover:bg-[#1a1a24]">
                    <td className="px-6 py-3 text-sm font-bold text-[#5a5a6e]">{i + 1}</td>
                    <td className="px-6 py-3 text-sm font-medium text-[#f0f0f5]">{r.entityName}</td>
                    <td className="px-6 py-3 text-sm text-center text-red-400 font-bold">{r.points}</td>
                    <td className="px-6 py-3 text-sm text-center text-[#8a8a9e]">{r.kills}</td>
                    <td className="px-6 py-3 text-sm text-center text-[#8a8a9e]">{r.wins}</td>
                    <td className="px-6 py-3 text-sm text-center text-[#8a8a9e]">{r.participations}</td>
                    <td className="px-6 py-3 text-sm text-center text-[#8a8a9e]">{r.kdRatio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Player Rankings */}
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center gap-2">
            <UserCircle className="w-5 h-5 text-red-400" />
            <h2 className="font-bold text-[#f0f0f5]">Ranking de Jogadores</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a2a3a]">
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Pos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Jogador</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Pontos</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Kills</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Wins</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Particip.</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">K/D</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a3a]">
                {playerRankings?.map((r, i) => (
                  <tr key={r.id} className="hover:bg-[#1a1a24]">
                    <td className="px-6 py-3 text-sm font-bold text-[#5a5a6e]">{i + 1}</td>
                    <td className="px-6 py-3 text-sm font-medium text-[#f0f0f5]">{r.entityName}</td>
                    <td className="px-6 py-3 text-sm text-center text-red-400 font-bold">{r.points}</td>
                    <td className="px-6 py-3 text-sm text-center text-[#8a8a9e]">{r.kills}</td>
                    <td className="px-6 py-3 text-sm text-center text-[#8a8a9e]">{r.wins}</td>
                    <td className="px-6 py-3 text-sm text-center text-[#8a8a9e]">{r.participations}</td>
                    <td className="px-6 py-3 text-sm text-center text-[#8a8a9e]">{r.kdRatio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
