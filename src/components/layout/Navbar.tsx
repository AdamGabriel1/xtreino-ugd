import { Link, useLocation } from "react-router";
import {
  type LucideIcon,
  Home,
  Trophy,
  Dumbbell,
  Swords,
  Users,
  UserCircle,
  BarChart3,
  Shield,
  Gamepad2,
  Crown,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

interface NavGroup {
  label: string;
  icon: LucideIcon;
  items: NavItem[];
}

export default function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Detect scroll para mudar aparência da navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fecha menu mobile ao mudar de rota
  useEffect(() => {
    setMobileMenuOpen(false);
    setOpenDropdown(null);
  }, [location.pathname]);

  // Previne scroll do body quando menu mobile está aberto
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [mobileMenuOpen]);

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

  const allGroups = [eventosGroup, comunidadeGroup];

  // Verifica se algum item do grupo está ativo
  const isGroupActive = (group: NavGroup) =>
    group.items.some((item) => isActive(item.to));

  const toggleDropdown = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  return (
    <>
      {/* Navbar principal */}
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
          isScrolled || mobileMenuOpen
            ? "bg-[#0a0a0f]/95 backdrop-blur-xl shadow-lg shadow-black/20"
            : "bg-[#0a0a0f]/80 backdrop-blur-md"
        } border-b border-[#2a2a3a]`}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2.5 sm:gap-3 shrink-0"
              onClick={() => setMobileMenuOpen(false)}
            >
              <img
                src="/logo-xtreino.jpg"
                alt="XTreinos Logo"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg object-cover shadow-lg shadow-emerald-500/20"
                draggable={false}
                loading="eager"
              />
              <span className="font-bold text-base sm:text-lg text-[#f0f0f5] tracking-tight">
                Underground
              </span>
            </Link>

            {/* Desktop Navigation - hidden em telas menores que lg (1024px) */}
            <div className="hidden lg:flex items-center gap-1" ref={dropdownRef}>
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
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              <div className="w-px h-6 bg-[#2a2a3a] mx-1" />

              {/* Dropdowns Desktop */}
              {allGroups.map((group) => {
                const GroupIcon = group.icon;
                const active = isGroupActive(group);
                const isOpen = openDropdown === group.label;

                return (
                  <div key={group.label} className="relative">
                    <button
                      onClick={() => toggleDropdown(group.label)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        active
                          ? "text-emerald-400 bg-emerald-500/10"
                          : "text-[#8a8a9e] hover:text-[#f0f0f5] hover:bg-[#1a1a24]"
                      }`}
                    >
                      <GroupIcon className="w-4 h-4" />
                      <span>{group.label}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="absolute top-full left-0 mt-2 w-56 bg-[#12121a] border border-[#2a2a3a] rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-[110]">
                        <div className="p-1.5">
                          {group.items.map((item) => {
                            const ItemIcon = item.icon;
                            const itemActive = isActive(item.to);
                            return (
                              <Link
                                key={item.to}
                                to={item.to}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                                  itemActive
                                    ? "bg-emerald-500/10 text-emerald-400 font-semibold"
                                    : "text-[#8a8a9e] hover:text-[#f0f0f5] hover:bg-[#1a1a24]"
                                }`}
                              >
                                <ItemIcon
                                  className={`w-4 h-4 ${
                                    itemActive
                                      ? "text-emerald-400"
                                      : "text-[#5a5a6e]"
                                  }`}
                                />
                                {item.label}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Mobile Menu Button - visível em telas menores que lg */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg text-[#8a8a9e] hover:text-[#f0f0f5] hover:bg-[#1a1a24] transition-all"
              aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={mobileMenuOpen}
              type="button"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Overlay - SEPARADO da navbar para evitar problemas de z-index */}
      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="lg:hidden fixed inset-0 z-[99] bg-[#0a0a0f]/98 backdrop-blur-xl"
          style={{ paddingTop: "56px" }}
        >
          <div className="h-full overflow-y-auto overflow-x-hidden pb-20">
            <div className="px-4 sm:px-6 py-4 space-y-1 max-w-lg mx-auto">
              {/* Links Principais */}
              <div className="space-y-1">
                {mainLinks.map((link) => {
                  const LinkIcon = link.icon;
                  const active = isActive(link.to);
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
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
              </div>

              {/* Grupos no Mobile - Accordion style */}
              {allGroups.map((group, groupIndex) => {
                const GroupIcon = group.icon;
                const groupActive = isGroupActive(group);
                const isOpen = openDropdown === group.label || groupActive;

                return (
                  <div key={group.label}>
                    {groupIndex === 0 && (
                      <div className="my-3 border-t border-[#2a2a3a]" />
                    )}

                    <button
                      onClick={() => toggleDropdown(group.label)}
                      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
                        groupActive
                          ? "text-emerald-400 bg-emerald-500/5"
                          : "text-[#8a8a9e] hover:text-[#f0f0f5] hover:bg-[#1a1a24]"
                      }`}
                      type="button"
                    >
                      <div className="flex items-center gap-3">
                        <GroupIcon className="w-5 h-5" />
                        {group.label}
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="pl-4 pr-2 py-1 space-y-1">
                        {group.items.map((item) => {
                          const ItemIcon = item.icon;
                          const active = isActive(item.to);
                          return (
                            <Link
                              key={item.to}
                              to={item.to}
                              onClick={() => setMobileMenuOpen(false)}
                              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${
                                active
                                  ? "text-emerald-400 bg-emerald-500/5 font-semibold"
                                  : "text-[#8a8a9e] hover:text-[#f0f0f5] hover:bg-[#1a1a24]"
                              }`}
                            >
                              <ItemIcon
                                className={`w-4 h-4 ${
                                  active ? "text-emerald-400" : "text-[#5a5a6e]"
                                }`}
                              />
                              {item.label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
