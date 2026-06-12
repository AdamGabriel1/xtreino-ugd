import { useState } from "react";
import {
  Dumbbell,
  Trophy,
  BarChart3,
  Users,
  CalendarDays,
  Crown,
  Medal,
  Star,
  Target,
  Clock,
  ChevronRight,
  Loader2,
  RefreshCw,
  Zap,
  Eye,
  TrendingUp,
  UserCircle,
  ArrowUpRight,
  BarChart3 as BarChartIcon,
  Swords,
  Calendar,
  Flame,
  Radio,
  AlertCircle,
  Timer,
  type LucideProps,
} from "lucide-react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import MainLayout from "@/layout/MainLayout";
import type { ForwardRefExoticComponent, RefAttributes } from "react";

// ============================================================
// TIPOS
// ============================================================
type TabKey = "xtreinos" | "geral" | "mensal" | "jogadores";
type RankCategory = "xtreino" | "campeonato" | "scrim";

interface TabConfig {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
  description: string;
}

type LucideIcon = ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;

// ============================================================
// CONFIGURAÇÃO DAS ABAS
// ============================================================
const TABS: TabConfig[] = [
  {
    key: "xtreinos",
    label: "X-Treinos",
    icon: <Dumbbell className="w-4 h-4" />,
    description: "Classificação completa dos x-treinos",
  },
  {
    key: "geral",
    label: "Ranking Geral",
    icon: <Trophy className="w-4 h-4" />,
    description: "Ranking acumulado de todas as edições",
  },
  {
    key: "mensal",
    label: "Ranking Mensal",
    icon: <CalendarDays className="w-4 h-4" />,
    description: "Ranking por mês",
  },
  {
    key: "jogadores",
    label: "Jogadores",
    icon: <Users className="w-4 h-4" />,
    description: "Estatísticas individuais",
  },
];

const rankTabs: { key: RankCategory; label: string; icon: LucideIcon }[] = [
  { key: "xtreino", label: "XTreinos", icon: Dumbbell },
  { key: "campeonato", label: "Campeonatos", icon: Trophy },
  { key: "scrim", label: "Scrims", icon: Swords },
];

// ============================================================
// COMPONENTES DE UI REUTILIZÁVEIS (mesmo estilo da Home)
// ============================================================

const SectionTitle = ({ title, icon: Icon, rightContent }: { title: string; icon?: LucideIcon; rightContent?: React.ReactNode }) => (
  <div className="flex items-center justify-between mb-8">
    <div className="flex items-center gap-3">
      <div className="w-1 h-8 bg-emerald-500 rounded-full" />
      {Icon && <Icon className="w-5 h-5 text-emerald-400" />}
      <h2 className="text-2xl font-bold text-[#f0f0f5]">{title}</h2>
    </div>
    {rightContent}
  </div>
);

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
          <BarChartIcon className="w-8 h-8 text-[#3a3a4e]" />
        </div>
        <p className="text-[#5a5a6e] text-sm mb-2">Sem dados de ranking para este modo</p>
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

// ============================================================
// PLACEHOLDERS PARA ABAS FUTURAS
// ============================================================

function RankingMensalTab() {
  return (
    <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-12 text-center">
      <CalendarDays className="w-16 h-16 text-[#3a3a4e] mx-auto mb-4" />
      <h3 className="text-xl font-bold text-[#f0f0f5] mb-2">Ranking Mensal</h3>
      <p className="text-[#5a5a6e] max-w-md mx-auto">
        Em breve: Ranking consolidado por mês com destaque para o time do mês,
        evolução de posições e comparativos entre meses.
      </p>
    </div>
  );
}

// ============================================================
// ABAS DE CONTEÚDO
// ============================================================

