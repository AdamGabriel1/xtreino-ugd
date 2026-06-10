import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Check,
  Shield,
  Upload,
  Loader2,
  Users,
  Layers,
  Crown,
  Swords,
  RotateCcw,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import AdminLayout from "@/layout/AdminLayout";
import { toast } from "sonner";
import { useImageUpload } from "@/hooks/useImageUpload";

type Tab = "clans" | "teams" | "players";
type TeamStatus = "active" | "inactive" | "disbanded";
type PlayerRole = "captain" | "official" | "reserve";

export default function AdminClans() {
  const [tab, setTab] = useState<Tab>("clans");
  const [search, setSearch] = useState("");

  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);

  // Clan form
  const [clanForm, setClanForm] = useState({
    name: "",
    tag: "",
    description: "",
    color: "#ff3b3b",
    discord: "",
    status: "active" as "active" | "inactive",
  });

  // Team form
  const [teamForm, setTeamForm] = useState({
    name: "",
    tag: "",
    clanId: 0,
    description: "",
    captainName: "",
    captainDiscord: "",
    whatsapp: "",
    status: "active" as TeamStatus,
  });

  // Player form
  const [playerForm, setPlayerForm] = useState({
    nickname: "",
    uid: "",
    discord: "",
    teamId: 0,
    role: "official" as PlayerRole,
    kills: 0,
    deaths: 0,
    wins: 0,
    matches: 0,
  });

  const { preview, isUploading, error: uploadError, handleFileSelect, clearImage, setPreview } = useImageUpload();

  const utils = trpc.useUtils();

  // Queries
  const { data: clansList } = trpc.clans.list.useQuery(search ? { search } : undefined);
  const { data: teamsList } = trpc.teams.list.useQuery(
    tab === "teams" && search ? { search } : undefined
  );
  const { data: playersList } = trpc.players.list.useQuery(
    tab === "players" && search ? { search } : undefined
  );

  // Mutations - Clans
  const createClan = trpc.clans.create.useMutation({
    onSuccess: () => {
      utils.clans.list.invalidate();
      setShowForm(false);
      resetClanForm();
      toast.success("Clã criado!");
    },
    onError: (e) => toast.error(e.message),
  });

  const updateClan = trpc.clans.update.useMutation({
    onSuccess: () => {
      utils.clans.list.invalidate();
      setShowForm(false);
      setEditing(null);
      resetClanForm();
      toast.success("Clã atualizado!");
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteClan = trpc.clans.delete.useMutation({
    onSuccess: () => {
      utils.clans.list.invalidate();
      toast.success("Clã removido!");
    },
    onError: (e) => toast.error(e.message),
  });

  // Mutations - Teams
  const createTeam = trpc.teams.create.useMutation({
    onSuccess: () => {
      utils.teams.list.invalidate();
      utils.clans.list.invalidate();
      setShowForm(false);
      resetTeamForm();
      toast.success("Line criada!");
    },
    onError: (e) => toast.error(e.message),
  });

  const updateTeam = trpc.teams.update.useMutation({
    onSuccess: () => {
      utils.teams.list.invalidate();
      utils.clans.list.invalidate();
      setShowForm(false);
      setEditing(null);
      resetTeamForm();
      toast.success("Line atualizada!");
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteTeam = trpc.teams.delete.useMutation({
    onSuccess: () => {
      utils.teams.list.invalidate();
      utils.clans.list.invalidate();
      toast.success("Line removida!");
    },
    onError: (e) => toast.error(e.message),
  });

  // Mutations - Players
  const createPlayer = trpc.players.create.useMutation({
    onSuccess: () => {
      utils.players.list.invalidate();
      utils.clans.list.invalidate();
      utils.teams.list.invalidate();
      setShowForm(false);
      resetPlayerForm();
      toast.success("Jogador criado!");
    },
    onError: (e) => toast.error(e.message),
  });

  const updatePlayer = trpc.players.update.useMutation({
    onSuccess: () => {
      utils.players.list.invalidate();
      utils.clans.list.invalidate();
      utils.teams.list.invalidate();
      setShowForm(false);
      setEditing(null);
      resetPlayerForm();
      toast.success("Jogador atualizado!");
    },
    onError: (e) => toast.error(e.message),
  });

  const deletePlayer = trpc.players.delete.useMutation({
    onSuccess: () => {
      utils.players.list.invalidate();
      utils.clans.list.invalidate();
      utils.teams.list.invalidate();
      toast.success("Jogador removido!");
    },
    onError: (e) => toast.error(e.message),
  });

  // Reset forms
  const resetClanForm = () => {
    setClanForm({ name: "", tag: "", description: "", color: "#ff3b3b", discord: "", status: "active" });
    clearImage();
  };

  const resetTeamForm = () => {
    setTeamForm({ name: "", tag: "", clanId: 0, description: "", captainName: "", captainDiscord: "", whatsapp: "", status: "active" });
    clearImage();
  };

  const resetPlayerForm = () => {
    setPlayerForm({ nickname: "", uid: "", discord: "", teamId: 0, role: "official", kills: 0, deaths: 0, wins: 0, matches: 0 });
  };

  // Edit handlers
  const handleEditClan = (clan: NonNullable<typeof clansList>[0]) => {
    setEditing(clan.id);
    setClanForm({
      name: clan.name,
      tag: clan.tag,
      description: clan.description ?? "",
      color: clan.color ?? "#ff3b3b",
      discord: clan.discord ?? "",
      status: (clan.status as "active" | "inactive") ?? "active",
    });
    if (clan.logo) setPreview(clan.logo);
    else clearImage();
    setShowForm(true);
  };

  const handleEditTeam = (team: NonNullable<typeof teamsList>[0]) => {
    setEditing(team.id);
    setTeamForm({
      name: team.name,
      tag: team.tag,
      clanId: team.clanId ?? 0,
      description: team.description ?? "",
      captainName: team.captainName ?? "",
      captainDiscord: team.captainDiscord ?? "",
      whatsapp: team.whatsapp ?? "",
      status: (team.status as TeamStatus) ?? "active",
    });
    if (team.logo) setPreview(team.logo);
    else clearImage();
    setShowForm(true);
  };

  const handleEditPlayer = (player: NonNullable<typeof playersList>[0]) => {
    setEditing(player.id);
    setPlayerForm({
      nickname: player.nickname,
      uid: player.uid ?? "",
      discord: player.discord ?? "",
      teamId: player.teamId ?? 0,
      role: (player.role as PlayerRole) ?? "official",
      kills: player.kills ?? 0,
      deaths: player.deaths ?? 0,
      wins: player.wins ?? 0,
      matches: player.matches ?? 0,
    });
    setShowForm(true);
  };

  // Submit handlers
  const handleSubmitClan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clanForm.name || !clanForm.tag) {
      toast.error("Nome e tag são obrigatórios");
      return;
    }
    const data = { ...clanForm, logo: preview || undefined };
    if (editing) {
      updateClan.mutate({ id: editing, ...data });
    } else {
      createClan.mutate(data);
    }
  };

  const handleSubmitTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamForm.name || !teamForm.tag || !teamForm.clanId) {
      toast.error("Nome, tag e clã são obrigatórios");
      return;
    }
    const data = { ...teamForm, logo: preview || undefined };
    if (editing) {
      updateTeam.mutate({ id: editing, ...data });
    } else {
      createTeam.mutate(data);
    }
  };

  const handleSubmitPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerForm.nickname) {
      toast.error("Nickname é obrigatório");
      return;
    }
    if (editing) {
      updatePlayer.mutate({ id: editing, ...playerForm });
    } else {
      createPlayer.mutate(playerForm);
    }
  };

  // Helpers
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "captain": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "official": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "reserve": return "bg-[#1a1a24] text-[#5a5a6e] border-[#2a2a3a]";
      default: return "bg-[#1a1a24] text-[#5a5a6e] border-[#2a2a3a]";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "captain": return "Capitão";
      case "official": return "Titular";
      case "reserve": return "Reserva";
      default: return role;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500/10 text-green-400 border-green-500/20";
      case "disbanded": return "bg-red-500/10 text-red-400 border-red-500/20";
      case "inactive": return "bg-[#1a1a24] text-[#5a5a6e] border-[#2a2a3a]";
      default: return "bg-[#1a1a24] text-[#5a5a6e] border-[#2a2a3a]";
    }
  };

  const openCreate = () => {
    setEditing(null);
    clearImage();
    if (tab === "clans") resetClanForm();
    if (tab === "teams") resetTeamForm();
    if (tab === "players") resetPlayerForm();
    setShowForm(true);
  };

  const isPending =
    createClan.isPending || updateClan.isPending ||
    createTeam.isPending || updateTeam.isPending ||
    createPlayer.isPending || updatePlayer.isPending ||
    isUploading;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#f0f0f5] mb-1">Gerenciar Clãs</h1>
            <p className="text-[#8a8a9e] text-sm">Administre clãs, lines e jogadores</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-all"
          >
            <Plus className="w-4 h-4" />
            {tab === "clans" ? "Novo Clã" : tab === "teams" ? "Nova Line" : "Novo Jogador"}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#12121a] rounded-xl border border-[#2a2a3a] p-1 w-fit">
          {[
            { key: "clans" as Tab, label: "Clãs", icon: Shield },
            { key: "teams" as Tab, label: "Lines", icon: Layers },
            { key: "players" as Tab, label: "Jogadores", icon: Users },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setSearch(""); setShowForm(false); setEditing(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.key
                  ? "bg-green-500/20 text-green-400"
                  : "text-[#5a5a6e] hover:text-[#f0f0f5] hover:bg-[#1a1a24]"
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5a6e]" />
          <input
            type="text"
            placeholder={`Buscar ${tab === "clans" ? "clã" : tab === "teams" ? "line" : "jogador"}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#12121a] border border-[#2a2a3a] text-[#f0f0f5] text-sm placeholder-[#5a5a6e] focus:outline-none focus:border-green-500/50"
          />
        </div>

        {/* ===== FORM MODAL ===== */}
        {showForm && (
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#f0f0f5]">
                {editing ? "Editar" : "Novo"} {tab === "clans" ? "Clã" : tab === "teams" ? "Line" : "Jogador"}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-[#1a1a24] text-[#5a5a6e]">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Upload de Logo (clans e teams) */}
            {(tab === "clans" || tab === "teams") && (
              <div className="mb-6">
                <label className="block text-sm text-[#8a8a9e] mb-2">Logo</label>
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-24 rounded-xl bg-gradient-to-br from-green-900/30 to-green-600/10 flex items-center justify-center border border-[#2a2a3a] overflow-hidden">
                    {preview ? (
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Shield className="w-10 h-10 text-green-400/50" />
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-green-400 animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm cursor-pointer hover:border-green-500/50 transition-colors">
                      <Upload className="w-4 h-4" />
                      {preview ? "Trocar imagem" : "Enviar logo"}
                      <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" disabled={isUploading} />
                    </label>
                    {preview && (
                      <button type="button" onClick={clearImage} className="text-xs text-green-400 hover:text-green-300 transition-colors">
                        Remover imagem
                      </button>
                    )}
                    {uploadError && <span className="text-xs text-red-400">{uploadError}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Clan Form */}
            {tab === "clans" && (
              <form onSubmit={handleSubmitClan} className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#8a8a9e] mb-1">Nome *</label>
                  <input
                    value={clanForm.name}
                    onChange={(e) => setClanForm({ ...clanForm, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#8a8a9e] mb-1">Tag *</label>
                  <input
                    value={clanForm.tag}
                    onChange={(e) => setClanForm({ ...clanForm, tag: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-[#8a8a9e] mb-1">Descrição</label>
                  <textarea
                    value={clanForm.description}
                    onChange={(e) => setClanForm({ ...clanForm, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#8a8a9e] mb-1">Cor</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={clanForm.color}
                      onChange={(e) => setClanForm({ ...clanForm, color: e.target.value })}
                      className="w-10 h-10 rounded-lg bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      value={clanForm.color}
                      onChange={(e) => setClanForm({ ...clanForm, color: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-[#8a8a9e] mb-1">Discord</label>
                  <input
                    value={clanForm.discord}
                    onChange={(e) => setClanForm({ ...clanForm, discord: e.target.value })}
                    placeholder="https://discord.gg/..."
                    className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#8a8a9e] mb-1">Status</label>
                  <select
                    value={clanForm.status}
                    onChange={(e) => setClanForm({ ...clanForm, status: e.target.value as "active" | "inactive" })}
                    className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50"
                  >
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button type="submit" disabled={isPending} className="px-6 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-all disabled:opacity-50">
                    {isPending ? "Salvando..." : <span className="flex items-center gap-1"><Check className="w-4 h-4" /> Salvar</span>}
                  </button>
                </div>
              </form>
            )}

            {/* Team Form */}
            {tab === "teams" && (
              <form onSubmit={handleSubmitTeam} className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#8a8a9e] mb-1">Nome *</label>
                  <input
                    value={teamForm.name}
                    onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#8a8a9e] mb-1">Tag *</label>
                  <input
                    value={teamForm.tag}
                    onChange={(e) => setTeamForm({ ...teamForm, tag: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#8a8a9e] mb-1">Clã *</label>
                  <select
                    value={teamForm.clanId || ""}
                    onChange={(e) => setTeamForm({ ...teamForm, clanId: Number(e.target.value) })}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50"
                  >
                    <option value="">Selecione um clã</option>
                    {clansList?.map((clan) => (
                      <option key={clan.id} value={clan.id}>{clan.name} [{clan.tag}]</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#8a8a9e] mb-1">Status</label>
                  <select
                    value={teamForm.status}
                    onChange={(e) => setTeamForm({ ...teamForm, status: e.target.value as TeamStatus })}
                    className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50"
                  >
                    <option value="active">Ativa</option>
                    <option value="inactive">Inativa</option>
                    <option value="disbanded">Desativada</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-[#8a8a9e] mb-1">Descrição</label>
                  <textarea
                    value={teamForm.description}
                    onChange={(e) => setTeamForm({ ...teamForm, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#8a8a9e] mb-1">Capitão</label>
                  <input
                    value={teamForm.captainName}
                    onChange={(e) => setTeamForm({ ...teamForm, captainName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#8a8a9e] mb-1">Discord do Capitão</label>
                  <input
                    value={teamForm.captainDiscord}
                    onChange={(e) => setTeamForm({ ...teamForm, captainDiscord: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#8a8a9e] mb-1">WhatsApp</label>
                  <input
                    value={teamForm.whatsapp}
                    onChange={(e) => setTeamForm({ ...teamForm, whatsapp: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50"
                  />
                </div>
                <div className="flex items-end">
                  <button type="submit" disabled={isPending} className="px-6 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-all disabled:opacity-50">
                    {isPending ? "Salvando..." : <span className="flex items-center gap-1"><Check className="w-4 h-4" /> Salvar</span>}
                  </button>
                </div>
              </form>
            )}

            {/* Player Form */}
            {tab === "players" && (
              <form onSubmit={handleSubmitPlayer} className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#8a8a9e] mb-1">Nickname *</label>
                  <input
                    value={playerForm.nickname}
                    onChange={(e) => setPlayerForm({ ...playerForm, nickname: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#8a8a9e] mb-1">UID</label>
                  <input
                    value={playerForm.uid}
                    onChange={(e) => setPlayerForm({ ...playerForm, uid: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#8a8a9e] mb-1">Line</label>
                  <select
                    value={playerForm.teamId || ""}
                    onChange={(e) => setPlayerForm({ ...playerForm, teamId: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50"
                  >
                    <option value="">Sem line</option>
                    {teamsList?.map((team) => (
                      <option key={team.id} value={team.id}>{team.name} [{team.tag}]</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#8a8a9e] mb-1">Role</label>
                  <select
                    value={playerForm.role}
                    onChange={(e) => setPlayerForm({ ...playerForm, role: e.target.value as PlayerRole })}
                    className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50"
                  >
                    <option value="official">Titular</option>
                    <option value="captain">Capitão</option>
                    <option value="reserve">Reserva</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#8a8a9e] mb-1">Discord</label>
                  <input
                    value={playerForm.discord}
                    onChange={(e) => setPlayerForm({ ...playerForm, discord: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50"
                  />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">Kills</label>
                    <input
                      type="number"
                      value={playerForm.kills}
                      onChange={(e) => setPlayerForm({ ...playerForm, kills: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">Deaths</label>
                    <input
                      type="number"
                      value={playerForm.deaths}
                      onChange={(e) => setPlayerForm({ ...playerForm, deaths: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">Wins</label>
                    <input
                      type="number"
                      value={playerForm.wins}
                      onChange={(e) => setPlayerForm({ ...playerForm, wins: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8a8a9e] mb-1">Matches</label>
                    <input
                      type="number"
                      value={playerForm.matches}
                      onChange={(e) => setPlayerForm({ ...playerForm, matches: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm focus:outline-none focus:border-green-500/50"
                    />
                  </div>
                </div>
                <div className="flex items-end">
                  <button type="submit" disabled={isPending} className="px-6 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-all disabled:opacity-50">
                    {isPending ? "Salvando..." : <span className="flex items-center gap-1"><Check className="w-4 h-4" /> Salvar</span>}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ===== TABLES ===== */}

        {/* Clans Table */}
        {tab === "clans" && (
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2a2a3a]">
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Logo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Nome</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Tag</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Cor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2a3a]">
                  {clansList?.map((clan) => (
                    <tr key={clan.id} className="hover:bg-[#1a1a24]">
                      <td className="px-6 py-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{
                            background: clan.color
                              ? `linear-gradient(135deg, ${clan.color}40, ${clan.color}15)`
                              : "linear-gradient(135deg, rgba(255,59,59,0.2), rgba(255,59,59,0.05))",
                          }}
                        >
                          {clan.logo ? (
                            <img src={clan.logo} alt="" className="w-8 h-8 rounded object-cover" />
                          ) : (
                            <Shield className="w-5 h-5" style={{ color: clan.color ?? "#ff3b3b" }} />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm font-medium text-[#f0f0f5]">{clan.name}</td>
                      <td className="px-6 py-3 text-sm text-[#8a8a9e]">[{clan.tag}]</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded border border-[#2a2a3a]" style={{ backgroundColor: clan.color ?? "#ff3b3b" }} />
                          <span className="text-sm text-[#8a8a9e] font-mono">{clan.color ?? "—"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border ${getStatusBadge(clan.status)}`}>
                          {clan.status === "active" ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => handleEditClan(clan)} className="p-1.5 rounded hover:bg-blue-500/10 text-blue-400 transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { if (confirm("Remover clã? Isso não remove as lines associadas.")) deleteClan.mutate({ id: clan.id }); }}
                            className="p-1.5 rounded hover:bg-red-500/10 text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {(!clansList || clansList.length === 0) && (
              <div className="text-center py-12">
                <Shield className="w-10 h-10 mx-auto mb-3 text-[#2a2a3a]" />
                <p className="text-[#5a5a6e]">Nenhum clã encontrado</p>
              </div>
            )}
          </div>
        )}

        {/* Teams Table */}
        {tab === "teams" && (
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2a2a3a]">
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Logo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Nome</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Tag</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Clã</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Capitão</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2a3a]">
                  {teamsList?.map((team) => (
                    <tr key={team.id} className="hover:bg-[#1a1a24]">
                      <td className="px-6 py-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-900/30 to-green-600/10 flex items-center justify-center overflow-hidden">
                          {team.logo ? (
                            <img src={team.logo} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Shield className="w-5 h-5 text-green-400/50" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm font-medium text-[#f0f0f5]">{team.name}</td>
                      <td className="px-6 py-3 text-sm text-[#8a8a9e]">[{team.tag}]</td>
                      <td className="px-6 py-3 text-sm text-[#8a8a9e]">
                        {clansList?.find((c) => c.id === team.clanId)?.name ?? "—"}
                      </td>
                      <td className="px-6 py-3 text-sm text-[#8a8a9e]">{team.captainName ?? "—"}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border ${getStatusBadge(team.status)}`}>
                          {team.status === "active" ? "Ativa" : team.status === "disbanded" ? "Desativada" : "Inativa"}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => handleEditTeam(team)} className="p-1.5 rounded hover:bg-blue-500/10 text-blue-400 transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { if (confirm("Remover line?")) deleteTeam.mutate({ id: team.id }); }}
                            className="p-1.5 rounded hover:bg-red-500/10 text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {(!teamsList || teamsList.length === 0) && (
              <div className="text-center py-12">
                <Layers className="w-10 h-10 mx-auto mb-3 text-[#2a2a3a]" />
                <p className="text-[#5a5a6e]">Nenhuma line encontrada</p>
              </div>
            )}
          </div>
        )}

        {/* Players Table */}
        {tab === "players" && (
          <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2a2a3a]">
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Nickname</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Line</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">UID</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">K</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">D</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">W</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase">M</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2a3a]">
                  {playersList?.map((player) => (
                    <tr key={player.id} className="hover:bg-[#1a1a24]">
                      <td className="px-6 py-3 text-sm font-medium text-[#f0f0f5]">{player.nickname}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${getRoleBadge(player.role)}`}>
                          {player.role === "captain" && <Crown className="w-3 h-3" />}
                          {player.role === "official" && <Swords className="w-3 h-3" />}
                          {player.role === "reserve" && <RotateCcw className="w-3 h-3" />}
                          {getRoleLabel(player.role)}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-[#8a8a9e]">
                        {teamsList?.find((t) => t.id === player.teamId)?.name ?? "—"}
                      </td>
                      <td className="px-6 py-3 text-sm text-[#8a8a9e] font-mono">{player.uid ?? "—"}</td>
                      <td className="px-6 py-3 text-sm text-center text-[#8a8a9e]">{player.kills}</td>
                      <td className="px-6 py-3 text-sm text-center text-[#8a8a9e]">{player.deaths}</td>
                      <td className="px-6 py-3 text-sm text-center text-green-400 font-medium">{player.wins}</td>
                      <td className="px-6 py-3 text-sm text-center text-[#8a8a9e]">{player.matches}</td>
                      <td className="px-6 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => handleEditPlayer(player)} className="p-1.5 rounded hover:bg-blue-500/10 text-blue-400 transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { if (confirm("Remover jogador?")) deletePlayer.mutate({ id: player.id }); }}
                            className="p-1.5 rounded hover:bg-red-500/10 text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {(!playersList || playersList.length === 0) && (
              <div className="text-center py-12">
                <Users className="w-10 h-10 mx-auto mb-3 text-[#2a2a3a]" />
                <p className="text-[#5a5a6e]">Nenhum jogador encontrado</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}