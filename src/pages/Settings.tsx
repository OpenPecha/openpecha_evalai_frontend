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
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [newChallengeAlerts, setNewChallengeAlerts] = useState(true);
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
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <SettingsIcon className="w-8 h-8 mr-3" />
              Settings
            </h1>
            <p className="text-gray-600">
              Manage your account preferences and settings.
            </p>
          </div>

          <div className="space-y-6">
            {/* Profile Settings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Profile Settings
                </h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      defaultValue={user?.name || ""}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your display name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      defaultValue={user?.email || ""}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">
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
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="public-profile"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Make my profile public
                    </label>
                  </div>
                  <span className="text-xs text-gray-500">
                    Others can see your submissions and rankings
                  </span>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Notification Preferences
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-900">
                      Email Notifications
                    </label>
                    <p className="text-xs text-gray-500">
                      Receive notifications about your submissions and rankings
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-900">
                      Weekly Digest
                    </label>
                    <p className="text-xs text-gray-500">
                      Get a weekly summary of new challenges and leaderboard
                      updates
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={weeklyDigest}
                    onChange={(e) => setWeeklyDigest(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-900">
                      New Challenge Alerts
                    </label>
                    <p className="text-xs text-gray-500">
                      Be notified when new challenges are published
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={newChallengeAlerts}
                    onChange={(e) => setNewChallengeAlerts(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>

            {/* Account Security */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Account Security
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Account Management
                    </p>
                    <p className="text-xs text-gray-500">
                      Password, two-factor authentication, and other security
                      settings
                    </p>
                  </div>
                  <a
                    href={`https://${
                      import.meta.env.VITE_AUTH0_DOMAIN
                    }/u/profile`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors duration-200"
                  >
                    Manage in Auth0
                  </a>
                </div>

                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                  <div>
                    <p className="text-sm font-medium text-red-900">Sign Out</p>
                    <p className="text-xs text-red-600">
                      Sign out of your account on this device
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 text-sm text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition-colors duration-200"
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
