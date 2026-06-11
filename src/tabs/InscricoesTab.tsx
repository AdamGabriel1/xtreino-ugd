import { useState, useMemo } from "react";
import {
  Users,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  CalendarPlus,
  Filter,
  Trophy,
  Target,
  Medal,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import { InscricoesManager } from "@/pages/admin/components/InscricoesManager";
import { WhatsAppGenerator } from "@/pages/admin/components/WhatsAppGenerator";
import type { InscricaoEquipe } from "@/types/inscricoes";

interface InscricoesTabProps {
  isAdmin?: boolean;
}

export function InscricoesTab({ isAdmin = false }: InscricoesTabProps) {
  const [selectedXt, setSelectedXt] = useState<number | null>(null);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newMaxTeams, setNewMaxTeams] = useState(12);
  const [newStatus, setNewStatus] = useState<"aberto" | "fechado">("aberto");

  const utils = trpc.useUtils();

  const { data: xtreinosList } = trpc.xtreinoInscricoes.listXtreinos.useQuery();
  const { data: registrationsRaw } = trpc.xtreinoInscricoes.listByXtreino.useQuery(
    { xtreinoId: selectedXt! },
    { enabled: selectedXt !== null }
  );
  const { data: fixedTeamsData } = trpc.xtreinoInscricoes.getFixedTeams.useQuery();
  const { data: allTeams } = trpc.teams.list.useQuery();

  const selectedXtData = xtreinosList?.find((x) => x.id === selectedXt);

  // Mapeia status string do backend para o tipo do frontend
  const xtInscricoes: InscricaoEquipe[] = useMemo(() => {
    if (!registrationsRaw) return [];
    return registrationsRaw.map((r) => ({
      ...r,
      status: (r.status === "confirmed" ? "confirmada" : r.status === "cancelled" ? "cancelada" : r.status === "pending" ? "pendente" : r.status) as InscricaoEquipe["status"],
    }));
  }, [registrationsRaw]);

  const fixedTeams = fixedTeamsData || [];

  // Mutations
  const createXtreino = trpc.xtreinoInscricoes.createXtreino.useMutation({
    onSuccess: () => {
      toast.success("Xtreino criado!");
      utils.xtreinoInscricoes.listXtreinos.invalidate();
      setShowCreateForm(false);
      setNewDate("");
      setNewMaxTeams(12);
    },
    onError: (err) => toast.error(err.message),
  });

  const updateStatus = trpc.xtreinoInscricoes.updateXtreinoStatus.useMutation({
    onSuccess: (_, vars) => {
      toast.success(`Status alterado para ${vars.status}`);
      utils.xtreinoInscricoes.listXtreinos.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const registerTeam = trpc.xtreinoInscricoes.register.useMutation({
    onSuccess: () => {
      toast.success("Equipe inscrita!");
      utils.xtreinoInscricoes.listByXtreino.invalidate({ xtreinoId: selectedXt! });
    },
    onError: (err) => toast.error(err.message),
  });

  const unregisterTeam = trpc.xtreinoInscricoes.unregister.useMutation({
    onSuccess: () => {
      toast.success("Equipe removida!");
      utils.xtreinoInscricoes.listByXtreino.invalidate({ xtreinoId: selectedXt! });
    },
    onError: (err) => toast.error(err.message),
  });

  const cancelTeam = trpc.xtreinoInscricoes.cancel.useMutation({
    onSuccess: () => {
      toast.success("Inscrição cancelada!");
      utils.xtreinoInscricoes.listByXtreino.invalidate({ xtreinoId: selectedXt! });
    },
    onError: (err) => toast.error(err.message),
  });

  const reactivateTeam = trpc.xtreinoInscricoes.register.useMutation({
    onSuccess: () => {
      toast.success("Inscrição reativada!");
      utils.xtreinoInscricoes.listByXtreino.invalidate({ xtreinoId: selectedXt! });
    },
    onError: (err) => toast.error(err.message),
  });

  // ===== RESUMO =====
  const summary = useMemo(() => {
    if (!selectedXtData || !xtInscricoes.length) return null;

    const mainTeams = xtInscricoes.filter(
      (i) => i.status === "confirmada" && !i.isReserve
    );
    const reserveTeams = xtInscricoes.filter(
      (i) => i.status === "confirmada" && i.isReserve
    );
    const totalPlayers = xtInscricoes.reduce(
      (acc, i) => acc + (i.players?.length || 0),
      0
    );

    return {
      totalInscricoes: xtInscricoes.filter((i) => i.status === "confirmada").length,
      mainTeams: mainTeams.length,
      reserveTeams: reserveTeams.length,
      totalPlayers,
      vagasDisponiveis: selectedXtData.maxTeams - mainTeams.length,
      vagasPercent: Math.round(
        (mainTeams.length / selectedXtData.maxTeams) * 100
      ),
    };
  }, [selectedXtData, xtInscricoes]);

  const handleCreateEvent = () => {
    if (!newDate) {
      toast.error("Data é obrigatória");
      return;
    }
    createXtreino.mutate({
      date: newDate,
      maxTeams: newMaxTeams,
      status: newStatus,
    });
  };

  const handleStatusChange = (status: string) => {
    if (!selectedXtData) return;
    updateStatus.mutate({
      id: selectedXtData.id,
      status: status as "aberto" | "fechado" | "em_andamento" | "finalizado",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "aberto":
        return "text-green-400 bg-green-500/10 border-green-500/20";
      case "fechado":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "em_andamento":
        return "text-lime-400 bg-lime-500/10 border-lime-500/20";
      case "finalizado":
        return "text-gray-400 bg-gray-500/10 border-gray-500/20";
      default:
        return "text-[#5a5a6e] bg-[#1a1a24] border-[#2a2a3a]";
    }
  };

  const isPending =
    registerTeam.isPending ||
    unregisterTeam.isPending ||
    cancelTeam.isPending ||
    reactivateTeam.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#12121a] border-b border-[#2a2a3a]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-green-400" />
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#f0f0f5]">
              Gerenciar Inscrições
            </h1>
          </div>
          <p className="text-[#8a8a9e]">
            Selecione um xtreino para gerenciar as inscrições de equipes
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Ações Admin */}
        {isAdmin && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition-all text-sm"
            >
              <CalendarPlus className="w-4 h-4" />
              Novo Xtreino
            </button>
          </div>
        )}

        {/* Form de criar xtreino */}
        {isAdmin && showCreateForm && (
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
            <h3 className="font-bold text-[#f0f0f5] mb-4 flex items-center gap-2">
              <CalendarPlus className="w-4 h-4 text-green-400" />
              Criar Novo Xtreino
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-[#8a8a9e] mb-1">Data</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-[#8a8a9e] mb-1">
                  Máximo de Equipes
                </label>
                <input
                  type="number"
                  value={newMaxTeams}
                  onChange={(e) => setNewMaxTeams(parseInt(e.target.value) || 12)}
                  min={1}
                  max={32}
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-[#8a8a9e] mb-1">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) =>
                    setNewStatus(e.target.value as "aberto" | "fechado")
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50"
                >
                  <option value="aberto">Aberto</option>
                  <option value="fechado">Fechado</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleCreateEvent}
                disabled={createXtreino.isPending}
                className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-all disabled:opacity-50"
              >
                {createXtreino.isPending ? "Criando..." : "Criar"}
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#8a8a9e] text-sm hover:text-[#f0f0f5] transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Selecionar Xtreino */}
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
          <h3 className="font-bold text-[#f0f0f5] mb-4 flex items-center gap-2">
            <Filter className="w-4 h-4 text-green-400" />
            Selecionar Xtreino
          </h3>
          <select
            value={selectedXt ?? ""}
            onChange={(e) => {
              const id = e.target.value ? parseInt(e.target.value) : null;
              setSelectedXt(id);
              setShowWhatsApp(false);
            }}
            className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50"
          >
            <option value="">Selecione um xtreino...</option>
            {xtreinosList?.map((x) => (
              <option key={x.id} value={x.id}>
                #{x.id} — {x.date} ({x.status}) — {x.maxTeams} vagas
              </option>
            ))}
          </select>

          {isAdmin && selectedXtData && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-[#8a8a9e]">Status:</span>
              <div className="flex gap-1">
                {(
                  ["aberto", "fechado", "em_andamento", "finalizado"] as const
                ).map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      selectedXtData.status === status
                        ? status === "aberto"
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : status === "fechado"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : status === "em_andamento"
                          ? "bg-lime-500/20 text-lime-400 border border-lime-500/30"
                          : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                        : "bg-[#1a1a24] border border-[#2a2a3a] text-[#5a5a6e] hover:text-[#8a8a9e]"
                    }`}
                  >
                    {status === "em_andamento"
                      ? "EM ANDAMENTO"
                      : status.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {selectedXtData && (
          <>
            {/* Cards de Resumo */}
            {summary && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-[#5a5a6e] uppercase">
                      Inscrições
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-[#f0f0f5]">
                    {summary.totalInscricoes}
                  </p>
                  <p className="text-xs text-[#5a5a6e] mt-1">
                    {summary.mainTeams} fixas · {summary.reserveTeams} reservas
                  </p>
                </div>
                <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-[#5a5a6e] uppercase">
                      Jogadores
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-green-400">
                    {summary.totalPlayers}
                  </p>
                  <p className="text-xs text-[#5a5a6e] mt-1">Total inscritos</p>
                </div>
                <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-[#5a5a6e] uppercase">Vagas</span>
                  </div>
                  <p className="text-2xl font-bold text-green-400">
                    {summary.vagasDisponiveis}
                  </p>
                  <p className="text-xs text-[#5a5a6e] mt-1">
                    de {selectedXtData.maxTeams} disponíveis
                  </p>
                </div>
                <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-[#5a5a6e] uppercase">
                      Ocupação
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-green-400">
                    {summary.vagasPercent}%
                  </p>
                  <div className="w-full bg-[#1a1a24] rounded-full h-1.5 mt-2">
                    <div
                      className="bg-green-500 rounded-full h-1.5 transition-all"
                      style={{ width: `${summary.vagasPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Toggle WhatsApp */}
            {isAdmin && (
              <button
                onClick={() => setShowWhatsApp(!showWhatsApp)}
                className="w-full flex items-center justify-between px-6 py-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition-all"
              >
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-medium">
                    {showWhatsApp
                      ? "Ocultar Gerador WhatsApp"
                      : "Gerar Mensagem WhatsApp"}
                  </span>
                </div>
                {showWhatsApp ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
            )}

            {showWhatsApp && isAdmin && selectedXt && (
              <div className="mb-6">
                <WhatsAppGenerator xtreinoId={selectedXt} />
              </div>
            )}

            {/* Gerenciador de Inscrições */}
            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center justify-between">
                <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
                  <Medal className="w-5 h-5 text-green-400" />
                  Inscrições — {selectedXtData.date}
                </h3>
                <span
                  className={`text-xs px-2 py-1 rounded-lg border ${getStatusColor(
                    selectedXtData.status
                  )}`}
                >
                  {selectedXtData.status === "em_andamento"
                    ? "EM ANDAMENTO"
                    : selectedXtData.status.toUpperCase()}
                </span>
              </div>

              <InscricoesManager
                xtreino={selectedXtData}
                inscricoes={xtInscricoes}
                fixedTeams={fixedTeams}
                allTeams={allTeams}
                onRegister={(data) => {
                  registerTeam.mutate({
                    xtreinoId: selectedXtData.id,
                    teamName: data.teamName,
                    players: data.players,
                    isReserve: data.isReserve,
                  });
                }}
                onCancel={(data) => {
                  cancelTeam.mutate({
                    xtreinoId: selectedXtData.id,
                    teamName: data.teamName,
                  });
                }}
                onReactivate={(data) => {
                  registerTeam.mutate({
                    xtreinoId: selectedXtData.id,
                    teamName: data.teamName,
                    players: data.players,
                    isReserve: data.isReserve,
                  });
                }}
                onRemove={(data) => {
                  unregisterTeam.mutate({
                    xtreinoId: selectedXtData.id,
                    teamName: data.teamName,
                  });
                }}
                isPending={isPending}
                isAdmin={isAdmin}
              />
            </div>
          </>
        )}

        {!selectedXtData && (
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] px-6 py-16 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-[#2a2a3a]" />
            <p className="text-[#5a5a6e] text-lg font-medium">
              Nenhum xtreino selecionado
            </p>
            <p className="text-[#3a3a4e] text-sm mt-1">
              Selecione um xtreino no filtro acima para gerenciar as inscrições
            </p>
          </div>
        )}
      </div>
    </div>
  );
}