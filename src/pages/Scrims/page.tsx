"use client";

import { useState } from "react";
import { Swords, Calendar, Trophy, Target, BarChart3, Users } from "lucide-react";
import MainLayout from "@/layout/MainLayout";
import type { TabType, ScrimItem, ScrimMode } from "./types";
import { useScrimData } from "./hooks/useScrimData";
import { AgendadosTab } from "./components/tabs/AgendadosTab";
import { HistoricoTimesTab } from "./components/tabs/HistoricoTimesTab";
import { HistoricoJogadoresTab } from "./components/tabs/HistoricoJogadoresTab";
import { ScrimDetailModal } from "./components/modals/ScrimDetailModal";
import { TeamStatsModal } from "./components/modals/TeamStatsModal";
import { PlayerStatsModal } from "./components/modals/PlayerStatsModal";

export default function ScrimsPage() {
  const [tab, setTab] = useState<TabType>("agendados");
  const [selectedDate, setSelectedDate] = useState<string>("all");
  const [selectedMode, setSelectedMode] = useState<ScrimMode | "all">("all");
  const [selectedScrim, setSelectedScrim] = useState<ScrimItem | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [selectedPlayer, setSelectedPlayer] = useState<{ name: string; team: string } | null>(null);

  const {
    scrimsList,
    availableDates,
    scrimTeamResults,
    scrimPlayerStats,
    scrimPlayerAllTime,
    scrimTeamAllTimeBR,
    scrimTeamAllTimeMME,
  } = useScrimData(selectedDate, selectedMode);

  const normalizedScrimsList = scrimsList as ScrimItem[] | undefined;

  const getTitle = () => {
    if (tab === "agendados") return "Scrims Agendados";
    if (tab === "historico-times") return "Histórico — Times";
    if (tab === "historico-jogadores") return "Histórico — Jogadores";
    return "Scrims";
  };

  const getSubtitle = () => {
    if (selectedMode === "br") return "Battle Royale";
    if (selectedMode === "mme") return "Mata-Mata em Equipe";
    return "Todos os modos";
  };

  return (
    <MainLayout>
      {/* Header */}
      <div className="bg-[#12121a] border-b border-[#2a2a3a]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Swords className="w-8 h-8 text-emerald-400" />
                <h1 className="text-3xl md:text-4xl font-extrabold text-[#f0f0f5]">
                  Scrims
                </h1>
              </div>
              <p className="text-[#8a8a9e]">{getTitle()}</p>
              <p className="text-xs text-[#5a5a6e] mt-1">{getSubtitle()}</p>
            </div>

            {/* Mode Filter */}
            <div className="flex items-center gap-2 bg-[#1a1a24] rounded-xl p-1.5 border border-[#2a2a3a]">
              <ModeFilterButton
                active={selectedMode === "all"}
                onClick={() => setSelectedMode("all")}
                icon={<BarChart3 className="w-3.5 h-3.5" />}
                label="Todos"
              />
              <ModeFilterButton
                active={selectedMode === "br"}
                onClick={() => setSelectedMode("br")}
                icon={<Target className="w-3.5 h-3.5" />}
                label="BR"
              />
              <ModeFilterButton
                active={selectedMode === "mme"}
                onClick={() => setSelectedMode("mme")}
                icon={<Users className="w-3.5 h-3.5" />}
                label="MME"
              />
            </div>
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

        {/* Info Banner */}
        {selectedMode !== "all" && (
          <div className="mb-6 bg-[#1a1a24] border border-[#2a2a3a] rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                selectedMode === "br" ? "bg-blue-500/10" : "bg-orange-500/10"
              }`}>
                {selectedMode === "br" ? (
                  <Target className="w-4 h-4 text-blue-400" />
                ) : (
                  <Users className="w-4 h-4 text-orange-400" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#f0f0f5]">
                  {selectedMode === "br" ? "Battle Royale (BR)" : "Mata-Mata em Equipe (MME)"}
                </h3>
                <p className="text-xs text-[#5a5a6e] mt-1">
                  {selectedMode === "br"
                    ? "Sistema de pontuação por posição nas quedas. 1º lugar = 15pts, 2º = 12pts, 3º = 10pts..."
                    : "Sistema baseado em rounds ganhos. Melhor de 3, 5, 7... O time que fizer mais rounds vence a série."}
                </p>
              </div>
            </div>
          </div>
        )}

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
            selectedMode={selectedMode}
            scrimTeamResults={scrimTeamResults as any}
            scrimPlayerStats={scrimPlayerStats as any}
            scrimTeamAllTimeBR={scrimTeamAllTimeBR}
            scrimTeamAllTimeMME={scrimTeamAllTimeMME}
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

function ModeFilterButton({
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
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
        active
          ? "bg-emerald-500 text-white"
          : "text-[#8a8a9e] hover:text-[#f0f0f5]"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}