function XTreinosTab() {
  const [rankType, setRankType] = useState<RankCategory>("xtreino");

  const {
    data: teamRankings,
    isLoading: isLoadingTeams,
    isError: isErrorTeams,
  } = trpc.rankings.teams.useQuery({ limit: 50, rankType });

  const {
    data: playerRankings,
    isLoading: isLoadingPlayers,
    isError: isErrorPlayers,
  } = trpc.rankings.players.useQuery({ limit: 50, rankType });

  const { data: allXtreinos } = trpc.xtreinos.list.useQuery({});

  const xtreinoStats = {
    total: allXtreinos?.length ?? 0,
    abertos: allXtreinos?.filter((x) => x.status === "aberto" || !x.status).length ?? 0,
    emAndamento: allXtreinos?.filter((x) => x.status === "em_andamento").length ?? 0,
    fechados: allXtreinos?.filter((x) => x.status === "fechado").length ?? 0,
  };

  return (
    <div className="space-y-8">
      {/* Stats de XTreinos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total XTreinos" value={xtreinoStats.total} icon={Dumbbell} trend={12} />
        <StatCard label="Abertos" value={xtreinoStats.abertos} icon={Radio} />
        <StatCard label="Em Andamento" value={xtreinoStats.emAndamento} icon={Timer} />
        <StatCard label="Fechados" value={xtreinoStats.fechados} icon={Clock} />
      </div>

      {/* Rankings */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="font-bold text-[#f0f0f5]">Top Equipes — XTreinos</h3>
            </div>
            <div className="flex gap-2">
              {rankTabs.map((tab) => (
                <RankTab key={tab.key} active={rankType === tab.key} onClick={() => setRankType(tab.key)} label={tab.label} icon={tab.icon} />
              ))}
            </div>
          </div>
          <RankList rankings={teamRankings} type="team" isLoading={isLoadingTeams} isError={isErrorTeams} />
        </div>

        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <UserCircle className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="font-bold text-[#f0f0f5]">Top Jogadores — XTreinos</h3>
            </div>
            <div className="flex gap-2">
              {rankTabs.map((tab) => (
                <RankTab key={tab.key} active={rankType === tab.key} onClick={() => setRankType(tab.key)} label={tab.label} icon={tab.icon} />
              ))}
            </div>
          </div>
          <RankList rankings={playerRankings} type="player" isLoading={isLoadingPlayers} isError={isErrorPlayers} />
        </div>
      </div>
    </div>
  );
}

function RankingGeralTab() {
  const [teamRankType, setTeamRankType] = useState<RankCategory>("xtreino");
  const [playerRankType, setPlayerRankType] = useState<RankCategory>("xtreino");

  const utils = trpc.useUtils();
  const recalculateMutation = trpc.rankings.recalculate.useMutation({
    onSuccess: () => {
      utils.rankings.teams.invalidate();
      utils.rankings.players.invalidate();
    },
  });

  const {
    data: allTeamRankings,
    isLoading: isLoadingTeamRankings,
    isError: isErrorTeamRankings,
  } = trpc.rankings.teams.useQuery({ limit: 50, rankType: teamRankType });

  const {
    data: allPlayerRankings,
    isLoading: isLoadingPlayerRankings,
    isError: isErrorPlayerRankings,
  } = trpc.rankings.players.useQuery({ limit: 50, rankType: playerRankType });

  const { data: teamsList } = trpc.teams.list.useQuery();
  const { data: playersList } = trpc.players.list.useQuery();
  const { data: allXtreinos } = trpc.xtreinos.list.useQuery({});
  const { data: allChampionships } = trpc.championships.list.useQuery({});
  const { data: allScrims } = trpc.scrims.list.useQuery();

  const stats = [
    { label: "Equipes", value: teamsList?.length ?? 0, icon: Users, trend: 12 },
    { label: "Jogadores", value: playersList?.length ?? 0, icon: UserCircle, trend: 8 },
    { label: "XTreinos", value: allXtreinos?.length ?? 0, icon: Dumbbell, trend: 25 },
    { label: "Campeonatos", value: allChampionships?.length ?? 0, icon: Trophy, trend: 15 },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Gerais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} trend={stat.trend} />
        ))}
      </div>

      {/* Top 3 Destaque */}
      <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#2a2a3a]">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-[#f0f0f5]">Top Jogadores em Destaque</h3>
          </div>
        </div>
        <div className="p-4 grid md:grid-cols-3 gap-4">
          {allPlayerRankings?.slice(0, 3).map((player, idx) => (
            <FeaturedPlayerCard key={player.id} player={player} rank={idx + 1} />
          )) || (
            <div className="md:col-span-3 text-center py-8 text-[#5a5a6e] text-sm">
              <Medal className="w-8 h-8 mx-auto mb-2 text-[#3a3a4e]" />
              Nenhum jogador no ranking ainda
            </div>
          )}
        </div>
      </div>

      {/* Rankings Completos */}
      <div className="flex items-center justify-between">
        <SectionTitle title="Rankings Completos" icon={BarChartIcon} />
        <div className="flex items-center gap-3">
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
                <RankTab key={tab.key} active={teamRankType === tab.key} onClick={() => setTeamRankType(tab.key)} label={tab.label} icon={tab.icon} />
              ))}
            </div>
          </div>
          <RankList rankings={allTeamRankings} type="team" isLoading={isLoadingTeamRankings} isError={isErrorTeamRankings} />
        </div>

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
                <RankTab key={tab.key} active={playerRankType === tab.key} onClick={() => setPlayerRankType(tab.key)} label={tab.label} icon={tab.icon} />
              ))}
            </div>
          </div>
          <RankList rankings={allPlayerRankings} type="player" isLoading={isLoadingPlayerRankings} isError={isErrorPlayerRankings} />
        </div>
      </div>
    </div>
  );
}

