import { useAuth0 } from "../hooks/useAuth0";
import ProtectedRoute from "../components/ProtectedRoute";
import { User, Mail, Calendar, Shield, Trophy, FileText } from "lucide-react";

const Profile = () => {
  const { user, isLoading } = useAuth0();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-700 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="py-0">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
              <div className="flex items-center space-x-6">
                {user?.picture ? (
                  <img
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                    src={user.picture}
                    alt={user.name || "User avatar"}
                  />
                ) : (
                  <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                    <User className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                  </div>
                )}
                <div className="text-white">
                  <h1 className="text-3xl font-bold">{user?.name || "User"}</h1>
                  <p className="text-blue-100 dark:text-blue-300 mt-1">
                    {user?.email}
                  </p>
                  <div className="flex items-center mt-2 text-blue-100 dark:text-blue-300">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      Joined{" "}
                      {user?.updated_at
                        ? new Date(user.updated_at).toLocaleDateString()
                        : "Recently"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Information */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Basic Information
                    </h2>
                    <div className="space-y-3">
                      <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <Mail className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Email
                          </p>
                          <p className="font-medium text-neutral-800 dark:text-neutral-100">
                            {user?.email || "Not provided"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <User className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Full Name
                          </p>
                          <p className="font-medium text-neutral-800 dark:text-neutral-100">
                            {user?.name || "Not provided"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <Shield className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Account Status
                          </p>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400">
                            {user?.email_verified ? "Verified" : "Unverified"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activity Summary */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-4 flex items-center">
                      <Trophy className="w-5 h-5 mr-2" />
                      Activity Summary
                    </h2>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center">
                          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
                          <span className="font-medium text-neutral-800 dark:text-neutral-100">
                            Total Submissions
                          </span>
                        </div>
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          0
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="flex items-center">
                          <Trophy className="w-5 h-5 text-green-600 mr-3" />
                          <span className="font-medium text-neutral-800 dark:text-neutral-100">
                            Best Ranking
                          </span>
                        </div>
                        <span className="text-2xl font-bold text-green-600">
                          -
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="flex items-center">
                          <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-3" />
                          <span className="font-medium text-neutral-800 dark:text-neutral-100">
                            Challenges Participated
                          </span>
                        </div>
                        <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          0
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Profile;
