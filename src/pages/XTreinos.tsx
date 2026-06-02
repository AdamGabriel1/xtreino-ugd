import { useState } from "react";
import { Dumbbell, Calendar, Clock, Users, MessageSquare, Copy, Check } from "lucide-react";
import { trpc } from "@/providers/trpc";
import MainLayout from "@/layout/MainLayout";

export default function XTreinos() {
  const [selectedXt, setSelectedXt] = useState<number | null>(null);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: xtreinosList } = trpc.xtreinos.list.useQuery();
  const { data: xtDetail } = trpc.xtreinos.getById.useQuery(
    { id: selectedXt! },
    { enabled: !!selectedXt }
  );
  const { data: settings } = trpc.settings.get.useQuery();

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

  return (
    <MainLayout>
      <div className="bg-[#12121a] border-b border-[#2a2a3a]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-2">
            <Dumbbell className="w-8 h-8 text-red-400" />
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#f0f0f5]">XTreinos</h1>
          </div>
          <p className="text-[#8a8a9e]">Treinos organizados para equipes</p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
        {!selectedXt ? (
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
          </div>
        ) : (
          <div>
            <button
              onClick={() => { setSelectedXt(null); setShowWhatsApp(false); }}
              className="mb-6 text-sm text-[#8a8a9e] hover:text-[#f0f0f5] transition-colors"
            >
              &larr; Voltar
            </button>

            {xtDetail && (
              <div className="space-y-6">
                {/* Header */}
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
                      <p className="text-[#5a5a6e] mb-1">Horario MX</p>
                      <p className="text-[#f0f0f5] font-medium">{xtDetail.timeMx}</p>
                    </div>
                    <div>
                      <p className="text-[#5a5a6e] mb-1">Horario BR</p>
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

                {/* Teams */}
                <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center justify-between">
                    <h3 className="font-bold text-[#f0f0f5]">Equipes Inscritas ({xtDetail.teams?.length ?? 0})</h3>
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

                {/* Reserves */}
                {xtDetail.reserves && xtDetail.reserves.length > 0 && (
                  <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
                    <div className="px-6 py-4 border-b border-[#2a2a3a]">
                      <h3 className="font-bold text-[#f0f0f5]">Reservas ({xtDetail.reserves.length})</h3>
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
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
