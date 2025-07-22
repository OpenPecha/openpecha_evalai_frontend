import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Leaderboard from "./pages/Leaderboard";
import Submission from "./pages/Submission";
import Profile from "./pages/Profile";
import MySubmissions from "./pages/MySubmissions";
import Settings from "./pages/Settings";
import "./app.css";

const App = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/leaderboard/:challengeId" element={<Leaderboard />} />
        <Route path="/submit/:challengeId" element={<Submission />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/my-submissions" element={<MySubmissions />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </div>
  );
};

export default App;
