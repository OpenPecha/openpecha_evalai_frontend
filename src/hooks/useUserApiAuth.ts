import { useEffect } from "react";
import { useAuth0 } from "./useAuth0";
import { setAuthTokenGetter } from "../api/user";

// Hook to initialize the user API with Auth0 token getter
export const useUserApiAuth = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  useEffect(() => {
    if (isAuthenticated) {
      // Set the token getter function in the user API
      setAuthTokenGetter(getAccessTokenSilently);
    }
  }, [isAuthenticated, getAccessTokenSilently]);
};

// Helper hook to ensure user data is fetched after Auth0 login
export const useAuthenticatedUser = () => {
  const { isAuthenticated, isLoading } = useAuth0();

  // Initialize the API auth
  useUserApiAuth();

  return {
    isAuthenticated,
    isLoading,
    shouldFetchUser: isAuthenticated && !isLoading,
  };
};
