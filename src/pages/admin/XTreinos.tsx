import { useState } from "react";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { trpc } from "@/providers/trpc";
import AdminLayout from "@/layout/AdminLayout";
import { toast } from "sonner";

export default function AdminXTreinos() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", date: "", timeMx: "", timeBr: "", modality: "squad", maxTeams: 12, rules: "", discordLink: "", whatsappLink: "", status: "aberto" });

  const utils = trpc.useUtils();
  const { data: xtreinosList } = trpc.xtreinos.list.useQuery();

  const create = trpc.xtreinos.create.useMutation({
    onSuccess: () => { utils.xtreinos.list.invalidate(); setShowForm(false); resetForm(); toast.success("XTreino criado!"); },
    onError: (e) => toast.error(e.message),
  });
  const update = trpc.xtreinos.update.useMutation({
    onSuccess: () => { utils.xtreinos.list.invalidate(); setShowForm(false); setEditing(null); resetForm(); toast.success("XTreino atualizado!"); },
    onError: (e) => toast.error(e.message),
  });
  const remove = trpc.xtreinos.delete.useMutation({
    onSuccess: () => { utils.xtreinos.list.invalidate(); toast.success("XTreino removido!"); },
    onError: (e) => toast.error(e.message),
  });

  const resetForm = () => setForm({ name: "", date: "", timeMx: "", timeBr: "", modality: "squad", maxTeams: 12, rules: "", discordLink: "", whatsappLink: "", status: "aberto" });

  const handleEdit = (x: NonNullable<typeof xtreinosList>[0]) => {
    setEditing(x.id);
    setForm({ name: x.name, date: x.date, timeMx: x.timeMx ?? "", timeBr: x.timeBr ?? "", modality: x.modality, maxTeams: x.maxTeams, rules: x.rules ?? "", discordLink: x.discordLink ?? "", whatsappLink: x.whatsappLink ?? "", status: x.status });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.date) { toast.error("Nome e data sao obrigatorios"); return; }
    if (editing) update.mutate({ id: editing, ...form });
    else create.mutate(form);
  };

  const statusColors: Record<string, string> = { aberto: "bg-blue-500/10 text-blue-400", encerrado: "bg-red-500/10 text-red-400", cancelado: "bg-gray-500/10 text-gray-400" };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#f0f0f5] mb-1">XTreinos</h1>
            <p className="text-[#8a8a9e] text-sm">Gerencie os xtreinos</p>
          </div>
          <button onClick={() => { setShowForm(true); setEditing(null); resetForm(); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all">
            <Plus className="w-4 h-4" /> Novo XTreino
          </button>
        </div>

        {showForm && (
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#f0f0f5]">{editing ? "Editar" : "Novo"} XTreino</h3>
              <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-[#1a1a24] text-[#5a5a6e]"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#8a8a9e] mb-1">Nome *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50" />
              </div>
              <div>
                <label className="block text-sm text-[#8a8a9e] mb-1">Data *</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50" />
              </div>
              <div>
                <label className="block text-sm text-[#8a8a9e] mb-1">Horario MX</label>
                <input value={form.timeMx} onChange={(e) => setForm({ ...form, timeMx: e.target.value })} placeholder="5:00 PM"
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50" />
              </div>
              <div>
                <label className="block text-sm text-[#8a8a9e] mb-1">Horario BR</label>
                <input value={form.timeBr} onChange={(e) => setForm({ ...form, timeBr: e.target.value })} placeholder="8:00 PM"
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
                <label className="block text-sm text-[#8a8a9e] mb-1">Max Equipes</label>
                <input type="number" value={form.maxTeams} onChange={(e) => setForm({ ...form, maxTeams: parseInt(e.target.value) || 12 })}
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50" />
              </div>
              <div>
                <label className="block text-sm text-[#8a8a9e] mb-1">Discord</label>
                <input value={form.discordLink} onChange={(e) => setForm({ ...form, discordLink: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50" />
              </div>
              <div>
                <label className="block text-sm text-[#8a8a9e] mb-1">WhatsApp</label>
                <input value={form.whatsappLink} onChange={(e) => setForm({ ...form, whatsappLink: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm text-[#8a8a9e] mb-1">Regras</label>
                <textarea value={form.rules} onChange={(e) => setForm({ ...form, rules: e.target.value })} rows={3}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Horarios</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Modo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a3a]">
                {xtreinosList?.map((x) => (
                  <tr key={x.id} className="hover:bg-[#1a1a24]">
                    <td className="px-6 py-3 text-sm font-medium text-[#f0f0f5]">{x.name}</td>
                    <td className="px-6 py-3 text-sm text-[#8a8a9e]">{x.date}</td>
                    <td className="px-6 py-3 text-sm text-[#8a8a9e]">MX {x.timeMx} / BR {x.timeBr}</td>
                    <td className="px-6 py-3 text-sm text-[#8a8a9e]">{x.modality?.toUpperCase()}</td>
                    <td className="px-6 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[x.status]}`}>{x.status}</span></td>
                    <td className="px-6 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(x)} className="p-1.5 rounded hover:bg-blue-500/10 text-blue-400"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => { if (confirm("Remover?")) remove.mutate({ id: x.id }); }} className="p-1.5 rounded hover:bg-red-500/10 text-red-400"><Trash2 className="w-4 h-4" /></button>
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
