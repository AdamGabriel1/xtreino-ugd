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
  Shield,
  Menu,
  X,
  ChevronRight,
  Gamepad2,
  Crown,
  Info,
  Star,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { trpc } from "@/providers/trpc";

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
}

interface NavGroup {
  label: string;
  icon: React.ElementType;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Principal",
    icon: LayoutDashboard,
    items: [
      { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { path: "/admin/configuracoes", label: "Configuracoes", icon: Settings },
    ],
  },
  {
    label: "Eventos",
    icon: Trophy,
    items: [
      { path: "/admin/campeonatos", label: "Campeonatos", icon: Trophy },
      { path: "/admin/xtreinos", label: "XTreinos", icon: Dumbbell },
      { path: "/admin/scrims", label: "Scrims", icon: Swords },
      // { path: "/admin/salinhas", label: "Salinhas", icon: Star },
    ],
  },
  {
    label: "Comunidade",
    icon: Users,
    items: [
      { path: "/admin/clans", label: "Clans", icon: Crown },
      { path: "/admin/jogadores", label: "Jogadores", icon: UserCircle },
    ],
  },
  {
    label: "Conteudo",
    icon: Info,
    items: [
//      { path: "/admin/sobre", label: "Sobre / Equipe", icon: Info },
      { path: "/admin/rankings", label: "Rankings", icon: BarChart3 },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, isLoading, isAuthenticated, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["Principal", "Eventos"]);
  const { data: settings } = trpc.settings.get.useQuery();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/admin/login");
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Fecha sidebar ao mudar de rota no mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
    );
  };

  const isActive = (path: string) => location.pathname === path;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
          <p className="text-[#5a5a6e] text-sm">Carregando painel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#12121a] border-r border-[#2a2a3a] flex flex-col transition-transform duration-300 ease-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="p-5 border-b border-[#2a2a3a]">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/30 transition-shadow">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-[#f0f0f5] text-sm leading-tight">{settings?.orgName ?? "Underground"}</p>
              <p className="text-[#5a5a6e] text-xs">Painel Administrativo</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navGroups.map((group) => {
            const GroupIcon = group.icon;
            const isExpanded = expandedGroups.includes(group.label);
            const hasActiveChild = group.items.some((item) => isActive(item.path));

            return (
              <div key={group.label} className="mb-1">
                <button
                  onClick={() => toggleGroup(group.label)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                    hasActiveChild
                      ? "text-emerald-400"
                      : "text-[#5a5a6e] hover:text-[#8a8a9e]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <GroupIcon className="w-3.5 h-3.5" />
                    {group.label}
                  </div>
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-200 ${
                    isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="pl-2 space-y-0.5 mt-0.5">
                    {group.items.map((item) => {
                      const ItemIcon = item.icon;
                      const active = isActive(item.path);
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                            active
                              ? "bg-emerald-500/10 text-emerald-400 font-semibold border-l-2 border-emerald-500"
                              : "text-[#8a8a9e] hover:text-[#f0f0f5] hover:bg-[#1a1a24] border-l-2 border-transparent"
                          }`}
                        >
                          <ItemIcon className={`w-4 h-4 ${active ? "text-emerald-400" : ""}`} />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="p-4 border-t border-[#2a2a3a]">
          <div className="flex items-center gap-3 px-3 py-2 mb-3 rounded-lg bg-[#1a1a24] border border-[#2a2a3a]">
            <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <UserCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#f0f0f5] truncate">{admin?.username}</p>
              <p className="text-xs text-emerald-400/70 capitalize">{admin?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-[#8a8a9e] hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
          >
            <LogOut className="w-4 h-4" />
            Sair do Painel
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden h-16 bg-[#12121a] border-b border-[#2a2a3a] flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-10 h-10 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] flex items-center justify-center text-[#8a8a9e] hover:text-[#f0f0f5] transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <span className="font-bold text-[#f0f0f5] text-sm">Painel Admin</span>
              <p className="text-[#5a5a6e] text-[10px]">{settings?.orgName ?? "Underground"}</p>
            </div>
          </div>
          <Link
            to="/"
            className="w-10 h-10 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] flex items-center justify-center text-[#8a8a9e] hover:text-emerald-400 transition-colors"
          >
            <Gamepad2 className="w-4 h-4" />
          </Link>
        </header>

        {/* Breadcrumb + Page Title */}
        <div className="hidden lg:flex items-center justify-between px-8 py-4 border-b border-[#2a2a3a] bg-[#12121a]/50">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/admin" className="text-[#5a5a6e] hover:text-emerald-400 transition-colors">
              Dashboard
            </Link>
            {location.pathname !== "/admin" && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-[#3a3a4e]" />
                <span className="text-[#8a8a9e] capitalize">
                  {location.pathname.split("/").pop()?.replace(/-/g, " ")}
                </span>
              </>
            )}
          </div>
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-[#8a8a9e] hover:text-emerald-400 hover:bg-emerald-500/10 transition-all border border-transparent hover:border-emerald-500/20"
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            Ver Site
          </Link>
        </div>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}