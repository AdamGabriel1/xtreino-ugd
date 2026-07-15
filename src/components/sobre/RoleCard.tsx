// ✅ CORREÇÃO: Importar tipo do alias global
import type { LucideIcon } from "@/types/sobre";

// ✅ CORREÇÃO: Removida a interface TeamMember daqui (agora vem do types)

interface RoleCardProps {
  member: {
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
  featured?: boolean;
}

export default function RoleCard({ member, featured = false }: RoleCardProps) {
  const Icon = member.icon;
  return (
    <div className={`relative rounded-xl border p-6 transition-all duration-500 hover:-translate-y-1 group overflow-hidden ${
      featured
        ? "bg-gradient-to-br from-[#12121a] to-[#0f0f16] border-emerald-500/30 hover:border-emerald-500/60 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]"
        : "bg-[#12121a] border-[#2a2a3a] hover:border-emerald-500/40 hover:shadow-[0_0_25px_rgba(16,185,129,0.1)]"
    }`}>
      {/* Efeito Shine */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent skew-x-12 z-0 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-14 h-14 rounded-xl ${member.color} flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[#f0f0f5] font-bold text-lg truncate">{member.name}</h3>
            <p className="text-emerald-400 text-sm font-medium">{member.role}</p>
          </div>
        </div>
        <p className="text-[#8a8a9e] text-sm leading-relaxed">{member.description}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {member.nick && (
            <span className="text-xs px-2.5 py-1 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#8a8a9e]">🎮 {member.nick}</span>
          )}
          {member.clan && (
            <span className="text-xs px-2.5 py-1 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#8a8a9e]">🏴 {member.clan}</span>
          )}
          {member.tiktok && (
            <a href={`https://tiktok.com/${member.tiktok}`} target="_blank" rel="noopener noreferrer" className="text-xs px-2.5 py-1 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-colors">🎵 TT: {member.tiktok}</a>
          )}
          {member.youtube && (
            <a href={`https://youtube.com/${member.youtube}`} target="_blank" rel="noopener noreferrer" className="text-xs px-2.5 py-1 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-colors">🎬 YT: {member.youtube}</a>
          )}
        </div>
      </div>
    </div>
  );
}