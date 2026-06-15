export function LoadingSpinner({ text = "Carregando..." }: { text?: string }) {
  return (
    <div className="text-center py-12">
      <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-[#5a5a6e]">{text}</p>
    </div>
  );
}

export default LoadingSpinner;