function JogadoresTab() {
  const [rankType, setRankType] = useState<RankCategory>("xtreino");

  const {
    data: playerRankings,
    isLoading,
    isError,
  } = trpc.rankings.players.useQuery({ limit: 100, rankType });

  const { data: playersList } = trpc.players.list.useQuery();

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Jogadores" value={playersList?.length ?? 0} icon={Users} trend={8} />
        <StatCard label="Em Rankings" value={playerRankings?.length ?? 0} icon={Trophy} />
        <StatCard label="Top Pontuador" value={playerRankings?.[0]?.points ?? 0} icon={Target} />
        <StatCard label="Média de Pontos" value={playerRankings?.length ? Math.round(playerRankings.reduce((a, b) => a + b.points, 0) / playerRankings.length) : 0} icon={BarChartIcon} />
      </div>

      {/* Top 3 */}
      <div className="grid md:grid-cols-3 gap-4">
        {playerRankings?.slice(0, 3).map((player, idx) => (
          <FeaturedPlayerCard key={player.id} player={player} rank={idx + 1} />
        ))}
      </div>

      {/* Lista Completa */}
      <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <UserCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="font-bold text-[#f0f0f5]">Todos os Jogadores</h3>
          </div>
          <div className="flex gap-2">
            {rankTabs.map((tab) => (
              <RankTab key={tab.key} active={rankType === tab.key} onClick={() => setRankType(tab.key)} label={tab.label} icon={tab.icon} />
            ))}
          </div>
        </div>
        <RankList rankings={playerRankings} type="player" isLoading={isLoading} isError={isError} />
      </div>
    </div>
  );
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function Rankings() {
  const [activeTab, setActiveTab] = useState<TabKey>("xtreinos");
  const activeTabConfig = TABS.find((t) => t.key === activeTab)!;

  return (
    <MainLayout>
      <div className="w-full bg-[#0a0a0f]">
        {/* Header — estilo Home */}
        <section className="w-full bg-[#0a0a0f] border-b border-[#2a2a3a]">
          <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-12">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-[#f0f0f5]">
                  Rankings
                </h1>
              </div>
            </div>
            <p className="text-[#8a8a9e] mt-2 max-w-xl">
              {activeTabConfig.description}
            </p>
          </div>
        </section>

        {/* Tabs Navigation — estilo Home */}
        <section className="max-w-[1400px] mx-auto px-4 lg:px-8 pt-6">
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-1 mb-6">
            <div className="flex flex-wrap gap-1">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                    ${
                      activeTab === tab.key
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "text-[#8a8a9e] hover:text-[#f0f0f5] hover:bg-[#1a1a24]"
                    }
                  `}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Tab Content */}
        <section className="max-w-[1400px] mx-auto px-4 lg:px-8 pb-16">
          {activeTab === "xtreinos" && <XTreinosTab />}
          {activeTab === "geral" && <RankingGeralTab />}
          {activeTab === "mensal" && <RankingMensalTab />}
          {activeTab === "jogadores" && <JogadoresTab />}
        </section>
      </div>
    </MainLayout>
  );
}