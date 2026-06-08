import { useState } from "react";
import { Plus, Pencil, Trash2, X, Check, Target, BarChart3, CalendarDays } from "lucide-react";
import { trpc } from "@/providers/trpc";
import AdminLayout from "@/layout/AdminLayout";
import { toast } from "sonner";

export default function AdminXTreinos() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", date: "", timeMx: "", timeBr: "21:00", modality: "squad", maxTeams: 20, rules: "", discordLink: "", whatsappLink: "", status: "aberto" });
  const [activeTab, setActiveTab] = useState<"list" | "results" | "players" | "schedule">("list");
  const [selectedXtForResults, setSelectedXtForResults] = useState<number | null>(null);
  const [showResultForm, setShowResultForm] = useState(false);
  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [resultForm, setResultForm] = useState({ xtreinoId: 0, date: "", teamName: "", q1Pos: 0, q2Pos: 0, q3Pos: 0, totalPoints: 0 });
  const [playerForm, setPlayerForm] = useState({ xtreinoId: 0, date: "", teamName: "", playerName: "", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 });
  const [scheduleForm, setScheduleForm] = useState({ date: "", dayOfWeek: "", timeBr: "21:00", status: "scheduled", notes: "" });

  const utils = trpc.useUtils();
  const { data: xtreinosList } = trpc.xtreinos.list.useQuery();
  const { data: xtDetail } = trpc.xtreinos.getById.useQuery(
    { id: selectedXtForResults! },
    { enabled: !!selectedXtForResults }
  );
  const { data: allResults } = trpc.xtreinos.listResults.useQuery();
  const { data: allPlayerStats } = trpc.xtreinos.listPlayerStats.useQuery();
  const { data: scheduleList } = trpc.xtreinos.schedule.list.useQuery();

  const create = trpc.xtreinos.create.useMutation({
    onSuccess: () => { utils.xtreinos.list.invalidate(); setShowForm(false); resetForm(); toast.success("XTreino criado!"); },
    onError: (e) => toast.error(e.message),
  });
  const update = trpc.xtreinos.update.useMutation({
    onSuccess: () => { utils.xtreinos.list.invalidate(); setShowForm(false); setEditing(null); resetForm(); toast.success("XTreino atualizado!"); },
    onError: (e) => toast.error(e.message),
  });
  const remove = trpc.xtreinos.delete.useMutation({
    onSuccess: () => { utils.xtreinos.list.invalidate(); toast.success("XTreino removido!"); },
    onError: (e) => toast.error(e.message),
  });

  const addResult = trpc.xtreinos.addResult.useMutation({
    onSuccess: () => {
      utils.xtreinos.listResults.invalidate();
      if (selectedXtForResults) utils.xtreinos.getById.invalidate({ id: selectedXtForResults });
      setShowResultForm(false);
      resetResultForm();
      toast.success("Resultado adicionado!");
    },
    onError: (e) => toast.error(e.message),
  });

  const addPlayerStats = trpc.xtreinos.addPlayerStats.useMutation({
    onSuccess: () => {
      utils.xtreinos.listPlayerStats.invalidate();
      if (selectedXtForResults) utils.xtreinos.getById.invalidate({ id: selectedXtForResults });
      setShowPlayerForm(false);
      resetPlayerForm();
      toast.success("Stats de jogador adicionadas!");
    },
    onError: (e) => toast.error(e.message),
  });

  const createSchedule = trpc.xtreinos.schedule.create.useMutation({
    onSuccess: () => { utils.xtreinos.schedule.list.invalidate(); setShowScheduleForm(false); resetScheduleForm(); toast.success("Agendamento criado!"); },
    onError: (e) => toast.error(e.message),
  });

  const generateMonthSchedule = trpc.xtreinos.schedule.generateMonth.useMutation({
    onSuccess: (data) => { utils.xtreinos.schedule.list.invalidate(); toast.success(`${data.generated} xtreinos agendados!`); },
    onError: (e) => toast.error(e.message),
  });

  const resetForm = () => setForm({ name: "", date: "", timeMx: "", timeBr: "21:00", modality: "squad", maxTeams: 20, rules: "", discordLink: "", whatsappLink: "", status: "aberto" });
  const resetResultForm = () => setResultForm({ xtreinoId: 0, date: "", teamName: "", q1Pos: 0, q2Pos: 0, q3Pos: 0, totalPoints: 0 });
  const resetPlayerForm = () => setPlayerForm({ xtreinoId: 0, date: "", teamName: "", playerName: "", q1Kills: 0, q2Kills: 0, q3Kills: 0, totalKills: 0 });
  const resetScheduleForm = () => setScheduleForm({ date: "", dayOfWeek: "", timeBr: "21:00", status: "scheduled", notes: "" });

  const handleEdit = (x: NonNullable<typeof xtreinosList>[0]) => {
    setEditing(x.id);
    setForm({ name: x.name, date: x.date, timeMx: x.timeMx ?? "", timeBr: x.timeBr ?? "21:00", modality: x.modality, maxTeams: x.maxTeams, rules: x.rules ?? "", discordLink: x.discordLink ?? "", whatsappLink: x.whatsappLink ?? "", status: x.status });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.date) { toast.error("Nome e data sao obrigatorios"); return; }
    if (editing) update.mutate({ id: editing, ...form });
    else create.mutate(form);
  };

  const handleAddResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resultForm.teamName || !resultForm.date) { toast.error("Time e data sao obrigatorios"); return; }
    addResult.mutate(resultForm);
  };

  const handleAddPlayerStats = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerForm.playerName || !playerForm.teamName || !playerForm.date) { toast.error("Jogador, time e data sao obrigatorios"); return; }
    addPlayerStats.mutate(playerForm);
  };

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleForm.date || !scheduleForm.dayOfWeek) { toast.error("Data e dia da semana sao obrigatorios"); return; }
    createSchedule.mutate(scheduleForm);
  };

  const statusColors: Record<string, string> = { aberto: "bg-blue-500/10 text-blue-400", encerrado: "bg-red-500/10 text-red-400", cancelado: "bg-gray-500/10 text-gray-400" };

  const getPosColor = (pos: number) => {
    if (pos === 1) return "text-yellow-400";
    if (pos === 2) return "text-gray-300";
    if (pos === 3) return "text-amber-600";
    return "text-[#8a8a9e]";
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#f0f0f5] mb-1">XTreinos Underground</h1>
            <p className="text-[#8a8a9e] text-sm">Gerencie xtreinos, resultados, jogadores e agenda</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button onClick={() => setActiveTab("list")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === "list" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-[#1a1a24] text-[#8a8a9e] border border-[#2a2a3a] hover:text-[#f0f0f5]"}`}>
            <CalendarDays className="w-4 h-4 inline mr-2" />Xtreinos
          </button>
          <button onClick={() => setActiveTab("results")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === "results" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-[#1a1a24] text-[#8a8a9e] border border-[#2a2a3a] hover:text-[#f0f0f5]"}`}>
            <BarChart3 className="w-4 h-4 inline mr-2" />Resultados
          </button>
          <button onClick={() => setActiveTab("players")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === "players" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-[#1a1a24] text-[#8a8a9e] border border-[#2a2a3a] hover:text-[#f0f0f5]"}`}>
            <Target className="w-4 h-4 inline mr-2" />Jogadores
          </button>
          <button onClick={() => setActiveTab("schedule")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === "schedule" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-[#1a1a24] text-[#8a8a9e] border border-[#2a2a3a] hover:text-[#f0f0f5]"}`}>
            <CalendarDays className="w-4 h-4 inline mr-2" />Agenda
          </button>
        </div>

        {/* TAB: LISTA DE XTREINOS */}
        {activeTab === "list" && (
          <>
            <div className="flex justify-between items-center">
              <button onClick={() => { setShowForm(true); setEditing(null); resetForm(); }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all">
                <Plus className="w-4 h-4" /> Novo XTreino
              </button>
            </div>

            {showForm && (
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[#f0f0f5]">{editing ? "Editar" : "Novo"} XTreino</h3>
                  <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-[#1a1a24] text-[#5a5a6e]"><X className="w-4 h-4" /></button>
                </div>
                <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">Nome *</label>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50" />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">Data *</label>
                    <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50" />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">Horario MX</label>
                    <input value={form.timeMx} onChange={(e) => setForm({ ...form, timeMx: e.target.value })} placeholder="5:00 PM"
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50" />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">Horario BR *</label>
                    <input value={form.timeBr} onChange={(e) => setForm({ ...form, timeBr: e.target.value })} placeholder="21:00" required
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50" />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">Modalidade</label>
                    <select value={form.modality} onChange={(e) => setForm({ ...form, modality: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50">
                      <option value="solo">Solo</option><option value="duo">Duo</option><option value="squad">Squad</option><option value="4v4">4v4</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">Max Equipes</label>
                    <input type="number" value={form.maxTeams} onChange={(e) => setForm({ ...form, maxTeams: parseInt(e.target.value) || 20 })}
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50" />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">Status</label>
                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50">
                      <option value="aberto">Aberto</option><option value="encerrado">Encerrado</option><option value="cancelado">Cancelado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">Discord</label>
                    <input value={form.discordLink} onChange={(e) => setForm({ ...form, discordLink: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50" />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">WhatsApp</label>
                    <input value={form.whatsappLink} onChange={(e) => setForm({ ...form, whatsappLink: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm text-[#8a8a9e] mb-1">Regras</label>
                    <textarea value={form.rules} onChange={(e) => setForm({ ...form, rules: e.target.value })} rows={3}
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50" />
                  </div>
                  <div className="flex items-end gap-2">
                    <button type="submit" disabled={create.isPending || update.isPending}
                      className="px-6 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all disabled:opacity-50">
                      {create.isPending || update.isPending ? "Salvando..." : <span className="flex items-center gap-1"><Check className="w-4 h-4" /> Salvar</span>}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2a2a3a]">
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Nome</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Data</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Horarios</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Modo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Acoes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2a2a3a]">
                    {xtreinosList?.map((x) => (
                      <tr key={x.id} className="hover:bg-[#1a1a24]">
                        <td className="px-6 py-3 text-sm font-medium text-[#f0f0f5]">{x.name}</td>
                        <td className="px-6 py-3 text-sm text-[#8a8a9e]">{x.date}</td>
                        <td className="px-6 py-3 text-sm text-[#8a8a9e]">MX {x.timeMx} / BR {x.timeBr}</td>
                        <td className="px-6 py-3 text-sm text-[#8a8a9e]">{x.modality?.toUpperCase()}</td>
                        <td className="px-6 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[x.status]}`}>{x.status}</span></td>
                        <td className="px-6 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => handleEdit(x)} className="p-1.5 rounded hover:bg-blue-500/10 text-blue-400"><Pencil className="w-4 h-4" /></button>
                            <button onClick={() => { if (confirm("Remover?")) remove.mutate({ id: x.id }); }} className="p-1.5 rounded hover:bg-red-500/10 text-red-400"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!xtreinosList?.length && (
                <div className="px-6 py-8 text-center text-[#5a5a6e] text-sm">Nenhum xtreino cadastrado</div>
              )}
            </div>
          </>
        )}

        {/* TAB: RESULTADOS */}
        {activeTab === "results" && (
          <>
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
              <div className="flex gap-2">
                <select
                  value={selectedXtForResults ?? ""}
                  onChange={(e) => setSelectedXtForResults(e.target.value ? parseInt(e.target.value) : null)}
                  className="px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50"
                >
                  <option value="">Todos os xtreinos</option>
                  {xtreinosList?.map((x) => (
                    <option key={x.id} value={x.id}>{x.name} ({x.date})</option>
                  ))}
                </select>
                <button onClick={() => { setShowResultForm(true); resetResultForm(); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all">
                  <Plus className="w-4 h-4" /> Add Resultado
                </button>
              </div>
            </div>

            {showResultForm && (
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[#f0f0f5]">Adicionar Resultado</h3>
                  <button onClick={() => setShowResultForm(false)} className="p-1 rounded hover:bg-[#1a1a24] text-[#5a5a6e]"><X className="w-4 h-4" /></button>
                </div>
                <form onSubmit={handleAddResult} className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">XTreino ID</label>
                    <input type="number" value={resultForm.xtreinoId} onChange={(e) => setResultForm({ ...resultForm, xtreinoId: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">Data *</label>
                    <input type="date" value={resultForm.date} onChange={(e) => setResultForm({ ...resultForm, date: e.target.value })} required
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">Time *</label>
                    <input value={resultForm.teamName} onChange={(e) => setResultForm({ ...resultForm, teamName: e.target.value })} required
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">Q1 Pos</label>
                    <input type="number" value={resultForm.q1Pos} onChange={(e) => setResultForm({ ...resultForm, q1Pos: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">Q2 Pos</label>
                    <input type="number" value={resultForm.q2Pos} onChange={(e) => setResultForm({ ...resultForm, q2Pos: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">Q3 Pos</label>
                    <input type="number" value={resultForm.q3Pos} onChange={(e) => setResultForm({ ...resultForm, q3Pos: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm" />
                  </div>
                  <div className="sm:col-span-3 flex items-end">
                    <button type="submit" disabled={addResult.isPending}
                      className="px-6 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all disabled:opacity-50">
                      {addResult.isPending ? "Salvando..." : <span className="flex items-center gap-1"><Check className="w-4 h-4" /> Adicionar</span>}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Tabela de resultados */}
            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2a2a3a]">
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Data</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Time</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Q1</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Q2</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Q3</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2a2a3a]">
                    {(selectedXtForResults ? xtDetail?.results : allResults)?.map((r) => (
                      <tr key={r.id} className="hover:bg-[#1a1a24]">
                        <td className="px-6 py-3 text-sm text-[#8a8a9e]">{r.date}</td>
                        <td className="px-6 py-3 text-sm font-medium text-[#f0f0f5]">{r.teamName}</td>
                        <td className="px-6 py-3 text-center">
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                            r.q1Pos === 1 ? "bg-yellow-500/20 text-yellow-400" :
                            r.q1Pos === 2 ? "bg-gray-400/20 text-gray-300" :
                            r.q1Pos === 3 ? "bg-amber-600/20 text-amber-500" :
                            "bg-[#1a1a24] text-[#8a8a9e]"
                          }`}>{r.q1Pos ?? "-"}</span>
                        </td>
                        <td className="px-6 py-3 text-center">
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                            r.q2Pos === 1 ? "bg-yellow-500/20 text-yellow-400" :
                            r.q2Pos === 2 ? "bg-gray-400/20 text-gray-300" :
                            r.q2Pos === 3 ? "bg-amber-600/20 text-amber-500" :
                            "bg-[#1a1a24] text-[#8a8a9e]"
                          }`}>{r.q2Pos ?? "-"}</span>
                        </td>
                        <td className="px-6 py-3 text-center">
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                            r.q3Pos === 1 ? "bg-yellow-500/20 text-yellow-400" :
                            r.q3Pos === 2 ? "bg-gray-400/20 text-gray-300" :
                            r.q3Pos === 3 ? "bg-amber-600/20 text-amber-500" :
                            "bg-[#1a1a24] text-[#8a8a9e]"
                          }`}>{r.q3Pos ?? "-"}</span>
                        </td>
                        <td className="px-6 py-3 text-center text-sm font-bold text-[#f0f0f5]">{r.totalPoints ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!(selectedXtForResults ? xtDetail?.results : allResults)?.length && (
                <div className="px-6 py-8 text-center text-[#5a5a6e] text-sm">Nenhum resultado registrado</div>
              )}
            </div>
          </>
        )}

        {/* TAB: JOGADORES */}
        {activeTab === "players" && (
          <>
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
              <div className="flex gap-2">
                <select
                  value={selectedXtForResults ?? ""}
                  onChange={(e) => setSelectedXtForResults(e.target.value ? parseInt(e.target.value) : null)}
                  className="px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-red-500/50"
                >
                  <option value="">Todos os xtreinos</option>
                  {xtreinosList?.map((x) => (
                    <option key={x.id} value={x.id}>{x.name} ({x.date})</option>
                  ))}
                </select>
                <button onClick={() => { setShowPlayerForm(true); resetPlayerForm(); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all">
                  <Plus className="w-4 h-4" /> Add Jogador
                </button>
              </div>
            </div>

            {showPlayerForm && (
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[#f0f0f5]">Adicionar Stats de Jogador</h3>
                  <button onClick={() => setShowPlayerForm(false)} className="p-1 rounded hover:bg-[#1a1a24] text-[#5a5a6e]"><X className="w-4 h-4" /></button>
                </div>
                <form onSubmit={handleAddPlayerStats} className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">XTreino ID</label>
                    <input type="number" value={playerForm.xtreinoId} onChange={(e) => setPlayerForm({ ...playerForm, xtreinoId: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">Data *</label>
                    <input type="date" value={playerForm.date} onChange={(e) => setPlayerForm({ ...playerForm, date: e.target.value })} required
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">Time *</label>
                    <input value={playerForm.teamName} onChange={(e) => setPlayerForm({ ...playerForm, teamName: e.target.value })} required
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">Jogador *</label>
                    <input value={playerForm.playerName} onChange={(e) => setPlayerForm({ ...playerForm, playerName: e.target.value })} required
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">Q1 Kills</label>
                    <input type="number" value={playerForm.q1Kills} onChange={(e) => setPlayerForm({ ...playerForm, q1Kills: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">Q2 Kills</label>
                    <input type="number" value={playerForm.q2Kills} onChange={(e) => setPlayerForm({ ...playerForm, q2Kills: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">Q3 Kills</label>
                    <input type="number" value={playerForm.q3Kills} onChange={(e) => setPlayerForm({ ...playerForm, q3Kills: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">Total Kills</label>
                    <input type="number" value={playerForm.totalKills} onChange={(e) => setPlayerForm({ ...playerForm, totalKills: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm" />
                  </div>
                  <div className="sm:col-span-3 flex items-end">
                    <button type="submit" disabled={addPlayerStats.isPending}
                      className="px-6 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all disabled:opacity-50">
                      {addPlayerStats.isPending ? "Salvando..." : <span className="flex items-center gap-1"><Check className="w-4 h-4" /> Adicionar</span>}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2a2a3a]">
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Data</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Jogador</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Time</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Q1</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Q2</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Q3</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2a2a3a]">
                    {(selectedXtForResults ? xtDetail?.playerStats : allPlayerStats)?.map((p) => (
                      <tr key={p.id} className="hover:bg-[#1a1a24]">
                        <td className="px-6 py-3 text-sm text-[#8a8a9e]">{p.date}</td>
                        <td className="px-6 py-3 text-sm font-medium text-[#f0f0f5]">{p.playerName}</td>
                        <td className="px-6 py-3 text-sm text-[#8a8a9e]">{p.teamName}</td>
                        <td className="px-6 py-3 text-center text-sm text-[#8a8a9e]">{p.q1Kills}</td>
                        <td className="px-6 py-3 text-center text-sm text-[#8a8a9e]">{p.q2Kills}</td>
                        <td className="px-6 py-3 text-center text-sm text-[#8a8a9e]">{p.q3Kills}</td>
                        <td className="px-6 py-3 text-center text-sm font-bold text-red-400">{p.totalKills}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!(selectedXtForResults ? xtDetail?.playerStats : allPlayerStats)?.length && (
                <div className="px-6 py-8 text-center text-[#5a5a6e] text-sm">Nenhuma estatistica registrada</div>
              )}
            </div>
          </>
        )}

        {/* TAB: AGENDA */}
        {activeTab === "schedule" && (
          <>
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
              <div className="flex gap-2">
                <button onClick={() => { setShowScheduleForm(true); resetScheduleForm(); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all">
                  <Plus className="w-4 h-4" /> Add Agendamento
                </button>
                <button onClick={() => {
                  const now = new Date();
                  if (confirm(`Gerar agenda para ${now.getMonth() + 1}/${now.getFullYear()}?`)) {
                    generateMonthSchedule.mutate({ year: now.getFullYear(), month: now.getMonth() + 1 });
                  }
                }}
                  disabled={generateMonthSchedule.isPending}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm font-medium hover:bg-[#22222e] transition-all disabled:opacity-50">
                  <CalendarDays className="w-4 h-4" />
                  {generateMonthSchedule.isPending ? "Gerando..." : "Gerar Mes"}
                </button>
              </div>
            </div>

            {showScheduleForm && (
              <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[#f0f0f5]">Novo Agendamento</h3>
                  <button onClick={() => setShowScheduleForm(false)} className="p-1 rounded hover:bg-[#1a1a24] text-[#5a5a6e]"><X className="w-4 h-4" /></button>
                </div>
                <form onSubmit={handleCreateSchedule} className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">Data *</label>
                    <input type="date" value={scheduleForm.date} onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })} required
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">Dia da Semana *</label>
                    <select value={scheduleForm.dayOfWeek} onChange={(e) => setScheduleForm({ ...scheduleForm, dayOfWeek: e.target.value })} required
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm">
                      <option value="">Selecione</option>
                      <option value="Segunda">Segunda</option>
                      <option value="Terça">Terça</option>
                      <option value="Quarta">Quarta</option>
                      <option value="Quinta">Quinta</option>
                      <option value="Sexta">Sexta</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">Horario BR</label>
                    <input value={scheduleForm.timeBr} onChange={(e) => setScheduleForm({ ...scheduleForm, timeBr: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">Status</label>
                    <select value={scheduleForm.status} onChange={(e) => setScheduleForm({ ...scheduleForm, status: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm">
                      <option value="scheduled">Agendado</option>
                      <option value="completed">Realizado</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm text-[#8a8a9e] mb-1">Observacoes</label>
                    <input value={scheduleForm.notes} onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm" />
                  </div>
                  <div className="sm:col-span-3 flex items-end">
                    <button type="submit" disabled={createSchedule.isPending}
                      className="px-6 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all disabled:opacity-50">
                      {createSchedule.isPending ? "Salvando..." : <span className="flex items-center gap-1"><Check className="w-4 h-4" /> Criar</span>}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2a2a3a]">
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Data</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Dia</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Horario</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Obs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2a2a3a]">
                    {scheduleList?.map((s) => (
                      <tr key={s.id} className={`hover:bg-[#1a1a24] ${s.status === "completed" ? "opacity-50" : ""}`}>
                        <td className="px-6 py-3 text-sm text-[#f0f0f5]">{s.date}</td>
                        <td className="px-6 py-3 text-sm text-[#8a8a9e]">{s.dayOfWeek}</td>
                        <td className="px-6 py-3 text-sm text-[#8a8a9e]">{s.timeBr}</td>
                        <td className="px-6 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            s.status === "completed" ? "bg-green-500/10 text-green-400" :
                            s.status === "cancelled" ? "bg-red-500/10 text-red-400" :
                            "bg-blue-500/10 text-blue-400"
                          }`}>
                            {s.status === "completed" ? "Realizado" : s.status === "cancelled" ? "Cancelado" : "Agendado"}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm text-[#8a8a9e]">{s.notes ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!scheduleList?.length && (
                <div className="px-6 py-8 text-center text-[#5a5a6e] text-sm">Nenhum agendamento encontrado</div>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}