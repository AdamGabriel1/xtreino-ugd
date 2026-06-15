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
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";

export type BadgeType =
  | string
  | "100 Kills"
  | "300 Kills"
  | "500 Kills"
  | "5 XTs"
  | "10 XTs"
  | "20 XTs"
  | "Q1 Master"
  | "Q2 Master"
  | "Q3 Master"
  | "Sniper"
  | "Elite"
  | "Imortal"
  | "Assassino"
  | "Regular"
  | "Novato";

export function BadgeIcon({ badge }: { badge: BadgeType }) {
  const b = String(badge);
  if (b.includes("Kills")) return <Zap className="w-3 h-3 text-yellow-400" />;
  if (b.includes("XTs")) return <Calendar className="w-3 h-3 text-blue-400" />;
  if (b.includes("Q1")) return <Crosshair className="w-3 h-3 text-red-400" />;
  if (b.includes("Q2")) return <Crosshair className="w-3 h-3 text-orange-400" />;
  if (b.includes("Q3")) return <Crosshair className="w-3 h-3 text-purple-400" />;
  if (b === "Sniper") return <Target className="w-3 h-3 text-green-400" />;
  if (b === "Elite" || b === "Imortal") return <Crown className="w-3 h-3 text-amber-400" />;
  if (b === "Assassino") return <Flame className="w-3 h-3 text-red-500" />;
  if (b === "Regular") return <Shield className="w-3 h-3 text-blue-400" />;
  if (b === "Novato") return <Star className="w-3 h-3 text-blue-300" />;
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