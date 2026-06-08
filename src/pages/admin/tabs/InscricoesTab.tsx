// ============================================================
// TAB: Inscrições + Gerador WhatsApp
// ============================================================

import { useState } from "react";
import { Users, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import type { XTreino, TeamRegistration } from "../types.js";
import { InscricoesManager } from "../components/InscricoesManager";
import { WhatsAppGenerator } from "../components/WhatsAppGenerator";

interface InscricoesTabProps {
  xtreinosList: XTreino[] | undefined;
  registrations: TeamRegistration[] | undefined;
  fixedTeams: string[];
  allTeams: Array<{ name: string; tag: string }> | undefined;
  settings: {
    orgName?: string | null;
    whatsappLink?: string | null;
    defaultTimesBr?: string | null;
    defaultTimesMx?: string | null;
  } | null | undefined;
  onRegister: (data: { xtreinoId: number; teamName: string; isFixed: boolean }) => void;
  onUnregister: (data: { xtreinoId: number; teamName: string }) => void;
  onToggleFixed: (data: { teamName: string; isFixed: boolean }) => void;
  isPending: boolean;
}

export function InscricoesTab({
  xtreinosList,
  registrations,
  fixedTeams,
  allTeams,
  settings,
  onRegister,
  onUnregister,
  onToggleFixed,
  isPending,
}: InscricoesTabProps) {
  const [selectedXtId, setSelectedXtId] = useState<number | null>(null);
  const [showWhatsApp, setShowWhatsApp] = useState(false);

  const selectedXt = xtreinosList?.find((x) => x.id === selectedXtId);
  const xtRegistrations = registrations?.filter((r) => r.xtreinoId === selectedXtId) || [];

  return (
    <div className="space-y-6">
      {/* Selecionar XTreino */}
      <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
        <h3 className="font-bold text-[#f0f0f5] mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-red-400" />
          Selecionar XTreino
        </h3>
        <select
          value={selectedXtId ?? ""}
          onChange={(e) => {
            const id = e.target.value ? parseInt(e.target.value) : null;
            setSelectedXtId(id);
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

      {selectedXt && (
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
              xtreino={selectedXt}
              registrations={xtRegistrations}
              fixedTeams={fixedTeams}
              settings={settings}
            />
          )}

          {/* Gerenciador de Inscrições */}
          <InscricoesManager
            xtreino={selectedXt}
            registrations={xtRegistrations}
            fixedTeams={fixedTeams}
            allTeams={allTeams}
            onRegister={onRegister}
            onUnregister={onUnregister}
            onToggleFixed={onToggleFixed}
            isPending={isPending}
          />
        </>
      )}

      {!selectedXt && (
        <div className="text-center py-12 text-[#5a5a6e]">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Selecione um xtreino para gerenciar inscrições</p>
        </div>
      )}
    </div>
  );
}
