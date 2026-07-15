import React from "react";
import { AlertTriangle } from "lucide-react";

export class ErrorBoundary extends React.Component<{ children: React.ReactNode, fallback: React.ReactNode }> {
  state = { hasError: false, error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

export function ErrorFallback() {
  return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center">
      <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-red-400 mb-2">Erro ao renderizar esta aba</h2>
      <p className="text-sm text-red-300/80 max-w-md mx-auto mb-4">
        Isso geralmente acontece porque uma query do backend falhou ou algum componente importado não foi encontrado. 
        Abra o console do navegador (F12) para ver os detalhes do erro.
      </p>
      <button 
        onClick={() => window.location.reload()} 
        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm font-medium transition-colors"
      >
        Recarregar Página
      </button>
    </div>
  );
}