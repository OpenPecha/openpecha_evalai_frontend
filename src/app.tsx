import { useState } from "react";
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
import "./app.css";

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <div className="relative">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
        </div>

        {/* Mobile Sidebar */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              className="fixed inset-0 bg-black bg-opacity-50 border-0 p-0"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Close sidebar"
            />
            <div className="fixed left-0 top-0 h-full z-50">
              <Sidebar isOpen={true} onToggle={toggleSidebar} />
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        {/* <Navbar onToggleSidebar={toggleSidebar} /> */}

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <Routes>
            <Route
              path="/"
              element={
                <div className="p-4 lg:p-6 overflow-auto">
                  <Home />
                </div>
              }
            />
            <Route path="/chat" element={<Chat />} />
            <Route
              path="/leaderboards"
              element={
                <div className="p-4 lg:p-6 overflow-auto">
                  <Leaderboards />
                </div>
              }
            />
            <Route
              path="/leaderboard/:challengeId"
              element={
                <div className="p-4 lg:p-6 overflow-auto">
                  <Leaderboard />
                </div>
              }
            />
            <Route
              path="/submit/:challengeId"
              element={
                <div className="p-4 lg:p-6 overflow-auto">
                  <Submission />
                </div>
              }
            />
            <Route
              path="/profile"
              element={
                <div className="p-4 lg:p-6 overflow-auto">
                  <Profile />
                </div>
              }
            />
            <Route
              path="/my-submissions"
              element={
                <div className="p-4 lg:p-6 overflow-auto">
                  <MySubmissions />
                </div>
              }
            />
            <Route
              path="/settings"
              element={
                <div className="p-4 lg:p-6 overflow-auto">
                  <Settings />
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
