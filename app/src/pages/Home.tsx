import { Link } from "react-router";
import { Trophy, Dumbbell, Users, UserCircle, TrendingUp, Calendar, ChevronRight } from "lucide-react";
import { trpc } from "@/providers/trpc";
import MainLayout from "@/layout/MainLayout";

export default function Home() {
  const { data: championships } = trpc.championships.list.useQuery({ status: "ativo" });
  const { data: xtreinosList } = trpc.xtreinos.list.useQuery({ status: "aberto" });
  const { data: teamsList } = trpc.teams.list.useQuery();
  const { data: playersList } = trpc.players.list.useQuery();
  const { data: teamRankings } = trpc.rankings.teams.useQuery({ limit: 5 });
  const { data: playerRankings } = trpc.rankings.players.useQuery({ limit: 5 });
  const { data: settings } = trpc.settings.get.useQuery();

  const stats = [
    { label: "Equipes", value: teamsList?.length ?? 0, icon: Users },
    { label: "Jogadores", value: playersList?.length ?? 0, icon: UserCircle },
    { label: "Campeonatos Ativos", value: championships?.length ?? 0, icon: Trophy },
    { label: "XTreinos", value: xtreinosList?.length ?? 0, icon: Dumbbell },
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-900/20 via-transparent to-[#0a0a0f]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,59,59,0.08)_0%,_transparent_70%)]" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-white via-white to-red-400 bg-clip-text text-transparent">
            {settings?.orgName ?? "Devils Mobile League"}
          </h1>
          <p className="text-lg sm:text-xl text-[#8a8a9e] mb-8">
            Sistema de XTreinos, Scrims e Campeonatos Mobile
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/campeonatos"
              className="px-8 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-all duration-150 hover:scale-[1.02]"
            >
              Ver Campeonatos
            </Link>
            <Link
              to="/xtreinos"
              className="px-8 py-3 rounded-xl border border-[#3a3a4e] text-[#f0f0f5] font-semibold hover:border-red-500/50 hover:text-red-400 transition-all duration-150"
            >
              Ver XTreinos
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-[#2a2a3a] bg-[#12121a]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="bg-[#1a1a24] rounded-xl p-5 border border-[#2a2a3a] hover:border-[#3a3a4e] transition-all"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-red-400" />
                    </div>
                    <span className="text-[#8a8a9e] text-sm">{stat.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-[#f0f0f5]">{stat.value}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Active Events */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-8 bg-red-500 rounded-full" />
          <h2 className="text-2xl font-bold text-[#f0f0f5]">Eventos Ativos</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Championships */}
          {championships?.slice(0, 2).map((champ) => (
            <div
              key={champ.id}
              className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6 hover:border-[#3a3a4e] hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <Trophy className="w-6 h-6 text-red-400" />
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400">
                  Ativo
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#f0f0f5] mb-2">{champ.name}</h3>
              <p className="text-sm text-[#8a8a9e] mb-1">Modo: {champ.modality?.toUpperCase()}</p>
              <p className="text-sm text-[#8a8a9e] mb-4">
                {champ.registeredTeams}/{champ.maxTeams} equipes
              </p>
              <div className="w-full bg-[#1a1a24] rounded-full h-2 mb-4">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all"
                  style={{ width: `${(champ.registeredTeams / champ.maxTeams) * 100}%` }}
                />
              </div>
              <Link
                to={`/campeonatos`}
                className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300 font-medium"
              >
                Ver detalhes <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ))}

          {/* XTreinos */}
          {xtreinosList?.slice(0, 1).map((xt) => (
            <div
              key={xt.id}
              className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6 hover:border-[#3a3a4e] hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <Dumbbell className="w-6 h-6 text-red-400" />
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400">
                  Aberto
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#f0f0f5] mb-2">{xt.name}</h3>
              <div className="flex items-center gap-2 text-sm text-[#8a8a9e] mb-1">
                <Calendar className="w-4 h-4" />
                {xt.date}
              </div>
              <p className="text-sm text-[#8a8a9e] mb-4">Modo: {xt.modality?.toUpperCase()}</p>
              <Link
                to={`/xtreinos`}
                className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300 font-medium"
              >
                Ver detalhes <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Rankings Preview */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-8 pb-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-8 bg-red-500 rounded-full" />
          <h2 className="text-2xl font-bold text-[#f0f0f5]">Rankings</h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Team Rankings */}
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-red-400" />
              <h3 className="font-bold text-[#f0f0f5]">Top Equipes</h3>
            </div>
            <div className="divide-y divide-[#2a2a3a]">
              {teamRankings?.map((r, i) => (
                <div
                  key={r.id}
                  className="flex items-center gap-4 px-6 py-3 hover:bg-[#1a1a24] transition-colors"
                >
                  <span className={`w-8 text-center font-bold ${
                    i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-amber-600" : "text-[#5a5a6e]"
                  }`}>
                    {i + 1}
                  </span>
                  <span className="flex-1 text-[#f0f0f5] font-medium text-sm">{r.entityName}</span>
                  <span className="text-[#8a8a9e] text-sm">{r.points} pts</span>
                  <span className="text-[#5a5a6e] text-xs">{r.wins}V</span>
                </div>
              ))}
            </div>
          </div>

          {/* Player Rankings */}
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center gap-2">
              <UserCircle className="w-5 h-5 text-red-400" />
              <h3 className="font-bold text-[#f0f0f5]">Top Jogadores</h3>
            </div>
            <div className="divide-y divide-[#2a2a3a]">
              {playerRankings?.map((r, i) => (
                <div
                  key={r.id}
                  className="flex items-center gap-4 px-6 py-3 hover:bg-[#1a1a24] transition-colors"
                >
                  <span className={`w-8 text-center font-bold ${
                    i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-amber-600" : "text-[#5a5a6e]"
                  }`}>
                    {i + 1}
                  </span>
                  <span className="flex-1 text-[#f0f0f5] font-medium text-sm">{r.entityName}</span>
                  <span className="text-[#8a8a9e] text-sm">{r.points} pts</span>
                  <span className="text-[#5a5a6e] text-xs">{r.kills}K</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
