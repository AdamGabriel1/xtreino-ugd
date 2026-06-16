"use client";

import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { trpc } from "@/providers/trpc";

interface ScrimBRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface TeamRow {
  id: number;
  teamName: string;
  q1Pos: number;
  q2Pos: number;
  q3Pos: number;
  q1Score: number;
  q2Score: number;
  q3Score: number;
}

interface PlayerRow {
  id: number;
  playerName: string;
  teamName: string;
  q1Kills: number;
  q2Kills: number;
  q3Kills: number;
}

export function ScrimBRModal({ isOpen, onClose, onSuccess }: ScrimBRModalProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("21:00");
  const [modality, setModality] = useState("squad");
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [players, setPlayers] = useState<PlayerRow[]>([]);

  const createScrim = trpc.scrims.create.useMutation();
  const createResults = trpc.scrims.createResults.useMutation();
  const createPlayerStats = trpc.scrims.createPlayerStats.useMutation();

  if (!isOpen) return null;

  function addTeam() {
    setTeams((prev) => [
      ...prev,
      {
        id: Date.now(),
        teamName: "",
        q1Pos: 0,
        q2Pos: 0,
        q3Pos: 0,
        q1Score: 0,
        q2Score: 0,
        q3Score: 0,
      },
    ]);
  }

  function removeTeam(id: number) {
    setTeams((prev) => prev.filter((t) => t.id !== id));
    setPlayers((prev) => prev.filter((p) => {
      const team = teams.find((t) => t.id === id);
      return team ? p.teamName !== team.teamName : true;
    }));
  }

  function updateTeam(id: number, field: keyof TeamRow, value: string | number) {
    setTeams((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  }

  function addPlayer(teamName: string) {
    setPlayers((prev) => [
      ...prev,
      {
        id: Date.now(),
        playerName: "",
        teamName,
        q1Kills: 0,
        q2Kills: 0,
        q3Kills: 0,
      },
    ]);
  }

  function updatePlayer(id: number, field: keyof PlayerRow, value: string | number) {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  }

  function removePlayer(id: number) {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleSubmit() {
    try {
      const scrim = await createScrim.mutateAsync({
        name: `Scrim BR - ${date}`,
        date,
        time,
        modality,
        status: "concluido",
      });

      for (const team of teams) {
        await createResults.mutateAsync({
          scrimId: scrim.id,
          date,
          teamName: team.teamName,
          q1Pos: team.q1Pos || null,
          q2Pos: team.q2Pos || null,
          q3Pos: team.q3Pos || null,
          q1Score: team.q1Score || null,
          q2Score: team.q2Score || null,
          q3Score: team.q3Score || null,
        });
      }

      for (const player of players) {
        const totalKills = player.q1Kills + player.q2Kills + player.q3Kills;
        await createPlayerStats.mutateAsync({
          scrimId: scrim.id,
          date,
          teamName: player.teamName,
          playerName: player.playerName,
          q1Kills: player.q1Kills,
          q2Kills: player.q2Kills,
          q3Kills: player.q3Kills,
          totalKills,
        });
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Erro ao criar scrim BR:", err);
      alert("Erro ao criar scrim. Verifique o console.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a3a]">
          <h2 className="text-xl font-bold text-[#f0f0f5]">Nova Scrim BR (Q1/Q2/Q3)</h2>
          <button onClick={onClose} className="text-[#5a5a6e] hover:text-[#f0f0f5]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Info básica */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-[#5a5a6e] block mb-1">Data</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-3 py-2 text-sm text-[#f0f0f5]"
              />
            </div>
            <div>
              <label className="text-xs text-[#5a5a6e] block mb-1">Hora</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-3 py-2 text-sm text-[#f0f0f5]"
              />
            </div>
            <div>
              <label className="text-xs text-[#5a5a6e] block mb-1">Modalidade</label>
              <select
                value={modality}
                onChange={(e) => setModality(e.target.value)}
                className="w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-3 py-2 text-sm text-[#f0f0f5]"
              >
                <option value="solo">Solo</option>
                <option value="duo">Duo</option>
                <option value="squad">Squad</option>
              </select>
            </div>
          </div>

          {/* Times e Posições */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#f0f0f5]">Times e Posições</h3>
              <button
                onClick={addTeam}
                className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300"
              >
                <Plus className="w-3 h-3" /> Adicionar Time
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[#5a5a6e] border-b border-[#2a2a3a]">
                    <th className="text-left py-2">Time</th>
                    <th className="text-center py-2 w-20">Q1 Pos</th>
                    <th className="text-center py-2 w-20">Q1 Score</th>
                    <th className="text-center py-2 w-20">Q2 Pos</th>
                    <th className="text-center py-2 w-20">Q2 Score</th>
                    <th className="text-center py-2 w-20">Q3 Pos</th>
                    <th className="text-center py-2 w-20">Q3 Score</th>
                    <th className="text-center py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team) => (
                    <tr key={team.id} className="border-b border-[#2a2a3a]/50">
                      <td className="py-2">
                        <input
                          type="text"
                          value={team.teamName}
                          onChange={(e) => updateTeam(team.id, "teamName", e.target.value)}
                          placeholder="Nome do time"
                          className="w-full bg-[#1a1a24] border border-[#2a2a3a] rounded px-2 py-1 text-[#f0f0f5]"
                        />
                      </td>
                      <td className="py-2">
                        <input
                          type="number"
                          value={team.q1Pos}
                          onChange={(e) => updateTeam(team.id, "q1Pos", parseInt(e.target.value) || 0)}
                          className="w-full bg-[#1a1a24] border border-[#2a2a3a] rounded px-2 py-1 text-[#f0f0f5] text-center"
                        />
                      </td>
                      <td className="py-2">
                        <input
                          type="number"
                          value={team.q1Score}
                          onChange={(e) => updateTeam(team.id, "q1Score", parseInt(e.target.value) || 0)}
                          className="w-full bg-[#1a1a24] border border-[#2a2a3a] rounded px-2 py-1 text-[#f0f0f5] text-center"
                        />
                      </td>
                      <td className="py-2">
                        <input
                          type="number"
                          value={team.q2Pos}
                          onChange={(e) => updateTeam(team.id, "q2Pos", parseInt(e.target.value) || 0)}
                          className="w-full bg-[#1a1a24] border border-[#2a2a3a] rounded px-2 py-1 text-[#f0f0f5] text-center"
                        />
                      </td>
                      <td className="py-2">
                        <input
                          type="number"
                          value={team.q2Score}
                          onChange={(e) => updateTeam(team.id, "q2Score", parseInt(e.target.value) || 0)}
                          className="w-full bg-[#1a1a24] border border-[#2a2a3a] rounded px-2 py-1 text-[#f0f0f5] text-center"
                        />
                      </td>
                      <td className="py-2">
                        <input
                          type="number"
                          value={team.q3Pos}
                          onChange={(e) => updateTeam(team.id, "q3Pos", parseInt(e.target.value) || 0)}
                          className="w-full bg-[#1a1a24] border border-[#2a2a3a] rounded px-2 py-1 text-[#f0f0f5] text-center"
                        />
                      </td>
                      <td className="py-2">
                        <input
                          type="number"
                          value={team.q3Score}
                          onChange={(e) => updateTeam(team.id, "q3Score", parseInt(e.target.value) || 0)}
                          className="w-full bg-[#1a1a24] border border-[#2a2a3a] rounded px-2 py-1 text-[#f0f0f5] text-center"
                        />
                      </td>
                      <td className="py-2 text-center">
                        <button
                          onClick={() => removeTeam(team.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Jogadores */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#f0f0f5]">Jogadores</h3>
              <span className="text-xs text-[#5a5a6e]">
                {players.length} jogadores
              </span>
            </div>

            {teams.map((team) => (
              <div key={team.id} className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-emerald-400 font-medium">
                    {team.teamName || "Time sem nome"}
                  </p>
                  <button
                    onClick={() => addPlayer(team.teamName)}
                    className="text-xs text-emerald-400 hover:text-emerald-300"
                  >
                    + Jogador
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-[#5a5a6e]">
                        <th className="text-left py-1">Jogador</th>
                        <th className="text-center py-1 w-16">Q1 K</th>
                        <th className="text-center py-1 w-16">Q2 K</th>
                        <th className="text-center py-1 w-16">Q3 K</th>
                        <th className="text-center py-1 w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {players
                        .filter((p) => p.teamName === team.teamName)
                        .map((player) => (
                          <tr key={player.id}>
                            <td className="py-1">
                              <input
                                type="text"
                                value={player.playerName}
                                onChange={(e) =>
                                  updatePlayer(player.id, "playerName", e.target.value)
                                }
                                placeholder="Nome"
                                className="w-full bg-[#1a1a24] border border-[#2a2a3a] rounded px-2 py-1 text-[#f0f0f5]"
                              />
                            </td>
                            <td className="py-1">
                              <input
                                type="number"
                                value={player.q1Kills}
                                onChange={(e) =>
                                  updatePlayer(player.id, "q1Kills", parseInt(e.target.value) || 0)
                                }
                                className="w-full bg-[#1a1a24] border border-[#2a2a3a] rounded px-2 py-1 text-[#f0f0f5] text-center"
                              />
                            </td>
                            <td className="py-1">
                              <input
                                type="number"
                                value={player.q2Kills}
                                onChange={(e) =>
                                  updatePlayer(player.id, "q2Kills", parseInt(e.target.value) || 0)
                                }
                                className="w-full bg-[#1a1a24] border border-[#2a2a3a] rounded px-2 py-1 text-[#f0f0f5] text-center"
                              />
                            </td>
                            <td className="py-1">
                              <input
                                type="number"
                                value={player.q3Kills}
                                onChange={(e) =>
                                  updatePlayer(player.id, "q3Kills", parseInt(e.target.value) || 0)
                                }
                                className="w-full bg-[#1a1a24] border border-[#2a2a3a] rounded px-2 py-1 text-[#f0f0f5] text-center"
                              />
                            </td>
                            <td className="py-1 text-center">
                              <button
                                onClick={() => removePlayer(player.id)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-[#8a8a9e] hover:text-[#f0f0f5] border border-[#2a2a3a]"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 rounded-lg text-sm bg-emerald-500 text-white hover:bg-emerald-600"
            >
              Salvar Scrim BR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}