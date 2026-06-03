import { Link, useLocation } from "react-router";
import { useState } from "react";
import { Menu, X, Shield, Trophy, Dumbbell, Swords, BarChart3, Users, UserCircle, Gamepad2 } from "lucide-react";
import { trpc } from "@/providers/trpc";

const navLinks = [
  { path: "/", label: "Home", icon: Gamepad2 },
  { path: "/campeonatos", label: "Campeonatos", icon: Trophy },
  { path: "/xtreinos", label: "XTreinos", icon: Dumbbell },
  { path: "/scrims", label: "Scrims", icon: Swords },
  { path: "/rankings", label: "Rankings", icon: BarChart3 },
  { path: "/equipes", label: "Equipes", icon: Users },
  { path: "/jogadores", label: "Jogadores", icon: UserCircle },
];

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: settings } = trpc.settings.get.useQuery();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#0a0a0f]/95 backdrop-blur-sm border-b border-[#2a2a3a]">
      <div className="max-w-[1400px] mx-auto h-full flex items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <img
            src="../data/logo-xtreino.jpg"
            alt="XTreinos Logo"
            className="w-9 h-9 rounded-lg object-cover"
            draggable={false}
          />
          <span className="font-bold text-lg text-[#f0f0f5] hidden sm:block">
            {settings?.orgName ?? "XTreinos"}
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive(link.path)
                  ? "text-red-400 bg-red-500/10"
                  : "text-[#8a8a9e] hover:text-[#f0f0f5] hover:bg-[#1a1a24]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <Link
            to="/admin/login"
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg border border-[#3a3a4e] text-[#8a8a9e] text-sm font-medium hover:border-red-500/50 hover:text-red-400 transition-all duration-150"
          >
            <Shield className="w-4 h-4" />
            Área Admin
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg text-[#8a8a9e] hover:text-[#f0f0f5] hover:bg-[#1a1a24]"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 top-16 bg-[#0a0a0f]/98 backdrop-blur-md z-40">
          <div className="flex flex-col p-4 gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive(link.path)
                      ? "text-red-400 bg-red-500/10"
                      : "text-[#8a8a9e] hover:text-[#f0f0f5] hover:bg-[#1a1a24]"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {link.label}
                </Link>
              );
            })}
            <Link
              to="/admin/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#8a8a9e] hover:text-red-400 hover:bg-[#1a1a24] mt-4 border-t border-[#2a2a3a] pt-4"
            >
              <Shield className="w-5 h-5" />
              Área Admin
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}