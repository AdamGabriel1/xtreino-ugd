import { Link } from "react-router";
import {
  Trophy,
  Crown,
  Star,
  Medal,
  Flame,
  Users,
  Clock,
  Calendar,
  Target,
  Zap,
  Gamepad2,
  ArrowRight,
  ChevronRight,
  type LucideProps,
} from "lucide-react";
import MainLayout from "@/layout/MainLayout";
import { useState } from "react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";

type FilterType = "todas" | "premiadas" | "comunitarias" | "especiais";
type LucideIcon = ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;

interface Sala {
  id: number;
  name: string;
  date: string;
  time: string;
  modality: string;
  type: "premiada" | "comunitaria" | "especial";
  prize?: string;
  participants: number;
  maxParticipants: number;
  host: string;
  hostTiktok?: string;
  hostInstagram?: string;
  status: "aberta" | "encerrada" | "em_andamento";
  winner?: string;
  tags: string[];
  bannerUrl?: string;
  detailPath?: string;
}

// ==================== DADOS DAS SALINHAS ====================

const salas: Sala[] = [
  // ============================================================
  // SALINHAS DO PERLOTTI — Evento Especial (14/06/2026)
  // ============================================================
  {
    id: 1,
    name: "Salinha Perlotti #1",
    date: "2026-06-14",
    time: "19:00",
    modality: "solo",
    type: "premiada",
    prize: "540 Golds (1º), 320 Golds (2º), 105 Golds (3º)",
    participants: 0,
    maxParticipants: 50,
    host: "Perlotti",
    hostTiktok: "@perlottihd",
    status: "aberta",
    tags: ["Solo", "Premiado", "Perlotti", "Live"],
    detailPath: "/salinhas/perlotti",
  },
  {
    id: 2,
    name: "Salinha Perlotti #2",
    date: "2026-06-14",
    time: "19:00",
    modality: "solo",
    type: "premiada",
    prize: "540 Golds (1º), 320 Golds (2º), 105 Golds (3º)",
    participants: 0,
    maxParticipants: 50,
    host: "Perlotti",
    hostTiktok: "@perlottihd",
    status: "aberta",
    tags: ["Solo", "Premiado", "Perlotti", "Live"],
    detailPath: "/salinhas/perlotti",
  },
  {
    id: 3,
    name: "Salinha Perlotti #3",
    date: "2026-06-14",
    time: "19:00",
    modality: "solo",
    type: "premiada",
    prize: "540 Golds (1º), 320 Golds (2º), 105 Golds (3º) + 1k Golds Top Licker",
    participants: 0,
    maxParticipants: 50,
    host: "Perlotti",
    hostTiktok: "@perlottihd",
    status: "aberta",
    tags: ["Solo", "Premiado", "Perlotti", "Live", "Top Licker"],
    detailPath: "/salinhas/perlotti",
  },

  // ============================================================
  // EXEMPLOS DE OUTRAS SALINHAS (descomente quando quiser usar)
  // ============================================================
  /*
  {
    id: 4,
    name: "XTreino #42 - Premiação Especial",
    date: "2026-06-12",
    time: "20:00",
    modality: "squad",
    type: "premiada",
    prize: "R$ 100,00 + Skin Exclusiva",
    participants: 18,
    maxParticipants: 20,
    host: "UGD Oficial",
    status: "aberta",
    tags: ["Squad", "Premiado"],
  },
  {
    id: 5,
    name: "Salinha da Comunidade #15",
    date: "2026-06-11",
    time: "19:30",
    modality: "duo",
    type: "comunitaria",
    participants: 12,
    maxParticipants: 16,
    host: "Comunidade UGD",
    status: "aberta",
    tags: ["Duo", "Amistoso"],
  },
  {
    id: 6,
    name: "Campeonato Interno - Etapa 1",
    date: "2026-06-10",
    time: "21:00",
    modality: "squad",
    type: "especial",
    prize: "Troféu + Destaque no Ranking",
    participants: 20,
    maxParticipants: 20,
    host: "UGD Admins",
    status: "em_andamento",
    winner: "Em disputa...",
    tags: ["Squad", "Oficial"],
  },
  {
    id: 7,
    name: "XTreino #41",
    date: "2026-06-09",
    time: "20:00",
    modality: "squad",
    type: "comunitaria",
    participants: 20,
    maxParticipants: 20,
    host: "UGD Oficial",
    status: "encerrada",
    winner: "Team Alpha",
    tags: ["Squad", "Concluído"],
  },
  {
    id: 8,
    name: "Salinha Premiada - Fim de Semana",
    date: "2026-06-14",
    time: "15:00",
    modality: "squad",
    type: "premiada",
    prize: "R$ 50,00",
    participants: 8,
    maxParticipants: 20,
    host: "Organizador UGD",
    status: "aberta",
    tags: ["Squad", "Weekend"],
  },
  {
    id: 9,
    name: "Desafio Especial - Modo Rápido",
    date: "2026-06-13",
    time: "18:00",
    modality: "solo",
    type: "especial",
    prize: "Destaque no Perfil",
    participants: 15,
    maxParticipants: 20,
    host: "UGD Eventos",
    status: "aberta",
    tags: ["Solo", "Rápido"],
  },
  */
];

