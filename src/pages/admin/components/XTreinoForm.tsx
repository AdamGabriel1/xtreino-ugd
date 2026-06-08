// ============================================================
// COMPONENTE: Formulario de Criar/Editar XTreino
// ============================================================

import { X, Check } from "lucide-react";
import type { XTreinoFormData, XTreinoStatus, Modality } from "../types";

interface XTreinoFormProps {
  form: XTreinoFormData;
  editing: number | null;
  isPending: boolean;
  onChange: (form: XTreinoFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

const statusOptions: { value: XTreinoStatus; label: string }[] = [
  { value: "aberto", label: "Aberto" },
  { value: "encerrado", label: "Encerrado" },
  { value: "cancelado", label: "Cancelado" },
];

const modalityOptions: { value: Modality; label: string }[] = [
  { value: "solo", label: "Solo" },
  { value: "duo", label: "Duo" },
  { value: "squad", label: "Squad" },
  { value: "4v4", label: "4v4" },
];

export function XTreinoForm({ form, editing, isPending, onChange, onSubmit, onClose }: XTreinoFormProps) {
  const updateField = <K extends keyof XTreinoFormData>(field: K, value: XTreinoFormData[K]) => {
    onChange({ ...form, [field]: value });
  };

  return (
    <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-[#f0f0f5]">{editing ? "Editar" : "Novo"} XTreino</h3>
        <button onClick={onClose} className="p-1 rounded hover:bg-[#1a1a24] text-[#5a5a6e]">
          <X className="w-4 h-4" />
        </button>
      </div>
      <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-[#8a8a9e] mb-1">Nome *</label>
          <input
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50"
          />
        </div>
        <div>
          <label className="block text-sm text-[#8a8a9e] mb-1">Data *</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => updateField("date", e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50"
          />
        </div>
        <div>
          <label className="block text-sm text-[#8a8a9e] mb-1">Horario MX</label>
          <input
            value={form.timeMx}
            onChange={(e) => updateField("timeMx", e.target.value)}
            placeholder="6:00"
            className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50"
          />
        </div>
        <div>
          <label className="block text-sm text-[#8a8a9e] mb-1">Horario BR *</label>
          <input
            value={form.timeBr}
            onChange={(e) => updateField("timeBr", e.target.value)}
            placeholder="21:00"
            required
            className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50"
          />
        </div>
        <div>
          <label className="block text-sm text-[#8a8a9e] mb-1">Modalidade</label>
          <select
            value={form.modality}
            onChange={(e) => updateField("modality", e.target.value as Modality)}
            className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50"
          >
            {modalityOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-[#8a8a9e] mb-1">Max Equipes</label>
          <input
            type="number"
            value={form.maxTeams}
            onChange={(e) => updateField("maxTeams", parseInt(e.target.value) || 20)}
            className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50"
          />
        </div>
        <div>
          <label className="block text-sm text-[#8a8a9e] mb-1">Status</label>
          <select
            value={form.status}
            onChange={(e) => updateField("status", e.target.value as XTreinoStatus)}
            className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-[#8a8a9e] mb-1">Discord</label>
          <input
            value={form.discordLink}
            onChange={(e) => updateField("discordLink", e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50"
          />
        </div>
        <div>
          <label className="block text-sm text-[#8a8a9e] mb-1">WhatsApp</label>
          <input
            value={form.whatsappLink}
            onChange={(e) => updateField("whatsappLink", e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm text-[#8a8a9e] mb-1">Regras</label>
          <textarea
            value={form.rules}
            onChange={(e) => updateField("rules", e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50"
          />
        </div>
        <div className="flex items-end gap-2">
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all disabled:opacity-50"
          >
            {isPending ? "Salvando..." : (
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4" /> Salvar
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
