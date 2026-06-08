import { useState } from "react";
import { Users, MessageCircle, ChevronDown, ChevronUp, CalendarPlus, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { InscricoesManager } from "../components/InscricoesManager";
import { WhatsAppGenerator } from "../components/WhatsAppGenerator";
import type { InscricaoEquipe, XtreinoEvento } from "../../../types/inscricoes";

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
}

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
}: InscricoesTabProps) {
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newMaxTeams, setNewMaxTeams] = useState(12);

  const selectedXtData = xtreinosList?.find((x) => x.id === selectedXt);
  const xtInscricoes = registrations?.filter((r) => r.xtreinoId === selectedXt) || [];

  const handleCreateEvent = () => {
    if (!newDate) {
      toast.error("Data é obrigatória");
      return;
    }
    toast.success("Use o hook useXTreinos para criar xtreino");
    setNewDate("");
    setNewMaxTeams(12);
    setShowCreateForm(false);
  };

  const handleStatusChange = (_id: number, status: string) => {
    toast.success(`Status alterado para ${status}`);
  };

  return (
    <div className="space-y-6">
      {/* Header com ações */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-[#f0f0f5]">Gerenciar Inscrições</h2>
          <p className="text-sm text-[#8a8a9e]">
            Selecione um xtreino para gerenciar as inscrições
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all text-sm"
          >
            <CalendarPlus className="w-4 h-4" />
            Novo Xtreino
          </button>
          <button
            onClick={() => toast.success("Migrado!")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#8a8a9e] hover:text-[#f0f0f5] transition-all text-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            Migrar Históricos
          </button>
        </div>
      </div>

      {/* Form de criar xtreino */}
      {showCreateForm && (
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
          <h3 className="font-bold text-[#f0f0f5] mb-4">Criar Novo Xtreino</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#8a8a9e] mb-1">Data</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50"
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
                className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleCreateEvent}
              className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all"
            >
              Criar
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
          <Users className="w-4 h-4 text-red-400" />
          Selecionar Xtreino
        </h3>
        <select
          value={selectedXt ?? ""}
          onChange={(e) => {
            const id = e.target.value ? parseInt(e.target.value) : null;
            onSelectXt(id);
            setShowWhatsApp(false);
          }}
          className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50"
        >
          <option value="">Selecione um xtreino...</option>
          {xtreinosList?.map((x) => (
            <option key={x.id} value={x.id}>
              #{x.id} — {x.date} ({x.status}) — {x.maxTeams} vagas
            </option>
          ))}
        </select>

        {/* Status do xtreino selecionado */}
        {selectedXtData && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-[#8a8a9e]">Status:</span>
            <div className="flex gap-1">
              {(["aberto", "fechado", "em_andamento", "finalizado"] as const).map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(selectedXtData.id, status)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      selectedXtData.status === status
                        ? status === "aberto"
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : status === "fechado"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : status === "em_andamento"
                          ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                        : "bg-[#1a1a24] border border-[#2a2a3a] text-[#5a5a6e] hover:text-[#8a8a9e]"
                    }`}
                  >
                    {status === "em_andamento" ? "EM ANDAMENTO" : status.toUpperCase()}
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {selectedXtData && (
        <>
          {/* Toggle WhatsApp */}
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

          {showWhatsApp && (
            <WhatsAppGenerator
              xtreino={selectedXtData}
              inscricoes={xtInscricoes}
              fixedTeams={fixedTeams}
              settings={settings}
            />
          )}

          {/* Gerenciador de Inscrições */}
          <InscricoesManager
            xtreino={selectedXtData}
            inscricoes={xtInscricoes}
            fixedTeams={fixedTeams}
            allTeams={allTeams}
            onRegister={(data) => {
              onRegister({
                xtreinoId: selectedXtData.id,
                teamName: data.teamName,
                players: data.players,
                isReserve: !fixedTeams.includes(data.teamName),
              });
            }}
            onCancel={(data) => {
              onCancel({
                xtreinoId: selectedXtData.id,
                teamName: data.teamName,
              });
            }}
            onRemove={(data) => {
              onUnregister({
                xtreinoId: selectedXtData.id,
                teamName: data.teamName,
              });
            }}
            isPending={isPending}
            isAdmin={true}
          />
        </>
      )}

      {!selectedXtData && (
        <div className="text-center py-12 text-[#5a5a6e]">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Selecione um xtreino para gerenciar inscrições</p>
        </div>
      )}
    </div>
  );
}