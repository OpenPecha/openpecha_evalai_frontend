import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { translateApi } from "../api/translate";

// Query keys
export const translateKeys = {
  all: ["translate"] as const,
  leaderboard: () => [...translateKeys.all, "leaderboard"] as const,
  userVoteLeaderboard: () => [...translateKeys.all, "user-vote-leaderboard"] as const,
  modelVoteLeaderboard: () => [...translateKeys.all, "model-vote-leaderboard"] as const,
  models: () => [...translateKeys.all, "models"] as const,
  suggestions: (query: string) => [...translateKeys.models(), "suggestions", query] as const,
};

// Hook for translation leaderboard
export const useTranslationLeaderboard = () => {
  return useQuery({
    queryKey: translateKeys.leaderboard(),
    queryFn: translateApi.getTranslationLeaderboard,
    staleTime: 2 * 60 * 1000, // 2 minutes - leaderboards update frequently due to voting
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Hook for user vote leaderboard
export const useUserVoteLeaderboard = () => {
  return useQuery({
    queryKey: translateKeys.userVoteLeaderboard(),
    queryFn: translateApi.getUserVoteLeaderboard,
    staleTime: 5 * 60 * 1000, // 5 minutes - user vote stats update less frequently
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Hook for model vote leaderboard
export const useModelVoteLeaderboard = () => {
  return useQuery({
    queryKey: translateKeys.modelVoteLeaderboard(),
    queryFn: translateApi.getModelVoteLeaderboard,
    staleTime: 2 * 60 * 1000, // 2 minutes - model scores update frequently due to voting
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Hook for model suggestions
export const useModelSuggestions = (sourceText: string, token?: string) => {
  return useQuery({
    queryKey: translateKeys.suggestions(sourceText),
    queryFn: () => translateApi.suggestModels(token, sourceText),
    enabled: !!sourceText && sourceText.length > 2, // Only fetch if source text is meaningful
    staleTime: 5 * 60 * 1000, // 5 minutes - model suggestions don't change often
    gcTime: 10 * 60 * 1000,
  });
};

// Mutation for voting on models
export const useVoteOnModel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      translationOutput1Id, 
      translationOutput2Id, 
      winnerChoice, 
      responseTimeMs, 
      token 
    }: { 
      translationOutput1Id: string; 
      translationOutput2Id: string; 
      winnerChoice: "output1" | "output2" | "tie" | "neither"; 
      responseTimeMs: number; 
      token: string 
    }) =>
      translateApi.voteModel(translationOutput1Id, translationOutput2Id, winnerChoice, responseTimeMs, token),
    onSuccess: () => {
      // Invalidate and refetch leaderboard after voting (all endpoints)
      queryClient.invalidateQueries({
        queryKey: translateKeys.leaderboard(),
      });
      
      // Invalidate user vote leaderboard since voting affects user vote counts
      queryClient.invalidateQueries({
        queryKey: translateKeys.userVoteLeaderboard(),
      });
      
      // Invalidate model vote leaderboard since voting affects model scores
      queryClient.invalidateQueries({
        queryKey: translateKeys.modelVoteLeaderboard(),
      });
      
      // Force immediate refetch for better UX
      queryClient.refetchQueries({
        queryKey: translateKeys.leaderboard(),
      });
      
      queryClient.refetchQueries({
        queryKey: translateKeys.userVoteLeaderboard(),
      });
      
      queryClient.refetchQueries({
        queryKey: translateKeys.modelVoteLeaderboard(),
      });
      
      // Also invalidate score endpoint for real-time updates
      queryClient.invalidateQueries({
        queryKey: translateKeys.all,
        predicate: (query) => query.queryKey.includes('score') || query.queryKey.includes('leaderboard')
      });
    },
    onError: (error) => {
      console.error("Vote submission failed:", error);
    },
  });
};

// Helper hook to prefetch leaderboard data
export const usePrefetchTranslationLeaderboard = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: translateKeys.leaderboard(),
      queryFn: translateApi.getTranslationLeaderboard,
      staleTime: 2 * 60 * 1000,
    });
  };
};
