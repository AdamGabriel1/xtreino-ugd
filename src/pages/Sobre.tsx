import { Link } from "react-router";
import {
  Users,
  Shield,
  Crown,
  Palette,
  Heart,
  Target,
  Trophy,
  Star,
  ChevronRight,
  Gamepad2,
  Zap,
  Globe,
  Award,
  Handshake,
  Code2,
  type LucideProps,
} from "lucide-react";
import MainLayout from "@/layout/MainLayout";
import type { ForwardRefExoticComponent, RefAttributes } from "react";

type LucideIcon = ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;

interface TeamMember {
  name: string;
  role: string;
  description: string;
  icon: LucideIcon;
  color: string;
  tiktok?: string;
  youtube?: string;
  clan?: string;
  nick?: string;
}

interface Partner {
  name: string;
  type: string;
  status: "ativo" | "em_breve";
}

// ==================== COMPONENTES DE UI ====================

const RoleCard = ({ member }: { member: TeamMember }) => {
  const Icon = member.icon;
  return (
    <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-0.5 group">
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-14 h-14 rounded-xl ${member.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <div>
          <h3 className="text-[#f0f0f5] font-bold text-lg">{member.name}</h3>
          <p className="text-emerald-400 text-sm font-medium">{member.role}</p>
        </div>
      </div>
      <p className="text-[#8a8a9e] text-sm leading-relaxed">{member.description}</p>
      
      {/* Social Links */}
      <div className="mt-4 flex flex-wrap gap-2">
        {member.nick && (
          <span className="text-xs px-2 py-1 rounded-md bg-[#1a1a24] border border-[#2a2a3a] text-[#8a8a9e]">
            Nick: {member.nick}
          </span>
        )}
        {member.clan && (
          <span className="text-xs px-2 py-1 rounded-md bg-[#1a1a24] border border-[#2a2a3a] text-[#8a8a9e]">
            Clã: {member.clan}
          </span>
        )}
        {member.tiktok && (
          <a 
            href={`https://tiktok.com/${member.tiktok}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs px-2 py-1 rounded-md bg-[#1a1a24] border border-[#2a2a3a] text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-colors"
          >
            TT: {member.tiktok}
          </a>
        )}
        {member.youtube && (
          <a 
            href={`https://youtube.com/${member.youtube}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs px-2 py-1 rounded-md bg-[#1a1a24] border border-[#2a2a3a] text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-colors"
          >
            YT: {member.youtube}
          </a>
        )}
      </div>
    </div>
  );
};

const StatHighlight = ({ value, label, icon: Icon }: { value: string; label: string; icon: LucideIcon }) => (
  <div className="text-center">
    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
      <Icon className="w-6 h-6 text-emerald-400" />
    </div>
    <p className="text-3xl font-bold text-[#f0f0f5] mb-1">{value}</p>
    <p className="text-[#8a8a9e] text-sm">{label}</p>
  </div>
);

const PartnerCard = ({ partner }: { partner: Partner }) => (
  <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-5 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-0.5 group">
    <div className="flex items-center justify-between mb-3">
      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
        <Handshake className="w-5 h-5 text-emerald-400" />
      </div>
      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
        partner.status === "ativo" 
          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
          : "bg-[#1a1a24] text-[#5a5a6e] border border-[#2a2a3a]"
      }`}>
        {partner.status === "ativo" ? "Ativo" : "Em Breve"}
      </span>
    </div>
    <h4 className="text-[#f0f0f5] font-bold text-sm group-hover:text-emerald-400 transition-colors">{partner.name}</h4>
    <p className="text-[#5a5a6e] text-xs mt-1">{partner.type}</p>
  </div>
);

// ==================== PÁGINA SOBRE ====================

export default function Sobre() {
  const teamMembers: TeamMember[] = [
    {
      name: "Edgar Lira (Ed)",
      role: "Fundador & Dono da Underground",
      description: "Responsável pela direção estratégica e visão geral da UGD. Gerencia as inscrições das equipes nos xtreinos e garante que tudo funcione perfeitamente.",
      icon: Crown,
      color: "bg-gradient-to-br from-amber-500 to-amber-700",
      nick: "A-Train da UGD",
      tiktok: "@edgarlira9",
    },
    {
      name: "Sant",
      role: "CEO da Underground",
      description: "CEO da UGD, responsável pela organização das equipes nos xtreinos e pela gestão estratégica das operações do clã.",
      icon: Shield,
      color: "bg-gradient-to-br from-emerald-500 to-emerald-700",
      tiktok: "@playersnt",
    },
    {
      name: "Kaze",
      role: "Administrador & Tabelas",
      description: "Um dos administradores da UGD. Especialista na criação e manutenção das tabelas dos xtreinos, garantindo organização nos resultados.",
      icon: Target,
      color: "bg-gradient-to-br from-blue-500 to-blue-700",
      tiktok: "@ugdkaze",
      youtube: "@KazeFpsBloodStrike",
    },
    {
      name: "Neto Aguiar",
      role: "Administrador & Designer",
      description: "Administrador da K4F. Responsável pela identidade visual, arte, banners e thumbnails da organização.",
      icon: Palette,
      color: "bg-gradient-to-br from-purple-500 to-purple-700",
      clan: "K4F",
      tiktok: "@netinhoaguiar0",
    },
    {
      name: "Adam (Ares/Cool)",
      role: "Líder UGD Threat & Desenvolvedor",
      description: "Líder da line UGD Threat, administrador da Underground, organizador de xtreinos, desenvolvedor e mantenedor do site, designer web e patrocinador da organização.",
      icon: Code2,
      color: "bg-gradient-to-br from-rose-500 to-rose-700",
      nick: "Ares/Cool",
      tiktok: "@aresz.bs0",
    },
  ];

  const futureRoles: TeamMember[] = [
    {
      name: "Patrocinadores",
      role: "Apoio Financeiro",
      description: "Empresas e marcas que acreditam no nosso projeto e apoiam com recursos para premiações, infraestrutura e crescimento da comunidade.",
      icon: Award,
      color: "bg-gradient-to-br from-blue-500 to-blue-700",
    },
    {
      name: "Clãs Parceiros",
      role: "Colaboração",
      description: "Outras organizações e comunidades que colaboram conosco em eventos, trocam experiências e fortalecem o cenário mobile competitivo.",
      icon: Users,
      color: "bg-gradient-to-br from-rose-500 to-rose-700",
    },
  ];

  const partners: Partner[] = [
    { name: "UGD Esports", type: "Clã Principal", status: "ativo" },
    { name: "K4F", type: "Clã Parceiro", status: "ativo" },
    { name: "Em Breve", type: "Patrocinador", status: "em_breve" },
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative min-h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/20 via-transparent to-[#0a0a0f]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.08)_0%,_transparent_70%)]" />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            Quem Somos
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-white via-emerald-100 to-emerald-400 bg-clip-text text-transparent">
            Underground
          </h1>
          <p className="text-lg sm:text-xl text-[#8a8a9e] mb-8 max-w-2xl mx-auto">
            Somos uma organização dedicada ao cenário competitivo mobile. 
            Nosso objetivo é criar o melhor ambiente para xtreinos, campeonatos e scrims 
            com profissionalismo e paixão pelo game.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-[#2a2a3a] bg-[#12121a]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatHighlight value="50+" label="XTreinos Realizados" icon={Gamepad2} />
            <StatHighlight value="20+" label="Equipes Ativas" icon={Users} />
            <StatHighlight value="100+" label="Jogadores" icon={Star} />
            <StatHighlight value="10+" label="Campeonatos" icon={Trophy} />
          </div>
        </div>
      </section>

      {/* Nossa História */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-emerald-500 rounded-full" />
              <h2 className="text-2xl font-bold text-[#f0f0f5]">Nossa História</h2>
            </div>
            <div className="space-y-4 text-[#8a8a9e] leading-relaxed">
              <p>
                A <span className="text-emerald-400 font-semibold">Underground (UGD)</span> nasceu da paixão de um grupo de jogadores 
                que queriam levar o cenário mobile a sério. O que começou como salinhas entre amigos 
                evoluiu para uma organização completa de xtreinos e campeonatos.
              </p>
              <p>
                Hoje, somos referência em organização de eventos competitivos mobile, 
                oferecendo uma plataforma completa para equipes e jogadores acompanharem 
                seus resultados, rankings e evolução no cenário.
              </p>
              <p>
                Nosso compromisso é com a <span className="text-emerald-400 font-semibold">transparência</span>, 
                <span className="text-emerald-400 font-semibold"> competitividade</span> e 
                <span className="text-emerald-400 font-semibold"> diversão</span>. 
                Acreditamos que o cenário mobile tem potencial enorme e trabalhamos todos os dias 
                para torná-lo cada vez mais profissional.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                <Zap className="w-4 h-4" />
                Agilidade
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                <Heart className="w-4 h-4" />
                Paixão
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                <Globe className="w-4 h-4" />
                Comunidade
              </div>
            </div>
          </div>

          <div className="bg-[#12121a] rounded-2xl border border-[#2a2a3a] p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-[#f0f0f5]">Nossos Objetivos</h3>
            </div>
            <div className="space-y-4">
              {[
                "Ser a principal referência de xtreinos mobile do cenário",
                "Criar um ambiente justo e competitivo para todas as equipes",
                "Desenvolver talentos e ajudar jogadores a evoluírem",
                "Profissionalizar a organização de eventos mobile",
                "Construir uma comunidade forte e unida",
              ].map((goal, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ChevronRight className="w-3 h-3 text-emerald-400" />
                  </div>
                  <p className="text-[#8a8a9e] text-sm">{goal}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Equipe */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-8 pb-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-8 bg-emerald-500 rounded-full" />
          <h2 className="text-2xl font-bold text-[#f0f0f5]">Nossa Equipe</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {teamMembers.map((member) => (
            <RoleCard key={member.name} member={member} />
          ))}
        </div>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-8 bg-emerald-500 rounded-full" />
          <h2 className="text-2xl font-bold text-[#f0f0f5]">Em Breve</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {futureRoles.map((member) => (
            <RoleCard key={member.name} member={member} />
          ))}
        </div>

        {/* Parceiros */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-8 bg-emerald-500 rounded-full" />
          <h2 className="text-2xl font-bold text-[#f0f0f5]">Parceiros & Colaboradores</h2>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {partners.map((partner) => (
            <PartnerCard key={partner.name} partner={partner} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-8 pb-16">
        <div className="bg-gradient-to-r from-emerald-900/20 via-[#12121a] to-emerald-900/20 rounded-2xl border border-emerald-500/20 p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.1)_0%,_transparent_70%)]" />
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold text-[#f0f0f5] mb-3">
              Quer fazer parte da UGD?
            </h2>
            <p className="text-[#8a8a9e] mb-8 max-w-lg mx-auto">
              Seja como jogador, organizador ou parceiro, temos espaço para quem 
              quer ajudar a construir o melhor cenário mobile competitivo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/clans"
                className="px-8 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-all duration-150 hover:scale-[1.02] shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4" />
                Junte-se a uma Equipe
              </Link>
              <Link
                to="/xtreinos"
                className="px-8 py-3 rounded-xl border border-[#3a3a4e] text-[#f0f0f5] font-semibold hover:border-emerald-500/50 hover:text-emerald-400 transition-all duration-150 flex items-center justify-center gap-2"
              >
                <Gamepad2 className="w-4 h-4" />
                Participar de XTreinos
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}