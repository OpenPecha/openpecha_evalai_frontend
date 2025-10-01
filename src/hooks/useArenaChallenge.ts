import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { arenaApi } from '../api/arena_challenge';
import type { 
  ArenaChallenge, 
  ArenaChallengeRequest, 
  ArenaChallengeQuery
} from '../types/arena_challenge';

// Query Keys
export const arenaChallengeKeys = {
  all: ['arena-challenges'] as const,
  lists: () => [...arenaChallengeKeys.all, 'list'] as const,
  list: (filters?: ArenaChallengeQuery) => [...arenaChallengeKeys.lists(), filters] as const,
  paginated: (query: ArenaChallengeQuery & { page_number?: number }) => [...arenaChallengeKeys.all, 'paginated', query] as const,
  detail: (challengeId: string) => [...arenaChallengeKeys.all, 'detail', challengeId] as const,
  categories: () => [...arenaChallengeKeys.all, 'categories'] as const,
  rankings: () => [...arenaChallengeKeys.all, 'rankings'] as const,
  ranking: (challengeId: string) => [...arenaChallengeKeys.rankings(), challengeId] as const,
  allRankings: () => [...arenaChallengeKeys.all, 'all-rankings'] as const,
  rankingById: (challengeId: string, rankingBy: string) => [...arenaChallengeKeys.allRankings(), challengeId, rankingBy] as const,
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

// Hook to fetch paginated challenges with filters
export function usePaginatedArenaChallenges(query: ArenaChallengeQuery & { page_number?: number }, enabled = true) {
  return useQuery({
    queryKey: arenaChallengeKeys.paginated(query),
    queryFn: () => arenaApi.getChallengesWithPagination(query),
    enabled,
    staleTime: 1 * 60 * 1000, // 1 minute - paginated results change frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to fetch a single arena challenge by ID
export function useArenaChallenge(challengeId: string, enabled = true) {
  return useQuery({
    queryKey: arenaChallengeKeys.detail(challengeId),
    queryFn: () => arenaApi.getChallengeById(challengeId),
    enabled: enabled && !!challengeId,
    staleTime: 5 * 60 * 1000, // 5 minutes - challenge details don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes
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
    queryFn: () => arenaApi.getArenaRankingById(challengeId),
    enabled: !!challengeId,
    staleTime: 1 * 60 * 1000, // 1 minute - rankings change frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to fetch all arena rankings
export function useAllArenaRankings() {
  return useQuery({
    queryKey: arenaChallengeKeys.allRankings(),
    queryFn: () => arenaApi.getAllArenaRankings(),
    staleTime: 2 * 60 * 1000, // 2 minutes - rankings change frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to fetch arena ranking by ID with specific ranking type
export function useArenaRankingById(challengeId: string, rankingBy: 'combined' | 'template' | 'model', enabled = true) {
  return useQuery({
    queryKey: arenaChallengeKeys.rankingById(challengeId, rankingBy),
    queryFn: () => arenaApi.getArenaRankingById(challengeId, rankingBy),
    enabled: enabled && !!challengeId && !!rankingBy,
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
      // Invalidate all challenge-related queries
      queryClient.invalidateQueries({
        queryKey: arenaChallengeKeys.all,
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
    invalidateAllRankings: () => queryClient.invalidateQueries({ queryKey: arenaChallengeKeys.allRankings() }),
    invalidateRankingById: (challengeId: string, rankingBy: string) => 
      queryClient.invalidateQueries({ queryKey: arenaChallengeKeys.rankingById(challengeId, rankingBy) }),
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
        queryFn: () => arenaApi.getArenaRankingById(challengeId),
        staleTime: 1 * 60 * 1000,
      });
    },
    prefetchAllRankings: () => {
      queryClient.prefetchQuery({
        queryKey: arenaChallengeKeys.allRankings(),
        queryFn: () => arenaApi.getAllArenaRankings(),
        staleTime: 2 * 60 * 1000,
      });
    },
    prefetchRankingById: (challengeId: string, rankingBy: 'combined' | 'template' | 'model') => {
      queryClient.prefetchQuery({
        queryKey: arenaChallengeKeys.rankingById(challengeId, rankingBy),
        queryFn: () => arenaApi.getArenaRankingById(challengeId, rankingBy),
        staleTime: 1 * 60 * 1000,
      });
    },
  };
}
