import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  return useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
  });
}

export function useIsAuthenticated() {
  const { data: user, isLoading } = useAuth();
  return {
    isAuthenticated: !!user,
    isLoading,
    user: user?.user,
  };
}
