import { Link, useLocation, useNavigate } from "react-router";
import { useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  UserCircle,
  Trophy,
  Dumbbell,
  Swords,
  BarChart3,
  Settings,
  LogOut,
  Gamepad2,
  Menu,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { trpc } from "@/providers/trpc";

const navItems = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/equipes", label: "Equipes", icon: Users },
  { path: "/admin/jogadores", label: "Jogadores", icon: UserCircle },
  { path: "/admin/campeonatos", label: "Campeonatos", icon: Trophy },
  { path: "/admin/xtreinos", label: "XTreinos", icon: Dumbbell },
  { path: "/admin/scrims", label: "Scrims", icon: Swords },
  { path: "/admin/rankings", label: "Rankings", icon: BarChart3 },
  { path: "/admin/configuracoes", label: "Configuracoes", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, isLoading, isAuthenticated, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: settings } = trpc.settings.get.useQuery();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/admin/login");
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#12121a] border-r border-[#2a2a3a] flex flex-col transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-[#2a2a3a]">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-[#f0f0f5] text-sm">{settings?.orgName ?? "Admin"}</p>
              <p className="text-[#5a5a6e] text-xs">Painel Admin</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-red-500/10 text-red-400 border-l-2 border-red-500"
                    : "text-[#8a8a9e] hover:text-[#f0f0f5] hover:bg-[#1a1a24]"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#2a2a3a]">
          <div className="flex items-center gap-3 px-4 py-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
              <UserCircle className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#f0f0f5]">{admin?.username}</p>
              <p className="text-xs text-[#5a5a6e] capitalize">{admin?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-2.5 w-full rounded-lg text-sm text-[#8a8a9e] hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden h-16 bg-[#12121a] border-b border-[#2a2a3a] flex items-center px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-[#8a8a9e] hover:text-[#f0f0f5] hover:bg-[#1a1a24]"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="ml-4 font-bold text-[#f0f0f5]">Painel Admin</span>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
