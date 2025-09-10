import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toolsApi } from "../api/tools";

// Query keys
export const toolsKeys = {
  all: ["tools"] as const,
  list: () => [...toolsKeys.all, "list"] as const,
};

// Hook for tools list
export const useTools = () => {
  return useQuery({
    queryKey: toolsKeys.list(),
    queryFn: toolsApi.getTools,
    staleTime: 10 * 60 * 1000, // 10 minutes - tools don't change frequently
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Helper hook to prefetch tools data
export const usePrefetchTools = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: toolsKeys.list(),
      queryFn: toolsApi.getTools,
      staleTime: 10 * 60 * 1000,
    });
  };
};
