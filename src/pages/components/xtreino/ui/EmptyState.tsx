import { type ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  return (
    <div className="px-6 py-16 text-center">
      <div className="w-12 h-12 mx-auto mb-4 text-[#2a2a3a]">{icon}</div>
      <p className="text-[#5a5a6e] text-lg font-medium">{title}</p>
      {subtitle && <p className="text-[#3a3a4e] text-sm mt-1">{subtitle}</p>}
    </div>
  );
}

export default EmptyState;