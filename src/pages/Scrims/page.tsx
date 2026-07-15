import { Link } from "react-router-dom";
import { 
  Swords, Users, Target, ArrowRight, Shield, Calendar, 
  Crosshair, TrendingUp, BarChart3 
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";

const MODES = [
  { 
    id: "br", 
    title: "Battle Royale (BR)", 
    icon: <Target className="w-6 h-6 text-blue-400" />, 
    color: "border-blue-500/20 hover:border-blue-500/50",
    bgColor: "bg-blue-500/10",
    desc: "Partidas no modo clássico de Sobrevivência. Pontuação dinâmica baseada na posição final da queda (1º lugar = 15pts, 2º = 12pts...) somado às kills realizadas.",
    link: "/scrims/agendados"
  },
  { 
    id: "mme", 
    title: "Mata-Mata em Equipe (MME)", 
    icon: <Users className="w-6 h-6 text-orange-400" />, 
    color: "border-orange-500/20 hover:border-orange-500/50",
    bgColor: "bg-orange-500/10",
    desc: "Sistema de confronto direto em séries (Melhor de 3, 5, 7...). O time que vencer mais rounds ganha a scrim. Foco extremo em mira, coordenada e团队战术.",
    link: "/scrims/agendados"
  },
];

const QUICK_LINKS = [
  { to: "/scrims/agendados", label: "Partidas Agendadas", icon: <Calendar className="w-4 h-4" /> },
  { to: "/scrims/ranking-jogadores", label: "Ranking Jogadores", icon: <Crosshair className="w-4 h-4" /> },
  { to: "/scrims/ranking-times", label: "Ranking Times", icon: <Shield className="w-4 h-4" /> },
  { to: "/scrims/agendados", label: "Ver Hub Completo", icon: <BarChart3 className="w-4 h-4" /> },
];

export default function ScrimsLanding() {
  return (
    <MainLayout>
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 pb-16">
        {/* Hero Header */}
        <div className="bg-[#12121a] border-b border-[#2a2a3a] -mx-4 lg:-mx-8 px-4 lg:px-8 py-16 mb-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20">
                <Swords className="w-8 h-8 text-red-400" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-red-400 bg-red-500/10 px-3 py-1 rounded-full">Centro de Treinos</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#f0f0f5] mb-4 leading-tight">
              Scrims <span className="text-red-400">Hub</span>
            </h1>
            <p className="text-lg text-[#8a8a9e] leading-relaxed mb-8">
              O centro de organização de todas as partidas de treino (Scrims) da comunidade. 
              Agende partidas entre times, acompanhe resultados em tempo real e suba no ranking 
              através de duas modalidades distintas: <span className="text-[#f0f0f5] font-semibold">BR</span> e{" "}
              <span className="text-[#f0f0f5] font-semibold">MME</span>.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                to="/scrims/agendados" 
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
              >
                Ver Partidas <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                to="/scrims/novo" 
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium bg-[#1a1a24] text-[#f0f0f5] border border-[#2a2a3a] hover:bg-[#2a2a3a] transition-all"
              >
                Agendar Nova Scrim
              </Link>
            </div>
          </div>
        </div>

        {/* Modalidades */}
        <div className="mb-12">
          <h2 className="text-2xl font-extrabold text-[#f0f0f5] mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-red-400" /> Modalidades Disponíveis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MODES.map((mode) => (
              <Link 
                key={mode.id} 
                to={mode.link}
                className={`relative bg-[#12121a] border ${mode.color} rounded-2xl p-6 transition-all group overflow-hidden`}
              >
                <div className="relative z-10">
                  <div className={`mb-4 p-3 w-fit rounded-xl ${mode.bgColor} transition-transform group-hover:scale-110`}>
                    {mode.icon}
                  </div>
                  <h3 className="text-xl font-bold text-[#f0f0f5] mb-2 flex items-center justify-between">
                    {mode.title}
                    <ArrowRight className="w-5 h-5 text-[#5a5a6e] group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </h3>
                  <p className="text-sm text-[#8a8a9e] leading-relaxed">{mode.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Acesso Rápido */}
        <div className="bg-[#1a1a24] rounded-2xl border border-[#2a2a3a] p-6">
          <h3 className="text-lg font-bold text-[#f0f0f5] mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-red-400" /> Navegação Rápida
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {QUICK_LINKS.map((link) => (
              <Link 
                key={link.to} 
                to={link.to} 
                className="flex items-center gap-3 p-4 bg-[#12121a] border border-[#2a2a3a] rounded-xl hover:border-red-500/30 hover:bg-[#12121a]/80 transition-all group"
              >
                <div className="text-[#5a5a6e] group-hover:text-red-400 transition-colors">{link.icon}</div>
                <span className="text-sm font-medium text-[#8a8a9e] group-hover:text-[#f0f0f5] transition-colors">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}