"use client";

import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { trpc } from "@/providers/trpc";
import type { ScrimMode } from "@/types/scrims";

interface ScrimFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultMode?: ScrimMode;
}

interface RoundData {
  tempId: number;
  value: number; // Posição (BR) ou Score da Rodada (MME)
  players: PlayerData[];
}

interface PlayerData {
  tempId: number;
  name: string;
  kills: number;
  assists: number;
  deaths: number;
  damage: number;
  mvp: boolean;
}

export function ScrimFormModal({ isOpen, onClose, onSuccess, defaultMode = "br" }: ScrimFormModalProps) {
  const [mode, setMode] = useState<ScrimMode>(defaultMode);
  const [date, setDate] = useState("");
  const [modality, setModality] = useState("squad");
  const [team1Name, setTeam1Name] = useState("");
  const [team2Name, setTeam2Name] = useState("");
  
  // O estado agora é um ARRAY de rodadas. Começa vazio.
  const [rounds, setRounds] = useState<RoundData[]>([]);

  const createScrim = trpc.scrims.create.useMutation();
  const createResults = trpc.scrims.createResults.useMutation();
  const createPlayerStats = trpc.scrims.createPlayerStats.useMutation();

  if (!isOpen) return null;

  function createEmptyPlayers(): PlayerData[] {
    // Se for 4v4, cria 4 slots. Se não, cria 0 (deixando livre adição).
    return mode === "mme" && modality === "4v4" ? Array.from({ length: 4 }, (_, i) => ({ tempId: Date.now() + i, name: "", kills: 0, assists: 0, deaths: 0, damage: 0, mvp: false })) : [];
  }

  function addRound() {
    setRounds(prev => [...prev, { tempId: Date.now(), value: 0, players: createEmptyPlayers() }]);
  }

  function removeRound(tempId: number) {
    setRounds(prev => prev.filter(r => r.tempId !== tempId));
  }

  function updateRoundValue(tempId: number, value: number) {
    setRounds(prev => prev.map(r => r.tempId === tempId ? { ...r, value } : r));
  }

  function addPlayerToRound(roundTempId: number) {
    setRounds(prev => prev.map(r => {
      if (r.tempId === roundTempId) return { ...r, players: [...r.players, { tempId: Date.now(), name: "", kills: 0, assists: 0, deaths: 0, damage: 0, mvp: false }] };
      return r;
    }));
  }

  function updatePlayerInRound(roundTempId: number, playerTempId: number, field: keyof PlayerData, val: string | number | boolean) {
    setRounds(prev => prev.map(r => {
      if (r.tempId === roundTempId) return { ...r, players: r.players.map(p => p.tempId === playerTempId ? { ...p, [field]: val } : p) };
      return r;
    }));
  }

  function removePlayerFromRound(roundTempId: number, playerTempId: number) {
    setRounds(prev => prev.map(r => {
      if (r.tempId === roundTempId) return { ...r, players: r.players.filter(p => p.tempId !== playerTempId) };
      return r;
    }));
  }

  async function handleSubmit() {
    if (!team1Name || !date || rounds.length === 0) return alert("Preencha Data, Time 1 e adicione ao menos 1 queda.");
    try {
      const scrim = await createScrim.mutateAsync({
        name: `Scrim ${modality.toUpperCase()} ${mode.toUpperCase()} — ${team1Name} vs ${team2Name || "TBD"}`,
        date, 
        time, 
        modality, 
        mode, 
        status: "concluido",
        result: rounds.map(r => r.value).join(" / ")
      });
      
      // 1. Salva Resultados dos Times
      const roundsPayload = rounds.map((r, i) => ({ roundNumber: i + 1, value: r.value }));
      await createResults.mutateAsync({ scrimId: scrim.id, date, teamName: team1Name, rounds: roundsPayload });
      if (team2Name) await createResults.mutateAsync({ scrimId: scrim.id, date, teamName: team2Name, rounds: roundsPayload });

      // 2. Salva Stats dos Jogadores por Round
      for (let i = 0; i < rounds.length; i++) {
        const round = rounds[i];
        const roundPayload = { roundNumber: i + 1, kills: 0, assists: 0, deaths: 0, damage: 0, mvp: false, score: round.value };
        
        for (const p of round.players) {
          if (!p.name) continue;
          const pPayload = { ...roundPayload, kills: p.kills, assists: p.assists, deaths: p.deaths, damage: p.damage, mvp: p.mvp };
          await createPlayerStats.mutateAsync({
            scrimId: scrim.id, date, teamName: team1Name, playerName: p.name,
            rounds: [pPayload],
            totalKills: p.kills, totalAssists: p.assists, totalDeaths: p.deaths, totalDamage: p.damage, totalMvp: p.mvp ? 1 : 0
          });
        }
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar. Verifique o console.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a3a] sticky top-0 bg-[#12121a] z-10">
          <div>
            <h2 className="text-xl font-bold text-[#f0f0f5]">Nova Scrim</h2>
            <p className="text-xs text-[#5a5a6e]">Adicione as quedas dinamicamente abaixo</p>
          </div>
          <button onClick={onClose} className="text-[#5a5a6e] hover:text-[#f0f0f5]"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-6">
          {/* Info Básica */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="text-xs text-[#5a5a6e] block mb-1">Modo</label>
              <select value={mode} onChange={e => setMode(e.target.value as ScrimMode)} className="w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-3 py-2 text-sm text-[#f0f0f5]">
                <option value="br">BR (Posição)</option>
                <option value="mme">MME (Rounds)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-[#5a5a6e] block mb-1">Modalidade</label>
              <select value={modality} onChange={e => setModality(e.target.value)} className="w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-3 py-2 text-sm text-[#f0f0f5]">
                <option value="solo">Solo</option><option value="duo">Duo</option><option value="squad">Squad</option><option value="4v4">4v4</option><option value="5v5">5v5</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-[#5a5a6e] block mb-1">Data</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-3 py-2 text-sm text-[#f0f0f5]" />
            </div>
            <div>
              <label className="text-xs text-[#5a5a6e] block mb-1">Time 1</label>
              <input type="text" value={team1Name} onChange={e => setTeam1Name(e.target.value)} placeholder="Obrigatório" className="w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-3 py-2 text-sm text-[#f0f0f5]" />
            </div>
            <div>
              <label className="text-xs text-[#5a5a6e] block mb-1">Time 2</label>
              <input type="text" value={team2Name} onChange={e => setTeam2Name(e.target.value)} placeholder="Opcional" className="w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-3 py-2 text-sm text-[#f0f0f5]" />
            </div>
          </div>

          {/* Botão Mágico de Adicionar Quedas */}
          <button onClick={addRound} className="w-full py-3 border-2 border-dashed border-[#2a2a3a] rounded-xl text-sm text-[#5a5a6e] hover:border-emerald-500/50 hover:text-emerald-400 transition-all flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Adicionar Queda (Q{rounds.length + 1})
          </button>

          {/* Rodadas Dinâmicas */}
          {rounds.map((round, idx) => (
            <div key={round.tempId} className="bg-[#1a1a24] rounded-xl border border-[#2a2a3a] p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">Q{idx + 1}</span>
                  <input
                    type="number"
                    value={round.value || ""}
                    onChange={e => updateRoundValue(round.tempId, parseInt(e.target.value) || 0)}
                    placeholder={mode === "br" ? "Posição (ex: 1)" : "Score/Rounds (ex: 7)"}
                    className="w-40 bg-[#12121a] border border-[#2a2a3a] rounded-lg px-3 py-1.5 text-sm text-[#f0f0f5] text-center font-bold"
                  />
                </div>
                <button onClick={() => removeRound(round.tempId)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
              </div>

              {/* Tabela de Jogadores da Queda */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="text-[#5a5a6e] text-left"><th className="py-1 pl-2">Jogador</th><th className="text-center py-1 w-16">K</th><th className="text-center py-1 w-16">A</th><th className="text-center py-1 w-16">D</th><th className="text-center py-1 w-20">DMG</th><th className="text-center py-1 w-12">MVP</th><th className="w-8"></th></tr></thead>
                  <tbody>
                    {round.players.map(p => (
                      <tr key={p.tempId} className="border-t border-[#2a2a3a]/30">
                        <td className="py-1 pl-2"><input type="text" value={p.name} onChange={e => updatePlayerInRound(round.tempId, p.tempId, "name", e.target.value)} className="w-full bg-[#12121a] border border-[#2a2a3a] rounded px-2 py-1 text-[#f0f0f5]" /></td>
                        <td className="py-1"><input type="number" value={p.kills || ""} onChange={e => updatePlayerInRound(round.tempId, p.tempId, "kills", parseInt(e.target.value) || 0)} className="w-full bg-[#12121a] border border-[#2a2a3a] rounded px-2 py-1 text-[#f0f0f5] text-center" /></td>
                        <td className="py-1"><input type="number" value={p.assists || ""} onChange={e => updatePlayerInRound(round.tempId, p.tempId, "assists", parseInt(e.target.value) || 0)} className="w-full bg-[#12121a] border border-[#2a2a3a] rounded px-2 py-1 text-[#f0f0f5] text-center" /></td>
                        <td className="py-1"><input type="number" value={p.deaths || ""} onChange={e => updatePlayerInRound(round.tempId, p.tempId, "deaths", parseInt(e.target.value) || 0)} className="w-full bg-[#12121a] border border-[#2a2a3a] rounded px-2 py-1 text-[#f0f0f5] text-center" /></td>
                        <td className="py-1"><input type="number" value={p.damage || ""} onChange={e => updatePlayerInRound(round.tempId, p.tempId, "damage", parseInt(e.target.value) || 0)} className="w-full bg-[#12121a] border border-[#2a2a3a] rounded px-2 py-1 text-[#f0f0f5] text-center" /></td>
                        <td className="py-1 text-center"><input type="checkbox" checked={p.mvp} onChange={e => updatePlayerInRound(round.tempId, p.tempId, "mvp", e.target.checked)} className="w-4 h-4 accent-emerald-500" /></td>
                        <td className="py-1 text-center"><button onClick={() => removePlayerFromRound(round.tempId, p.tempId)} className="text-red-400 hover:text-red-300"><Trash2 className="w-3 h-3" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button onClick={() => addPlayerToRound(round.tempId)} className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"><Plus className="w-3 h-3" /> Adicionar Jogador</button>
            </div>
          ))}

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#2a2a3a]">
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-[#8a8a9e] hover:text-[#f0f0f5] border border-[#2a2a3a]">Cancelar</button>
            <button onClick={handleSubmit} disabled={rounds.length === 0} className="px-6 py-2 rounded-lg text-sm bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed">Salvar Scrim ({rounds.length} Quedas)</button>
          </div>
        </div>
      </div>
    </div>
  );
}