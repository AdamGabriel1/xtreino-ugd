import { useState } from "react";
import {
  Dumbbell,
  CalendarDays,
  BarChart3,
  Target,
  Trophy,
  Calendar,
} from "lucide-react";
import AdminLayout from "@/layout/AdminLayout";
import XTreinosList from "./xtreinos/List";
import XTreinosResults from "./xtreinos/Results";
import XTreinosPlayers from "./xtreinos/Players";
import XTreinosRanking from "./xtreinos/Ranking";
import XTreinosSchedule from "./xtreinos/Schedule";

export type TabType = "list" | "results" | "players" | "ranking" | "schedule";

export default function AdminXTreinos() {
  const [activeTab, setActiveTab] = useState<TabType>("list");

  const tabs = [
    { id: "list" as TabType, label: "Xtreinos", icon: CalendarDays },
    { id: "results" as TabType, label: "Resultados", icon: BarChart3 },
    { id: "players" as TabType, label: "Jogadores", icon: Target },
    { id: "ranking" as TabType, label: "Ranking", icon: Trophy },
    { id: "schedule" as TabType, label: "Agenda", icon: Calendar },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-[#12121a] border-b border-[#2a2a3a]">
          <div className="py-8">
            <div className="flex items-center gap-3 mb-2">
              <Dumbbell className="w-8 h-8 text-green-400" />
              <h1 className="text-3xl md:text-4xl font-extrabold text-[#f0f0f5]">
                Admin XTreinos Underground
              </h1>
            </div>
            <p className="text-[#8a8a9e]">
              Gerencie xtreinos, resultados, jogadores, agenda e ranking
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-green-500/10 text-green-400 border border-green-500/20"
                    : "bg-[#1a1a24] text-[#8a8a9e] border border-[#2a2a3a] hover:text-[#f0f0f5]"
                }`}
              >
                <Icon className="w-4 h-4 inline mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === "list" && <XTreinosList />}
        {activeTab === "results" && <XTreinosResults />}
        {activeTab === "players" && <XTreinosPlayers />}
        {activeTab === "ranking" && <XTreinosRanking />}
        {activeTab === "schedule" && <XTreinosSchedule />}
      </div>
    </AdminLayout>
  );
}