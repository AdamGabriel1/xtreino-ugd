// ============================================================
// PÁGINA PRINCIPAL: Admin XTreinos (refatorada)
// ============================================================

import { useState } from "react";
import { CalendarDays, Target, BarChart3, Users } from "lucide-react";
import { toast } from "sonner";
import AdminLayout from "@/layout/AdminLayout";
import { trpc } from "@/providers/trpc";
import { useXTreinos } from "../../hooks/useXTreinos.js";
import type {
  XTreinoFormData,
  ResultFormData,
  PlayerFormData,
  ScheduleFormData,
  AdminTab,
  Modality,
  XTreinoStatus,
  ScheduleStatus,
} from "./types.js";

// Tabs
import { XTreinosList } from "./tabs/XTreinosList";
import { ResultsTab } from "./tabs/ResultsTab";
import { PlayersTab } from "./tabs/PlayersTab";
import { ScheduleTab } from "./tabs/ScheduleTab";
import { InscricoesTab } from "./tabs/InscricoesTab";

export default function AdminXTreinos() {
  const {
    xtreinosList,
    allResults,
    allPlayerStats,
    scheduleList,
    settings,
    allTeams,
    create,
    update,
    remove,
    addResult,
    addPlayerStats,
    createSchedule,
    generateMonthSchedule,
    registerTeam,
    unregisterTeam,
    toggleFixedTeam,
    isLoading,
  } = useXTreinos();

  // Tabs
  const [activeTab, setActiveTab] = useState<AdminTab>("list");

  // XTreino form state
  const [showXtForm, setShowXtForm] = useState(false);
  const [editingXt, setEditingXt] = useState<number | null>(null);
  const [xtForm, setXtForm] = useState<XTreinoFormData>({
    name: "",
    date: "",
    timeMx: "",
    timeBr: "21:00",
    modality: "squad" as Modality,
    maxTeams: 20,
    rules: "",
    discordLink: "",
    whatsappLink: "",
    status: "aberto" as XTreinoStatus,
  });

  // Result form state
  const [showResultForm, setShowResultForm] = useState(false);
  const [resultForm, setResultForm] = useState<ResultFormData>({
    xtreinoId: 0,
    date: "",
    teamName: "",
    q1Pos: 0,
    q2Pos: 0,
    q3Pos: 0,
    totalPoints: 0,
  });

  // Player form state
  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [playerForm, setPlayerForm] = useState<PlayerFormData>({
    xtreinoId: 0,
    date: "",
    teamName: "",
    playerName: "",
    q1Kills: 0,
    q2Kills: 0,
    q3Kills: 0,
    totalKills: 0,
  });

  // Schedule form state
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleForm, setScheduleForm] = useState<ScheduleFormData>({
    date: "",
    dayOfWeek: "",
    timeBr: "21:00",
    status: "scheduled" as ScheduleStatus,
    notes: "",
  });

  // Selected xtreino for results/players/inscricoes tabs
  const [selectedXtForResults, setSelectedXtForResults] = useState<number | null>(null);
  const [selectedXtForPlayers, setSelectedXtForPlayers] = useState<number | null>(null);
  const [selectedXtForInscricoes, setSelectedXtForInscricoes] = useState<number | null>(null);

  // Buscar detalhes do xtreino selecionado
  const { data: xtDetailResults } = trpc.xtreinos.getById.useQuery(
    { id: selectedXtForResults ?? 0 },
    { enabled: selectedXtForResults !== null }
  );
  const { data: xtDetailPlayers } = trpc.xtreinos.getById.useQuery(
    { id: selectedXtForPlayers ?? 0 },
    { enabled: selectedXtForPlayers !== null }
  );
  const { data: xtDetailInscricoes } = trpc.xtreinos.getById.useQuery(
    { id: selectedXtForInscricoes ?? 0 },
    { enabled: selectedXtForInscricoes !== null }
  );

  // --- Helpers: cast dados do tRPC para os tipos strictos ---
  const castXTreinos = (data: typeof xtreinosList): import("./types").XTreino[] | undefined => {
    if (!data) return undefined;
    return data.map((x) => ({
      ...x,
      modality: x.modality as Modality,
      status: x.status as XTreinoStatus,
    }));
  };

  const castResults = (data: typeof allResults): import("./types").XTreinoResult[] | undefined => {
    if (!data) return undefined;
    return data.map((r) => ({
      ...r,
      xtreinoId: r.xtreinoId ?? 0,
    }));
  };

  const castPlayerStats = (data: typeof allPlayerStats): import("./types").PlayerStat[] | undefined => {
    if (!data) return undefined;
    return data.map((p) => ({
      ...p,
      xtreinoId: p.xtreinoId ?? 0,
    }));
  };

  const castSchedule = (data: typeof scheduleList): import("./types").ScheduleItem[] | undefined => {
    if (!data) return undefined;
    return data.map((s) => ({
      ...s,
      status: s.status as ScheduleStatus,
    }));
  };

  const castXtDetail = (data: typeof xtDetailResults): import("./types").XTreino | null => {
    if (!data) return null;
    return {
      ...data,
      modality: (data as any).modality as Modality,
      status: (data as any).status as XTreinoStatus,
      results: (data as any).results,
      playerStats: (data as any).playerStats,
      registrations: (data as any).registrations,
    };
  };

  // --- Handlers XTreino ---
  const resetXtForm = () =>
    setXtForm({
      name: "",
      date: "",
      timeMx: "",
      timeBr: "21:00",
      modality: "squad" as Modality,
      maxTeams: 20,
      rules: "",
      discordLink: "",
      whatsappLink: "",
      status: "aberto" as XTreinoStatus,
    });

  const handleEditXt = (x: import("./types").XTreino) => {
    setEditingXt(x.id);
    setXtForm({
      name: x.name,
      date: x.date,
      timeMx: x.timeMx ?? "",
      timeBr: x.timeBr ?? "21:00",
      modality: x.modality,
      maxTeams: x.maxTeams,
      rules: x.rules ?? "",
      discordLink: x.discordLink ?? "",
      whatsappLink: x.whatsappLink ?? "",
      status: x.status,
    });
    setShowXtForm(true);
  };

  const handleSubmitXt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!xtForm.name || !xtForm.date) {
      toast.error("Nome e data sao obrigatorios");
      return;
    }
    if (editingXt) update.mutate({ id: editingXt, ...xtForm });
    else create.mutate(xtForm);
    setShowXtForm(false);
    setEditingXt(null);
    resetXtForm();
  };

  const handleDeleteXt = (id: number) => {
    remove.mutate({ id });
  };

  // --- Handlers Result ---
  const resetResultForm = () =>
    setResultForm({
      xtreinoId: 0,
      date: "",
      teamName: "",
      q1Pos: 0,
      q2Pos: 0,
      q3Pos: 0,
      totalPoints: 0,
    });

  const handleSubmitResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resultForm.teamName || !resultForm.date) {
      toast.error("Time e data sao obrigatorios");
      return;
    }
    // 🆕 Usa o xtreinoId selecionado se o form não tiver
    const xtreinoId = selectedXtForResults ?? resultForm.xtreinoId;
    if (!xtreinoId) {
      toast.error("Selecione um xtreino primeiro");
      return;
    }
    addResult.mutate({ ...resultForm, xtreinoId });
    setShowResultForm(false);
    resetResultForm();
  };

  // --- Handlers Player ---
  const resetPlayerForm = () =>
    setPlayerForm({
      xtreinoId: 0,
      date: "",
      teamName: "",
      playerName: "",
      q1Kills: 0,
      q2Kills: 0,
      q3Kills: 0,
      totalKills: 0,
    });

  const handleSubmitPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerForm.playerName || !playerForm.teamName || !playerForm.date) {
      toast.error("Jogador, time e data sao obrigatorios");
      return;
    }
    // 🆕 Usa o xtreinoId selecionado se o form não tiver
    const xtreinoId = selectedXtForPlayers ?? playerForm.xtreinoId;
    if (!xtreinoId) {
      toast.error("Selecione um xtreino primeiro");
      return;
    }
    addPlayerStats.mutate({ ...playerForm, xtreinoId });
    setShowPlayerForm(false);
    resetPlayerForm();
  };

  // --- Handlers Schedule ---
  const resetScheduleForm = () =>
    setScheduleForm({
      date: "",
      dayOfWeek: "",
      timeBr: "21:00",
      status: "scheduled" as ScheduleStatus,
      notes: "",
    });

  const handleSubmitSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleForm.date || !scheduleForm.dayOfWeek) {
      toast.error("Data e dia da semana sao obrigatorios");
      return;
    }
    createSchedule.mutate(scheduleForm);
    setShowScheduleForm(false);
    resetScheduleForm();
  };

  const handleGenerateMonth = () => {
    const now = new Date();
    if (confirm(`Gerar agenda para ${now.getMonth() + 1}/${now.getFullYear()}?`)) {
      generateMonthSchedule.mutate({ year: now.getFullYear(), month: now.getMonth() + 1 });
    }
  };

  // --- Fixed teams parser ---
  const fixedTeams = (() => {
    try {
      const raw = settings?.fixedTeamsList;
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();

  // --- Tab config ---
  const tabs = [
    { key: "list" as AdminTab, label: "Xtreinos", icon: CalendarDays },
    { key: "results" as AdminTab, label: "Resultados", icon: BarChart3 },
    { key: "players" as AdminTab, label: "Jogadores", icon: Target },
    { key: "schedule" as AdminTab, label: "Agenda", icon: CalendarDays },
    { key: "inscricoes" as AdminTab, label: "Inscrições", icon: Users },
  ];

  const safeXTreinos = castXTreinos(xtreinosList);
  const safeResults = castResults(allResults);
  const safePlayerStats = castPlayerStats(allPlayerStats);
  const safeSchedule = castSchedule(scheduleList);

  const safeXtDetailResults = castXtDetail(xtDetailResults);
  const safeXtDetailPlayers = castXtDetail(xtDetailPlayers);
  const safeXtDetailInscricoes = castXtDetail(xtDetailInscricoes);

  const resultsTabDetail = selectedXtForResults
    ? (safeXtDetailResults ? { results: safeXtDetailResults.results ?? [] } : undefined)
    : undefined;

  const playersTabDetail = selectedXtForPlayers
    ? (safeXtDetailPlayers ? { playerStats: safeXtDetailPlayers.playerStats ?? [] } : undefined)
    : undefined;

  const inscricoesRegistrations = safeXtDetailInscricoes?.registrations ?? [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#f0f0f5] mb-1">XTreinos Underground</h1>
            <p className="text-[#8a8a9e] text-sm">
              Gerencie xtreinos, resultados, jogadores, agenda e inscrições
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                  isActive
                    ? "bg-red-500/10 text-red-400 border border-red-500/20"
                    : "bg-[#1a1a24] text-[#8a8a9e] border border-[#2a2a3a] hover:text-[#f0f0f5]"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB: LISTA */}
        {activeTab === "list" && (
          <XTreinosList
            xtreinosList={safeXTreinos}
            showForm={showXtForm}
            editing={editingXt}
            form={xtForm}
            isPending={isLoading}
            onShowForm={() => {
              setShowXtForm(true);
              setEditingXt(null);
              resetXtForm();
            }}
            onCloseForm={() => setShowXtForm(false)}
            onEdit={handleEditXt}
            onSubmit={handleSubmitXt}
            onDelete={handleDeleteXt}
            onFormChange={setXtForm}
          />
        )}

        {/* TAB: RESULTADOS */}
        {activeTab === "results" && (
          <ResultsTab
            xtreinosList={safeXTreinos}
            allResults={safeResults}
            xtDetail={resultsTabDetail}
            selectedXt={selectedXtForResults}
            showForm={showResultForm}
            form={resultForm}
            isPending={addResult.isPending}
            onSelectXt={setSelectedXtForResults}
            onShowForm={() => {
              setShowResultForm(true);
              resetResultForm();
            }}
            onCloseForm={() => setShowResultForm(false)}
            onSubmit={handleSubmitResult}
            onFormChange={setResultForm}
          />
        )}

        {/* TAB: JOGADORES */}
        {activeTab === "players" && (
          <PlayersTab
            xtreinosList={safeXTreinos}
            allPlayerStats={safePlayerStats}
            xtDetail={playersTabDetail}
            selectedXt={selectedXtForPlayers}
            showForm={showPlayerForm}
            form={playerForm}
            isPending={addPlayerStats.isPending}
            onSelectXt={setSelectedXtForPlayers}
            onShowForm={() => {
              setShowPlayerForm(true);
              resetPlayerForm();
            }}
            onCloseForm={() => setShowPlayerForm(false)}
            onSubmit={handleSubmitPlayer}
            onFormChange={setPlayerForm}
          />
        )}

        {/* TAB: AGENDA */}
        {activeTab === "schedule" && (
          <ScheduleTab
            scheduleList={safeSchedule}
            showForm={showScheduleForm}
            form={scheduleForm}
            isPending={createSchedule.isPending}
            isGenerating={generateMonthSchedule.isPending}
            onShowForm={() => {
              setShowScheduleForm(true);
              resetScheduleForm();
            }}
            onCloseForm={() => setShowScheduleForm(false)}
            onSubmit={handleSubmitSchedule}
            onGenerateMonth={handleGenerateMonth}
            onFormChange={setScheduleForm}
          />
        )}

        {/* TAB: INSCRIÇÕES */}
        {activeTab === "inscricoes" && (
          <InscricoesTab
            xtreinosList={safeXTreinos}
            registrations={inscricoesRegistrations}
            fixedTeams={fixedTeams}
            allTeams={allTeams as Array<{ id: number; name: string; tag: string }> | undefined}
            settings={settings}
            selectedXt={selectedXtForInscricoes}
            onSelectXt={setSelectedXtForInscricoes}
            onRegister={({ xtreinoId, teamId, isReserve }) => {
              registerTeam.mutate({ xtreinoId, teamId, isReserve });
            }}
            onUnregister={({ xtreinoId, teamId }) => {
              unregisterTeam.mutate({ xtreinoId, teamId });
            }}
            onToggleFixed={({ xtreinoId, teamId, isReserve }) => {
              toggleFixedTeam.mutate({ xtreinoId, teamId, isReserve });
            }}
            isPending={
              registerTeam.isPending || unregisterTeam.isPending || toggleFixedTeam.isPending
            }
          />
        )}
      </div>
    </AdminLayout>
  );
}