import { useState } from "react";
import { Plus, X, Check, Calendar, CalendarDays, Clock } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";

export default function XTreinosSchedule() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    date: "",
    dayOfWeek: "",
    timeBr: "21:00",
    status: "scheduled" as "scheduled" | "completed" | "cancelled",
    notes: "",
  });

  const utils = trpc.useUtils();
  const { data: scheduleList } = trpc.xtreinos.schedule.list.useQuery();

  const createSchedule = trpc.xtreinos.schedule.create.useMutation({
    onSuccess: () => {
      utils.xtreinos.schedule.list.invalidate();
      setShowForm(false);
      resetForm();
      toast.success("Agendamento criado!");
    },
    onError: (e) => toast.error(e.message),
  });

  const generateMonthSchedule = trpc.xtreinos.schedule.generateMonth.useMutation({
    onSuccess: (data) => {
      utils.xtreinos.schedule.list.invalidate();
      toast.success(`${data.generated} xtreinos agendados!`);
    },
    onError: (e) => toast.error(e.message),
  });

  const resetForm = () =>
    setForm({
      date: "",
      dayOfWeek: "",
      timeBr: "21:00",
      status: "scheduled",
      notes: "",
    });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date || !form.dayOfWeek) {
      toast.error("Data e dia da semana são obrigatórios");
      return;
    }
    createSchedule.mutate(form);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowForm(true);
              resetForm();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-all"
          >
            <Plus className="w-4 h-4" /> Add Agendamento
          </button>
          <button
            onClick={() => {
              const now = new Date();
              if (confirm(`Gerar agenda para ${now.getMonth() + 1}/${now.getFullYear()}?`)) {
                generateMonthSchedule.mutate({
                  year: now.getFullYear(),
                  month: now.getMonth() + 1,
                });
              }
            }}
            disabled={generateMonthSchedule.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm font-medium hover:bg-[#22222e] transition-all disabled:opacity-50"
          >
            <CalendarDays className="w-4 h-4" />
            {generateMonthSchedule.isPending ? "Gerando..." : "Gerar Mês"}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#f0f0f5]">Novo Agendamento</h3>
            <button
              onClick={() => setShowForm(false)}
              className="p-1 rounded hover:bg-[#1a1a24] text-[#5a5a6e]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-3 gap-4">
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
              <label className="block text-sm text-[#8a8a9e] mb-1">Dia da Semana *</label>
              <select
                value={form.dayOfWeek}
                onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm"
              >
                <option value="">Selecione</option>
                <option value="Segunda">Segunda</option>
                <option value="Terça">Terça</option>
                <option value="Quarta">Quarta</option>
                <option value="Quinta">Quinta</option>
                <option value="Sexta">Sexta</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-[#8a8a9e] mb-1">Horário BR</label>
              <input
                value={form.timeBr}
                onChange={(e) => setForm({ ...form, timeBr: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-[#8a8a9e] mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as "scheduled" | "completed" | "cancelled" })}
                className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm"
              >
                <option value="scheduled">Agendado</option>
                <option value="completed">Realizado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-[#8a8a9e] mb-1">Observações</label>
              <input
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm"
              />
            </div>
            <div className="sm:col-span-3 flex items-end">
              <button
                type="submit"
                disabled={createSchedule.isPending}
                className="px-6 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-all disabled:opacity-50"
              >
                {createSchedule.isPending ? (
                  "Salvando..."
                ) : (
                  <span className="flex items-center gap-1">
                    <Check className="w-4 h-4" /> Criar
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
            <Calendar className="w-5 h-5 text-blue-400" />
            Agenda de Xtreinos
          </h3>
          <span className="text-xs text-[#5a5a6e]">
            {scheduleList?.length ?? 0} registros
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a2a3a] bg-[#0a0a0f]">
                <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Dia</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Horário</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Obs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a3a]">
              {scheduleList?.map((s) => (
                <tr
                  key={s.id}
                  className={`hover:bg-[#1a1a24] ${s.status === "completed" ? "opacity-50" : ""}`}
                >
                  <td className="px-6 py-3 text-sm text-[#f0f0f5]">{s.date}</td>
                  <td className="px-6 py-3 text-sm text-[#8a8a9e]">{s.dayOfWeek}</td>
                  <td className="px-6 py-3 text-sm text-[#8a8a9e]">{s.timeBr}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      s.status === "completed" ? "bg-green-500/10 text-green-400" :
                      s.status === "cancelled" ? "bg-red-500/10 text-red-400" :
                      "bg-blue-500/10 text-blue-400"
                    }`}>
                      {s.status === "completed" ? "Realizado" :
                       s.status === "cancelled" ? "Cancelado" : "Agendado"}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-[#8a8a9e]">{s.notes ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!scheduleList?.length && (
          <div className="px-6 py-8 text-center text-[#5a5a6e] text-sm">
            Nenhum agendamento encontrado
          </div>
        )}
      </div>

      {/* Próximos Xtreinos */}
      {scheduleList && scheduleList.length > 0 && (
        <div className="mt-6 bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2a2a3a]">
            <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              Próximos Xtreinos
            </h3>
          </div>
          <div className="divide-y divide-[#2a2a3a]">
            {scheduleList
              .filter((s) => s.status === "scheduled")
              .slice(0, 5)
              .map((s) => (
                <div key={s.id} className="flex items-center justify-between px-6 py-3">
                  <div className="flex items-center gap-4">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span className="text-sm text-[#f0f0f5]">{s.date}</span>
                    <span className="text-xs text-[#5a5a6e]">{s.dayOfWeek}</span>
                  </div>
                  <span className="text-sm text-[#8a8a9e] flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {s.timeBr}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}