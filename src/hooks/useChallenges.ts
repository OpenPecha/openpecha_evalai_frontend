import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { challengeApi } from "../api/challengeApi";
import type { SubmissionRequest } from "../types/challenge";

// Query keys
export const challengeKeys = {
  all: ["challenges"] as const,
  lists: () => [...challengeKeys.all, "list"] as const,
  list: (filters: string) => [...challengeKeys.lists(), { filters }] as const,
  details: () => [...challengeKeys.all, "detail"] as const,
  detail: (id: string) => [...challengeKeys.details(), id] as const,
  leaderboards: () => [...challengeKeys.all, "leaderboard"] as const,
  leaderboard: (challengeId: string, page?: number) =>
    [...challengeKeys.leaderboards(), challengeId, page] as const,
  submissions: () => [...challengeKeys.all, "submissions"] as const,
  userSubmissions: (challengeId: string, teamName?: string) =>
    [...challengeKeys.submissions(), challengeId, teamName] as const,
  submission: (id: string) =>
    [...challengeKeys.submissions(), "detail", id] as const,
};

// Hooks for challenges
export const useChallenges = () => {
  return useQuery({
    queryKey: challengeKeys.lists(),
    queryFn: challengeApi.getChallenges,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useChallenge = (id: string) => {
  return useQuery({
    queryKey: challengeKeys.detail(id),
    queryFn: () => challengeApi.getChallengeById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Hooks for leaderboards
export const useLeaderboard = (
  challengeId: string,
  page: number = 1,
  limit: number = 10
) => {
  return useQuery({
    queryKey: challengeKeys.leaderboard(challengeId, page),
    queryFn: () => challengeApi.getLeaderboard(challengeId, page, limit),
    enabled: !!challengeId,
    staleTime: 2 * 60 * 1000, // 2 minutes - leaderboards update more frequently
    gcTime: 5 * 60 * 1000,
  });
};

// Hooks for submissions
export const useUserSubmissions = (challengeId: string, teamName?: string) => {
  return useQuery({
    queryKey: challengeKeys.userSubmissions(challengeId, teamName),
    queryFn: () => challengeApi.getUserSubmissions(challengeId, teamName),
    enabled: !!challengeId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useSubmission = (id: string) => {
  return useQuery({
    queryKey: challengeKeys.submission(id),
    queryFn: () => challengeApi.getSubmissionById(id),
    enabled: !!id,
    staleTime: 30 * 1000, // 30 seconds - submission status might change
  });
};

// Mutation for submitting to challenge
export const useSubmitToChallenge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (submission: SubmissionRequest) =>
      challengeApi.submitToChallenge(submission),
    onSuccess: (data, variables) => {
      // Invalidate and refetch leaderboard
      queryClient.invalidateQueries({
        queryKey: challengeKeys.leaderboard(variables.challengeId),
      });

      // Invalidate user submissions
      queryClient.invalidateQueries({
        queryKey: challengeKeys.userSubmissions(
          variables.challengeId,
          variables.teamName
        ),
      });

      // Update challenge data (increment submission count)
      queryClient.invalidateQueries({
        queryKey: challengeKeys.detail(variables.challengeId),
      });
    },
    onError: (error) => {
      console.error("Submission failed:", error);
    },
  });
};

// Helper hook to prefetch challenge data
export const usePrefetchChallenge = () => {
  const queryClient = useQueryClient();

  return (challengeId: string) => {
    queryClient.prefetchQuery({
      queryKey: challengeKeys.detail(challengeId),
      queryFn: () => challengeApi.getChallengeById(challengeId),
      staleTime: 5 * 60 * 1000,
    });
  };
};

// Helper hook to prefetch leaderboard
export const usePrefetchLeaderboard = () => {
  const queryClient = useQueryClient();

  return (challengeId: string) => {
    queryClient.prefetchQuery({
      queryKey: challengeKeys.leaderboard(challengeId, 1),
      queryFn: () => challengeApi.getLeaderboard(challengeId, 1, 10),
      staleTime: 2 * 60 * 1000,
    });
  };
};
