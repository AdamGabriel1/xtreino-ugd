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
import { useState, useMemo } from "react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";
import {
  useXtreinoCalculations,
} from "@/hooks/useXtreinoCalculations";

type RankCategory = "xtreino" | "campeonato" | "scrim";

// ==================== TIPOS INFERIDOS DO BACKEND ====================

type ChampionshipItem = {
  id: number;
  name: string;
  modality: string;
  format: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  rules: string | null;
  prizePool: string | null;
  maxTeams: number;
  registeredTeams: number;
  bracketData: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type ScrimItem = {
  id: number;
  name: string;
  team1Id: number | null;
  team2Id: number | null;
  team1Name: string | null;
  team2Name: string | null;
  team1Tag: string | null;
  team2Tag: string | null;
  date: string | null;
  time: string | null;
  modality: string | null;
  status: string | null;
  result: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type LucideIcon = ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;

interface StatusConfig {
  bg: string;
  text: string;
  border: string;
  label: string;
  icon: LucideIcon;
}

// ==================== COMPONENTES DE UI ====================

const StatusBadge = ({ status, type }: { status: string; type: "champ" | "xtreino" | "scrim" }) => {
  const champConfigs: Record<string, StatusConfig> = {
    ativo: { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30", label: "Ativo", icon: Radio },
    inscricoes: { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30", label: "Inscrições", icon: AlertCircle },
    encerrado: { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30", label: "Encerrado", icon: Clock },
  };

  const xtreinoConfigs: Record<string, StatusConfig> = {
    aberto: { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30", label: "Aberto", icon: Radio },
    em_andamento: { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30", label: "Em Andamento", icon: Timer },
    fechado: { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30", label: "Fechado", icon: Clock },
  };

  const scrimConfigs: Record<string, StatusConfig> = {
    agendado: { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/30", label: "Agendado", icon: Calendar },
    em_andamento: { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30", label: "Em Andamento", icon: Timer },
    finalizado: { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30", label: "Finalizado", icon: Clock },
  };

  let config: StatusConfig;
  if (type === "champ") {
    config = champConfigs[status] || champConfigs.ativo;
  } else if (type === "xtreino") {
    config = xtreinoConfigs[status] || xtreinoConfigs.aberto;
  } else {
    config = scrimConfigs[status] || scrimConfigs.agendado;
  }

  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

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

// ==================== PÁGINA PRINCIPAL ====================

export default function Home() {
  const [teamRankType, setTeamRankType] = useState<RankCategory>("xtreino");
  const [playerRankType, setPlayerRankType] = useState<RankCategory>("xtreino");

  // Queries existentes
  const { data: championships } = trpc.championships.list.useQuery({
    status: "ativo",
  });
  const { data: xtreinosList } = trpc.xtreinos.list.useQuery({
    status: "aberto",
  });
  const { data: teamsList } = trpc.teams.list.useQuery();
  const { data: playersList } = trpc.players.list.useQuery();
  const { data: settings } = trpc.settings.get.useQuery();

  // NOVO: Busca TODOS os dados para estatísticas e eventos
  const { data: allXtreinos } = trpc.xtreinos.list.useQuery({});
  const { data: allChampionships } = trpc.championships.list.useQuery({});
  const { data: allScrims } = trpc.scrims.list.useQuery();

  // NOVO: Busca dados reais de resultados dos xtreinos para estatísticas detalhadas
  const { data: allResults } = trpc.xtreinos.listResults.useQuery();
  const { data: allPlayerStats } = trpc.xtreinos.listPlayerStats.useQuery();

  // Usa o hook de cálculos para obter estatísticas reais dos xtreinos
  const { teamRanking, teamPlayersGrouped } = useXtreinoCalculations({
    results: allResults ?? [],
    playerStats: allPlayerStats ?? [],
  });

  // Rankings
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

  // ============ ESTATÍSTICAS DETALHADAS (DADOS REAIS DOS XTREINOS) ============

  // Contagem de XTreinos por status
  const xtreinoStats = {
    total: allXtreinos?.length ?? 0,
    abertos: allXtreinos?.filter((x) => x.status === "aberto" || !x.status).length ?? 0,
    emAndamento: allXtreinos?.filter((x) => x.status === "em_andamento").length ?? 0,
    fechados: allXtreinos?.filter((x) => x.status === "fechado").length ?? 0,
  };

  // Contagem de Campeonatos por status
  const championshipStats = {
    total: allChampionships?.length ?? 0,
    ativos: allChampionships?.filter((c) => c.status === "ativo" || !c.status).length ?? 0,
    inscricoes: allChampionships?.filter((c) => c.status === "inscricoes").length ?? 0,
    encerrados: allChampionships?.filter((c) => c.status === "encerrado").length ?? 0,
  };

  // Contagem de Scrims
  const scrimStats = {
    total: allScrims?.length ?? 0,
    agendados: allScrims?.filter((s) => s.status === "agendado" || !s.status).length ?? 0,
    emAndamento: allScrims?.filter((s) => s.status === "em_andamento").length ?? 0,
    finalizados: allScrims?.filter((s) => s.status === "finalizado").length ?? 0,
  };

  // Estatísticas REAIS dos xtreinos (baseadas nos resultados)
  const xtreinoRealStats = useMemo(() => {
    if (!teamRanking || teamRanking.length === 0) {
      return {
        totalTeams: 0,
        totalKills: 0,
        totalPosPoints: 0,
        totalPoints: 0,
        totalXtreinos: 0,
        topTeams: [] as typeof teamRanking,
      };
    }

    const totalKills = teamRanking.reduce((acc, t) => acc + t.totalKills, 0);
    const totalPosPoints = teamRanking.reduce((acc, t) => acc + t.totalPosPoints, 0);
    const totalPoints = teamRanking.reduce((acc, t) => acc + t.totalPoints, 0);
    const totalXtreinos = teamRanking.reduce((acc, t) => acc + t.xtreinosPlayed, 0);

    return {
      totalTeams: teamRanking.length,
      totalKills,
      totalPosPoints,
      totalPoints,
      totalXtreinos,
      topTeams: teamRanking.slice(0, 3),
    };
  }, [teamRanking]);

  // Próximos eventos = xtreinos + campeonatos + scrims ordenados por data
  const upcomingEvents = [
    ...(allXtreinos?.map((x) => ({
      id: x.id,
      name: x.name,
      date: x.date || "Data não definida",
      type: "xtreino" as const,
      modality: x.modality,
      status: x.status || "aberto",
    })) || []),
    ...(allChampionships?.map((c) => ({
      id: c.id + 10000,
      name: c.name,
      date: c.startDate || "Data não definida",
      type: "championship" as const,
      modality: c.modality,
      status: c.status || "ativo",
    })) || []),
    ...(allScrims?.map((s) => ({
      id: s.id + 20000,
      name: s.name,
      date: s.date || "Data não definida",
      type: "scrim" as const,
      modality: s.modality,
      status: s.status || "agendado",
    })) || []),
  ]
    .filter((e) => e.status !== "encerrado" && e.status !== "fechado" && e.status !== "finalizado")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  // Atividade recente baseada em dados reais dos xtreinos
  const recentActivities = useMemo(() => {
    const activities: Array<{
      id: number;
      text: string;
      time: string;
      type: "match" | "result" | "registration" | "ranking";
    }> = [];

    // Últimos xtreinos com resultados
    if (teamRanking && teamRanking.length > 0) {
      // Pega os xtreinos mais recentes dos top times
      const recentXtreinos = new Map<string, { date: string; teamName: string; totalPoints: number }>();

      for (const team of teamRanking.slice(0, 5)) {
        for (const xt of team.xtreinos.slice(-1)) {
          const key = `${xt.date}-${team.teamName}`;
          if (!recentXtreinos.has(key)) {
            recentXtreinos.set(key, {
              date: xt.date,
              teamName: team.teamName,
              totalPoints: xt.totalPoints,
            });
          }
        }
      }

      const sortedXtreinos = Array.from(recentXtreinos.values())
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3);

      for (const xt of sortedXtreinos) {
        activities.push({
          id: activities.length + 1,
          text: `Time "${xt.teamName}" marcou ${xt.totalPoints} pts no xtreino de ${xt.date.split("-")[2]}/${xt.date.split("-")[1]}`,
          time: xt.date,
          type: "result",
        });
      }
    }

    // Campeonatos recentes
    if (allChampionships && allChampionships.length > 0) {
      for (const champ of allChampionships.slice(-2)) {
        activities.push({
          id: activities.length + 1,
          text: `Campeonato "${champ.name}" ${champ.status === "ativo" ? "iniciado" : champ.status === "inscricoes" ? "recebendo inscrições" : "encerrado"}`,
          time: champ.startDate || "Recente",
          type: champ.status === "encerrado" ? "result" : "registration",
        });
      }
    }

    return activities.slice(0, 5);
  }, [teamRanking, allChampionships]);

  // Top jogadores dos xtreinos (baseado em kills totais)
  const topXtreinoPlayers = useMemo(() => {
    if (!teamPlayersGrouped || teamPlayersGrouped.size === 0) return [];

    const allPlayers: Array<{
      playerName: string;
      totalKills: number;
      participations: number;
      avgKills: number;
      teamName: string;
    }> = [];

    for (const [teamName, players] of teamPlayersGrouped.entries()) {
      for (const player of players) {
        allPlayers.push({
          ...player,
          teamName,
        });
      }
    }

    // Agrupa por jogador (pode ter jogado em múltiplos times)
    const playerMap = new Map<string, typeof allPlayers[0]>();
    for (const p of allPlayers) {
      const key = p.playerName.trim().toLowerCase();
      if (playerMap.has(key)) {
        const existing = playerMap.get(key)!;
        existing.totalKills += p.totalKills;
        existing.participations += p.participations;
        existing.avgKills = Number((existing.totalKills / existing.participations).toFixed(1));
      } else {
        playerMap.set(key, { ...p });
      }
    }

    return Array.from(playerMap.values())
      .sort((a, b) => b.totalKills - a.totalKills)
      .slice(0, 3)
      .map((p) => ({
        name: p.playerName,
        entityName: p.playerName,
        points: p.totalKills,
        kills: p.totalKills,
        wins: p.participations,
      }));
  }, [teamPlayersGrouped]);

  // ============ STATS CARDS ============

  const stats = [
    { label: "Equipes", value: teamsList?.length ?? 0, icon: Users, trend: 12 },
    { label: "Jogadores", value: playersList?.length ?? 0, icon: UserCircle, trend: 8 },
    {
      label: "XTreinos",
      value: xtreinoStats.total,
      icon: Dumbbell,
      trend: xtreinoStats.abertos > 0 ? 25 : 0,
    },
    {
      label: "Campeonatos",
      value: championshipStats.total,
      icon: Trophy,
      trend: championshipStats.ativos > 0 ? 15 : 0,
    },
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
            alt="Underground Banner"
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
            {settings?.orgName ?? "Underground"}
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

      {/* ============ ESTATÍSTICAS DETALHADAS ============ */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-8 bg-emerald-500 rounded-full" />
          <h2 className="text-2xl font-bold text-[#f0f0f5]">Estatísticas Detalhadas</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* XTreinos Stats - COM DADOS REAIS */}
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-[#f0f0f5]">XTreinos</h3>
                <p className="text-[#5a5a6e] text-xs">{xtreinoStats.total} eventos · {xtreinoRealStats.totalXtreinos} resultados</p>
              </div>
            </div>
            <div className="p-6 grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-400">{xtreinoStats.abertos}</p>
                <p className="text-[#5a5a6e] text-xs mt-1">Abertos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-400">{xtreinoStats.emAndamento}</p>
                <p className="text-[#5a5a6e] text-xs mt-1">Em Andamento</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-400">{xtreinoStats.fechados}</p>
                <p className="text-[#5a5a6e] text-xs mt-1">Fechados</p>
              </div>
            </div>
            {/* Stats reais dos xtreinos */}
            {xtreinoRealStats.totalTeams > 0 && (
              <div className="px-6 pb-4 pt-0 border-t border-[#2a2a3a]/50">
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-400">{xtreinoRealStats.totalKills}</p>
                    <p className="text-[#5a5a6e] text-[10px]">Kills Totais</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-yellow-400">{xtreinoRealStats.totalPoints}</p>
                    <p className="text-[#5a5a6e] text-[10px]">Pontos Totais</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Campeonatos Stats */}
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-[#f0f0f5]">Campeonatos</h3>
                <p className="text-[#5a5a6e] text-xs">{championshipStats.total} total</p>
              </div>
            </div>
            <div className="p-6 grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-400">{championshipStats.ativos}</p>
                <p className="text-[#5a5a6e] text-xs mt-1">Ativos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-400">{championshipStats.inscricoes}</p>
                <p className="text-[#5a5a6e] text-xs mt-1">Inscrições</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-400">{championshipStats.encerrados}</p>
                <p className="text-[#5a5a6e] text-xs mt-1">Encerrados</p>
              </div>
            </div>
          </div>

          {/* Scrims Stats */}
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Swords className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-[#f0f0f5]">Scrims</h3>
                <p className="text-[#5a5a6e] text-xs">{scrimStats.total} total</p>
              </div>
            </div>
            <div className="p-6 grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-400">{scrimStats.agendados}</p>
                <p className="text-[#5a5a6e] text-xs mt-1">Agendados</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-400">{scrimStats.emAndamento}</p>
                <p className="text-[#5a5a6e] text-xs mt-1">Em Andamento</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-400">{scrimStats.finalizados}</p>
                <p className="text-[#5a5a6e] text-xs mt-1">Finalizados</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Active Events */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-8 pb-12">
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

      {/* ============ DESTAQUES: PRÓXIMOS EVENTOS + ATIVIDADE RECENTE + TOP JOGADORES ============ */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-8 pb-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-8 bg-emerald-500 rounded-full" />
          <h2 className="text-2xl font-bold text-[#f0f0f5]">Destaques</h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Top 3 Jogadores - DADOS REAIS DOS XTREINOS */}
          <div className="lg:col-span-1">
            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden h-full">
              <div className="px-6 py-4 border-b border-[#2a2a3a]">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-[#f0f0f5]">Top Jogadores — XTreinos</h3>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {topXtreinoPlayers.length > 0 ? (
                  topXtreinoPlayers.map((player, idx) => (
                    <FeaturedPlayerCard key={player.name} player={player} rank={idx + 1} />
                  ))
                ) : allPlayerRankings && allPlayerRankings.length > 0 ? (
                  allPlayerRankings.slice(0, 3).map((player, idx) => (
                    <FeaturedPlayerCard key={player.id} player={player} rank={idx + 1} />
                  ))
                ) : (
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

          {/* Próximos Eventos - DADOS REAIS */}
          <div className="lg:col-span-1">
            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden h-full">
              <div className="px-6 py-4 border-b border-[#2a2a3a]">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-[#f0f0f5]">Próximos Eventos</h3>
                </div>
              </div>
              {upcomingEvents.length > 0 ? (
                <div className="divide-y divide-[#2a2a3a]">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-center gap-4 px-6 py-3 hover:bg-[#1a1a24] transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                        {event.type === "championship" ? <Trophy className="w-5 h-5 text-emerald-400" /> : event.type === "scrim" ? <Swords className="w-5 h-5 text-emerald-400" /> : <Dumbbell className="w-5 h-5 text-emerald-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#f0f0f5] text-sm font-medium truncate">{event.name}</p>
                        <p className="text-[#5a5a6e] text-xs">{event.modality?.toUpperCase()}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-emerald-400 text-xs font-semibold">{event.date}</p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded mt-1 inline-block ${
                          event.type === "championship"
                            ? "bg-amber-500/10 text-amber-400"
                            : event.type === "scrim"
                              ? "bg-blue-500/10 text-blue-400"
                              : "bg-emerald-500/10 text-emerald-400"
                        }`}>
                          {event.type === "championship" ? "Camp." : event.type === "scrim" ? "Scrim" : "XTreino"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-8 text-center">
                  <Calendar className="w-8 h-8 mx-auto mb-2 text-[#3a3a4e]" />
                  <p className="text-[#5a5a6e] text-sm">Nenhum evento próximo</p>
                </div>
              )}
            </div>
          </div>

          {/* Atividade Recente - DADOS REAIS DOS XTREINOS */}
          <div className="lg:col-span-1">
            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden h-full">
              <div className="px-6 py-4 border-b border-[#2a2a3a]">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-[#f0f0f5]">Atividade Recente</h3>
                </div>
              </div>
              {recentActivities.length > 0 ? (
                <div className="divide-y divide-[#2a2a3a]">
                  {recentActivities.map((activity) => {
                    const typeIcons: Record<string, LucideIcon> = {
                      match: Swords,
                      result: Trophy,
                      registration: Users,
                      ranking: TrendingUp,
                    };
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
              ) : (
                <div className="px-6 py-8 text-center">
                  <Activity className="w-8 h-8 mx-auto mb-2 text-[#3a3a4e]" />
                  <p className="text-[#5a5a6e] text-sm">Nenhuma atividade recente</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Rankings Preview */}
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

      {/* Call to Action */}
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