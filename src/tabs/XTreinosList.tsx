import { useState, useMemo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Dumbbell,
  Filter,
  Search,
  Clock,
  Swords,
  ListChecks,
  TrendingUp,
  XCircle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import type { XTreino, XTreinoFormData, XTreinoStatus } from "../pages/admin/types";
import { XTreinoForm } from "../pages/admin/components/XTreinoForm";

interface XTreinosListProps {
  xtreinosList: XTreino[] | undefined;
  showForm: boolean;
  editing: number | null;
  form: XTreinoFormData;
  isPending: boolean;
  onShowForm: () => void;
  onCloseForm: () => void;
  onEdit: (x: XTreino) => void;
  onSubmit: (e: React.FormEvent) => void;
  onDelete: (id: number) => void;
  onFormChange: (form: XTreinoFormData) => void;
  isAdmin?: boolean;
}

const statusConfig: Record<
  XTreinoStatus,
  { bg: string; text: string; label: string; icon: typeof CheckCircle2 }
> = {
  aberto: {
    bg: "bg-green-500/10",
    text: "text-green-400",
    label: "Aberto",
    icon: AlertCircle,
  },
  encerrado: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    label: "Encerrado",
    icon: CheckCircle2,
  },
  cancelado: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    label: "Cancelado",
    icon: XCircle,
  },
};

export function XTreinosList({
  xtreinosList,
  showForm,
  editing,
  form,
  isPending,
  onShowForm,
  onCloseForm,
  onEdit,
  onSubmit,
  onDelete,
  onFormChange,
  isAdmin = false,
}: XTreinosListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<XTreinoStatus | "">("");

  const filteredList = useMemo(() => {
    if (!xtreinosList) return [];
    let list = [...xtreinosList];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (x) =>
          x.name.toLowerCase().includes(q) ||
          x.date.toLowerCase().includes(q) ||
          x.modality.toLowerCase().includes(q)
      );
    }
    if (statusFilter) {
      list = list.filter((x) => x.status === statusFilter);
    }
    return list;
  }, [xtreinosList, search, statusFilter]);

  // Ordenar por data (mais recente primeiro)
  const sortedList = useMemo(() => {
    return [...filteredList].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [filteredList]);

  // Resumo
  const summary = useMemo(() => {
    if (!xtreinosList?.length) return null;
    return {
      total: xtreinosList.length,
      abertos: xtreinosList.filter((x) => x.status === "aberto").length,
      encerrados: xtreinosList.filter((x) => x.status === "encerrado").length,
      cancelados: xtreinosList.filter((x) => x.status === "cancelado").length,
    };
  }, [xtreinosList]);

  const isLoading = !xtreinosList;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#12121a] border-b border-[#2a2a3a]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Dumbbell className="w-8 h-8 text-green-400" />
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#f0f0f5]">
              Gerenciar XTreinos
            </h1>
          </div>
          <p className="text-[#8a8a9e]">
            Visualize e gerencie todos os xtreinos cadastrados no sistema
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
                  placeholder="Buscar nome, data ou modalidade..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm placeholder-[#5a5a6e] focus:outline-none focus:border-green-500/50 min-w-[260px]"
                />
              </div>

              <div className="flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-[#5a5a6e]" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as XTreinoStatus | "")}
                  className="px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50 min-w-[140px]"
                >
                  <option value="">Todos os status</option>
                  <option value="aberto">Aberto</option>
                  <option value="encerrado">Encerrado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>

              {isAdmin && (
                <button
                  onClick={onShowForm}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-all"
                >
                  <Plus className="w-4 h-4" /> Novo XTreino
                </button>
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

        {/* Form de criar/editar xtreino */}
        {isAdmin && showForm && (
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
            <h3 className="font-bold text-[#f0f0f5] mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-green-400" />
              {editing ? "Editar XTreino" : "Novo XTreino"}
            </h3>
            <XTreinoForm
              form={form}
              editing={editing}
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
            <p className="text-[#5a5a6e]">Carregando xtreinos...</p>
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
                <AlertCircle className="w-4 h-4 text-green-400" />
                <span className="text-xs text-[#5a5a6e] uppercase">Abertos</span>
              </div>
              <p className="text-2xl font-bold text-green-400">{summary.abertos}</p>
            </div>
            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-[#5a5a6e] uppercase">Encerrados</span>
              </div>
              <p className="text-2xl font-bold text-emerald-400">{summary.encerrados}</p>
            </div>
            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-4 h-4 text-red-400" />
                <span className="text-xs text-[#5a5a6e] uppercase">Cancelados</span>
              </div>
              <p className="text-2xl font-bold text-red-400">{summary.cancelados}</p>
            </div>
          </div>
        )}

        {/* Tabela Principal */}
        {!isLoading && (
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center justify-between">
              <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Lista de XTreinos
                {statusFilter && (
                  <span className="text-sm font-normal text-[#5a5a6e]">
                    — {statusConfig[statusFilter].label}
                  </span>
                )}
              </h3>
              <span className="text-xs text-[#5a5a6e]">
                {sortedList.length} registros
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2a2a3a] bg-[#0a0a0f]">
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">
                      Horários
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">
                      Modo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">
                      Status
                    </th>
                    {isAdmin && (
                      <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase w-24">
                        Ações
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2a3a]">
                  {sortedList.map((x) => {
                    const config = statusConfig[x.status];
                    const StatusIcon = config.icon;
                    return (
                      <tr
                        key={x.id}
                        className="hover:bg-[#1a1a24] transition-colors"
                      >
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                              <Dumbbell className="w-4 h-4 text-green-400" />
                            </div>
                            <span className="text-sm font-bold text-[#f0f0f5]">
                              {x.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-sm text-[#8a8a9e]">
                          {x.date}
                        </td>
                        <td className="px-6 py-3 text-sm text-[#8a8a9e]">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#5a5a6e]" />
                            MX {x.timeMx} / BR {x.timeBr}
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-xs text-[#8a8a9e]">
                            <Swords className="w-3 h-3" />
                            {x.modality?.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {config.label}
                          </span>
                        </td>
                        {isAdmin && (
                          <td className="px-6 py-3">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => onEdit(x)}
                                className="p-1.5 rounded-lg hover:bg-green-500/10 text-green-400 transition-colors"
                                title="Editar"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm("Remover este xtreino?")) onDelete(x.id);
                                }}
                                className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                                title="Excluir"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {sortedList.length === 0 && (
              <div className="px-6 py-16 text-center">
                <Dumbbell className="w-12 h-12 mx-auto mb-4 text-[#2a2a3a]" />
                <p className="text-[#5a5a6e] text-lg font-medium">
                  Nenhum xtreino encontrado
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