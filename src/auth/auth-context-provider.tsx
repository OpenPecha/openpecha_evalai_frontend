import React, { useState, useMemo, useCallback } from "react";
import type { ReactNode } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { AuthContext } from "./auth-context";
import type { User } from "./types";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Auth0 hook
  const {
    isAuthenticated,
    isLoading,
    user,
    getAccessTokenSilently,
    loginWithRedirect,
    logout: auth0Logout,
    error,
  } = useAuth0();

  const logout = useCallback(() => {
    // Clear stored auth token
    localStorage.removeItem("auth_token");

    // If using Auth0, use their logout function
    auth0Logout({
      logoutParams: { returnTo: window.location.origin },
      clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
    });
  }, [auth0Logout]);

  const getToken = useCallback(async (): Promise<string | null> => {
    // If using Auth0, get token from Auth0
    try {
      const access_token = await getAccessTokenSilently();
      // Store token in localStorage for API utils to access
      if (access_token) {
        localStorage.setItem("auth_token", access_token);
      }
      return access_token;
    } catch (error) {
      console.error("Error getting Auth0 token:", error);
      return null;
    }
  }, [getAccessTokenSilently]);

  // Track silent auth attempts to prevent infinite loops
  const [silentAuthAttempted, setSilentAuthAttempted] = useState(false);

  const login = useCallback(
    (auto: boolean) => {
      // If this is a silent auth attempt (auto=true)
      if (auto) {
        // If we've already tried silent auth and it failed, don't try again
        if (silentAuthAttempted) {
          return;
        }

        // Mark that we've attempted silent auth
        setSilentAuthAttempted(true);
      } else {
        // If this is an explicit login, reset the silent auth flag
        setSilentAuthAttempted(false);
      }

      loginWithRedirect({
        authorizationParams: {
          prompt: auto ? "none" : "login",
          redirect_uri: import.meta.env.VITE_WORKSPACE_URL+"/auth/callback",
        },
      });
    },
    [loginWithRedirect, silentAuthAttempted]
  );
  // Convert error to string | null to match AuthContextType
  const errorMessage = error ? error.message || "Authentication error" : null;

  // Use useMemo to prevent unnecessary re-renders
  const contextValue = useMemo(() => {
    // Use Auth0 user data
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
      login,
      logout,
      getToken,
      error: errorMessage,
    };
  }, [isAuthenticated, isLoading, user, login, logout, getToken, errorMessage]);

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
