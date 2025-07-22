import { useAuth0 as useAuth0SDK } from "@auth0/auth0-react";

// Enhanced useAuth0 hook with additional utilities
export const useAuth0 = () => {
  const auth0Context = useAuth0SDK();

  return {
    ...auth0Context,
    // Additional utility methods can be added here
    isFullyAuthenticated:
      auth0Context.isAuthenticated && !auth0Context.isLoading,
  };
};
