import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "@/types/home";

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
            
            // MELHORIA 4: Efeito de "pulo" ao terminar de contar
            if (progress >= 1 && ref.current) {
              ref.current.style.transform = "scale(1.15)";
              setTimeout(() => {
                if(ref.current) ref.current.style.transform = "scale(1)";
              }, 200);
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

export default function StatCard({ label, value, icon: Icon, trend }: { label: string; value: number; icon: LucideIcon; trend?: number }) {
  const { count, ref } = useAnimatedCounter(value);
  return (
    <div ref={ref} className="counter-bounce bg-[#12121a] rounded-xl p-5 border border-[#2a2a3a] hover:border-emerald-500/30 transition-all duration-300 group hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:to-transparent transition-all duration-500" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all duration-300">
            <Icon className="w-5 h-5 text-emerald-400" />
          </div>
          {trend !== undefined && (
            <span className={`text-xs font-semibold flex items-center gap-0.5 px-2 py-0.5 rounded-full ${
              trend >= 0 ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"
            }`}>
              {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3 rotate-180" />}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
        <p className="text-2xl font-bold text-[#f0f0f5] mb-1 tabular-nums">{count}</p>
        <p className="text-[#8a8a9e] text-sm">{label}</p>
      </div>
    </div>
  );
}