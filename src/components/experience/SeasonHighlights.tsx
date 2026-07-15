import { useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Trophy, Target, Flame } from 'lucide-react';
import { MorphingNumber } from './three/Effects';

export function SeasonHighlights({ 
  topPlayers, 
  topTeams 
}: { 
  topPlayers: { name: string; kills: number; avgKills: number }[]; 
  topTeams: { name: string; points: number; avgPoints: number }[]; 
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const highlights = useMemo(() => {
    const bestPlayerKills = topPlayers.reduce((best, p) => p.kills > best.kills ? p : best, topPlayers[0] || { name: '-', kills: 0, avgKills: 0 });
    const bestPlayerAvg = topPlayers.reduce((best, p) => p.avgKills > best.avgKills ? p : best, topPlayers[0] || { name: '-', kills: 0, avgKills: 0 });
    const bestTeam = topTeams.reduce((best, t) => t.points > best.points ? t : best, topTeams[0] || { name: '-', points: 0, avgPoints: 0 });

    return [
      { icon: Target, label: "Maior Killstreak Total", value: bestPlayerKills.kills, suffix: "kills", owner: bestPlayerKills.name, color: "from-emerald-500 to-emerald-400" },
      { icon: Flame, label: "Maior Média de Kills", value: bestPlayerAvg.avgKills, suffix: "avg", owner: bestPlayerAvg.name, color: "from-cyan-500 to-blue-400" },
      { icon: Trophy, label: "Time Mais Pontuado", value: bestTeam.points, suffix: "pts", owner: bestTeam.name, color: "from-violet-500 to-purple-400" },
    ];
  }, [topPlayers, topTeams]);

  if (topPlayers.length === 0 || topTeams.length === 0) return null;

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
      className="relative z-20 bg-[#0d0d14] px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-white/5"
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-[0.2em] uppercase bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-4">
            Recordes
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            Destaques da <span className="text-amber-400">Temporada</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {highlights.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="relative bg-[#12121a]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-6 text-center overflow-hidden group hover:border-white/10 transition-all"
              >
                {/* Brilho de fundo */}
                <div className={`absolute inset-0 bg-gradient-to-b ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-white/70" />
                  </div>
                  <p className="text-[#5a5a6e] text-xs uppercase tracking-wider mb-2">{item.label}</p>
                  
                  <div className="text-4xl sm:text-5xl font-black text-white mb-2">
                    <MorphingNumber value={item.value} trigger={isInView} />
                  </div>
                  <p className="text-xs text-[#5a5a6e]">
                    <span className="text-white/80 font-semibold">{item.owner}</span> • {item.suffix}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}