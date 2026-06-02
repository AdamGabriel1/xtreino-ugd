import { useCallback } from "react";
import { trpc } from "@/providers/trpc";

export function useAuth() {
  const utils = trpc.useUtils();
  const { data: admin, isLoading } = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logout = useCallback(() => {
    localStorage.removeItem("adminToken");
    utils.auth.me.invalidate();
    window.location.href = "/admin/login";
  }, [utils]);

  return {
    admin,
    isLoading,
    isAuthenticated: !!admin,
    logout,
  };
}
