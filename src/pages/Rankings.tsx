import { useState } from "react";
import {
  Dumbbell,
  Trophy,
  BarChart3,
  Users,
  CalendarDays,
} from "lucide-react";
import MainLayout from "@/layout/MainLayout";
import XTreinosTab from "./components/XTreinosTab";

type TabKey = "xtreinos" | "geral" | "mensal" | "jogadores";

interface TabConfig {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const TABS: TabConfig[] = [
  {
    key: "xtreinos",
    label: "X-Treinos",
    icon: <Dumbbell className="w-4 h-4" />,
    description: "Classificação completa dos x-treinos",
  },
  {
    key: "geral",
    label: "Ranking Geral",
    icon: <Trophy className="w-4 h-4" />,
    description: "Ranking acumulado de todas as edições",
  },
  {
    key: "mensal",
    label: "Ranking Mensal",
    icon: <CalendarDays className="w-4 h-4" />,
    description: "Ranking por mês",
  },
  {
    key: "jogadores",
    label: "Jogadores",
    icon: <Users className="w-4 h-4" />,
    description: "Estatísticas individuais",
  },
];

function RankingGeralTab() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Trophy className="w-16 h-16 text-[#1a3a1a] mb-4" />
      <h3 className="text-xl font-bold text-[#e0f0e0] mb-2">Ranking Geral</h3>
      <p className="text-[#4a6e4a] max-w-md">
        Em breve: Ranking acumulado de todas as edições dos X-Treinos.
        Aqui você verá a pontuação total de cada time ao longo de todo o histórico.
      </p>
    </div>
  );
}

function RankingMensalTab() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <CalendarDays className="w-16 h-16 text-[#1a3a1a] mb-4" />
      <h3 className="text-xl font-bold text-[#e0f0e0] mb-2">Ranking Mensal</h3>
      <p className="text-[#4a6e4a] max-w-md">
        Em breve: Ranking consolidado por mês com destaque para o time do mês,
        evolução de posições e comparativos entre meses.
      </p>
    </div>
  );
}

function JogadoresTab() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Users className="w-16 h-16 text-[#1a3a1a] mb-4" />
      <h3 className="text-xl font-bold text-[#e0f0e0] mb-2">Estatísticas de Jogadores</h3>
      <p className="text-[#4a6e4a] max-w-md">
        Em breve: Ranking individual de jogadores, top fraggers,
        média de kills por partida e histórico pessoal.
      </p>
    </div>
  );
}

export default function Rankings() {
  const [activeTab, setActiveTab] = useState<TabKey>("xtreinos");
  const activeTabConfig = TABS.find((t) => t.key === activeTab)!;

  return (
    <MainLayout>
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="bg-[#0d1a0d] border-b border-[#1a3a1a] -mx-4 lg:-mx-8 px-4 lg:px-8 py-12 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-8 h-8 text-emerald-400" />
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#e0f0e0]">
              Rankings
            </h1>
          </div>
          <p className="text-[#6a8e6a]">
            {activeTabConfig.description}
          </p>
        </div>

        {/* Tabs Navigation — Green Theme */}
        <div className="bg-[#0d1a0d] rounded-xl border border-[#1a3a1a] p-1 mb-6">
          <div className="flex flex-wrap gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${
                    activeTab === tab.key
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "text-[#4a6e4a] hover:text-[#6a8e6a] hover:bg-[#0f1f0f]"
                  }
                `}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="pb-12">
          {activeTab === "xtreinos" && <XTreinosTab />}
          {activeTab === "geral" && <RankingGeralTab />}
          {activeTab === "mensal" && <RankingMensalTab />}
          {activeTab === "jogadores" && <JogadoresTab />}
        </div>
      </div>
    </MainLayout>
  );
}