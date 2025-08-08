import { useState, lazy, Suspense, useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Leaderboard from "./pages/Leaderboard";
import Leaderboards from "./pages/Leaderboards";
import Submission from "./pages/Submission";
import Profile from "./pages/Profile";
import MySubmissions from "./pages/MySubmissions";
import Settings from "./pages/Settings";
import CreateChallenge from "./pages/CreateChallenge";
import EditChallenge from "./pages/EditChallenge";
import "./app.css";
import { useAuth } from "./auth/use-auth-hook";
import { useAuthenticatedUser } from "./hooks/useUserApiAuth";
const Login = lazy(() => import("./pages/Login"));
const Callback = lazy(() => import("./pages/Callback"));

const App = () => {
  const { isAuthenticated, isLoading, getToken } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Initialize user API auth
  useAuthenticatedUser();

  useEffect(() => {
    if (isAuthenticated) {
      getToken().then((token) => {
        localStorage.setItem("access_token", token!);
      });
    }
  }, [isAuthenticated, isLoading, getToken]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar - Always visible on desktop */}
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-20 lg:hidden">
          <button
            className="fixed inset-0 bg-black bg-opacity-50 border-0 p-0"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close sidebar"
          />
        </div>
      )}

      {/* Main Content Area */}
      <div
        className={`transition-all duration-300 ${
          isSidebarOpen ? "lg:ml-64" : "lg:ml-16"
        } ml-0`}
      >
        {/* Main Content */}
        <main className="min-h-screen overflow-auto">
          <Routes>
            <Route
              path="/login"
              element={
                <Suspense
                  fallback={<FullScreenLoading message="Loading Login..." />}
                >
                  <Login />
                </Suspense>
              }
            />
            <Route
              path="/callback"
              element={
                <Suspense
                  fallback={<FullScreenLoading message="Authenticating..." />}
                >
                  <Callback />
                </Suspense>
              }
            />
            <Route
              path="/"
              element={
                <div className="p-4 lg:p-6">
                  <Home />
                </div>
              }
            />
            <Route path="/chat" element={<Chat />} />
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
          </Routes>
        </main>
      </div>
    </div>
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
