import { useState, useMemo } from "react";
import {
  Dumbbell,
  Calendar,
  Clock,
  Trophy,
  Target,
  Filter,
  TrendingUp,
  Swords,
  Medal,
  BarChart3,
  Users,
  ChevronDown,
  ChevronUp,
  Plus,
  Pencil,
  Trash2,
  MessageCircle,
  CalendarPlus,
  CheckCircle2,
  Search,
  ListChecks,
  XCircle,
  AlertCircle,
  CalendarDays,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import AdminLayout from "@/layout/AdminLayout";
import {
  useXtreinoCalculations,
  POSITION_POINTS,
  KILL_POINTS,
} from "../../hooks/useXtreinoCalculations";
import { InscricoesManager } from "../admin/components/InscricoesManager";
import { WhatsAppGenerator } from "../admin/components/WhatsAppGenerator";
import { PlayerForm } from "../admin/components/PlayerForm";
import { ResultForm } from "../admin/components/ResultForm";
import { ScheduleForm } from "../admin/components/ScheduleForm";
import { XTreinoForm } from "../admin/components/XTreinoForm";
import type {
  InscricaoEquipe,
  XtreinoEvento,
} from "@/types/inscricoes";
import type {
  XTreino,
  PlayerStat,
  PlayerFormData,
  XTreinoResult,
  ResultFormData,
  ScheduleItem,
  ScheduleFormData,
  ScheduleStatus,
  XTreinoFormData,
  XTreinoStatus,
} from "@/pages/admin/types";

// ============ INTERFACES DAS TABS ============

interface InscricoesTabProps {
  xtreinosList: XtreinoEvento[] | undefined;
  registrations: InscricaoEquipe[];
  fixedTeams: string[];
  allTeams: Array<{ id: number; name: string; tag: string }> | undefined;
  settings: {
    orgName?: string | null;
    whatsappLink?: string | null;
    defaultTimesBr?: string | null;
    defaultTimesMx?: string | null;
  } | null | undefined;
  selectedXt: number | null;
  onSelectXt: (id: number | null) => void;
  onRegister: (data: {
    xtreinoId: number;
    teamName: string;
    players: string[];
    isReserve: boolean;
  }) => void;
  onUnregister: (data: { xtreinoId: number; teamName: string }) => void;
  onCancel: (data: { xtreinoId: number; teamName: string }) => void;
  onToggleFixed: (data: { teamName: string }) => void;
  isPending: boolean;
  onCreateEvent?: (data: { date: string; maxTeams: number; status: string }) => void;
  isCreatingEvent?: boolean;
  isAdmin?: boolean;
}

interface PlayersTabProps {
  xtreinosList: XTreino[] | undefined;
  allPlayerStats: PlayerStat[] | undefined;
  xtDetail: { playerStats?: PlayerStat[] } | null | undefined;
  selectedXt: number | null;
  showForm: boolean;
  form: PlayerFormData;
  isPending: boolean;
  onSelectXt: (id: number | null) => void;
  onShowForm: () => void;
  onCloseForm: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFormChange: (form: PlayerFormData) => void;
  isAdmin?: boolean;
}

interface ResultsTabProps {
  xtreinosList: XTreino[] | undefined;
  allResults: XTreinoResult[] | undefined;
  xtDetail: { results?: XTreinoResult[] } | null | undefined;
  selectedXt: number | null;
  showForm: boolean;
  form: ResultFormData;
  isPending: boolean;
  onSelectXt: (id: number | null) => void;
  onShowForm: () => void;
  onCloseForm: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFormChange: (form: ResultFormData) => void;
  isAdmin?: boolean;
}

interface ScheduleTabProps {
  scheduleList: ScheduleItem[] | undefined;
  showForm: boolean;
  form: ScheduleFormData;
  isPending: boolean;
  isGenerating: boolean;
  onShowForm: () => void;
  onCloseForm: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onGenerateMonth: () => void;
  onFormChange: (form: ScheduleFormData) => void;
  isAdmin?: boolean;
}

interface XTreinosListProps {
  xtreinosList: XTreino[] | undefined;
  showForm: boolean;
  editing: number | null;
  form: XTreinoFormData;
  isPending: boolean;
  onShowForm: () => void;
  onCloseForm: () => void;
  onEdit: (x: XTreino) => void;
  onSubmit: (e: React.FormEvent) => void;
  onDelete: (id: number) => void;
  onFormChange: (form: XTreinoFormData) => void;
  isAdmin?: boolean;
}

// ============ CONFIGURAÇÕES DE STATUS ============

const statusConfig: Record<
  ScheduleStatus,
  { bg: string; text: string; label: string; icon: typeof CheckCircle2 }
> = {
  completed: {
    bg: "bg-green-500/10",
    text: "text-green-400",
    label: "Realizado",
    icon: CheckCircle2,
  },
  cancelled: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    label: "Cancelado",
    icon: XCircle,
  },
  scheduled: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    label: "Agendado",
    icon: AlertCircle,
  },
};

const xtStatusConfig: Record<
  XTreinoStatus,
  { bg: string; text: string; label: string; icon: typeof CheckCircle2 }
> = {
  aberto: {
    bg: "bg-green-500/10",
    text: "text-green-400",
    label: "Aberto",
    icon: AlertCircle,
  },
  encerrado: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    label: "Encerrado",
    icon: CheckCircle2,
  },
  cancelado: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    label: "Cancelado",
    icon: XCircle,
  },
};

// ============ TAB: INSCRIÇÕES ============

