import { useState, useCallback } from "react";

interface UseImageUploadReturn {
  preview: string | null;
  isUploading: boolean;
  error: string | null;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  clearImage: () => void;
  setPreview: (url: string | null) => void;
}

export function useImageUpload(): UseImageUploadReturn {
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Preview local imediato
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro no upload");
      }

      // Substitui preview local pela URL do servidor
      setPreview(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  }, []);

  const clearImage = useCallback(() => {
    setPreview(null);
    setError(null);
  }, []);

  return {
    preview,
    isUploading,
    error,
    handleFileSelect,
    clearImage,
    setPreview,
  };
}
