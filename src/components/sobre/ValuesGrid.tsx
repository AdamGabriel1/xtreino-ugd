import { Heart, ShieldCheck, UsersRound, Rocket, Eye, Flame } from "lucide-react";

const values = [
  { icon: ShieldCheck, title: "Transparência", description: "Todos os resultados e decisões são públicos e acessíveis." },
  { icon: Flame, title: "Competitividade", description: "Buscamos sempre o nível mais alto de competição." },
  { icon: UsersRound, title: "Comunidade", description: "Construímos um ambiente acolhedor para todos." },
  { icon: Rocket, title: "Inovação", description: "Sempre buscando melhorar nossas ferramentas e processos." },
  { icon: Eye, title: "Profissionalismo", description: "Organização séria e comprometida com o cenário." },
  { icon: Heart, title: "Paixão", description: "Amamos o que fazemos e isso se reflete em tudo." },
];

export default function ValuesGrid() {
  return (
    <section className="border-y border-[#2a2a3a] bg-[#0d0d14]/80 backdrop-blur-sm">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-16">
        <div className="text-center mb-10 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
            <Heart className="w-4 h-4" />
            O que nos move
          </div>
          <h2 className="text-2xl font-bold text-[#f0f0f5]">Nossos Valores</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {values.map((value, idx) => {
            const Icon = value.icon;
            return (
              <div key={value.title} className={`animate-fade-up delay-${(idx % 3 + 1) * 100} group relative bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6 hover:border-emerald-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] overflow-hidden`}>
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent skew-x-12 z-0 pointer-events-none" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all duration-300">
                    <Icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-[#f0f0f5] font-bold text-base mb-2 group-hover:text-emerald-400 transition-colors">{value.title}</h3>
                  <p className="text-[#5a5a6e] text-sm leading-relaxed">{value.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}