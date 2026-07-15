// src/app/scrims/components/RankBadge.tsx
"use client";

import { Trophy, Award } from "lucide-react";

interface RankBadgeProps {
  index: number;
}

export function RankBadge({ index }: RankBadgeProps) {
  if (index === 0) {
    return (
      <div className="flex justify-center">
        <Trophy className="w-5 h-5 text-yellow-400" />
      </div>
    );
  }
  if (index === 1) {
    return (
      <div className="flex justify-center">
        <Award className="w-5 h-5 text-gray-300" />
      </div>
    );
  }
  if (index === 2) {
    return (
      <div className="flex justify-center">
        <Award className="w-5 h-5 text-amber-600" />
      </div>
    );
  }
  return (
    <span className="text-sm font-bold text-[#5a5a6e] text-center block">
      {index + 1}
    </span>
  );
}
