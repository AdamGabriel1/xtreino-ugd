import { Link } from "react-router";
import {
  Trophy,
  Dumbbell,
  Users,
  UserCircle,
  TrendingUp,
  Calendar,
  ChevronRight,
  Swords,
  Loader2,
  RefreshCw,
  Zap,
  Target,
  Shield,
  Activity,
  Clock,
  Flame,
  Medal,
  BarChart3,
  ArrowUpRight,
  Eye,
  Crown,
  Star,
  Timer,
  Radio,
  AlertCircle,
  type LucideProps,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import MainLayout from "@/layout/MainLayout";
import { useState } from "react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";

type RankCategory = "xtreino" | "campeonato" | "scrim";

// ==================== NOVOS COMPONENTES DE UI ====================

// Tipo para o ícone do Lucide
type LucideIcon = ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;

// Tipo para config de status
interface StatusConfig {
  bg: string;
  text: string;
  border: string;
  label: string;
  icon: LucideIcon;
}

// Badge de status
const StatusBadge = ({ status, type }: { status: string; type: "champ" | "xtreino" }) => {
  const champConfigs: Record<string, StatusConfig> = {
    ativo: { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30", label: "Ativo", icon: Radio },
    inscricoes: { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30", label: "Inscrições Abertas", icon: AlertCircle },
    encerrado: { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30", label: "Encerrado", icon: Clock },
  };

  const xtreinoConfigs: Record<string, StatusConfig> = {
    aberto: { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30", label: "Aberto", icon: Radio },
    em_andamento: { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30", label: "Em Andamento", icon: Timer },
    fechado: { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30", label: "Fechado", icon: Clock },
  };

  const config = type === "champ" 
    ? (champConfigs[status] || champConfigs.ativo)
    : (xtreinoConfigs[status] || xtreinoConfigs.aberto);

  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

// Card de estatística com trend
const StatCard = ({ label, value, icon: Icon, trend }: { label: string; value: number; icon: LucideIcon; trend?: number }) => (
  <div className="bg-[#12121a] rounded-xl p-5 border border-[#2a2a3a] hover:border-emerald-500/30 transition-all duration-300 group hover:-translate-y-0.5">
    <div className="flex items-center justify-between mb-3">
      <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
        <Icon className="w-5 h-5 text-emerald-400" />
      </div>
      {trend !== undefined && (
        <span className={`text-xs font-semibold flex items-center gap-0.5 ${trend >= 0 ? "text-emerald-400" : "text-red-400"}`}>
          {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3 rotate-180" />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="text-2xl font-bold text-[#f0f0f5] mb-1">{value}</p>
    <p className="text-[#8a8a9e] text-sm">{label}</p>
  </div>
);

// Card de jogador em destaque
const FeaturedPlayerCard = ({ player, rank }: { player: { name?: string; entityName?: string; points: number; kills?: number; wins?: number }; rank: number }) => {
  const rankColors = ["text-yellow-400", "text-gray-300", "text-amber-600"];
  const rankIcons = [Crown, Medal, Star];
  const RankIcon = rankIcons[rank - 1] || Medal;

  return (
    <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-5 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-0.5 group">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-900/20 border-2 border-emerald-500/30 flex items-center justify-center">
            <UserCircle className="w-8 h-8 text-emerald-400" />
          </div>
          <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#1a1a24] border border-[#2a2a3a] flex items-center justify-center ${rankColors[rank - 1] || "text-[#5a5a6e]"}`}>
            <RankIcon className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-[#f0f0f5] font-bold text-sm truncate">{player.name || player.entityName}</h4>
          <p className="text-emerald-400 text-xs font-semibold">{player.points} pts</p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-[#5a5a6e] text-xs flex items-center gap-1">
              <Target className="w-3 h-3" /> {player.kills ?? 0}K
            </span>
            <span className="text-[#5a5a6e] text-xs flex items-center gap-1">
              <Trophy className="w-3 h-3" /> {player.wins ?? 0}V
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Seção de próximos eventos
const UpcomingEvents = ({ events }: { events: Array<{ id: number; name: string; date: string; type: string; modality?: string }> }) => {
  if (!events || events.length === 0) return null;

  return (
    <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#2a2a3a]">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-[#f0f0f5]">Próximos Eventos</h3>
        </div>
      </div>
      <div className="divide-y divide-[#2a2a3a]">
        {events.map((event) => (
          <div key={event.id} className="flex items-center gap-4 px-6 py-3 hover:bg-[#1a1a24] transition-colors">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
              {event.type === "championship" ? <Trophy className="w-5 h-5 text-emerald-400" /> : <Dumbbell className="w-5 h-5 text-emerald-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#f0f0f5] text-sm font-medium truncate">{event.name}</p>
              <p className="text-[#5a5a6e] text-xs">{event.modality?.toUpperCase()}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-emerald-400 text-xs font-semibold">{event.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Seção de atividade recente
const RecentActivity = ({ activities }: { activities: Array<{ id: number; text: string; time: string; type: string }> }) => {
  if (!activities || activities.length === 0) return null;

  const typeIcons: Record<string, LucideIcon> = {
    match: Swords,
    result: Trophy,
    registration: Users,
    ranking: TrendingUp,
  };

  return (
    <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#2a2a3a]">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-[#f0f0f5]">Atividade Recente</h3>
        </div>
      </div>
      <div className="divide-y divide-[#2a2a3a]">
        {activities.map((activity) => {
          const Icon = typeIcons[activity.type] || Activity;
          return (
            <div key={activity.id} className="flex items-start gap-3 px-6 py-3 hover:bg-[#1a1a24] transition-colors">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#f0f0f5] text-sm">{activity.text}</p>
                <p className="text-[#5a5a6e] text-xs mt-0.5">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==================== PÁGINA PRINCIPAL ====================

export default function Home() {
  const [teamRankType, setTeamRankType] = useState<RankCategory>("xtreino");
  const [playerRankType, setPlayerRankType] = useState<RankCategory>("xtreino");

  const { data: championships } = trpc.championships.list.useQuery({
    status: "ativo",
  });
  const { data: xtreinosList } = trpc.xtreinos.list.useQuery({
    status: "aberto",
  });
  const { data: teamsList } = trpc.teams.list.useQuery();
  const { data: playersList } = trpc.players.list.useQuery();
  const { data: settings } = trpc.settings.get.useQuery();

  // Busca todos os rankings
  const {
    data: allTeamRankings,
    isLoading: isLoadingTeamRankings,
    isError: isErrorTeamRankings,
  } = trpc.rankings.teams.useQuery({
    limit: 50,
    rankType: teamRankType,
  });

  const {
    data: allPlayerRankings,
    isLoading: isLoadingPlayerRankings,
    isError: isErrorPlayerRankings,
  } = trpc.rankings.players.useQuery({
    limit: 50,
    rankType: playerRankType,
  });

  const utils = trpc.useUtils();
  const recalculateMutation = trpc.rankings.recalculate.useMutation({
    onSuccess: () => {
      utils.rankings.teams.invalidate();
      utils.rankings.players.invalidate();
    },
  });

  // Dados mockados para demonstração (remover quando backend estiver pronto)
  const upcomingEvents = [
    { id: 1, name: "XTreino Semanal #7", date: "2026-06-12", type: "xtreino", modality: "squad" },
    { id: 2, name: "Campeonato de Verão", date: "2026-06-15", type: "championship", modality: "duo" },
    { id: 3, name: "Scrim Tático #3", date: "2026-06-18", type: "xtreino", modality: "squad" },
  ];

  const recentActivities = [
    { id: 1, text: "Equipe Alpha venceu o XTreino #6", time: "2h atrás", type: "result" },
    { id: 2, text: "Novo jogador registrado: ProPlayer99", time: "5h atrás", type: "registration" },
    { id: 3, text: "Resultado do Scrim #2 confirmado", time: "8h atrás", type: "match" },
    { id: 4, text: "Rankings recalculados automaticamente", time: "12h atrás", type: "ranking" },
  ];

  const stats = [
    { label: "Equipes", value: teamsList?.length ?? 0, icon: Users, trend: 12 },
    { label: "Jogadores", value: playersList?.length ?? 0, icon: UserCircle, trend: 8 },
    { label: "Campeonatos Ativos", value: championships?.length ?? 0, icon: Trophy, trend: -5 },
    { label: "XTreinos", value: xtreinosList?.length ?? 0, icon: Dumbbell, trend: 25 },
  ];

  const rankTabs: { key: RankCategory; label: string; icon: LucideIcon }[] = [
    { key: "xtreino", label: "XTreinos", icon: Dumbbell },
    { key: "campeonato", label: "Campeonatos", icon: Trophy },
    { key: "scrim", label: "Scrims", icon: Swords },
  ];

  const RankTab = ({
    active,
    onClick,
    label,
    icon: Icon,
  }: {
    active: boolean;
    onClick: () => void;
    label: string;
    icon: LucideIcon;
  }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
        active
          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          : "text-[#8a8a9e] hover:text-[#f0f0f5] hover:bg-[#1a1a24]"
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );

  const RankList = ({
    rankings,
    type,
    isLoading,
    isError,
  }: {
    rankings: Array<{
      id: number;
      entityName: string;
      points: number;
      kills?: number;
      wins?: number;
    }> | undefined;
    type: "team" | "player";
    isLoading: boolean;
    isError: boolean;
  }) => {
    if (isLoading) {
      return (
        <div className="px-6 py-8 flex items-center justify-center gap-2 text-[#5a5a6e] text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Carregando ranking...
        </div>
      );
    }

    if (isError) {
      return (
        <div className="px-6 py-8 text-center text-red-400 text-sm">
          Erro ao carregar ranking. Tente recarregar a página.
        </div>
      );
    }

    if (!rankings || rankings.length === 0) {
      return (
        <div className="px-6 py-8 text-center">
          <div className="w-16 h-16 rounded-full bg-[#1a1a24] flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-[#3a3a4e]" />
          </div>
          <p className="text-[#5a5a6e] text-sm mb-2">
            Sem dados de ranking para este modo
          </p>
          <p className="text-[#5a5a6e] text-xs">
            Adicione resultados de xtreinos, campeonatos ou scrims para gerar o ranking.
          </p>
        </div>
      );
    }

    return (
      <div className="divide-y divide-[#2a2a3a]">
        {rankings.map((r, i) => (
          <div
            key={r.id}
            className="flex items-center gap-4 px-6 py-3 hover:bg-[#1a1a24] transition-colors group"
          >
            <span
              className={`w-8 text-center font-bold flex items-center justify-center ${
                i === 0
                  ? "text-yellow-400"
                  : i === 1
                    ? "text-gray-300"
                    : i === 2
                      ? "text-amber-600"
                      : "text-[#5a5a6e]"
              }`}
            >
              {i < 3 ? <Crown className="w-4 h-4" /> : i + 1}
            </span>
            <span className="flex-1 text-[#f0f0f5] font-medium text-sm group-hover:text-emerald-400 transition-colors">
              {r.entityName}
            </span>
            <span className="text-emerald-400 text-sm font-semibold">{r.points} pts</span>
            {type === "team" && (
              <span className="text-[#5a5a6e] text-xs">{r.wins ?? 0}V</span>
            )}
            {type === "player" && (
              <span className="text-[#5a5a6e] text-xs">{r.kills ?? 0}K</span>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <MainLayout>
      {/* Banner Section */}
      <section className="w-full bg-[#0a0a0f]">
        <div className="w-full max-w-[1920px] mx-auto">
          <img
            src="/banner.jpg"
            alt="UNDERGROUND BANNER"
            className="w-full h-auto object-cover"
            style={{ aspectRatio: "2 / 1" }}
            loading="eager"
          />
        </div>
      </section>

      {/* Hero Section - TEMA VERDE */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/20 via-transparent to-[#0a0a0f]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.08)_0%,_transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(16,185,129,0.05)_0%,_transparent_50%)]" />

        {/* Partículas decorativas */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-emerald-500/20 animate-pulse" />
          <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 rounded-full bg-emerald-400/30 animate-pulse" style={{ animationDelay: "0.5s" }} />
          <div className="absolute bottom-1/3 left-1/3 w-1 h-1 rounded-full bg-emerald-300/20 animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Temporada 2026 em andamento
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-white via-emerald-100 to-emerald-400 bg-clip-text text-transparent">
            {settings?.orgName ?? "UNDERGROUND XTREINOS"}
          </h1>
          <p className="text-lg sm:text-xl text-[#8a8a9e] mb-8 max-w-2xl mx-auto">
            Sistema completo de XTreinos, Scrims e Campeonatos Mobile. 
            Gerencie equipes, acompanhe rankings e organize competições.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/campeonatos"
              className="px-8 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-all duration-150 hover:scale-[1.02] shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              Ver Campeonatos
            </Link>
            <Link
              to="/xtreinos"
              className="px-8 py-3 rounded-xl border border-[#3a3a4e] text-[#f0f0f5] font-semibold hover:border-emerald-500/50 hover:text-emerald-400 transition-all duration-150 flex items-center justify-center gap-2"
            >
              <Dumbbell className="w-4 h-4" />
              Ver XTreinos
            </Link>
            <Link
              to="/rankings"
              className="px-8 py-3 rounded-xl border border-[#3a3a4e] text-[#f0f0f5] font-semibold hover:border-emerald-500/50 hover:text-emerald-400 transition-all duration-150 flex items-center justify-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Rankings Completos
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar - COM TRENDS */}
      <section className="border-y border-[#2a2a3a] bg-[#12121a]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <StatCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                icon={stat.icon}
                trend={stat.trend}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Active Events - COM BADGES MELHORADOS */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-8 bg-emerald-500 rounded-full" />
          <h2 className="text-2xl font-bold text-[#f0f0f5]">Eventos Ativos</h2>
          <span className="ml-auto text-sm text-[#5a5a6e]">
            {((championships?.length ?? 0) + (xtreinosList?.length ?? 0))} eventos no momento
          </span>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {championships?.slice(0, 2).map((champ) => (
            <div
              key={champ.id}
              className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6 hover:border-emerald-500/30 hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                  <Trophy className="w-6 h-6 text-emerald-400" />
                </div>
                <StatusBadge status={champ.status || "ativo"} type="champ" />
              </div>
              <h3 className="text-lg font-bold text-[#f0f0f5] mb-2 group-hover:text-emerald-400 transition-colors">
                {champ.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-[#8a8a9e] mb-1">
                <Target className="w-4 h-4" />
                Modo: {champ.modality?.toUpperCase()}
              </div>
              <div className="flex items-center gap-2 text-sm text-[#8a8a9e] mb-4">
                <Users className="w-4 h-4" />
                {champ.registeredTeams}/{champ.maxTeams} equipes
              </div>
              <div className="w-full bg-[#1a1a24] rounded-full h-2 mb-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min((champ.registeredTeams / champ.maxTeams) * 100, 100)}%`,
                  }}
                />
              </div>
              <Link
                to="/campeonatos"
                className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 font-medium"
              >
                Ver detalhes <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ))}

          {xtreinosList?.slice(0, 1).map((xt) => (
            <div
              key={xt.id}
              className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6 hover:border-emerald-500/30 hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                  <Dumbbell className="w-6 h-6 text-emerald-400" />
                </div>
                <StatusBadge status={xt.status || "aberto"} type="xtreino" />
              </div>
              <h3 className="text-lg font-bold text-[#f0f0f5] mb-2 group-hover:text-emerald-400 transition-colors">
                {xt.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-[#8a8a9e] mb-1">
                <Calendar className="w-4 h-4" />
                {xt.date}
              </div>
              <div className="flex items-center gap-2 text-sm text-[#8a8a9e] mb-4">
                <Target className="w-4 h-4" />
                Modo: {xt.modality?.toUpperCase()}
              </div>
              <div className="flex gap-2 mb-4">
                <span className="px-2 py-1 rounded-md bg-[#1a1a24] text-[#5a5a6e] text-xs">
                  <Flame className="w-3 h-3 inline mr-1" />
                  Em alta
                </span>
              </div>
              <Link
                to="/xtreinos"
                className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 font-medium"
              >
                Ver detalhes <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* NOVA SEÇÃO: Grid de Destaques (Jogadores + Próximos Eventos + Atividade) */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-8 pb-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-8 bg-emerald-500 rounded-full" />
          <h2 className="text-2xl font-bold text-[#f0f0f5]">Destaques</h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Top 3 Jogadores */}
          <div className="lg:col-span-1">
            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden h-full">
              <div className="px-6 py-4 border-b border-[#2a2a3a]">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-[#f0f0f5]">Top Jogadores</h3>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {allPlayerRankings?.slice(0, 3).map((player, idx) => (
                  <FeaturedPlayerCard key={player.id} player={player} rank={idx + 1} />
                )) || (
                  <div className="text-center py-8 text-[#5a5a6e] text-sm">
                    <Medal className="w-8 h-8 mx-auto mb-2 text-[#3a3a4e]" />
                    Nenhum jogador no ranking ainda
                  </div>
                )}
              </div>
              <div className="px-6 py-3 border-t border-[#2a2a3a]">
                <Link
                  to="/rankings"
                  className="flex items-center justify-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 font-medium"
                >
                  Ver ranking completo <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Próximos Eventos */}
          <div className="lg:col-span-1">
            <UpcomingEvents events={upcomingEvents} />
          </div>

          {/* Atividade Recente */}
          <div className="lg:col-span-1">
            <RecentActivity activities={recentActivities} />
          </div>
        </div>
      </section>

      {/* Rankings Preview - TEMA VERDE */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-8 pb-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-emerald-500 rounded-full" />
            <h2 className="text-2xl font-bold text-[#f0f0f5]">Rankings</h2>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/rankings"
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-[#1a1a24] text-[#8a8a9e] border border-[#2a2a3a] hover:border-emerald-500/30 hover:text-emerald-400 transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              Ver Completo
            </Link>
            <button
              onClick={() => recalculateMutation.mutate()}
              disabled={recalculateMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all disabled:opacity-50"
            >
              {recalculateMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              {recalculateMutation.isPending ? "Recalculando..." : "Recalcular Rankings"}
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Team Rankings */}
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <h3 className="font-bold text-[#f0f0f5]">Top Equipes</h3>
              </div>
              <div className="flex gap-2">
                {rankTabs.map((tab) => (
                  <RankTab
                    key={tab.key}
                    active={teamRankType === tab.key}
                    onClick={() => setTeamRankType(tab.key)}
                    label={tab.label}
                    icon={tab.icon}
                  />
                ))}
              </div>
            </div>
            <RankList
              rankings={allTeamRankings}
              type="team"
              isLoading={isLoadingTeamRankings}
              isError={isErrorTeamRankings}
            />
          </div>

          {/* Player Rankings */}
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <UserCircle className="w-4 h-4 text-emerald-400" />
                </div>
                <h3 className="font-bold text-[#f0f0f5]">Top Jogadores</h3>
              </div>
              <div className="flex gap-2">
                {rankTabs.map((tab) => (
                  <RankTab
                    key={tab.key}
                    active={playerRankType === tab.key}
                    onClick={() => setPlayerRankType(tab.key)}
                    label={tab.label}
                    icon={tab.icon}
                  />
                ))}
              </div>
            </div>
            <RankList
              rankings={allPlayerRankings}
              type="player"
              isLoading={isLoadingPlayerRankings}
              isError={isErrorPlayerRankings}
            />
          </div>
        </div>
      </section>

      {/* NOVA SEÇÃO: Call to Action */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-8 pb-16">
        <div className="bg-gradient-to-r from-emerald-900/20 via-[#12121a] to-emerald-900/20 rounded-2xl border border-emerald-500/20 p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.1)_0%,_transparent_70%)]" />
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#f0f0f5] mb-3">
              Pronto para competir?
            </h2>
            <p className="text-[#8a8a9e] mb-8 max-w-lg mx-auto">
              Cadastre sua equipe, participe de xtreinos e campeonatos, e suba no ranking da liga.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/equipes"
                className="px-8 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-all duration-150 hover:scale-[1.02] shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4" />
                Gerenciar Equipes
              </Link>
              <Link
                to="/jogadores"
                className="px-8 py-3 rounded-xl border border-[#3a3a4e] text-[#f0f0f5] font-semibold hover:border-emerald-500/50 hover:text-emerald-400 transition-all duration-150 flex items-center justify-center gap-2"
              >
                <UserCircle className="w-4 h-4" />
                Ver Jogadores
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}