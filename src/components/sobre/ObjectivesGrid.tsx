import { Target, ShieldCheck, Rocket, Award, UsersRound, Gamepad2 } from "lucide-react";

const objectives = [
  { text: "Ser a principal referência de xtreinos mobile do cenário", icon: Target },
  { text: "Criar um ambiente justo e competitivo para todas as equipes", icon: ShieldCheck },
  { text: "Desenvolver talentos e ajudar jogadores a evoluírem", icon: Rocket },
  { text: "Profissionalizar a organização de eventos mobile", icon: Award },
  { text: "Construir uma comunidade forte e unida", icon: UsersRound },
  { text: "Expandir para novos jogos e modalidades", icon: Gamepad2 },
];

export default function ObjectivesGrid() {
  return (
    <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-16">
      <div className="flex items-center gap-3 mb-8 animate-fade-up">
        <div className="w-1 h-8 bg-emerald-500 rounded-full" />
        <h2 className="text-2xl font-bold text-[#f0f0f5]">Nossos Objetivos</h2>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {objectives.map((goal, idx) => {
          const Icon = goal.icon;
          return (
            <div key={idx} className={`animate-fade-up delay-${(idx % 3 + 1) * 100} group relative bg-[#12121a] rounded-xl border border-[#2a2a3a] p-5 hover:border-emerald-500/40 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] overflow-hidden flex items-start gap-4`}>
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent skew-x-12 z-0 pointer-events-none" />
              <div className="relative z-10 w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                <Icon className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="relative z-10 text-[#8a8a9e] text-sm leading-relaxed pt-2 group-hover:text-[#f0f0f5] transition-colors">{goal.text}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}