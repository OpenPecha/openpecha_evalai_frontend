import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllTemplates, getPromptTemplate, createPromptTemplateV2, deleteTemplate } from '../api/template';
import type { CreateTemplateV2 } from '../types/template';

const templatekey=["templates"]

// Hook to fetch all templates for a challenge
export function useTemplates(challengeId: string, page: number = 1) {
  return useQuery({
    queryKey: [...templatekey, challengeId, page],
    queryFn: () => getAllTemplates(challengeId, page),
    enabled: !!challengeId, // Only run query if challengeId is provided
  });
}

// Hook to fetch a single template by ID
export function useTemplate(id: string) {
  return useQuery({
    queryKey: templatekey,
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
    onSuccess: () => {
      // Invalidate and refetch templates list for this challenge
      queryClient.invalidateQueries({
        queryKey: templatekey
      });
    },
    onError: (error) => {
      console.error('Error creating template:', error);
    },
  });
}

// Hook to delete a template
export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (templateId: string) => deleteTemplate(templateId),
    onSuccess: (_, deletedTemplateId) => {
      console.log('Template deleted successfully, invalidating cache...', deletedTemplateId);
      // Invalidate and refetch templates list
      queryClient.invalidateQueries({
        queryKey: templatekey
      });
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
      queryKey: templatekey,
      queryFn: () => getPromptTemplate(id),
      staleTime: 10 * 60 * 1000,
    });
  };
}

