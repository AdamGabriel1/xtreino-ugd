import { useState } from "react";
import {
  Dumbbell,
  Trophy,
  BarChart3,
  Users,
  CalendarDays,
  Calendar,
} from "lucide-react";
import MainLayout from "@/layout/MainLayout";
import XTreinosTab from "./components/XTreinosTab";
import JogadoresTab from "./Jogadores/JogadoresTab";
import RankingGeralTab from "./components/RankingGeralTab";
import RankingMensalTab from "./components/RankingMensalTab";
import RankingSemanalTab from "./components/RankingSemanalTab";

// ============================================================
// TIPOS
// ============================================================
type TabKey = "xtreinos" | "geral" | "mensal" | "semanal" | "jogadores";

interface TabConfig {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
  description: string;
}

// ============================================================
// CONFIGURACAO DAS ABAS
// ============================================================
const TABS: TabConfig[] = [
  {
    key: "xtreinos",
    label: "X-Treinos",
    icon: <Dumbbell className="w-4 h-4" />,
    description: "Classificacao completa dos x-treinos",
  },
  {
    key: "geral",
    label: "Ranking Geral",
    icon: <Trophy className="w-4 h-4" />,
    description: "Ranking acumulado de todas as edicoes",
  },
  {
    key: "mensal",
    label: "Ranking Mensal",
    icon: <CalendarDays className="w-4 h-4" />,
    description: "Ranking consolidado por mes",
  },
  {
    key: "semanal",
    label: "Ranking Semanal",
    icon: <Calendar className="w-4 h-4" />,
    description: "Ranking consolidado por semana",
  },
  {
    key: "jogadores",
    label: "Jogadores",
    icon: <Users className="w-4 h-4" />,
    description: "Estatisticas individuais",
  },
];

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function Rankings() {
  const [activeTab, setActiveTab] = useState<TabKey>("xtreinos");

  const activeTabConfig = TABS.find((t) => t.key === activeTab)!;

  return (
    <MainLayout>
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="bg-[#12121a] border-b border-[#2a2a3a] -mx-4 lg:-mx-8 px-4 lg:px-8 py-12 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-8 h-8 text-emerald-400" />
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#f0f0f5]">
              Rankings
            </h1>
          </div>
          <p className="text-[#8a8a9e]">
            {activeTabConfig.description}
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-1 mb-6">
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
                      : "text-[#5a5a6e] hover:text-[#f0f0f5] hover:bg-[#1a1a24]"
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
          {activeTab === "semanal" && <RankingSemanalTab />}
          {activeTab === "jogadores" && <JogadoresTab />}
        </div>
      </div>
    </MainLayout>
  );
}