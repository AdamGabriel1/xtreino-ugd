import { useState } from "react";
import {
  Dumbbell,
} from "lucide-react";
import MainLayout from "@/layout/MainLayout";
import XTreinosTab from "./components/XTreinosTab";

export default function XTreinos() {
  return (
    <MainLayout>
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="bg-black border-b border-[#1a2a1a] -mx-4 lg:-mx-8 px-4 lg:px-8 py-12 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Dumbbell className="w-8 h-8 text-emerald-400" />
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#e0f0e0]">
              XTreinos Underground
            </h1>
          </div>
          <p className="text-[#5a7a5a]">
            Classificação completa — Pontos por posição + Pontos por kill
          </p>
        </div>

        {/* Conteúdo reutilizável */}
        <div className="pb-12">
          <XTreinosTab />
        </div>
      </div>
    </MainLayout>
  );
}