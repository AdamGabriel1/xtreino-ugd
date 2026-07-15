import { type ReactNode } from "react";

interface SummaryCard {
  icon: ReactNode;
  label: string;
  value: string | number;
  valueColor?: string;
}

interface SummaryCardsProps {
  cards: SummaryCard[];
  columns?: 2 | 3 | 4 | 5;
}

export function SummaryCards({ cards, columns = 4 }: SummaryCardsProps) {
  const colClass = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
    5: "grid-cols-2 md:grid-cols-5",
  };

  return (
    <div className={`grid ${colClass[columns]} gap-4`}>
      {cards.map((card, i) => (
        <div key={i} className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
          <div className="flex items-center gap-2 mb-2">
            {card.icon}
            <span className="text-xs text-[#5a5a6e] uppercase">{card.label}</span>
          </div>
          <p className={`text-2xl font-bold ${card.valueColor || "text-[#f0f0f5]"}`}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}

export default SummaryCards;