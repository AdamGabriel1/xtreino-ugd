import { motion } from 'framer-motion';
import { Swords, Trophy, Target, Crown } from 'lucide-react';
import type { RecentActivity } from '@/types/experience';

const typeConfig: Record<string, { bg: string; text: string; icon: typeof Swords }> = {
  xtreino: { bg: 'bg-emerald-500', text: 'text-emerald-400', icon: Swords },
  championship: { bg: 'bg-violet-500', text: 'text-violet-400', icon: Trophy },
  scrim: { bg: 'bg-cyan-500', text: 'text-cyan-400', icon: Target },
  ranking: { bg: 'bg-amber-500', text: 'text-amber-400', icon: Crown },
};

interface TimelineSectionProps {
  activities: RecentActivity[];
}

export default function TimelineSection({ activities }: TimelineSectionProps) {
  if (activities.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="relative z-20 bg-[#0a0a0f] px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-white/5"
    >
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-[0.2em] uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-4">
            Em tempo real
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            Atividades <span className="text-emerald-400">Recentes</span>
          </h2>
        </div>

        {/* Estrutura da Timeline */}
        <div className="relative">
          {/* Linha central vertical */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-500/50 via-white/10 to-transparent" />

          <div className="space-y-8">
            {activities.map((activity, i) => {
              const config = typeConfig[activity.type] || typeConfig.xtreino;
              const Icon = config.icon;
              
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="relative pl-16 group"
                >
                  {/* Dot pulsante na linha do tempo */}
                  <div className={`absolute left-[18px] top-2 w-[18px] h-[18px] rounded-full ${config.bg} flex items-center justify-center z-10 ring-4 ring-[#0a0a0f] group-hover:scale-125 transition-transform`}>
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>

                  {/* Card de conteúdo */}
                  <div className="bg-[#12121a]/60 backdrop-blur-sm border border-white/5 rounded-xl p-5 group-hover:border-white/10 transition-all duration-300">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 min-w-0">
                        <div className={`w-10 h-10 rounded-xl ${config.bg}/10 flex items-center justify-center shrink-0 mt-1`}>
                          <Icon className={`w-5 h-5 ${config.text}`} />
                        </div>
                        <div>
                          <h4 className="text-white font-bold text-sm sm:text-base">{activity.title}</h4>
                          <p className="text-[#5a5a6e] text-xs sm:text-sm mt-1">
                            {activity.description.split(activity.highlight || '|||')[0]}
                            {activity.highlight && (
                              <span className="text-emerald-400 font-semibold">{activity.highlight}</span>
                            )}
                            {activity.description.split(activity.highlight || '|||')[1]}
                          </p>
                        </div>
                      </div>
                      <span className="text-[#3a3a4e] text-xs shrink-0 mt-1 hidden sm:block">{activity.date}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}