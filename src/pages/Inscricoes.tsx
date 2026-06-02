import { useState } from "react";
import { ClipboardList, Plus, Minus, Send, CheckCircle } from "lucide-react";
import { trpc } from "@/providers/trpc";
import MainLayout from "@/layout/MainLayout";
import { toast } from "sonner";

export default function Inscricoes() {
  const [formData, setFormData] = useState({
    type: "squad",
    teamName: "",
    teamTag: "",
    captainName: "",
    captainDiscord: "",
    whatsapp: "",
    teamLogo: "",
    eventType: "campeonato",
    eventId: "",
  });
  const [players, setPlayers] = useState([{ nickname: "", uid: "", discord: "" }]);
  const [reserves, setReserves] = useState([{ nickname: "", uid: "", discord: "" }]);
  const [submitted, setSubmitted] = useState(false);

  const { data: championships } = trpc.championships.list.useQuery();
  const { data: xtreinosList } = trpc.xtreinos.list.useQuery();

  const createRegistration = trpc.registrations.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Inscricao enviada com sucesso!");
    },
    onError: (err) => {
      toast.error("Erro ao enviar inscricao: " + err.message);
    },
  });

  const handleAddPlayer = () => setPlayers([...players, { nickname: "", uid: "", discord: "" }]);
  const handleRemovePlayer = (i: number) => setPlayers(players.filter((_, idx) => idx !== i));
  const handlePlayerChange = (i: number, field: string, value: string) => {
    const updated = [...players];
    updated[i] = { ...updated[i], [field]: value };
    setPlayers(updated);
  };

  const handleAddReserve = () => setReserves([...reserves, { nickname: "", uid: "", discord: "" }]);
  const handleRemoveReserve = (i: number) => setReserves(reserves.filter((_, idx) => idx !== i));
  const handleReserveChange = (i: number, field: string, value: string) => {
    const updated = [...reserves];
    updated[i] = { ...updated[i], [field]: value };
    setReserves(updated);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, teamLogo: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.teamName || !formData.eventId) {
      toast.error("Preencha todos os campos obrigatorios");
      return;
    }

    createRegistration.mutate({
      ...formData,
      eventId: parseInt(formData.eventId),
      playersData: JSON.stringify(players),
      reservesData: JSON.stringify(reserves),
    });
  };

  if (submitted) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#f0f0f5] mb-2">Inscricao Enviada!</h2>
          <p className="text-[#8a8a9e] mb-6">Sua inscricao foi recebida e sera analisada pela equipe.</p>
          <button
            onClick={() => {
              setSubmitted(false);
              setFormData({ type: "squad", teamName: "", teamTag: "", captainName: "", captainDiscord: "", whatsapp: "", teamLogo: "", eventType: "campeonato", eventId: "" });
              setPlayers([{ nickname: "", uid: "", discord: "" }]);
              setReserves([{ nickname: "", uid: "", discord: "" }]);
            }}
            className="px-6 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-all"
          >
            Nova Inscricao
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-[#12121a] border-b border-[#2a2a3a]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-2">
            <ClipboardList className="w-8 h-8 text-red-400" />
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#f0f0f5]">Inscricoes</h1>
          </div>
          <p className="text-[#8a8a9e]">Inscreva-se em campeonatos e xtreinos</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Selection */}
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
            <h3 className="font-bold text-[#f0f0f5] mb-4">Evento</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#8a8a9e] mb-2">Tipo de Evento</label>
                <select
                  value={formData.eventType}
                  onChange={(e) => setFormData({ ...formData, eventType: e.target.value, eventId: "" })}
                  className="w-full px-4 py-2.5 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50"
                >
                  <option value="campeonato">Campeonato</option>
                  <option value="xtreino">XTreino</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#8a8a9e] mb-2">Evento *</label>
                <select
                  value={formData.eventId}
                  onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50"
                >
                  <option value="">Selecione...</option>
                  {formData.eventType === "campeonato"
                    ? championships?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)
                    : xtreinosList?.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)
                  }
                </select>
              </div>
            </div>
          </div>

          {/* Team Info */}
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
            <h3 className="font-bold text-[#f0f0f5] mb-4">Informacoes da Equipe</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#8a8a9e] mb-2">Tipo de Inscricao</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50"
                >
                  <option value="solo">Solo</option>
                  <option value="duo">Duo</option>
                  <option value="squad">Squad</option>
                  <option value="4v4">4v4</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#8a8a9e] mb-2">Nome da Equipe *</label>
                <input
                  type="text"
                  value={formData.teamName}
                  onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm placeholder-[#5a5a6e] focus:outline-none focus:border-red-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-[#8a8a9e] mb-2">Tag</label>
                <input
                  type="text"
                  value={formData.teamTag}
                  onChange={(e) => setFormData({ ...formData, teamTag: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm placeholder-[#5a5a6e] focus:outline-none focus:border-red-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-[#8a8a9e] mb-2">Logo da Equipe</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="w-full px-4 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#8a8a9e] text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-red-500 file:text-white file:text-xs"
                />
              </div>
            </div>
          </div>

          {/* Captain Info */}
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
            <h3 className="font-bold text-[#f0f0f5] mb-4">Capitao</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-[#8a8a9e] mb-2">Nome</label>
                <input
                  type="text"
                  value={formData.captainName}
                  onChange={(e) => setFormData({ ...formData, captainName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm placeholder-[#5a5a6e] focus:outline-none focus:border-red-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-[#8a8a9e] mb-2">Discord</label>
                <input
                  type="text"
                  value={formData.captainDiscord}
                  onChange={(e) => setFormData({ ...formData, captainDiscord: e.target.value })}
                  placeholder="usuario#1234"
                  className="w-full px-4 py-2.5 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm placeholder-[#5a5a6e] focus:outline-none focus:border-red-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-[#8a8a9e] mb-2">WhatsApp</label>
                <input
                  type="text"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="5511999999999"
                  className="w-full px-4 py-2.5 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm placeholder-[#5a5a6e] focus:outline-none focus:border-red-500/50"
                />
              </div>
            </div>
          </div>

          {/* Players */}
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#f0f0f5]">Jogadores</h3>
              <button
                type="button"
                onClick={handleAddPlayer}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-sm hover:bg-red-500/20 transition-all"
              >
                <Plus className="w-4 h-4" /> Adicionar
              </button>
            </div>
            {players.map((p, i) => (
              <div key={i} className="grid sm:grid-cols-3 gap-3 mb-3 items-end">
                <div>
                  <label className="block text-xs text-[#5a5a6e] mb-1">Nickname</label>
                  <input
                    type="text"
                    value={p.nickname}
                    onChange={(e) => handlePlayerChange(i, "nickname", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#5a5a6e] mb-1">UID</label>
                  <input
                    type="text"
                    value={p.uid}
                    onChange={(e) => handlePlayerChange(i, "uid", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs text-[#5a5a6e] mb-1">Discord</label>
                    <input
                      type="text"
                      value={p.discord}
                      onChange={(e) => handlePlayerChange(i, "discord", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50"
                    />
                  </div>
                  {players.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePlayer(i)}
                      className="px-2 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Reserves */}
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#f0f0f5]">Reservas</h3>
              <button
                type="button"
                onClick={handleAddReserve}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1a1a24] text-[#8a8a9e] text-sm hover:bg-[#22222e] transition-all border border-[#2a2a3a]"
              >
                <Plus className="w-4 h-4" /> Adicionar
              </button>
            </div>
            {reserves.map((p, i) => (
              <div key={i} className="grid sm:grid-cols-3 gap-3 mb-3 items-end">
                <div>
                  <label className="block text-xs text-[#5a5a6e] mb-1">Nickname</label>
                  <input
                    type="text"
                    value={p.nickname}
                    onChange={(e) => handleReserveChange(i, "nickname", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#5a5a6e] mb-1">UID</label>
                  <input
                    type="text"
                    value={p.uid}
                    onChange={(e) => handleReserveChange(i, "uid", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs text-[#5a5a6e] mb-1">Discord</label>
                    <input
                      type="text"
                      value={p.discord}
                      onChange={(e) => handleReserveChange(i, "discord", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50"
                    />
                  </div>
                  {reserves.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveReserve(i)}
                      className="px-2 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={createRegistration.isPending}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-all disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
            {createRegistration.isPending ? "Enviando..." : "Confirmar Inscricao"}
          </button>
        </form>
      </div>
    </MainLayout>
  );
}
