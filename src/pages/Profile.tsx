import { useAuth0 } from "../hooks/useAuth0";
import ProtectedRoute from "../components/ProtectedRoute";
import { User, Mail, Calendar, Shield, Trophy, FileText } from "lucide-react";

const Profile = () => {
  const { user, isLoading } = useAuth0();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                    <User className="w-10 h-10 text-gray-400" />
                  </div>
                )}
                <div className="text-white">
                  <h1 className="text-3xl font-bold">{user?.name || "User"}</h1>
                  <p className="text-blue-100 mt-1">{user?.email}</p>
                  <div className="flex items-center mt-2 text-blue-100">
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
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Basic Information
                    </h2>
                    <div className="space-y-3">
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Mail className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium text-gray-900">
                            {user?.email || "Not provided"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <User className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Full Name</p>
                          <p className="font-medium text-gray-900">
                            {user?.name || "Not provided"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Shield className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">
                            Account Status
                          </p>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
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
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Trophy className="w-5 h-5 mr-2" />
                      Activity Summary
                    </h2>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center">
                          <FileText className="w-5 h-5 text-blue-600 mr-3" />
                          <span className="font-medium text-gray-900">
                            Total Submissions
                          </span>
                        </div>
                        <span className="text-2xl font-bold text-blue-600">
                          0
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center">
                          <Trophy className="w-5 h-5 text-green-600 mr-3" />
                          <span className="font-medium text-gray-900">
                            Best Ranking
                          </span>
                        </div>
                        <span className="text-2xl font-bold text-green-600">
                          -
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center">
                          <Shield className="w-5 h-5 text-purple-600 mr-3" />
                          <span className="font-medium text-gray-900">
                            Challenges Participated
                          </span>
                        </div>
                        <span className="text-2xl font-bold text-purple-600">
                          0
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Raw User Data (for development) */}
              {process.env.NODE_ENV === "development" && (
                <div className="mt-8 p-4 bg-gray-100 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Debug: User Object
                  </h3>
                  <pre className="text-xs text-gray-600 overflow-auto">
                    {JSON.stringify(user, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Profile;
