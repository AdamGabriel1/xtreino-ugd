import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Dumbbell, Trophy, Swords, Gamepad2 } from 'lucide-react';
import { MorphingNumber } from './three/Effects';

interface DetailedEventStatsProps {
  xtreinoStats: { total: number; abertos: number; emAndamento: number; fechados: number };
  championshipStats: { total: number; ativos: number; inscricoes: number; encerrados: number };
  scrimStats: { total: number; agendados: number; emAndamento: number; finalizados: number };
  salinhaStats: { total: number; abertas: number; encerradas: number };
  xtreinoRealStats: { totalTeams: number; totalKills: number; totalPoints: number; totalXtreinos: number };
  scrimRealStats: { totalTeams: number; totalKills: number; totalPoints: number; totalScrims: number };
}

export function DetailedEventStats({
  xtreinoStats, championshipStats, scrimStats, salinhaStats, xtreinoRealStats, scrimRealStats
}: DetailedEventStatsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
      className="relative z-20 bg-[#0a0a0f] px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-white/5"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-[0.2em] uppercase bg-blue-500/10 border border-blue-500/30 text-blue-400 mb-4">
            Visão Micro
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            Estatísticas <span className="text-blue-400">Detalhadas</span>
          </h2>
        </div>

        {/* Grid Principal: 3 colunas no Desktop, 1 no Mobile */}
        {/* Usando cols-span para o card de Salinhas ocupar espaço inteligente */}
        <div className="grid md:grid-cols-3 gap-6">
          
          {/* CARD XTREINOS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="group relative bg-[#12121a]/80 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden hover:border-emerald-500/40 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] md:col-span-1"
          >
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent skew-x-12 z-10 pointer-events-none" />
            
            <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3 relative z-20">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                <Dumbbell className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-[#f0f0f5]">XTreinos</h3>
                <p className="text-[#5a5a6e] text-xs">{xtreinoStats.total} eventos</p>
              </div>
            </div>
            
            <div className="p-6 grid grid-cols-3 gap-4 relative z-20">
              {[
                { value: xtreinoStats.abertos, label: "Abertos", color: "text-emerald-400" }, 
                { value: xtreinoStats.emAndamento, label: "Em Andamento", color: "text-amber-400" }, 
                { value: xtreinoStats.fechados, label: "Fechados", color: "text-red-400" }
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <p className={`text-2xl font-black ${item.color} tabular-nums`}>
                    <MorphingNumber value={item.value} trigger={isInView} />
                  </p>
                  <p className="text-[#5a5a6e] text-[10px] mt-1 uppercase tracking-wider">{item.label}</p>
                </div>
              ))}
            </div>
            
            {xtreinoRealStats.totalTeams > 0 && (
              <div className="px-6 pb-5 border-t border-white/5 relative z-20">
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {[
                    { value: xtreinoRealStats.totalTeams, label: "Times", color: "text-emerald-400" },
                    { value: xtreinoRealStats.totalKills, label: "Kills", color: "text-green-400" },
                    { value: xtreinoRealStats.totalPoints, label: "Pontos", color: "text-yellow-400" },
                  ].map((item) => (
                    <div key={item.label} className="text-center p-2 rounded-lg bg-[#0a0a0f]/50 border border-white/5">
                      <p className={`text-lg font-bold ${item.color} tabular-nums`}>{item.value}</p>
                      <p className="text-[#5a5a6e] text-[10px]">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          <div className="flex flex-col gap-6 md:col-span-2">
            <div className="grid md:grid-cols-2 gap-6">
              {/* CARD CAMPEONATOS */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="group relative bg-[#12121a]/80 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden hover:border-amber-500/40 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]"
              >
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent skew-x-12 z-10 pointer-events-none" />
                
                <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3 relative z-20">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                    <Trophy className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#f0f0f5]">Campeonatos</h3>
                    <p className="text-[#5a5a6e] text-xs">{championshipStats.total} total</p>
                  </div>
                </div>
                
                <div className="p-6 grid grid-cols-3 gap-4 relative z-20">
                  {[
                    { value: championshipStats.ativos, label: "Ativos", color: "text-emerald-400" }, 
                    { value: championshipStats.inscricoes, label: "Inscrições", color: "text-amber-400" }, 
                    { value: championshipStats.encerrados, label: "Encerrados", color: "text-red-400" }
                  ].map((item) => (
                    <div key={item.label} className="text-center">
                      <p className={`text-2xl font-black ${item.color} tabular-nums`}>
                        <MorphingNumber value={item.value} trigger={isInView} />
                      </p>
                      <p className="text-[#5a5a6e] text-[10px] mt-1 uppercase tracking-wider">{item.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* CARD SALINHAS (NOVO) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="group relative bg-[#12121a]/80 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden hover:border-pink-500/40 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(236,72,153,0.15)]"
              >
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-pink-500/10 to-transparent skew-x-12 z-10 pointer-events-none" />
                
                <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3 relative z-20">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center group-hover:bg-pink-500/20 transition-colors">
                    <Gamepad2 className="w-5 h-5 text-pink-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#f0f0f5]">Salinhas</h3>
                    <p className="text-[#5a5a6e] text-xs">{salinhaStats.total} eventos</p>
                  </div>
                </div>
                
                <div className="p-6 grid grid-cols-2 gap-4 relative z-20">
                  {[
                    { value: salinhaStats.abertas, label: "Abertas", color: "text-pink-400" }, 
                    { value: salinhaStats.encerradas, label: "Encerradas", color: "text-red-400" }
                  ].map((item) => (
                    <div key={item.label} className="text-center">
                      <p className={`text-2xl font-black ${item.color} tabular-nums`}>
                        <MorphingNumber value={item.value} trigger={isInView} />
                      </p>
                      <p className="text-[#5a5a6e] text-[10px] mt-1 uppercase tracking-wider">{item.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* CARD SCRIMS (LARGURA TOTAL DA COLUNA DA DIREITA) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="group relative bg-[#12121a]/80 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden hover:border-blue-500/40 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]"
            >
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent skew-x-12 z-10 pointer-events-none" />
              
              <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3 relative z-20">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <Swords className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-[#f0f0f5]">Scrims</h3>
                  <p className="text-[#5a5a6e] text-xs">{scrimStats.total} eventos</p>
                </div>
              </div>
              
              <div className="p-6 grid grid-cols-3 gap-4 relative z-20">
                {[
                  { value: scrimStats.agendados, label: "Agendados", color: "text-blue-400" }, 
                  { value: scrimStats.emAndamento, label: "Em Andamento", color: "text-amber-400" }, 
                  { value: scrimStats.finalizados, label: "Finalizados", color: "text-red-400" }
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <p className={`text-2xl font-black ${item.color} tabular-nums`}>
                      <MorphingNumber value={item.value} trigger={isInView} />
                    </p>
                    <p className="text-[#5a5a6e] text-[10px] mt-1 uppercase tracking-wider">{item.label}</p>
                  </div>
                ))}
              </div>
              
              {scrimRealStats.totalTeams > 0 && (
                <div className="px-6 pb-5 border-t border-white/5 relative z-20">
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    {[
                      { value: scrimRealStats.totalTeams, label: "Times", color: "text-blue-400" },
                      { value: scrimRealStats.totalKills, label: "Kills", color: "text-green-400" },
                      { value: scrimRealStats.totalPoints, label: "Pontos", color: "text-yellow-400" },
                    ].map((item) => (
                      <div key={item.label} className="text-center p-2 rounded-lg bg-[#0a0a0f]/50 border border-white/5">
                        <p className={`text-lg font-bold ${item.color} tabular-nums`}>{item.value}</p>
                        <p className="text-[#5a5a6e] text-[10px]">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

        </div>
      </div>
    </motion.section>
  );
}