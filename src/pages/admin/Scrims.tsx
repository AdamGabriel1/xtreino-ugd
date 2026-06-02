import { useState } from "react";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { trpc } from "@/providers/trpc";
import AdminLayout from "@/layout/AdminLayout";
import { toast } from "sonner";

export default function AdminScrims() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", team1Id: "", team2Id: "", date: "", time: "", modality: "squad", status: "agendado", result: "" });

  const utils = trpc.useUtils();
  const { data: scrimsList } = trpc.scrims.list.useQuery();
  const { data: teamsList } = trpc.teams.list.useQuery();

  const create = trpc.scrims.create.useMutation({
    onSuccess: () => { utils.scrims.list.invalidate(); setShowForm(false); resetForm(); toast.success("Scrim criado!"); },
    onError: (e) => toast.error(e.message),
  });
  const update = trpc.scrims.update.useMutation({
    onSuccess: () => { utils.scrims.list.invalidate(); setShowForm(false); setEditing(null); resetForm(); toast.success("Scrim atualizado!"); },
    onError: (e) => toast.error(e.message),
  });
  const remove = trpc.scrims.delete.useMutation({
    onSuccess: () => { utils.scrims.list.invalidate(); toast.success("Scrim removido!"); },
    onError: (e) => toast.error(e.message),
  });

  const resetForm = () => setForm({ name: "", team1Id: "", team2Id: "", date: "", time: "", modality: "squad", status: "agendado", result: "" });

  const handleEdit = (s: NonNullable<typeof scrimsList>[0]) => {
    setEditing(s.id);
    setForm({ name: s.name, team1Id: s.team1Id?.toString() ?? "", team2Id: s.team2Id?.toString() ?? "", date: s.date ?? "", time: s.time ?? "", modality: s.modality ?? "squad", status: s.status, result: s.result ?? "" });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) { toast.error("Nome e obrigatorio"); return; }
    const data = { ...form, team1Id: form.team1Id ? parseInt(form.team1Id) : undefined, team2Id: form.team2Id ? parseInt(form.team2Id) : undefined };
    if (editing) update.mutate({ id: editing, ...data });
    else create.mutate(data);
  };

  const statusColors: Record<string, string> = { agendado: "bg-blue-500/10 text-blue-400", em_andamento: "bg-yellow-500/10 text-yellow-400", concluido: "bg-green-500/10 text-green-400" };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#f0f0f5] mb-1">Scrims</h1>
            <p className="text-[#8a8a9e] text-sm">Gerencie os scrims</p>
          </div>
          <button onClick={() => { setShowForm(true); setEditing(null); resetForm(); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all">
            <Plus className="w-4 h-4" /> Novo Scrim
          </button>
        </div>

        {showForm && (
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#f0f0f5]">{editing ? "Editar" : "Novo"} Scrim</h3>
              <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-[#1a1a24] text-[#5a5a6e]"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#8a8a9e] mb-1">Nome *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50" />
              </div>
              <div>
                <label className="block text-sm text-[#8a8a9e] mb-1">Equipe 1</label>
                <select value={form.team1Id} onChange={(e) => setForm({ ...form, team1Id: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50">
                  <option value="">Selecione</option>
                  {teamsList?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#8a8a9e] mb-1">Equipe 2</label>
                <select value={form.team2Id} onChange={(e) => setForm({ ...form, team2Id: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50">
                  <option value="">Selecione</option>
                  {teamsList?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#8a8a9e] mb-1">Data</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50" />
              </div>
              <div>
                <label className="block text-sm text-[#8a8a9e] mb-1">Horario</label>
                <input value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50" />
              </div>
              <div>
                <label className="block text-sm text-[#8a8a9e] mb-1">Modalidade</label>
                <select value={form.modality} onChange={(e) => setForm({ ...form, modality: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50">
                  <option value="solo">Solo</option><option value="duo">Duo</option><option value="squad">Squad</option><option value="4v4">4v4</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#8a8a9e] mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50">
                  <option value="agendado">Agendado</option><option value="em_andamento">Em Andamento</option><option value="concluido">Concluido</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#8a8a9e] mb-1">Resultado</label>
                <input value={form.result} onChange={(e) => setForm({ ...form, result: e.target.value })}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Equipes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a3a]">
                {scrimsList?.map((s) => (
                  <tr key={s.id} className="hover:bg-[#1a1a24]">
                    <td className="px-6 py-3 text-sm font-medium text-[#f0f0f5]">{s.name}</td>
                    <td className="px-6 py-3 text-sm text-[#8a8a9e]">{s.team1Name ?? "?"} vs {s.team2Name ?? "?"}</td>
                    <td className="px-6 py-3 text-sm text-[#8a8a9e]">{s.date} {s.time}</td>
                    <td className="px-6 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[s.status]}`}>{s.status}</span></td>
                    <td className="px-6 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(s)} className="p-1.5 rounded hover:bg-blue-500/10 text-blue-400"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => { if (confirm("Remover?")) remove.mutate({ id: s.id }); }} className="p-1.5 rounded hover:bg-red-500/10 text-red-400"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
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
