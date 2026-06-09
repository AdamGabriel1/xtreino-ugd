import { Plus, CalendarDays } from "lucide-react";
import type { ScheduleItem, ScheduleFormData, ScheduleStatus } from "../pages/admin/types";
import { ScheduleForm } from "../pages/admin/components/ScheduleForm";

interface ScheduleTabProps {
  scheduleList: ScheduleItem[] | undefined;
  showForm: boolean;
  form: ScheduleFormData;
  isPending: boolean;
  isGenerating: boolean;
  onShowForm: () => void;
  onCloseForm: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onGenerateMonth: () => void;
  onFormChange: (form: ScheduleFormData) => void;
  isAdmin?: boolean;
}

const statusConfig: Record<ScheduleStatus, { bg: string; text: string; label: string }> = {
  completed: { bg: "bg-green-500/10", text: "text-green-400", label: "Realizado" },
  cancelled: { bg: "bg-red-500/10", text: "text-red-400", label: "Cancelado" },
  scheduled: { bg: "bg-blue-500/10", text: "text-blue-400", label: "Agendado" },
};

export function ScheduleTab({
  scheduleList,
  showForm,
  form,
  isPending,
  isGenerating,
  onShowForm,
  onCloseForm,
  onSubmit,
  onGenerateMonth,
  onFormChange,
  isAdmin = false,
}: ScheduleTabProps) {
  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div className="flex gap-2">
          {isAdmin && (
            <>
              <button
                onClick={onShowForm}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all"
              >
                <Plus className="w-4 h-4" /> Add Agendamento
              </button>
              <button
                onClick={onGenerateMonth}
                disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm font-medium hover:bg-[#22222e] transition-all disabled:opacity-50"
              >
                <CalendarDays className="w-4 h-4" />
                {isGenerating ? "Gerando..." : "Gerar Mes"}
              </button>
            </>
          )}
        </div>
      </div>

      {isAdmin && showForm && (
        <ScheduleForm
          form={form}
          isPending={isPending}
          onChange={onFormChange}
          onSubmit={onSubmit}
          onClose={onCloseForm}
        />
      )}

      <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a2a3a]">
                <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Dia</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Horario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Obs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a3a]">
              {scheduleList?.map((s) => {
                const config = statusConfig[s.status];
                return (
                  <tr
                    key={s.id}
                    className={`hover:bg-[#1a1a24] ${s.status === "completed" ? "opacity-50" : ""}`}
                  >
                    <td className="px-6 py-3 text-sm text-[#f0f0f5]">{s.date}</td>
                    <td className="px-6 py-3 text-sm text-[#8a8a9e]">{s.dayOfWeek}</td>
                    <td className="px-6 py-3 text-sm text-[#8a8a9e]">{s.timeBr}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                        {config.label}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-[#8a8a9e]">{s.notes ?? "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!scheduleList?.length && (
          <div className="px-6 py-8 text-center text-[#5a5a6e] text-sm">
            Nenhum agendamento encontrado
          </div>
        )}
      </div>
    </>
  );
}