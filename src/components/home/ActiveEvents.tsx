import { Link } from "react-router";
import { Trophy, Dumbbell, Target, Users, Calendar, Flame, ChevronRight } from "lucide-react";
import StatusBadge from "./StatusBadge";

export default function ActiveEvents({
  championships,
  xtreinosList,
}: {
  championships: Array<{ id: number; name: string; modality: string; status: string; registeredTeams: number; maxTeams: number }> | undefined;
  xtreinosList: Array<{ id: number; name: string; modality: string; status: string; date: string }> | undefined;
}) {
  const totalEvents = (championships?.length ?? 0) + (xtreinosList?.length ?? 0);

  return (
    <section className="max-w-[1400px] mx-auto px-4 lg:px-8 pb-14">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-8 bg-emerald-500 rounded-full" />
        <h2 className="text-2xl font-bold text-[#f0f0f5]">Eventos Ativos</h2>
        <span className="ml-auto text-sm text-[#5a5a6e] bg-[#12121a] px-3 py-1 rounded-full border border-[#2a2a3a]">{totalEvents} eventos</span>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {championships?.slice(0, 2).map((champ) => (
          <div key={champ.id} className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6 hover:border-emerald-500/30 hover:-translate-y-1 transition-all duration-300 group hover:shadow-lg hover:shadow-emerald-500/5">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all duration-300"><Trophy className="w-6 h-6 text-emerald-400" /></div>
              <StatusBadge status={champ.status || "ativo"} type="champ" />
            </div>
            <h3 className="text-lg font-bold text-[#f0f0f5] mb-2 group-hover:text-emerald-400 transition-colors">{champ.name}</h3>
            <div className="flex items-center gap-2 text-sm text-[#8a8a9e] mb-1"><Target className="w-4 h-4" />Modo: {champ.modality?.toUpperCase()}</div>
            <div className="flex items-center gap-2 text-sm text-[#8a8a9e] mb-4"><Users className="w-4 h-4" />{champ.registeredTeams}/{champ.maxTeams} equipes</div>
            <div className="w-full bg-[#1a1a24] rounded-full h-2 mb-4 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min((champ.registeredTeams / champ.maxTeams) * 100, 100)}%` }} />
            </div>
            <Link to="/campeonatos" className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 font-medium group/link">Ver detalhes <ChevronRight className="w-4 h-4 group-hover/link:translate-x-0.5 transition-transform" /></Link>
          </div>
        ))}

        {xtreinosList?.slice(0, 1).map((xt) => (
          <div key={xt.id} className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6 hover:border-emerald-500/30 hover:-translate-y-1 transition-all duration-300 group hover:shadow-lg hover:shadow-emerald-500/5">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all duration-300"><Dumbbell className="w-6 h-6 text-emerald-400" /></div>
              <StatusBadge status={xt.status || "aberto"} type="xtreino" />
            </div>
            <h3 className="text-lg font-bold text-[#f0f0f5] mb-2 group-hover:text-emerald-400 transition-colors">{xt.name}</h3>
            <div className="flex items-center gap-2 text-sm text-[#8a8a9e] mb-1"><Calendar className="w-4 h-4" />{xt.date}</div>
            <div className="flex items-center gap-2 text-sm text-[#8a8a9e] mb-4"><Target className="w-4 h-4" />Modo: {xt.modality?.toUpperCase()}</div>
            <div className="flex gap-2 mb-4">
              <span className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20"><Flame className="w-3 h-3 inline mr-1" />Em alta</span>
            </div>
            <Link to="/xtreinos" className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 font-medium group/link">Ver detalhes <ChevronRight className="w-4 h-4 group-hover/link:translate-x-0.5 transition-transform" /></Link>
          </div>
        ))}

        {totalEvents === 0 && (
          <div className="bg-[#12121a] rounded-xl border border-dashed border-[#2a2a3a] p-6 flex flex-col items-center justify-center text-center min-h-[220px]">
            <div className="w-14 h-14 rounded-full bg-[#1a1a24] flex items-center justify-center mb-4"><Calendar className="w-7 h-7 text-[#3a3a4e]" /></div>
            <p className="text-[#5a5a6e] text-sm mb-3">Nenhum evento ativo no momento</p>
            <Link to="/campeonatos" className="text-emerald-400 text-sm font-medium hover:text-emerald-300 transition-colors">Ver todos os eventos →</Link>
          </div>
        )}
      </div>
    </section>
  );
}