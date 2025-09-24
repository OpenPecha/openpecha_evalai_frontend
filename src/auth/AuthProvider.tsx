import React, { useState, useMemo, useCallback, useEffect, type ReactNode } from "react";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { setAuthTokenGetter } from "../lib/auth";
import { AuthContext } from "./auth-context";
import type { User } from "./types";

interface AuthProviderProps {
  children: ReactNode;
}

// Inner provider that uses Auth0 hooks
const AuthContextProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const {
    isAuthenticated,
    isLoading,
    user,
    getAccessTokenSilently,
    loginWithRedirect,
    logout: auth0Logout,
    error,
  } = useAuth0();

  // Track if silent auth was attempted to prevent infinite loops
  const [silentAuthAttempted, setSilentAuthAttempted] = useState(false);

  // Set up API token getter when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setAuthTokenGetter(getAccessTokenSilently);
    }
  }, [isAuthenticated, getAccessTokenSilently]);


  const getToken = useCallback(async (): Promise<string | null> => {
    try {
      const token = await getAccessTokenSilently();
      if (token) {
        localStorage.setItem("auth_token", token);
        localStorage.setItem("access_token", token);
      }
      return token;
    } catch (error) {
      console.error("Error getting Auth0 token:", error);
      return null;
    }
  }, [getAccessTokenSilently]);

  const login = useCallback(async (options?: { force?: boolean }) => {
    try {
      // If this is a forced login (user clicked login button), skip silent auth
      if (options?.force) {
        setSilentAuthAttempted(true);
        return loginWithRedirect({
          authorizationParams: {
            redirect_uri: `${window.location.origin}/callback`,
          },
        });
      }

      // If silent auth was already attempted and failed, don't try again
      if (silentAuthAttempted) {
        return;
      }

      console.log("Attempting silent authentication...");
      setSilentAuthAttempted(true);

      // Try silent authentication first
      await loginWithRedirect({
        authorizationParams: {
          redirect_uri: `${window.location.origin}/callback`,
          prompt: "none", // Silent auth
        },
      });
    } catch (error: unknown) {
      const authError = error as { error?: string };
      console.log("Silent auth failed, falling back to regular login:", error);
      
      // If silent auth fails, try regular login
      if (authError.error === "login_required" || authError.error === "consent_required") {
        loginWithRedirect({
          authorizationParams: {
            redirect_uri: `${window.location.origin}/callback`,
          },
        });
      }
    }
  }, [loginWithRedirect, silentAuthAttempted]);

  const logout = useCallback(() => {
    // Clear stored tokens
    localStorage.removeItem("auth_token");
    localStorage.removeItem("access_token");
    
    // Reset silent auth state
    setSilentAuthAttempted(false);
    
    auth0Logout({
      logoutParams: { returnTo: window.location.origin },
    });
  }, [auth0Logout]);

  // Function to force login (for explicit user action)
  const forceLogin = useCallback(() => {
    login({ force: true });
  }, [login]);

  // Auto-attempt silent login when app loads
  useEffect(() => {
    // Only attempt silent auth if:
    // 1. Not currently loading
    // 2. Not already authenticated
    // 3. Haven't attempted silent auth yet
    // 4. No Auth0 errors present
    if (!isLoading && !isAuthenticated && !silentAuthAttempted && !error) {
      console.log("Auto-attempting silent authentication...");
      login(); // This will try silent auth first
    }
  }, [isLoading, isAuthenticated, silentAuthAttempted, error, login]);

  const contextValue = useMemo(() => {
    const currentUser: User | null = user
      ? {
          id: user.sub || "",
          email: user.email || "",
          name: user.name,
          picture: user.picture,
        }
      : null;

    return {
      isAuthenticated,
      isLoading,
      currentUser,
      login: forceLogin, // Expose forceLogin as the main login function for components
      logout,
      getToken,
      error: error?.message || null,
    };
  }, [isAuthenticated, isLoading, user, forceLogin, logout, getToken, error]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Main provider that wraps everything
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const redirectUri = import.meta.env.VITE_AUTH0_REDIRECT_URI || `${window.location.origin}/callback`;

  return (
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: redirectUri,
        scope: "openid profile email",
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      }}
      useRefreshTokens={true}
      useRefreshTokensFallback={true}
      cacheLocation="localstorage"
    >
      <AuthContextProvider>
        {children}
      </AuthContextProvider>
    </Auth0Provider>
  );
};

export default AuthProvider;
