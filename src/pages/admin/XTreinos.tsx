import { useState } from "react";
import {
  Dumbbell,
  Calendar,
  Clock,
  Users,
  MessageSquare,
  Copy,
  Check,
  Trophy,
  Target,
  TrendingUp,
  Medal,
  Swords,
  ChevronDown,
  ChevronUp,
  BarChart3,
  CalendarDays,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import MainLayout from "@/layout/MainLayout";

export default function XTreinos() {
  const [selectedXt, setSelectedXt] = useState<number | null>(null);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "results" | "players" | "ranking">("info");
  const [showSchedule, setShowSchedule] = useState(false);

  const { data: xtreinosList } = trpc.xtreinos.list.useQuery();
  const { data: xtDetail } = trpc.xtreinos.getById.useQuery(
    { id: selectedXt! },
    { enabled: !!selectedXt }
  );
  const { data: settings } = trpc.settings.get.useQuery();

  // Queries de resultados e rankings
  const { data: teamRanking } = trpc.xtreinos.teamRanking.useQuery(
    { limit: 10 },
    { enabled: activeTab === "ranking" && !selectedXt }
  );
  const { data: playerRanking } = trpc.xtreinos.playerRanking.useQuery(
    { limit: 20 },
    { enabled: activeTab === "ranking" && !selectedXt }
  );
  const { data: scheduleList } = trpc.xtreinos.schedule.list.useQuery(
    { month: "2026-06" },
    { enabled: showSchedule }
  );

  const generateWhatsAppMessage = () => {
    if (!xtDetail || !settings) return "";

    let msg = settings.whatsappTemplate || "";
    msg = msg.replace(/{{ORG_NAME}}/g, settings.orgName || "");
    msg = msg.replace(/{{MODALITY}}/g, xtDetail.modality?.toUpperCase() || "");
    msg = msg.replace(/{{DATE}}/g, xtDetail.date || "");
    msg = msg.replace(/{{TIME_MX}}/g, xtDetail.timeMx || "");
    msg = msg.replace(/{{TIME_BR}}/g, xtDetail.timeBr || "");

    const teamsList = xtDetail.teams?.map((t, i) => `${String(i + 1).padStart(2, "0")} - ${t.teamName}`).join("\n") || "Nenhuma equipe inscrita";
    msg = msg.replace(/{{TEAMS_LIST}}/g, teamsList);

    const reservesList = xtDetail.reserves?.map((t, i) => `${String(i + 1).padStart(2, "0")} - ${t.teamName}`).join("\n") || "Nenhuma reserva";
    msg = msg.replace(/{{RESERVES_LIST}}/g, reservesList);

    msg = msg.replace(/{{DISCORD}}/g, xtDetail.discordLink || settings.discordLink || "");
    msg = msg.replace(/{{WHATSAPP}}/g, xtDetail.whatsappLink || settings.whatsappLink || "");

    return msg;
  };

  const handleCopy = () => {
    const msg = generateWhatsAppMessage();
    navigator.clipboard.writeText(msg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const msg = generateWhatsAppMessage();
    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  const getPosColor = (pos: number) => {
    if (pos === 1) return "text-yellow-400";
    if (pos === 2) return "text-gray-300";
    if (pos === 3) return "text-amber-600";
    return "text-[#8a8a9e]";
  };

  const getPosBg = (pos: number) => {
    if (pos === 1) return "bg-yellow-500/10 border-yellow-500/20";
    if (pos === 2) return "bg-gray-400/10 border-gray-400/20";
    if (pos === 3) return "bg-amber-600/10 border-amber-600/20";
    return "bg-[#1a1a24] border-[#2a2a3a]";
  };

  return (
    <MainLayout>
      {/* Header */}
      <div className="bg-[#12121a] border-b border-[#2a2a3a]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-2">
            <Dumbbell className="w-8 h-8 text-red-400" />
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#f0f0f5]">XTreinos Underground</h1>
          </div>
          <p className="text-[#8a8a9e]">Treinos de segunda a sexta às 21h (BRT)</p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
        {/* Tabs globais (visíveis quando nenhum xtreino selecionado) */}
        {!selectedXt && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab("info")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === "info"
                  ? "bg-red-500/10 text-red-400 border border-red-500/20"
                  : "bg-[#1a1a24] text-[#8a8a9e] border border-[#2a2a3a] hover:text-[#f0f0f5]"
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Xtreinos
            </button>
            <button
              onClick={() => setActiveTab("ranking")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === "ranking"
                  ? "bg-red-500/10 text-red-400 border border-red-500/20"
                  : "bg-[#1a1a24] text-[#8a8a9e] border border-[#2a2a3a] hover:text-[#f0f0f5]"
              }`}
            >
              <Trophy className="w-4 h-4 inline mr-2" />
              Rankings
            </button>
            <button
              onClick={() => setShowSchedule(!showSchedule)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                showSchedule
                  ? "bg-red-500/10 text-red-400 border border-red-500/20"
                  : "bg-[#1a1a24] text-[#8a8a9e] border border-[#2a2a3a] hover:text-[#f0f0f5]"
              }`}
            >
              <CalendarDays className="w-4 h-4 inline mr-2" />
              Agenda
            </button>
          </div>
        )}

        {/* Agenda de xtreinos */}
        {showSchedule && !selectedXt && (
          <div className="mb-8 bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#2a2a3a]">
              <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-red-400" />
                Agenda de Xtreinos — Junho/2026
              </h3>
            </div>
            <div className="divide-y divide-[#2a2a3a]">
              {scheduleList?.map((s) => (
                <div
                  key={s.id}
                  className={`flex items-center justify-between px-6 py-3 ${
                    s.status === "completed" ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-2 h-2 rounded-full ${
                      s.status === "completed" ? "bg-green-500" : "bg-blue-400"
                    }`} />
                    <span className="text-sm text-[#f0f0f5] font-medium">{s.date}</span>
                    <span className="text-xs text-[#5a5a6e]">{s.dayOfWeek}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-[#8a8a9e] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {s.timeBr}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      s.status === "completed"
                        ? "bg-green-500/10 text-green-400"
                        : "bg-blue-500/10 text-blue-400"
                    }`}>
                      {s.status === "completed" ? "Realizado" : "Agendado"}
                    </span>
                  </div>
                </div>
              ))}
              {!scheduleList?.length && (
                <div className="px-6 py-8 text-center text-[#5a5a6e] text-sm">
                  Nenhum xtreino agendado
                </div>
              )}
            </div>
          </div>
        )}

        {/* Rankings globais */}
        {activeTab === "ranking" && !selectedXt && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Ranking de Times */}
            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#2a2a3a]">
                <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Ranking de Times — Xtreino
                </h3>
              </div>
              <div className="divide-y divide-[#2a2a3a]">
                {teamRanking?.map((t, i) => (
                  <div
                    key={t.teamName}
                    className={`flex items-center gap-4 px-6 py-3 ${getPosBg(i + 1)}`}
                  >
                    <span className={`w-8 text-center text-lg font-bold ${getPosColor(i + 1)}`}>
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#f0f0f5]">{t.teamName}</p>
                      <p className="text-xs text-[#5a5a6e]">
                        {t.participations} participações
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#f0f0f5]">{t.totalPoints} pts</p>
                      <p className="text-xs text-[#5a5a6e]">
                        Média Q1: {t.avgQ1?.toFixed(1) ?? "-"}
                      </p>
                    </div>
                  </div>
                ))}
                {!teamRanking?.length && (
                  <div className="px-6 py-8 text-center text-[#5a5a6e] text-sm">
                    Nenhum dado de ranking disponível
                  </div>
                )}
              </div>
            </div>

            {/* Ranking de Jogadores */}
            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#2a2a3a]">
                <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
                  <Target className="w-5 h-5 text-red-400" />
                  Ranking de Jogadores — Xtreino
                </h3>
              </div>
              <div className="divide-y divide-[#2a2a3a] max-h-[500px] overflow-y-auto">
                {playerRanking?.map((p, i) => (
                  <div
                    key={p.playerName}
                    className={`flex items-center gap-4 px-6 py-3 ${getPosBg(i + 1)}`}
                  >
                    <span className={`w-8 text-center text-lg font-bold ${getPosColor(i + 1)}`}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#f0f0f5] truncate">{p.playerName}</p>
                      <p className="text-xs text-[#5a5a6e]">{p.teamName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#f0f0f5]">{p.totalKills} kills</p>
                      <p className="text-xs text-[#5a5a6e]">
                        Média: {p.avgKills?.toFixed(1) ?? "-"}
                      </p>
                    </div>
                  </div>
                ))}
                {!playerRanking?.length && (
                  <div className="px-6 py-8 text-center text-[#5a5a6e] text-sm">
                    Nenhum dado de ranking disponível
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Lista de xtreinos */}
        {activeTab === "info" && !selectedXt && (
          <div className="space-y-4">
            {xtreinosList?.map((xt) => (
              <button
                key={xt.id}
                onClick={() => setSelectedXt(xt.id)}
                className="w-full text-left bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6 hover:border-[#3a3a4e] hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-[#f0f0f5]">{xt.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        xt.status === "aberto" ? "bg-blue-500/10 text-blue-400" :
                        xt.status === "encerrado" ? "bg-red-500/10 text-red-400" :
                        "bg-gray-500/10 text-gray-400"
                      }`}>
                        {xt.status === "aberto" ? "Aberto" : xt.status === "encerrado" ? "Encerrado" : xt.status}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#1a1a24] text-[#8a8a9e] border border-[#2a2a3a]">
                        {xt.modality?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-[#8a8a9e]">
                      <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {xt.date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> MX {xt.timeMx} / BR {xt.timeBr}</span>
                      <span className="flex items-center gap-1"><Users className="w-4 h-4" /> Max {xt.maxTeams} equipes</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
            {!xtreinosList?.length && (
              <div className="text-center py-12 text-[#5a5a6e]">
                <Dumbbell className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">Nenhum xtreino cadastrado</p>
                <p className="text-sm mt-1">Os xtreinos acontecem de segunda a sexta às 21h BRT</p>
              </div>
            )}
          </div>
        )}

        {/* Detalhe do xtreino selecionado */}
        {selectedXt && xtDetail && (
          <div>
            <button
              onClick={() => { setSelectedXt(null); setShowWhatsApp(false); setActiveTab("info"); }}
              className="mb-6 text-sm text-[#8a8a9e] hover:text-[#f0f0f5] transition-colors"
            >
              &larr; Voltar para lista
            </button>

            <div className="space-y-6">
              {/* Header do xtreino */}
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    xtDetail.status === "aberto" ? "bg-blue-500/10 text-blue-400" : "bg-red-500/10 text-red-400"
                  }`}>
                    {xtDetail.status === "aberto" ? "Aberto" : "Encerrado"}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#1a1a24] text-[#8a8a9e] border border-[#2a2a3a]">
                    {xtDetail.modality?.toUpperCase()}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-[#f0f0f5] mb-4">{xtDetail.name}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-[#5a5a6e] mb-1">Data</p>
                    <p className="text-[#f0f0f5] font-medium">{xtDetail.date}</p>
                  </div>
                  <div>
                    <p className="text-[#5a5a6e] mb-1">Horário MX</p>
                    <p className="text-[#f0f0f5] font-medium">{xtDetail.timeMx}</p>
                  </div>
                  <div>
                    <p className="text-[#5a5a6e] mb-1">Horário BR</p>
                    <p className="text-[#f0f0f5] font-medium">{xtDetail.timeBr}</p>
                  </div>
                  <div>
                    <p className="text-[#5a5a6e] mb-1">Vagas</p>
                    <p className="text-[#f0f0f5] font-medium">{xtDetail.teams?.length ?? 0}/{xtDetail.maxTeams}</p>
                  </div>
                </div>

                {xtDetail.rules && (
                  <div className="mt-4 pt-4 border-t border-[#2a2a3a]">
                    <p className="text-[#5a5a6e] text-sm mb-1">Regras</p>
                    <pre className="text-sm text-[#8a8a9e] whitespace-pre-wrap font-sans">{xtDetail.rules}</pre>
                  </div>
                )}
              </div>

              {/* Tabs do detalhe */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setActiveTab("info")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === "info"
                      ? "bg-red-500/10 text-red-400 border border-red-500/20"
                      : "bg-[#1a1a24] text-[#8a8a9e] border border-[#2a2a3a] hover:text-[#f0f0f5]"
                  }`}
                >
                  <Users className="w-4 h-4 inline mr-2" />
                  Equipes
                </button>
                <button
                  onClick={() => setActiveTab("results")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === "results"
                      ? "bg-red-500/10 text-red-400 border border-red-500/20"
                      : "bg-[#1a1a24] text-[#8a8a9e] border border-[#2a2a3a] hover:text-[#f0f0f5]"
                  }`}
                >
                  <BarChart3 className="w-4 h-4 inline mr-2" />
                  Resultados
                </button>
                <button
                  onClick={() => setActiveTab("players")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === "players"
                      ? "bg-red-500/10 text-red-400 border border-red-500/20"
                      : "bg-[#1a1a24] text-[#8a8a9e] border border-[#2a2a3a] hover:text-[#f0f0f5]"
                  }`}
                >
                  <Target className="w-4 h-4 inline mr-2" />
                  Jogadores
                </button>
              </div>

              {/* Tab: Equipes */}
              {activeTab === "info" && (
                <>
                  {/* Equipes Inscritas */}
                  <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
                    <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center justify-between">
                      <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-400" />
                        Equipes Inscritas ({xtDetail.teams?.length ?? 0})
                      </h3>
                    </div>
                    {xtDetail.teams && xtDetail.teams.length > 0 ? (
                      <div className="divide-y divide-[#2a2a3a]">
                        {xtDetail.teams.map((t, i) => (
                          <div key={t.id} className="flex items-center gap-4 px-6 py-3 hover:bg-[#1a1a24]">
                            <span className="w-8 text-center text-sm font-bold text-[#5a5a6e]">{i + 1}</span>
                            <span className="text-sm text-[#f0f0f5] font-medium">{t.teamName}</span>
                            {t.teamTag && <span className="text-xs text-[#5a5a6e]">[{t.teamTag}]</span>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="px-6 py-8 text-center text-[#5a5a6e] text-sm">Nenhuma equipe inscrita ainda</div>
                    )}
                  </div>

                  {/* Reservas */}
                  {xtDetail.reserves && xtDetail.reserves.length > 0 && (
                    <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
                      <div className="px-6 py-4 border-b border-[#2a2a3a]">
                        <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
                          <Users className="w-5 h-5 text-amber-400" />
                          Reservas ({xtDetail.reserves.length})
                        </h3>
                      </div>
                      <div className="divide-y divide-[#2a2a3a]">
                        {xtDetail.reserves.map((t, i) => (
                          <div key={t.id} className="flex items-center gap-4 px-6 py-3 hover:bg-[#1a1a24]">
                            <span className="w-8 text-center text-sm font-bold text-[#5a5a6e]">{i + 1}</span>
                            <span className="text-sm text-[#8a8a9e]">{t.teamName}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* WhatsApp Generator */}
                  <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
                    <button
                      onClick={() => setShowWhatsApp(!showWhatsApp)}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition-all"
                    >
                      <MessageSquare className="w-5 h-5" />
                      {showWhatsApp ? "Fechar" : "Gerar Mensagem WhatsApp"}
                    </button>

                    {showWhatsApp && (
                      <div className="mt-4 space-y-4">
                        <div className="bg-[#0a0a0f] rounded-lg p-4 border border-[#2a2a3a]">
                          <pre className="text-sm text-[#8a8a9e] whitespace-pre-wrap font-sans">{generateWhatsAppMessage()}</pre>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={handleCopy}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm font-medium hover:bg-[#22222e] transition-all"
                          >
                            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                            {copied ? "Copiado!" : "Copiar"}
                          </button>
                          <button
                            onClick={handleWhatsApp}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-all"
                          >
                            <MessageSquare className="w-4 h-4" />
                            Enviar via WhatsApp
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Tab: Resultados */}
              {activeTab === "results" && (
                <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#2a2a3a]">
                    <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-400" />
                      Colocações por Quadrimestre
                    </h3>
                  </div>
                  {xtDetail.results && xtDetail.results.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-[#2a2a3a]">
                            <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Time</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Q1</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Q2</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Q3</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2a2a3a]">
                          {xtDetail.results.map((r) => (
                            <tr key={r.id} className="hover:bg-[#1a1a24]">
                              <td className="px-6 py-3 text-sm font-medium text-[#f0f0f5]">{r.teamName}</td>
                              <td className="px-6 py-3 text-center">
                                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                                  r.q1Pos === 1 ? "bg-yellow-500/20 text-yellow-400" :
                                  r.q1Pos === 2 ? "bg-gray-400/20 text-gray-300" :
                                  r.q1Pos === 3 ? "bg-amber-600/20 text-amber-500" :
                                  "bg-[#1a1a24] text-[#8a8a9e]"
                                }`}>
                                  {r.q1Pos ?? "-"}
                                </span>
                              </td>
                              <td className="px-6 py-3 text-center">
                                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                                  r.q2Pos === 1 ? "bg-yellow-500/20 text-yellow-400" :
                                  r.q2Pos === 2 ? "bg-gray-400/20 text-gray-300" :
                                  r.q2Pos === 3 ? "bg-amber-600/20 text-amber-500" :
                                  "bg-[#1a1a24] text-[#8a8a9e]"
                                }`}>
                                  {r.q2Pos ?? "-"}
                                </span>
                              </td>
                              <td className="px-6 py-3 text-center">
                                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                                  r.q3Pos === 1 ? "bg-yellow-500/20 text-yellow-400" :
                                  r.q3Pos === 2 ? "bg-gray-400/20 text-gray-300" :
                                  r.q3Pos === 3 ? "bg-amber-600/20 text-amber-500" :
                                  "bg-[#1a1a24] text-[#8a8a9e]"
                                }`}>
                                  {r.q3Pos ?? "-"}
                                </span>
                              </td>
                              <td className="px-6 py-3 text-center text-sm font-bold text-[#f0f0f5]">
                                {r.totalPoints ?? "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="px-6 py-8 text-center text-[#5a5a6e] text-sm">
                      Nenhum resultado registrado para este xtreino
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Jogadores */}
              {activeTab === "players" && (
                <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#2a2a3a]">
                    <h3 className="font-bold text-[#f0f0f5] flex items-center gap-2">
                      <Target className="w-5 h-5 text-red-400" />
                      Estatísticas dos Jogadores
                    </h3>
                  </div>
                  {xtDetail.playerStats && xtDetail.playerStats.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-[#2a2a3a]">
                            <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Jogador</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Time</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Q1</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Q2</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Q3</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2a2a3a]">
                          {xtDetail.playerStats.map((p) => (
                            <tr key={p.id} className="hover:bg-[#1a1a24]">
                              <td className="px-6 py-3 text-sm font-medium text-[#f0f0f5]">{p.playerName}</td>
                              <td className="px-6 py-3 text-sm text-[#8a8a9e]">{p.teamName}</td>
                              <td className="px-6 py-3 text-center text-sm text-[#8a8a9e]">{p.q1Kills}</td>
                              <td className="px-6 py-3 text-center text-sm text-[#8a8a9e]">{p.q2Kills}</td>
                              <td className="px-6 py-3 text-center text-sm text-[#8a8a9e]">{p.q3Kills}</td>
                              <td className="px-6 py-3 text-center">
                                <span className="text-sm font-bold text-red-400">{p.totalKills}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="px-6 py-8 text-center text-[#5a5a6e] text-sm">
                      Nenhuma estatística de jogador registrada
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}