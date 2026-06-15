import { Target } from "lucide-react";
import MainLayout from "@/layout/MainLayout";
import JogadoresTab from "./JogadoresTab";

export default function Jogadores() {
  return (
    <MainLayout>
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        <div className="bg-[#0a0a0f] border-b border-[#2a2a3a] -mx-4 lg:-mx-8 px-4 lg:px-8 py-12 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-8 h-8 text-green-400" />
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#f0f0f5]">
              Ranking de Jogadores
            </h1>
          </div>
          <p className="text-[#8a8a9e]">
            Estatísticas e classificação dos jogadores nos xtreinos
          </p>
        </div>

        <div className="pb-12">
          <JogadoresTab />  {/* ✅ Sem props! */}
        </div>
      </div>
    </MainLayout>
  );
}