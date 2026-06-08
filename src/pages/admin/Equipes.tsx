import { useState } from "react";
import { Plus, Pencil, Trash2, Search, X, Check, Shield, Upload, Loader2 } from "lucide-react";
import { trpc } from "@/providers/trpc";
import AdminLayout from "@/layout/AdminLayout";
import { toast } from "sonner";
import { useImageUpload } from "@/hooks/useImageUpload";

export default function AdminEquipes() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState({ 
    name: "", 
    tag: "", 
    captainName: "", 
    captainDiscord: "", 
    whatsapp: "", 
    logo: "" 
  });

  const { preview, isUploading, error: uploadError, handleFileSelect, clearImage, setPreview } = useImageUpload();

  const utils = trpc.useUtils();
  const { data: teamsList } = trpc.teams.list.useQuery(search ? { search } : undefined);

  const create = trpc.teams.create.useMutation({
    onSuccess: () => { 
      utils.teams.list.invalidate(); 
      setShowForm(false); 
      resetForm(); 
      toast.success("Equipe criada!"); 
    },
    onError: (e) => toast.error(e.message),
  });

  const update = trpc.teams.update.useMutation({
    onSuccess: () => { 
      utils.teams.list.invalidate(); 
      setShowForm(false); 
      setEditing(null); 
      resetForm(); 
      toast.success("Equipe atualizada!"); 
    },
    onError: (e) => toast.error(e.message),
  });

  const remove = trpc.teams.delete.useMutation({
    onSuccess: () => { 
      utils.teams.list.invalidate(); 
      toast.success("Equipe removida!"); 
    },
    onError: (e) => toast.error(e.message),
  });

  const resetForm = () => {
    setForm({ name: "", tag: "", captainName: "", captainDiscord: "", whatsapp: "", logo: "" });
    clearImage();
  };

  const handleEdit = (team: NonNullable<typeof teamsList>[0]) => {
    setEditing(team.id);
    setForm({
      name: team.name,
      tag: team.tag,
      captainName: team.captainName ?? "",
      captainDiscord: team.captainDiscord ?? "",
      whatsapp: team.whatsapp ?? "",
      logo: team.logo ?? "",
    });
    // Se já tiver logo, mostra no preview
    if (team.logo) {
      setPreview(team.logo);
    } else {
      clearImage();
    }
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.tag) { 
      toast.error("Nome e tag sao obrigatorios"); 
      return; 
    }

    // Usa o preview (que pode ser URL do servidor ou vazio)
    const data = { ...form, logo: preview || form.logo };

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
            <h1 className="text-2xl font-bold text-[#f0f0f5] mb-1">Equipes</h1>
            <p className="text-[#8a8a9e] text-sm">Gerencie as equipes do sistema</p>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditing(null); resetForm(); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all"
          >
            <Plus className="w-4 h-4" /> Nova Equipe
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5a6e]" />
          <input
            type="text"
            placeholder="Buscar equipe..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#12121a] border border-[#2a2a3a] text-[#f0f0f5] text-sm placeholder-[#5a5a6e] focus:outline-none focus:border-red-500/50"
          />
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#f0f0f5]">{editing ? "Editar" : "Nova"} Equipe</h3>
              <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-[#1a1a24] text-[#5a5a6e]">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Upload de Logo */}
            <div className="mb-6">
              <label className="block text-sm text-[#8a8a9e] mb-2">Logo da Equipe</label>
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24 rounded-xl bg-gradient-to-br from-red-900/30 to-red-600/10 flex items-center justify-center border border-[#2a2a3a] overflow-hidden">
                  {preview ? (
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Shield className="w-10 h-10 text-red-400/50" />
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-red-400 animate-spin" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm cursor-pointer hover:border-red-500/50 transition-colors">
                    <Upload className="w-4 h-4" />
                    {preview ? "Trocar imagem" : "Enviar logo"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                  {preview && (
                    <button
                      type="button"
                      onClick={clearImage}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      Remover imagem
                    </button>
                  )}
                  {uploadError && (
                    <span className="text-xs text-red-400">{uploadError}</span>
                  )}
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#8a8a9e] mb-1">Nome *</label>
                <input 
                  value={form.name} 
                  onChange={(e) => setForm({ ...form, name: e.target.value })} 
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50" 
                />
              </div>
              <div>
                <label className="block text-sm text-[#8a8a9e] mb-1">Tag *</label>
                <input 
                  value={form.tag} 
                  onChange={(e) => setForm({ ...form, tag: e.target.value })} 
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50" 
                />
              </div>
              <div>
                <label className="block text-sm text-[#8a8a9e] mb-1">Capitao</label>
                <input 
                  value={form.captainName} 
                  onChange={(e) => setForm({ ...form, captainName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50" 
                />
              </div>
              <div>
                <label className="block text-sm text-[#8a8a9e] mb-1">Discord</label>
                <input 
                  value={form.captainDiscord} 
                  onChange={(e) => setForm({ ...form, captainDiscord: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50" 
                />
              </div>
              <div>
                <label className="block text-sm text-[#8a8a9e] mb-1">WhatsApp</label>
                <input 
                  value={form.whatsapp} 
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50" 
                />
              </div>
              <div className="flex items-end">
                <button 
                  type="submit" 
                  disabled={create.isPending || update.isPending || isUploading}
                  className="px-6 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all disabled:opacity-50"
                >
                  {create.isPending || update.isPending ? "Salvando..." : (
                    <span className="flex items-center gap-1">
                      <Check className="w-4 h-4" /> Salvar
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a2a3a]">
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Logo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Tag</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Capitao</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a3a]">
                {teamsList?.map((team) => (
                  <tr key={team.id} className="hover:bg-[#1a1a24]">
                    <td className="px-6 py-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-900/30 to-red-600/10 flex items-center justify-center overflow-hidden">
                        {team.logo ? (
                          <img src={team.logo} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Shield className="w-5 h-5 text-red-400/50" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm font-medium text-[#f0f0f5]">{team.name}</td>
                    <td className="px-6 py-3 text-sm text-[#8a8a9e]">[{team.tag}]</td>
                    <td className="px-6 py-3 text-sm text-[#8a8a9e]">{team.captainName ?? "-"}</td>
                    <td className="px-6 py-3">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(team)} 
                          className="p-1.5 rounded hover:bg-blue-500/10 text-blue-400 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => { if (confirm("Remover equipe?")) remove.mutate({ id: team.id }); }} 
                          className="p-1.5 rounded hover:bg-red-500/10 text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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