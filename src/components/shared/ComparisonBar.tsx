import { useMemo } from "react";
import { XCircle, BarChart2 } from "lucide-react";

interface ComparisonPlayer {
  name: string;
  stats: Array<{ label: string; value: string | number; color?: string }>;
}

interface ComparisonBarProps {
  players: ComparisonPlayer[];
  onRemove: (name: string) => void;
  onClear: () => void;
  maxItems?: number;
}

export function ComparisonBar({ players, onRemove, onClear }: ComparisonBarProps) {
  if (players.length < 2) return null;

  // Encontra o maior valor de kills para barra proporcional
  const maxValue = useMemo(() => {
    const killStats = players
      .map((p) => p.stats.find((s) => s.label === "Kills")?.value)
      .filter((v): v is number => typeof v === "number");
    return Math.max(...killStats, 1);
  }, [players]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#12121a]/95 backdrop-blur border-t border-[#2a2a3a] p-4 shadow-2xl">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-[#f0f0f5] flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-green-400" />
            Comparação ({players.length} jogadores)
          </h4>
          <button
            onClick={onClear}
            className="text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            Limpar comparação
          </button>
        </div>
        <div className={`grid gap-3 ${players.length <= 2 ? "grid-cols-2" : players.length === 3 ? "grid-cols-3" : "grid-cols-2 md:grid-cols-4"}`}>
          {players.map((p) => {
            const killsStat = p.stats.find((s) => s.label === "Kills");
            const killsValue = typeof killsStat?.value === "number" ? killsStat.value : 0;

            return (
              <div key={p.name} className="bg-[#1a1a24] rounded-xl border border-[#2a2a3a] p-3 relative">
                <button
                  onClick={() => onRemove(p.name)}
                  className="absolute top-2 right-2 p-1 hover:bg-[#2a2a3a] rounded transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5 text-[#5a5a6e]" />
                </button>
                <p className="text-xs text-[#5a5a6e] truncate pr-5">{p.name}</p>
                <div className="mt-2 space-y-1.5">
                  {killsStat && (
                    <div>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-[#5a5a6e]">Kills</span>
                        <span className="text-green-400 font-bold">{killsStat.value}</span>
                      </div>
                      <div className="h-1.5 bg-[#2a2a3a] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-400 rounded-full transition-all"
                          style={{ width: `${(killsValue / maxValue) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {p.stats
                    .filter((s) => s.label !== "Kills")
                    .map((stat) => (
                      <div key={stat.label} className="flex justify-between text-xs">
                        <span className="text-[#5a5a6e]">{stat.label}</span>
                        <span className={stat.color || "text-[#f0f0f5]"}>{stat.value}</span>
                      </div>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ComparisonBar;