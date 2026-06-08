// ============================================================
// TAB: Jogadores
// ============================================================

import { Plus } from "lucide-react";
import type { XTreino, PlayerStat, PlayerFormData } from "../types";
import { PlayerForm } from "../components/PlayerForm";

interface PlayersTabProps {
  xtreinosList: XTreino[] | undefined;
  allPlayerStats: PlayerStat[] | undefined;
  selectedXt: number | null;
  showForm: boolean;
  form: PlayerFormData;
  isPending: boolean;
  onSelectXt: (id: number | null) => void;
  onShowForm: () => void;
  onCloseForm: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFormChange: (form: PlayerFormData) => void;
}

export function PlayersTab({
  xtreinosList,
  allPlayerStats,
  selectedXt,
  showForm,
  form,
  isPending,
  onSelectXt,
  onShowForm,
  onCloseForm,
  onSubmit,
  onFormChange,
}: PlayersTabProps) {
  // FILTRO SIMPLES: se selecionou xtreino, filtra por xtreinoId
  const stats = selectedXt
    ? allPlayerStats?.filter((p) => p.xtreinoId === selectedXt) ?? []
    : allPlayerStats ?? [];

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
            <Plus className="w-4 h-4" /> Add Jogador
          </button>
        </div>
      </div>

      {showForm && (
        <PlayerForm
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
                <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Jogador</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Time</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Q1</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Q2</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Q3</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a3a]">
              {stats.map((p) => (
                <tr key={p.id} className="hover:bg-[#1a1a24]">
                  <td className="px-6 py-3 text-sm text-[#8a8a9e]">{p.date}</td>
                  <td className="px-6 py-3 text-sm font-medium text-[#f0f0f5]">{p.playerName}</td>
                  <td className="px-6 py-3 text-sm text-[#8a8a9e]">{p.teamName}</td>
                  <td className="px-6 py-3 text-center text-sm text-[#8a8a9e]">{p.q1Kills}</td>
                  <td className="px-6 py-3 text-center text-sm text-[#8a8a9e]">{p.q2Kills}</td>
                  <td className="px-6 py-3 text-center text-sm text-[#8a8a9e]">{p.q3Kills}</td>
                  <td className="px-6 py-3 text-center text-sm font-bold text-red-400">{p.totalKills}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!stats.length && (
          <div className="px-6 py-8 text-center text-[#5a5a6e] text-sm">
            Nenhuma estatistica registrada
          </div>
        )}
      </div>
    </>
  );
}