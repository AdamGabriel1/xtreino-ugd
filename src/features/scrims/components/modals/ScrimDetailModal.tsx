"use client";

import { X, Calendar, Clock, Swords, Trophy, Target, Users, BarChart3 } from "lucide-react";
import type { ScrimItem } from "@/types/scrims";
import { formatDate } from "@/utils/formatters";

interface ScrimDetailModalProps {
  scrim: ScrimItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ScrimDetailModal({ scrim, isOpen, onClose }: ScrimDetailModalProps) {
  if (!isOpen || !scrim) return null;

  const isBR = scrim.mode === "br";
  const isMME = scrim.mode === "mme";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a3a]">
          <h2 className="text-xl font-bold text-[#f0f0f5]">Detalhes do Scrim</h2>
          <button onClick={onClose} className="text-[#5a5a6e] hover:text-[#f0f0f5] transition-colors" aria-label="Fechar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Swords className="w-7 h-7 text-emerald-400" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-[#f0f0f5]">{scrim.name}</h3>
              <div className="flex items-center gap-4 mt-1 text-sm text-[#8a8a9e] flex-wrap">
                {scrim.date && (<span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" aria-hidden="true" />{formatDate(scrim.date)}</span>)}
                {scrim.time && (<span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" aria-hidden="true" />{scrim.time}</span>)}
                {scrim.modality && (<span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#1a1a24] text-[#8a8a9e] border border-[#2a2a3a]">{scrim.modality.toUpperCase()}</span>)}
                {isBR && (<span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">Battle Royale</span>)}
                {isMME && (<span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">Mata-Mata</span>)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {["Time 1", "Time 2"].map((label, idx) => {
              const name = idx === 0 ? scrim.team1Name : scrim.team2Name;
              const tag = idx === 0 ? scrim.team1Tag : scrim.team2Tag;
              const color = idx === 0 ? "text-emerald-400" : "text-red-400";
              return (
                <div key={label} className="bg-[#1a1a24] rounded-xl border border-[#2a2a3a] p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className={`w-4 h-4 ${color}`} aria-hidden="true" />
                    <span className="text-xs text-[#5a5a6e] uppercase font-medium">{label}</span>
                  </div>
                  <p className="text-lg font-bold text-[#f0f0f5]">{name ?? "TBD"}</p>
                  {tag && <p className="text-xs text-[#5a5a6e] mt-1">[{tag}]</p>}
                </div>
              );
            })}
          </div>

          <div className="bg-[#1a1a24] rounded-xl border border-[#2a2a3a] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-400" aria-hidden="true" />
                <span className="text-sm text-[#8a8a9e]">Status</span>
              </div>
              <StatusBadge status={scrim.status} />
            </div>
          </div>

          {/* Resultado e Botão de Tela de Fim de Partida */}
          {scrim.result && (
            <div className="space-y-4">
              <div className="bg-[#1a1a24] rounded-xl border border-[#2a2a3a] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                  <span className="text-sm font-medium text-[#f0f0f5]">Resultado</span>
                </div>
                <p className="text-sm text-[#8a8a9e]">{scrim.result}</p>
              </div>
              
              <a 
                href={`/scrims/match/${scrim.id}`} // <-- CORRIGIDO AQUI: Agora usa o ID numérico real
                target="_blank"
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600/20 to-red-600/20 border border-white/10 text-white font-bold py-3 rounded-xl hover:from-blue-600/30 hover:to-red-600/30 transition-all"
              >
                <BarChart3 className="w-5 h-5" />
                Ver Tela de Fim de Partida
              </a>
            </div>
          )}

          {isBR && (
            <div className="bg-blue-500/5 rounded-xl border border-blue-500/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-blue-400" aria-hidden="true" />
                <span className="text-sm font-medium text-blue-400">Battle Royale</span>
              </div>
              <p className="text-xs text-[#5a5a6e]">Sistema de pontuação por posição nas quedas. 1º = 15pts, 2º = 12pts, 3º = 10pts...</p>
            </div>
          )}
          {isMME && (
            <div className="bg-orange-500/5 rounded-xl border border-orange-500/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Swords className="w-4 h-4 text-orange-400" aria-hidden="true" />
                <span className="text-sm font-medium text-orange-400">Mata-Mata em Equipe</span>
              </div>
              <p className="text-xs text-[#5a5a6e]">Sistema baseado em rounds ganhos. O tempo que acumular mais rounds vence a série.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = { agendado: "bg-blue-500/10 text-blue-400 border-blue-500/20", em_andamento: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", concluido: "bg-green-500/10 text-green-400 border-green-500/20", cancelado: "bg-red-500/10 text-red-400 border-red-500/20" };
  const labels: Record<string, string> = { agendado: "Agendado", em_andamento: "Ao Vivo", concluido: "Concluído", cancelado: "Cancelado" };
  return <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colors[status] ?? colors.agendado}`}>{labels[status] ?? status}</span>;
}