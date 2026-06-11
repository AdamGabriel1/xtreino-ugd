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
  User,
} from "lucide-react";
import MainLayout from "@/layout/MainLayout";
import { useState } from "react";

// ==================== DADOS DAS SALINHAS ====================

interface SalinhaData {
  id: number;
  name: string;
  round: number;
  date: string;
  time: string;
  modality: string;
  prize1st: string;
  prize2nd: string;
  prize3rd: string;
  specialPrize?: string;
  status: "aberta" | "em_andamento" | "encerrada";
  winner1st?: string;
  winner2nd?: string;
  winner3rd?: string;
  specialWinner?: string;
  roomId?: string;
  roomPassword?: string;
}

const salinhasData: SalinhaData[] = [
  {
    id: 1,
    name: "Salinha Perlotti #1",
    round: 1,
    date: "2026-06-14",
    time: "19:00",
    modality: "solo",
    prize1st: "540 Golds",
    prize2nd: "320 Golds",
    prize3rd: "105 Golds",
    status: "aberta",
  },
  {
    id: 2,
    name: "Salinha Perlotti #2",
    round: 2,
    date: "2026-06-14",
    time: "19:00",
    modality: "solo",
    prize1st: "540 Golds",
    prize2nd: "320 Golds",
    prize3rd: "105 Golds",
    status: "aberta",
  },
  {
    id: 3,
    name: "Salinha Perlotti #3",
    round: 3,
    date: "2026-06-14",
    time: "19:00",
    modality: "solo",
    prize1st: "540 Golds",
    prize2nd: "320 Golds",
    prize3rd: "105 Golds",
    specialPrize: "1.000 Golds Top Licker da Live",
    status: "aberta",
  },
];

// ==================== COMPONENTES ====================

const PodiumCard = ({ position, prize, winner, color }: {
  position: number;
  prize: string;
  winner?: string;
  color: string;
}) => {
  const icons = [Crown, Medal, Star] as const;
  const Icon = icons[position - 1] || Star;
  const gradients: Record<number, string> = {
    1: "from-amber-400/20 to-amber-600/5 border-amber-500/30",
    2: "from-slate-300/20 to-slate-500/5 border-slate-400/30",
    3: "from-orange-400/20 to-orange-600/5 border-orange-500/30",
  };
  const textColors: Record<number, string> = {
    1: "text-amber-400",
    2: "text-slate-300",
    3: "text-orange-400",
  };

  return (
    <div className={`relative bg-gradient-to-b ${gradients[position]} rounded-2xl border p-6 text-center group hover:scale-[1.02] transition-all duration-300`}>
      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
        <div className={`w-10 h-10 rounded-full bg-[#12121a] border-2 ${color} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${textColors[position]}`} />
        </div>
      </div>
      <div className="mt-4 mb-2">
        <span className={`text-3xl font-black ${textColors[position]}`}>
          {position}º
        </span>
      </div>
      <p className="text-[#8a8a9e] text-sm mb-1">Prêmio</p>
      <p className={`text-lg font-bold ${textColors[position]} mb-3`}>{prize}</p>
      {winner ? (
        <div className="bg-[#0a0a0f]/50 rounded-lg px-3 py-2">
          <p className="text-[#5a5a6e] text-xs">Vencedor</p>
          <p className="text-[#f0f0f5] font-semibold text-sm">{winner}</p>
        </div>
      ) : (
        <div className="bg-[#0a0a0f]/50 rounded-lg px-3 py-2">
          <p className="text-[#3a3a4e] text-xs">Aguardando...</p>
        </div>
      )}
    </div>
  );
};

