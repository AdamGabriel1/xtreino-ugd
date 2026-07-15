import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Swords, Crosshair, Users, Trophy } from 'lucide-react';
import { MorphingNumber } from './three/Effects';

export function StatsSection({ stats }: { stats: { totalXtreinos: number; totalKills: number; totalTeams: number; totalPlayers: number } }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  
  const displayStats = [
    { value: stats.totalXtreinos, label: "XTreinos", icon: Swords },
    { value: stats.totalKills, label: "Kills Totais", icon: Crosshair },
    { value: stats.totalTeams, label: "Equipes", icon: Users },
    { value: stats.totalPlayers, label: "Players", icon: Trophy },
  ];

  return (
    <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-16 sm:mb-24">
      {displayStats.map((stat) => {
        const Icon = stat.icon;
        return (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="bg-[#12121a]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-4 sm:p-5 text-center group hover:border-emerald-500/30 transition-all duration-300"
          >
            <Icon className="w-5 h-5 text-emerald-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-2xl sm:text-3xl font-black text-white mb-1">
              <MorphingNumber value={stat.value} trigger={isInView} />
            </div>
            <div className="text-[#5a5a6e] text-xs uppercase tracking-wider">{stat.label}</div>
          </motion.div>
        );
      })}
    </div>
  );
}