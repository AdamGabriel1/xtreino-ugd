import { Crown, Shield, Target, Palette, Code2, Award, Users, type LucideIcon } from "lucide-react";
import RoleCard from "./RoleCard";

// ✅ CORREÇÃO: Usar o tipo nativo do lucide-react em vez de React.ElementType
type TeamMember = {
  name: string;
  role: string;
  description: string;
  icon: LucideIcon;
  color: string;
  tiktok?: string;
  youtube?: string;
  clan?: string;
  nick?: string;
};

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

export default function TeamSection() {
  return (
    <section className="border-t border-[#2a2a3a] bg-[#0d0d14]">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
            <Crown className="w-4 h-4" />
            A equipe por trás de tudo
          </div>
          <h2 className="text-2xl font-bold text-[#f0f0f5]">Nossa Equipe</h2>
        </div>

        {/* Fundador em destaque */}
        <div className="mb-8 max-w-lg mx-auto">
          <RoleCard member={teamMembers[0]} featured />
        </div>

        {/* Restante da equipe */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {teamMembers.slice(1).map((member) => (
            <RoleCard key={member.name} member={member} />
          ))}
        </div>

        {/* Em Breve */}
        <div className="flex items-center gap-3 mb-8 mt-12">
          <div className="w-1 h-8 bg-amber-500/50 rounded-full" />
          <h2 className="text-xl font-bold text-[#f0f0f5]">Vagas Abertas</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">Recrutando</span>
        </div>

        <div className="grid md:grid-cols-2 gap-5 mb-16">
          {futureRoles.map((member) => (
            <RoleCard key={member.name} member={member} />
          ))}
        </div>
      </div>
    </section>
  );
}