import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string | null; // Corrigido aqui para aceitar null
  extraInfo?: ReactNode;
  icon: ReactNode;
  onBack: () => void;
  backLabel?: string;
}

export default function PageHeader({ title, subtitle, extraInfo, icon, onBack, backLabel = "Voltar" }: PageHeaderProps) {
  return (
    <div className="bg-[#12121a] border-b border-[#2a2a3a]">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#5a5a6e] hover:text-[#f0f0f5] transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">{backLabel}</span>
        </button>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-900/30 to-emerald-600/10 flex items-center justify-center shrink-0 border border-[#2a2a3a]">
            {icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-[#f0f0f5]">{title}</h1>
              {extraInfo}
            </div>
            {subtitle && (
              <p className="text-sm text-[#8a8a9e] mt-1">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}