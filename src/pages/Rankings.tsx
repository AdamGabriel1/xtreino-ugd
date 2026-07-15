import { useParams, Link, Navigate } from "react-router-dom";
import {
  Dumbbell,
  Trophy,
  BarChart3,
  CalendarDays,
  Calendar,
  Swords,
  Zap,
  TrendingUp,
  Crosshair,
  Target,
  Shield,
  History,
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import XTreinosTab from "@/features/xtreinos/tabs/XTreinosTab";
import RankingGeralTab from "@/features/xtreinos/tabs/RankingGeralTab";
import RankingMensalTab from "@/features/xtreinos/tabs/RankingMensalTab";
import RankingSemanalTab from "@/features/xtreinos/tabs/RankingSemanalTab";
import RankingClasTab from "@/features/xtreinos/tabs/RankingClasTab";
import DueloTab from "@/features/xtreinos/tabs/DueloTab";
import HeadToHeadTab from "@/features/xtreinos/tabs/HeadToHeadTab";
import EvolucaoTab from "@/features/xtreinos/tabs/EvolucaoTab";
import HistoricoGeralTab from "@/features/xtreinos/tabs/HistoricoGeralTab";
import {
  PredicoesTab,
  MomentosCarousel,
  CrossfireTab,
} from "@/features/xtreinos/tabs/xtreino-ousado";

// Importando direto os componentes de Jogadores
import JogadoresXTKillsTab from "@/features/rankings/components/JogadoresXTKillsTab";
import JogadoresTab from "@/features/rankings/components/JogadoresTab";

// ============================================================
// TIPOS
// ============================================================
type TabKey = 
  | "xtreinos" 
  | "geral" 
  | "mensal" 
  | "semanal" 
  | "clas"       
  | "jogadores-xtreinos"
  | "jogadores-geral"
  | "jogadores-scrims"
  | "historico"
  | "duelo"
  | "h2h"
  | "evolucao"
  | "predicoes"
  | "crossfire";

interface TabConfig {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
  description: string;
  group: number; 
  isExternal?: boolean; 
  externalTo?: string; 
}

// ============================================================
// CONFIGURACAO DAS ABAS
// ============================================================
const TABS: TabConfig[] = [
  { key: "xtreinos", label: "X-Treinos", icon: <Dumbbell className="w-4 h-4" />, description: "Classificacao completa dos x-treinos", group: 1 },
  { key: "geral", label: "Ranking Geral", icon: <Trophy className="w-4 h-4" />, description: "Ranking acumulado de todas as edicoes", group: 1 },
  { key: "mensal", label: "Ranking Mensal", icon: <CalendarDays className="w-4 h-4" />, description: "Ranking consolidado por mes com variacao", group: 1 },
  { key: "semanal", label: "Ranking Semanal", icon: <Calendar className="w-4 h-4" />, description: "Ranking consolidado por semana", group: 1 },
  { key: "clas", label: "Ranking Clãs", icon: <Shield className="w-4 h-4" />, description: "Ranking acumulando todas as lines do mesmo clã", group: 1 },
  
  // NOVAS ABAS DE JOGADORES
  { key: "jogadores-xtreinos", label: "Jogadores XT", icon: <Dumbbell className="w-4 h-4" />, description: "Kills individuais em X-Treinos", group: 1 },
  { key: "jogadores-geral", label: "Jogadores Geral", icon: <BarChart3 className="w-4 h-4" />, description: "Estatísticas gerais individuais", group: 1 },
  { 
    key: "jogadores-scrims", 
    label: "Jogadores Scrims", 
    icon: <Swords className="w-4 h-4" />, 
    description: "Estatísticas de Scrims (MME)", 
    group: 1,
    isExternal: true, 
    externalTo: "/scrims/agendados" 
  },
  
  { key: "historico", label: "Histórico Geral", icon: <History className="w-4 h-4" />, description: "Linha do tempo unificada de todos os X-Treinos e Scrims", group: 2 },
  { 
    key: "duelo", 
    label: "Ranking Scrims", 
    icon: <Swords className="w-4 h-4" />, 
    description: "Rankings unificados dedicados exclusivamente às partidas de Scrims (MME)", 
    group: 2,
    isExternal: true, 
    externalTo: "/scrims/agendados" 
  },
  { key: "h2h", label: "Head-to-Head", icon: <Target className="w-4 h-4" />, description: "Confronto direto entre dois jogadores", group: 2 },
  { key: "evolucao", label: "Evolucao Temporal", icon: <TrendingUp className="w-4 h-4" />, description: "Grafico de linhas comparando times ao longo dos meses", group: 2 },
  
  { key: "predicoes", label: "Predicoes", icon: <Zap className="w-4 h-4" />, description: "Projecoes baseadas em media movel e tendencias", group: 3 },
  { key: "crossfire", label: "Crossfire", icon: <Crosshair className="w-4 h-4" />, description: "Historico de confrontos diretos e rivalidades entre times", group: 3 },
];

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function Rankings() {
  const { tab } = useParams<{ tab?: string }>();

  if (!tab) {
    return <Navigate to="/rankings/geral" replace />;
  }

  const activeTab: TabKey = (TABS.find(t => t.key === tab)?.key as TabKey) || "geral";
  const activeTabConfig = TABS.find((t) => t.key === activeTab)!;

  const group1Tabs = TABS.filter((t) => t.group === 1);
  const group2Tabs = TABS.filter((t) => t.group === 2);
  const group3Tabs = TABS.filter((t) => t.group === 3);

  const renderTabButton = (tabConfig: TabConfig) => {
    const isActive = activeTab === tabConfig.key;

    if (tabConfig.isExternal) {
      return (
        <Link
          to={tabConfig.externalTo!}
          key={tabConfig.key}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-[#5a5a6e] hover:text-[#f0f0f5] hover:bg-[#1a1a24]"
        >
          {tabConfig.icon}
          {tabConfig.label}
        </Link>
      );
    }

    const targetPath = `/rankings/${tabConfig.key}`;

    if (isActive) {
      return (
        <div key={tabConfig.key} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm shadow-emerald-500/5">
          {tabConfig.icon}
          {tabConfig.label}
        </div>
      );
    }

    return (
      <Link key={tabConfig.key} to={targetPath} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-[#5a5a6e] hover:text-[#f0f0f5] hover:bg-[#1a1a24]">
        {tabConfig.icon}
        {tabConfig.label}
      </Link>
    );
  };

  return (
    <MainLayout>
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="bg-[#12121a] border-b border-[#2a2a3a] -mx-4 lg:-mx-8 px-4 lg:px-8 py-12 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-8 h-8 text-emerald-400" />
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#f0f0f5]">
              Rankings & Análises
            </h1>
          </div>
          <p className="text-[#8a8a9e]">
            {activeTabConfig.description}
          </p>
        </div>

        {/* Momentos Históricos */}
        <div className="mb-6">
          <MomentosCarousel />
        </div>

        {/* Tabs Navigation Agrupada */}
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-2 mb-6 space-y-2">
          <div className="flex flex-wrap gap-1">
            {group1Tabs.map((tabConfig) => renderTabButton(tabConfig))}
          </div>

          <div className="border-t border-[#2a2a3a] pt-2 flex flex-wrap gap-1">
            {group2Tabs.map((tabConfig) => renderTabButton(tabConfig))}
          </div>

          <div className="border-t border-[#2a2a3a] pt-2 flex flex-wrap gap-1">
            {group3Tabs.map((tabConfig) => renderTabButton(tabConfig))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="pb-12">
          {activeTab === "xtreinos" && <XTreinosTab />}
          {activeTab === "geral" && <RankingGeralTab />}
          {activeTab === "mensal" && <RankingMensalTab />}
          {activeTab === "semanal" && <RankingSemanalTab />}
          {activeTab === "clas" && <RankingClasTab />}
          
          {/* Renderização das novas abas de Jogadores */}
          {activeTab === "jogadores-xtreinos" && <JogadoresXTKillsTab />}
          {activeTab === "jogadores-geral" && <JogadoresTab />}
          {/* A aba jogadores-scrims é externa, então não precisa renderizar componente aqui */}
          
          {activeTab === "historico" && <HistoricoGeralTab />}
          {activeTab === "duelo" && <DueloTab />}
          {activeTab === "h2h" && <HeadToHeadTab />}
          {activeTab === "evolucao" && <EvolucaoTab />}
          {activeTab === "predicoes" && <PredicoesTab />}
          {activeTab === "crossfire" && <CrossfireTab />}
        </div>
      </div>
    </MainLayout>
  );
}