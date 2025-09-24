import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { arenaApi } from '../api/arena_challenge';
import type { 
  ArenaChallenge, 
  ArenaChallengeRequest, 
  ArenaChallengeQuery, 
  ArenaRanking,
  Category 
} from '../types/arena_challenge';

// Query Keys
export const arenaChallengeKeys = {
  all: ['arena-challenges'] as const,
  lists: () => [...arenaChallengeKeys.all, 'list'] as const,
  list: (filters?: ArenaChallengeQuery) => [...arenaChallengeKeys.lists(), filters] as const,
  categories: () => [...arenaChallengeKeys.all, 'categories'] as const,
  rankings: () => [...arenaChallengeKeys.all, 'rankings'] as const,
  ranking: (challengeId: string) => [...arenaChallengeKeys.rankings(), challengeId] as const,
};

// Hook to fetch all arena challenges
export function useArenaChallenges() {
  return useQuery({
    queryKey: arenaChallengeKeys.list(),
    queryFn: () => arenaApi.getChallenges(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook to fetch filtered challenges
export function useFilteredArenaChallenges(query: ArenaChallengeQuery, enabled = true) {
  return useQuery({
    queryKey: arenaChallengeKeys.list(query),
    queryFn: () => arenaApi.getFilteredChallenge(query),
    enabled: enabled && !!(query.from_language || query.to_language || query.text_category_id || query.challenge_name),
    staleTime: 2 * 60 * 1000, // 2 minutes for filtered results
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to fetch categories
export function useArenaCategories() {
  return useQuery({
    queryKey: arenaChallengeKeys.categories(),
    queryFn: () => arenaApi.getCategories(),
    staleTime: 15 * 60 * 1000, // 15 minutes - categories don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Hook to fetch rankings for a challenge
export function useArenaRanking(challengeId: string) {
  return useQuery({
    queryKey: arenaChallengeKeys.ranking(challengeId),
    queryFn: () => arenaApi.getRanking(challengeId),
    enabled: !!challengeId,
    staleTime: 1 * 60 * 1000, // 1 minute - rankings change frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to create a new challenge
export function useCreateArenaChallenge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (challengeData: ArenaChallengeRequest) => arenaApi.createChallenge(challengeData),
    onSuccess: (newChallenge) => {
      // Invalidate and refetch challenges list
      queryClient.invalidateQueries({
        queryKey: arenaChallengeKeys.lists(),
      });

      // Optimistically add the new challenge to the cache
      queryClient.setQueryData(
        arenaChallengeKeys.list(),
        (old: ArenaChallenge[] | undefined) => {
          if (!old) return [newChallenge];
          return [newChallenge, ...old];
        }
      );
    },
    onError: (error) => {
      console.error('Error creating arena challenge:', error);
    },
  });
}

// Hook to invalidate arena challenge caches
export function useInvalidateArenaChallenges() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: arenaChallengeKeys.all }),
    invalidateList: () => queryClient.invalidateQueries({ queryKey: arenaChallengeKeys.lists() }),
    invalidateCategories: () => queryClient.invalidateQueries({ queryKey: arenaChallengeKeys.categories() }),
    invalidateRankings: () => queryClient.invalidateQueries({ queryKey: arenaChallengeKeys.rankings() }),
  };
}

// Hook to prefetch related data
export function usePrefetchArenaData() {
  const queryClient = useQueryClient();

  return {
    prefetchChallenges: () => {
      queryClient.prefetchQuery({
        queryKey: arenaChallengeKeys.list(),
        queryFn: () => arenaApi.getChallenges(),
        staleTime: 5 * 60 * 1000,
      });
    },
    prefetchCategories: () => {
      queryClient.prefetchQuery({
        queryKey: arenaChallengeKeys.categories(),
        queryFn: () => arenaApi.getCategories(),
        staleTime: 15 * 60 * 1000,
      });
    },
    prefetchRanking: (challengeId: string) => {
      queryClient.prefetchQuery({
        queryKey: arenaChallengeKeys.ranking(challengeId),
        queryFn: () => arenaApi.getRanking(challengeId),
        staleTime: 1 * 60 * 1000,
      });
    },
  };
}
