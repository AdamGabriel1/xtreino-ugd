import { Calendar, Users, Shield } from "lucide-react";
import type { TabConfig } from "./types";

// ============================================================
// CONSTANTES DE CONFIGURAÇÃO (Requer extensão .tsx por causa do JSX)
// ============================================================

export const TABS: TabConfig[] = [
  { 
    key: "agendados", 
    label: "Partidas & Histórico", 
    icon: <Calendar className="w-4 h-4" />, 
    group: "gestao" 
  },
  { 
    key: "ranking-jogadores", 
    label: "Ranking Jogadores", 
    icon: <Users className="w-4 h-4" />, 
    group: "ranking" 
  },
  { 
    key: "ranking-times", 
    label: "Ranking Times", 
    icon: <Shield className="w-4 h-4" />, 
    group: "ranking" 
  },
];
