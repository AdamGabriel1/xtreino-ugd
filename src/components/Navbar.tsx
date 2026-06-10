import { Link, useLocation } from "react-router";
import {
  Home,
  Trophy,
  Dumbbell,
  Swords,
  Users,
  UserCircle,
  BarChart3,
  Shield,
  Menu,
  X,
  ChevronDown,
  Gamepad2,
  Crown,
  LogIn,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface NavItem {
  label: string;
  to: string;
  icon: React.ElementType;
}

interface NavGroup {
  label: string;
  icon: React.ElementType;
  items: NavItem[];
}

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fecha mobile menu ao mudar de rota
  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  const mainLinks: NavItem[] = [
    { label: "Home", to: "/", icon: Home },
    { label: "Rankings", to: "/rankings", icon: BarChart3 },
    { label: "Sobre", to: "/sobre", icon: Shield },
  ];

  const eventosGroup: NavGroup = {
    label: "Eventos",
    icon: Trophy,
    items: [
      { label: "Campeonatos", to: "/campeonatos", icon: Trophy },
      { label: "XTreinos", to: "/xtreinos", icon: Dumbbell },
      { label: "Scrims", to: "/scrims", icon: Swords },
      { label: "Salinhas Premiadas", to: "/salinhas", icon: Gamepad2 },
    ],
  };

  const comunidadeGroup: NavGroup = {
    label: "Comunidade",
    icon: Users,
    items: [
      { label: "Clans", to: "/clans", icon: Crown },
      { label: "Jogadores", to: "/jogadores", icon: UserCircle },
    ],
  };

  const toggleDropdown = (key: string) => {
    setOpenDropdown((prev) => (prev === key ? null : key));
  };

  const DropdownMenu = ({ group }: { group: NavGroup }) => {
    const isOpen = openDropdown === group.label;
    const hasActiveChild = group.items.some((item) => isActive(item.to));
    const GroupIcon = group.icon;

    return (
      <div className="relative" ref={isOpen ? dropdownRef : undefined}>
        <button
          onClick={() => toggleDropdown(group.label)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            hasActiveChild
              ? "text-emerald-400 bg-emerald-500/10"
              : "text-[#8a8a9e] hover:text-[#f0f0f5] hover:bg-[#1a1a24]"
          }`}
        >
          <GroupIcon className="w-4 h-4" />
          <span className="hidden lg:inline">{group.label}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {/* Desktop Dropdown */}
        <div
          className={`absolute top-full left-0 mt-2 w-56 bg-[#12121a] border border-[#2a2a3a] rounded-xl shadow-2xl shadow-black/50 overflow-hidden transition-all duration-200 z-50 ${
            isOpen
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 -translate-y-2 pointer-events-none"
          }`}
        >
          <div className="p-1.5">
            {group.items.map((item) => {
              const ItemIcon = item.icon;
              const active = isActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                    active
                      ? "bg-emerald-500/10 text-emerald-400 font-semibold"
                      : "text-[#8a8a9e] hover:text-[#f0f0f5] hover:bg-[#1a1a24]"
                  }`}
                >
                  <ItemIcon className={`w-4 h-4 ${active ? "text-emerald-400" : "text-[#5a5a6e]"}`} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-[#2a2a3a]">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <img
              src="/logo-xtreino.jpg"
              alt="XTreinos Logo"
              className="w-9 h-9 rounded-lg object-cover shadow-lg shadow-emerald-500/20"
              draggable={false}
              loading="eager"
            />
            <span className="font-bold text-lg text-[#f0f0f5] hidden sm:block tracking-tight">
              Underground
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {mainLinks.map((link) => {
              const LinkIcon = link.icon;
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? "text-emerald-400 bg-emerald-500/10"
                      : "text-[#8a8a9e] hover:text-[#f0f0f5] hover:bg-[#1a1a24]"
                  }`}
                >
                  <LinkIcon className="w-4 h-4" />
                  <span className="hidden lg:inline">{link.label}</span>
                </Link>
              );
            })}

            <div className="w-px h-6 bg-[#2a2a3a] mx-1" />

            <DropdownMenu group={eventosGroup} />
            <DropdownMenu group={comunidadeGroup} />
          </div>

          {/* Right Side - Admin + Mobile Toggle */}
          <div className="flex items-center gap-2">
            {/* Admin Link - Desktop */}
            <Link
              to="/admin"
              className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#8a8a9e] hover:text-emerald-400 hover:bg-emerald-500/10 transition-all duration-200 border border-transparent hover:border-emerald-500/20"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden lg:inline">Painel</span>
            </Link>

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-10 h-10 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] flex items-center justify-center text-[#8a8a9e] hover:text-[#f0f0f5] transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden border-t border-[#2a2a3a] bg-[#0a0a0f]/95 backdrop-blur-xl transition-all duration-300 overflow-hidden ${
          mobileOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 py-4 space-y-1">
          {/* Main Links */}
          {mainLinks.map((link) => {
            const LinkIcon = link.icon;
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "text-[#8a8a9e] hover:text-[#f0f0f5] hover:bg-[#1a1a24]"
                }`}
              >
                <LinkIcon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}

          <div className="my-2 border-t border-[#2a2a3a]" />

          {/* Eventos Group */}
          <div className="px-4 py-2">
            <p className="text-[#5a5a6e] text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
              <Trophy className="w-3.5 h-3.5" />
              Eventos
            </p>
            <div className="space-y-1 pl-2">
              {eventosGroup.items.map((item) => {
                const ItemIcon = item.icon;
                const active = isActive(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                      active
                        ? "text-emerald-400 bg-emerald-500/5 font-semibold"
                        : "text-[#8a8a9e] hover:text-[#f0f0f5]"
                    }`}
                  >
                    <ItemIcon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="my-2 border-t border-[#2a2a3a]" />

          {/* Comunidade Group */}
          <div className="px-4 py-2">
            <p className="text-[#5a5a6e] text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
              <Users className="w-3.5 h-3.5" />
              Comunidade
            </p>
            <div className="space-y-1 pl-2">
              {comunidadeGroup.items.map((item) => {
                const ItemIcon = item.icon;
                const active = isActive(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                      active
                        ? "text-emerald-400 bg-emerald-500/5 font-semibold"
                        : "text-[#8a8a9e] hover:text-[#f0f0f5]"
                    }`}
                  >
                    <ItemIcon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="my-2 border-t border-[#2a2a3a]" />

          {/* Admin - Mobile */}
          <Link
            to="/admin"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#8a8a9e] hover:text-emerald-400 hover:bg-emerald-500/10 transition-all border border-transparent hover:border-emerald-500/20"
          >
            <LogIn className="w-5 h-5" />
            Painel Administrativo
          </Link>
        </div>
      </div>
    </nav>
  );
}