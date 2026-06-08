import { useState } from "react";
import { useNavigate } from "react-router";
import { Shield, Lock, User, Eye, EyeOff } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const login = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("adminToken", data.token);
      toast.success("Login realizado com sucesso!");
      navigate("/admin");
    },
    onError: (err) => {
      setError(err.message);
      toast.error("Erro ao fazer login");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username || !password) {
      setError("Preencha todos os campos");
      return;
    }
    login.mutate({ username, password });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-[#12121a] rounded-2xl border border-[#2a2a3a] p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#f0f0f5] mb-1">Login Administrativo</h1>
            <p className="text-sm text-[#8a8a9e]">Acesse o painel de administracao</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-[#8a8a9e] mb-2">Usuario</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5a6e]" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="usuario"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm placeholder-[#5a5a6e] focus:outline-none focus:border-green-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#8a8a9e] mb-2">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5a6e]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="senha"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#1a1a24] border border-[#2a2a3a] text-[#f0f0f5] text-sm placeholder-[#5a5a6e] focus:outline-none focus:border-green-500/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5a5a6e] hover:text-[#8a8a9e]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={login.isPending}
              className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold transition-all disabled:opacity-50"
            >
              {login.isPending ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/" className="text-sm text-[#8a8a9e] hover:text-[#f0f0f5] transition-colors">
              Voltar para o site
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}