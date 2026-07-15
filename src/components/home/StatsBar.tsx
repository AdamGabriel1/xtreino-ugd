import { Users, UserCircle, Dumbbell, Trophy } from "lucide-react";
import StatCard from "./StatCard";
import type { LucideIcon } from "@/types/home";

interface StatsBarProps {
  teams: number;
  players: number;
  xtreinos: { total: number; abertos: number };
  championships: { total: number; ativos: number };
}

export default function StatsBar({ teams, players, xtreinos, championships }: StatsBarProps) {
  const stats: { label: string; value: number; icon: LucideIcon; trend: number }[] = [
    { label: "Equipes", value: teams, icon: Users, trend: 12 },
    { label: "Jogadores", value: players, icon: UserCircle, trend: 8 },
    { label: "XTreinos", value: xtreinos.total, icon: Dumbbell, trend: xtreinos.abertos > 0 ? 25 : 0 },
    { label: "Campeonatos", value: championships.total, icon: Trophy, trend: championships.ativos > 0 ? 15 : 0 },
  ];

  return (
    <section className="border-y border-[#2a2a3a] bg-[#12121a]">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} trend={stat.trend} />
          ))}
        </div>
      </div>
    </section>
  );
}