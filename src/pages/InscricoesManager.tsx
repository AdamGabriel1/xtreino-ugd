import { useState, useMemo } from "react";
import { Plus, Trash2, Users, CheckCircle2, Clock, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import type { InscricaoEquipe, XtreinoEvento } from "@/types/inscricoes";

interface InscricoesManagerProps {
  xtreino: XtreinoEvento;
  inscricoes: InscricaoEquipe[];
  fixedTeams: string[];
  allTeams: Array<{ id: number; name: string; tag: string }> | undefined;
  onRegister: (data: { teamName: string; players: string[]; isReserve: boolean }) => void;
  onCancel: (data: { teamName: string }) => void;
  onReactivate: (data: { teamName: string; players: string[]; isReserve: boolean }) => void;
  onRemove: (data: { teamName: string }) => void;
  isPending: boolean;
  isAdmin?: boolean;
}

export function InscricoesManager({
  xtreino,
  inscricoes,
  fixedTeams,
  allTeams,
  onRegister,
  onCancel,
  onReactivate,
  onRemove,
  isPending,
  isAdmin = false,
}: InscricoesManagerProps) {
  const [newTeamName, setNewTeamName] = useState("");
  const [selectedExistingTeam, setSelectedExistingTeam] = useState("");
  const [isNewTeam, setIsNewTeam] = useState(false);
  const [playerInputs, setPlayerInputs] = useState<string[]>(["", "", "", ""]);

  const fixedSet = useMemo(() => new Set(fixedTeams.map((t) => t.toLowerCase())), [fixedTeams]);

  const confirmedTeams = useMemo(() => {
    return inscricoes
      .filter((r) => r.status === "confirmada")
      .sort((a, b) => (a.slotNumber ?? 0) - (b.slotNumber ?? 0));
  }, [inscricoes]);

  const pendingTeams = useMemo(() => {
    return inscricoes
      .filter((r) => r.status === "pendente")
      .sort((a, b) => (a.slotNumber ?? 0) - (b.slotNumber ?? 0));
  }, [inscricoes]);

  const cancelledTeams = useMemo(() => {
    return inscricoes
      .filter((r) => r.status === "cancelada")
      .sort((a, b) => (a.slotNumber ?? 0) - (b.slotNumber ?? 0));
  }, [inscricoes]);

  const availableTeams = useMemo(() => {
    if (!allTeams) return [];
    const registeredNames = new Set(inscricoes.map((r) => r.teamName.toLowerCase()));
    return allTeams.filter((t) => !registeredNames.has(t.name.toLowerCase()));
  }, [allTeams, inscricoes]);

  const handleAddPlayerInput = () => {
    if (playerInputs.length < 6) setPlayerInputs([...playerInputs, ""]);
  };

  const handlePlayerInputChange = (index: number, value: string) => {
    const newInputs = [...playerInputs];
    newInputs[index] = value;
    setPlayerInputs(newInputs);
  };

  const handleRemovePlayerInput = (index: number) => {
    if (playerInputs.length > 1) {
      setPlayerInputs(playerInputs.filter((_, i) => i !== index));
    }
  };

  const handleAddTeam = () => {
    const teamName = isNewTeam ? newTeamName.trim() : selectedExistingTeam;
    if (!teamName) {
      toast.error("Selecione ou digite um nome de time");
      return;
    }

    const players = playerInputs.map((p) => p.trim()).filter((p) => p.length > 0);
    if (players.length === 0) {
      toast.error("Adicione pelo menos um jogador");
      return;
    }

    if (players.length > 6) {
      toast.error("Máximo de 6 jogadores por equipe");
      return;
    }

    const isReserve = confirmedTeams.length >= xtreino.maxTeams;
    onRegister({ teamName, players, isReserve });
    setNewTeamName("");
    setSelectedExistingTeam("");
    setIsNewTeam(false);
    setPlayerInputs(["", "", "", ""]);
  };

  const handleCancel = (teamName: string) => {
    if (confirm(`Cancelar inscrição de "${teamName}"?`)) {
      onCancel({ teamName });
    }
  };

  const handleReactivate = (teamName: string, players: string[]) => {
    if (confirm(`Reativar inscrição de "${teamName}"?`)) {
      const isReserve = confirmedTeams.length >= xtreino.maxTeams;
      onReactivate({ teamName, players, isReserve });
    }
  };

  const handleRemove = (teamName: string) => {
    if (confirm(`Remover "${teamName}" permanentemente?`)) {
      onRemove({ teamName });
    }
  };

  const isXtreinoAberto = xtreino.status === "aberto";

  return (
    <div className="space-y-6">
      {/* Adicionar Time */}
      {isXtreinoAberto && (
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
          <h3 className="font-bold text-[#f0f0f5] mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-red-400" />
            Inscrever Equipe
          </h3>

          <div className="space-y-4">
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
                      {team.name} {fixedSet.has(team.name.toLowerCase()) ? "📌" : "🎫"}
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
            </div>

            <div>
              <label className="block text-sm text-[#8a8a9e] mb-2">Jogadores (1-6)</label>
              <div className="grid sm:grid-cols-2 gap-2">
                {playerInputs.map((player, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      value={player}
                      onChange={(e) => handlePlayerInputChange(index, e.target.value)}
                      placeholder={`Jogador ${index + 1}`}
                      className="flex-1 px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50"
                    />
                    {playerInputs.length > 1 && (
                      <button
                        onClick={() => handleRemovePlayerInput(index)}
                        className="px-2 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {playerInputs.length < 6 && (
                <button
                  onClick={handleAddPlayerInput}
                  className="mt-2 text-sm text-[#8a8a9e] hover:text-[#f0f0f5] transition-colors"
                >
                  + Adicionar jogador
                </button>
              )}
            </div>

            <button
              onClick={handleAddTeam}
              disabled={isPending}
              className="w-full px-6 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all disabled:opacity-50"
            >
              {isPending ? "Inscrevendo..." : "Inscrever Equipe"}
            </button>
          </div>
        </div>
      )}

      {/* Lista de Confirmados */}
      <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center justify-between">
          <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
            <Users className="w-4 h-4 text-green-400" />
            Confirmados ({confirmedTeams.length}/{xtreino.maxTeams})
          </h3>
        </div>

        <div className="divide-y divide-[#2a2a3a]">
          {confirmedTeams.length === 0 && (
            <div className="px-6 py-8 text-center text-[#5a5a6e]">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>Nenhuma equipe confirmada ainda</p>
            </div>
          )}

          {confirmedTeams.map((team, index) => {
            const isFixed = fixedSet.has(team.teamName.toLowerCase());
            return (
              <div key={team.id} className="px-6 py-4 hover:bg-[#1a1a24] group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-[#5a5a6e] w-6">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-lg">{isFixed ? "📌" : "🎫"}</span>
                    <div>
                      <span
                        className={`text-sm font-medium ${
                          isFixed ? "text-[#f0f0f5]" : "text-[#8a8a9e]"
                        }`}
                      >
                        {team.teamName}
                      </span>
                      {isFixed && (
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                          FIXO
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isXtreinoAberto && (
                      <button
                        onClick={() => handleCancel(team.teamName)}
                        title="Cancelar inscrição"
                        className="p-1.5 rounded hover:bg-amber-500/10 text-amber-400 transition-all"
                      >
                        <Clock className="w-4 h-4" />
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => handleRemove(team.teamName)}
                        className="p-1.5 rounded hover:bg-red-500/10 text-red-400 transition-all"
                        title="Remover permanentemente"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Jogadores da equipe */}
                <div className="mt-2 ml-12 flex flex-wrap gap-2">
                  {team.players?.map((player: string, pi: number) => (
                    <span
                      key={pi}
                      className="text-xs px-2 py-1 rounded bg-[#1a1a24] border border-[#2a2a3a] text-[#8a8a9e]"
                    >
                      {player}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Slots vazios */}
          {isXtreinoAberto &&
            Array.from({
              length: Math.max(0, xtreino.maxTeams - confirmedTeams.length),
            }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="px-6 py-3 flex items-center gap-3 opacity-30"
              >
                <span className="text-sm font-mono text-[#5a5a6e] w-6">
                  {String(confirmedTeams.length + i + 1).padStart(2, "0")}
                </span>
                <span className="text-lg">🎫</span>
                <span className="text-sm text-[#5a5a6e]">Vaga disponível</span>
              </div>
            ))}
        </div>
      </div>

      {/* Lista de Pendentes */}
      {pendingTeams.length > 0 && (
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2a2a3a]">
            <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Pendentes ({pendingTeams.length})
            </h3>
          </div>
          <div className="divide-y divide-[#2a2a3a]">
            {pendingTeams.map((team) => (
              <div
                key={team.id}
                className="px-6 py-3 flex items-center justify-between hover:bg-[#1a1a24] group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">🎫</span>
                  <span className="text-sm text-[#8a8a9e]">{team.teamName}</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleReactivate(team.teamName, team.players || [])}
                    className="p-1.5 rounded hover:bg-green-500/10 text-green-400 transition-all"
                    title="Reativar"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => handleRemove(team.teamName)}
                      className="p-1.5 rounded hover:bg-red-500/10 text-red-400 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de Cancelados */}
      {cancelledTeams.length > 0 && (
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden opacity-60">
          <div className="px-6 py-4 border-b border-[#2a2a3a]">
            <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-red-400" />
              Cancelados ({cancelledTeams.length})
            </h3>
          </div>
          <div className="divide-y divide-[#2a2a3a]">
            {cancelledTeams.map((team) => (
              <div
                key={team.id}
                className="px-6 py-3 flex items-center justify-between hover:bg-[#1a1a24] group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">🎫</span>
                  <span className="text-sm text-[#5a5a6e] line-through">
                    {team.teamName}
                  </span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleReactivate(team.teamName, team.players || [])}
                    className="p-1.5 rounded hover:bg-green-500/10 text-green-400 transition-all"
                    title="Reativar"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => handleRemove(team.teamName)}
                      className="p-1.5 rounded hover:bg-red-500/10 text-red-400 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Times Fixos */}
      <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
        <h3 className="font-bold text-[#f0f0f5] mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-yellow-400" />
          Times Fixos da Underground
        </h3>
        <p className="text-sm text-[#5a5a6e] mb-4">
          Times marcados como fixos aparecem automaticamente com 📌 em todos os
          xtreinos.
        </p>

        <div className="flex flex-wrap gap-2">
          {fixedTeams.map((teamName) => (
            <div
              key={teamName}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm"
            >
              <CheckCircle2 className="w-3 h-3" />
              {teamName}
            </div>
          ))}
          {fixedTeams.length === 0 && (
            <span className="text-sm text-[#5a5a6e]">
              Nenhum time fixo configurado
            </span>
          )}
        </div>
      </div>
    </div>
  );
}