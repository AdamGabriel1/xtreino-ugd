// ============================================================
// COMPONENTE: Formulario de Agendamento
// ============================================================

import { X, Check } from "lucide-react";
import type { ScheduleFormData, ScheduleStatus } from "../types";

interface ScheduleFormProps {
  form: ScheduleFormData;
  isPending: boolean;
  onChange: (form: ScheduleFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

const dayOptions = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
const statusOptions: { value: ScheduleStatus; label: string }[] = [
  { value: "scheduled", label: "Agendado" },
  { value: "completed", label: "Realizado" },
  { value: "cancelled", label: "Cancelado" },
];

export function ScheduleForm({ form, isPending, onChange, onSubmit, onClose }: ScheduleFormProps) {
  const updateField = <K extends keyof ScheduleFormData>(field: K, value: ScheduleFormData[K]) => {
    onChange({ ...form, [field]: value });
  };

  return (
    <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-[#f0f0f5]">Novo Agendamento</h3>
        <button onClick={onClose} className="p-1 rounded hover:bg-[#1a1a24] text-[#5a5a6e]">
          <X className="w-4 h-4" />
        </button>
      </div>
      <form onSubmit={onSubmit} className="grid sm:grid-cols-3 gap-4">
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
          <label className="block text-sm text-[#8a8a9e] mb-1">Dia da Semana *</label>
          <select
            value={form.dayOfWeek}
            onChange={(e) => updateField("dayOfWeek", e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm"
          >
            <option value="">Selecione</option>
            {dayOptions.map((day) => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-[#8a8a9e] mb-1">Horario BR</label>
          <input
            value={form.timeBr}
            onChange={(e) => updateField("timeBr", e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-[#8a8a9e] mb-1">Status</label>
          <select
            value={form.status}
            onChange={(e) => updateField("status", e.target.value as ScheduleStatus)}
            className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm text-[#8a8a9e] mb-1">Observacoes</label>
          <input
            value={form.notes}
            onChange={(e) => updateField("notes", e.target.value)}
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
                <Check className="w-4 h-4" /> Criar
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
