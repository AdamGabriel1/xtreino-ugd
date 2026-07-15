import { Navigate, Link } from "react-router-dom";
import { Users, Dumbbell, BarChart3, Swords } from "lucide-react";
import JogadoresXTKillsTab from "@/features/rankings/components/JogadoresXTKillsTab";
import JogadoresTab from "@/features/rankings/components/JogadoresTab";

type SubTabKey = "xtreinos" | "geral" | "scrims";

interface SubTabConfig {
  key: SubTabKey;
  label: string;
  icon: React.ReactNode;
}

const SUBTABS: SubTabConfig[] = [
  { key: "xtreinos", label: "Kills em X-Treinos", icon: <Dumbbell className="w-4 h-4" /> },
  { key: "geral", label: "Ranking Geral", icon: <BarChart3 className="w-4 h-4" /> },
  { key: "scrims", label: "Scrims (MME)", icon: <Swords className="w-4 h-4" /> },
];

export default function JogadoresPage({ initialSubTab }: { initialSubTab?: string }) {
  const activeSubTab: SubTabKey =
    (SUBTABS.find((t) => t.key === initialSubTab)?.key as SubTabKey) || "xtreinos";

  if (!initialSubTab) {
    return <Navigate to="/rankings/jogadores/xtreinos" replace />;
  }

  return (
    <div className="space-y-6">
      {/* Header fixo da página de Jogadores */}
      <div className="bg-[#0a0a0f] border-b border-[#2a2a3a] -mx-4 lg:-mx-8 px-4 lg:px-8 py-8 mb-2">
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-8 h-8 text-green-400" />
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#f0f0f5]">
            Ranking de Jogadores
          </h1>
        </div>
        <p className="text-[#8a8a9e]">
          Estatísticas detalhadas, kills e classificação dos jogadores
        </p>
      </div>

      {/* Sub-Abas */}
      <div className="flex flex-wrap gap-2 pt-2">
        {SUBTABS.map((tab) => {
          const isActive = activeSubTab === tab.key;
          const path = `/rankings/jogadores/${tab.key}`;

          return isActive ? (
            <div
              key={tab.key}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm shadow-emerald-500/5"
            >
              {tab.icon}
              {tab.label}
            </div>
          ) : (
            <Link
              key={tab.key}
              to={path}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-[#5a5a6e] hover:text-[#f0f0f5] hover:bg-[#1a1a24]"
            >
              {tab.icon}
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Conteúdo da Sub-aba */}
      <div>
        {activeSubTab === "xtreinos" && <JogadoresXTKillsTab />}
        {activeSubTab === "geral" && <JogadoresTab />}
        {activeSubTab === "scrims" && <RedirectToScrimsHub />}
      </div>
    </div>
  );
}

function RedirectToScrimsHub() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 bg-[#12121a] rounded-xl border border-[#2a2a3a] p-8">
      <Swords className="w-12 h-12 text-red-400" />
      <p className="text-[#8a8a9e] text-lg text-center">
        As estatísticas de Scrims foram movidas para o Hub dedicado.
      </p>
      <Link
        to="/rankings/scrims/agendados"
        className="px-6 py-3 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
      >
        Ir para Ranking de Scrims
      </Link>
    </div>
  );
}