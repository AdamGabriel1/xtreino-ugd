import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, Zap, MapPin } from 'lucide-react';
import { MorphingNumber } from './three/Effects';

// Tipagem baseada nas suas tabelas: xtreinos, championships, salinhas
export interface UpcomingEvent {
  id: number;
  type: 'xtreino' | 'championship' | 'salinha';
  title: string;
  date: string; // Texto no formato "YYYY-MM-DD" ou "DD/MM/YYYY"
  timeBr?: string | null;
  location?: string | null;
  maxTeams?: number | null;
  registeredTeams?: number | null;
  maxParticipants?: number | null;
  status: string;
}

interface UpcomingEventsProps {
  events: UpcomingEvent[];
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="bg-[#0a0a0f] border border-white/10 rounded-lg px-3 py-2 min-w-[55px] mb-1">
        <MorphingNumber value={value} trigger={true} className="text-xl sm:text-2xl font-black text-white justify-center" />
      </div>
      <span className="text-[10px] uppercase tracking-wider text-[#5a5a6e] hidden sm:block">{label}</span>
    </div>
  );
}

function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  
  useEffect(() => {
    // Tenta parsear a data (suporta YYYY-MM-DD e DD/MM/YYYY)
    let dateObj = new Date(targetDate);
    if (isNaN(dateObj.getTime()) && targetDate.includes('/')) {
      const parts = targetDate.split('/');
      if (parts.length === 3) dateObj = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    }

    const targetTime = dateObj.getTime();
    if (isNaN(targetTime)) return;

    const getTimeLeft = () => {
      const distance = targetTime - new Date().getTime();
      if (distance <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return {
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      };
    };

    setTimeLeft(getTimeLeft());
    const interval = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

export function UpcomingEvents({ events }: UpcomingEventsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  if (events.length === 0) return null;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
      className="relative z-20 bg-[#0a0a0f] px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-white/5"
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-[0.2em] uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              Não perca
            </span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            Próximos <span className="text-emerald-400">Eventos</span>
          </h2>
        </div>

        <div className="space-y-4">
          {events.map((event: UpcomingEvent, i: number) => {
            const timeLeft = useCountdown(event.date);
            const hasStarted = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;
            
            const configMap: Record<string, { color: string; route: string; label: string }> = {
              xtreino: { color: 'bg-emerald-500/20 text-emerald-400', route: '/xtreinos', label: 'XTreino' },
              championship: { color: 'bg-violet-500/20 text-violet-400', route: '/campeonatos', label: 'Campeonato' },
              salinha: { color: 'bg-cyan-500/20 text-cyan-400', route: '/salinhas', label: 'Salinha' },
            };
            const config = configMap[event.type] || configMap.xtreino;

            return (
              <motion.div
                key={`${event.type}-${event.id}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group relative bg-[#12121a]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-5 hover:border-emerald-500/30 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 to-violet-500/0 group-hover:from-emerald-500/5 group-hover:to-violet-500/5 transition-all duration-500" />

                <div className="relative z-10 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${config.color}`}>
                        {config.label}
                      </span>
                      {hasStarted && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 animate-pulse">
                          Em breve
                        </span>
                      )}
                    </div>
                    
                    <Link to={`${config.route}/${event.id}`} className="text-white font-bold text-base truncate mb-2 group-hover:text-emerald-400 transition-colors block">
                      {event.title}
                    </Link>

                    <div className="flex flex-wrap gap-3 text-xs text-[#5a5a6e]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {event.date}
                      </span>
                      {event.timeBr && (
                        <span className="flex items-center gap-1 text-[#8a8a9e]">
                          às {event.timeBr}
                        </span>
                      )}
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {event.location}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {hasStarted ? (
                      <Link to={`${config.route}/${event.id}`} className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-emerald-500/30 transition-colors">
                        Ver Detalhes
                      </Link>
                    ) : (
                      <div className="flex gap-1.5 sm:gap-2">
                        <TimeBlock value={timeLeft.days} label="Dias" />
                        <span className="text-[#3a3a4e] text-lg font-bold mt-[-10px]">:</span>
                        <TimeBlock value={timeLeft.hours} label="Hrs" />
                        <span className="text-[#3a3a4e] text-lg font-bold mt-[-10px] hidden sm:block">:</span>
                        <TimeBlock value={timeLeft.minutes} label="Min" />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}