import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Trophy,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  User,
  LogOut,
  Settings,
  FileText,
  ChevronDown,
  ChevronUp,
  Sun,
  Moon,
  Monitor,
  MessageCircle,
  Plus,
  BookOpen,
} from "lucide-react";
import { useAuth0 } from "../hooks/useAuth0";
import { useTheme } from "../hooks/useTheme";
import { useCurrentUser } from "../hooks/useUsers";

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

const Sidebar = ({ isOpen = true, onToggle }: SidebarProps) => {
  const location = useLocation();
  const {
    user: auth0User,
    loginWithRedirect,
    logout,
    isAuthenticated,
    isLoading,
  } = useAuth0();
  const { theme, setTheme } = useTheme();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Fetch additional user data from our API
  const { data: currentUserData } = useCurrentUser();
  const user = currentUserData?.data || auth0User; // Fallback to Auth0 user if API user not available

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const isLeaderboardPath = () => {
    return (
      location.pathname.startsWith("/leaderboard") ||
      location.pathname === "/" ||
      location.pathname === "/leaderboards"
    );
  };

  const handleLogin = () => {
    loginWithRedirect();
  };

  const handleLogout = () => {
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  };

  const getThemeIcon = (themeOption: string) => {
    switch (themeOption) {
      case "light":
        return <Sun className="w-3 h-3" />;
      case "dark":
        return <Moon className="w-3 h-3" />;
      case "system":
        return <Monitor className="w-3 h-3" />;
      default:
        return <Sun className="w-3 h-3" />;
    }
  };

  const getThemeLabel = (themeOption: string) => {
    switch (themeOption) {
      case "light":
        return "Light";
      case "dark":
        return "Dark";
      case "system":
        return "System";
      default:
        return "Light";
    }
  };

  return (
    <div
      className={`${
        isOpen ? "w-64" : "w-16"
      } bg-white dark:bg-neutral-800 dark:text-neutral-100 shadow-lg border-r border-neutral-200 dark:border-neutral-700 h-screen overflow-y-auto transition-all duration-300 flex flex-col fixed top-0 left-0 z-30 lg:block ${
        isOpen ? "block" : "hidden"
      }`}
    >
      {/* Header with Logo and Toggle Button */}
      <div
        className={`flex items-center ${
          isOpen ? "justify-between" : "justify-center"
        } p-4 border-b border-neutral-200 dark:border-neutral-700`}
      >
        {isOpen ? (
          <>
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                {import.meta.env.VITE_APP_NAME || "Evaluate"}
              </span>
            </Link>
            {/* Toggle button */}
            {onToggle && (
              <button
                onClick={onToggle}
                className="p-1 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 rounded-md transition-colors duration-200"
                title="Collapse sidebar"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
          </>
        ) : (
          /* Collapsed state - just logo and toggle */
          <div className="flex flex-col items-center space-y-2">
            <Link
              to="/"
              className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center"
            >
              <Trophy className="w-5 h-5 text-white" />
            </Link>
            {onToggle && (
              <button
                onClick={onToggle}
                className="p-1 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 rounded-md transition-colors duration-200"
                title="Expand sidebar"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="p-4">
        {isOpen && (
          <h2 className="text-sm font-semibold text-neutral-300 dark:text-neutral-200 uppercase tracking-wider mb-4">
            Navigation
          </h2>
        )}

        <div
          className={`${
            isOpen ? "space-y-2" : "space-y-3 flex flex-col items-center"
          }`}
        >
          <Link
            to="/chat"
            className={`flex items-center rounded-lg text-sm font-medium transition-colors duration-200 ${
              isOpen ? "px-3 py-2" : "p-2 justify-center"
            } ${
              isActivePath("/chat")
                ? "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 border-l-4 border-blue-600 dark:border-blue-400"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-700"
            }`}
            title={isOpen ? "" : "Chat (Coming Soon)"}
          >
            <MessageCircle className={`w-4 h-4 ${isOpen ? "mr-3" : ""}`} />
            {isOpen && (
              <div className="flex items-center justify-between w-full">
                <span>Translation Arena</span>
              </div>
            )}
          </Link>

          {/* Challenges Link */}
          <Link
            to="/challenges"
            className={`flex items-center rounded-lg text-sm font-medium transition-colors duration-200 ${
              isOpen ? "px-3 py-2" : "p-2 justify-center"
            } ${
              isActivePath("/challenges")
                ? "text-primary-600 bg-primary-50 border-l-4 border-blue-600"
                : "text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-700"
            }`}
            title={isOpen ? "" : "Challenges"}
          >
            <Trophy className={`w-4 h-4 ${isOpen ? "mr-3" : ""}`} />
            {isOpen && "Challenges"}
          </Link>

          {/* Leaderboards Link */}
          <Link
            to="/leaderboards"
            className={`flex items-center rounded-lg text-sm font-medium transition-colors duration-200 ${
              isOpen ? "px-3 py-2" : "p-2 justify-center"
            } ${
              isLeaderboardPath()
                ? "text-primary-600 bg-primary-50 border-l-4 border-blue-600"
                : "text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-700"
            }`}
            title={isOpen ? "" : "Leaderboards"}
          >
            <BarChart3 className={`w-4 h-4 ${isOpen ? "mr-3" : ""}`} />
            {isOpen && "Leaderboards"}
          </Link>

          {/* Documentation Link */}
          <a
            href={`${
              import.meta.env.VITE_SERVER_URL || "https://eval-api.pecha.tools"
            }/documentation`}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center rounded-lg text-sm font-medium transition-colors duration-200 ${
              isOpen ? "px-3 py-2" : "p-2 justify-center"
            } text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-700`}
            title={isOpen ? "" : "API Documentation"}
          >
            <BookOpen className={`w-4 h-4 ${isOpen ? "mr-3" : ""}`} />
            {isOpen && "Documentation"}
          </a>
        </div>
      </div>

      {/* Admin Section */}
      {isAuthenticated && user?.role === "admin" && (
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
          {isOpen && (
            <h2 className="text-sm font-semibold text-neutral-500 dark:text-neutral-200 uppercase tracking-wider mb-4">
              Admin
            </h2>
          )}

          <div
            className={`${
              isOpen ? "space-y-2" : "space-y-3 flex flex-col items-center"
            }`}
          >
            <Link
              to="/admin/create-challenge"
              className={`flex items-center rounded-lg text-sm font-medium transition-colors duration-200 ${
                isOpen ? "px-3 py-2" : "p-2 justify-center"
              } ${
                isActivePath("/admin/create-challenge")
                  ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-600 dark:border-green-400"
                  : "text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-700"
              }`}
              title={isOpen ? "" : "Create Challenge"}
            >
              <Plus className={`w-4 h-4 ${isOpen ? "mr-3" : ""}`} />
              {isOpen && "Create Challenge"}
            </Link>
          </div>
        </div>
      )}

      {/* User Section at Bottom */}
      <div
        className={`mt-auto border-t border-neutral-200 dark:border-neutral-700 ${
          isOpen ? "p-4" : "p-2"
        }`}
      >
        {isLoading && (
          /* Loading State */
          <div
            className={`flex items-center ${
              isOpen ? "space-x-3" : "justify-center"
            }`}
          >
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            {isOpen && (
              <span className="text-sm text-neutral-500 dark:text-neutral-200">
                Loading...
              </span>
            )}
          </div>
        )}
        {!isLoading && isAuthenticated && (
          /* Authenticated User */
          <div className="space-y-2">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className={`w-full flex items-center ${
                isOpen ? "justify-between" : "justify-center"
              } p-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-lg transition-colors duration-200`}
            >
              <div className={`flex items-center ${isOpen ? "space-x-3" : ""}`}>
                {user?.avatar ? (
                  <img
                    className="w-6 h-6 rounded-full object-cover"
                    src={user.avatar}
                    alt={user.name || "User avatar"}
                  />
                ) : (
                  <div className="w-6 h-6 bg-neutral-300 dark:bg-neutral-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-neutral-600 dark:text-neutral-200" />
                  </div>
                )}
                {isOpen && (
                  <span className="font-medium truncate text-neutral-900 dark:text-neutral-100">
                    {user?.name || user?.email || "User"}
                  </span>
                )}
              </div>
              {isOpen &&
                (isUserMenuOpen ? (
                  <ChevronUp className="w-4 h-4 text-neutral-500 dark:text-neutral-200" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-neutral-500 dark:text-neutral-200" />
                ))}
            </button>

            {/* User Menu Dropdown */}
            {isUserMenuOpen && isOpen && (
              <div className="space-y-1 pl-2">
                <Link
                  to="/profile"
                  className="flex items-center px-3 py-2 text-xs text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-lg transition-colors duration-200"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <User className="w-3 h-3 mr-2" />
                  Profile
                </Link>

                <Link
                  to="/my-submissions"
                  className="flex items-center px-3 py-2 text-xs text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-lg transition-colors duration-200"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <FileText className="w-3 h-3 mr-2" />
                  My Submissions
                </Link>

                {/* Theme Selector */}
                <div className="px-3 py-1">
                  <div className="text-xs font-medium text-neutral-500 dark:text-neutral-200 mb-1">
                    Theme
                  </div>
                  <div className="space-y-1">
                    {["light", "dark", "system"].map((themeOption) => (
                      <button
                        key={themeOption}
                        onClick={() =>
                          setTheme(themeOption as "light" | "dark" | "system")
                        }
                        className={`flex items-center w-full px-2 py-1 text-xs rounded transition-colors duration-200 ${
                          theme === themeOption
                            ? "bg-primary-100 dark:bg-primary-800/30 text-primary-700 dark:text-primary-300"
                            : "text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                        }`}
                      >
                        <span className="mr-2">
                          {getThemeIcon(themeOption)}
                        </span>
                        {getThemeLabel(themeOption)}
                        {theme === themeOption && (
                          <span className="ml-auto text-primary-600 dark:text-primary-400">
                            ✓
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-neutral-200 dark:bg-neutral-600 mx-3 my-1" />

                <Link
                  to="/settings"
                  className="flex items-center px-3 py-2 text-xs text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-lg transition-colors duration-200"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <Settings className="w-3 h-3 mr-2" />
                  Settings
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 py-2 text-xs text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-lg transition-colors duration-200"
                >
                  <LogOut className="w-3 h-3 mr-2" />
                  Sign out
                </button>
              </div>
            )}

            {/* Collapsed state - show tooltip menu items */}
            {!isOpen && (
              <div className="space-y-1 flex flex-col items-center">
                <Link
                  to="/profile"
                  className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-lg transition-colors duration-200"
                  title="Profile"
                >
                  <User className="w-4 h-4" />
                </Link>
                <Link
                  to="/my-submissions"
                  className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-lg transition-colors duration-200"
                  title="My Submissions"
                >
                  <FileText className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => {
                    const themes: Array<"light" | "dark" | "system"> = [
                      "light",
                      "dark",
                      "system",
                    ];
                    const currentIndex = themes.indexOf(theme);
                    const nextIndex = (currentIndex + 1) % themes.length;
                    setTheme(themes[nextIndex]);
                  }}
                  className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-lg transition-colors duration-200"
                  title={`Current theme: ${getThemeLabel(
                    theme
                  )} (click to cycle)`}
                >
                  {getThemeIcon(theme)}
                </button>
                <Link
                  to="/settings"
                  className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-lg transition-colors duration-200"
                  title="Settings"
                >
                  <Settings className="w-4 h-4" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-lg transition-colors duration-200"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
        {!isLoading && !isAuthenticated && (
          /* Sign In Button */
          <button
            onClick={handleLogin}
            className={`w-full ${
              isOpen
                ? "px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                : "p-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg"
            } transition-colors duration-200 font-medium`}
            title={isOpen ? "" : "Sign In"}
          >
            {isOpen ? "Sign In" : <User className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
