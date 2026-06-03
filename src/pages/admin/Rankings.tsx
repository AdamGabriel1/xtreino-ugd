import { useState, useMemo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Trophy,
  Target,
  BarChart3,
  Users,
  CalendarDays,
  Dumbbell,
  Calendar,
  Clock,
  Filter,
  TrendingUp,
  Swords,
  Medal,
  ChevronDown,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import AdminLayout from "@/layout/AdminLayout";
import { toast } from "sonner";

// ═══════════════════════════════════════════════════════════════════════════════
// PARTE 1: SISTEMA DE PONTUAÇÃO (copiado da página normal)
// ═══════════════════════════════════════════════════════════════════════════════

const POSITION_POINTS: Record<number, number> = {
  1: 15, 2: 12, 3: 10, 4: 9, 5: 8, 6: 7, 7: 6, 8: 5,
  9: 4, 10: 3, 11: 2, 12: 1, 13: 1, 14: 0, 15: 0,
};

const KILL_POINTS = 1;

interface TeamStats {
  teamName: string;
  date: string;
  q1Pos: number | null;
  q2Pos: number | null;
  q3Pos: number | null;
  q1Kills: number;
  q2Kills: number;
  q3Kills: number;
  totalKills: number;
  posPoints: number;
  killPoints: number;
  totalPoints: number;
}

type SortByType = "total" | "kills" | "pos";

// ═══════════════════════════════════════════════════════════════════════════════
// PARTE 2: COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════

export default function AdminXTreinos() {
  // ─── Estado: Abas ───
  const [activeTab, setActiveTab] = useState<"list" | "results" | "players" | "schedule" | "ranking">("list");

  // ─── Estado: Formulário XTreino (CRUD) ───
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "",
    date: "",
    timeMx: "",
    timeBr: "21:00",
    modality: "squad",
    maxTeams: 20,
    rules: "",
    discordLink: "",
    whatsappLink: "",
    status: "aberto",
  });

  // ─── Estado: Formulário Resultado ───
  const [selectedXtForResults, setSelectedXtForResults] = useState<number | null>(null);
  const [showResultForm, setShowResultForm] = useState(false);
  const [resultForm, setResultForm] = useState({
    xtreinoId: 0,
    date: "",
    teamName: "",
    q1Pos: 0,
    q2Pos: 0,
    q3Pos: 0,
    totalPoints: 0,
  });

  // ─── Estado: Formulário Jogador ───
  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [playerForm, setPlayerForm] = useState({
    xtreinoId: 0,
    date: "",
    teamName: "",
    playerName: "",
    q1Kills: 0,
    q2Kills: 0,
    q3Kills: 0,
    totalKills: 0,
  });

  // ─── Estado: Formulário Agenda ───
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    date: "",
    dayOfWeek: "",
    timeBr: "21:00",
    status: "scheduled",
    notes: "",
  });

  // ─── Estado: Filtros da Aba Ranking (copiado da página normal) ───
  const [selectedMonth, setSelectedMonth] = useState<string>("2026-05");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortByType>("total");

  // ═══════════════════════════════════════════════════════════════════════════════
  // PARTE 3: QUERIES tRPC
  // ═══════════════════════════════════════════════════════════════════════════════

  const utils = trpc.useUtils();
  const { data: xtreinosList } = trpc.xtreinos.list.useQuery();
  const { data: xtDetail } = trpc.xtreinos.getById.useQuery(
    { id: selectedXtForResults! },
    { enabled: !!selectedXtForResults }
  );
  const { data: allResults } = trpc.xtreinos.listResults.useQuery();
  const { data: allPlayerStats } = trpc.xtreinos.listPlayerStats.useQuery();
  const { data: scheduleList } = trpc.xtreinos.schedule.list.useQuery();

  // ═══════════════════════════════════════════════════════════════════════════════
  // PARTE 4: MUTATIONS (CRUD)
  // ═══════════════════════════════════════════════════════════════════════════════

  const create = trpc.xtreinos.create.useMutation({
    onSuccess: () => {
      utils.xtreinos.list.invalidate();
      setShowForm(false);
      resetForm();
      toast.success("XTreino criado!");
    },
    onError: (e) => toast.error(e.message),
  });

  const update = trpc.xtreinos.update.useMutation({
    onSuccess: () => {
      utils.xtreinos.list.invalidate();
      setShowForm(false);
      setEditing(null);
      resetForm();
      toast.success("XTreino atualizado!");
    },
    onError: (e) => toast.error(e.message),
  });

  const remove = trpc.xtreinos.delete.useMutation({
    onSuccess: () => {
      utils.xtreinos.list.invalidate();
      toast.success("XTreino removido!");
    },
    onError: (e) => toast.error(e.message),
  });

  const addResult = trpc.xtreinos.addResult.useMutation({
    onSuccess: () => {
      utils.xtreinos.listResults.invalidate();
      if (selectedXtForResults) utils.xtreinos.getById.invalidate({ id: selectedXtForResults });
      setShowResultForm(false);
      resetResultForm();
      toast.success("Resultado adicionado!");
    },
    onError: (e) => toast.error(e.message),
  });

  const addPlayerStats = trpc.xtreinos.addPlayerStats.useMutation({
    onSuccess: () => {
      utils.xtreinos.listPlayerStats.invalidate();
      if (selectedXtForResults) utils.xtreinos.getById.invalidate({ id: selectedXtForResults });
      setShowPlayerForm(false);
      resetPlayerForm();
      toast.success("Stats de jogador adicionadas!");
    },
    onError: (e) => toast.error(e.message),
  });

  const createSchedule = trpc.xtreinos.schedule.create.useMutation({
    onSuccess: () => {
      utils.xtreinos.schedule.list.invalidate();
      setShowScheduleForm(false);
      resetScheduleForm();
      toast.success("Agendamento criado!");
    },
    onError: (e) => toast.error(e.message),
  });

  const generateMonthSchedule = trpc.xtreinos.schedule.generateMonth.useMutation({
    onSuccess: (data) => {
      utils.xtreinos.schedule.list.invalidate();
      toast.success(`${data.generated} xtreinos agendados!`);
    },
    onError: (e) => toast.error(e.message),
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // PARTE 5: FUNÇÕES AUXILIARES E RESET
  // ═══════════════════════════════════════════════════════════════════════════════

  const resetForm = () =>
    setForm({
      name: "",
      date: "",
      timeMx: "",
      timeBr: "21:00",
      modality: "squad",
      maxTeams: 20,
      rules: "",
      discordLink: "",
      whatsappLink: "",
      status: "aberto",
    });

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

  const resetScheduleForm = () =>
    setScheduleForm({
      date: "",
      dayOfWeek: "",
      timeBr: "21:00",
      status: "scheduled",
      notes: "",
    });

  const handleEdit = (x: NonNullable<typeof xtreinosList>[0]) => {
    setEditing(x.id);
    setForm({
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
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.date) {
      toast.error("Nome e data são obrigatórios");
      return;
    }
    if (editing) update.mutate({ id: editing, ...form });
    else create.mutate(form);
  };

  const handleAddResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resultForm.teamName || !resultForm.date) {
      toast.error("Time e data são obrigatórios");
      return;
    }
    addResult.mutate(resultForm);
  };

  const handleAddPlayerStats = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerForm.playerName || !playerForm.teamName || !playerForm.date) {
      toast.error("Jogador, time e data são obrigatórios");
      return;
    }
    addPlayerStats.mutate(playerForm);
  };

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleForm.date || !scheduleForm.dayOfWeek) {
      toast.error("Data e dia da semana são obrigatórios");
      return;
    }
    createSchedule.mutate(scheduleForm);
  };

  // ─── Cores de status ───
  const statusColors: Record<string, string> = {
    aberto: "bg-blue-500/10 text-blue-400",
    encerrado: "bg-red-500/10 text-red-400",
    cancelado: "bg-gray-500/10 text-gray-400",
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // PARTE 6: useMemo HOOKS DO RANKING (copiados da página normal)
  // ═══════════════════════════════════════════════════════════════════════════════

  const availableMonths = useMemo(() => {
    if (!allResults) return [];
    const months = new Set<string>();
    allResults.forEach((r) => {
      if (r.date) months.add(r.date.substring(0, 7));
    });
    return Array.from(months).sort();
  }, [allResults]);

  const availableDates = useMemo(() => {
    if (!allResults || !selectedMonth) return [];
    const dates = new Set<string>();
    allResults.forEach((r) => {
      if (r.date && r.date.startsWith(selectedMonth)) dates.add(r.date);
    });
    return Array.from(dates).sort();
  }, [allResults, selectedMonth]);

  const teamStats: TeamStats[] = useMemo(() => {
    if (!allResults || !allPlayerStats) return [];

    const statsMap = new Map<string, TeamStats>();

    // Primeiro, processar resultados (colocações)
    allResults.forEach((r) => {
      if (selectedMonth && !r.date?.startsWith(selectedMonth)) return;
      if (selectedDate && r.date !== selectedDate) return;

      const key = `${r.date}-${r.teamName}`;
      const q1Pos = r.q1Pos ?? 0;
      const q2Pos = r.q2Pos ?? 0;
      const q3Pos = r.q3Pos ?? 0;

      const posPoints =
        (POSITION_POINTS[q1Pos] || 0) +
        (POSITION_POINTS[q2Pos] || 0) +
        (POSITION_POINTS[q3Pos] || 0);

      statsMap.set(key, {
        teamName: r.teamName,
        date: r.date,
        q1Pos: r.q1Pos,
        q2Pos: r.q2Pos,
        q3Pos: r.q3Pos,
        q1Kills: 0,
        q2Kills: 0,
        q3Kills: 0,
        totalKills: 0,
        posPoints,
        killPoints: 0,
        totalPoints: posPoints,
      });
    });

    // Depois, processar kills dos jogadores
    allPlayerStats.forEach((p) => {
      if (selectedMonth && !p.date?.startsWith(selectedMonth)) return;
      if (selectedDate && p.date !== selectedDate) return;

      const key = `${p.date}-${p.teamName}`;
      const existing = statsMap.get(key);

      const killPoints = (p.totalKills || 0) * KILL_POINTS;

      if (existing) {
        existing.q1Kills += p.q1Kills || 0;
        existing.q2Kills += p.q2Kills || 0;
        existing.q3Kills += p.q3Kills || 0;
        existing.totalKills += p.totalKills || 0;
        existing.killPoints += killPoints;
        existing.totalPoints = existing.posPoints + existing.killPoints;
      } else {
        statsMap.set(key, {
          teamName: p.teamName,
          date: p.date,
          q1Pos: null,
          q2Pos: null,
          q3Pos: null,
          q1Kills: p.q1Kills || 0,
          q2Kills: p.q2Kills || 0,
          q3Kills: p.q3Kills || 0,
          totalKills: p.totalKills || 0,
          posPoints: 0,
          killPoints,
          totalPoints: killPoints,
        });
      }
    });

    return Array.from(statsMap.values());
  }, [allResults, allPlayerStats, selectedMonth, selectedDate]);

  const sortedStats = useMemo(() => {
    return [...teamStats].sort((a, b) => {
      if (sortBy === "total") return b.totalPoints - a.totalPoints;
      if (sortBy === "kills") return b.totalKills - a.totalKills;
      if (sortBy === "pos") return b.posPoints - a.posPoints;
      return 0;
    });
  }, [teamStats, sortBy]);

  const monthStats = useMemo(() => {
    if (!teamStats.length) return null;
    return {
      totalTeams: new Set(teamStats.map((s) => s.teamName)).size,
      totalKills: teamStats.reduce((sum, s) => sum + s.totalKills, 0),
      totalPosPoints: teamStats.reduce((sum, s) => sum + s.posPoints, 0),
      totalKillPoints: teamStats.reduce((sum, s) => sum + s.killPoints, 0),
      totalPoints: teamStats.reduce((sum, s) => sum + s.totalPoints, 0),
    };
  }, [teamStats]);

  // ═══════════════════════════════════════════════════════════════════════════════
  // PARTE 7: FUNÇÕES DE ESTILO DO RANKING (copiadas da página normal)
  // ═══════════════════════════════════════════════════════════════════════════════

  const getPosColor = (pos: number | null) => {
    if (!pos) return "text-[#5a5a6e]";
    if (pos === 1) return "text-yellow-400 font-bold";
    if (pos === 2) return "text-gray-300 font-bold";
    if (pos === 3) return "text-amber-500 font-bold";
    return "text-[#8a8a9e]";
  };

  const getPosBg = (pos: number | null) => {
    if (!pos) return "";
    if (pos === 1) return "bg-yellow-500/10";
    if (pos === 2) return "bg-gray-400/10";
    if (pos === 3) return "bg-amber-500/10";
    return "";
  };

  const getRankStyle = (index: number) => {
    if (index === 0) return "bg-yellow-500/5 border-l-2 border-yellow-500";
    if (index === 1) return "bg-gray-400/5 border-l-2 border-gray-400";
    if (index === 2) return "bg-amber-500/5 border-l-2 border-amber-500";
    return "border-l-2 border-transparent";
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // PARTE 8: JSX - RENDER
  // ═══════════════════════════════════════════════════════════════════════════════

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* ═══════════════════════════════════════════════════════════════════════
            HEADER (estilo da página normal)
            ═══════════════════════════════════════════════════════════════════════ */}
        <div className="bg-[#12121a] border-b border-[#2a2a3a]">
          <div className="py-8">
            <div className="flex items-center gap-3 mb-2">
              <Dumbbell className="w-8 h-8 text-red-400" />
              <h1 className="text-3xl md:text-4xl font-extrabold text-[#f0f0f5]">
                Admin XTreinos Underground
              </h1>
            </div>
            <p className="text-[#8a8a9e]">
              Gerencie xtreinos, resultados, jogadores, agenda e ranking
            </p>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
            TABS (estilizadas como a página normal)
            ═══════════════════════════════════════════════════════════════════════ */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab("list")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === "list"
                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                : "bg-[#1a1a24] text-[#8a8a9e] border border-[#2a2a3a] hover:text-[#f0f0f5]"
            }`}
          >
            <CalendarDays className="w-4 h-4 inline mr-2" />
            Xtreinos
          </button>
          <button
            onClick={() => setActiveTab("results")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === "results"
                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                : "bg-[#1a1a24] text-[#8a8a9e] border border-[#2a2a3a] hover:text-[#f0f0f5]"
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Resultados
          </button>
          <button
            onClick={() => setActiveTab("players")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === "players"
                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                : "bg-[#1a1a24] text-[#8a8a9e] border border-[#2a2a3a] hover:text-[#f0f0f5]"
            }`}
          >
            <Target className="w-4 h-4 inline mr-2" />
            Jogadores
          </button>
          <button
            onClick={() => setActiveTab("ranking")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === "ranking"
                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                : "bg-[#1a1a24] text-[#8a8a9e] border border-[#2a2a3a] hover:text-[#f0f0f5]"
            }`}
          >
            <Trophy className="w-4 h-4 inline mr-2" />
            Ranking
          </button>
          <button
            onClick={() => setActiveTab("schedule")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === "schedule"
                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                : "bg-[#1a1a24] text-[#8a8a9e] border border-[#2a2a3a] hover:text-[#f0f0f5]"
            }`}
          >
            <CalendarDays className="w-4 h-4 inline mr-2" />
            Agenda
          </button>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
            TAB: LISTA DE XTREINOS (CRUD)
            ═══════════════════════════════════════════════════════════════════════ */}
        {activeTab === "list" && (
          <>
            <div className="flex justify-between items-center">
              <button
                onClick={() => {
                  setShowForm(true);
                  setEditing(null);
                  resetForm();
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all"
              >
                <Plus className="w-4 h-4" /> Novo XTreino
              </button>
            </div>

            {showForm && (
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[#f0f0f5]">
                    {editing ? "Editar" : "Novo"} XTreino
                  </h3>
                  <button
                    onClick={() => setShowForm(false)}
                    className="p-1 rounded hover:bg-[#1a1a24] text-[#5a5a6e]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">Nome *</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">Data *</label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">Horário MX</label>
                    <input
                      value={form.timeMx}
                      onChange={(e) => setForm({ ...form, timeMx: e.target.value })}
                      placeholder="5:00 PM"
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">Horário BR *</label>
                    <input
                      value={form.timeBr}
                      onChange={(e) => setForm({ ...form, timeBr: e.target.value })}
                      placeholder="21:00"
                      required
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">Modalidade</label>
                    <select
                      value={form.modality}
                      onChange={(e) => setForm({ ...form, modality: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50"
                    >
                      <option value="solo">Solo</option>
                      <option value="duo">Duo</option>
                      <option value="squad">Squad</option>
                      <option value="4v4">4v4</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">Máx Equipes</label>
                    <input
                      type="number"
                      value={form.maxTeams}
                      onChange={(e) =>
                        setForm({ ...form, maxTeams: parseInt(e.target.value) || 20 })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50"
                    >
                      <option value="aberto">Aberto</option>
                      <option value="encerrado">Encerrado</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">Discord</label>
                    <input
                      value={form.discordLink}
                      onChange={(e) => setForm({ ...form, discordLink: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">WhatsApp</label>
                    <input
                      value={form.whatsappLink}
                      onChange={(e) => setForm({ ...form, whatsappLink: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm text-[#8a8a9e] mb-1">Regras</label>
                    <textarea
                      value={form.rules}
                      onChange={(e) => setForm({ ...form, rules: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <button
                      type="submit"
                      disabled={create.isPending || update.isPending}
                      className="px-6 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all disabled:opacity-50"
                    >
                      {create.isPending || update.isPending ? (
                        "Salvando..."
                      ) : (
                        <span className="flex items-center gap-1">
                          <Check className="w-4 h-4" /> Salvar
                        </span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2a2a3a] bg-[#0a0a0f]">
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">
                        Horários
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">
                        Modo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2a2a3a]">
                    {xtreinosList?.map((x) => (
                      <tr key={x.id} className="hover:bg-[#1a1a24]">
                        <td className="px-6 py-3 text-sm font-medium text-[#f0f0f5]">
                          {x.name}
                        </td>
                        <td className="px-6 py-3 text-sm text-[#8a8a9e]">{x.date}</td>
                        <td className="px-6 py-3 text-sm text-[#8a8a9e]">
                          MX {x.timeMx} / BR {x.timeBr}
                        </td>
                        <td className="px-6 py-3 text-sm text-[#8a8a9e]">
                          {x.modality?.toUpperCase()}
                        </td>
                        <td className="px-6 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              statusColors[x.status]
                            }`}
                          >
                            {x.status}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(x)}
                              className="p-1.5 rounded hover:bg-blue-500/10 text-blue-400"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm("Remover?")) remove.mutate({ id: x.id });
                              }}
                              className="p-1.5 rounded hover:bg-red-500/10 text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!xtreinosList?.length && (
                <div className="px-6 py-8 text-center text-[#5a5a6e] text-sm">
                  Nenhum xtreino cadastrado
                </div>
              )}
            </div>
          </>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
            TAB: RESULTADOS (com design melhorado)
            ═══════════════════════════════════════════════════════════════════════ */}
        {activeTab === "results" && (
          <>
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
              <div className="flex gap-2">
                <select
                  value={selectedXtForResults ?? ""}
                  onChange={(e) =>
                    setSelectedXtForResults(e.target.value ? parseInt(e.target.value) : null)
                  }
                  className="px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50"
                >
                  <option value="">Todos os xtreinos</option>
                  {xtreinosList?.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.name} ({x.date})
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    setShowResultForm(true);
                    resetResultForm();
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all"
                >
                  <Plus className="w-4 h-4" /> Add Resultado
                </button>
              </div>
            </div>

            {showResultForm && (
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[#f0f0f5]">Adicionar Resultado</h3>
                  <button
                    onClick={() => setShowResultForm(false)}
                    className="p-1 rounded hover:bg-[#1a1a24] text-[#5a5a6e]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <form onSubmit={handleAddResult} className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">XTreino ID</label>
                    <input
                      type="number"
                      value={resultForm.xtreinoId}
                      onChange={(e) =>
                        setResultForm({
                          ...resultForm,
                          xtreinoId: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">Data *</label>
                    <input
                      type="date"
                      value={resultForm.date}
                      onChange={(e) =>
                        setResultForm({ ...resultForm, date: e.target.value })
                      }
                      required
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">Time *</label>
                    <input
                      value={resultForm.teamName}
                      onChange={(e) =>
                        setResultForm({ ...resultForm, teamName: e.target.value })
                      }
                      required
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">Q1 Pos</label>
                    <input
                      type="number"
                      value={resultForm.q1Pos}
                      onChange={(e) =>
                        setResultForm({
                          ...resultForm,
                          q1Pos: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">Q2 Pos</label>
                    <input
                      type="number"
                      value={resultForm.q2Pos}
                      onChange={(e) =>
                        setResultForm({
                          ...resultForm,
                          q2Pos: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">Q3 Pos</label>
                    <input
                      type="number"
                      value={resultForm.q3Pos}
                      onChange={(e) =>
                        setResultForm({
                          ...resultForm,
                          q3Pos: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm"
                    />
                  </div>
                  <div className="sm:col-span-3 flex items-end">
                    <button
                      type="submit"
                      disabled={addResult.isPending}
                      className="px-6 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all disabled:opacity-50"
                    >
                      {addResult.isPending ? (
                        "Salvando..."
                      ) : (
                        <span className="flex items-center gap-1">
                          <Check className="w-4 h-4" /> Adicionar
                        </span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Tabela de resultados com design melhorado */}
            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center justify-between">
                <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Resultados {selectedXtForResults ? `— ${xtDetail?.name}` : "— Todos"}
                </h3>
                <span className="text-xs text-[#5a5a6e]">
                  {(selectedXtForResults ? xtDetail?.results : allResults)?.length ?? 0} registros
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2a2a3a] bg-[#0a0a0f]">
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">
                        Time
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">
                        Q1
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">
                        Q2
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">
                        Q3
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2a2a3a]">
                    {(selectedXtForResults ? xtDetail?.results : allResults)?.map((r) => (
                      <tr key={r.id} className="hover:bg-[#1a1a24]">
                        <td className="px-6 py-3 text-sm text-[#8a8a9e]">{r.date}</td>
                        <td className="px-6 py-3 text-sm font-medium text-[#f0f0f5]">
                          {r.teamName}
                        </td>
                        <td className="px-6 py-3 text-center">
                          <span
                            className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                              r.q1Pos === 1
                                ? "bg-yellow-500/20 text-yellow-400"
                                : r.q1Pos === 2
                                ? "bg-gray-400/20 text-gray-300"
                                : r.q1Pos === 3
                                ? "bg-amber-600/20 text-amber-500"
                                : "bg-[#1a1a24] text-[#8a8a9e]"
                            }`}
                          >
                            {r.q1Pos ?? "-"}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-center">
                          <span
                            className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                              r.q2Pos === 1
                                ? "bg-yellow-500/20 text-yellow-400"
                                : r.q2Pos === 2
                                ? "bg-gray-400/20 text-gray-300"
                                : r.q2Pos === 3
                                ? "bg-amber-600/20 text-amber-500"
                                : "bg-[#1a1a24] text-[#8a8a9e]"
                            }`}
                          >
                            {r.q2Pos ?? "-"}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-center">
                          <span
                            className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                              r.q3Pos === 1
                                ? "bg-yellow-500/20 text-yellow-400"
                                : r.q3Pos === 2
                                ? "bg-gray-400/20 text-gray-300"
                                : r.q3Pos === 3
                                ? "bg-amber-600/20 text-amber-500"
                                : "bg-[#1a1a24] text-[#8a8a9e]"
                            }`}
                          >
                            {r.q3Pos ?? "-"}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-center text-sm font-bold text-[#f0f0f5]">
                          {r.totalPoints ?? "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!(selectedXtForResults ? xtDetail?.results : allResults)?.length && (
                <div className="px-6 py-8 text-center text-[#5a5a6e] text-sm">
                  Nenhum resultado registrado
                </div>
              )}
            </div>
          </>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
            TAB: JOGADORES (com design melhorado)
            ═══════════════════════════════════════════════════════════════════════ */}
        {activeTab === "players" && (
          <>
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
              <div className="flex gap-2">
                <select
                  value={selectedXtForResults ?? ""}
                  onChange={(e) =>
                    setSelectedXtForResults(e.target.value ? parseInt(e.target.value) : null)
                  }
                  className="px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50"
                >
                  <option value="">Todos os xtreinos</option>
                  {xtreinosList?.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.name} ({x.date})
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    setShowPlayerForm(true);
                    resetPlayerForm();
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all"
                >
                  <Plus className="w-4 h-4" /> Add Jogador
                </button>
              </div>
            </div>

            {showPlayerForm && (
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[#f0f0f5]">Adicionar Stats de Jogador</h3>
                  <button
                    onClick={() => setShowPlayerForm(false)}
                    className="p-1 rounded hover:bg-[#1a1a24] text-[#5a5a6e]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <form onSubmit={handleAddPlayerStats} className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">XTreino ID</label>
                    <input
                      type="number"
                      value={playerForm.xtreinoId}
                      onChange={(e) =>
                        setPlayerForm({
                          ...playerForm,
                          xtreinoId: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">Data *</label>
                    <input
                      type="date"
                      value={playerForm.date}
                      onChange={(e) =>
                        setPlayerForm({ ...playerForm, date: e.target.value })
                      }
                      required
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">Time *</label>
                    <input
                      value={playerForm.teamName}
                      onChange={(e) =>
                        setPlayerForm({ ...playerForm, teamName: e.target.value })
                      }
                      required
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">Jogador *</label>
                    <input
                      value={playerForm.playerName}
                      onChange={(e) =>
                        setPlayerForm({ ...playerForm, playerName: e.target.value })
                      }
                      required
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">Q1 Kills</label>
                    <input
                      type="number"
                      value={playerForm.q1Kills}
                      onChange={(e) =>
                        setPlayerForm({
                          ...playerForm,
                          q1Kills: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">Q2 Kills</label>
                    <input
                      type="number"
                      value={playerForm.q2Kills}
                      onChange={(e) =>
                        setPlayerForm({
                          ...playerForm,
                          q2Kills: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">Q3 Kills</label>
                    <input
                      type="number"
                      value={playerForm.q3Kills}
                      onChange={(e) =>
                        setPlayerForm({
                          ...playerForm,
                          q3Kills: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">Total Kills</label>
                    <input
                      type="number"
                      value={playerForm.totalKills}
                      onChange={(e) =>
                        setPlayerForm({
                          ...playerForm,
                          totalKills: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm"
                    />
                  </div>
                  <div className="sm:col-span-3 flex items-end">
                    <button
                      type="submit"
                      disabled={addPlayerStats.isPending}
                      className="px-6 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all disabled:opacity-50"
                    >
                      {addPlayerStats.isPending ? (
                        "Salvando..."
                      ) : (
                        <span className="flex items-center gap-1">
                          <Check className="w-4 h-4" /> Adicionar
                        </span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center justify-between">
                <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
                  <Target className="w-5 h-5 text-red-400" />
                  Estatísticas de Jogadores {selectedXtForResults ? `— ${xtDetail?.name}` : "— Todos"}
                </h3>
                <span className="text-xs text-[#5a5a6e]">
                  {(selectedXtForResults ? xtDetail?.playerStats : allPlayerStats)?.length ?? 0} registros
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2a2a3a] bg-[#0a0a0f]">
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">
                        Jogador
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">
                        Time
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">
                        Q1
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">
                        Q2
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">
                        Q3
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2a2a3a]">
                    {(selectedXtForResults ? xtDetail?.playerStats : allPlayerStats)?.map((p) => (
                      <tr key={p.id} className="hover:bg-[#1a1a24]">
                        <td className="px-6 py-3 text-sm text-[#8a8a9e]">{p.date}</td>
                        <td className="px-6 py-3 text-sm font-medium text-[#f0f0f5]">
                          {p.playerName}
                        </td>
                        <td className="px-6 py-3 text-sm text-[#8a8a9e]">{p.teamName}</td>
                        <td className="px-6 py-3 text-center text-sm text-[#8a8a9e]">{p.q1Kills}</td>
                        <td className="px-6 py-3 text-center text-sm text-[#8a8a9e]">{p.q2Kills}</td>
                        <td className="px-6 py-3 text-center text-sm text-[#8a8a9e]">{p.q3Kills}</td>
                        <td className="px-6 py-3 text-center text-sm font-bold text-red-400">
                          {p.totalKills}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!(selectedXtForResults ? xtDetail?.playerStats : allPlayerStats)?.length && (
                <div className="px-6 py-8 text-center text-[#5a5a6e] text-sm">
                  Nenhuma estatística registrada
                </div>
              )}
            </div>
          </>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
            TAB: RANKING (copiado da página normal + funcionalidade admin)
            ═══════════════════════════════════════════════════════════════════════ */}
        {activeTab === "ranking" && (
          <>
            {/* Filtros */}
            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4 mb-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                <div className="flex items-center gap-2 text-[#8a8a9e]">
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-medium">Filtros:</span>
                </div>

                <div className="flex flex-wrap gap-3 flex-1">
                  {/* Filtro de Mês */}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#5a5a6e]" />
                    <select
                      value={selectedMonth}
                      onChange={(e) => {
                        setSelectedMonth(e.target.value);
                        setSelectedDate("");
                      }}
                      className="px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50 min-w-[140px]"
                    >
                      {availableMonths.map((m) => (
                        <option key={m} value={m}>
                          {m.split("-")[1]}/{m.split("-")[0]}
                        </option>
                      ))}
                      {!availableMonths.length && (
                        <option value="">Carregando...</option>
                      )}
                    </select>
                  </div>

                  {/* Filtro de Dia */}
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#5a5a6e]" />
                    <select
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50 min-w-[140px]"
                    >
                      <option value="">Todos os dias</option>
                      {availableDates.map((d) => (
                        <option key={d} value={d}>
                          {d.split("-")[2]}/{d.split("-")[1]}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Ordenação */}
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#5a5a6e]" />
                    <select
                      value={sortBy}
                      onChange={(e) =>
                        setSortBy(e.target.value as SortByType)
                      }
                      className="px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50 min-w-[160px]"
                    >
                      <option value="total">Ordenar: Total</option>
                      <option value="kills">Ordenar: Kills</option>
                      <option value="pos">Ordenar: Posição</option>
                    </select>
                  </div>
                </div>

                {/* Limpar filtros */}
                {(selectedDate || sortBy !== "total") && (
                  <button
                    onClick={() => {
                      setSelectedDate("");
                      setSortBy("total");
                    }}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            </div>

            {/* Cards de resumo */}
            {monthStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-[#5a5a6e] uppercase">Equipes</span>
                  </div>
                  <p className="text-2xl font-bold text-[#f0f0f5]">{monthStats.totalTeams}</p>
                </div>
                <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Swords className="w-4 h-4 text-red-400" />
                    <span className="text-xs text-[#5a5a6e] uppercase">Total Kills</span>
                  </div>
                  <p className="text-2xl font-bold text-red-400">{monthStats.totalKills}</p>
                </div>
                <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs text-[#5a5a6e] uppercase">Pts Posição</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-400">{monthStats.totalPosPoints}</p>
                </div>
                <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-[#5a5a6e] uppercase">Total Geral</span>
                  </div>
                  <p className="text-2xl font-bold text-green-400">{monthStats.totalPoints}</p>
                </div>
              </div>
            )}

            {/* Tabela Principal de Ranking */}
            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center justify-between">
                <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
                  <Medal className="w-5 h-5 text-yellow-400" />
                  Classificação{" "}
                  {selectedDate
                    ? `— ${selectedDate.split("-")[2]}/${selectedDate.split("-")[1]}`
                    : `— ${selectedMonth.split("-")[1]}/${selectedMonth.split("-")[0]}`}
                </h3>
                <span className="text-xs text-[#5a5a6e]">
                  {sortedStats.length} registros
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2a2a3a] bg-[#0a0a0f]">
                      <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase w-12">
                        #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">
                        Equipe
                      </th>
                      {!selectedDate && (
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">
                          Data
                        </th>
                      )}
                      <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">
                        <span className="flex items-center justify-center gap-1">
                          Q1 <span className="text-[#3a3a4e]">Pos</span>
                        </span>
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">
                        <span className="flex items-center justify-center gap-1">
                          Q2 <span className="text-[#3a3a4e]">Pos</span>
                        </span>
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">
                        <span className="flex items-center justify-center gap-1">
                          Q3 <span className="text-[#3a3a4e]">Pos</span>
                        </span>
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase bg-yellow-500/5">
                        <Trophy className="w-3 h-3 inline mr-1 text-yellow-400" />
                        Pts Pos
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">
                        <Target className="w-3 h-3 inline mr-1 text-red-400" />
                        Kills
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase bg-red-500/5">
                        <Swords className="w-3 h-3 inline mr-1 text-red-400" />
                        Pts Kill
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase bg-green-500/5">
                        <BarChart3 className="w-3 h-3 inline mr-1 text-green-400" />
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2a2a3a]">
                    {sortedStats.map((team, index) => (
                      <tr
                        key={`${team.date}-${team.teamName}`}
                        className={`hover:bg-[#1a1a24] transition-colors ${getRankStyle(index)}`}
                      >
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                              index === 0
                                ? "bg-yellow-500/20 text-yellow-400"
                                : index === 1
                                ? "bg-gray-400/20 text-gray-300"
                                : index === 2
                                ? "bg-amber-500/20 text-amber-500"
                                : "text-[#5a5a6e]"
                            }`}
                          >
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-bold text-[#f0f0f5]">{team.teamName}</p>
                        </td>
                        {!selectedDate && (
                          <td className="px-4 py-3 text-sm text-[#8a8a9e]">
                            {team.date.split("-")[2]}/{team.date.split("-")[1]}
                          </td>
                        )}
                        <td className={`px-4 py-3 text-center ${getPosBg(team.q1Pos)}`}>
                          <span className={`text-sm font-medium ${getPosColor(team.q1Pos)}`}>
                            {team.q1Pos ?? "-"}
                          </span>
                          {team.q1Pos && team.q1Pos <= 3 && (
                            <span className="ml-1 text-xs">
                              {team.q1Pos === 1 ? "🥇" : team.q1Pos === 2 ? "🥈" : "🥉"}
                            </span>
                          )}
                        </td>
                        <td className={`px-4 py-3 text-center ${getPosBg(team.q2Pos)}`}>
                          <span className={`text-sm font-medium ${getPosColor(team.q2Pos)}`}>
                            {team.q2Pos ?? "-"}
                          </span>
                          {team.q2Pos && team.q2Pos <= 3 && (
                            <span className="ml-1 text-xs">
                              {team.q2Pos === 1 ? "🥇" : team.q2Pos === 2 ? "🥈" : "🥉"}
                            </span>
                          )}
                        </td>
                        <td className={`px-4 py-3 text-center ${getPosBg(team.q3Pos)}`}>
                          <span className={`text-sm font-medium ${getPosColor(team.q3Pos)}`}>
                            {team.q3Pos ?? "-"}
                          </span>
                          {team.q3Pos && team.q3Pos <= 3 && (
                            <span className="ml-1 text-xs">
                              {team.q3Pos === 1 ? "🥇" : team.q3Pos === 2 ? "🥈" : "🥉"}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center bg-yellow-500/5">
                          <span className="text-sm font-bold text-yellow-400">
                            {team.posPoints}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm text-[#8a8a9e]">{team.totalKills}</span>
                        </td>
                        <td className="px-4 py-3 text-center bg-red-500/5">
                          <span className="text-sm font-bold text-red-400">
                            {team.killPoints}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center bg-green-500/5">
                          <span className="text-lg font-bold text-green-400">
                            {team.totalPoints}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {sortedStats.length === 0 && (
                <div className="px-6 py-16 text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-[#2a2a3a]" />
                  <p className="text-[#5a5a6e] text-lg font-medium">
                    Nenhum resultado encontrado
                  </p>
                  <p className="text-[#3a3a4e] text-sm mt-1">
                    {selectedDate
                      ? "Nenhum dado para esta data"
                      : "Nenhum dado para este mês"}
                  </p>
                </div>
              )}
            </div>

            {/* Legenda do Sistema de Pontuação */}
            <div className="mt-6 grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                <h4 className="font-bold text-[#f0f0f5] mb-3 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  Pontuação por Posição
                </h4>
                <div className="grid grid-cols-5 gap-x-2 gap-y-1 text-xs">
                  {Object.entries(POSITION_POINTS).map(([pos, pts]) => (
                    <div key={pos} className="flex justify-between text-[#8a8a9e]">
                      <span>{pos}º</span>
                      <span className="font-bold text-yellow-400">{pts}pts</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                <h4 className="font-bold text-[#f0f0f5] mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-red-400" />
                  Pontuação por Kill
                </h4>
                <p className="text-[#8a8a9e] text-xs">
                  Cada kill vale{" "}
                  <span className="font-bold text-red-400">{KILL_POINTS} ponto</span>.<br />
                  Total de kills do time × {KILL_POINTS} = Pontos de Kill
                </p>
              </div>
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                <h4 className="font-bold text-[#f0f0f5] mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-green-400" />
                  Cálculo do Total
                </h4>
                <p className="text-[#8a8a9e] text-xs">
                  <span className="text-yellow-400">Pts Posição</span> +{" "}
                  <span className="text-red-400">Pts Kill</span> ={" "}
                  <span className="text-green-400 font-bold">Total</span>
                </p>
              </div>
            </div>
          </>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
            TAB: AGENDA (com design melhorado)
            ═══════════════════════════════════════════════════════════════════════ */}
        {activeTab === "schedule" && (
          <>
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowScheduleForm(true);
                    resetScheduleForm();
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all"
                >
                  <Plus className="w-4 h-4" /> Add Agendamento
                </button>
                <button
                  onClick={() => {
                    const now = new Date();
                    if (
                      confirm(
                        `Gerar agenda para ${now.getMonth() + 1}/${now.getFullYear()}?`
                      )
                    ) {
                      generateMonthSchedule.mutate({
                        year: now.getFullYear(),
                        month: now.getMonth() + 1,
                      });
                    }
                  }}
                  disabled={generateMonthSchedule.isPending}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm font-medium hover:bg-[#22222e] transition-all disabled:opacity-50"
                >
                  <CalendarDays className="w-4 h-4" />
                  {generateMonthSchedule.isPending ? "Gerando..." : "Gerar Mês"}
                </button>
              </div>
            </div>

            {showScheduleForm && (
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[#f0f0f5]">Novo Agendamento</h3>
                  <button
                    onClick={() => setShowScheduleForm(false)}
                    className="p-1 rounded hover:bg-[#1a1a24] text-[#5a5a6e]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <form onSubmit={handleCreateSchedule} className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">Data *</label>
                    <input
                      type="date"
                      value={scheduleForm.date}
                      onChange={(e) =>
                        setScheduleForm({ ...scheduleForm, date: e.target.value })
                      }
                      required
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">
                      Dia da Semana *
                    </label>
                    <select
                      value={scheduleForm.dayOfWeek}
                      onChange={(e) =>
                        setScheduleForm({ ...scheduleForm, dayOfWeek: e.target.value })
                      }
                      required
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm"
                    >
                      <option value="">Selecione</option>
                      <option value="Segunda">Segunda</option>
                      <option value="Terça">Terça</option>
                      <option value="Quarta">Quarta</option>
                      <option value="Quinta">Quinta</option>
                      <option value="Sexta">Sexta</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">Horário BR</label>
                    <input
                      value={scheduleForm.timeBr}
                      onChange={(e) =>
                        setScheduleForm({ ...scheduleForm, timeBr: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">Status</label>
                    <select
                      value={scheduleForm.status}
                      onChange={(e) =>
                        setScheduleForm({ ...scheduleForm, status: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm"
                    >
                      <option value="scheduled">Agendado</option>
                      <option value="completed">Realizado</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm text-[#8a8a9e] mb-1">Observações</label>
                    <input
                      value={scheduleForm.notes}
                      onChange={(e) =>
                        setScheduleForm({ ...scheduleForm, notes: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm"
                    />
                  </div>
                  <div className="sm:col-span-3 flex items-end">
                    <button
                      type="submit"
                      disabled={createSchedule.isPending}
                      className="px-6 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all disabled:opacity-50"
                    >
                      {createSchedule.isPending ? (
                        "Salvando..."
                      ) : (
                        <span className="flex items-center gap-1">
                          <Check className="w-4 h-4" /> Criar
                        </span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center justify-between">
                <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  Agenda de Xtreinos
                </h3>
                <span className="text-xs text-[#5a5a6e]">
                  {scheduleList?.length ?? 0} registros
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2a2a3a] bg-[#0a0a0f]">
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">
                        Dia
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">
                        Horário
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">
                        Obs
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2a2a3a]">
                    {scheduleList?.map((s) => (
                      <tr
                        key={s.id}
                        className={`hover:bg-[#1a1a24] ${
                          s.status === "completed" ? "opacity-50" : ""
                        }`}
                      >
                        <td className="px-6 py-3 text-sm text-[#f0f0f5]">{s.date}</td>
                        <td className="px-6 py-3 text-sm text-[#8a8a9e]">{s.dayOfWeek}</td>
                        <td className="px-6 py-3 text-sm text-[#8a8a9e]">{s.timeBr}</td>
                        <td className="px-6 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              s.status === "completed"
                                ? "bg-green-500/10 text-green-400"
                                : s.status === "cancelled"
                                ? "bg-red-500/10 text-red-400"
                                : "bg-blue-500/10 text-blue-400"
                            }`}
                          >
                            {s.status === "completed"
                              ? "Realizado"
                              : s.status === "cancelled"
                              ? "Cancelado"
                              : "Agendado"}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm text-[#8a8a9e]">
                          {s.notes ?? "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!scheduleList?.length && (
                <div className="px-6 py-8 text-center text-[#5a5a6e] text-sm">
                  Nenhum agendamento encontrado
                </div>
              )}
            </div>

            {/* Próximos Xtreinos */}
            {scheduleList && scheduleList.length > 0 && (
              <div className="mt-6 bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
                <div className="px-6 py-4 border-b border-[#2a2a3a]">
                  <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    Próximos Xtreinos
                  </h3>
                </div>
                <div className="divide-y divide-[#2a2a3a]">
                  {scheduleList
                    .filter((s) => s.status === "scheduled")
                    .slice(0, 5)
                    .map((s) => (
                      <div key={s.id} className="flex items-center justify-between px-6 py-3">
                        <div className="flex items-center gap-4">
                          <span className="w-2 h-2 rounded-full bg-blue-400" />
                          <span className="text-sm text-[#f0f0f5]">{s.date}</span>
                          <span className="text-xs text-[#5a5a6e]">{s.dayOfWeek}</span>
                        </div>
                        <span className="text-sm text-[#8a8a9e] flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {s.timeBr}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}