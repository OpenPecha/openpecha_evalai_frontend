import { useEffect } from "react";
import { useAuth0 } from "../hooks/useAuth0";
import { setAuthTokenGetter as setUserAuthTokenGetter } from "../api/user";
import { setAuthTokenGetter as setChallengeAuthTokenGetter } from "../api/challenge";

interface AuthWrapperProps {
  children: React.ReactNode;
}

// Component that sets up the auth token getter for the user API
const AuthWrapper = ({ children }: AuthWrapperProps) => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  useEffect(() => {
    if (isAuthenticated) {
      // Set up the token getter function for both APIs
      setUserAuthTokenGetter(getAccessTokenSilently);
      setChallengeAuthTokenGetter(getAccessTokenSilently);
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  return <>{children}</>;
};

export default AuthWrapper;
