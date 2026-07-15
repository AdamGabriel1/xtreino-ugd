import { Link } from "react-router-dom";
import { 
  Dumbbell, Trophy, Users, TrendingUp, ArrowRight, 
  BarChart3, Target, CalendarDays, Medal 
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";

const FEATURES = [
  { icon: <Trophy className="w-6 h-6 text-yellow-400" />, title: "Pontuação por Posição", desc: "Quedas com sistema de pontos onde o 1º lugar vale mais, incentivando a consistência no jogo." },
  { icon: <Target className="w-6 h-6 text-red-400" />, title: "Pontuação por Kills", desc: "Cada eliminação adiciona pontos ao seu total, recompensando jogadores agressivos e habilidosos." },
  { icon: <BarChart3 className="w-6 h-6 text-emerald-400" />, title: "Rankings Dinâmicos", desc: "Acompanhe a evolução no ranking geral, mensal e semanal com gráficos detalhados." },
  { icon: <Users className="w-6 h-6 text-blue-400" />, title: "Por Times e Individual", desc: "Veja o desempenho da sua Line contra outras e compare estatísticas jogador por jogador." },
];

// Substitua o array QUICK_LINKS no arquivo XTreinosLanding.tsx
const QUICK_LINKS = [
  { to: "/rankings/geral", label: "Ranking Geral", icon: <Trophy className="w-4 h-4" /> },
  { to: "/rankings/mensal", label: "Ranking Mensal", icon: <CalendarDays className="w-4 h-4" /> },
  { to: "/rankings/clas", label: "Ranking de Clãs", icon: <Users className="w-4 h-4" /> },
  // ATUALIZADO: Agora aponta direto para a aba de kills de XT dentro de jogadores
  { to: "/rankings/jogadores/xtreinos", label: "Kills em X-Treinos", icon: <Target className="w-4 h-4" /> },
];

export default function XTreinosLanding() {
  return (
    <MainLayout>
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 pb-16">
        {/* Hero Header */}
        <div className="bg-[#12121a] border-b border-[#2a2a3a] -mx-4 lg:-mx-8 px-4 lg:px-8 py-16 mb-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <Dumbbell className="w-8 h-8 text-emerald-400" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">Modalidade Competitiva</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#f0f0f5] mb-4 leading-tight">
              X-Treinos <span className="text-emerald-400">Underground</span>
            </h1>
            <p className="text-lg text-[#8a8a9e] leading-relaxed mb-8">
              O sistema oficial de treinos competitivos da comunidade. Partidas organizadas com pontuação 
              rígida baseada em <span className="text-[#f0f0f5] font-semibold">posição de queda</span> e{" "}
              <span className="text-[#f0f0f5] font-semibold">número de eliminações</span>, formando rankings 
              precisos para avaliar o real nível dos jogadores e times.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                to="/rankings/xtreinos" 
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
              >
                Ver Classificação Atual <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                to="/rankings/geral" 
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium bg-[#1a1a24] text-[#f0f0f5] border border-[#2a2a3a] hover:bg-[#2a2a3a] transition-all"
              >
                Explorar Rankings
              </Link>
            </div>
          </div>
        </div>

        {/* Como Funciona */}
        <div className="mb-12">
          <h2 className="text-2xl font-extrabold text-[#f0f0f5] mb-6 flex items-center gap-2">
            <Medal className="w-6 h-6 text-emerald-400" /> Como Funciona a Pontuação?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((feat) => (
              <div key={feat.title} className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-5 group hover:border-emerald-500/30 transition-all">
                <div className="mb-3 p-2 w-fit rounded-lg bg-[#1a1a24] group-hover:bg-emerald-500/10 transition-colors">
                  {feat.icon}
                </div>
                <h3 className="text-sm font-bold text-[#f0f0f5] mb-1">{feat.title}</h3>
                <p className="text-xs text-[#8a8a9e] leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Acesso Rápido */}
        <div className="bg-[#1a1a24] rounded-2xl border border-[#2a2a3a] p-6">
          <h3 className="text-lg font-bold text-[#f0f0f5] mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" /> Acesso Rápido aos Rankings
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {QUICK_LINKS.map((link) => (
              <Link 
                key={link.to} 
                to={link.to} 
                className="flex items-center gap-3 p-4 bg-[#12121a] border border-[#2a2a3a] rounded-xl hover:border-emerald-500/30 hover:bg-[#12121a]/80 transition-all group"
              >
                <div className="text-[#5a5a6e] group-hover:text-emerald-400 transition-colors">{link.icon}</div>
                <span className="text-sm font-medium text-[#8a8a9e] group-hover:text-[#f0f0f5] transition-colors">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}