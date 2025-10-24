import { useState, lazy, Suspense, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";

import Sidebar from "./components/Sidebar";
import { ToastProvider } from "./components/ToastContainer";
import Home from "./pages/Home";
import Arena from "./pages/Arena";
import ArenaContribute from "./pages/ArenaContribute";
import ArenaTemplate from "./pages/ArenaTemplate";
import ArenaReview from "./pages/ArenaReview";
import Leaderboard from "./pages/Leaderboard";
import Leaderboards from "./pages/Leaderboards";
import LeaderboardEmbed from "./pages/LeaderboardEmbed";
import Submission from "./pages/Submission";
import Profile from "./pages/Profile";
import MySubmissions from "./pages/MySubmissions";
import Settings from "./pages/Settings";
import CreateChallenge from "./pages/CreateChallenge";
import EditChallenge from "./pages/EditChallenge";
// CSS imports handled in main.tsx
import { useAuth } from "./auth/use-auth-hook";
import { useTheme } from "./hooks/useTheme";
import { useTokenExpiration } from "./hooks/useTokenExpiration";
import { useTranslation } from "react-i18next";
import JsonViewer from "./components/JsonViewer";
import { SAMPLE_UCCA } from "./utils/data";

const Login = lazy(() => import("./pages/Login"));
const Callback = lazy(() => import("./pages/Callback"));


const App = () => {
  const { isAuthenticated, isLoading, getToken } = useAuth();
  const { i18n } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Initialize theme system at root level
  useTheme();
  useTokenExpiration();

  // Handle font switching based on language
  useEffect(() => {
    const body = document.body;
    
    if (i18n.language === 'bo') {
      // Add Tibetan font for Tibetan language
      body.classList.add('font-monlam');
    } else {
      // Remove Tibetan font for other languages
      body.classList.remove('font-monlam');
    }
    
    // Cleanup function to remove the class when component unmounts
    return () => {
      body.classList.remove('font-monlam');
    };
  }, [i18n.language]);

  // Store token when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      getToken()
    }
  }, [isAuthenticated, getToken]);

  // Show loading state while auth is initializing
  if (isLoading) {
    return <FullScreenLoading message="Loading..." />;
  }
  



  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <ToastProvider>
      <div className="min-h-screen ">
        <Routes>
          {/* Embed routes - no sidebar */}
          <Route
            path="/embed/leaderboard/:challengeId"
            element={<LeaderboardEmbed />}
          />

          {/* Regular app routes - with sidebar */}
          <Route
            path="/*"
            element={
              <>
                {/* Mobile Hamburger Menu Button */}
                <button
                  onClick={toggleMobileMenu}
                  className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700"
                  aria-label="Toggle mobile menu"
                >
                  <Menu className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
                </button>

                {/* Sidebar - Desktop and Mobile */}
                <Sidebar 
                  isOpen={isSidebarOpen} 
                  onToggle={toggleSidebar}
                  isMobileMenuOpen={isMobileMenuOpen}
                  onCloseMobileMenu={closeMobileMenu}
                />

                {/* Mobile Sidebar Overlay */}
                {isMobileMenuOpen && (
                  <div className="fixed inset-0 z-20 lg:hidden">
                    <button
                      className="fixed inset-0 bg-black/20 bg-opacity-50 border-0 p-0"
                      onClick={closeMobileMenu}
                      aria-label="Close sidebar"
                    />
                  </div>
                )}

                {/* Main Content Area */}
                <div
                  className={`transition-all  duration-300 ${
                    isSidebarOpen ? "lg:ml-64" : "lg:ml-16"
                  } ml-0 h-screen flex flex-col`}
                >
                  {/* Main Content */}
                  <main className="flex-1  relative overflow-auto pt-16 lg:pt-0">
                    <Routes>
                      <Route
                        path="/login"
                        element={
                          <Suspense
                            fallback={
                              <FullScreenLoading message="Loading Login..." />
                            }
                          >
                            <Login />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/callback"
                        element={
                          <Suspense
                            fallback={
                              <FullScreenLoading message="Authenticating..." />
                            }
                          >
                            <Callback />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/"
                        element={
                          <div className="p-4 lg:p-6">
                            <Leaderboards />
                          </div>
                        }
                      />
                      <Route
                        path="/benchmark_eval"
                        element={
                          <div className="p-4 lg:p-6">
                            <Home />
                          </div>
                        }
                      />
                      <Route path="/arena" element={<Arena />} />
                      <Route path="/arena/:challengeId/contribute" element={<ArenaContribute />} />
                      <Route path="/arena/:challengeId/contribute/:templateId" element={<ArenaTemplate />} />
                      <Route path="/arena/:challengeId/review" element={<ArenaReview />} />
                      <Route
                        path="/leaderboards"
                        element={
                          <div className="p-4 lg:p-6">
                            <Leaderboards />
                          </div>
                        }
                      />
                      <Route
                        path="/leaderboard/:challengeId"
                        element={
                          <div className="p-4 lg:p-6">
                            <Leaderboard />
                          </div>
                        }
                      />

                      <Route
                        path="/submit/:challengeId"
                        element={
                          <div className="p-4 lg:p-6">
                            <Submission />
                          </div>
                        }
                      />
                      <Route
                        path="/profile"
                        element={
                          <div className="p-4 lg:p-6">
                            <Profile />
                          </div>
                        }
                      />
                      <Route
                        path="/my-submissions"
                        element={
                          <div className="p-4 lg:p-6">
                            <MySubmissions />
                          </div>
                        }
                      />
                      <Route
                        path="/settings"
                        element={
                          <div className="p-4 lg:p-6">
                            <Settings />
                          </div>
                        }
                      />
                      <Route
                        path="/admin/create-challenge"
                        element={
                          <div className="p-4 lg:p-6">
                            <CreateChallenge />
                          </div>
                        }
                      />
                      <Route
                        path="/admin/edit-challenge/:challengeId"
                        element={
                          <div className="p-4 lg:p-6">
                            <EditChallenge />
                          </div>
                        }
                      />
                      <Route
                        path="/json-viewer"
                        element={
                          <div className="p-4 lg:p-6">
                            <JsonViewer json={SAMPLE_UCCA}/>
                          </div>
                        }
                      />
                    </Routes>
                  </main>
                </div>
              </>
            }
          />
        </Routes>

      </div>
    </ToastProvider>
  );
};

export default App;

export const FullScreenLoading: React.FC<{ message?: string }> = ({
  message = "Loading Dashboard...",
}) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-16 flex items-center justify-center">
    <Loading size="lg" message={message} />
  </div>
);
interface LoadingProps {
  size?: "sm" | "md" | "lg";
  message?: string;
  className?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  size = "md",
  message = "Loading...",
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div className={`flex items-center justify-center py-8 ${className}`}>
      <div className="text-center">
        <div
          className={`inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] ${sizeClasses[size]} text-blue-600 mb-2`}
        />
        <p className={`text-blue-600 ${textSizeClasses[size]}`}>{message}</p>
      </div>
    </div>
  );
};
