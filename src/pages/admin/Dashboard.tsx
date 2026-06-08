import { Link } from "react-router";
import {
  Users,
  UserCircle,
  Trophy,
  Dumbbell,
  Plus,
  ClipboardList,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import AdminLayout from "@/layout/AdminLayout";

export default function AdminDashboard() {
  const { data: teamsList } = trpc.teams.list.useQuery();
  const { data: playersList } = trpc.players.list.useQuery();
  const { data: championships } = trpc.championships.list.useQuery();
  const { data: xtreinosList } = trpc.xtreinos.list.useQuery();
  const { data: registrationsList } = trpc.registrations.list.useQuery(undefined, {
    retry: false,
  });

  const stats = [
    { label: "Equipes", value: teamsList?.length ?? 0, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Jogadores", value: playersList?.length ?? 0, icon: UserCircle, color: "text-green-400", bg: "bg-green-500/10" },
    { label: "Campeonatos", value: championships?.length ?? 0, icon: Trophy, color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { label: "XTreinos", value: xtreinosList?.length ?? 0, icon: Dumbbell, color: "text-purple-400", bg: "bg-purple-500/10" },
  ];

  const quickActions = [
    { label: "Nova Equipe", path: "/admin/equipes", icon: Users, color: "bg-blue-500 hover:bg-blue-600" },
    { label: "Novo Campeonato", path: "/admin/campeonatos", icon: Trophy, color: "bg-yellow-500 hover:bg-yellow-600" },
    { label: "Novo XTreino", path: "/admin/xtreinos", icon: Dumbbell, color: "bg-purple-500 hover:bg-purple-600" },
    { label: "Nova Inscricao", path: "/inscricoes", icon: ClipboardList, color: "bg-green-500 hover:bg-green-600" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#f0f0f5] mb-1">Dashboard</h1>
          <p className="text-[#8a8a9e] text-sm">Visao geral do sistema</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-5 hover:border-[#3a3a4e] transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <span className="text-xs text-[#8a8a9e]">{stat.label}</span>
                </div>
                <p className="text-2xl font-bold text-[#f0f0f5]">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-bold text-[#f0f0f5] mb-4">Acoes Rapidas</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                to={action.path}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl ${action.color} text-white text-sm font-medium transition-all hover:scale-[1.02]`}
              >
                <Plus className="w-4 h-4" />
                {action.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Registrations */}
        <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2a2a3a] flex items-center justify-between">
            <h2 className="font-bold text-[#f0f0f5]">Inscricoes Recentes</h2>
            <Link to="/admin/inscricoes" className="text-sm text-green-400 hover:text-green-300">
              Ver todas
            </Link>
          </div>
          {registrationsList && registrationsList.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2a2a3a]">
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Equipe</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Evento</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#5a5a6e] uppercase">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2a3a]">
                  {registrationsList.slice(0, 10).map((r) => (
                    <tr key={r.id} className="hover:bg-[#1a1a24]">
                      <td className="px-6 py-3 text-sm font-medium text-[#f0f0f5]">{r.teamName}</td>
                      <td className="px-6 py-3 text-sm text-[#8a8a9e]">{r.eventType} #{r.eventId}</td>
                      <td className="px-6 py-3 text-sm text-[#8a8a9e]">{r.type?.toUpperCase()}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          r.status === "aprovado" ? "bg-green-500/10 text-green-400" :
                          r.status === "pendente" ? "bg-yellow-500/10 text-yellow-400" :
                          "bg-green-500/10 text-green-400"
                        }`}>
                          {r.status === "aprovado" ? "Aprovado" : r.status === "pendente" ? "Pendente" : "Rejeitado"}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-[#5a5a6e]">
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString("pt-BR") : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-8 text-center text-[#5a5a6e] text-sm">
              Nenhuma inscricao recente
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}