// ==================== COMPONENTES DE UI ====================

const SalaCard = ({ sala }: { sala: Sala }) => {
  const typeConfig = {
    premiada: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      text: "text-amber-400",
      label: "Premiada",
      icon: Trophy,
    },
    comunitaria: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      text: "text-emerald-400",
      label: "Comunitária",
      icon: Users,
    },
    especial: {
      bg: "bg-purple-500/10",
      border: "border-purple-500/30",
      text: "text-purple-400",
      label: "Especial",
      icon: Star,
    },
  };

  const statusConfig = {
    aberta: { bg: "bg-emerald-500/15", text: "text-emerald-400", label: "Inscrições Abertas" },
    em_andamento: { bg: "bg-amber-500/15", text: "text-amber-400", label: "Em Andamento" },
    encerrada: { bg: "bg-red-500/15", text: "text-red-400", label: "Encerrada" },
  };

  const config = typeConfig[sala.type];
  const status = statusConfig[sala.status];
  const TypeIcon = config.icon;

  const cardContent = (
    <div className={`bg-[#12121a] rounded-xl border ${config.border} p-6 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-0.5 group cursor-pointer`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${config.bg} flex items-center justify-center`}>
          <TypeIcon className={`w-6 h-6 ${config.text}`} />
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text} border ${config.border}`}>
            {config.label}
          </span>
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.text}`}>
            {status.label}
          </span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-[#f0f0f5] mb-3 group-hover:text-emerald-400 transition-colors">
        {sala.name}
      </h3>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-[#8a8a9e]">
          <Calendar className="w-4 h-4 text-emerald-400" />
          {sala.date}
        </div>
        <div className="flex items-center gap-2 text-sm text-[#8a8a9e]">
          <Clock className="w-4 h-4 text-emerald-400" />
          {sala.time}
        </div>
        <div className="flex items-center gap-2 text-sm text-[#8a8a9e]">
          <Target className="w-4 h-4 text-emerald-400" />
          {sala.modality.toUpperCase()}
        </div>
        <div className="flex items-center gap-2 text-sm text-[#8a8a9e]">
          <Users className="w-4 h-4 text-emerald-400" />
          {sala.participants}/{sala.maxParticipants}
        </div>
      </div>

      {/* Progress bar for participants */}
      <div className="w-full bg-[#1a1a24] rounded-full h-2 mb-4 overflow-hidden">
        <div
          className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-2 rounded-full transition-all"
          style={{ width: `${Math.min((sala.participants / sala.maxParticipants) * 100, 100)}%` }}
        />
      </div>

      {/* Prize */}
      {sala.prize && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="text-amber-400 text-sm font-semibold">{sala.prize}</span>
        </div>
      )}

      {/* Winner */}
      {sala.winner && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
          <Crown className="w-4 h-4 text-emerald-400" />
          <span className="text-emerald-400 text-sm font-semibold">Vencedor: {sala.winner}</span>
        </div>
      )}

      {/* Host */}
      <div className="flex items-center justify-between pt-3 border-t border-[#2a2a3a]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <Flame className="w-3 h-3 text-emerald-400" />
          </div>
          <span className="text-[#5a5a6e] text-xs">
            Organizado por <span className="text-[#8a8a9e]">{sala.host}</span>
            {sala.hostTiktok && (
              <span className="text-[#fe2c55] ml-1">({sala.hostTiktok})</span>
            )}
          </span>
        </div>
        <div className="flex gap-1.5">
          {sala.tags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 rounded-md bg-[#1a1a24] text-[#5a5a6e] text-[10px]">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Link indicator */}
      {sala.detailPath && (
        <div className="mt-3 pt-3 border-t border-[#2a2a3a]/50 flex items-center justify-center gap-1 text-emerald-400 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          Ver detalhes <ChevronRight className="w-3 h-3" />
        </div>
      )}
    </div>
  );

  if (sala.detailPath) {
    return (
      <Link to={sala.detailPath} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
};

const FilterTab = ({
  active,
  onClick,
  label,
  icon: Icon,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: LucideIcon;
  count: number;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
      active
        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
        : "text-[#8a8a9e] hover:text-[#f0f0f5] hover:bg-[#1a1a24] border border-transparent"
    }`}
  >
    <Icon className="w-4 h-4" />
    {label}
    <span className={`ml-1 px-1.5 py-0.5 rounded-md text-xs ${active ? "bg-emerald-500/20 text-emerald-400" : "bg-[#1a1a24] text-[#5a5a6e]"}`}>
      {count}
    </span>
  </button>
);

