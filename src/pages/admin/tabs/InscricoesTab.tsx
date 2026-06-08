// ============================================================
// TAB: Inscrições + Gerador WhatsApp
// ============================================================

import { useState } from "react";
import { Users, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import type { XTreino, TeamRegistration } from "../types";
import { InscricoesManager } from "../components/InscricoesManager";
import { WhatsAppGenerator } from "../components/WhatsAppGenerator";

interface InscricoesTabProps {
  xtreinosList: XTreino[] | undefined;
  registrations: TeamRegistration[] | undefined;
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
  onRegister: (data: { xtreinoId: number; teamId: number; isReserve: boolean }) => void;
  onUnregister: (data: { xtreinoId: number; teamId: number }) => void;
  onToggleFixed: (data: { xtreinoId: number; teamId: number; isReserve: boolean }) => void;
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
  onToggleFixed,
  isPending,
}: InscricoesTabProps) {
  const [showWhatsApp, setShowWhatsApp] = useState(false);

  const selectedXtData = xtreinosList?.find((x) => x.id === selectedXt);
  const xtRegistrations = registrations?.filter((r) => r.xtreinoId === selectedXt) || [];

  return (
    <div className="space-y-6">
      {/* Selecionar XTreino */}
      <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
        <h3 className="font-bold text-[#f0f0f5] mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-red-400" />
          Selecionar XTreino
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
              {x.name} ({x.date}) - {x.status}
            </option>
          ))}
        </select>
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
                {showWhatsApp ? "Ocultar Gerador WhatsApp" : "Gerar Mensagem WhatsApp"}
              </span>
            </div>
            {showWhatsApp ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          {showWhatsApp && (
            <WhatsAppGenerator
              xtreino={selectedXtData}
              registrations={xtRegistrations}
              fixedTeams={fixedTeams}
              settings={settings}
            />
          )}

          {/* Gerenciador de Inscrições */}
          <InscricoesManager
            xtreino={selectedXtData}
            registrations={xtRegistrations}
            fixedTeams={fixedTeams}
            allTeams={allTeams}
            onRegister={(data) => onRegister({ xtreinoId: selectedXtData.id, ...data })}
            onUnregister={(data) => onUnregister({ xtreinoId: selectedXtData.id, ...data })}
            onToggleFixed={(data) => onToggleFixed({ xtreinoId: selectedXtData.id, ...data })}
            isPending={isPending}
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