// ============================================================
// TAB: Resultados
// ============================================================

import { useState } from "react";
import { Plus } from "lucide-react";
import type { XTreino, XTreinoResult, ResultFormData } from "../types";
import { ResultForm } from "../components/ResultForm";

interface ResultsTabProps {
  xtreinosList: XTreino[] | undefined;
  allResults: XTreinoResult[] | undefined;
  xtDetail: { results?: XTreinoResult[] } | null | undefined;
  selectedXt: number | null;
  showForm: boolean;
  form: ResultFormData;
  isPending: boolean;
  onSelectXt: (id: number | null) => void;
  onShowForm: () => void;
  onCloseForm: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFormChange: (form: ResultFormData) => void;
}

export function ResultsTab({
  xtreinosList,
  allResults,
  xtDetail,
  selectedXt,
  showForm,
  form,
  isPending,
  onSelectXt,
  onShowForm,
  onCloseForm,
  onSubmit,
  onFormChange,
}: ResultsTabProps) {
  const results = selectedXt ? xtDetail?.results : allResults;

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div className="flex gap-2">
          <select
            value={selectedXt ?? ""}
            onChange={(e) => onSelectXt(e.target.value ? parseInt(e.target.value) : null)}
            className="px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50"
          >
            <option value="">Todos os xtreinos</option>
            {xtreinosList?.map((x) => (
              <option key={x.id} value={x.id}>{x.name} ({x.date})</option>
            ))}
          </select>
          <button
            onClick={onShowForm}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all"
          >
            <Plus className="w-4 h-4" /> Add Resultado
          </button>
        </div>
      </div>

      {showForm && (
        <ResultForm
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
                <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Time</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Q1</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Q2</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Q3</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a3a]">
              {results?.map((r) => (
                <tr key={r.id} className="hover:bg-[#1a1a24]">
                  <td className="px-6 py-3 text-sm text-[#8a8a9e]">{r.date}</td>
                  <td className="px-6 py-3 text-sm font-medium text-[#f0f0f5]">{r.teamName}</td>
                  <td className="px-6 py-3 text-center">
                    <PosBadge pos={r.q1Pos} />
                  </td>
                  <td className="px-6 py-3 text-center">
                    <PosBadge pos={r.q2Pos} />
                  </td>
                  <td className="px-6 py-3 text-center">
                    <PosBadge pos={r.q3Pos} />
                  </td>
                  <td className="px-6 py-3 text-center text-sm font-bold text-[#f0f0f5]">
                    {r.totalPoints ?? "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!results?.length && (
          <div className="px-6 py-8 text-center text-[#5a5a6e] text-sm">
            Nenhum resultado registrado
          </div>
        )}
      </div>
    </>
  );
}

function PosBadge({ pos }: { pos: number | null }) {
  if (!pos) return <span className="text-[#8a8a9e]">-</span>;

  const colors = {
    1: "bg-yellow-500/20 text-yellow-400",
    2: "bg-gray-400/20 text-gray-300",
    3: "bg-amber-600/20 text-amber-500",
  };

  return (
    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${colors[pos as keyof typeof colors] || "bg-[#1a1a24] text-[#8a8a9e]"}`}>
      {pos}
    </span>
  );
}
