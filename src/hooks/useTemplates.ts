import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllTemplates, getPromptTemplate, createPromptTemplateV2, deleteTemplate } from '../api/template';
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

// Hook to delete a template
export function useDeleteTemplate(challengeId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (templateId: string) => deleteTemplate(templateId),
    onSuccess: (_, deletedTemplateId) => {
      console.log('Template deleted successfully, invalidating cache...');
      
      // Remove the deleted template from detail cache
      queryClient.removeQueries({
        queryKey: templateKeys.detail(deletedTemplateId),
      });

      // If we have challengeId, be specific about invalidation
      if (challengeId) {
        console.log('Invalidating templates for challenge:', challengeId);
        
        // First, manually update the cached data to remove the deleted template immediately
        queryClient.setQueryData(
          templateKeys.list(challengeId, 1),
          (oldData: PromptTemplate[] | undefined) => {
            if (Array.isArray(oldData)) {
              console.log('Removing template from cached data:', deletedTemplateId);
              const updatedData = oldData.filter((template: PromptTemplate) => 
                template?.template_detail?.id !== deletedTemplateId
              );
              console.log('Updated cached data, removed template. New count:', updatedData.length);
              return updatedData;
            }
            return oldData;
          }
        );
        
        // Then invalidate to trigger a fresh fetch (in case there are server-side changes)
        queryClient.invalidateQueries({
          queryKey: templateKeys.list(challengeId, 1),
        });
      } else {
        // Fallback: invalidate ALL template queries
        console.log('No challengeId provided, invalidating all template queries');
        queryClient.invalidateQueries({
          queryKey: templateKeys.all,
        });
      }
    },
    onError: (error) => {
      console.error('Error deleting template:', error);
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
