import type { ReactNode } from "react";
import { Auth0Provider as Auth0ProviderSDK } from "@auth0/auth0-react";

interface Auth0ProviderProps {
  children: ReactNode;
}

const Auth0Provider = ({ children }: Auth0ProviderProps) => {
  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE;
  const redirectUri =
    import.meta.env.VITE_AUTH0_REDIRECT_URI || window.location.origin;

  if (!domain || !clientId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Authentication Configuration Missing
          </h2>
          <p className="text-red-600 text-sm">
            Please configure your Auth0 credentials in the .env file. Required
            variables:
          </p>
          <ul className="mt-2 text-red-600 text-sm list-disc list-inside">
            <li>VITE_AUTH0_DOMAIN</li>
            <li>VITE_AUTH0_CLIENT_ID</li>
            <li>VITE_AUTH0_AUDIENCE (optional)</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <Auth0ProviderSDK
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        audience: audience,
        scope: "openid profile email",
      }}
      cacheLocation="localstorage"
      useRefreshTokens={true}
    >
      {children}
    </Auth0ProviderSDK>
  );
};

export default Auth0Provider;
