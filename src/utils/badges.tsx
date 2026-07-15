// Elimina a duplicação da função getStatusBadge
export const getStatusBadge = (status: string) => {
  switch (status) {
    case "active": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "disbanded": return "bg-red-500/10 text-red-400 border-red-500/20";
    case "inactive": return "bg-[#1a1a24] text-[#5a5a6e] border-[#2a2a3a]";
    default: return "bg-[#1a1a24] text-[#5a5a6e] border-[#2a2a3a]";
  }
};

export const getStatusLabel = (status: string) => {
  switch (status) {
    case "active": return "Ativo";
    case "disbanded": return "Desativado";
    case "inactive": return "Inativo";
    default: return status;
  }
};