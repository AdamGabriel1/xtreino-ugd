// ============================================================
// COMPONENTE: Gerenciador de Inscrições de Times
// ============================================================

import { useState, useMemo } from "react";
import { Plus, Trash2, Pin, PinOff, Users } from "lucide-react";
import { toast } from "sonner";
import type { XTreino, TeamRegistration } from "../types";

interface InscricoesManagerProps {
  xtreino: XTreino;
  registrations: TeamRegistration[];
  fixedTeams: string[];
  allTeams: Array<{ id: number; name: string; tag: string }> | undefined;
  onRegister: (data: { teamId: number; isReserve: boolean }) => void;
  onUnregister: (data: { teamId: number }) => void;
  onToggleFixed: (data: { teamId: number; isReserve: boolean }) => void;
  isPending: boolean;
}

export function InscricoesManager({
  xtreino,
  registrations,
  fixedTeams,
  allTeams,
  onRegister,
  onUnregister,
  onToggleFixed,
  isPending,
}: InscricoesManagerProps) {
  const [newTeamName, setNewTeamName] = useState("");
  const [selectedExistingTeam, setSelectedExistingTeam] = useState("");
  const [isNewTeam, setIsNewTeam] = useState(false);

  const fixedSet = useMemo(() => new Set(fixedTeams), [fixedTeams]);

  const confirmedTeams = useMemo(() => {
    return registrations
      .filter((r) => r.status === "confirmed")
      .sort((a, b) => a.position - b.position);
  }, [registrations]);

  const reserveTeams = useMemo(() => {
    return registrations
      .filter((r) => r.status === "reserve")
      .sort((a, b) => a.position - b.position);
  }, [registrations]);

  const availableTeams = useMemo(() => {
    if (!allTeams) return [];
    const registeredIds = new Set(registrations.map((r) => {
      // Encontra o teamId pelo teamName
      const team = allTeams.find((t) => t.name === r.teamName);
      return team?.id;
    }).filter(Boolean));
    return allTeams.filter((t) => !registeredIds.has(t.id));
  }, [allTeams, registrations]);

  const handleAddTeam = () => {
    const teamName = isNewTeam ? newTeamName.trim() : selectedExistingTeam;
    if (!teamName) {
      toast.error("Selecione ou digite um nome de time");
      return;
    }

    // Encontra o team pelo nome para pegar o id
    const team = allTeams?.find((t) => t.name === teamName);
    if (!team) {
      toast.error("Time não encontrado na base de dados");
      return;
    }

    const isFixed = fixedSet.has(teamName);
    onRegister({ teamId: team.id, isReserve: !isFixed });
    setNewTeamName("");
    setSelectedExistingTeam("");
    setIsNewTeam(false);
  };

  const handleRemove = (teamName: string) => {
    const team = allTeams?.find((t) => t.name === teamName);
    if (!team) return;
    if (confirm(`Remover "${teamName}" da lista?`)) {
      onUnregister({ teamId: team.id });
    }
  };

  const handleToggleFixedGlobal = (teamName: string) => {
    const team = allTeams?.find((t) => t.name === teamName);
    if (!team) return;
    const currentlyFixed = fixedSet.has(teamName);
    onToggleFixed({ teamId: team.id, isReserve: currentlyFixed });
  };

  return (
    <div className="space-y-6">
      {/* Adicionar Time */}
      <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
        <h3 className="font-bold text-[#f0f0f5] mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-red-400" />
          Adicionar Time
        </h3>

        <div className="flex flex-col sm:flex-row gap-3">
          {isNewTeam ? (
            <input
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="Nome do novo time..."
              className="flex-1 px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50"
            />
          ) : (
            <select
              value={selectedExistingTeam}
              onChange={(e) => setSelectedExistingTeam(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50"
            >
              <option value="">Selecione um time...</option>
              {availableTeams.map((team) => (
                <option key={team.id} value={team.name}>
                  {team.name} {fixedSet.has(team.name) ? "📌" : "🎫"}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setIsNewTeam(!isNewTeam)}
            className="px-4 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#8a8a9e] text-sm hover:text-[#f0f0f5] transition-all"
          >
            {isNewTeam ? "Usar existente" : "Novo time"}
          </button>

          <button
            onClick={handleAddTeam}
            disabled={isPending}
            className="px-6 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all disabled:opacity-50"
          >
            {isPending ? "..." : "Adicionar"}
          </button>
        </div>
      </div>

      {/* Lista de Confirmados */}
      <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center justify-between">
          <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
            <Users className="w-4 h-4 text-green-400" />
            Times Confirmados ({confirmedTeams.length}/{xtreino.maxTeams || 10})
          </h3>
        </div>

        <div className="divide-y divide-[#2a2a3a]">
          {confirmedTeams.map((team) => (
            <div
              key={team.id}
              className="px-6 py-3 flex items-center justify-between hover:bg-[#1a1a24] group"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono text-[#5a5a6e] w-6">
                  {String(team.position).padStart(2, "0")}
                </span>
                <span className="text-lg">
                  {fixedSet.has(team.teamName) ? "📌" : "🎫"}
                </span>
                <span className={`text-sm font-medium ${
                  fixedSet.has(team.teamName) ? "text-[#f0f0f5]" : "text-[#8a8a9e]"
                }`}>
                  {team.teamName}
                </span>
                {fixedSet.has(team.teamName) && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                    FIXO
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleToggleFixedGlobal(team.teamName)}
                  title={fixedSet.has(team.teamName) ? "Remover dos fixos" : "Tornar fixo"}
                  className={`p-1.5 rounded transition-all ${
                    fixedSet.has(team.teamName)
                      ? "hover:bg-yellow-500/10 text-yellow-400"
                      : "hover:bg-[#2a2a3a] text-[#5a5a6e]"
                  }`}
                >
                  {fixedSet.has(team.teamName) ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleRemove(team.teamName)}
                  className="p-1.5 rounded hover:bg-red-500/10 text-red-400 transition-all"
                  title="Remover da lista"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Slots vazios */}
          {Array.from({ length: Math.max(0, (xtreino.maxTeams || 10) - confirmedTeams.length) }).map((_, i) => (
            <div key={`empty-${i}`} className="px-6 py-3 flex items-center gap-3 opacity-40">
              <span className="text-sm font-mono text-[#5a5a6e] w-6">
                {String(confirmedTeams.length + i + 1).padStart(2, "0")}
              </span>
              <span className="text-lg">🎫</span>
              <span className="text-sm text-[#5a5a6e]">-</span>
            </div>
          ))}
        </div>
      </div>

      {/* Lista de Reservas */}
      {reserveTeams.length > 0 && (
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2a2a3a]">
            <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              Reservas ({reserveTeams.length})
            </h3>
          </div>
          <div className="divide-y divide-[#2a2a3a]">
            {reserveTeams.map((team) => (
              <div
                key={team.id}
                className="px-6 py-3 flex items-center justify-between hover:bg-[#1a1a24] group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">🎫</span>
                  <span className="text-sm text-[#8a8a9e]">{team.teamName}</span>
                </div>
                <button
                  onClick={() => handleRemove(team.teamName)}
                  className="p-1.5 rounded hover:bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gerenciar Times Fixos Globais */}
      <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
        <h3 className="font-bold text-[#f0f0f5] mb-4 flex items-center gap-2">
          <Pin className="w-4 h-4 text-yellow-400" />
          Times Fixos da Underground
        </h3>
        <p className="text-sm text-[#5a5a6e] mb-4">
          Times marcados como fixos aparecem automaticamente com 📌 em todos os xtreinos.
        </p>

        <div className="flex flex-wrap gap-2">
          {fixedTeams.map((teamName) => (
            <div
              key={teamName}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm"
            >
              <Pin className="w-3 h-3" />
              {teamName}
              <button
                onClick={() => handleToggleFixedGlobal(teamName)}
                className="hover:text-red-400 transition-colors"
              >
                <PinOff className="w-3 h-3" />
              </button>
            </div>
          ))}
          {fixedTeams.length === 0 && (
            <span className="text-sm text-[#5a5a6e]">Nenhum time fixo configurado</span>
          )}
        </div>
      </div>
    </div>
  );
}