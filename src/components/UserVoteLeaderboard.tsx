import React, { useState, useMemo } from "react";
import { Crown, Medal, Award, User, RefreshCw, Search, Info, Clock, Target } from "lucide-react";
import { useUserVoteLeaderboard } from "../hooks/useTranslate";

const UserVoteLeaderboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  // Use react-query hook for data fetching
  const { 
    data: leaderboardData, 
    isLoading: loading, 
    error, 
    refetch: fetchLeaderboard 
  } = useUserVoteLeaderboard();
  
  // Memoize user stats to prevent unnecessary re-renders
  const userStats = useMemo(() => leaderboardData?.leaderboard || [], [leaderboardData?.leaderboard]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-neutral-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return (
          <span className="w-5 h-5 flex items-center justify-center text-neutral-600 dark:text-neutral-300 font-semibold text-sm">
            {rank}
          </span>
        );
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getVoteAccuracy = (decisive: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((decisive / total) * 100);
  };

  // Filter users based on search query
  const filteredStats = useMemo(() => {
    if (!searchQuery.trim()) return userStats;
    
    const query = searchQuery.toLowerCase();
    return userStats.filter(stat => 
      stat.username.toLowerCase().includes(query) ||
      stat.first_name.toLowerCase().includes(query) ||
      stat.last_name.toLowerCase().includes(query) ||
      stat.email.toLowerCase().includes(query)
    );
  }, [userStats, searchQuery]);

  // Apply show all filter
  const displayStats = useMemo(() => {
    return showAll ? filteredStats : filteredStats.slice(0, 10);
  }, [filteredStats, showAll]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Top Voters Leaderboard
            </h2>
          </div>
        </div>
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400 text-sm">
            Loading voter statistics...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Top Voters Leaderboard
            </h2>
          </div>
        </div>
        <div className="p-6">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-400 mb-1">
              Error Loading Data
            </h3>
            <p className="text-red-600 dark:text-red-400 text-sm">
              Failed to load voter leaderboard. Please try again.
            </p>
            <button
              onClick={() => fetchLeaderboard()}
              className="mt-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm flex items-center gap-1"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Top Voters Leaderboard
            </h2>
            <div className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400">
              <Info className="w-4 h-4" />
              <span className="text-xs">
                {leaderboardData?.total_users_with_votes || 0} voters • {leaderboardData?.total_votes_cast || 0} total votes
              </span>
            </div>
          </div>
          <button
            onClick={() => fetchLeaderboard()}
            className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-white transition-colors"
            title="Refresh leaderboard"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search voters by name, username, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats List */}
      <div className="p-4">
        {displayStats.length === 0 ? (
          <div className="text-center py-8">
            <User className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
            <p className="text-neutral-600 dark:text-neutral-400 mb-2">
              {searchQuery ? "No voters found matching your search." : "No voting data available."}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {displayStats.map((stat) => (
              <div
                key={stat.user_id}
                className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-700/50 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {getRankIcon(stat.rank)}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {stat.picture ? (
                      <img
                        src={stat.picture}
                        alt={`${stat.first_name} ${stat.last_name}`}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                        {getInitials(stat.first_name, stat.last_name)}
                      </div>
                    )}
                    
                    <div>
                      <div className="font-medium text-neutral-900 dark:text-white text-sm">
                        {stat.first_name} {stat.last_name}
                      </div>
                      <div className="text-xs text-neutral-600 dark:text-neutral-400">
                        @{stat.username}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-blue-600 dark:text-blue-400">
                      {stat.total_votes}
                    </div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400">
                      Total Votes
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="font-semibold text-green-600 dark:text-green-400">
                      {getVoteAccuracy(stat.decisive_votes, stat.total_votes)}%
                    </div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      Decisive
                    </div>
                  </div>
                  
                  {stat.average_response_time_ms && (
                    <div className="text-center">
                      <div className="font-semibold text-orange-600 dark:text-orange-400">
                        {Math.round(stat.average_response_time_ms / 1000)}s
                      </div>
                      <div className="text-xs text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Avg Time
                      </div>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <div className="font-semibold text-neutral-600 dark:text-neutral-400">
                      {formatDate(stat.last_vote_date)}
                    </div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400">
                      Last Vote
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Show More/Less Button */}
        {filteredStats.length > 10 && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
            >
              {showAll 
                ? `Show Less (${filteredStats.length - 10} more hidden)` 
                : `Show All ${filteredStats.length} Voters`
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserVoteLeaderboard;
