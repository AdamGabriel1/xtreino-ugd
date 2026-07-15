import { Link } from "react-router";
import { Trophy, Dumbbell, BarChart3, Sparkles } from "lucide-react";
import FloatingParticles from "./FloatingParticles";

export default function HeroSection({ orgName }: { orgName: string }) {
  return (
    <section className="relative min-h-[55vh] flex items-center justify-center overflow-hidden -mt-20">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/50 via-transparent to-[#0a0a0f]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.1)_0%,_transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(16,185,129,0.06)_0%,_transparent_50%)]" />
      <FloatingParticles />

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8 backdrop-blur-sm">
          <Sparkles className="w-4 h-4" />
          Temporada 2026 em andamento
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 leading-tight">
          <span className="bg-gradient-to-r from-white via-emerald-100 to-emerald-400 bg-clip-text text-transparent">
            {orgName}
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-[#8a8a9e] mb-10 max-w-2xl mx-auto leading-relaxed">
          Sistema completo de <span className="text-emerald-400 font-medium">XTreinos</span>,{" "}
          <span className="text-emerald-400 font-medium">Scrims</span> e{" "}
          <span className="text-emerald-400 font-medium">Campeonatos</span> Mobile.
          Gerencie equipes, acompanhe rankings e organize competições.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/campeonatos"
            className="px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-all duration-200 hover:scale-[1.03] shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
          >
            <Trophy className="w-4 h-4" />
            Ver Campeonatos
          </Link>
          <Link
            to="/xtreinos"
            className="px-8 py-3.5 rounded-xl bg-[#12121a] border border-[#3a3a4e] text-[#f0f0f5] font-semibold hover:border-emerald-500/50 hover:text-emerald-400 hover:bg-[#1a1a24] transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Dumbbell className="w-4 h-4" />
            Ver XTreinos
          </Link>
          <Link
            to="/rankings"
            className="px-8 py-3.5 rounded-xl bg-[#12121a] border border-[#3a3a4e] text-[#f0f0f5] font-semibold hover:border-emerald-500/50 hover:text-emerald-400 hover:bg-[#1a1a24] transition-all duration-200 flex items-center justify-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Rankings
          </Link>
        </div>
      </div>
    </section>
  );
}