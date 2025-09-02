import { useEffect } from "react";
import { useAuth0 } from "../hooks/useAuth0";
import { setAuthTokenGetter } from "../lib/auth";

interface AuthWrapperProps {
  children: React.ReactNode;
}

// Component that sets up the auth token getter for all APIs
const AuthWrapper = ({ children }: AuthWrapperProps) => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  useEffect(() => {
    if (isAuthenticated) {
      // Set up the token getter function for all APIs (centralized)
      setAuthTokenGetter(getAccessTokenSilently);
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  return <>{children}</>;
};

export default AuthWrapper;
