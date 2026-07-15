import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Target, TrendingUp, Award, ArrowLeft, History, Tag, Flame, Users, Swords, Shield,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { Sparkline, BadgeIcon } from "@/components/shared";

// ✅ Tipos importados do arquivo global (removidos daqui)
import type { PlayerStats } from "@/types/player";

// ✅ Função de cálculo de badges importada da utilidade global
import { calculatePlayerBadges } from "@/constants/gameRules";

export default function PlayerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const playerId = Number(id);

  const { data: player, isLoading, isError } = trpc.unified.getPlayerDetails.useQuery(
    { id: playerId },
    { enabled: !isNaN(playerId) }
  );

  if (isNaN(playerId)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-[#8a8a9e]">ID inválido.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] gap-3">
        <div className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-[#8a8a9e]">Carregando perfil do jogador...</span>
      </div>
    );
  }

  if (isError || !player) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Target className="w-12 h-12 text-[#5a5a6e]" />
        <p className="text-[#8a8a9e] text-lg">Jogador não encontrado</p>
        <Link to="/rankings/jogadores/xtreinos" className="text-sm text-green-400 hover:text-green-300 transition-colors">
          Voltar para o ranking
        </Link>
      </div>
    );
  }

  // Tipagem forte para as stats do jogador
  const s = (player.stats || {}) as PlayerStats;
  const a = player.aliases || [];

  // Dados do Sparkline
  const sparklineData = (player.xtreinoHistory || [])
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((h) => h.totalKills ?? 0);

  // Cálculos derivados
  const xtMatches = s.xtreinoMatches || 1;
  const xtKills = s.xtreinoKills ?? 0;
  const avgXT = s.xtreinoMatches ? Math.round((xtKills / xtMatches) * 10) / 10 : 0;
  const totalKills = s.totalKills ?? 0;

  const badges = calculatePlayerBadges({
    totalKills,
    xtreinoMatches: s.xtreinoMatches ?? 0,
    scrimMatches: s.scrimMatches ?? 0,
    scrimMvps: s.scrimMvps ?? 0,
    xtreinoBestQ1: s.xtreinoBestQ1 ?? 0,
    xtreinoBestQ2: s.xtreinoBestQ2 ?? 0,
    xtreinoBestQ3: s.xtreinoBestQ3 ?? 0,
    avg: avgXT,
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#5a5a6e] hover:text-[#f0f0f5] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#f0f0f5] flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-green-400" />
            </div>
            {player.nickname}
          </h1>
          <p className="text-sm text-[#5a5a6e] mt-1">Perfil do jogador • {player.teamName}</p>
        </div>
      </div>

      {/* Nicks Anteriores */}
      {a.length > 0 && (
        <div className="bg-[#1a1a24] rounded-xl border border-[#2a2a3a] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-[#5a5a6e]" />
            <h3 className="text-sm font-medium text-[#8a8a9e]">Variações de Nick / Nicks Anteriores</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {a.map((al) => (
              <span key={al.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0a0a0f] border border-[#2a2a3a] text-xs text-[#8a8a9e]">
                <History className="w-3 h-3 text-[#5a5a6e]" />
                {al.alias}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Cards de Stats Principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#12121a] rounded-xl p-5 border border-[#2a2a3a]">
          <div className="flex items-center gap-2 mb-2"><Flame className="w-4 h-4 text-green-400" /><p className="text-xs text-[#5a5a6e] uppercase">Total Kills</p></div>
          <p className="text-3xl font-bold text-green-400">{totalKills}</p>
        </div>
        <div className="bg-[#12121a] rounded-xl p-5 border border-[#2a2a3a]">
          <div className="flex items-center gap-2 mb-2"><Users className="w-4 h-4 text-green-400" /><p className="text-xs text-[#5a5a6e] uppercase">Participações</p></div>
          <p className="text-3xl font-bold text-[#f0f0f5]">{s.totalMatches ?? 0}</p>
        </div>
        <div className="bg-[#12121a] rounded-xl p-5 border border-[#2a2a3a]">
          <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4 text-green-400" /><p className="text-xs text-[#5a5a6e] uppercase">Média XT</p></div>
          <p className="text-3xl font-bold text-[#f0f0f5]">{avgXT}</p>
        </div>
        <div className="bg-[#12121a] rounded-xl p-5 border border-[#2a2a3a]">
          <div className="flex items-center gap-2 mb-2"><Award className="w-4 h-4 text-yellow-400" /><p className="text-xs text-[#5a5a6e] uppercase">MVPs Scrims</p></div>
          <p className="text-3xl font-bold text-yellow-400">{s.scrimMvps ?? 0}</p>
        </div>
      </div>

      {/* Badges / Conquistas */}
      {badges.length > 0 && (
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-5">
          <h3 className="text-sm font-medium text-[#8a8a9e] mb-3 flex items-center gap-2"><Award className="w-4 h-4" /> Conquistas</h3>
          <div className="flex flex-wrap gap-2">
            {badges.map((badge) => (
              <span key={badge} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1a1a24] border border-[#2a2a3a] text-xs font-medium text-[#f0f0f5]">
                <BadgeIcon badge={badge} /> {badge}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sparkline de Evolução */}
      {sparklineData.length > 0 && (
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-5">
          <h3 className="text-sm font-medium text-[#8a8a9e] mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Evolução nos XTreinos</h3>
          <Sparkline data={sparklineData} width={800} height={100} color="#4ade80" />
          <div className="flex justify-between mt-2 text-xs text-[#5a5a6e]"><span>Primeiro XT</span><span>Último XT</span></div>
        </div>
      )}

      {/* Cards de Stats Detalhados (XT vs Scrims) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-5 space-y-4">
          <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2 text-sm">
            <Target className="w-4 h-4 text-blue-400" /> Estatísticas de XTreinos
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#1a1a24] rounded-xl p-3 border border-[#2a2a3a] text-center">
              <p className="text-xs text-[#5a5a6e] mb-1">Partidas</p>
              <p className="text-xl font-bold text-blue-400">{s.xtreinoMatches ?? 0}</p>
            </div>
            <div className="bg-[#1a1a24] rounded-xl p-3 border border-[#2a2a3a] text-center">
              <p className="text-xs text-[#5a5a6e] mb-1">Kills</p>
              <p className="text-xl font-bold text-green-400">{xtKills}</p>
            </div>
            <div className="bg-[#1a1a24] rounded-xl p-3 border border-[#2a2a3a] text-center">
              <p className="text-xs text-[#5a5a6e] mb-1">Média</p>
              <p className="text-xl font-bold text-[#f0f0f5]">{avgXT}</p>
            </div>
          </div>
          <div className="bg-[#1a1a24] rounded-xl p-4 border border-[#2a2a3a]">
            <h4 className="text-xs text-[#5a5a6e] uppercase mb-2">Melhor Q1 / Q2 / Q3</h4>
            <div className="flex justify-between text-center font-bold">
              <span className="text-red-400">{s.xtreinoBestQ1 ?? 0}</span>
              <span className="text-orange-400">{s.xtreinoBestQ2 ?? 0}</span>
              <span className="text-purple-400">{s.xtreinoBestQ3 ?? 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-5 space-y-4">
          <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2 text-sm">
            <Swords className="w-4 h-4 text-red-400" /> Estatísticas de Scrims (MME)
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#1a1a24] rounded-xl p-3 border border-[#2a2a3a] text-center">
              <p className="text-xs text-[#5a5a6e] mb-1">Scrims</p>
              <p className="text-xl font-bold text-red-400">{s.scrimMatches ?? 0}</p>
            </div>
            <div className="bg-[#1a1a24] rounded-xl p-3 border border-[#2a2a3a] text-center">
              <p className="text-xs text-[#5a5a6e] mb-1">K/D</p>
              <p className="text-xl font-bold text-[#f0f0f5]">{s.scrimKdRatio ?? 0}</p>
            </div>
            <div className="bg-[#1a1a24] rounded-xl p-3 border border-[#2a2a3a] text-center">
              <p className="text-xs text-[#5a5a6e] mb-1">MVPs</p>
              <p className="text-xl font-bold text-yellow-400">{s.scrimMvps ?? 0}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-[#1a1a24] rounded-xl p-2 border border-[#2a2a3a]">
              <p className="text-[10px] text-[#5a5a6e] uppercase">Vitórias</p>
              <p className="text-lg font-bold text-green-400">{s.scrimWins ?? 0}</p>
            </div>
            <div className="bg-[#1a1a24] rounded-xl p-2 border border-[#2a2a3a]">
              <p className="text-[10px] text-[#5a5a6e] uppercase">Derrotas</p>
              <p className="text-lg font-bold text-red-400">{s.scrimLosses ?? 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Histórico de XTreinos */}
      <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#2a2a3a]">
          <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
            <History className="w-5 h-5 text-green-400" />
            Histórico de XTreinos ({player.xtreinoHistory?.length ?? 0})
          </h3>
        </div>
        <div className="divide-y divide-[#2a2a3a] max-h-[400px] overflow-y-auto">
          {(player.xtreinoHistory || []).sort((a, b) => b.date.localeCompare(a.date)).map((h) => (
            <div key={`${h.date}-${h.id}`} className="flex items-center justify-between px-6 py-3 hover:bg-[#1a1a24] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#1a1a24] flex items-center justify-center"><History className="w-4 h-4 text-[#5a5a6e]" /></div>
                <span className="text-sm font-medium text-[#f0f0f5]">{h.date}</span>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-[#5a5a6e]">Q1: <span className="text-red-400 font-medium">{h.q1Kills}</span></span>
                <span className="text-[#5a5a6e]">Q2: <span className="text-orange-400 font-medium">{h.q2Kills}</span></span>
                <span className="text-[#5a5a6e]">Q3: <span className="text-purple-400 font-medium">{h.q3Kills}</span></span>
                <span className="text-sm font-bold text-green-400 min-w-[60px] text-right">{h.totalKills} kills</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Histórico de Scrims */}
      {(player.scrimHistory?.length ?? 0) > 0 && (
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2a2a3a]">
            <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
              <Swords className="w-5 h-5 text-red-400" />
              Histórico de Scrims ({player.scrimHistory.length})
            </h3>
          </div>
          <div className="divide-y divide-[#2a2a3a] max-h-[400px] overflow-y-auto">
            {(player.scrimHistory || []).sort((a, b) => b.date.localeCompare(a.date)).map((sh) => {
              const totalK = (sh.rounds || []).reduce((s, r) => s + (r.kills || 0), 0);
              const isMvp = (sh.rounds || []).some(r => r.mvp);
              return (
                <div key={sh.id} className="flex items-center justify-between px-6 py-3 hover:bg-[#1a1a24] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center"><Shield className="w-4 h-4 text-red-400" /></div>
                    <div>
                      <span className="text-sm font-medium text-[#f0f0f5]">{sh.date}</span>
                      <span className="text-xs text-[#5a5a6e] ml-2">vs {sh.teamName}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    {isMvp && <span className="px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 font-bold border border-yellow-500/20">MVP</span>}
                    <span className="text-[#5a5a6e]">K: <span className="text-green-400">{totalK}</span></span>
                    <span className="text-[#5a5a6e]">D: <span className="text-red-400">{sh.totalDeaths}</span></span>
                    <span className="text-[#5a5a6e]">A: <span className="text-blue-400">{sh.totalAssists}</span></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}