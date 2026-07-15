import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Crosshair } from 'lucide-react';

export function KillDistribution({ players }: { players: { name: string; kills: number }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  // Pega o top 5 e calcula a porcentagem relativa ao primeiro colocado
  const top5 = players.slice(0, 5);
  if (top5.length === 0) return null;
  
  const maxKills = top5[0].kills || 1;

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
      className="relative z-20 bg-[#0a0a0f] px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-white/5"
    >
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-[0.2em] uppercase bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-4">
            Análise
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            Distribuição de <span className="text-cyan-400">Kills</span>
          </h2>
        </div>

        <div className="space-y-6">
          {top5.map((player, i) => {
            const widthPercent = (player.kills / maxKills) * 100;
            return (
              <div key={player.name} className="group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[#3a3a4e] text-xs font-mono w-4">#{i + 1}</span>
                    <span className="text-white font-bold text-sm group-hover:text-cyan-400 transition-colors">{player.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Crosshair className="w-3.5 h-3.5 text-cyan-400/50" />
                    <span className="text-white font-mono font-bold text-sm">{player.kills}</span>
                  </div>
                </div>
                
                <div className="h-2.5 w-full bg-[#12121a] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={isInView ? { width: `${widthPercent}%` } : { width: 0 }}
                    transition={{ duration: 1, delay: i * 0.15, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 relative"
                    style={{ boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)' }}
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] animate-shimmer" />
                  </motion.div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}