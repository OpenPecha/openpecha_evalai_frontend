import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllTemplates, getPromptTemplate, createPromptTemplateV2 } from '../api/template';
import type { CreateTemplateV2, PromptTemplate } from '../types/template';

// Query Keys
export const templateKeys = {
  all: ['templates'] as const,
  lists: () => [...templateKeys.all, 'list'] as const,
  list: (challengeId: string, page: number) => [...templateKeys.lists(), challengeId, page] as const,
  details: () => [...templateKeys.all, 'detail'] as const,
  detail: (id: string) => [...templateKeys.details(), id] as const,
};

// Hook to fetch all templates for a challenge
export function useTemplates(challengeId: string, page: number = 1) {
  return useQuery({
    queryKey: templateKeys.list(challengeId, page),
    queryFn: () => getAllTemplates(challengeId, page),
    enabled: !!challengeId, // Only run query if challengeId is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook to fetch a single template by ID
export function useTemplate(id: string) {
  return useQuery({
    queryKey: templateKeys.detail(id),
    queryFn: () => getPromptTemplate(id),
    enabled: !!id, // Only run query if id is provided
    staleTime: 10 * 60 * 1000, // 10 minutes since individual templates change less frequently
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Hook to create a new template
export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (templateData: CreateTemplateV2) => createPromptTemplateV2(templateData),
    onSuccess: (newTemplate, variables) => {
      // Invalidate and refetch templates list for this challenge
      queryClient.invalidateQueries({
        queryKey: templateKeys.list(variables.challenge_id, 1),
      });

      // Optimistically add the new template to the cache
      queryClient.setQueryData(
        templateKeys.list(variables.challenge_id, 1),
        (old: PromptTemplate[] | undefined) => {
          if (!old) return [newTemplate];
          return [newTemplate, ...old];
        }
      );

      // Cache the individual template
      if (newTemplate?.template_detail?.id) {
        queryClient.setQueryData(
          templateKeys.detail(newTemplate.template_detail.id),
          newTemplate
        );
      }
    },
    onError: (error) => {
      console.error('Error creating template:', error);
    },
  });
}

// Hook to prefetch template details
export function usePrefetchTemplate() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: templateKeys.detail(id),
      queryFn: () => getPromptTemplate(id),
      staleTime: 10 * 60 * 1000,
    });
  };
}

// Hook to invalidate templates cache
export function useInvalidateTemplates() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: templateKeys.all }),
    invalidateList: (challengeId: string, page: number = 1) =>
      queryClient.invalidateQueries({ queryKey: templateKeys.list(challengeId, page) }),
    invalidateDetail: (id: string) =>
      queryClient.invalidateQueries({ queryKey: templateKeys.detail(id) }),
  };
}
