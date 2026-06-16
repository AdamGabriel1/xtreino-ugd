"use client";

import { useState } from "react";
import { Calendar, Clock, Shield, Swords, Eye, Target, Users } from "lucide-react";
import { type ScrimItem, STATUS_COLORS, STATUS_LABELS } from "../../types";
import { EmptyState } from "../EmptyState";

interface AgendadosTabProps {
  scrimsList?: ScrimItem[];
  onScrimClick?: (scrim: ScrimItem) => void;
}

export function AgendadosTab({ scrimsList, onScrimClick }: AgendadosTabProps) {
  const [filterModality, setFilterModality] = useState("");
  const modalities = ["", "solo", "duo", "squad", "4v4", "5v5"];

  const filtered = scrimsList?.filter(
    (s) => !filterModality || s.modality === filterModality
  );

  return (
    <>
      {/* Filtro de modalidade */}
      <div className="flex flex-wrap gap-2 mb-8">
        {modalities.map((m) => (
          <button
            key={m}
            onClick={() => setFilterModality(m)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterModality === m
                ? "bg-emerald-500 text-white"
                : "bg-[#1a1a24] text-[#8a8a9e] hover:text-[#f0f0f5] border border-[#2a2a3a]"
            }`}
          >
            {m === "" ? "Todos" : m.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Lista de scrims */}
      <div className="space-y-4">
        {filtered?.map((scrim) => (
          <ScrimCard
            key={scrim.id}
            scrim={scrim}
            onClick={() => onScrimClick?.(scrim)}
          />
        ))}

        {filtered?.length === 0 && (
          <EmptyState
            icon={<Shield className="w-12 h-12" />}
            title="Nenhum scrim encontrado"
            subtitle="Não há scrims com os filtros selecionados"
          />
        )}
      </div>
    </>
  );
}

function ScrimCard({ scrim, onClick }: { scrim: ScrimItem; onClick?: () => void }) {
  const isBR = scrim.mode === "br";
  const isMME = scrim.mode === "mme";

  return (
    <div
      onClick={onClick}
      className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6 hover:border-[#3a3a4e] hover:bg-[#1a1a24] transition-all cursor-pointer group"
    >
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="text-center min-w-[100px]">
            <p className="text-lg font-bold text-[#f0f0f5]">{scrim.team1Name ?? "TBD"}</p>
            {scrim.team1Tag && <p className="text-xs text-[#5a5a6e]">[{scrim.team1Tag}]</p>}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#1a1a24] border border-[#2a2a3a] flex items-center justify-center group-hover:border-emerald-500/30 transition-colors">
              <Swords className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div className="text-center min-w-[100px]">
            <p className="text-lg font-bold text-[#f0f0f5]">{scrim.team2Name ?? "TBD"}</p>
            {scrim.team2Tag && <p className="text-xs text-[#5a5a6e]">[{scrim.team2Tag}]</p>}
          </div>
        </div>

        <div className="flex items-center gap-6 flex-wrap">
          {scrim.date && (
            <div className="text-sm text-[#8a8a9e]">
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {scrim.date}</span>
            </div>
          )}
          {scrim.time && (
            <div className="text-sm text-[#8a8a9e]">
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {scrim.time}</span>
            </div>
          )}
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[scrim.status] ?? "bg-gray-500/10 text-gray-400"}`}>
            {STATUS_LABELS[scrim.status] ?? scrim.status}
          </span>
          {scrim.modality && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#1a1a24] text-[#8a8a9e] border border-[#2a2a3a]">
              {scrim.modality.toUpperCase()}
            </span>
          )}
          {isBR && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
              <Target className="w-3 h-3" /> BR
            </span>
          )}
          {isMME && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center gap-1">
              <Users className="w-3 h-3" /> MME
            </span>
          )}
          <Eye className="w-4 h-4 text-[#5a5a6e] opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {scrim.result && (
        <div className="mt-4 pt-4 border-t border-[#2a2a3a]">
          <p className="text-sm text-[#8a8a9e]">
            <span className="text-emerald-400 font-medium">Resultado:</span> {scrim.result}
          </p>
        </div>
      )}
    </div>
  );
}