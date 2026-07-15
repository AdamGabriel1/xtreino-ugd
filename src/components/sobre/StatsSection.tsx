import { useEffect, useRef, useState } from "react";
import { Gamepad2, Users, Star, Trophy, type LucideIcon } from "lucide-react";
import { useAboutStats } from "@/hooks/useAboutStats";

// ============================================================================
// HOOK: Animação do Contador
// ============================================================================
function useAnimatedCounter(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = performance.now();
          const step = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const newCount = Math.round(eased * target);
            setCount(newCount);
            if (progress >= 1 && ref.current) {
              ref.current.style.transform = "scale(1.15)";
              setTimeout(() => { if(ref.current) ref.current.style.transform = "scale(1)"; }, 200);
            }
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

// ============================================================================
// CONFIGURAÇÃO DAS STATS
// ============================================================================
interface StatConfig {
  label: string;
  icon: LucideIcon;
  suffix: string;
  value: number;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export default function StatsSection() {
  const { xtreinosRealizados, equipesAtivas, jogadoresRegistrados, campeonatosRealizados, isLoading } = useAboutStats();

  const stats: StatConfig[] = [
    { value: xtreinosRealizados, label: "XTreinos Realizados", icon: Gamepad2, suffix: "+" },
    { value: equipesAtivas, label: "Equipes Ativas", icon: Users, suffix: "+" },
    { value: jogadoresRegistrados, label: "Jogadores Registrados", icon: Star, suffix: "+" },
    { value: campeonatosRealizados, label: "Campeonatos Realizados", icon: Trophy, suffix: "" },
  ];

  // Fallback de loading enquanto busca os dados reais
  if (isLoading) {
    return (
      <section className="border-y border-[#2a2a3a] bg-[#12121a]/80 backdrop-blur-sm">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center animate-pulse">
                <div className="w-14 h-14 rounded-xl bg-[#1a1a24] mx-auto mb-3" />
                <div className="h-8 w-24 bg-[#1a1a24] rounded mx-auto mb-2" />
                <div className="h-4 w-20 bg-[#1a1a24] rounded mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="border-y border-[#2a2a3a] bg-[#12121a]/80 backdrop-blur-sm">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return <StatCard key={stat.label} stat={stat} Icon={Icon} delay={idx} />;
          })}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// COMPONENTE: Card Individual
// ============================================================================
function StatCard({ stat, Icon, delay }: { 
  stat: StatConfig; 
  Icon: LucideIcon; 
  delay: number;
}) {
  const { count, ref } = useAnimatedCounter(stat.value, 1500 + delay * 200);
  return (
    <div ref={ref} className={`counter-bounce text-center group animate-fade-up delay-${(delay + 1) * 100}`}>
      <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all duration-300">
        <Icon className="w-6 h-6 text-emerald-400" />
      </div>
      <p className="text-3xl font-bold text-[#f0f0f0f5] mb-1 tabular-nums">
        {count}<span className="text-emerald-400">{stat.suffix}</span>
      </p>
      <p className="text-[#8a8a9e] text-sm">{stat.label}</p>
    </div>
  );
}