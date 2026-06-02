import { useState } from "react";
import { Plus, Pencil, Trash2, Search, X, Check } from "lucide-react";
import { trpc } from "@/providers/trpc";
import AdminLayout from "@/layout/AdminLayout";
import { toast } from "sonner";

export default function AdminJogadores() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState({ nickname: "", uid: "", discord: "", teamId: "", kills: 0, deaths: 0, wins: 0, matches: 0 });

  const utils = trpc.useUtils();
  const { data: playersList } = trpc.players.list.useQuery(search ? { search } : undefined);
  const { data: teamsList } = trpc.teams.list.useQuery();

  const create = trpc.players.create.useMutation({
    onSuccess: () => { utils.players.list.invalidate(); setShowForm(false); resetForm(); toast.success("Jogador criado!"); },
    onError: (e) => toast.error(e.message),
  });
  const update = trpc.players.update.useMutation({
    onSuccess: () => { utils.players.list.invalidate(); setShowForm(false); setEditing(null); resetForm(); toast.success("Jogador atualizado!"); },
    onError: (e) => toast.error(e.message),
  });
  const remove = trpc.players.delete.useMutation({
    onSuccess: () => { utils.players.list.invalidate(); toast.success("Jogador removido!"); },
    onError: (e) => toast.error(e.message),
  });

  const resetForm = () => setForm({ nickname: "", uid: "", discord: "", teamId: "", kills: 0, deaths: 0, wins: 0, matches: 0 });

  const handleEdit = (p: NonNullable<typeof playersList>[0]) => {
    setEditing(p.id);
    setForm({ nickname: p.nickname, uid: p.uid ?? "", discord: p.discord ?? "", teamId: p.teamId?.toString() ?? "", kills: p.kills, deaths: p.deaths, wins: p.wins, matches: p.matches });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nickname) { toast.error("Nickname e obrigatorio"); return; }
    const data = { ...form, teamId: form.teamId ? parseInt(form.teamId) : undefined };
    if (editing) {
      update.mutate({ id: editing, ...data });
    } else {
      create.mutate(data);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#f0f0f5] mb-1">Jogadores</h1>
            <p className="text-[#8a8a9e] text-sm">Gerencie os jogadores do sistema</p>
          </div>
          <button onClick={() => { setShowForm(true); setEditing(null); resetForm(); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all">
            <Plus className="w-4 h-4" /> Novo Jogador
          </button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5a6e]" />
          <input type="text" placeholder="Buscar jogador..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#12121a] border border-[#2a2a3a] text-[#f0f0f5] text-sm placeholder-[#5a5a6e] focus:outline-none focus:border-red-500/50" />
        </div>

        {showForm && (
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#f0f0f5]">{editing ? "Editar" : "Novo"} Jogador</h3>
              <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-[#1a1a24] text-[#5a5a6e]"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#8a8a9e] mb-1">Nickname *</label>
                <input value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} required
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50" />
              </div>
              <div>
                <label className="block text-sm text-[#8a8a9e] mb-1">Equipe</label>
                <select value={form.teamId} onChange={(e) => setForm({ ...form, teamId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50">
                  <option value="">Sem equipe</option>
                  {teamsList?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#8a8a9e] mb-1">UID</label>
                <input value={form.uid} onChange={(e) => setForm({ ...form, uid: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50" />
              </div>
              <div>
                <label className="block text-sm text-[#8a8a9e] mb-1">Discord</label>
                <input value={form.discord} onChange={(e) => setForm({ ...form, discord: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50" />
              </div>
              <div>
                <label className="block text-sm text-[#8a8a9e] mb-1">Kills</label>
                <input type="number" value={form.kills} onChange={(e) => setForm({ ...form, kills: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50" />
              </div>
              <div>
                <label className="block text-sm text-[#8a8a9e] mb-1">Deaths</label>
                <input type="number" value={form.deaths} onChange={(e) => setForm({ ...form, deaths: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50" />
              </div>
              <div>
                <label className="block text-sm text-[#8a8a9e] mb-1">Wins</label>
                <input type="number" value={form.wins} onChange={(e) => setForm({ ...form, wins: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50" />
              </div>
              <div>
                <label className="block text-sm text-[#8a8a9e] mb-1">Partidas</label>
                <input type="number" value={form.matches} onChange={(e) => setForm({ ...form, matches: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50" />
              </div>
              <div className="flex items-end">
                <button type="submit" disabled={create.isPending || update.isPending}
                  className="px-6 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all disabled:opacity-50">
                  {create.isPending || update.isPending ? "Salvando..." : <span className="flex items-center gap-1"><Check className="w-4 h-4" /> Salvar</span>}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a2a3a]">
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Nickname</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">UID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Equipe</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">K/D</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Kills</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a3a]">
                {playersList?.map((p) => {
                  const kd = p.deaths > 0 ? (p.kills / p.deaths).toFixed(2) : p.kills;
                  const team = teamsList?.find(t => t.id === p.teamId);
                  return (
                    <tr key={p.id} className="hover:bg-[#1a1a24]">
                      <td className="px-6 py-3 text-sm font-medium text-[#f0f0f5]">{p.nickname}</td>
                      <td className="px-6 py-3 text-sm text-[#8a8a9e] font-mono">{p.uid ?? "-"}</td>
                      <td className="px-6 py-3 text-sm text-[#8a8a9e]">{team?.name ?? "Sem equipe"}</td>
                      <td className="px-6 py-3 text-sm text-center text-red-400 font-medium">{kd}</td>
                      <td className="px-6 py-3 text-sm text-center text-[#8a8a9e]">{p.kills}</td>
                      <td className="px-6 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(p)} className="p-1.5 rounded hover:bg-blue-500/10 text-blue-400 transition-colors"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => { if (confirm("Remover jogador?")) remove.mutate({ id: p.id }); }} className="p-1.5 rounded hover:bg-red-500/10 text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
