import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../api/user";
import type { UserUpdateRequest, User } from "../types/user";

// Query keys
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  current: () => [...userKeys.all, "current"] as const,
  detail: (id: string) => [...userKeys.all, "detail", id] as const,
};

// Hook for current user
export const useCurrentUser = () => {
  return useQuery({
    queryKey: userKeys.current(),
    queryFn: userApi.getCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for user by ID
export const useUser = (userId: string) => {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => userApi.getUserProfile(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
  });
};

// Hook for listing all users
export const useUsers = () => {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: userApi.listUsers,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
  });
};

// Mutation for updating user profile
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: UserUpdateRequest) =>
      userApi.updateUserProfile(updates),
    onSuccess: (data) => {
      // Update current user cache
      queryClient.setQueryData(userKeys.current(), (oldData: any) => {
        return {
          ...oldData,
          data: data.data,
        };
      });

      // Invalidate user lists that might be affected
      queryClient.invalidateQueries({
        queryKey: userKeys.lists(),
      });
    },
    onError: (error) => {
      console.error("Profile update failed:", error);
    },
  });
};

// Mutation for creating a new user
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: Partial<User>) => userApi.createUser(userData),
    onSuccess: () => {
      // Invalidate user lists to show new user
      queryClient.invalidateQueries({
        queryKey: userKeys.lists(),
      });
    },
    onError: (error) => {
      console.error("User creation failed:", error);
    },
  });
};

// Mutation for deleting user account
export const useDeleteUserAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => userApi.deleteUserAccount(),
    onSuccess: () => {
      // Clear all user-related data from cache
      queryClient.removeQueries({
        queryKey: userKeys.current(),
      });

      // Invalidate user lists
      queryClient.invalidateQueries({
        queryKey: userKeys.lists(),
      });
    },
    onError: (error) => {
      console.error("Account deletion failed:", error);
    },
  });
};

// Helper hook to prefetch user data
export const usePrefetchUser = () => {
  const queryClient = useQueryClient();

  return (userId: string) => {
    queryClient.prefetchQuery({
      queryKey: userKeys.detail(userId),
      queryFn: () => userApi.getUserProfile(userId),
      staleTime: 2 * 60 * 1000,
    });
  };
};