const SalinhaCard = ({ salinha, isActive, onClick }: {
  salinha: SalinhaData;
  isActive: boolean;
  onClick: () => void;
}) => {
  const statusConfig = {
    aberta: { bg: "bg-emerald-500/15", text: "text-emerald-400", label: "Inscrições Abertas" },
    em_andamento: { bg: "bg-amber-500/15", text: "text-amber-400", label: "Em Andamento" },
    encerrada: { bg: "bg-red-500/15", text: "text-red-400", label: "Encerrada" },
  };
  const status = statusConfig[salinha.status];

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border p-5 transition-all duration-300 ${
        isActive
          ? "border-emerald-500/40 bg-emerald-500/5 shadow-lg shadow-emerald-500/10"
          : "border-[#2a2a3a] bg-[#12121a] hover:border-[#3a3a4e]"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-[#5a5a6e] uppercase tracking-wider">
          Sala {salinha.round}
        </span>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.text}`}>
          {status.label}
        </span>
      </div>
      <h3 className="text-lg font-bold text-[#f0f0f5] mb-2">{salinha.name}</h3>
      <div className="flex items-center gap-4 text-sm text-[#8a8a9e]">
        <span className="flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-emerald-400" />
          {salinha.modality.toUpperCase()}
        </span>
        <span className="flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          {salinha.prize1st}
        </span>
      </div>
      {salinha.specialPrize && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-[#fe2c55]">
          <Zap className="w-3 h-3" />
          {salinha.specialPrize}
        </div>
      )}
    </button>
  );
};

const RoomCredentials = ({ roomId, roomPassword }: {
  roomId?: string;
  roomPassword?: string;
}) => {
  const [revealed, setRevealed] = useState(false);

  if (!roomId || !roomPassword) {
    return (
      <div className="bg-[#12121a] rounded-xl border border-amber-500/20 p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
          <Flame className="w-6 h-6 text-amber-400" />
        </div>
        <h4 className="text-lg font-bold text-[#f0f0f5] mb-2">ID e Senha da Sala</h4>
        <p className="text-[#8a8a9e] text-sm mb-4">
          As credenciais serão divulgadas na live do Perlotti!
        </p>
        <a
          href="https://www.tiktok.com/@perlottihd"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#fe2c55]/10 border border-[#fe2c55]/20 text-[#fe2c55] text-sm font-semibold hover:bg-[#fe2c55]/20 transition-colors"
        >
          <Flame className="w-4 h-4" />
          Assistir Live no TikTok
        </a>
      </div>
    );
  }

  return (
    <div className="bg-[#12121a] rounded-xl border border-emerald-500/20 p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-bold text-[#f0f0f5] flex items-center gap-2">
          <Trophy className="w-5 h-5 text-emerald-400" />
          Credenciais da Sala
        </h4>
        <button
          onClick={() => setRevealed(!revealed)}
          className="text-[#8a8a9e] hover:text-emerald-400 transition-colors text-sm flex items-center gap-1"
        >
          {revealed ? "Ocultar" : "Revelar"}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#0a0a0f] rounded-lg p-4 border border-[#2a2a3a]">
          <p className="text-[#5a5a6e] text-xs mb-1">ID da Sala</p>
          <p className="text-xl font-mono font-bold text-emerald-400 tracking-wider">
            {revealed ? roomId : "••••••••"}
          </p>
        </div>
        <div className="bg-[#0a0a0f] rounded-lg p-4 border border-[#2a2a3a]">
          <p className="text-[#5a5a6e] text-xs mb-1">Senha</p>
          <p className="text-xl font-mono font-bold text-emerald-400 tracking-wider">
            {revealed ? roomPassword : "••••••••"}
          </p>
        </div>
      </div>
    </div>
  );
};

// ==================== PÁGINA PRINCIPAL ====================

export default function SalinhaPerlotti() {
  const [activeSalinha, setActiveSalinha] = useState(0);

  const salinha = salinhasData[activeSalinha];

  return (
    <MainLayout>
      {/* Hero Section com Banner */}
      <section className="relative min-h-[50vh] flex items-end overflow-hidden">
        {/* Banner Background - Substitua pela URL do banner 1080x721 */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e] via-[#0f0f1a] to-[#0a0a0f]" />
        
        {/* Banner 1080x721 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full max-w-[1080px] aspect-[1080/721] mx-4">
            <img
              src="/banner-perlotti.jpg"
              alt="Banner do evento"
              className="rounded-2xl border border-[#2a2a3a] object-cover w-full h-full"
            />
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/80 to-transparent" />
        
        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 lg:px-8 pb-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#fe2c55]/10 border border-[#fe2c55]/20 text-[#fe2c55] text-sm font-medium mb-4">
                <Flame className="w-4 h-4" />
                Evento Especial
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-3 bg-gradient-to-r from-white via-[#f0f0f5] to-[#8a8a9e] bg-clip-text text-transparent">
                Salinhas Perlotti
              </h1>
              <p className="text-lg text-[#8a8a9e] max-w-xl">
                3 salas premiadas no domingo, 14 de junho de 2026. 
                Modo Solo. Premiação total de <span className="text-amber-400 font-bold">3.895 Golds</span>!
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <a
                href="https://www.tiktok.com/@perlottihd"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#fe2c55] hover:bg-[#e02648] text-white font-semibold transition-all hover:scale-[1.02] shadow-lg shadow-[#fe2c55]/20"
              >
                <Flame className="w-4 h-4" />
                @perlottihd
              </a>
              <Link
                to="/salinhas"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[#3a3a4e] text-[#f0f0f5] font-semibold hover:border-emerald-500/50 hover:text-emerald-400 transition-all"
              >
                <Gamepad2 className="w-4 h-4" />
                Todas as Salinhas
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Info Bar */}
      <section className="border-y border-[#2a2a3a] bg-[#12121a]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Data", value: "14 Jun 2026", icon: Calendar, color: "text-emerald-400" },
              { label: "Horário", value: "19:00 BRT", icon: Clock, color: "text-emerald-400" },
              { label: "Modalidade", value: "Solo", icon: User, color: "text-emerald-400" },
              { label: "Salas", value: "3 Premiadas", icon: Trophy, color: "text-amber-400" },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-[#5a5a6e] text-xs">{stat.label}</p>
                  <p className="text-[#f0f0f5] font-bold">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Post do Perlotti — Foto 1080x721 */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
        <div className="bg-[#12121a] rounded-2xl border border-[#2a2a3a] p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-[#fe2c55] rounded-full" />
            <h2 className="text-xl font-bold text-[#f0f0f5]">Post Oficial</h2>
          </div>
          
          {/* Imagem do post — substitua a URL abaixo pela foto 1080x721 */}
          <a
            href="https://www.tiktok.com/@perlottihd/photo/7649581004541152520"
            target="_blank"
            rel="noopener noreferrer"
            className="block relative w-full max-w-[1080px] mx-auto aspect-[1080/721] rounded-xl overflow-hidden border border-[#2a2a3a] hover:border-[#fe2c55]/30 transition-colors group"
          >
            <img
              src="/banner-perlotti.jpg"
              alt="Post oficial do Perlotti sobre as salinhas"
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            />
            {/* Overlay com ícone do TikTok */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-[#fe2c55] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                <Flame className="w-7 h-7 text-white" />
              </div>
            </div>
          </a>
          
          <div className="flex items-center justify-center gap-4 mt-4">
            <a
              href="https://www.tiktok.com/@perlottihd/photo/7649581004541152520"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#fe2c55]/10 border border-[#fe2c55]/20 text-[#fe2c55] text-sm font-medium hover:bg-[#fe2c55]/20 transition-colors"
            >
              <Flame className="w-4 h-4" />
              Ver no TikTok
            </a>
          </div>
        </div>
      </section>

      {/* Seletor de Salas + Detalhes */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-8 pb-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-8 bg-emerald-500 rounded-full" />
          <h2 className="text-2xl font-bold text-[#f0f0f5]">Salas do Evento</h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Lista de Salas */}
          <div className="space-y-3">
            {salinhasData.map((s, idx) => (
              <SalinhaCard
                key={s.id}
                salinha={s}
                isActive={activeSalinha === idx}
                onClick={() => setActiveSalinha(idx)}
              />
            ))}
            
            {/* Prêmio Especial */}
            <div className="bg-gradient-to-r from-amber-500/10 to-purple-500/10 rounded-xl border border-amber-500/20 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#f0f0f5]">Prêmio Especial</h4>
                  <p className="text-[#8a8a9e] text-xs">Durante a live</p>
                </div>
              </div>
              <p className="text-amber-400 font-bold text-lg">1.000 Golds</p>
              <p className="text-[#8a8a9e] text-xs mt-1">Para o Top Licker da live do Perlotti!</p>
            </div>
          </div>

          {/* Detalhes da Sala Ativa */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pódio */}
            <div className="bg-[#12121a] rounded-2xl border border-[#2a2a3a] p-6 md:p-8">
              <h3 className="text-xl font-bold text-[#f0f0f5] mb-6 flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                Premiação — {salinha.name}
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <PodiumCard
                  position={1}
                  prize={salinha.prize1st}
                  winner={salinha.winner1st}
                  color="border-amber-400"
                />
                <PodiumCard
                  position={2}
                  prize={salinha.prize2nd}
                  winner={salinha.winner2nd}
                  color="border-slate-400"
                />
                <PodiumCard
                  position={3}
                  prize={salinha.prize3rd}
                  winner={salinha.winner3rd}
                  color="border-orange-400"
                />
              </div>
              {salinha.specialPrize && (
                <div className="mt-4 bg-gradient-to-r from-[#fe2c55]/10 to-amber-500/10 rounded-xl border border-[#fe2c55]/20 p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#fe2c55]/10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-[#fe2c55]" />
                  </div>
                  <div>
                    <p className="text-[#8a8a9e] text-xs">Prêmio Extra</p>
                    <p className="text-[#fe2c55] font-bold">{salinha.specialPrize}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Credenciais */}
            <RoomCredentials roomId={salinha.roomId} roomPassword={salinha.roomPassword} />

            {/* Info da Sala */}
            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
              <h4 className="text-lg font-bold text-[#f0f0f5] mb-4">Informações</h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0a0a0f]">
                  <Calendar className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-[#5a5a6e] text-xs">Data</p>
                    <p className="text-[#f0f0f5] font-medium">14 de Junho de 2026</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0a0a0f]">
                  <Clock className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-[#5a5a6e] text-xs">Horário</p>
                    <p className="text-[#f0f0f5] font-medium">19:00 (Horário de Brasília)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0a0a0f]">
                  <Target className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-[#5a5a6e] text-xs">Modalidade</p>
                    <p className="text-[#f0f0f5] font-medium">Solo</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0a0a0f]">
                  <Users className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-[#5a5a6e] text-xs">Participação</p>
                    <p className="text-[#f0f0f5] font-medium">Aberta a todos</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Regras */}
            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
              <h4 className="text-lg font-bold text-[#f0f0f5] mb-4">Como Participar</h4>
              <ul className="space-y-3">
                {[
                  "Acesse a live do Perlotti no TikTok (@perlottihd)",
                  "Aguarde a divulgação do ID e Senha da sala",
                  "Entre na sala personalizada no horário marcado",
                  "Dispute no modo Solo e conquiste sua posição",
                  "O Top Licker da live ganha 1.000 Golds!"
                ].map((rule, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[#8a8a9e]">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xs font-bold shrink-0">
                      {i + 1}
                    </span>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-8 pb-16">
        <div className="bg-gradient-to-r from-[#fe2c55]/10 via-[#12121a] to-[#25f4ee]/10 rounded-2xl border border-[#fe2c55]/20 p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(254,44,85,0.08)_0%,_transparent_70%)]" />
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold text-[#f0f0f5] mb-3">
              Não perca as Salinhas do Perlotti!
            </h2>
            <p className="text-[#8a8a9e] mb-8 max-w-lg mx-auto">
              Siga o Perlotti no TikTok para ficar por dentro de todas as novidades, 
              credenciais das salas e muito mais.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://www.tiktok.com/@perlottihd"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 rounded-xl bg-[#fe2c55] hover:bg-[#e02648] text-white font-semibold transition-all hover:scale-[1.02] shadow-lg shadow-[#fe2c55]/20 flex items-center justify-center gap-2"
              >
                <Flame className="w-4 h-4" />
                Seguir @perlottihd
              </a>
              <Link
                to="/salinhas"
                className="px-8 py-3 rounded-xl border border-[#3a3a4e] text-[#f0f0f5] font-semibold hover:border-emerald-500/50 hover:text-emerald-400 transition-all flex items-center justify-center gap-2"
              >
                <Gamepad2 className="w-4 h-4" />
                Ver Todas as Salinhas
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}