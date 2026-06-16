"use client";

import { useState } from "react";
import { Swords, Calendar, Trophy, Target, Plus } from "lucide-react";
import MainLayout from "@/layout/MainLayout";
import type { TabType } from "./types";
import { useScrimData } from "./hooks/useScrimData";
import { AgendadosTab } from "./components/tabs/AgendadosTab";
import { HistoricoTimesTab } from "./components/tabs/HistoricoTimesTab";
import { HistoricoJogadoresTab } from "./components/tabs/HistoricoJogadoresTab";
import { Scrim4v4Modal } from "./components/modals/Scrim4v4Modal";
import { ScrimBRModal } from "./components/modals/ScrimBRModal";

export default function ScrimsPage() {
  const [tab, setTab] = useState<TabType>("agendados");
  const [selectedDate, setSelectedDate] = useState<string>("all");
  const [show4v4Modal, setShow4v4Modal] = useState(false);
  const [showBRModal, setShowBRModal] = useState(false);

  const {
    scrimsList,
    availableDates,
    scrimTeamResults,
    scrimPlayerStats,
    scrimPlayerAllTime,
    scrimTeamAllTime,
  } = useScrimData(selectedDate);

  const getTitle = () => {
    if (tab === "agendados") return "Scrims Agendados";
    if (tab === "historico-times") return "Histórico — Times";
    if (tab === "historico-jogadores") return "Histórico — Jogadores";
    return "Scrims";
  };

  return (
    <MainLayout>
      {/* Header */}
      <div className="bg-[#12121a] border-b border-[#2a2a3a]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-2">
              <Swords className="w-8 h-8 text-emerald-400" />
              <h1 className="text-3xl md:text-4xl font-extrabold text-[#f0f0f5]">
                Scrims
              </h1>
            </div>
            {/* Botões de adicionar */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShow4v4Modal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                4v4
              </button>
              <button
                onClick={() => setShowBRModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                BR
              </button>
            </div>
          </div>
          <p className="text-[#8a8a9e]">{getTitle()}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <TabButton
            active={tab === "agendados"}
            onClick={() => {
              setTab("agendados");
              setSelectedDate("all");
            }}
            icon={<Calendar className="w-4 h-4" />}
            label="Agendados"
          />
          <TabButton
            active={tab === "historico-times"}
            onClick={() => {
              setTab("historico-times");
              setSelectedDate("all");
            }}
            icon={<Trophy className="w-4 h-4" />}
            label="Histórico — Times"
          />
          <TabButton
            active={tab === "historico-jogadores"}
            onClick={() => {
              setTab("historico-jogadores");
              setSelectedDate("all");
            }}
            icon={<Target className="w-4 h-4" />}
            label="Histórico — Jogadores"
          />
        </div>

        {/* Tab Content */}
        {tab === "agendados" && <AgendadosTab scrimsList={scrimsList as any} />}

        {tab === "historico-times" && (
          <HistoricoTimesTab
            selectedDate={selectedDate}
            availableDates={availableDates}
            onDateChange={setSelectedDate}
            scrimTeamResults={scrimTeamResults}
            scrimPlayerStats={scrimPlayerStats}
            scrimTeamAllTime={scrimTeamAllTime}
          />
        )}

        {tab === "historico-jogadores" && (
          <HistoricoJogadoresTab
            selectedDate={selectedDate}
            availableDates={availableDates}
            onDateChange={setSelectedDate}
            scrimPlayerStats={scrimPlayerStats}
            scrimPlayerAllTime={scrimPlayerAllTime}
          />
        )}
      </div>

      {/* Modals */}
      <Scrim4v4Modal
        isOpen={show4v4Modal}
        onClose={() => setShow4v4Modal(false)}
      />
      <ScrimBRModal
        isOpen={showBRModal}
        onClose={() => setShowBRModal(false)}
      />
    </MainLayout>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
        active
          ? "bg-emerald-500 text-white"
          : "bg-[#1a1a24] text-[#8a8a9e] hover:text-[#f0f0f5] border border-[#2a2a3a]"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
