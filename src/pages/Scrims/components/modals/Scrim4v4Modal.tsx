"use client";

import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { trpc } from "@/providers/trpc";

interface Scrim4v4ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface PlayerRow {
  id: number;
  name: string;
  kills: number;
  assists: number;
  deaths: number;
  damage: number;
  mvp: boolean;
}

interface MatchData {
  map: string;
  team1Score: number;
  team2Score: number;
  team1Players: PlayerRow[];
  team2Players: PlayerRow[];
}

export function Scrim4v4Modal({ isOpen, onClose, onSuccess }: Scrim4v4ModalProps) {
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState("21:00");
  const [team1Name, setTeam1Name] = useState("");
  const [team2Name, setTeam2Name] = useState("");
  const [matches, setMatches] = useState<MatchData[]>([
    {
      map: "",
      team1Score: 7,
      team2Score: 1,
      team1Players: createEmptyPlayers(),
      team2Players: createEmptyPlayers(),
    },
  ]);

  const createScrim = trpc.scrims.create.useMutation();
  const createResults = trpc.scrims.createResults.useMutation();
  const createPlayerStats = trpc.scrims.createPlayerStats.useMutation();

  if (!isOpen) return null;

  function createEmptyPlayers(): PlayerRow[] {
    return Array.from({ length: 4 }, (_, i) => ({
      id: i,
      name: "",
      kills: 0,
      assists: 0,
      deaths: 0,
      damage: 0,
      mvp: false,
    }));
  }

  function addMatch() {
    setMatches((prev) => [
      ...prev,
      {
        map: "",
        team1Score: 7,
        team2Score: 1,
        team1Players: createEmptyPlayers(),
        team2Players: createEmptyPlayers(),
      },
    ]);
  }

  function removeMatch(index: number) {
    setMatches((prev) => prev.filter((_, i) => i !== index));
  }

  function updateMatch(index: number, field: keyof MatchData, value: string | number) {
    setMatches((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function updatePlayer(
    matchIndex: number,
    team: "team1" | "team2",
    playerIndex: number,
    field: keyof PlayerRow,
    value: string | number | boolean
  ) {
    setMatches((prev) => {
      const next = [...prev];
      const match = { ...next[matchIndex] };
      const players = team === "team1" ? [...match.team1Players] : [...match.team2Players];
      players[playerIndex] = { ...players[playerIndex], [field]: value };
      if (team === "team1") {
        match.team1Players = players;
      } else {
        match.team2Players = players;
      }
      next[matchIndex] = match;
      return next;
    });
  }

  async function handleSubmit() {
    try {
      // 1. Criar o scrim — MME = Mata-Mata em Equipe
      const scrim = await createScrim.mutateAsync({
        name: `Scrim 4v4 MME — ${team1Name} vs ${team2Name}`,
        date,
        time,
        modality: "4v4",
        mode: "mme", // 🔥 ESSENCIAL: define o modo como MME
        status: "concluido",
        result: `${team1Name} ${matches.filter(m => m.team1Score > m.team2Score).length}-${matches.filter(m => m.team2Score > m.team1Score).length} ${team2Name}`,
      });

      // 2. Inserir resultados dos times — MME NÃO USA POSIÇÕES (qXPos = null)
      const team1Results: any = {
        scrimId: scrim.id,
        date,
        teamName: team1Name,
        // MME: posições são sempre null
        q1Pos: null,
        q2Pos: null,
        q3Pos: null,
      };
      const team2Results: any = {
        scrimId: scrim.id,
        date,
        teamName: team2Name,
        // MME: posições são sempre null
        q1Pos: null,
        q2Pos: null,
        q3Pos: null,
      };

      for (let i = 0; i < 3; i++) {
        const scoreField = i === 0 ? "q1Score" : i === 1 ? "q2Score" : "q3Score";

        if (i < matches.length) {
          const match = matches[i];
          team1Results[scoreField] = match.team1Score;
          team2Results[scoreField] = match.team2Score;
        } else {
          team1Results[scoreField] = null;
          team2Results[scoreField] = null;
        }
      }

      // Preencher q4-q7 como null para MME padrão (melhor de 3)
      for (let i = 4; i <= 7; i++) {
        team1Results[`q${i}Score`] = null;
        team2Results[`q${i}Score`] = null;
      }

      await createResults.mutateAsync(team1Results);
      await createResults.mutateAsync(team2Results);

      // 3. Inserir stats dos jogadores — MME
      for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        const killField = i === 0 ? "q1Kills" : i === 1 ? "q2Kills" : "q3Kills";
        const assistField = i === 0 ? "q1Assists" : i === 1 ? "q2Assists" : "q3Assists";
        const deathField = i === 0 ? "q1Deaths" : i === 1 ? "q2Deaths" : "q3Deaths";
        const damageField = i === 0 ? "q1Damage" : i === 1 ? "q2Damage" : "q3Damage";
        const mvpField = i === 0 ? "q1Mvp" : i === 1 ? "q2Mvp" : "q3Mvp";
        const scoreField = i === 0 ? "q1Score" : i === 1 ? "q2Score" : "q3Score";

        for (const p of match.team1Players) {
          await createPlayerStats.mutateAsync({
            scrimId: scrim.id,
            date,
            teamName: team1Name,
            playerName: p.name,
            [killField]: p.kills,
            [assistField]: p.assists,
            [deathField]: p.deaths,
            [damageField]: p.damage,
            [mvpField]: p.mvp,
            [scoreField]: match.team1Score,
            totalKills: p.kills,
            totalAssists: p.assists,
            totalDeaths: p.deaths,
            totalDamage: p.damage,
            totalMvp: p.mvp ? 1 : 0,
          });
        }

        for (const p of match.team2Players) {
          await createPlayerStats.mutateAsync({
            scrimId: scrim.id,
            date,
            teamName: team2Name,
            playerName: p.name,
            [killField]: p.kills,
            [assistField]: p.assists,
            [deathField]: p.deaths,
            [damageField]: p.damage,
            [mvpField]: p.mvp,
            [scoreField]: match.team2Score,
            totalKills: p.kills,
            totalAssists: p.assists,
            totalDeaths: p.deaths,
            totalDamage: p.damage,
            totalMvp: p.mvp ? 1 : 0,
          });
        }
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Erro ao criar scrim:", err);
      alert("Erro ao criar scrim. Verifique o console.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a3a]">
          <div>
            <h2 className="text-xl font-bold text-[#f0f0f5]">Nova Scrim 4v4</h2>
            <p className="text-xs text-orange-400 mt-1">Modo: Mata-Mata em Equipe (MME)</p>
          </div>
          <button onClick={onClose} className="text-[#5a5a6e] hover:text-[#f0f0f5]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Info básica */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              <label className="text-xs text-[#5a5a6e] block mb-1">Time 1</label>
              <input
                type="text"
                value={team1Name}
                onChange={(e) => setTeam1Name(e.target.value)}
                placeholder="Ex: UGD Threat"
                className="w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-3 py-2 text-sm text-[#f0f0f5]"
              />
            </div>
            <div>
              <label className="text-xs text-[#5a5a6e] block mb-1">Time 2</label>
              <input
                type="text"
                value={team2Name}
                onChange={(e) => setTeam2Name(e.target.value)}
                placeholder="Ex: K4F"
                className="w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-3 py-2 text-sm text-[#f0f0f5]"
              />
            </div>
          </div>

          {/* Partidas */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#f0f0f5]">Partidas (Melhor de 3)</h3>
              <button
                onClick={addMatch}
                className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300"
              >
                <Plus className="w-3 h-3" /> Adicionar Partida
              </button>
            </div>

            {matches.map((match, matchIndex) => (
              <div key={matchIndex} className="bg-[#1a1a24] rounded-xl border border-[#2a2a3a] p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-orange-400 font-bold">Q{matchIndex + 1}</span>
                    <input
                      type="text"
                      value={match.map}
                      onChange={(e) => updateMatch(matchIndex, "map", e.target.value)}
                      placeholder="Mapa (ex: Vale Deserto)"
                      className="bg-[#12121a] border border-[#2a2a3a] rounded-lg px-3 py-1.5 text-sm text-[#f0f0f5]"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={match.team1Score}
                        onChange={(e) => updateMatch(matchIndex, "team1Score", parseInt(e.target.value) || 0)}
                        className="w-14 bg-[#12121a] border border-[#2a2a3a] rounded-lg px-2 py-1.5 text-sm text-emerald-400 text-center font-bold"
                      />
                      <span className="text-sm text-[#5a5a6e]">x</span>
                      <input
                        type="number"
                        value={match.team2Score}
                        onChange={(e) => updateMatch(matchIndex, "team2Score", parseInt(e.target.value) || 0)}
                        className="w-14 bg-[#12121a] border border-[#2a2a3a] rounded-lg px-2 py-1.5 text-sm text-red-400 text-center font-bold"
                      />
                    </div>
                  </div>
                  {matches.length > 1 && (
                    <button
                      onClick={() => removeMatch(matchIndex)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Time 1 */}
                <div className="mb-3">
                  <p className="text-xs text-emerald-400 font-medium mb-2">{team1Name || "Time 1"}</p>
                  <PlayerTable
                    players={match.team1Players}
                    onUpdate={(playerIndex, field, value) =>
                      updatePlayer(matchIndex, "team1", playerIndex, field, value)
                    }
                  />
                </div>

                {/* Time 2 */}
                <div>
                  <p className="text-xs text-red-400 font-medium mb-2">{team2Name || "Time 2"}</p>
                  <PlayerTable
                    players={match.team2Players}
                    onUpdate={(playerIndex, field, value) =>
                      updatePlayer(matchIndex, "team2", playerIndex, field, value)
                    }
                  />
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
              className="px-4 py-2 rounded-lg text-sm bg-orange-500 text-white hover:bg-orange-600"
            >
              Salvar Scrim MME
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlayerTable({
  players,
  onUpdate,
}: {
  players: PlayerRow[];
  onUpdate: (index: number, field: keyof PlayerRow, value: string | number | boolean) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-[#5a5a6e]">
            <th className="text-left py-1">Jogador</th>
            <th className="text-center py-1 w-16">Kills</th>
            <th className="text-center py-1 w-16">Assists</th>
            <th className="text-center py-1 w-16">Deaths</th>
            <th className="text-center py-1 w-20">Damage</th>
            <th className="text-center py-1 w-12">MVP</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p, i) => (
            <tr key={p.id}>
              <td className="py-1">
                <input
                  type="text"
                  value={p.name}
                  onChange={(e) => onUpdate(i, "name", e.target.value)}
                  placeholder="Nome"
                  className="w-full bg-[#12121a] border border-[#2a2a3a] rounded px-2 py-1 text-[#f0f0f5]"
                />
              </td>
              <td className="py-1">
                <input
                  type="number"
                  value={p.kills}
                  onChange={(e) => onUpdate(i, "kills", parseInt(e.target.value) || 0)}
                  className="w-full bg-[#12121a] border border-[#2a2a3a] rounded px-2 py-1 text-[#f0f0f5] text-center"
                />
              </td>
              <td className="py-1">
                <input
                  type="number"
                  value={p.assists}
                  onChange={(e) => onUpdate(i, "assists", parseInt(e.target.value) || 0)}
                  className="w-full bg-[#12121a] border border-[#2a2a3a] rounded px-2 py-1 text-[#f0f0f5] text-center"
                />
              </td>
              <td className="py-1">
                <input
                  type="number"
                  value={p.deaths}
                  onChange={(e) => onUpdate(i, "deaths", parseInt(e.target.value) || 0)}
                  className="w-full bg-[#12121a] border border-[#2a2a3a] rounded px-2 py-1 text-[#f0f0f5] text-center"
                />
              </td>
              <td className="py-1">
                <input
                  type="number"
                  value={p.damage}
                  onChange={(e) => onUpdate(i, "damage", parseInt(e.target.value) || 0)}
                  className="w-full bg-[#12121a] border border-[#2a2a3a] rounded px-2 py-1 text-[#f0f0f5] text-center"
                />
              </td>
              <td className="py-1 text-center">
                <input
                  type="checkbox"
                  checked={p.mvp}
                  onChange={(e) => onUpdate(i, "mvp", e.target.checked)}
                  className="w-4 h-4 accent-emerald-500"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}