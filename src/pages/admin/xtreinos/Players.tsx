import { useState } from "react";
import { Plus, X, Check, Target } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";

export default function XTreinosPlayers() {
  const [selectedXt, setSelectedXt] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    xtreinoId: 0,
    date: "",
    teamName: "",
    playerName: "",
    q1Kills: 0,
    q2Kills: 0,
    q3Kills: 0,
    totalKills: 0,
  });

  const utils = trpc.useUtils();
  const { data: xtreinosList } = trpc.xtreinos.list.useQuery();
  const { data: xtDetail } = trpc.xtreinos.getById.useQuery(
    { id: selectedXt! },
    { enabled: !!selectedXt }
  );
  const { data: allPlayerStats } = trpc.xtreinos.listPlayerStats.useQuery();

  const addPlayerStats = trpc.xtreinos.addPlayerStats.useMutation({
    onSuccess: () => {
      utils.xtreinos.listPlayerStats.invalidate();
      if (selectedXt) utils.xtreinos.getById.invalidate({ id: selectedXt });
      setShowForm(false);
      resetForm();
      toast.success("Stats de jogador adicionadas!");
    },
    onError: (e) => toast.error(e.message),
  });

  const resetForm = () =>
    setForm({
      xtreinoId: 0,
      date: "",
      teamName: "",
      playerName: "",
      q1Kills: 0,
      q2Kills: 0,
      q3Kills: 0,
      totalKills: 0,
    });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.playerName || !form.teamName || !form.date) {
      toast.error("Jogador, time e data são obrigatórios");
      return;
    }
    addPlayerStats.mutate(form);
  };

  const playerStats = selectedXt ? xtDetail?.playerStats : allPlayerStats;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div className="flex gap-2">
          <select
            value={selectedXt ?? ""}
            onChange={(e) => setSelectedXt(e.target.value ? parseInt(e.target.value) : null)}
            className="px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50"
          >
            <option value="">Todos os xtreinos</option>
            {xtreinosList?.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name} ({x.date})
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setShowForm(true);
              resetForm();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-all"
          >
            <Plus className="w-4 h-4" /> Add Jogador
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#f0f0f5]">Adicionar Stats de Jogador</h3>
            <button
              onClick={() => setShowForm(false)}
              className="p-1 rounded hover:bg-[#1a1a24] text-[#5a5a6e]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-[#8a8a9e] mb-1">XTreino ID</label>
              <input
                type="number"
                value={form.xtreinoId}
                onChange={(e) => setForm({ ...form, xtreinoId: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-[#8a8a9e] mb-1">Data *</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-[#8a8a9e] mb-1">Time *</label>
              <input
                value={form.teamName}
                onChange={(e) => setForm({ ...form, teamName: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-[#8a8a9e] mb-1">Jogador *</label>
              <input
                value={form.playerName}
                onChange={(e) => setForm({ ...form, playerName: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-[#8a8a9e] mb-1">Q1 Kills</label>
              <input
                type="number"
                value={form.q1Kills}
                onChange={(e) => setForm({ ...form, q1Kills: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-[#8a8a9e] mb-1">Q2 Kills</label>
              <input
                type="number"
                value={form.q2Kills}
                onChange={(e) => setForm({ ...form, q2Kills: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-[#8a8a9e] mb-1">Q3 Kills</label>
              <input
                type="number"
                value={form.q3Kills}
                onChange={(e) => setForm({ ...form, q3Kills: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-[#8a8a9e] mb-1">Total Kills</label>
              <input
                type="number"
                value={form.totalKills}
                onChange={(e) => setForm({ ...form, totalKills: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm"
              />
            </div>
            <div className="sm:col-span-3 flex items-end">
              <button
                type="submit"
                disabled={addPlayerStats.isPending}
                className="px-6 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-all disabled:opacity-50"
              >
                {addPlayerStats.isPending ? (
                  "Salvando..."
                ) : (
                  <span className="flex items-center gap-1">
                    <Check className="w-4 h-4" /> Adicionar
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center justify-between">
          <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
            <Target className="w-5 h-5 text-green-400" />
            Estatísticas de Jogadores {selectedXt ? `— ${xtDetail?.name}` : "— Todos"}
          </h3>
          <span className="text-xs text-[#5a5a6e]">
            {playerStats?.length ?? 0} registros
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a2a3a] bg-[#0a0a0f]">
                <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Jogador</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Time</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Q1</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Q2</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Q3</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a3a]">
              {playerStats?.map((p) => (
                <tr key={p.id} className="hover:bg-[#1a1a24]">
                  <td className="px-6 py-3 text-sm text-[#8a8a9e]">{p.date}</td>
                  <td className="px-6 py-3 text-sm font-medium text-[#f0f0f5]">{p.playerName}</td>
                  <td className="px-6 py-3 text-sm text-[#8a8a9e]">{p.teamName}</td>
                  <td className="px-6 py-3 text-center text-sm text-[#8a8a9e]">{p.q1Kills}</td>
                  <td className="px-6 py-3 text-center text-sm text-[#8a8a9e]">{p.q2Kills}</td>
                  <td className="px-6 py-3 text-center text-sm text-[#8a8a9e]">{p.q3Kills}</td>
                  <td className="px-6 py-3 text-center text-sm font-bold text-green-400">
                    {p.totalKills}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!playerStats?.length && (
          <div className="px-6 py-8 text-center text-[#5a5a6e] text-sm">
            Nenhuma estatística registrada
          </div>
        )}
      </div>
    </div>
  );
}