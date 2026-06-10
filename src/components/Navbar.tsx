import { Link, useLocation } from "react-router";
import {
  Home,
  Trophy,
  Dumbbell,
  Swords,
  Users,
  UserCircle,
  TrendingUp,
  Menu,
  X,
  ChevronDown,
  Shield,
  Gamepad2,
  Crown,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface NavItem {
  label: string;
  to: string;
  icon: React.ElementType;
}

interface NavDropdown {
  label: string;
  icon: React.ElementType;
  items: NavItem[];
}

type NavItemType = NavItem | NavDropdown;

function isDropdown(item: NavItemType): item is NavDropdown {
  return "items" in item;
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

  const navItems: NavItemType[] = [
    { label: "Home", to: "/", icon: Home },
    { label: "Rankings", to: "/rankings", icon: TrendingUp },
    {
      label: "Eventos",
      icon: Trophy,
      items: [
        { label: "Campeonatos", to: "/campeonatos", icon: Trophy },
        { label: "XTreinos", to: "/xtreinos", icon: Dumbbell },
        { label: "Scrims", to: "/scrims", icon: Swords },
        { label: "Salinhas Premiadas", to: "/salinhas", icon: Gamepad2 },
      ],
    },
    {
      label: "Comunidade",
      icon: Users,
      items: [
        { label: "Clans", to: "/clans", icon: Crown },
        { label: "Jogadores", to: "/jogadores", icon: UserCircle },
      ],
    },
    { label: "Sobre", to: "/sobre", icon: Shield },
  ];

  const isActive = (to: string) => {
    if (to === "/") return location.pathname === "/";
    return location.pathname.startsWith(to);
  };

  const isDropdownActive = (items: NavItem[]) => {
    return items.some((item) => isActive(item.to));
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-[#2a2a3a]">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-[#f0f0f5] font-bold text-lg tracking-tight hidden sm:block">
              Underground
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1" ref={dropdownRef}>
            {navItems.map((item) => {
              if (isDropdown(item)) {
                const active = isDropdownActive(item.items);
                return (
                  <div key={item.label} className="relative">
                    <button
                      onClick={() =>
                        setOpenDropdown(openDropdown === item.label ? null : item.label)
                      }
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        active || openDropdown === item.label
                          ? "text-emerald-400 bg-emerald-500/10"
                          : "text-[#8a8a9e] hover:text-[#f0f0f5] hover:bg-[#1a1a24]"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          openDropdown === item.label ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Dropdown Menu */}
                    {openDropdown === item.label && (
                      <div className="absolute top-full left-0 mt-2 w-56 bg-[#12121a] rounded-xl border border-[#2a2a3a] shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-1.5">
                          {item.items.map((sub) => (
                            <Link
                              key={sub.to}
                              to={sub.to}
                              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                                isActive(sub.to)
                                  ? "text-emerald-400 bg-emerald-500/10 font-medium"
                                  : "text-[#8a8a9e] hover:text-[#f0f0f5] hover:bg-[#1a1a24]"
                              }`}
                            >
                              <sub.icon className="w-4 h-4 shrink-0" />
                              {sub.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.to)
                      ? "text-emerald-400 bg-emerald-500/10"
                      : "text-[#8a8a9e] hover:text-[#f0f0f5] hover:bg-[#1a1a24]"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden w-10 h-10 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] flex items-center justify-center text-[#8a8a9e] hover:text-[#f0f0f5] transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[#2a2a3a] bg-[#0a0a0f]/95 backdrop-blur-xl">
          <div className="max-w-[1400px] mx-auto px-4 py-4 space-y-1">
            {navItems.map((item) => {
              if (isDropdown(item)) {
                const active = isDropdownActive(item.items);
                const isOpen = openDropdown === item.label;
                return (
                  <div key={item.label}>
                    <button
                      onClick={() =>
                        setOpenDropdown(isOpen ? null : item.label)
                      }
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        active || isOpen
                          ? "text-emerald-400 bg-emerald-500/10"
                          : "text-[#8a8a9e] hover:text-[#f0f0f5] hover:bg-[#1a1a24]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5" />
                        {item.label}
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Mobile Submenu */}
                    {isOpen && (
                      <div className="mt-1 ml-4 pl-4 border-l-2 border-[#2a2a3a] space-y-1">
                        {item.items.map((sub) => (
                          <Link
                            key={sub.to}
                            to={sub.to}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                              isActive(sub.to)
                                ? "text-emerald-400 bg-emerald-500/10 font-medium"
                                : "text-[#8a8a9e] hover:text-[#f0f0f5] hover:bg-[#1a1a24]"
                            }`}
                          >
                            <sub.icon className="w-4 h-4 shrink-0" />
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive(item.to)
                      ? "text-emerald-400 bg-emerald-500/10"
                      : "text-[#8a8a9e] hover:text-[#f0f0f5] hover:bg-[#1a1a24]"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}