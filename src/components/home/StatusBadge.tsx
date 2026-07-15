import { Radio, AlertCircle, Clock, Timer, Calendar } from "lucide-react";
import type { StatusConfig } from "@/types/home";

export default function StatusBadge({ status, type }: { status: string; type: "champ" | "xtreino" | "scrim" }) {
  const champConfigs: Record<string, StatusConfig> = {
    ativo: { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30", label: "Ativo", icon: Radio },
    inscricoes: { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30", label: "Inscrições", icon: AlertCircle },
    encerrado: { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30", label: "Encerrado", icon: Clock },
  };

  const xtreinoConfigs: Record<string, StatusConfig> = {
    aberto: { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30", label: "Aberto", icon: Radio },
    em_andamento: { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30", label: "Em Andamento", icon: Timer },
    fechado: { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30", label: "Fechado", icon: Clock },
  };

  const scrimConfigs: Record<string, StatusConfig> = {
    agendado: { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/30", label: "Agendado", icon: Calendar },
    em_andamento: { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30", label: "Em Andamento", icon: Timer },
    finalizado: { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30", label: "Finalizado", icon: Clock },
  };

  let config: StatusConfig;
  if (type === "champ") config = champConfigs[status] || champConfigs.ativo;
  else if (type === "xtreino") config = xtreinoConfigs[status] || xtreinoConfigs.aberto;
  else config = scrimConfigs[status] || scrimConfigs.agendado;

  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}