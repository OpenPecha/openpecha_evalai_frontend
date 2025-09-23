import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Auth0Provider from "./auth/auth0-provider";
import { AuthProvider } from "./auth/auth-context-provider";
import AuthWrapper from "./components/AuthWrapper";
import "./index.css";
import "./i18n";
import App from "./app.tsx";
import { UserbackProvider } from "./context/UserbackProvider.tsx";
// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <Auth0Provider>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <AuthWrapper>
          <UserbackProvider>

          <BrowserRouter>
            <App />
          </BrowserRouter>
          </UserbackProvider>
        </AuthWrapper>
      </QueryClientProvider>
    </AuthProvider>
  </Auth0Provider>
);
