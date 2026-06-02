import { useState } from "react";
import { Swords, Calendar, Clock, Shield } from "lucide-react";
import { trpc } from "@/providers/trpc";
import MainLayout from "@/layout/MainLayout";

const statusColors: Record<string, string> = {
  agendado: "bg-blue-500/10 text-blue-400",
  em_andamento: "bg-yellow-500/10 text-yellow-400",
  concluido: "bg-green-500/10 text-green-400",
  cancelado: "bg-red-500/10 text-red-400",
};

export default function Scrims() {
  const [filterModality, setFilterModality] = useState("");
  const { data: scrimsList } = trpc.scrims.list.useQuery();

  const modalities = ["", "solo", "duo", "squad", "4v4"];

  const filtered = scrimsList?.filter((s) =>
    !filterModality || s.modality === filterModality
  );

  return (
    <MainLayout>
      <div className="bg-[#12121a] border-b border-[#2a2a3a]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-2">
            <Swords className="w-8 h-8 text-red-400" />
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#f0f0f5]">Scrims</h1>
          </div>
          <p className="text-[#8a8a9e]">Partidas de treino entre equipes</p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex gap-2 mb-8">
          {modalities.map((m) => (
            <button
              key={m}
              onClick={() => setFilterModality(m)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterModality === m
                  ? "bg-red-500 text-white"
                  : "bg-[#1a1a24] text-[#8a8a9e] hover:text-[#f0f0f5] border border-[#2a2a3a]"
              }`}
            >
              {m === "" ? "Todos" : m.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Scrims List */}
        <div className="space-y-4">
          {filtered?.map((scrim) => (
            <div
              key={scrim.id}
              className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6 hover:border-[#3a3a4e] transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-center min-w-[100px]">
                    <p className="text-lg font-bold text-[#f0f0f5]">{scrim.team1Name ?? "TBD"}</p>
                    {scrim.team1Tag && <p className="text-xs text-[#5a5a6e]">[{scrim.team1Tag}]</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-[#1a1a24] border border-[#2a2a3a] flex items-center justify-center">
                      <Swords className="w-5 h-5 text-red-400" />
                    </div>
                  </div>
                  <div className="text-center min-w-[100px]">
                    <p className="text-lg font-bold text-[#f0f0f5]">{scrim.team2Name ?? "TBD"}</p>
                    {scrim.team2Tag && <p className="text-xs text-[#5a5a6e]">[{scrim.team2Tag}]</p>}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-sm text-[#8a8a9e]">
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {scrim.date}</span>
                  </div>
                  <div className="text-sm text-[#8a8a9e]">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {scrim.time}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[scrim.status] ?? "bg-gray-500/10 text-gray-400"}`}>
                    {scrim.status === "agendado" ? "Agendado" : scrim.status === "em_andamento" ? "Ao Vivo" : scrim.status === "concluido" ? "Concluido" : scrim.status}
                  </span>
                  {scrim.modality && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#1a1a24] text-[#8a8a9e] border border-[#2a2a3a]">
                      {scrim.modality.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              {scrim.result && (
                <div className="mt-4 pt-4 border-t border-[#2a2a3a]">
                  <p className="text-sm text-[#8a8a9e]">
                    <span className="text-green-400 font-medium">Resultado:</span> {scrim.result}
                  </p>
                </div>
              )}
            </div>
          ))}

          {filtered?.length === 0 && (
            <div className="text-center py-16 text-[#5a5a6e]">
              <Shield className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">Nenhum scrim encontrado</p>
              <p className="text-sm mt-1">Nao ha scrims com os filtros selecionados</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
