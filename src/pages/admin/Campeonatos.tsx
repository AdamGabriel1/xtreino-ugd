import { useState } from "react";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { trpc } from "@/providers/trpc";
import AdminLayout from "@/layout/AdminLayout";
import { toast } from "sonner";

export default function AdminCampeonatos() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", modality: "squad", format: "mata_mata", status: "em_breve", startDate: "", endDate: "", rules: "", prizePool: "", maxTeams: 16 });

  const utils = trpc.useUtils();
  const { data: champs } = trpc.championships.list.useQuery();

  const create = trpc.championships.create.useMutation({
    onSuccess: () => { utils.championships.list.invalidate(); setShowForm(false); resetForm(); toast.success("Campeonato criado!"); },
    onError: (e) => toast.error(e.message),
  });
  const update = trpc.championships.update.useMutation({
    onSuccess: () => { utils.championships.list.invalidate(); setShowForm(false); setEditing(null); resetForm(); toast.success("Campeonato atualizado!"); },
    onError: (e) => toast.error(e.message),
  });
  const remove = trpc.championships.delete.useMutation({
    onSuccess: () => { utils.championships.list.invalidate(); toast.success("Campeonato removido!"); },
    onError: (e) => toast.error(e.message),
  });

  const resetForm = () => setForm({ name: "", modality: "squad", format: "mata_mata", status: "em_breve", startDate: "", endDate: "", rules: "", prizePool: "", maxTeams: 16 });

  const handleEdit = (c: NonNullable<typeof champs>[0]) => {
    setEditing(c.id);
    setForm({ name: c.name, modality: c.modality, format: c.format, status: c.status, startDate: c.startDate ?? "", endDate: c.endDate ?? "", rules: c.rules ?? "", prizePool: c.prizePool ?? "", maxTeams: c.maxTeams });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) { toast.error("Nome e obrigatorio"); return; }
    if (editing) update.mutate({ id: editing, ...form });
    else create.mutate(form);
  };

  const statusColors: Record<string, string> = { ativo: "bg-green-500/10 text-green-400", em_breve: "bg-blue-500/10 text-blue-400", encerrado: "bg-green-500/10 text-green-400" };
  const statusLabels: Record<string, string> = { ativo: "Ativo", em_breve: "Em Breve", encerrado: "Encerrado" };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#f0f0f5] mb-1">Campeonatos</h1>
            <p className="text-[#8a8a9e] text-sm">Gerencie os campeonatos</p>
          </div>
          <button onClick={() => { setShowForm(true); setEditing(null); resetForm(); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-all">
            <Plus className="w-4 h-4" /> Novo Campeonato
          </button>
        </div>

        {showForm && (
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#f0f0f5]">{editing ? "Editar" : "Novo"} Campeonato</h3>
              <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-[#1a1a24] text-[#5a5a6e]"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#8a8a9e] mb-1">Nome *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50" />
              </div>
              <div>
                <label className="block text-sm text-[#8a8a9e] mb-1">Modalidade</label>
                <select value={form.modality} onChange={(e) => setForm({ ...form, modality: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50">
                  <option value="solo">Solo</option><option value="duo">Duo</option><option value="squad">Squad</option><option value="4v4">4v4</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#8a8a9e] mb-1">Formato</label>
                <select value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50">
                  <option value="grupos">Fase de Grupos</option><option value="mata_mata">Mata-Mata</option><option value="eliminacao_simples">Eliminacao Simples</option><option value="eliminacao_dupla">Eliminacao Dupla</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#8a8a9e] mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50">
                  <option value="em_breve">Em Breve</option><option value="ativo">Ativo</option><option value="encerrado">Encerrado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#8a8a9e] mb-1">Data Inicio</label>
                <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50" />
              </div>
              <div>
                <label className="block text-sm text-[#8a8a9e] mb-1">Data Fim</label>
                <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50" />
              </div>
              <div>
                <label className="block text-sm text-[#8a8a9e] mb-1">Premiacao</label>
                <input value={form.prizePool} onChange={(e) => setForm({ ...form, prizePool: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50" />
              </div>
              <div>
                <label className="block text-sm text-[#8a8a9e] mb-1">Max Equipes</label>
                <input type="number" value={form.maxTeams} onChange={(e) => setForm({ ...form, maxTeams: parseInt(e.target.value) || 16 })}
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm text-[#8a8a9e] mb-1">Regras</label>
                <textarea value={form.rules} onChange={(e) => setForm({ ...form, rules: e.target.value })} rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50" />
              </div>
              <div className="flex items-end">
                <button type="submit" disabled={create.isPending || update.isPending}
                  className="px-6 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-all disabled:opacity-50">
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Modo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Formato</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Equipes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a3a]">
                {champs?.map((c) => (
                  <tr key={c.id} className="hover:bg-[#1a1a24]">
                    <td className="px-6 py-3 text-sm font-medium text-[#f0f0f5]">{c.name}</td>
                    <td className="px-6 py-3 text-sm text-[#8a8a9e]">{c.modality?.toUpperCase()}</td>
                    <td className="px-6 py-3 text-sm text-[#8a8a9e]">{c.format}</td>
                    <td className="px-6 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[c.status]}`}>{statusLabels[c.status]}</span></td>
                    <td className="px-6 py-3 text-sm text-[#8a8a9e]">{c.registeredTeams}/{c.maxTeams}</td>
                    <td className="px-6 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(c)} className="p-1.5 rounded hover:bg-blue-500/10 text-blue-400"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => { if (confirm("Remover?")) remove.mutate({ id: c.id }); }} className="p-1.5 rounded hover:bg-green-500/10 text-green-400"><Trash2 className="w-4 h-4" /></button>
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