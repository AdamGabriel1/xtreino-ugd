import {
  Zap,
  Calendar,
  Crosshair,
  Target,
  Crown,
  Star,
  Flame,
  Trophy,
  Medal,
  Award,
  Shield,
  Swords,
  Sparkles,
  Skull,
  Gem,
  Orbit,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";

// ============================================================================
// TIPOS
// ============================================================================

export type BadgeType =
  | string
  // Kills (Progressão)
  | "100 Kills"
  | "300 Kills"
  | "500 Kills"
  | "1000 Kills"
  // XTreinos (Progressão)
  | "5 XTs"
  | "10 XTs"
  | "20 XTs"
  | "50 XTs"
  // Scrims (Progressão)
  | "5 Scrims"
  | "10 Scrims"
  | "20 Scrims"
  | "50 Scrims"
  // MVPs (Progressão)
  | "5 MVPs"
  | "10 MVPs"
  | "20 MVPs"
  // Quarters (Maestria)
  | "Q1 Master"
  | "Q2 Master"
  | "Q3 Master"
  | "Full Weapon Master"
  // Títulos Especiais
  | "Sniper"
  | "Elite"
  | "Imortal"
  | "Veterano"
  | "Lenda"
  // Títulos Antigos
  | "Assassino"
  | "Regular"
  | "Novato";

// ✅ TIPO EXPLÍCITO: Resolve o erro 'never' do TypeScript
interface BadgeStyleConfig {
  icon: React.ComponentType<{ className?: string }>;
  className: string;
}

interface GenericBadgeStyleConfig extends BadgeStyleConfig {
  match: string;
}

// ============================================================================
// CONFIGURAÇÃO VISUAL DAS BADGES
// ============================================================================

const BADGE_STYLES: Record<string, BadgeStyleConfig> = {
  // Kills (Progressão de Fogo/Energia)
  "100 Kills": { icon: Zap, className: "text-yellow-400" },
  "300 Kills": { icon: Zap, className: "text-orange-400" },
  "500 Kills": { icon: Flame, className: "text-red-400" },
  "1000 Kills": { icon: Skull, className: "text-red-500" },
  
  // XTreinos (Progressão de Calendário)
  "5 XTs": { icon: Calendar, className: "text-blue-400" },
  "10 XTs": { icon: Calendar, className: "text-indigo-400" },
  "20 XTs": { icon: Calendar, className: "text-purple-400" },
  "50 XTs": { icon: Calendar, className: "text-fuchsia-400" },
  
  // Scrims (Progressão de Espadas)
  "5 Scrims": { icon: Swords, className: "text-cyan-400" },
  "10 Scrims": { icon: Swords, className: "text-blue-400" },
  "20 Scrims": { icon: Swords, className: "text-indigo-400" },
  "50 Scrims": { icon: Swords, className: "text-purple-400" },
  
  // MVPs (Progressão de Brilho)
  "5 MVPs": { icon: Sparkles, className: "text-yellow-400" },
  "10 MVPs": { icon: Sparkles, className: "text-amber-400" },
  "20 MVPs": { icon: Crown, className: "text-yellow-300" },
  
  // Quarters
  "Q1 Master": { icon: Crosshair, className: "text-red-400" },
  "Q2 Master": { icon: Crosshair, className: "text-orange-400" },
  "Q3 Master": { icon: Crosshair, className: "text-purple-400" },
  "Full Weapon Master": { icon: Target, className: "text-rose-400" },
  
  // Títulos Especiais
  "Sniper": { icon: Target, className: "text-green-400" },
  "Elite": { icon: Crown, className: "text-amber-400" },
  "Imortal": { icon: Gem, className: "text-emerald-300" },
  "Veterano": { icon: Shield, className: "text-slate-300" },
  "Lenda": { icon: Orbit, className: "text-amber-300" },
  
  // Títulos Antigos (Mantidos para compatibilidade)
  "Assassino": { icon: Flame, className: "text-red-500" },
  "Regular": { icon: Shield, className: "text-blue-400" },
  "Novato": { icon: Star, className: "text-blue-300" },
};

// ✅ LIMPO: Usa a interface correta agora, sem 'as unknown'
const GENERIC_STYLES: GenericBadgeStyleConfig[] = [
  { match: "Kills", icon: Zap, className: "text-yellow-400" },
  { match: "XTs", icon: Calendar, className: "text-blue-400" },
  { match: "Scrims", icon: Swords, className: "text-cyan-400" },
  { match: "MVPs", icon: Sparkles, className: "text-yellow-400" },
  { match: "Q1", icon: Crosshair, className: "text-red-400" },
  { match: "Q2", icon: Crosshair, className: "text-orange-400" },
  { match: "Q3", icon: Crosshair, className: "text-purple-400" },
];

// ============================================================================
// COMPONENTES
// ============================================================================

export function BadgeIcon({ badge }: { badge: BadgeType }) {
  const b = String(badge);
  
  // 1. Tenta achar o estilo exato
  const exactStyle = BADGE_STYLES[b];
  if (exactStyle) {
    return <exactStyle.icon className={`w-3 h-3 ${exactStyle.className}`} />;
  }

  // 2. Tenta achar um fallback genérico (Usa a tipagem correta agora)
  for (const style of GENERIC_STYLES) {
    if (b.includes(style.match)) {
      return <style.icon className={`w-3 h-3 ${style.className}`} />;
    }
  }

  // 3. Fallback final
  return <Star className="w-3 h-3 text-gray-400" />;
}

export function TrendIcon({ trend }: { trend: "up" | "down" | "same" }) {
  if (trend === "up") return <ArrowUp className="w-3.5 h-3.5 text-green-400" />;
  if (trend === "down") return <ArrowDown className="w-3.5 h-3.5 text-red-400" />;
  return <Minus className="w-3.5 h-3.5 text-[#5a5a6e]" />;
}

export function RankIcon({ index, size = "sm" }: { index: number; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };
  const textSize = size === "lg" ? "text-lg" : size === "md" ? "text-sm" : "text-xs";

  if (index === 0) return <Trophy className={`${sizeClasses[size]} text-yellow-400`} />;
  if (index === 1) return <Medal className={`${sizeClasses[size]} text-gray-300`} />;
  if (index === 2) return <Award className={`${sizeClasses[size]} text-amber-600`} />;
  return (
    <span className={`${sizeClasses[size]} flex items-center justify-center ${textSize} font-bold text-[#5a5a6e]`}>
      {index + 1}
    </span>
  );
}

export function RankBadge({ index }: { index: number }) {
  const bgColors = [
    "bg-yellow-500/20 text-yellow-400",
    "bg-gray-400/20 text-gray-300",
    "bg-amber-500/20 text-amber-500",
  ];
  const bg = index < 3 ? bgColors[index] : "text-[#5a5a6e]";

  return (
    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${bg}`}>
      {index + 1}
    </span>
  );
}

export default BadgeIcon;