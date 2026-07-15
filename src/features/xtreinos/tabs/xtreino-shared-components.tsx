import {
  Target,
  Swords,
  BarChart3,
  Crown,
  Zap,
  Award,
  Medal,
  ArrowUp,
  ArrowDown,
  Minus,
  Users,
} from "lucide-react";

export function TrendIcon({ trend }: { trend: "up" | "down" | "same" }) {
  if (trend === "up") return <ArrowUp className="w-3 h-3 text-green-400" />;
  if (trend === "down") return <ArrowDown className="w-3 h-3 text-red-400" />;
  return <Minus className="w-3 h-3 text-[#5a5a6e]" />;
}

const BADGE_ICON_MAP = [
  ["Kills", Swords, "text-red-400"],
  ["Campeao", Crown, "text-yellow-400"],
  ["Veterano", Award, "text-purple-400"],
  ["Lenda", Award, "text-purple-400"],
  ["Elite", Target, "text-blue-400"],
  ["Consistente", BarChart3, "text-green-400"],
  ["Top 3", Medal, "text-amber-400"],
];

export function BadgeIcon({ badge }: { badge: string }) {
  for (let i = 0; i < BADGE_ICON_MAP.length; i++) {
    const entry = BADGE_ICON_MAP[i];
    if (badge.includes(entry[0] as string)) {
      const IconComp = entry[1];
      const color = entry[2] as string;
      return <IconComp className={"w-3 h-3 " + color} />;
    }
  }
  return <Zap className="w-3 h-3 text-orange-400" />;
}

export function buildSummaryCards(
  teamRanking: Array<{
    totalKills: number;
    totalPosPoints: number;
    totalPoints: number;
  }>,
  totalXtreinosUnicos: number
) {
  return [
    {
      icon: <Users className="w-4 h-4 text-blue-400" />,
      label: "Equipes",
      value: teamRanking.length,
    },
    {
      icon: <Swords className="w-4 h-4 text-red-400" />,
      label: "Total Kills",
      value: teamRanking.reduce((acc, t) => acc + t.totalKills, 0),
      valueColor: "text-red-400" as const,
    },
    {
      icon: <Crown className="w-4 h-4 text-yellow-400" />,
      label: "Pts Posicao",
      value: teamRanking.reduce((acc, t) => acc + t.totalPosPoints, 0),
      valueColor: "text-yellow-400" as const,
    },
    {
      icon: <BarChart3 className="w-4 h-4 text-green-400" />,
      label: "Total Geral",
      value: teamRanking.reduce((acc, t) => acc + t.totalPoints, 0),
      valueColor: "text-green-400" as const,
    },
    {
      icon: <Zap className="w-4 h-4 text-purple-400" />,
      label: "X-Treinos",
      value: totalXtreinosUnicos,
      valueColor: "text-purple-400" as const,
    },
  ];
}