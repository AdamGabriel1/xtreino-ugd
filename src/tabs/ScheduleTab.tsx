import { useState, useMemo } from "react";
import {
  Plus,
  CalendarDays,
  Calendar,
  Filter,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ListChecks,
} from "lucide-react";
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

const statusConfig: Record<
  ScheduleStatus,
  { bg: string; text: string; label: string; icon: typeof CheckCircle2 }
> = {
  completed: {
    bg: "bg-green-500/10",
    text: "text-green-400",
    label: "Realizado",
    icon: CheckCircle2,
  },
  cancelled: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    label: "Cancelado",
    icon: XCircle,
  },
  scheduled: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    label: "Agendado",
    icon: AlertCircle,
  },
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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ScheduleStatus | "">("");

  const filteredList = useMemo(() => {
    if (!scheduleList) return [];
    let list = [...scheduleList];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.date.toLowerCase().includes(q) ||
          s.dayOfWeek.toLowerCase().includes(q) ||
          (s.notes ?? "").toLowerCase().includes(q)
      );
    }
    if (statusFilter) {
      list = list.filter((s) => s.status === statusFilter);
    }
    return list;
  }, [scheduleList, search, statusFilter]);

  const summary = useMemo(() => {
    if (!scheduleList?.length) return null;
    return {
      total: scheduleList.length,
      scheduled: scheduleList.filter((s) => s.status === "scheduled").length,
      completed: scheduleList.filter((s) => s.status === "completed").length,
      cancelled: scheduleList.filter((s) => s.status === "cancelled").length,
    };
  }, [scheduleList]);

  const isLoading = !scheduleList;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#12121a] border-b border-[#2a2a3a]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-8 h-8 text-green-400" />
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#f0f0f5]">
              Agenda de XTreinos
            </h1>
          </div>
          <p className="text-[#8a8a9e]">
            Gerencie os agendamentos e horários dos xtreinos
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Filtros */}
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex items-center gap-2 text-[#8a8a9e]">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filtros:</span>
            </div>

            <div className="flex flex-wrap gap-3 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5a6e]" />
                <input
                  type="text"
                  placeholder="Buscar data, dia ou observação..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm placeholder-[#5a5a6e] focus:outline-none focus:border-green-500/50 min-w-[260px]"
                />
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#5a5a6e]" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as ScheduleStatus | "")}
                  className="px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50 min-w-[140px]"
                >
                  <option value="">Todos os status</option>
                  <option value="scheduled">Agendado</option>
                  <option value="completed">Realizado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>

              {isAdmin && (
                <>
                  <button
                    onClick={onShowForm}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-all"
                  >
                    <Plus className="w-4 h-4" /> Add Agendamento
                  </button>
                  <button
                    onClick={onGenerateMonth}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm font-medium hover:bg-[#22222e] transition-all disabled:opacity-50"
                  >
                    <CalendarDays className="w-4 h-4" />
                    {isGenerating ? "Gerando..." : "Gerar Mês"}
                  </button>
                </>
              )}
            </div>

            {(search || statusFilter) && (
              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("");
                }}
                className="text-xs text-green-400 hover:text-green-300 transition-colors"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>

        {/* Form de adicionar agendamento */}
        {isAdmin && showForm && (
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
            <h3 className="font-bold text-[#f0f0f5] mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-green-400" />
              Adicionar Agendamento
            </h3>
            <ScheduleForm
              form={form}
              isPending={isPending}
              onChange={onFormChange}
              onSubmit={onSubmit}
              onClose={onCloseForm}
            />
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[#5a5a6e]">Carregando agendamentos...</p>
          </div>
        )}

        {/* Cards de Resumo */}
        {summary && !isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
              <div className="flex items-center gap-2 mb-2">
                <ListChecks className="w-4 h-4 text-green-400" />
                <span className="text-xs text-[#5a5a6e] uppercase">Total</span>
              </div>
              <p className="text-2xl font-bold text-[#f0f0f5]">{summary.total}</p>
            </div>
            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-[#5a5a6e] uppercase">Agendados</span>
              </div>
              <p className="text-2xl font-bold text-emerald-400">{summary.scheduled}</p>
            </div>
            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-xs text-[#5a5a6e] uppercase">Realizados</span>
              </div>
              <p className="text-2xl font-bold text-green-400">{summary.completed}</p>
            </div>
            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-4 h-4 text-red-400" />
                <span className="text-xs text-[#5a5a6e] uppercase">Cancelados</span>
              </div>
              <p className="text-2xl font-bold text-red-400">{summary.cancelled}</p>
            </div>
          </div>
        )}

        {/* Tabela Principal */}
        {!isLoading && (
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center justify-between">
              <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-green-400" />
                Agendamentos
                {statusFilter && (
                  <span className="text-sm font-normal text-[#5a5a6e]">
                    — {statusConfig[statusFilter].label}
                  </span>
                )}
              </h3>
              <span className="text-xs text-[#5a5a6e]">
                {filteredList.length} registros
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2a2a3a] bg-[#0a0a0f]">
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">
                      Dia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">
                      Horário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">
                      Observação
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2a3a]">
                  {filteredList.map((s) => {
                    const config = statusConfig[s.status];
                    const StatusIcon = config.icon;
                    return (
                      <tr
                        key={s.id}
                        className={`hover:bg-[#1a1a24] transition-colors ${
                          s.status === "completed" ? "opacity-50" : ""
                        }`}
                      >
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                              <Calendar className="w-4 h-4 text-green-400" />
                            </div>
                            <span className="text-sm font-bold text-[#f0f0f5]">
                              {s.date}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-sm text-[#8a8a9e]">
                          {s.dayOfWeek}
                        </td>
                        <td className="px-6 py-3 text-sm text-[#8a8a9e]">
                          {s.timeBr}
                        </td>
                        <td className="px-6 py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {config.label}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm text-[#8a8a9e]">
                          {s.notes ?? "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredList.length === 0 && (
              <div className="px-6 py-16 text-center">
                <CalendarDays className="w-12 h-12 mx-auto mb-4 text-[#2a2a3a]" />
                <p className="text-[#5a5a6e] text-lg font-medium">
                  Nenhum agendamento encontrado
                </p>
                <p className="text-[#3a3a4e] text-sm mt-1">
                  {search || statusFilter
                    ? "Tente ajustar os filtros"
                    : "Nenhum dado disponível"}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}