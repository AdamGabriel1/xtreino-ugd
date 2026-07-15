// src/app/scrims/utils/formatters.ts
// Funções utilitárias compartilhadas

export function formatDate(dateStr: string): string {
  if (!dateStr || dateStr === "all") return "";
  const [year, month, day] = dateStr.split("-");
  const monthNames = ["", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return `${day} ${monthNames[parseInt(month)]}`;
}

export function getRankStyle(index: number): string {
  if (index === 0) return "bg-yellow-500/5 border-l-2 border-yellow-500";
  if (index === 1) return "bg-gray-400/5 border-l-2 border-gray-400";
  if (index === 2) return "bg-amber-500/5 border-l-2 border-amber-500";
  return "border-l-2 border-transparent";
}

export function getPosColor(pos: number | null): string {
  if (!pos) return "text-[#5a5a6e]";
  if (pos === 1) return "text-yellow-400 font-bold";
  if (pos === 2) return "text-gray-300 font-bold";
  if (pos === 3) return "text-amber-500 font-bold";
  return "text-[#8a8a9e]";
}

export function getPosBg(pos: number | null): string {
  if (!pos) return "";
  if (pos === 1) return "bg-yellow-500/10";
  if (pos === 2) return "bg-gray-400/10";
  if (pos === 3) return "bg-amber-500/10";
  return "";
}
