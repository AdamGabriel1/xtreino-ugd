"use client";

import { Users, Target, Trophy, BarChart3 } from "lucide-react";

interface HistorySummaryProps {
  totalTeams?: number;
  totalKills?: number;
  totalPoints?: number;
  totalScrims?: number;
}

export function HistorySummary({
  totalTeams = 0,
  totalKills = 0,
  totalPoints = 0,
  totalScrims = 0,
}: HistorySummaryProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <SummaryCard
        icon={<Users className="w-4 h-4 text-blue-400" />}
        label="Equipes"
        value={totalTeams}
        color="blue"
      />
      <SummaryCard
        icon={<Target className="w-4 h-4 text-red-400" />}
        label="Total Kills"
        value={totalKills}
        color="red"
      />
      <SummaryCard
        icon={<Trophy className="w-4 h-4 text-yellow-400" />}
        label="Pts Posição"
        value={totalPoints}
        color="yellow"
      />
      <SummaryCard
        icon={<BarChart3 className="w-4 h-4 text-emerald-400" />}
        label="Scrims"
        value={totalScrims}
        color="emerald"
      />
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "blue" | "red" | "yellow" | "emerald";
}) {
  const colorClasses = {
    blue: "bg-blue-500/5 border-blue-500/10",
    red: "bg-red-500/5 border-red-500/10",
    yellow: "bg-yellow-500/5 border-yellow-500/10",
    emerald: "bg-emerald-500/5 border-emerald-500/10",
  };

  return (
    <div className={`rounded-xl border p-3 ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-[#5a5a6e]">{label}</span>
      </div>
      <p className="text-xl font-bold text-[#f0f0f5]">{value}</p>
    </div>
  );
}