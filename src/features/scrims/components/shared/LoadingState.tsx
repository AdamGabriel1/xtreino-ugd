"use client";

import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  text?: string;
}

export function LoadingState({ text = "Carregando..." }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-[#5a5a6e]">
      <Loader2 className="w-8 h-8 animate-spin mb-3" />
      <p className="text-sm">{text}</p>
    </div>
  );
}