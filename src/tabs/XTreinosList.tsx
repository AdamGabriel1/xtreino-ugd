import { Plus, Pencil, Trash2 } from "lucide-react";
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

const statusColors: Record<XTreinoStatus, string> = {
  aberto: "bg-blue-500/10 text-blue-400",
  encerrado: "bg-red-500/10 text-red-400",
  cancelado: "bg-gray-500/10 text-gray-400",
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
  return (
    <>
      {isAdmin && (
        <div className="flex justify-between items-center">
          <button
            onClick={onShowForm}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all"
          >
            <Plus className="w-4 h-4" /> Novo XTreino
          </button>
        </div>
      )}

      {isAdmin && showForm && (
        <XTreinoForm
          form={form}
          editing={editing}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Horarios</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Modo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Status</th>
                {isAdmin && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Acoes</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a3a]">
              {xtreinosList?.map((x) => (
                <tr key={x.id} className="hover:bg-[#1a1a24]">
                  <td className="px-6 py-3 text-sm font-medium text-[#f0f0f5]">{x.name}</td>
                  <td className="px-6 py-3 text-sm text-[#8a8a9e]">{x.date}</td>
                  <td className="px-6 py-3 text-sm text-[#8a8a9e]">
                    MX {x.timeMx} / BR {x.timeBr}
                  </td>
                  <td className="px-6 py-3 text-sm text-[#8a8a9e]">{x.modality?.toUpperCase()}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[x.status]}`}>
                      {x.status}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onEdit(x)}
                          className="p-1.5 rounded hover:bg-blue-500/10 text-blue-400"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { if (confirm("Remover?")) onDelete(x.id); }}
                          className="p-1.5 rounded hover:bg-red-500/10 text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!xtreinosList?.length && (
          <div className="px-6 py-8 text-center text-[#5a5a6e] text-sm">
            Nenhum xtreino cadastrado
          </div>
        )}
      </div>
    </>
  );
}