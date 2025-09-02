import { useAuth0 } from "./useAuth0";

// Helper hook to check authentication status and determine when to fetch user data
// Note: Auth setup is now handled by AuthWrapper component
export const useAuthenticatedUser = () => {
  const { isAuthenticated, isLoading } = useAuth0();

  return {
    isAuthenticated,
    isLoading,
    shouldFetchUser: isAuthenticated && !isLoading,
  };
};
