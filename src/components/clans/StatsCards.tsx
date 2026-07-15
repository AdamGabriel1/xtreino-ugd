import type { ReactNode } from "react";

interface StatCard {
  icon: ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
  color?: string;
}

interface StatsCardsProps {
  stats: StatCard[];
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            {stat.icon}
            <span className="text-xs text-[#5a5a6e] uppercase">{stat.label}</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: stat.color ?? "#f0f0f5" }}>
            {stat.value}
          </p>
          {stat.subValue && (
            <p className="text-xs text-[#5a5a6e] mt-1">{stat.subValue}</p>
          )}
        </div>
      ))}
    </div>
  );
}