import { Link } from "react-router";
import { Crown, Clock, Zap, Trophy, Swords, Dumbbell, Calendar, Medal, Activity, TrendingUp, Users, ChevronRight } from "lucide-react";
import FeaturedPlayerCard from "./FeaturedPlayerCard";
import type { LucideIcon } from "@/types/home";

export default function Highlights({
  topPlayers,
  upcomingEvents,
  recentActivities,
  fallbackPlayers, // AGORA É OPCIONAL
}: {
  topPlayers: Array<{ name: string; entityName: string; points: number; kills: number; wins: number }>;
  fallbackPlayers?: Array<{ id: number; entityName: string; points: number; kills?: number; wins?: number }>;
  upcomingEvents: Array<{ id: number; name: string; date: string; type: string; modality: string }>;
  recentActivities: Array<{ id: number; text: string; time: string; type: string }>;
}) {
  const typeIcons: Record<string, LucideIcon> = { match: Swords, result: Trophy, registration: Users, ranking: TrendingUp };

  return (
    <section className="max-w-[1400px] mx-auto px-4 lg:px-8 pb-14">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-8 bg-emerald-500 rounded-full" />
        <h2 className="text-2xl font-bold text-[#f0f0f5]">Destaques</h2>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden h-full">
            <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center gap-2">
              <Crown className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-[#f0f0f5]">Top Jogadores — XTreinos</h3>
            </div>
            <div className="p-4 space-y-3">
              {topPlayers.length > 0 ? (
                topPlayers.map((player, idx) => <FeaturedPlayerCard key={player.name} player={player} rank={idx + 1} />)
              ) : fallbackPlayers && fallbackPlayers.length > 0 ? (
                fallbackPlayers.slice(0, 3).map((player, idx) => <FeaturedPlayerCard key={player.id} player={player} rank={idx + 1} />)
              ) : (
                <div className="text-center py-10 text-[#5a5a6e] text-sm">
                  <Medal className="w-8 h-8 mx-auto mb-3 text-[#3a3a4e]" />
                  Nenhum jogador no ranking ainda
                </div>
              )}
            </div>
            <div className="px-6 py-3 border-t border-[#2a2a3a]">
              <Link to="/rankings" className="flex items-center justify-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 font-medium group/link">Ver ranking completo <ChevronRight className="w-4 h-4 group-hover/link:translate-x-0.5 transition-transform" /></Link>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-[#f0f0f5]">Próximos Eventos</h3>
            </div>
            {upcomingEvents.length > 0 ? (
              <div className="divide-y divide-[#2a2a3a] max-h-[200px] overflow-y-auto custom-scrollbar">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center gap-4 px-6 py-3 hover:bg-[#1a1a24]/80 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                      {event.type === "championship" ? <Trophy className="w-5 h-5 text-amber-400" /> : event.type === "scrim" ? <Swords className="w-5 h-5 text-blue-400" /> : <Dumbbell className="w-5 h-5 text-emerald-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#f0f0f5] text-sm font-medium truncate">{event.name}</p>
                      <p className="text-[#5a5a6e] text-xs">{event.modality?.toUpperCase()}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-emerald-400 text-xs font-semibold">{event.date}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded mt-1 inline-block ${
                        event.type === "championship" ? "bg-amber-500/10 text-amber-400" : event.type === "scrim" ? "bg-blue-500/10 text-blue-400" : "bg-emerald-500/10 text-emerald-400"
                      }`}>
                        {event.type === "championship" ? "Camp." : event.type === "scrim" ? "Scrim" : "XTreino"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-8 text-center"><Calendar className="w-8 h-8 mx-auto mb-2 text-[#3a3a4e]" /><p className="text-[#5a5a6e] text-sm">Nenhum evento próximo</p></div>
            )}
          </div>

          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden flex-1">
            <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-[#f0f0f5]">Atividade Recente</h3>
            </div>
            {recentActivities.length > 0 ? (
              <div className="p-4 space-y-0">
                {recentActivities.map((activity, idx) => {
                  const Icon = typeIcons[activity.type] || Activity;
                  const isLast = idx === recentActivities.length - 1;
                  return (
                    <div key={activity.id} className="flex gap-3 group">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/20 transition-colors"><Icon className="w-4 h-4 text-emerald-400" /></div>
                        {!isLast && <div className="w-px flex-1 bg-[#2a2a3a] my-1" />}
                      </div>
                      <div className={`flex-1 min-w-0 ${!isLast ? "pb-4" : ""}`}>
                        <p className="text-[#f0f0f5] text-sm leading-relaxed">{activity.text}</p>
                        <p className="text-[#5a5a6e] text-xs mt-0.5">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="px-6 py-8 text-center"><Activity className="w-8 h-8 mx-auto mb-2 text-[#3a3a4e]" /><p className="text-[#5a5a6e] text-sm">Nenhuma atividade recente</p></div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}