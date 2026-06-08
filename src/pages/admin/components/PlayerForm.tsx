// ============================================================
// COMPONENTE: Formulario de Adicionar Stats de Jogador
// ============================================================

import { X, Check } from "lucide-react";
import type { PlayerFormData } from "../types";

interface PlayerFormProps {
  form: PlayerFormData;
  isPending: boolean;
  selectedXtId: number | null;
  onChange: (form: PlayerFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function PlayerForm({ form, isPending, selectedXtId, onChange, onSubmit, onClose }: PlayerFormProps) {
  const updateField = <K extends keyof PlayerFormData>(field: K, value: PlayerFormData[K]) => {
    onChange({ ...form, [field]: value });
  };

  return (
    <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-[#f0f0f5]">Adicionar Stats de Jogador</h3>
        <button onClick={onClose} className="p-1 rounded hover:bg-[#1a1a24] text-[#5a5a6e]">
          <X className="w-4 h-4" />
        </button>
      </div>
      <form onSubmit={onSubmit} className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-[#8a8a9e] mb-1">XTreino ID</label>
          <input
            type="number"
            value={selectedXtId ?? form.xtreinoId}
            readOnly
            className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm opacity-50"
          />
        </div>
        <div>
          <label className="block text-sm text-[#8a8a9e] mb-1">Data *</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => updateField("date", e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-[#8a8a9e] mb-1">Time *</label>
          <input
            value={form.teamName}
            onChange={(e) => updateField("teamName", e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-[#8a8a9e] mb-1">Jogador *</label>
          <input
            value={form.playerName}
            onChange={(e) => updateField("playerName", e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-[#8a8a9e] mb-1">Q1 Kills</label>
          <input
            type="number"
            value={form.q1Kills}
            onChange={(e) => updateField("q1Kills", parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-[#8a8a9e] mb-1">Q2 Kills</label>
          <input
            type="number"
            value={form.q2Kills}
            onChange={(e) => updateField("q2Kills", parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-[#8a8a9e] mb-1">Q3 Kills</label>
          <input
            type="number"
            value={form.q3Kills}
            onChange={(e) => updateField("q3Kills", parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-[#8a8a9e] mb-1">Total Kills</label>
          <input
            type="number"
            value={form.totalKills}
            onChange={(e) => updateField("totalKills", parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm"
          />
        </div>
        <div className="sm:col-span-3 flex items-end">
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all disabled:opacity-50"
          >
            {isPending ? "Salvando..." : (
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4" /> Adicionar
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}