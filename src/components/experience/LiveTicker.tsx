import { Swords, Trophy, TrendingUp, type LucideIcon } from 'lucide-react';
import type { RecentActivity } from '@/types/experience';

const iconMap: Record<string, { icon: LucideIcon; color: string }> = {
  xtreino: { icon: Swords, color: "text-emerald-400" },
  championship: { icon: Trophy, color: "text-yellow-400" },
  scrim: { icon: Swords, color: "text-cyan-400" },
  ranking: { icon: TrendingUp, color: "text-violet-400" },
};

interface LiveTickerProps {
  activities: RecentActivity[];
}

export function LiveTicker({ activities }: LiveTickerProps) {
  // Pega apenas os 8 primeiros para não poluir
  const actions = activities.slice(0, 8);

  if (actions.length === 0) return null;

  return (
    <div className="relative z-20 bg-[#080810] border-y border-white/5 py-2.5 overflow-hidden">
      <div className="flex items-center">
        <div className="relative z-10 shrink-0 mx-4 flex items-center gap-2 bg-[#0a0a0f] px-3 py-1 rounded-full border border-white/10">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="text-[10px] font-bold tracking-widest uppercase text-white">Ao Vivo</span>
        </div>

        <div className="relative flex-1 overflow-hidden">
          <div className="flex animate-ticker-scroll whitespace-nowrap">
            {[...actions, ...actions].map((action, i) => {
              const config = iconMap[action.type] || iconMap.xtreino;
              const Icon = config.icon;
              return (
                <div key={`${action.id}-${i}`} className="inline-flex items-center gap-2 mx-8 text-xs text-[#5a5a6e]">
                  <Icon className={`w-3.5 h-3.5 ${config.color} shrink-0`} />
                  <span>{action.title}</span>
                  <span className="text-[#2a2a3e]">•</span>
                </div>
              );
            })}
          </div>
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#080810] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#080810] to-transparent z-10 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}