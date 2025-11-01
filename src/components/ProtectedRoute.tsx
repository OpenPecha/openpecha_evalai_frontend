import type { ReactNode } from "react";
import { useAuth0 } from "../hooks/useAuth0";
import { useTranslation } from "react-i18next";
import { Shield, LogIn } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

const ProtectedRoute = ({ children, fallback }: ProtectedRouteProps) => {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto"></div>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">{t('protected.checkingAuth')}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-800/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>

            <h2 className="text-2xl font-bold text-neutral-700 dark:text-neutral-100 mb-2">
              Authentication Required
            </h2>

            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              You need to sign in to access this page. Please log in to
              continue.
            </p>

            <button
              onClick={() => loginWithRedirect()}
              className="w-full flex items-center justify-center px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 transition-colors duration-200 font-medium"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Sign In to Continue
            </button>

            <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
              Don't have an account? You'll be able to create one after clicking
              sign in.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
