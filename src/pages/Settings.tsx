import { useState } from "react";
import { useAuth0 } from "../hooks/useAuth0";
import ProtectedRoute from "../components/ProtectedRoute";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Save,
  LogOut,
} from "lucide-react";

const Settings = () => {
  const { user, logout } = useAuth0();
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [newChallengeAlerts, setNewChallengeAlerts] = useState(false);
  const [publicProfile, setPublicProfile] = useState(false);

  const handleSaveSettings = () => {
    // In a real app, this would save to the backend
    alert("Settings saved successfully!");
  };

  const handleLogout = () => {
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  };

  return (
    <ProtectedRoute>
      <div className="py-0">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
              <SettingsIcon className="w-8 h-8 mr-3" />
              Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your account preferences and settings.
            </p>
          </div>

          <div className="space-y-6">
            {/* Profile Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Profile Settings
                </h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="displayName"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Display Name
                    </label>
                    <input
                      id="displayName"
                      type="text"
                      defaultValue={user?.name || ""}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your display name"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="emailAddress"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Email Address
                    </label>
                    <input
                      id="emailAddress"
                      type="email"
                      defaultValue={user?.email || ""}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Email cannot be changed here. Please update it in your
                      Auth0 profile.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="public-profile"
                      type="checkbox"
                      checked={publicProfile}
                      onChange={(e) => setPublicProfile(e.target.checked)}
                      className="h-4 w-4 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 border-gray-300 dark:border-gray-600 rounded"
                    />
                    <label
                      htmlFor="public-profile"
                      className="ml-2 block text-sm text-gray-900 dark:text-white"
                    >
                      Make my profile public
                    </label>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Others can see your submissions and rankings
                  </span>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Notification Preferences (future functionality)
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label
                      htmlFor="emailNotifications"
                      className="text-sm font-medium text-gray-900 dark:text-white "
                    >
                      Email Notifications 
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Receive notifications about your submissions and rankings
                    </p>
                  </div>
                  <input
                    id="emailNotifications"
                    type="checkbox"
                    disabled
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="h-4 w-4 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 border-gray-300 dark:border-gray-600 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label
                      htmlFor="weeklyDigest"
                      className="text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Weekly Digest
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Get a weekly summary of new challenges and leaderboard
                      updates
                    </p>
                  </div>
                  <input
                    id="weeklyDigest"
                    disabled
                    type="checkbox"
                    checked={weeklyDigest}
                    onChange={(e) => setWeeklyDigest(e.target.checked)}
                    className="h-4 w-4 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 border-gray-300 dark:border-gray-600 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label
                      htmlFor="newChallengeAlerts"
                      className="text-sm font-medium text-gray-900 dark:text-white"
                    >
                      New Challenge Alerts
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Be notified when new challenges are published
                    </p>
                  </div>
                  <input
                    id="newChallengeAlerts"
                    type="checkbox"
                    disabled
                    checked={newChallengeAlerts}
                    onChange={(e) => setNewChallengeAlerts(e.target.checked)}
                    className="h-4 w-4 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 border-gray-300 dark:border-gray-600 rounded"
                  />
                </div>
              </div>
            </div>

            {/* Account Security */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Account Security
                </h2>
              </div>
              <div className="p-6 space-y-4">
               

                <div className="flex items-center justify-between p-4  rounded-lg " >
                  <div>
                    <p className="text-sm font-medium text-red-900 dark:text-red-400">
                      Sign Out
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400">
                      Sign out of your account on this device
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 border border-red-600 dark:border-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 dark:bg-red-900/20 transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSaveSettings}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Settings;
