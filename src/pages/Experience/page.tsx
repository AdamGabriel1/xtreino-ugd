import { Suspense, lazy, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import ExperienceLayout from '@/components/layout/ExperienceLayout';

// ✅ Efeitos visuais (nova localização)
import { MouseTrailGlow } from '@/components/shared/effects';

// ✅ Hook de Tilt (agora é um hook separado, não fica inline na página)
import { useTilt } from '@/hooks/experience/useTilt';

// ✅ Hook de dados
import { useExperienceData } from '@/hooks/useExperienceData';

// Componentes Funcionais da Experience
import { PremiumLoader } from '@/components/experience/PremiumLoader';
import { StatsSection } from '@/components/experience/StatsSection';
import FeaturesGrid from '@/components/experience/FeaturesGrid'; // Ajustado para default export
import MantraSection from '@/components/experience/MantraSection'; // Ajustado para default export
import { TopPlayersSection } from '@/components/experience/TopPlayersSection';
import { TopTeamsSection } from '@/components/experience/TopTeamsSection';
import TimelineSection from '@/components/experience/TimelineSection'; // Ajustado para default export e nome correto

// Novos componentes
import { SeasonHighlights } from '@/components/experience/SeasonHighlights';
import { KillDistribution } from '@/components/experience/KillDistribution';
import { SeasonSummary } from '@/components/experience/SeasonSummary';
import { FinalCTA } from '@/components/experience/FinalCTA';
import { DetailedEventStats } from '@/components/experience/DetailedEventStats';

// Componente 3D pesado carregado sob demanda
const HolographicSphere = lazy(() => import('@/components/experience/three/HolographicSphere'));

export default function ExperiencePage() {
  // 1. Todos os Hooks vêm primeiro (regra do React para conditional renders)
  const { scrollYProgress } = useScroll();
  const { 
    orgName, 
    isLoading, 
    stats, 
    topPlayers, 
    topTeams, 
    recentActivities, 
    periodSummary, 
    detailedEventStats 
  } = useExperienceData();

  const sphereScale = useTransform(scrollYProgress, [0, 0.25], [1, 0.4]);
  const sphereOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.25], [0, -120]);

  const tilt = useTilt(10);
  const [showScroll, setShowScroll] = useState(true);

  useEffect(() => {
    const onScroll = () => window.scrollY > 50 ? setShowScroll(false) : setShowScroll(true);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 2. Retorno antecipado (Loading) DEPOIS que todos os hooks já foram declarados
  if (isLoading) {
    return (
      <ExperienceLayout>
        <PremiumLoader />
      </ExperienceLayout>
    );
  }

  // 3. Renderização principal
  return (
    <ExperienceLayout>
      <div className="relative bg-[#0a0a0f] overflow-x-hidden -mx-4 lg:-mx-8">
        <MouseTrailGlow />

        {/* Efeito de luz de fundo (Blur Blobs) */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] rounded-full bg-emerald-600/10 blur-[150px] animate-pulse-slow" />
          <div className="absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
        </div>

        {/* HERO SECTION */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          <motion.div 
            className="absolute inset-0 z-0" 
            style={{ scale: sphereScale, opacity: sphereOpacity }}
          >
            <Suspense fallback={<div className="w-full h-full bg-[#0a0a0f]" />}>
              <HolographicSphere />
            </Suspense>
          </motion.div>
          
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#0a0a0f_80%)] z-[1] pointer-events-none" />

          <motion.div 
            style={{ 
              y: heroY, 
              x: tilt.x, 
              rotateY: tilt.x * 0.05, 
              rotateX: -tilt.y * 0.05 
            }} 
            className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto will-change-transform"
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8 }} 
              className="mb-6 sm:mb-8"
            >
              <span className="inline-block px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                {orgName} — A Nova Era do E-sports Mobile
              </span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 40 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 1, delay: 0.2 }} 
              className="text-[15vw] sm:text-[12vw] md:text-[8vw] lg:text-8xl font-black text-white leading-[0.85] sm:leading-[0.9] tracking-tighter mb-6 sm:mb-8 drop-shadow-[0_0_60px_rgba(16,185,129,0.4)]"
            >
              MAIS QUE <br className="sm:hidden" />
              UM <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-300 to-cyan-400">JOGO.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8, delay: 0.5 }} 
              className="text-base sm:text-lg md:text-xl text-[#6a6a7e] max-w-2xl mx-auto leading-relaxed px-2"
            >
              Uma experiência imersiva onde dados, competição e tecnologia se encontram para redefinir o cenário competitivo.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: showScroll ? 1 : 0 }} 
              transition={{ duration: 0.3 }} 
              className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            >
              <span className="text-[#3a3a4e] text-[10px] tracking-[0.3em] uppercase">Explore</span>
              <motion.div 
                animate={{ y: [0, 8, 0] }} 
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} 
                className="w-5 h-8 border-2 border-[#3a3a4e] rounded-full flex justify-center pt-1.5"
              >
                <div className="w-1 h-2 bg-emerald-500 rounded-full" />
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* STATS & FEATURES */}
        <section className="relative z-20 bg-[#0a0a0f] py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              className="text-center mb-12 sm:mb-16"
            >
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-[0.2em] uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-4">
                Construída para dominar
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
                Tecnologia de <span className="text-emerald-400">ponta</span>
              </h2>
            </motion.div>
            <StatsSection stats={stats} />
            <FeaturesGrid />
          </div>
        </section>

        <DetailedEventStats {...detailedEventStats} />
        
        <MantraSection />
        
        {/* SESSÕES NOVAS */}
        <SeasonSummary summary={periodSummary} />
        <SeasonHighlights topPlayers={topPlayers} topTeams={topTeams} />
        <KillDistribution players={topPlayers} />
        
        {/* RANKINGS & TIMELINE */}
        <TopPlayersSection players={topPlayers} orgName={orgName} />
        <TopTeamsSection teams={topTeams} orgName={orgName} />
        <TimelineSection activities={recentActivities} />

        {/* CTA FINAL */}
        <FinalCTA />
      </div>
    </ExperienceLayout>
  );
}