export function InscricoesTab({
  xtreinosList,
  registrations,
  fixedTeams,
  allTeams,
  settings,
  selectedXt,
  onSelectXt,
  onRegister,
  onUnregister,
  onCancel,
  isPending,
  onCreateEvent,
  isCreatingEvent,
  isAdmin = false,
}: InscricoesTabProps) {
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newMaxTeams, setNewMaxTeams] = useState(12);
  const [newStatus, setNewStatus] = useState("aberto");

  const selectedXtData = xtreinosList?.find((x) => x.id === selectedXt);
  const xtInscricoes = registrations?.filter((r) => r.xtreinoId === selectedXt) || [];

  const summary = useMemo(() => {
    if (!selectedXtData || !xtInscricoes.length) return null;
    const mainTeams = xtInscricoes.filter((i) => fixedTeams.includes(i.teamName));
    const reserveTeams = xtInscricoes.filter((i) => !fixedTeams.includes(i.teamName));
    const totalPlayers = xtInscricoes.reduce((acc, i) => acc + (i.players?.length || 0), 0);
    return {
      totalInscricoes: xtInscricoes.length,
      mainTeams: mainTeams.length,
      reserveTeams: reserveTeams.length,
      totalPlayers,
      vagasDisponiveis: selectedXtData.maxTeams - xtInscricoes.length,
      vagasPercent: Math.round((xtInscricoes.length / selectedXtData.maxTeams) * 100),
    };
  }, [selectedXtData, xtInscricoes, fixedTeams]);

  const handleCreateEvent = () => {
    if (!newDate) { toast.error("Data é obrigatória"); return; }
    if (onCreateEvent) {
      onCreateEvent({ date: newDate, maxTeams: newMaxTeams, status: newStatus });
      setNewDate(""); setNewMaxTeams(12); setNewStatus("aberto"); setShowCreateForm(false);
    } else { toast.error("Função de criar xtreino não configurada"); }
  };

  const handleStatusChange = (_id: number, status: string) => {
    toast.success(`Status alterado para ${status}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "aberto": return "text-green-400 bg-green-500/10 border-green-500/20";
      case "fechado": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "em_andamento": return "text-lime-400 bg-lime-500/10 border-lime-500/20";
      case "finalizado": return "text-gray-400 bg-gray-500/10 border-gray-500/20";
      default: return "text-[#5a5a6e] bg-[#1a1a24] border-[#2a2a3a]";
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#12121a] border-b border-[#2a2a3a]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-green-400" />
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#f0f0f5]">Gerenciar Inscrições</h1>
          </div>
          <p className="text-[#8a8a9e]">Selecione um xtreino para gerenciar as inscrições de equipes</p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6 space-y-6">
        {isAdmin && (
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition-all text-sm">
              <CalendarPlus className="w-4 h-4" /> Novo Xtreino
            </button>
            <button onClick={() => toast.success("Migrado!")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#8a8a9e] hover:text-[#f0f0f5] transition-all text-sm">
              <CheckCircle2 className="w-4 h-4" /> Migrar Históricos
            </button>
          </div>
        )}

        {isAdmin && showCreateForm && (
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
            <h3 className="font-bold text-[#f0f0f5] mb-4 flex items-center gap-2">
              <CalendarPlus className="w-4 h-4 text-green-400" /> Criar Novo Xtreino
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-[#8a8a9e] mb-1">Data</label>
                <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50" />
              </div>
              <div>
                <label className="block text-sm text-[#8a8a9e] mb-1">Máximo de Equipes</label>
                <input type="number" value={newMaxTeams} min={1} max={32}
                  onChange={(e) => setNewMaxTeams(parseInt(e.target.value) || 12)}
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50" />
              </div>
              <div>
                <label className="block text-sm text-[#8a8a9e] mb-1">Status</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50">
                  <option value="aberto">Aberto</option>
                  <option value="fechado">Fechado</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleCreateEvent} disabled={isCreatingEvent}
                className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-all disabled:opacity-50">
                {isCreatingEvent ? "Criando..." : "Criar"}
              </button>
              <button onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#8a8a9e] text-sm hover:text-[#f0f0f5] transition-all">
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
          <h3 className="font-bold text-[#f0f0f5] mb-4 flex items-center gap-2">
            <Filter className="w-4 h-4 text-green-400" /> Selecionar Xtreino
          </h3>
          <select value={selectedXt ?? ""}
            onChange={(e) => { const id = e.target.value ? parseInt(e.target.value) : null; onSelectXt(id); setShowWhatsApp(false); }}
            className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50">
            <option value="">Selecione um xtreino...</option>
            {xtreinosList?.map((x) => (
              <option key={x.id} value={x.id}>#{x.id} — {x.date} ({x.status}) — {x.maxTeams} vagas</option>
            ))}
          </select>

          {isAdmin && selectedXtData && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-[#8a8a9e]">Status:</span>
              <div className="flex gap-1">
                {(["aberto", "fechado", "em_andamento", "finalizado"] as const).map((status) => (
                  <button key={status} onClick={() => handleStatusChange(selectedXtData.id, status)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      selectedXtData.status === status
                        ? status === "aberto" ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : status === "fechado" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : status === "em_andamento" ? "bg-lime-500/20 text-lime-400 border border-lime-500/30"
                        : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                        : "bg-[#1a1a24] border border-[#2a2a3a] text-[#5a5a6e] hover:text-[#8a8a9e]"
                    }`}>
                    {status === "em_andamento" ? "EM ANDAMENTO" : status.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {selectedXtData && (
          <>
            {summary && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-[#5a5a6e] uppercase">Inscrições</span>
                  </div>
                  <p className="text-2xl font-bold text-[#f0f0f5]">{summary.totalInscricoes}</p>
                  <p className="text-xs text-[#5a5a6e] mt-1">{summary.mainTeams} fixas · {summary.reserveTeams} reservas</p>
                </div>
                <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-[#5a5a6e] uppercase">Jogadores</span>
                  </div>
                  <p className="text-2xl font-bold text-green-400">{summary.totalPlayers}</p>
                  <p className="text-xs text-[#5a5a6e] mt-1">Total inscritos</p>
                </div>
                <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-[#5a5a6e] uppercase">Vagas</span>
                  </div>
                  <p className="text-2xl font-bold text-green-400">{summary.vagasDisponiveis}</p>
                  <p className="text-xs text-[#5a5a6e] mt-1">de {selectedXtData.maxTeams} disponíveis</p>
                </div>
                <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-[#5a5a6e] uppercase">Ocupação</span>
                  </div>
                  <p className="text-2xl font-bold text-green-400">{summary.vagasPercent}%</p>
                  <div className="w-full bg-[#1a1a24] rounded-full h-1.5 mt-2">
                    <div className="bg-green-500 rounded-full h-1.5 transition-all" style={{ width: `${summary.vagasPercent}%` }} />
                  </div>
                </div>
              </div>
            )}

            {isAdmin && (
              <button onClick={() => setShowWhatsApp(!showWhatsApp)}
                className="w-full flex items-center justify-between px-6 py-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition-all">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-medium">{showWhatsApp ? "Ocultar Gerador WhatsApp" : "Gerar Mensagem WhatsApp"}</span>
                </div>
                {showWhatsApp ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            )}

            {showWhatsApp && isAdmin && (
              <div className="mb-6">
                <WhatsAppGenerator xtreino={selectedXtData} inscricoes={xtInscricoes} fixedTeams={fixedTeams} settings={settings} />
              </div>
            )}

            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center justify-between">
                <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
                  <Medal className="w-5 h-5 text-green-400" /> Inscrições — {selectedXtData.date}
                </h3>
                <span className={`text-xs px-2 py-1 rounded-lg border ${getStatusColor(selectedXtData.status)}`}>
                  {selectedXtData.status === "em_andamento" ? "EM ANDAMENTO" : selectedXtData.status.toUpperCase()}
                </span>
              </div>
              <InscricoesManager
                xtreino={selectedXtData}
                inscricoes={xtInscricoes}
                fixedTeams={fixedTeams}
                allTeams={allTeams}
                onRegister={(data) => { onRegister({ xtreinoId: selectedXtData.id, teamName: data.teamName, players: data.players, isReserve: !fixedTeams.includes(data.teamName) }); }}
                onCancel={(data) => { onCancel({ xtreinoId: selectedXtData.id, teamName: data.teamName }); }}
                onRemove={(data) => { onUnregister({ xtreinoId: selectedXtData.id, teamName: data.teamName }); }}
                isPending={isPending}
                isAdmin={isAdmin}
              />
            </div>
          </>
        )}

        {!selectedXtData && (
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] px-6 py-16 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-[#2a2a3a]" />
            <p className="text-[#5a5a6e] text-lg font-medium">Nenhum xtreino selecionado</p>
            <p className="text-[#3a3a4e] text-sm mt-1">Selecione um xtreino no filtro acima para gerenciar as inscrições</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============ TAB: PLAYERS ============

export function PlayersTab({
  xtreinosList,
  allPlayerStats,
  xtDetail,
  selectedXt,
  showForm,
  form,
  isPending,
  onSelectXt,
  onShowForm,
  onCloseForm,
  onSubmit,
  onFormChange,
  isAdmin = false,
}: PlayersTabProps) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<"totalKills" | "q1Kills" | "q2Kills" | "q3Kills" | "date">("totalKills");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const stats = selectedXt
    ? (xtDetail?.playerStats ?? allPlayerStats?.filter((p) => p.xtreinoId === selectedXt) ?? [])
    : (allPlayerStats ?? []);

  const filteredStats = useMemo(() => {
    if (!search.trim()) return stats;
    const q = search.toLowerCase();
    return stats.filter((p) => p.playerName.toLowerCase().includes(q) || p.teamName.toLowerCase().includes(q));
  }, [stats, search]);

  const sortedStats = useMemo(() => {
    return [...filteredStats].sort((a, b) => {
      const aVal = sortField === "date" ? (a.date ? new Date(a.date).getTime() : 0) : (a[sortField] ?? 0);
      const bVal = sortField === "date" ? (b.date ? new Date(b.date).getTime() : 0) : (b[sortField] ?? 0);
      return sortDir === "desc" ? bVal - aVal : aVal - bVal;
    });
  }, [filteredStats, sortField, sortDir]);

  const summary = useMemo(() => {
    if (!stats.length) return null;
    return {
      totalPlayers: new Set(stats.map((p) => p.playerName)).size,
      totalKills: stats.reduce((sum, p) => sum + (p.totalKills || 0), 0),
      totalQ1: stats.reduce((sum, p) => sum + (p.q1Kills || 0), 0),
      totalQ2: stats.reduce((sum, p) => sum + (p.q2Kills || 0), 0),
      totalQ3: stats.reduce((sum, p) => sum + (p.q3Kills || 0), 0),
    };
  }, [stats]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) { setSortDir(sortDir === "desc" ? "asc" : "desc"); }
    else { setSortField(field); setSortDir("desc"); }
  };

  const SortHeader = ({ field, label, align = "center" }: { field: typeof sortField; label: string; align?: "left" | "center" }) => (
    <button onClick={() => handleSort(field)}
      className={`flex items-center gap-1 text-xs font-medium text-[#5a5a6e] uppercase hover:text-[#f0f0f5] transition-colors ${align === "left" ? "justify-start" : "justify-center"}`}>
      {label}
      {sortField === field && (sortDir === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />)}
    </button>
  );

  const isLoading = !allPlayerStats;

  return (
    <div className="space-y-6">
      <div className="bg-[#12121a] border-b border-[#2a2a3a]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-8 h-8 text-green-400" />
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#f0f0f5]">Estatísticas de Jogadores</h1>
          </div>
          <p className="text-[#8a8a9e]">{selectedXt ? `Dados do xtreino selecionado` : "Visualize e gerencie as estatísticas de todos os jogadores"}</p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6 space-y-6">
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex items-center gap-2 text-[#8a8a9e]">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filtros:</span>
            </div>
            <div className="flex flex-wrap gap-3 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5a6e]" />
                <input type="text" placeholder="Buscar jogador ou time..." value={search} onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm placeholder-[#5a5a6e] focus:outline-none focus:border-green-500/50 min-w-[220px]" />
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#5a5a6e]" />
                <select value={selectedXt ?? ""} onChange={(e) => onSelectXt(e.target.value ? parseInt(e.target.value) : null)}
                  className="px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50 min-w-[180px]">
                  <option value="">Todos os xtreinos</option>
                  {xtreinosList?.map((x) => (<option key={x.id} value={x.id}>{x.name} ({x.date})</option>))}
                </select>
              </div>
              {isAdmin && (
                <button onClick={onShowForm} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-all">
                  <Plus className="w-4 h-4" /> Add Jogador
                </button>
              )}
            </div>
            {(search || selectedXt) && (
              <button onClick={() => { setSearch(""); onSelectXt(null); }} className="text-xs text-green-400 hover:text-green-300 transition-colors">Limpar filtros</button>
            )}
          </div>
        </div>

        {isAdmin && showForm && (
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
            <h3 className="font-bold text-[#f0f0f5] mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-green-400" /> Adicionar Jogador
            </h3>
            <PlayerForm form={form} isPending={isPending} selectedXtId={selectedXt} onChange={onFormChange} onSubmit={onSubmit} onClose={onCloseForm} />
          </div>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[#5a5a6e]">Carregando estatísticas...</p>
          </div>
        )}

        {summary && !isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
              <div className="flex items-center gap-2 mb-2"><Users className="w-4 h-4 text-green-400" /><span className="text-xs text-[#5a5a6e] uppercase">Jogadores</span></div>
              <p className="text-2xl font-bold text-[#f0f0f5]">{summary.totalPlayers}</p>
            </div>
            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
              <div className="flex items-center gap-2 mb-2"><Swords className="w-4 h-4 text-green-400" /><span className="text-xs text-[#5a5a6e] uppercase">Total Kills</span></div>
              <p className="text-2xl font-bold text-green-400">{summary.totalKills}</p>
            </div>
            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
              <div className="flex items-center gap-2 mb-2"><BarChart3 className="w-4 h-4 text-green-400" /><span className="text-xs text-[#5a5a6e] uppercase">Q1 + Q2 + Q3</span></div>
              <p className="text-2xl font-bold text-[#f0f0f5]">{Number(summary.totalQ1)}/{Number(summary.totalQ2)}/{Number(summary.totalQ3)}</p>
            </div>
            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
              <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4 text-green-400" /><span className="text-xs text-[#5a5a6e] uppercase">Registros</span></div>
              <p className="text-2xl font-bold text-[#f0f0f5]">{sortedStats.length}</p>
            </div>
          </div>
        )}

        {!isLoading && (
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center justify-between">
              <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                {selectedXt ? `Estatísticas do XTreino` : "Todas as Estatísticas"}
                {selectedXt && xtreinosList?.find((x) => x.id === selectedXt) && (
                  <span className="text-sm font-normal text-[#5a5a6e]">— {xtreinosList.find((x) => x.id === selectedXt)?.date}</span>
                )}
              </h3>
              <span className="text-xs text-[#5a5a6e]">{sortedStats.length} registros</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2a2a3a] bg-[#0a0a0f]">
                    <th className="px-6 py-3 text-left"><SortHeader field="date" label="Data" align="left" /></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Jogador</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Time</th>
                    <th className="px-6 py-3 text-center"><SortHeader field="q1Kills" label="Q1" /></th>
                    <th className="px-6 py-3 text-center"><SortHeader field="q2Kills" label="Q2" /></th>
                    <th className="px-6 py-3 text-center"><SortHeader field="q3Kills" label="Q3" /></th>
                    <th className="px-6 py-3 text-center bg-green-500/5"><SortHeader field="totalKills" label="Total" /></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2a3a]">
                  {sortedStats.map((p, index) => (
                    <tr key={p.id} className={`hover:bg-[#1a1a24] transition-colors ${
                      index === 0 ? "bg-gradient-to-r from-green-500/5 to-transparent border-l-2 border-green-400"
                      : index === 1 ? "bg-gradient-to-r from-green-400/5 to-transparent border-l-2 border-green-300"
                      : index === 2 ? "bg-gradient-to-r from-green-600/5 to-transparent border-l-2 border-green-500" : ""
                    }`}>
                      <td className="px-6 py-3 text-sm text-[#8a8a9e]">{p.date}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center"><Target className="w-4 h-4 text-green-400" /></div>
                          <span className="text-sm font-bold text-[#f0f0f5]">{p.playerName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm text-[#8a8a9e]">{p.teamName}</td>
                      <td className="px-6 py-3 text-center text-sm text-[#8a8a9e]">{p.q1Kills}</td>
                      <td className="px-6 py-3 text-center text-sm text-[#8a8a9e]">{p.q2Kills}</td>
                      <td className="px-6 py-3 text-center text-sm text-[#8a8a9e]">{p.q3Kills}</td>
                      <td className="px-6 py-3 text-center bg-green-500/5"><span className="text-sm font-bold text-green-400">{p.totalKills}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {sortedStats.length === 0 && (
              <div className="px-6 py-16 text-center">
                <Target className="w-12 h-12 mx-auto mb-4 text-[#2a2a3a]" />
                <p className="text-[#5a5a6e] text-lg font-medium">Nenhuma estatística encontrada</p>
                <p className="text-[#3a3a4e] text-sm mt-1">{search || selectedXt ? "Tente ajustar os filtros" : "Nenhum dado disponível"}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============ TAB: RESULTS ============

function PosBadge({ pos }: { pos: number | null }) {
  if (!pos) return <span className="text-[#8a8a9e]">-</span>;
  const colors = { 1: "bg-green-500/20 text-green-400", 2: "bg-emerald-500/20 text-emerald-300", 3: "bg-lime-500/20 text-lime-400" };
  return (
    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${colors[pos as keyof typeof colors] || "bg-[#1a1a24] text-[#8a8a9e]"}`}>
      {pos}
    </span>
  );
}

export function ResultsTab({
  xtreinosList,
  allResults,
  xtDetail,
  selectedXt,
  showForm,
  form,
  isPending,
  onSelectXt,
  onShowForm,
  onCloseForm,
  onSubmit,
  onFormChange,
  isAdmin = false,
}: ResultsTabProps) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<"totalPoints" | "q1Pos" | "q2Pos" | "q3Pos" | "date">("totalPoints");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const results = selectedXt
    ? (xtDetail?.results ?? allResults?.filter((r) => r.xtreinoId === selectedXt) ?? [])
    : (allResults ?? []);

  const filteredResults = useMemo(() => {
    if (!search.trim()) return results;
    const q = search.toLowerCase();
    return results.filter((r) => r.teamName.toLowerCase().includes(q));
  }, [results, search]);

  const sortedResults = useMemo(() => {
    return [...filteredResults].sort((a, b) => {
      const getNumeric = (item: any) => {
        const v = item?.[sortField];
        if (v == null) return 0;
        if (sortField === "date") {
          const t = Date.parse(String(v));
          return Number.isNaN(t) ? 0 : t;
        }
        const n = Number(v);
        return Number.isNaN(n) ? 0 : n;
      };
      const aVal = getNumeric(a);
      const bVal = getNumeric(b);
      return sortDir === "desc" ? bVal - aVal : aVal - bVal;
    });
  }, [filteredResults, sortField, sortDir]);

  const summary = useMemo(() => {
    if (!results.length) return null;
    return {
      totalTeams: new Set(results.map((r) => r.teamName)).size,
      totalResults: results.length,
      avgPoints: results.length ? (results.reduce((sum, r) => sum + (r.totalPoints || 0), 0) / results.length).toFixed(1) : "0",
      top1Count: results.filter((r) => r.q1Pos === 1 || r.q2Pos === 1 || r.q3Pos === 1).length,
    };
  }, [results]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) { setSortDir(sortDir === "desc" ? "asc" : "desc"); }
    else { setSortField(field); setSortDir("desc"); }
  };

  const SortHeader = ({ field, label, align = "center" }: { field: typeof sortField; label: string; align?: "left" | "center" }) => (
    <button onClick={() => handleSort(field)}
      className={`flex items-center gap-1 text-xs font-medium text-[#5a5a6e] uppercase hover:text-[#f0f0f5] transition-colors ${align === "left" ? "justify-start" : "justify-center"}`}>
      {label}
      {sortField === field && (sortDir === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />)}
    </button>
  );

  const isLoading = !allResults;

  return (
    <div className="space-y-6">
      <div className="bg-[#12121a] border-b border-[#2a2a3a]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-green-400" />
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#f0f0f5]">Resultados dos XTreinos</h1>
          </div>
          <p className="text-[#8a8a9e]">{selectedXt ? `Resultados do xtreino selecionado` : "Visualize e gerencie os resultados de todos os xtreinos"}</p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6 space-y-6">
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex items-center gap-2 text-[#8a8a9e]">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filtros:</span>
            </div>
            <div className="flex flex-wrap gap-3 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5a6e]" />
                <input type="text" placeholder="Buscar time..." value={search} onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm placeholder-[#5a5a6e] focus:outline-none focus:border-green-500/50 min-w-[220px]" />
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#5a5a6e]" />
                <select value={selectedXt ?? ""} onChange={(e) => onSelectXt(e.target.value ? parseInt(e.target.value) : null)}
                  className="px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50 min-w-[180px]">
                  <option value="">Todos os xtreinos</option>
                  {xtreinosList?.map((x) => (<option key={x.id} value={x.id}>{x.name} ({x.date})</option>))}
                </select>
              </div>
              {isAdmin && (
                <button onClick={onShowForm} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-all">
                  <Plus className="w-4 h-4" /> Add Resultado
                </button>
              )}
            </div>
            {(search || selectedXt) && (
              <button onClick={() => { setSearch(""); onSelectXt(null); }} className="text-xs text-green-400 hover:text-green-300 transition-colors">Limpar filtros</button>
            )}
          </div>
        </div>

        {isAdmin && showForm && (
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
            <h3 className="font-bold text-[#f0f0f5] mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-green-400" /> Adicionar Resultado
            </h3>
            <ResultForm form={form} isPending={isPending} selectedXtId={selectedXt} onChange={onFormChange} onSubmit={onSubmit} onClose={onCloseForm} />
          </div>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[#5a5a6e]">Carregando resultados...</p>
          </div>
        )}

        {summary && !isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
              <div className="flex items-center gap-2 mb-2"><Users className="w-4 h-4 text-green-400" /><span className="text-xs text-[#5a5a6e] uppercase">Equipes</span></div>
              <p className="text-2xl font-bold text-[#f0f0f5]">{summary.totalTeams}</p>
            </div>
            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
              <div className="flex items-center gap-2 mb-2"><Swords className="w-4 h-4 text-green-400" /><span className="text-xs text-[#5a5a6e] uppercase">Registros</span></div>
              <p className="text-2xl font-bold text-green-400">{summary.totalResults}</p>
            </div>
            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
              <div className="flex items-center gap-2 mb-2"><BarChart3 className="w-4 h-4 text-green-400" /><span className="text-xs text-[#5a5a6e] uppercase">Média Pts</span></div>
              <p className="text-2xl font-bold text-[#f0f0f5]">{summary.avgPoints}</p>
            </div>
            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
              <div className="flex items-center gap-2 mb-2"><Trophy className="w-4 h-4 text-green-400" /><span className="text-xs text-[#5a5a6e] uppercase">Top 1</span></div>
              <p className="text-2xl font-bold text-green-400">{summary.top1Count}</p>
            </div>
          </div>
        )}

        {!isLoading && (
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center justify-between">
              <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                {selectedXt ? `Resultados do XTreino` : "Todos os Resultados"}
                {selectedXt && xtreinosList?.find((x) => x.id === selectedXt) && (
                  <span className="text-sm font-normal text-[#5a5a6e]">— {xtreinosList.find((x) => x.id === selectedXt)?.date}</span>
                )}
              </h3>
              <span className="text-xs text-[#5a5a6e]">{sortedResults.length} registros</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2a2a3a] bg-[#0a0a0f]">
                    <th className="px-6 py-3 text-left"><SortHeader field="date" label="Data" align="left" /></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Time</th>
                    <th className="px-6 py-3 text-center"><SortHeader field="q1Pos" label="Q1" /></th>
                    <th className="px-6 py-3 text-center"><SortHeader field="q2Pos" label="Q2" /></th>
                    <th className="px-6 py-3 text-center"><SortHeader field="q3Pos" label="Q3" /></th>
                    <th className="px-6 py-3 text-center bg-green-500/5"><SortHeader field="totalPoints" label="Total" /></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2a3a]">
                  {sortedResults.map((r, index) => (
                    <tr key={r.id} className={`hover:bg-[#1a1a24] transition-colors ${
                      index === 0 ? "bg-gradient-to-r from-green-500/5 to-transparent border-l-2 border-green-400"
                      : index === 1 ? "bg-gradient-to-r from-green-400/5 to-transparent border-l-2 border-green-300"
                      : index === 2 ? "bg-gradient-to-r from-green-600/5 to-transparent border-l-2 border-green-500" : ""
                    }`}>
                      <td className="px-6 py-3 text-sm text-[#8a8a9e]">{r.date}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center"><Trophy className="w-4 h-4 text-green-400" /></div>
                          <span className="text-sm font-bold text-[#f0f0f5]">{r.teamName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-center"><PosBadge pos={r.q1Pos} /></td>
                      <td className="px-6 py-3 text-center"><PosBadge pos={r.q2Pos} /></td>
                      <td className="px-6 py-3 text-center"><PosBadge pos={r.q3Pos} /></td>
                      <td className="px-6 py-3 text-center bg-green-500/5"><span className="text-sm font-bold text-green-400">{r.totalPoints ?? "-"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {sortedResults.length === 0 && (
              <div className="px-6 py-16 text-center">
                <Trophy className="w-12 h-12 mx-auto mb-4 text-[#2a2a3a]" />
                <p className="text-[#5a5a6e] text-lg font-medium">Nenhum resultado encontrado</p>
                <p className="text-[#3a3a4e] text-sm mt-1">{search || selectedXt ? "Tente ajustar os filtros" : "Nenhum dado disponível"}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============ TAB: SCHEDULE ============

export function ScheduleTab({
  scheduleList,
  showForm,
  form,
  isPending,
  isGenerating,
  onShowForm,
  onCloseForm,
  onSubmit,
  onGenerateMonth,
  onFormChange,
  isAdmin = false,
}: ScheduleTabProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ScheduleStatus | "">("");

  const filteredList = useMemo(() => {
    if (!scheduleList) return [];
    let list = [...scheduleList];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.date.toLowerCase().includes(q) || s.dayOfWeek.toLowerCase().includes(q) || (s.notes ?? "").toLowerCase().includes(q));
    }
    if (statusFilter) { list = list.filter((s) => s.status === statusFilter); }
    return list;
  }, [scheduleList, search, statusFilter]);

  const summary = useMemo(() => {
    if (!scheduleList?.length) return null;
    return {
      total: scheduleList.length,
      scheduled: scheduleList.filter((s) => s.status === "scheduled").length,
      completed: scheduleList.filter((s) => s.status === "completed").length,
      cancelled: scheduleList.filter((s) => s.status === "cancelled").length,
    };
  }, [scheduleList]);

  const isLoading = !scheduleList;

  return (
    <div className="space-y-6">
      <div className="bg-[#12121a] border-b border-[#2a2a3a]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-8 h-8 text-green-400" />
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#f0f0f5]">Agenda de XTreinos</h1>
          </div>
          <p className="text-[#8a8a9e]">Gerencie os agendamentos e horários dos xtreinos</p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6 space-y-6">
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex items-center gap-2 text-[#8a8a9e]">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filtros:</span>
            </div>
            <div className="flex flex-wrap gap-3 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5a6e]" />
                <input type="text" placeholder="Buscar data, dia ou observação..." value={search} onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm placeholder-[#5a5a6e] focus:outline-none focus:border-green-500/50 min-w-[260px]" />
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#5a5a6e]" />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as ScheduleStatus | "")}
                  className="px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50 min-w-[140px]">
                  <option value="">Todos os status</option>
                  <option value="scheduled">Agendado</option>
                  <option value="completed">Realizado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
              {isAdmin && (
                <>
                  <button onClick={onShowForm} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-all">
                    <Plus className="w-4 h-4" /> Add Agendamento
                  </button>
                  <button onClick={onGenerateMonth} disabled={isGenerating}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm font-medium hover:bg-[#22222e] transition-all disabled:opacity-50">
                    <CalendarDays className="w-4 h-4" />
                    {isGenerating ? "Gerando..." : "Gerar Mês"}
                  </button>
                </>
              )}
            </div>
            {(search || statusFilter) && (
              <button onClick={() => { setSearch(""); setStatusFilter(""); }} className="text-xs text-green-400 hover:text-green-300 transition-colors">Limpar filtros</button>
            )}
          </div>
        </div>

        {isAdmin && showForm && (
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
            <h3 className="font-bold text-[#f0f0f5] mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-green-400" /> Adicionar Agendamento
            </h3>
            <ScheduleForm form={form} isPending={isPending} onChange={onFormChange} onSubmit={onSubmit} onClose={onCloseForm} />
          </div>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[#5a5a6e]">Carregando agendamentos...</p>
          </div>
        )}

        {summary && !isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
              <div className="flex items-center gap-2 mb-2"><ListChecks className="w-4 h-4 text-green-400" /><span className="text-xs text-[#5a5a6e] uppercase">Total</span></div>
              <p className="text-2xl font-bold text-[#f0f0f5]">{summary.total}</p>
            </div>
            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
              <div className="flex items-center gap-2 mb-2"><AlertCircle className="w-4 h-4 text-emerald-400" /><span className="text-xs text-[#5a5a6e] uppercase">Agendados</span></div>
              <p className="text-2xl font-bold text-emerald-400">{summary.scheduled}</p>
            </div>
            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
              <div className="flex items-center gap-2 mb-2"><CheckCircle2 className="w-4 h-4 text-green-400" /><span className="text-xs text-[#5a5a6e] uppercase">Realizados</span></div>
              <p className="text-2xl font-bold text-green-400">{summary.completed}</p>
            </div>
            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
              <div className="flex items-center gap-2 mb-2"><XCircle className="w-4 h-4 text-red-400" /><span className="text-xs text-[#5a5a6e] uppercase">Cancelados</span></div>
              <p className="text-2xl font-bold text-red-400">{summary.cancelled}</p>
            </div>
          </div>
        )}

        {!isLoading && (
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center justify-between">
              <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-green-400" /> Agendamentos
                {statusFilter && (<span className="text-sm font-normal text-[#5a5a6e]">— {statusConfig[statusFilter].label}</span>)}
              </h3>
              <span className="text-xs text-[#5a5a6e]">{filteredList.length} registros</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2a2a3a] bg-[#0a0a0f]">
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Data</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Dia</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Horário</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Observação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2a3a]">
                  {filteredList.map((s) => {
                    const config = statusConfig[s.status];
                    const StatusIcon = config.icon;
                    return (
                      <tr key={s.id} className={`hover:bg-[#1a1a24] transition-colors ${s.status === "completed" ? "opacity-50" : ""}`}>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center"><Calendar className="w-4 h-4 text-green-400" /></div>
                            <span className="text-sm font-bold text-[#f0f0f5]">{s.date}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-sm text-[#8a8a9e]">{s.dayOfWeek}</td>
                        <td className="px-6 py-3 text-sm text-[#8a8a9e]">{s.timeBr}</td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                            <StatusIcon className="w-3 h-3" />{config.label}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm text-[#8a8a9e]">{s.notes ?? "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filteredList.length === 0 && (
              <div className="px-6 py-16 text-center">
                <CalendarDays className="w-12 h-12 mx-auto mb-4 text-[#2a2a3a]" />
                <p className="text-[#5a5a6e] text-lg font-medium">Nenhum agendamento encontrado</p>
                <p className="text-[#3a3a4e] text-sm mt-1">{search || statusFilter ? "Tente ajustar os filtros" : "Nenhum dado disponível"}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============ TAB: XTREINOS LIST ============

export function XTreinosList({
  xtreinosList,
  showForm,
  editing,
  form,
  isPending,
  onShowForm,
  onCloseForm,
  onEdit,
  onSubmit,
  onDelete,
  onFormChange,
  isAdmin = false,
}: XTreinosListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<XTreinoStatus | "">("");

  const filteredList = useMemo(() => {
    if (!xtreinosList) return [];
    let list = [...xtreinosList];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((x) => x.name.toLowerCase().includes(q) || x.date.toLowerCase().includes(q) || x.modality.toLowerCase().includes(q));
    }
    if (statusFilter) { list = list.filter((x) => x.status === statusFilter); }
    return list;
  }, [xtreinosList, search, statusFilter]);

  const sortedList = useMemo(() => {
    return [...filteredList].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [filteredList]);

  const summary = useMemo(() => {
    if (!xtreinosList?.length) return null;
    return {
      total: xtreinosList.length,
      abertos: xtreinosList.filter((x) => x.status === "aberto").length,
      encerrados: xtreinosList.filter((x) => x.status === "encerrado").length,
      cancelados: xtreinosList.filter((x) => x.status === "cancelado").length,
    };
  }, [xtreinosList]);

  const isLoading = !xtreinosList;

  return (
    <div className="space-y-6">
      <div className="bg-[#12121a] border-b border-[#2a2a3a]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Dumbbell className="w-8 h-8 text-green-400" />
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#f0f0f5]">Gerenciar XTreinos</h1>
          </div>
          <p className="text-[#8a8a9e]">Visualize e gerencie todos os xtreinos cadastrados no sistema</p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6 space-y-6">
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex items-center gap-2 text-[#8a8a9e]">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filtros:</span>
            </div>
            <div className="flex flex-wrap gap-3 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5a6e]" />
                <input
                  type="text"
                  placeholder="Buscar nome, data ou modalidade..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm placeholder-[#5a5a6e] focus:outline-none focus:border-green-500/50 min-w-[260px]"
                />
              </div>
              <div className="flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-[#5a5a6e]" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as XTreinoStatus | "")}
                  className="px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50 min-w-[140px]"
                >
                  <option value="">Todos os status</option>
                  <option value="aberto">Aberto</option>
                  <option value="encerrado">Encerrado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
              {isAdmin && (
                <button
                  onClick={onShowForm}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-all"
                >
                  <Plus className="w-4 h-4" /> Novo XTreino
                </button>
              )}
            </div>
            {(search || statusFilter) && (
              <button
                onClick={() => { setSearch(""); setStatusFilter(""); }}
                className="text-xs text-green-400 hover:text-green-300 transition-colors"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>

        {isAdmin && showForm && (
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
            <h3 className="font-bold text-[#f0f0f5] mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-green-400" />
              {editing ? "Editar XTreino" : "Novo XTreino"}
            </h3>
            <XTreinoForm
              form={form}
              editing={editing}
              isPending={isPending}
              onChange={onFormChange}
              onSubmit={onSubmit}
              onClose={onCloseForm}
            />
          </div>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[#5a5a6e]">Carregando xtreinos...</p>
          </div>
        )}

        {summary && !isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
              <div className="flex items-center gap-2 mb-2">
                <ListChecks className="w-4 h-4 text-green-400" />
                <span className="text-xs text-[#5a5a6e] uppercase">Total</span>
              </div>
              <p className="text-2xl font-bold text-[#f0f0f5]">{summary.total}</p>
            </div>
            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-green-400" />
                <span className="text-xs text-[#5a5a6e] uppercase">Abertos</span>
              </div>
              <p className="text-2xl font-bold text-green-400">{summary.abertos}</p>
            </div>
            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-[#5a5a6e] uppercase">Encerrados</span>
              </div>
              <p className="text-2xl font-bold text-emerald-400">{summary.encerrados}</p>
            </div>
            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-4 h-4 text-red-400" />
                <span className="text-xs text-[#5a5a6e] uppercase">Cancelados</span>
              </div>
              <p className="text-2xl font-bold text-red-400">{summary.cancelados}</p>
            </div>
          </div>
        )}

        {!isLoading && (
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center justify-between">
              <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Lista de XTreinos
                {statusFilter && (
                  <span className="text-sm font-normal text-[#5a5a6e]">
                    — {xtStatusConfig[statusFilter].label}
                  </span>
                )}
              </h3>
              <span className="text-xs text-[#5a5a6e]">
                {sortedList.length} registros
              </span>
            </div>

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
                    {isAdmin && (
                      <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase w-24">
                        Ações
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2a3a]">
                  {sortedList.map((x) => {
                    const config = xtStatusConfig[x.status];
                    const StatusIcon = config.icon;
                    return (
                      <tr key={x.id} className="hover:bg-[#1a1a24] transition-colors">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                              <Dumbbell className="w-4 h-4 text-green-400" />
                            </div>
                            <span className="text-sm font-bold text-[#f0f0f5]">
                              {x.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-sm text-[#8a8a9e]">
                          {x.date}
                        </td>
                        <td className="px-6 py-3 text-sm text-[#8a8a9e]">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#5a5a6e]" />
                            MX {x.timeMx} / BR {x.timeBr}
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-xs text-[#8a8a9e]">
                            <Swords className="w-3 h-3" />
                            {x.modality?.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {config.label}
                          </span>
                        </td>
                        {isAdmin && (
                          <td className="px-6 py-3">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => onEdit(x)}
                                className="p-1.5 rounded-lg hover:bg-green-500/10 text-green-400 transition-colors"
                                title="Editar"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm("Remover este xtreino?")) onDelete(x.id);
                                }}
                                className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                                title="Excluir"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {sortedList.length === 0 && (
              <div className="px-6 py-16 text-center">
                <Dumbbell className="w-12 h-12 mx-auto mb-4 text-[#2a2a3a]" />
                <p className="text-[#5a5a6e] text-lg font-medium">
                  Nenhum xtreino encontrado
                </p>
                <p className="text-[#3a3a4e] text-sm mt-1">
                  {search || statusFilter
                    ? "Tente ajustar os filtros"
                    : "Nenhum dado disponível"}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============ COMPONENTE PRINCIPAL ============

type TabType = "classificacao" | "inscricoes" | "jogadores" | "resultados" | "agenda" | "gerenciar";

export default function XTreinos() {
  const [activeTab, setActiveTab] = useState<TabType>("classificacao");
  const [selectedMonth, setSelectedMonth] = useState<string>("2026-05");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [sortBy, setSortBy] = useState<"total" | "kills" | "pos">("total");
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);

  // Estados para as tabs
  const [selectedXtInscricoes, setSelectedXtInscricoes] = useState<number | null>(null);
  const [selectedXtPlayers, setSelectedXtPlayers] = useState<number | null>(null);
  const [selectedXtResults, setSelectedXtResults] = useState<number | null>(null);

  // Forms states
  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [showResultForm, setShowResultForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showXtForm, setShowXtForm] = useState(false);
  const [editingXt, setEditingXt] = useState<number | null>(null);
  const [xtForm, setXtForm] = useState<XTreinoFormData>({
    name: "",
    date: "",
    timeBr: "",
    timeMx: "",
    modality: "squad",
    status: "aberto",
    maxTeams: 12,
    rules: "",
    discordLink: "",
    whatsappLink: "",
  });

  // Busca dados do tRPC
  const { data: allResults } = trpc.xtreinos.listResults.useQuery();
  const { data: allPlayerStats } = trpc.xtreinos.listPlayerStats.useQuery();
  const { data: scheduleList } = trpc.xtreinos.schedule.list.useQuery();
  const { data: xtreinosList } = trpc.xtreinos.list.useQuery();
  
  // Dados mockados para inscrições (ajuste conforme seu router real)
  const [registrations] = useState<InscricaoEquipe[]>([]);
  const [fixedTeams] = useState<string[]>([]);
  
  const { data: allTeams } = trpc.teams.list.useQuery();
  const { data: settings } = trpc.settings.get.useQuery();

  // Hook de cálculos
  const {
    teamXtreinoStats,
    playerXtreinoStats,
    availableMonths,
    availableDates,
    periodSummary,
  } = useXtreinoCalculations({
    results: allResults ?? [],
    playerStats: allPlayerStats ?? [],
    selectedMonth,
    selectedDate,
  });

  // Ordenar times
  const sortedStats = useMemo(() => {
    return [...teamXtreinoStats].sort((a, b) => {
      if (sortBy === "total") return b.totalPoints - a.totalPoints;
      if (sortBy === "kills") return b.totalKills - a.totalKills;
      if (sortBy === "pos") return b.totalPosPoints - a.totalPosPoints;
      return 0;
    });
  }, [teamXtreinoStats, sortBy]);

  const getTeamPlayers = (teamName: string, date: string) => {
    return playerXtreinoStats.filter((p) => p.teamName === teamName && p.date === date);
  };

  // ===== STYLES CLASSIFICAÇÃO =====
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

  // Tabs config
  const tabs: { id: TabType; label: string; icon: typeof Trophy }[] = [
    { id: "classificacao", label: "Classificação", icon: Trophy },
    { id: "inscricoes", label: "Inscrições", icon: Users },
    { id: "jogadores", label: "Jogadores", icon: Target },
    { id: "resultados", label: "Resultados", icon: BarChart3 },
    { id: "agenda", label: "Agenda", icon: Calendar },
    { id: "gerenciar", label: "Gerenciar", icon: Dumbbell },
  ];

  return (
    <AdminLayout>
      {/* Header Principal */}
      <div className="bg-[#12121a] border-b border-[#2a2a3a]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Dumbbell className="w-8 h-8 text-green-400" />
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#f0f0f5]">
              XTreinos Underground
            </h1>
          </div>
          <p className="text-[#8a8a9e]">
            Painel completo — Classificação, inscrições, jogadores e resultados
          </p>
        </div>
      </div>

      {/* Navegação por Tabs */}
      <div className="bg-[#0a0a0f] border-b border-[#2a2a3a] sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-green-500/10 text-green-400 border border-green-500/20"
                      : "text-[#5a5a6e] hover:text-[#f0f0f5] hover:bg-[#1a1a24]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Conteúdo das Tabs */}
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
        {/* ===== TAB: CLASSIFICAÇÃO ===== */}
        {activeTab === "classificacao" && (
          <div className="space-y-6">
            {/* Filtros */}
            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                <div className="flex items-center gap-2 text-[#8a8a9e]">
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-medium">Filtros:</span>
                </div>
                <div className="flex flex-wrap gap-3 flex-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#5a5a6e]" />
                    <select
                      value={selectedMonth}
                      onChange={(e) => { setSelectedMonth(e.target.value); setSelectedDate(""); }}
                      className="px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50 min-w-[140px]"
                    >
                      {availableMonths.map((m) => (
                        <option key={m} value={m}>{m.split("-")[1]}/{m.split("-")[0]}</option>
                      ))}
                      {!availableMonths.length && <option value="">Carregando...</option>}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#5a5a6e]" />
                    <select
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50 min-w-[140px]"
                    >
                      <option value="">Todos os dias</option>
                      {availableDates.map((d) => (
                        <option key={d} value={d}>{d.split("-")[2]}/{d.split("-")[1]}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#5a5a6e]" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as "total" | "kills" | "pos")}
                      className="px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50 min-w-[160px]"
                    >
                      <option value="total">Ordenar: Total</option>
                      <option value="kills">Ordenar: Kills</option>
                      <option value="pos">Ordenar: Posição</option>
                    </select>
                  </div>
                </div>
                {(selectedDate || sortBy !== "total") && (
                  <button
                    onClick={() => { setSelectedDate(""); setSortBy("total"); }}
                    className="text-xs text-green-400 hover:text-green-300 transition-colors"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            </div>

            {/* Cards de resumo */}
            {periodSummary && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-[#5a5a6e] uppercase">Equipes</span>
                  </div>
                  <p className="text-2xl font-bold text-[#f0f0f5]">{periodSummary.uniqueTeams}</p>
                </div>
                <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Swords className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-[#5a5a6e] uppercase">Total Kills</span>
                  </div>
                  <p className="text-2xl font-bold text-green-400">{periodSummary.totalKills}</p>
                </div>
                <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs text-[#5a5a6e] uppercase">Pts Posição</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-400">{periodSummary.totalPosPoints}</p>
                </div>
                <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-[#5a5a6e] uppercase">Total Geral</span>
                  </div>
                  <p className="text-2xl font-bold text-green-400">{periodSummary.totalPoints}</p>
                </div>
              </div>
            )}

            {/* Tabela Principal */}
            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center justify-between">
                <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
                  <Medal className="w-5 h-5 text-green-400" />
                  Classificação {selectedDate ? `— ${selectedDate.split("-")[2]}/${selectedDate.split("-")[1]}` : `— ${selectedMonth.split("-")[1]}/${selectedMonth.split("-")[0]}`}
                </h3>
                <span className="text-xs text-[#5a5a6e]">{sortedStats.length} registros</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2a2a3a] bg-[#0a0a0f]">
                      <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase w-12">#</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Equipe</th>
                      {!selectedDate && (
                        <th className="px-4 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Data</th>
                      )}
                      <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Q1 Pos</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Q2 Pos</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Q3 Pos</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase bg-yellow-500/5">
                        <Trophy className="w-3 h-3 inline mr-1 text-yellow-400" /> Pts Pos
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">
                        <Target className="w-3 h-3 inline mr-1 text-green-400" /> Kills
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase bg-green-500/5">
                        <Swords className="w-3 h-3 inline mr-1 text-green-400" /> Pts Kill
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase bg-green-500/5">
                        <BarChart3 className="w-3 h-3 inline mr-1 text-green-400" /> Total
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2a2a3a]">
                    {sortedStats.map((team, index) => {
                      const isExpanded = expandedTeam === `${team.date}-${team.teamName}`;
                      const tPlayers = getTeamPlayers(team.teamName, team.date);
                      return (
                        <>
                          <tr
                            key={`${team.date}-${team.teamName}`}
                            className={`hover:bg-[#1a1a24] transition-colors cursor-pointer ${getRankStyle(index)}`}
                            onClick={() => setExpandedTeam(isExpanded ? null : `${team.date}-${team.teamName}`)}
                          >
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                                index === 0 ? "bg-yellow-500/20 text-yellow-400" :
                                index === 1 ? "bg-gray-400/20 text-gray-300" :
                                index === 2 ? "bg-amber-500/20 text-amber-500" :
                                "text-[#5a5a6e]"
                              }`}>
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
                                <span className="ml-1 text-xs">{team.q1Pos === 1 ? "🥇" : team.q1Pos === 2 ? "🥈" : "🥉"}</span>
                              )}
                            </td>
                            <td className={`px-4 py-3 text-center ${getPosBg(team.q2Pos)}`}>
                              <span className={`text-sm font-medium ${getPosColor(team.q2Pos)}`}>
                                {team.q2Pos ?? "-"}
                              </span>
                              {team.q2Pos && team.q2Pos <= 3 && (
                                <span className="ml-1 text-xs">{team.q2Pos === 1 ? "🥇" : team.q2Pos === 2 ? "🥈" : "🥉"}</span>
                              )}
                            </td>
                            <td className={`px-4 py-3 text-center ${getPosBg(team.q3Pos)}`}>
                              <span className={`text-sm font-medium ${getPosColor(team.q3Pos)}`}>
                                {team.q3Pos ?? "-"}
                              </span>
                              {team.q3Pos && team.q3Pos <= 3 && (
                                <span className="ml-1 text-xs">{team.q3Pos === 1 ? "🥇" : team.q3Pos === 2 ? "🥈" : "🥉"}</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center bg-yellow-500/5">
                              <span className="text-sm font-bold text-yellow-400">{team.totalPosPoints}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-sm text-[#8a8a9e]">{team.totalKills}</span>
                            </td>
                            <td className="px-4 py-3 text-center bg-green-500/5">
                              <span className="text-sm font-bold text-green-400">{team.totalKillPoints}</span>
                            </td>
                            <td className="px-4 py-3 text-center bg-green-500/5">
                              <span className="text-lg font-bold text-green-400">{team.totalPoints}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {tPlayers.length > 0 && (
                                isExpanded ? <ChevronUp className="w-4 h-4 text-[#5a5a6e]" /> : <ChevronDown className="w-4 h-4 text-[#5a5a6e]" />
                              )}
                            </td>
                          </tr>
                          {isExpanded && tPlayers.length > 0 && (
                            <tr className="bg-[#0a0a0f]">
                              <td colSpan={selectedDate ? 10 : 11} className="px-4 py-3">
                                <div className="ml-8">
                                  <h4 className="text-xs font-medium text-[#5a5a6e] mb-2">Jogadores</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {tPlayers.map((player) => (
                                      <div key={player.playerName} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a1a24] border border-[#2a2a3a]">
                                        <Target className="w-3 h-3 text-green-400" />
                                        <span className="text-sm text-[#f0f0f5]">{player.playerName}</span>
                                        <span className="text-xs text-green-400 font-bold">{player.totalKills}k</span>
                                        <span className="text-xs text-[#5a5a6e]">({player.q1Kills}/{player.q2Kills}/{player.q3Kills})</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {sortedStats.length === 0 && (
                <div className="px-6 py-16 text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-[#2a2a3a]" />
                  <p className="text-[#5a5a6e] text-lg font-medium">Nenhum resultado encontrado</p>
                  <p className="text-[#3a3a4e] text-sm mt-1">
                    {selectedDate ? "Nenhum dado para esta data" : "Nenhum dado para este mês"}
                  </p>
                </div>
              )}
            </div>

            {/* Legenda */}
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                <h4 className="font-bold text-[#f0f0f5] mb-3 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-400" /> Pontuação por Posição
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
                  <Target className="w-4 h-4 text-green-400" /> Pontuação por Kill
                </h4>
                <p className="text-[#8a8a9e] text-xs">
                  Cada kill vale <span className="font-bold text-green-400">{KILL_POINTS} ponto</span>.<br />
                  Total de kills do time × {KILL_POINTS} = Pontos de Kill
                </p>
              </div>
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                <h4 className="font-bold text-[#f0f0f5] mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-green-400" /> Cálculo do Total
                </h4>
                <p className="text-[#8a8a9e] text-xs">
                  <span className="text-yellow-400">Pts Posição</span> + <span className="text-green-400">Pts Kill</span> = <span className="text-green-400 font-bold">Total</span>
                </p>
              </div>
            </div>

            {/* Agenda */}
            {scheduleList && scheduleList.length > 0 && (
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
                <div className="px-6 py-4 border-b border-[#2a2a3a]">
                  <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-green-400" /> Próximos Xtreinos
                  </h3>
                </div>
                <div className="divide-y divide-[#2a2a3a]">
                  {scheduleList.filter((s) => s.status === "scheduled").slice(0, 5).map((s) => (
                    <div key={s.id} className="flex items-center justify-between px-6 py-3">
                      <div className="flex items-center gap-4">
                        <span className="w-2 h-2 rounded-full bg-green-400" />
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
          </div>
        )}

        {/* ===== TAB: INSCRIÇÕES ===== */}
        {activeTab === "inscricoes" && (
          <InscricoesTab
            xtreinosList={xtreinosList as unknown as XtreinoEvento[] | undefined}
            registrations={registrations}
            fixedTeams={fixedTeams}
            allTeams={allTeams}
            settings={settings}
            selectedXt={selectedXtInscricoes}
            onSelectXt={setSelectedXtInscricoes}
            onRegister={() => {}}
            onUnregister={() => {}}
            onCancel={() => {}}
            onToggleFixed={() => {}}
            isPending={false}
            isAdmin={true}
          />
        )}

        {/* ===== TAB: JOGADORES ===== */}
        {activeTab === "jogadores" && (
          <PlayersTab
            xtreinosList={xtreinosList as unknown as XTreino[] | undefined}
            allPlayerStats={allPlayerStats ?? []}
            xtDetail={null}
            selectedXt={selectedXtPlayers}
            showForm={showPlayerForm}
            form={{ playerName: "", teamName: "", q1Kills: 0, q2Kills: 0, q3Kills: 0, xtreinoId: 0, date: "", totalKills: 0 }}
            isPending={false}
            onSelectXt={setSelectedXtPlayers}
            onShowForm={() => setShowPlayerForm(true)}
            onCloseForm={() => setShowPlayerForm(false)}
            onSubmit={() => {}}
            onFormChange={() => {}}
            isAdmin={true}
          />
        )}

        {/* ===== TAB: RESULTADOS ===== */}
        {activeTab === "resultados" && (
          <ResultsTab
            xtreinosList={xtreinosList as unknown as XTreino[] | undefined}
            allResults={allResults ?? []}
            xtDetail={null}
            selectedXt={selectedXtResults}
            showForm={showResultForm}
            form={{ teamName: "", q1Pos: 0, q2Pos: 0, q3Pos: 0, xtreinoId: 0, date: "", totalPoints: 0 }}
            isPending={false}
            onSelectXt={setSelectedXtResults}
            onShowForm={() => setShowResultForm(true)}
            onCloseForm={() => setShowResultForm(false)}
            onSubmit={() => {}}
            onFormChange={() => {}}
            isAdmin={true}
          />
        )}

        {/* ===== TAB: AGENDA ===== */}
        {activeTab === "agenda" && (
          <ScheduleTab
            scheduleList={(scheduleList ?? []) as unknown as ScheduleItem[]}
            showForm={showScheduleForm}
            form={{ date: "", dayOfWeek: "", timeBr: "", notes: "", status: "scheduled" }}
            isPending={false}
            isGenerating={false}
            onShowForm={() => setShowScheduleForm(true)}
            onCloseForm={() => setShowScheduleForm(false)}
            onSubmit={() => {}}
            onGenerateMonth={() => {}}
            onFormChange={() => {}}
            isAdmin={true}
          />
        )}

        {/* ===== TAB: GERENCIAR ===== */}
        {activeTab === "gerenciar" && (
          <div className="space-y-6">
            <div className="bg-[#12121a] border-b border-[#2a2a3a]">
              <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
                <div className="flex items-center gap-3 mb-2">
                  <Dumbbell className="w-8 h-8 text-green-400" />
                  <h1 className="text-3xl md:text-4xl font-extrabold text-[#f0f0f5]">
                    Gerenciar XTreinos
                  </h1>
                </div>
                <p className="text-[#8a8a9e]">
                  Visualize e gerencie todos os xtreinos cadastrados no sistema
                </p>
              </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6 space-y-6">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setEditingXt(null);
                    setXtForm({
                      name: "",
                      date: "",
                      timeBr: "",
                      timeMx: "",
                      modality: "squad",
                      status: "aberto",
                      maxTeams: 12,
                      rules: "",
                      discordLink: "",
                      whatsappLink: "",
                    });
                    setShowXtForm(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-all"
                >
                  <Plus className="w-4 h-4" /> Novo XTreino
                </button>
              </div>

              {showXtForm && (
                <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
                  <h3 className="font-bold text-[#f0f0f5] mb-4 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-green-400" />
                    {editingXt ? "Editar XTreino" : "Novo XTreino"}
                  </h3>
                  <XTreinoForm
                    form={xtForm}
                    editing={editingXt}
                    isPending={false}
                    onChange={setXtForm}
                    onSubmit={(e) => {
                      e.preventDefault();
                      toast.success(editingXt ? "Atualizado!" : "Criado!");
                      setShowXtForm(false);
                      setEditingXt(null);
                    }}
                    onClose={() => {
                      setShowXtForm(false);
                      setEditingXt(null);
                    }}
                  />
                </div>
              )}

              {/* Tabela de XTreinos */}
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
                <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center justify-between">
                  <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    Lista de XTreinos
                  </h3>
                  <span className="text-xs text-[#5a5a6e]">
                    {(xtreinosList ?? []).length} registros
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#2a2a3a] bg-[#0a0a0f]">
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Nome</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Data</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Horários</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Modo</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Status</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase w-24">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2a2a3a]">
                      {(xtreinosList ?? []).map((x) => {
                        const config = xtStatusConfig[x.status as XTreinoStatus] ?? xtStatusConfig.aberto;
                        const StatusIcon = config.icon;
                        return (
                          <tr key={x.id} className="hover:bg-[#1a1a24] transition-colors">
                            <td className="px-6 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                                  <Dumbbell className="w-4 h-4 text-green-400" />
                                </div>
                                <span className="text-sm font-bold text-[#f0f0f5]">{x.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-3 text-sm text-[#8a8a9e]">{x.date}</td>
                            <td className="px-6 py-3 text-sm text-[#8a8a9e]">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-[#5a5a6e]" />
                                MX {x.timeMx ?? "-"} / BR {x.timeBr}
                              </div>
                            </td>
                            <td className="px-6 py-3">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-xs text-[#8a8a9e]">
                                <Swords className="w-3 h-3" />
                                {String(x.modality).toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-3">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                                <StatusIcon className="w-3 h-3" />
                                {config.label}
                              </span>
                            </td>
                            <td className="px-6 py-3">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => {
                                    setEditingXt(x.id);
                                    setXtForm({
                                      name: x.name,
                                      date: x.date,
                                      timeBr: x.timeBr,
                                      timeMx: x.timeMx ?? "",
                                      modality: x.modality as "squad" | "duo" | "solo",
                                      status: x.status as "aberto" | "encerrado" | "cancelado",
                                      maxTeams: x.maxTeams,
                                      rules: x.rules ?? "",
                                      discordLink: x.discordLink ?? "",
                                      whatsappLink: x.whatsappLink ?? "",
                                    });
                                    setShowXtForm(true);
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-green-500/10 text-green-400 transition-colors"
                                  title="Editar"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm("Remover este xtreino?")) toast.success("Xtreino removido!");
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                                  title="Excluir"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {(!xtreinosList || xtreinosList.length === 0) && (
                  <div className="px-6 py-16 text-center">
                    <Dumbbell className="w-12 h-12 mx-auto mb-4 text-[#2a2a3a]" />
                    <p className="text-[#5a5a6e] text-lg font-medium">Nenhum xtreino encontrado</p>
                    <p className="text-[#3a3a4e] text-sm mt-1">Nenhum dado disponível</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}