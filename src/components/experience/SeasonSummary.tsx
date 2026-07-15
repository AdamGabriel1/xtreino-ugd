import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Users, Target, Calendar, TrendingUp } from 'lucide-react';
import { MorphingNumber } from './three/Effects';

export function SeasonSummary({ summary }: { summary: { totalKills: number; totalPoints: number; uniqueTeams: number; uniquePlayers: number; uniqueDates: number } | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  if (!summary) return null;

  const gridData = [
    { icon: Users, label: "Jogadores Ativos", value: summary.uniquePlayers, color: "text-emerald-400" },
    { icon: Target, label: "Kills Totais", value: summary.totalKills, color: "text-cyan-400" },
    { icon: TrendingUp, label: "Pontos Distribuídos", value: summary.totalPoints, color: "text-violet-400" },
    { icon: Calendar, label: "Dias de Competição", value: summary.uniqueDates, color: "text-amber-400" },
  ];

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
      className="relative z-20 bg-[#0d0d14] px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-white/5 overflow-hidden"
    >
      {/* Efeito de fundo Grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-[0.2em] uppercase bg-violet-500/10 border border-violet-500/30 text-violet-400 mb-4">
            Visão Geral
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            Raio-X da <span className="text-violet-400">Temporada</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {gridData.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-[#12121a]/80 backdrop-blur-sm border border-white/5 rounded-2xl p-5 text-center group hover:border-white/10 transition-all"
              >
                <Icon className={`w-6 h-6 ${item.color} mx-auto mb-3 group-hover:scale-110 transition-transform`} />
                <div className={`text-3xl sm:text-4xl font-black text-white mb-1`}>
                  <MorphingNumber value={item.value} trigger={isInView} />
                </div>
                <p className="text-[#5a5a6e] text-xs uppercase tracking-wider">{item.label}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}