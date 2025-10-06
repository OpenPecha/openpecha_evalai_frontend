import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../api/user';
import type { User, UserCreate, UserUpdate } from '../types/user';

// Query Keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters?: Record<string, any>) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  me: () => [...userKeys.all, 'me'] as const,
  leaderboard: () => [...userKeys.all, 'leaderboard'] as const,
};

// Hook to fetch current user
export function useCurrentUser() {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: async () => {
      const response = await userApi.getCurrentUser();
      return response.data; // Extract data from ApiResponse wrapper
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on 401/403 errors (unauthorized/forbidden)
      if (error instanceof Error && (error.message.includes('401') || error.message.includes('403'))) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

// Hook to fetch user by ID
export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: async () => {
      const response = await userApi.getUserById(id);
      return response.data;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Hook to fetch all users
export function useUsers() {
  return useQuery({
    queryKey: userKeys.list(),
    queryFn: async () => {
      const response = await userApi.getAllUsers();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook to fetch user leaderboard
export function useUserLeaderboard() {
  return useQuery({
    queryKey: userKeys.leaderboard(),
    queryFn: async () => {
      const response = await userApi.getUserLeaderboard();
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - leaderboard changes frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to create a new user
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: UserCreate) => userApi.createUser(userData),
    onSuccess: (response) => {
      // Invalidate users list
      queryClient.invalidateQueries({
        queryKey: userKeys.lists(),
      });

      // Cache the new user
      if (response.data) {
        queryClient.setQueryData(
          userKeys.detail(response.data.id),
          response.data
        );
      }
    },
    onError: (error) => {
      console.error('Error creating user:', error);
    },
  });
}

// Hook to update user
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userData }: { id: string; userData: UserUpdate }) => 
      userApi.updateUser(id, userData),
    onSuccess: (response, variables) => {
      // Invalidate and update user cache
      if (response.data) {
        queryClient.setQueryData(
          userKeys.detail(variables.id),
          response.data
        );
      }

      // If updating current user, also update the 'me' cache
      queryClient.invalidateQueries({
        queryKey: userKeys.me(),
      });

      // Invalidate users list
      queryClient.invalidateQueries({
        queryKey: userKeys.lists(),
      });
    },
    onError: (error) => {
      console.error('Error updating user:', error);
    },
  });
}

// Hook to delete user
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userApi.deleteUser(id),
    onSuccess: (_, deletedId) => {
      // Remove user from cache
      queryClient.removeQueries({
        queryKey: userKeys.detail(deletedId),
      });

      // Invalidate users list
      queryClient.invalidateQueries({
        queryKey: userKeys.lists(),
      });

      // Invalidate leaderboard
      queryClient.invalidateQueries({
        queryKey: userKeys.leaderboard(),
      });
    },
    onError: (error) => {
      console.error('Error deleting user:', error);
    },
  });
}

// Hook to invalidate user caches
export function useInvalidateUsers() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
    invalidateMe: () => queryClient.invalidateQueries({ queryKey: userKeys.me() }),
    invalidateList: () => queryClient.invalidateQueries({ queryKey: userKeys.lists() }),
    invalidateUser: (id: string) => queryClient.invalidateQueries({ queryKey: userKeys.detail(id) }),
    invalidateLeaderboard: () => queryClient.invalidateQueries({ queryKey: userKeys.leaderboard() }),
  };
}

// Hook to prefetch user data
export function usePrefetchUser() {
  const queryClient = useQueryClient();

  return {
    prefetchUser: (id: string) => {
      queryClient.prefetchQuery({
        queryKey: userKeys.detail(id),
        queryFn: async () => {
          const response = await userApi.getUserById(id);
          return response.data;
        },
        staleTime: 10 * 60 * 1000,
      });
    },
    prefetchLeaderboard: () => {
      queryClient.prefetchQuery({
        queryKey: userKeys.leaderboard(),
        queryFn: async () => {
          const response = await userApi.getUserLeaderboard();
          return response.data;
        },
        staleTime: 2 * 60 * 1000,
      });
    },
  };
}