// ==================== PÁGINA SALINHAS ====================

export default function Salinhas() {
  const [filter, setFilter] = useState<FilterType>("todas");

  const typeMap: Record<Exclude<FilterType, "todas">, Sala["type"]> = {
    premiadas: "premiada",
    comunitarias: "comunitaria",
    especiais: "especial",
  };

  const filteredSalas = salas.filter((s) => {
    if (filter === "todas") return true;
    return s.type === typeMap[filter as Exclude<FilterType, "todas">];
  });

  const counts = {
    todas: salas.length,
    premiadas: salas.filter((s) => s.type === "premiada").length,
    comunitarias: salas.filter((s) => s.type === "comunitaria").length,
    especiais: salas.filter((s) => s.type === "especial").length,
  };

  const filters: { key: FilterType; label: string; icon: LucideIcon }[] = [
    { key: "todas", label: "Todas", icon: Gamepad2 },
    { key: "premiadas", label: "Premiadas", icon: Trophy },
    { key: "comunitarias", label: "Comunitárias", icon: Users },
    { key: "especiais", label: "Especiais", icon: Star },
  ];

  // Stats
  const stats = {
    total: salas.length,
    abertas: salas.filter((s) => s.status === "aberta").length,
    premiadas: salas.filter((s) => s.type === "premiada").length,
    concluidas: salas.filter((s) => s.status === "encerrada").length,
  };

  // Featured event (Perlotti)
  const featuredEvent = salas.find((s) => s.host === "Perlotti");

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative min-h-[35vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/20 via-transparent to-[#0a0a0f]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.08)_0%,_transparent_70%)]" />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
            <Flame className="w-4 h-4" />
            Salas da Comunidade
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-white via-emerald-100 to-emerald-400 bg-clip-text text-transparent">
            Salinhas UGD
          </h1>
          <p className="text-lg sm:text-xl text-[#8a8a9e] mb-8 max-w-2xl mx-auto">
            Participe de salinhas premiadas, comunitárias e eventos especiais. 
            Acompanhe resultados, premiações e suba no ranking da comunidade.
          </p>
        </div>
      </section>

      {/* Featured Event Banner - Perlotti */}
      {featuredEvent && (
        <section className="max-w-[1400px] mx-auto px-4 lg:px-8 -mt-4 mb-8">
          <Link
            to="/salinhas/perlotti"
            className="block bg-gradient-to-r from-[#fe2c55]/10 via-[#12121a] to-[#25f4ee]/10 rounded-2xl border border-[#fe2c55]/20 p-6 md:p-8 relative overflow-hidden group hover:border-[#fe2c55]/40 transition-all"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(254,44,85,0.08)_0%,_transparent_70%)]" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-[#fe2c55]/10 border border-[#fe2c55]/20 flex items-center justify-center">
                  <Flame className="w-7 h-7 text-[#fe2c55]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full bg-[#fe2c55]/10 text-[#fe2c55] text-[10px] font-bold uppercase tracking-wider">
                      Evento em Destaque
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                      14 Jun 2026
                    </span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-[#f0f0f5] group-hover:text-[#fe2c55] transition-colors">
                    Salinhas Perlotti — 3 Salas Premiadas
                  </h2>
                  <p className="text-[#8a8a9e] text-sm mt-1">
                    Modo Solo • 19:00 BRT • Premiação total de 3.895 Golds + 1k Top Licker
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[#fe2c55] font-semibold text-sm group-hover:gap-3 transition-all">
                Ver detalhes <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Stats Bar */}
      <section className="border-y border-[#2a2a3a] bg-[#12121a]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total de Salas", value: stats.total, icon: Gamepad2 },
              { label: "Inscrições Abertas", value: stats.abertas, icon: Zap },
              { label: "Salas Premiadas", value: stats.premiadas, icon: Trophy },
              { label: "Concluídas", value: stats.concluidas, icon: Medal },
            ].map((stat) => (
              <div key={stat.label} className="bg-[#0a0a0f] rounded-xl p-5 border border-[#2a2a3a] text-center">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="text-2xl font-bold text-[#f0f0f5] mb-1">{stat.value}</p>
                <p className="text-[#8a8a9e] text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filters & Grid */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-emerald-500 rounded-full" />
            <h2 className="text-2xl font-bold text-[#f0f0f5]">Salas Disponíveis</h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <FilterTab
                key={f.key}
                active={filter === f.key}
                onClick={() => setFilter(f.key)}
                label={f.label}
                icon={f.icon}
                count={counts[f.key]}
              />
            ))}
          </div>
        </div>

        {filteredSalas.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSalas.map((sala) => (
              <SalaCard key={sala.id} sala={sala} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-[#1a1a24] flex items-center justify-center mx-auto mb-4">
              <Gamepad2 className="w-8 h-8 text-[#3a3a4e]" />
            </div>
            <p className="text-[#5a5a6e] text-sm mb-2">Nenhuma sala encontrada</p>
            <p className="text-[#5a5a6e] text-xs">Tente selecionar outro filtro.</p>
          </div>
        )}
      </section>

      {/* Como Funciona */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-8 pb-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-8 bg-emerald-500 rounded-full" />
          <h2 className="text-2xl font-bold text-[#f0f0f5]">Como Funciona</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              title: "Escolha uma Sala",
              description: "Navegue pelas salas disponíveis e escolha entre as premiadas, comunitárias ou especiais.",
              icon: Target,
            },
            {
              step: "02",
              title: "Inscreva-se",
              description: "Confira os requisitos, data, horário e modalidade. Inscreva sua equipe antes do limite de vagas.",
              icon: Users,
            },
            {
              step: "03",
              title: "Compita & Ganhe",
              description: "Participe da sala, dispute com as melhores equipes e concorra a premiações e reconhecimento no ranking.",
              icon: Trophy,
            },
          ].map((item) => (
            <div key={item.step} className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6 hover:border-emerald-500/30 transition-all duration-300 group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                  <item.icon className="w-6 h-6 text-emerald-400" />
                </div>
                <span className="text-3xl font-bold text-[#2a2a3a]">{item.step}</span>
              </div>
              <h3 className="text-lg font-bold text-[#f0f0f5] mb-2">{item.title}</h3>
              <p className="text-[#8a8a9e] text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-8 pb-16">
        <div className="bg-gradient-to-r from-emerald-900/20 via-[#12121a] to-emerald-900/20 rounded-2xl border border-emerald-500/20 p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.1)_0%,_transparent_70%)]" />
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold text-[#f0f0f5] mb-3">
              Quer criar uma salinha?
            </h2>
            <p className="text-[#8a8a9e] mb-8 max-w-lg mx-auto">
              Entre em contato com nossos organizadores para criar salas comunitárias 
              ou sugerir novos formatos de competição.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/xtreinos"
                className="px-8 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-all duration-150 hover:scale-[1.02] shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                <Gamepad2 className="w-4 h-4" />
                Ver XTreinos Oficiais
              </Link>
              <Link
                to="/rankings"
                className="px-8 py-3 rounded-xl border border-[#3a3a4e] text-[#f0f0f5] font-semibold hover:border-emerald-500/50 hover:text-emerald-400 transition-all duration-150 flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Ver Rankings
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}