import { useState, useEffect } from "react";
import { Save, Globe, MessageSquare, Clock, Palette, FileText } from "lucide-react";
import { trpc } from "@/providers/trpc";
import AdminLayout from "@/layout/AdminLayout";
import { toast } from "sonner";

export default function AdminConfiguracoes() {
  const { data: settings } = trpc.settings.get.useQuery();
  const utils = trpc.useUtils();

  const [form, setForm] = useState({
    orgName: "",
    discordLink: "",
    whatsappLink: "",
    defaultRules: "",
    defaultTimesMx: "",
    defaultTimesBr: "",
    primaryColor: "#22c55e",
    whatsappTemplate: "",
  });

  useEffect(() => {
    if (settings) {
      setForm({
        orgName: settings.orgName ?? "",
        discordLink: settings.discordLink ?? "",
        whatsappLink: settings.whatsappLink ?? "",
        defaultRules: settings.defaultRules ?? "",
        defaultTimesMx: settings.defaultTimesMx ?? "",
        defaultTimesBr: settings.defaultTimesBr ?? "",
        primaryColor: settings.primaryColor ?? "#22c55e",
        whatsappTemplate: settings.whatsappTemplate ?? "",
      });
    }
  }, [settings]);

  const update = trpc.settings.update.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      toast.success("Configuracoes salvas!");
    },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    update.mutate(form);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold text-[#f0f0f5] mb-1">Configuracoes</h1>
          <p className="text-[#8a8a9e] text-sm">Personalize o sistema</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Organization */}
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-green-400" />
              <h2 className="font-bold text-[#f0f0f5]">Organizacao</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm text-[#8a8a9e] mb-1">Nome da Organizacao</label>
                <input value={form.orgName} onChange={(e) => setForm({ ...form, orgName: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50" />
              </div>
              <div>
                <label className="block text-sm text-[#8a8a9e] mb-1">Link Discord</label>
                <input value={form.discordLink} onChange={(e) => setForm({ ...form, discordLink: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50" />
              </div>
              <div>
                <label className="block text-sm text-[#8a8a9e] mb-1">Link WhatsApp</label>
                <input value={form.whatsappLink} onChange={(e) => setForm({ ...form, whatsappLink: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50" />
              </div>
            </div>
          </div>

          {/* Default Times */}
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-green-400" />
              <h2 className="font-bold text-[#f0f0f5]">Horarios Padrao</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#8a8a9e] mb-1">Horario Mexico</label>
                <input value={form.defaultTimesMx} onChange={(e) => setForm({ ...form, defaultTimesMx: e.target.value })} placeholder="5:00 PM"
                  className="w-full px-3 py-2.5 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50" />
              </div>
              <div>
                <label className="block text-sm text-[#8a8a9e] mb-1">Horario Brasil</label>
                <input value={form.defaultTimesBr} onChange={(e) => setForm({ ...form, defaultTimesBr: e.target.value })} placeholder="8:00 PM"
                  className="w-full px-3 py-2.5 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50" />
              </div>
            </div>
          </div>

          {/* Rules */}
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-green-400" />
              <h2 className="font-bold text-[#f0f0f5]">Regras Padrao</h2>
            </div>
            <textarea value={form.defaultRules} onChange={(e) => setForm({ ...form, defaultRules: e.target.value })} rows={5}
              className="w-full px-3 py-2.5 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50" />
          </div>

          {/* WhatsApp Template */}
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-green-400" />
              <h2 className="font-bold text-[#f0f0f5]">Template WhatsApp</h2>
            </div>
            <p className="text-xs text-[#5a5a6e] mb-3">
              Variaveis disponiveis: {"{{ORG_NAME}}"}, {"{{MODALITY}}"}, {"{{DATE}}"}, {"{{TIME_MX}}"}, {"{{TIME_BR}}"}, {"{{TEAMS_LIST}}"}, {"{{RESERVES_LIST}}"}, {"{{DISCORD}}"}, {"{{WHATSAPP}}"}
            </p>
            <textarea value={form.whatsappTemplate} onChange={(e) => setForm({ ...form, whatsappTemplate: e.target.value })} rows={15}
              className="w-full px-3 py-2.5 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm font-mono focus:outline-none focus:border-green-500/50" />
          </div>

          {/* Theme */}
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-5 h-5 text-green-400" />
              <h2 className="font-bold text-[#f0f0f5]">Tema</h2>
            </div>
            <div>
              <label className="block text-sm text-[#8a8a9e] mb-1">Cor Primaria</label>
              <div className="flex items-center gap-3">
                <input type="color" value={form.primaryColor} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                  className="w-12 h-10 rounded-lg bg-transparent border border-[#2a2a3a] cursor-pointer" />
                <input value={form.primaryColor} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                  className="flex-1 px-3 py-2.5 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50" />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={update.isPending}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold transition-all disabled:opacity-50">
            <Save className="w-5 h-5" />
            {update.isPending ? "Salvando..." : "Salvar Configuracoes"}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}