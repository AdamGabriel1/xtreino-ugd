// src/app/scrims/components/EmptyState.tsx
"use client";

import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  return (
    <div className="text-center py-16 text-[#5a5a6e]">
      <div className="opacity-30 mb-4 flex justify-center">{icon}</div>
      <p className="text-lg font-medium">{title}</p>
      {subtitle && <p className="text-sm mt-1">{subtitle}</p>}
    </div>
  );
}
