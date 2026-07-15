import MainLayout from "@/components/layout/MainLayout";
import HeroSection from "@/components/sobre/HeroSection";
import StatsSection from "@/components/sobre/StatsSection";
import HistoryTimeline from "@/components/sobre/HistoryTimeline";
import ValuesGrid from "@/components/sobre/ValuesGrid";
import ObjectivesGrid from "@/components/sobre/ObjectivesGrid";
import TeamSection from "@/components/sobre/TeamSection";
import PartnersGrid from "@/components/sobre/PartnersGrid";
import CallToAction from "@/components/sobre/CallToAction";

export default function Sobre() {
  return (
    <MainLayout>
      <style>{`
        /* Tech Grid de Fundo (Mesmo da Home) */
        .tech-grid-bg {
          background-image: linear-gradient(rgba(16,185,129,0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(16,185,129,0.03) 1px, transparent 1px);
          background-size: 50px 50px;
          mask-image: radial-gradient(ellipse at center, black 30%, transparent 70%);
          -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 70%);
        }

        /* Animações de Entrada Suave */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up { opacity: 0; animation: fadeUp 0.6s ease-out forwards; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }

        /* Chromatic Aberration */
        @keyframes chromatic-move {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }

        /* Texto Neon Glow Sutil para o Hero */
        .text-glow {
          text-shadow: 0 0 20px rgba(16, 185, 129, 0.3), 0 0 40px rgba(16, 185, 129, 0.1);
        }

        /* Animação de flutuação lenta */
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }

        /* Bounce para contadores */
        .counter-bounce { transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
      `}</style>

      {/* FUNDO TECH GRID GLOBAL */}
      <div className="fixed inset-0 -z-10 w-full h-full bg-[#0a0a0f] overflow-hidden pointer-events-none">
        <div className="absolute inset-0 tech-grid-bg" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08),transparent_60%)]" />
      </div>

      <HeroSection />
      <StatsSection />

      {/* Nossa História com Timeline */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div className="animate-fade-up">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-8 bg-emerald-500 rounded-full" />
              <h2 className="text-2xl font-bold text-[#f0f0f5]">Nossa História</h2>
            </div>
            <div className="space-y-5 text-[#8a8a9e] leading-relaxed">
              <p>
                A <span className="text-emerald-400 font-semibold">Underground (UGD)</span> nasceu da paixão de um grupo de jogadores
                que queriam levar o cenário mobile a sério. O que começou como salinhas entre amigos
                evoluiu para uma organização completa de xtreinos e campeonatos.
              </p>
              <p>
                Hoje, somos referência em organização de eventos competitivos mobile,
                oferecendo uma plataforma completa para equipes e jogadores acompanharem
                seus resultados, rankings e evolução no cenário.
              </p>
              <p>
                Nosso compromisso é com a <span className="text-emerald-400 font-semibold">transparência</span>,
                <span className="text-emerald-400 font-semibold"> competitividade</span> e
                <span className="text-emerald-400 font-semibold"> diversão</span>.
                Acreditamos que o cenário mobile tem potencial enorme e trabalhamos todos os dias
                para torná-lo cada vez mais profissional.
              </p>
            </div>
          </div>

          <div className="animate-fade-up delay-200">
            <HistoryTimeline />
          </div>
        </div>
      </section>

      <ValuesGrid />
      <ObjectivesGrid />
      <TeamSection />
      
      <section className="border-t border-[#2a2a3a] bg-[#0d0d14]/80 pb-16 pt-0">
        <PartnersGrid />
      </section>

      <CallToAction />
    </MainLayout>
  );
}