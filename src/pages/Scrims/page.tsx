"use client";

import { useState } from "react";
import { Swords, Calendar, Trophy, Target, Plus } from "lucide-react";
import MainLayout from "@/layout/MainLayout";
import type { TabType, ScrimItem } from "./types";
import { useScrimData } from "./hooks/useScrimData";
import { AgendadosTab } from "./components/tabs/AgendadosTab";
import { HistoricoTimesTab } from "./components/tabs/HistoricoTimesTab";
import { HistoricoJogadoresTab } from "./components/tabs/HistoricoJogadoresTab";
import { ScrimDetailModal } from "./components/modals/ScrimDetailModal";
import { TeamStatsModal } from "./components/modals/TeamStatsModal";
import { PlayerStatsModal } from "./components/modals/PlayerStatsModal";
import { Scrim4v4Modal } from "./components/modals/Scrim4v4Modal";

export default function ScrimsPage() {
  const [tab, setTab] = useState<TabType>("agendados");
  const [selectedDate, setSelectedDate] = useState<string>("all");
  const [selectedScrim, setSelectedScrim] = useState<ScrimItem | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [selectedPlayer, setSelectedPlayer] = useState<{ name: string; team: string } | null>(null);
  const [isScrim4v4ModalOpen, setIsScrim4v4ModalOpen] = useState(false);

  const {
    scrimsList,
    availableDates,
    scrimTeamResults,
    scrimPlayerStats,
    scrimPlayerAllTime,
    scrimTeamAllTime,
  } = useScrimData(selectedDate);

  const normalizedScrimsList = scrimsList as ScrimItem[] | undefined;

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
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Swords className="w-8 h-8 text-emerald-400" />
                <h1 className="text-3xl md:text-4xl font-extrabold text-[#f0f0f5]">
                  Scrims
                </h1>
              </div>
              <p className="text-[#8a8a9e]">{getTitle()}</p>
            </div>
            <button
              onClick={() => setIsScrim4v4ModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nova Scrim 4v4
            </button>
          </div>
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
        {tab === "agendados" && (
          <AgendadosTab
            scrimsList={normalizedScrimsList}
            onScrimClick={setSelectedScrim}
          />
        )}

        {tab === "historico-times" && (
          <HistoricoTimesTab
            selectedDate={selectedDate}
            availableDates={availableDates}
            onDateChange={setSelectedDate}
            // scrimTeamResults may contain scrimId as null; cast to satisfy expected prop type
            scrimTeamResults={scrimTeamResults as any}
            // scrimPlayerStats may contain scrimId as null; cast to satisfy expected prop type
            scrimPlayerStats={scrimPlayerStats as any}
            scrimTeamAllTime={scrimTeamAllTime}
            onTeamClick={setSelectedTeam}
          />
        )}

        {tab === "historico-jogadores" && (
          <HistoricoJogadoresTab
            selectedDate={selectedDate}
            availableDates={availableDates}
            onDateChange={setSelectedDate}
            scrimPlayerStats={scrimPlayerStats as any}
            scrimPlayerAllTime={scrimPlayerAllTime}
            onPlayerClick={(name, team) => setSelectedPlayer({ name, team })}
          />
        )}
      </div>

      {/* Modals */}
      <ScrimDetailModal
        scrim={selectedScrim}
        isOpen={!!selectedScrim}
        onClose={() => setSelectedScrim(null)}
      />
      <TeamStatsModal
        teamName={selectedTeam}
        isOpen={!!selectedTeam}
        onClose={() => setSelectedTeam("")}
      />
      {selectedPlayer && (
        <PlayerStatsModal
          playerName={selectedPlayer.name}
          teamName={selectedPlayer.team}
          isOpen={!!selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
      <Scrim4v4Modal
        isOpen={isScrim4v4ModalOpen}
        onClose={() => setIsScrim4v4ModalOpen(false)}
        onSuccess={() => {
          // Recarregar dados após criar scrim
          window.location.reload();
        }}
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