import MainLayout from "@/components/layout/MainLayout";
import HeroSection from "@/components/home/HeroSection";
import StatsBar from "@/components/home/StatsBar";
import DetailedStats from "@/components/home/DetailedStats";
import ActiveEvents from "@/components/home/ActiveEvents";
import Highlights from "@/components/home/Highlights";
import RankingsPreview from "@/components/home/RankingsPreview";
import CallToAction from "@/components/home/CallToAction";
import { useHomeData } from "@/hooks/useHomeData";
import { trpc } from "@/providers/trpc";

export default function Home() {
  const {
    championships,
    xtreinosList,
    teamsList,
    playersList,
    settings,
    xtreinoStats,
    championshipStats,
    scrimStats,
    xtreinoRealStats,
    scrimRealStats,
    upcomingEvents,
    recentActivities,
    topXtreinoPlayers,
    xtreinoRankingFallback,
    scrimRankingFallback,
  } = useHomeData();

  // ✅ Lógica de mutação isolada (geralmente fica no header, mas ok aqui por enquanto)
  const utils = trpc.useUtils();
  const recalculateMutation = trpc.rankings.recalculate.useMutation({
    onSuccess: () => {
      utils.rankings.teams.invalidate();
      utils.rankings.players.invalidate();
    },
  });

  return (
    <MainLayout>
      <style>{`
        /* Tech Grid de Fundo */
        .tech-grid-bg {
          background-image: linear-gradient(rgba(16,185,129,0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(16,185,129,0.03) 1px, transparent 1px);
          background-size: 50px 50px;
          mask-image: radial-gradient(ellipse at center, black 30%, transparent 70%);
          -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 70%);
        }

        /* Animações de Entrada */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up { opacity: 0; animation: fadeUp 0.6s ease-out forwards; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }

        /* Neon Glow por Categoria */
        @keyframes neon-pulse-emerald {
          0%, 100% { box-shadow: 0 0 5px rgba(16, 185, 129, 0.1), inset 0 0 5px rgba(16, 185, 129, 0.05); }
          50% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.2), inset 0 0 10px rgba(16, 185, 129, 0.1); }
        }
        @keyframes neon-pulse-blue {
          0%, 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.1), inset 0 0 5px rgba(59, 130, 246, 0.05); }
          50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.2), inset 0 0 10px rgba(59, 130, 246, 0.1); }
        }
        @keyframes neon-pulse-amber {
          0%, 100% { box-shadow: 0 0 5px rgba(245, 158, 11, 0.1), inset 0 0 5px rgba(245, 158, 11, 0.05); }
          50% { box-shadow: 0 0 20px rgba(245, 158, 11, 0.2), inset 0 0 10px rgba(245, 158, 11, 0.1); }
        }
        .neon-emerald { animation: neon-pulse-emerald 3s ease-in-out infinite; }
        .neon-blue { animation: neon-pulse-blue 4s ease-in-out infinite; }
        .neon-amber { animation: neon-pulse-amber 3.5s ease-in-out infinite; }

        /* Chromatic Aberration no Header */
        @keyframes chromatic-move {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }

        /* Bounce no Contador */
        .counter-bounce { transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); }

        /* Scrollbar */
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #2a2a3a; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3a3a4e; }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(16,185,129,0.1); }
          50% { box 0 0 40px rgba(16,185,129,0.2); }
        }
        .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
      `}</style>

      {/* MELHORIA 5: FUNDO TECH GRID GLOBAL */}
      <div className="fixed inset-0 -z-10 w-full h-full bg-[#0a0a0f] overflow-hidden pointer-events-none">
        <div className="absolute inset-0 tech-grid-bg" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08),transparent_60%)]" />
      </div>

      <section className="w-full bg-[#0a0a0f]/80 relative">
        <div className="w-full max-w-[1920px] mx-auto relative">
          <img src="/banner.jpg" alt="Underground Banner" className="w-full h-auto object-cover" style={{ aspectRatio: "2 / 1" }} loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/30 to-transparent" />
        </div>
      </section>

      <HeroSection orgName={settings?.orgName ?? "Underground"} />
      
      <StatsBar 
        teams={teamsList?.length ?? 0} 
        players={playersList?.length ?? 0} 
        xtreinos={xtreinoStats} 
        championships={championshipStats} 
      />
      
      <DetailedStats 
        xtreinoStats={xtreinoStats} 
        championshipStats={championshipStats} 
        scrimStats={scrimStats} 
        xtreinoRealStats={xtreinoRealStats}
        scrimRealStats={scrimRealStats} 
      />

      <ActiveEvents 
        championships={championships} 
        xtreinosList={xtreinosList} 
      />
      
      <Highlights 
        topPlayers={topXtreinoPlayers} 
        upcomingEvents={upcomingEvents} 
        recentActivities={recentActivities} 
      />
      
      <RankingsPreview 
        onRecalculate={() => recalculateMutation.mutate()} 
        isRecalculating={recalculateMutation.isPending}
        xtreinoFallback={xtreinoRankingFallback}
        scrimFallback={scrimRankingFallback}
      />
      
      <CallToAction />
    </MainLayout>
  );
}