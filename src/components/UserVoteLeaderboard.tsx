import React, { useState, useMemo } from "react";
import { Crown, Medal, Award, User, RefreshCw, Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useUserVoteLeaderboard } from "../hooks/useTranslate";
import { timeFormatSeconds } from "../lib/utils";

const UserVoteLeaderboard: React.FC = () => {
  const { t } = useTranslation();
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

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return "N/A";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return t('voters.timeAgo.justNow');
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return t('voters.timeAgo.minutesAgo', { count: minutes });
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return t('voters.timeAgo.hoursAgo', { count: hours });
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return t('voters.timeAgo.daysAgo', { count: days });
    } else if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000);
      return t('voters.timeAgo.monthsAgo', { count: months });
    } else {
      const years = Math.floor(diffInSeconds / 31536000);
      return t('voters.timeAgo.yearsAgo', { count: years });
    }
  };

  const getVoteAccuracy = (decisive: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((decisive / total) * 100);
  };

  // Apply show all filter
  const displayStats = useMemo(() => {
    return showAll ? userStats : userStats.slice(0, 5);
  }, [userStats, showAll]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              {t('voters.title')}
            </h2>
          </div>
        </div>
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400 text-sm">
            {t('voters.loadingStats')}
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
              {t('voters.title')}
            </h2>
          </div>
        </div>
        <div className="p-6">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-400 mb-1">
              {t('voters.errorLoading')}
            </h3>
            <p className="text-red-600 dark:text-red-400 text-sm">
              {t('voters.failedToLoad')}
            </p>
            <button
              onClick={() => fetchLeaderboard()}
              className="mt-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm flex items-center gap-1"
            >
              <RefreshCw className="w-4 h-4" />
              {t('common.retry')}
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
              {t('voters.title')}
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


      {/* Voters Table */}
      <div className="overflow-x-auto">
        {displayStats.length === 0 ? (
          <div className="text-center py-8">
            <User className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
            <p className="text-neutral-600 dark:text-neutral-400 mb-2">
              {t('leaderboards.noVotingData')}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-700">
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  {t('voters.table.rank')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  {t('voters.table.user')}
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  {t('voters.table.votes')}
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  {t('voters.table.decisive')}
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  {t('voters.table.time')}
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  {t('voters.table.active')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {displayStats.map((stat) => (
                <tr 
                  key={stat.user_id}
                  className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
                >
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getRankIcon(stat.rank)}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
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
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">
                          @{stat.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <div className="font-bold text-lg text-blue-600 dark:text-blue-400">
                      {stat.total_votes}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <div className="font-semibold text-green-600 dark:text-green-400">
                      {getVoteAccuracy(stat.decisive_votes, stat.total_votes)}%
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <div className="font-semibold text-orange-600 dark:text-orange-400">
                      {stat.average_response_time_ms ? timeFormatSeconds(stat.average_response_time_ms) : "N/A"}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <div className="font-semibold text-neutral-600 dark:text-neutral-400">
                      {formatTimeAgo(stat.last_vote_date)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Show More/Less Button */}
        {userStats.length > 5 && (
          <div className="mt-4 text-center border-t border-neutral-200 dark:border-neutral-700 pt-4">
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
            >
              {showAll 
                ? t('common.showTop', { count: 5 })
                : t('voters.showAllVoters', { count: userStats.length })
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserVoteLeaderboard;
