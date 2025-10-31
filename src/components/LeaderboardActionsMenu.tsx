import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Menu,
  ExternalLink,
  Share2,
} from "lucide-react";

interface LeaderboardActionsMenuProps {
  challengeId: string;
  challengeTitle: string;
  onShare: () => void;
}

const LeaderboardActionsMenu: React.FC<LeaderboardActionsMenuProps> = ({
  challengeId,
  challengeTitle,
  onShare,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      {/* Hamburger Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md transition-colors duration-200"
        title="Actions menu"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg z-50">
          <div className="py-1">
            {/* Share Button */}
            <button
              onClick={() => {
                onShare();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center transition-colors duration-200"
            >
              <Share2 className="w-4 h-4 mr-3" />
              Share Leaderboard
            </button>

      
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaderboardActionsMenu;
